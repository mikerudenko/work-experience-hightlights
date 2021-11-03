/*global define*/
define([
    'underscore',
    'text!../template/horizontalStackedBar.html'
], function (un, template) {
    'use strict';

    return ['npsStackedBarModel', 'horizontalStackedBarViewService',
        'grouperService', 'labelGetterService',
        'chartColorPickerService', 'textLengthService',
        'chartConstant', 'npsModel',
        function (
            Model,
            View,
            Grouper,
            labelGetter,
            colorPickerService,
            textLengthService,
            chartConstant,
            NpsModel
        ) {
            return {
                restrict: 'E',
                template: template,
                scope: {
                    chartData: '=',
                    viewConfig: '=',
                    itemClick: '&?',
                    labelChange: '&?',
                    colorChange: '&?',
                    orderChange: '&?',
                    readOnly: '@'
                },
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
                            npsModel,
                            view,
                            labels = $scope.viewConfig.labels || [],
                            npsColor = $scope.viewConfig.colors.find('npsScore');
                        var colorPickerMountPoint = $element.find('.color-picker-mount-point');

                        model = new Model({
                            width: $element.width()
                        });
                        npsModel = new NpsModel({
                            id: 'npsScore',
                            label: 'Nps score',
                            color: npsColor && npsColor.value
                        }, $scope.chartData);
                        $scope.model = model;

                        function tickGetter(group) {
                            return group.getLabel();
                        }

                        function updateAxesSize() {
                            var axis = $scope.viewConfig.axes.left,
                                constW = chartConstant.maxTickTextWidth,
                                labelWidth = textLengthService
                                    .maxTextsLength(model.data, tickGetter);

                            axis.textSize = constW > labelWidth ?
                                    labelWidth : constW;
                        }

                        function onSizeChange() {
                            updateAxesSize();
                            view.draw();
                        }

                        $scope.onLegendOver = function (groupItem) {
                            view.highlightGroup(groupItem.getId());
                        };

                        $scope.onLegendOut = function () {
                            view.unHighlighGroup();
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

                        $scope.onAxisChange = onLabelChange;

                        $scope.onLegendOrderChange = function (scope, index) {
                            var itemIndex = scope.$index;

                            if (index === itemIndex) {
                                return;
                            }

                            if (index > itemIndex) {
                                index = index - 1;
                            }

                            $scope.groups.splice(index, 0, $scope.groups.splice(itemIndex, 1)[0]);
                            model.move(itemIndex, index);
                            view.draw();
                            $scope.orderChange({
                                order: model.data[0].data.map(function (bar) {
                                    return bar.getId();
                                })
                            });
                        };

                        model.observer.on({
                            resize: onSizeChange
                        });

                        $scope.$on('resize', function () {
                            model.setWidth($element.width());
                        });

                        un.each($scope.chartData, function (group) {
                            model.addGroup(group);
                        });

                        updateAxesSize();

                        $scope.groups = [
                            new Grouper({
                                id: 'detractors',
                                label: labelGetter.getValue(labels, 'detractors', 'legend') || 'Detractors',
                                color: un.first(model.getDetractors()).getColor()
                            }, model.getDetractors()),
                            new Grouper({
                                id: 'passives',
                                label: labelGetter.getValue(labels, 'passives', 'legend') || 'Passives',
                                color: un.first(model.getPassives()).getColor()
                            }, model.getPassives()),
                            new Grouper({
                                id: 'promoters',
                                label: labelGetter.getValue(labels, 'promoters', 'legend') || 'Promoters',
                                color: un.first(model.getPromoters()).getColor()
                            }, model.getPromoters()),
                            new Grouper({
                                id: 'npsScore',
                                label: labelGetter.getValue(labels, 'npsScore', 'legend') || 'Nps score',
                                color: npsModel.getColor()
                            }, [npsModel])
                        ];

                        view = new View({
                            model: model,
                            npsModel: npsModel,
                            mode: 'relative',
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onItemClick: onItemClick, onLabelChange: onLabelChange }, $scope.viewConfig)
                        });

                        function onItemClick(barItem, bar) {
                            $scope.itemClick({
                                barItem: barItem,
                                bar: bar
                            });
                        }

                        function onLabelChange(value, kye, type) {
                            $scope.labelChange({
                                text: value,
                                name: kye,
                                type: type
                            });
                        }

                        view.init();

                        /*jslint unparam:true*/
                        function onBarContextMenu(bar, barIndex) {
                            /*jshint validthis: true */
                            /*jshint -W117 */
                            var legendModel = $scope.groups[barIndex];
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
                        /*jslint unparam:false*/

                        function onNpsContextMenu() {
                            /*jshint validthis: true */
                            showColorPicker.call(this, $scope.groups.find( x => x.id == 'npsScore'));
                        }

                        function showColorPicker(legendModel) {
                            /*jshint validthis: true */
                            colorPickerService.show(
                                this,
                                legendModel.getColor(),
                                function (color) {
                                    $scope.onColorChange(legendModel, color);
                                }
                            );
                        }

                        if (!$scope.readOnly) {
                            view.getColorAreas()
                                .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onBarContextMenu));

                            view.getNpsColorArea()
                                .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onNpsContextMenu));
                        }

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
