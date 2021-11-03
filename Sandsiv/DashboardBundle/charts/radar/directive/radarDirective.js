/*jshint ignore: start */
define([
    'underscore',
    'd3',
    'text!../template/radarDirTemplate.html'
], function (un, d3, template) {
    'use strict';

    return ['radarModel', 'radarRend', 'chartColorPickerService',
        function (radarModel, radarRend, colorPickerService) {
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
                        $scope.readOnly = $scope.readOnly === 'true';
                        un.extend($scope.viewConfig, {
                            readOnly: $scope.readOnly
                        });
                    },

                    post: function ($scope, $element) {
                        var model,
                            color,
                            view;
                        var colorPickerMountPoint = $element.find('.color-picker-mount-point');

                        model = new radarModel({
                            width: $element.width()
                        });
                        $scope.model = model;
                        color = d3.scale.category20();

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

                            model.move(itemIndex, index);
                            view.draw();
                            $scope.orderChange({
                                order: model.data.map(function (bar) {
                                    return bar.getId();
                                })
                            });

                            if ($scope.readOnly == 'false' || !$scope.readOnly) {
                                view.getColorAreas()
                                    .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onAreaContextMenu));
                            }
                        };

                        un.each($scope.chartData, function (listItem, index) {
                            if (!listItem.color) {
                                listItem.color = color(index);
                            }

                            model.addItem(listItem);
                        });
                        $scope.groups = model.data;

                        view = new radarRend({
                            model: model,
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onItemClick: onItemClick }, $scope.viewConfig)
                        });
                        function onItemClick(radarItem) {
                            $scope.itemClick({
                                radarItem: radarItem
                            });
                        }

                        view.draw();

                        function onAreaContextMenu(area) {
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

                        if ($scope.readOnly == 'false' || !$scope.readOnly) {
                            view.getColorAreas()
                                .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onAreaContextMenu));
                        }

                        $scope.$on('resize', function () {
                            model.setWidth($element.width());
                        });

                        model.observer.on({
                            resize: view.init
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
/*jshint ignore: end */
