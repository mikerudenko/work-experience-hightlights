/*global define*/
define([
    'underscore',
    'text!../template/npsArc.html'
], function (un, template) {
    'use strict';

    return ['npsArcModel', 'npsArcViewService', 'npsColorService',
        'chartColorPickerService',
        function (Model, View, npsColor, colorPickerService) {
            return {
                restrict: 'E',
                scope: {
                    chartData: '=',
                    targetPoint: '=',
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
                            width: $element.width(),
                            targetPoint: $scope.targetPoint
                        });
                        $scope.model = model;

                        function onSizeChange() {
                            view.draw();
                        }

                        $scope.onLegendOver = function (arcItem) {
                            view.onArcOver(arcItem);
                        };

                        $scope.onLegendOut = function () {
                            view.onArcOut();
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
                            view.draw();
                            $scope.colorChange({
                                color: color,
                                key: item.getId()
                            });
                        };

                        model.observer.on({
                            resize: onSizeChange
                        });

                        un.each($scope.chartData, function (arcItem) {
                            if (!arcItem.color) {
                                arcItem.color = npsColor.getColor(arcItem.id);
                            }

                            model.addItem(arcItem);
                        });

                        $scope.groups = model.data;

                        view = new View({
                            model: model,
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onItemClick: onItemClick }, $scope.viewConfig)
                        });

                        function onItemClick(arc) {
                            $scope.itemClick({
                                arc: arc
                            });
                        }

                        view.init();

                        function onAreaContextMenu(area) {
                            /*jshint validthis: true */
                            /*jshint -W117 */
                            var initialPosition = colorPickerMountPoint.offset();
                            var clickPosition = { top: d3.event.pageY, left: d3.event.pageX };

                            colorPickerService.show(
                                colorPickerMountPoint.offset(clickPosition),
                                area.getColor(),
                                function (color) {
                                    $scope.onColorChange(area, color);
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
