/*global define*/
define([
    'underscore',
    'd3',
    'text!../template/pie.html',
    'css!../style/pie.css'
], function (un, d3, template) {
    'use strict';

    return ['pieModel', 'pieViewService', 'chartColorPickerService', 'chartColorFactory',
        function (Model, PieView, colorPickerService, chartColorFactory) {
            return {
                restrict: 'E',
                scope: {
                    chartData: '=',
                    viewConfig: '=',
                    itemClick: '&?',
                    labelChange: '&?',
                    colorChange: '&?',
                    orderChange: '&?',
                    readOnly: '@'
                },
                template: template,
                link: {
                    pre: function ($scope) {
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

                        $scope.onLegendOrderChange = function (scope, index) {
                            var itemIndex = scope.$index;

                            if (index === itemIndex) {
                                return;
                            }

                            if (index > itemIndex) {
                                index = index - 1;
                            }

                            // $scope.groups.splice(index, 0, $scope.groups.splice(itemIndex, 1)[0]);
                            model.move(itemIndex, index);
                            view.draw();
                            $scope.orderChange({
                                order: model.data.map(function (bar) {
                                    return bar.getId();
                                })
                            });
                        };

                        model.observer.on({
                            resize: onSizeChange
                        });

                        un.each($scope.chartData, function (listItem) {
                            if (!listItem.color) {
                                listItem.color = chartColorFactory.getRandomColor($scope.chartData, listItem.id);
                            }

                            model.addItem(listItem);
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

                            var initialPosition = colorPickerMountPoint.offset();
                            var clickPosition = { top: d3.event.pageY, left: d3.event.pageX };

                            var legendModel = area.data;

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
