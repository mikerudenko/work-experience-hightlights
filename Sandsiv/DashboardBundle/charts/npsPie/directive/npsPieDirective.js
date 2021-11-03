/*global define*/
define([
    'underscore',
    'core/i18n',
    'd3',
    'text!../template/npsPie.html'
], function (un, i18n, d3, template) {
    'use strict';

    return ['npsPieModel', 'pieViewService', 'npsColorService',
        'chartColorPickerService',
        function (Model, PieView, npsColor, colorPickerService) {
            return {
                restrict: 'E',
                scope: {
                    chartData: '=',
                    viewConfig: '=',
                    itemClick: '&?',
                    labelChange: '&?',
                    colorChange: '&?',
                    readOnly: '@'
                },
                template: template,
                link: {
                    pre: function ($scope) {
                        $scope.disableOrder = true;
                        /*
                            currently we dont need dynamic change
                            of read only mode, so used as
                            not two-way bind attr
                        */
                        $scope.readOnly = $scope.readOnly === 'true';
                        un.extend($scope.viewConfig, {
                            readOnly: $scope.readOnly
                        });
                    },

                    post: function ($scope, $element) {
                        var model,
                            view;
                        var colorPickerMountPoint = $element.find('.color-picker-mount-point');

                        model = new Model({
                            width: $element.width()
                        });
                        $scope.model = model;

                        function onSizeChange() {
                            view.draw();
                        }

                        $scope.onLegendOver = function (pieItem) {
                            view.onItemOver({data: pieItem});
                        };

                        $scope.onLegendOut = function () {
                            view.onItemOut();
                        };

                        $scope.onLabelChange = function (legend, newLabel) {
                            legend.setLabel(newLabel);
                            $scope.labelChange({
                                text: newLabel,
                                name: legend.getId(),
                                type: 'legend'
                            });
                        };

                        $scope.onColorChange = function (item, color) {
                            item.setColor(color);
                            view.updateColor(item);
                            $scope.colorChange({
                                color: color,
                                key: item.getId()
                            });
                        };

                        model.observer.on({
                            resize: onSizeChange
                        });

                        un.each($scope.chartData, function (listItem) {
                            if (!listItem.color) {
                                listItem.color = npsColor.getColor(listItem.id);
                            }
                            model.addItem(listItem);
                        });

                        un.extend($scope.viewConfig, {
                            totalConfig: {
                                label: i18n.trans('Nps Score'),
                                value: d3.format('.1%')(model.getTotalPercent()),
                                valueDelimiter: ''
                            }
                        });

                        $scope.groups = model.data;

                        view = new PieView({
                            model: model,
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onItemClick: onItemClick }, $scope.viewConfig)
                        });

                        function onItemClick(pieItem) {
                            $scope.itemClick({
                                pieItem: pieItem
                            });
                        }

                        view.init();

                        function onAreaContextMenu(area) {
                            /*jshint validthis: true */

                            var legendModel = area.data;
                            var initialPosition = colorPickerMountPoint.offset();
                            var clickPosition = { top: d3.event.pageY, left: d3.event.pageX };

                            colorPickerService.show(
                                colorPickerMountPoint.offset(clickPosition),
                                legendModel.getColor(),
                                function (color) {
                                    $scope.onColorChange(legendModel, color);
                                },
                                colorPickerMountPoint.offset.bind(colorPickerMountPoint, initialPosition)
                            );
                        }

                        if (!$scope.readOnly) {
                            view.getColorAreas()
                                .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onAreaContextMenu));
                        }

                        $scope.$on('resize', function () {
                            model.setWidth($element.width());
                        });

                        $scope.$on('$destroy', function () {
                            model.observer.off({
                                resize: onSizeChange
                            });

                            view.destroy();
                        });
                    }
                }
            };
        }];
});
