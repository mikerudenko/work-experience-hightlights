/*global define*/
define([
    'underscore',
    'text!../template/npsBar.html',
    'd3'
], function (un, template, d3) {
    'use strict';

    return ['npsBarModel', 'npsBarViewService',
        'grouperService', 'npsColorService',
        'labelGetterService', 'chartColorPickerService',
        'textLengthService', 'chartConstant', 'rangeControlDragService',
        function (
            Model,
            View,
            Grouper,
            npsColor,
            labelGetter,
            colorPickerService,
            textLengthService,
            chartConstant,
            rangeControlDragService
        ) {
            return {
                restrict: 'E',
                template: template,
                scope: {
                    chartData: '=',
                    viewConfig: '=',
                    slider: '=?chartSlider',
                    itemClick: '&?',
                    labelChange: '&?',
                    colorChange: '&?',
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
                            view,
                            rangeControlDragInstance,
                            slider = $element[0].querySelector('slider .selection'),
                            labels = $scope.viewConfig.labels || [];
                        var colorPickerMountPoint = $element.find('.color-picker-mount-point');

                        model = new Model({
                            width: $element.width()
                        });
                        $scope.model = model;

                        function tickGetter(group) {
                            return group.getLabel() || '';
                        }

                        function updateAxesSize() {
                            var axis = $scope.viewConfig.axes.bottom,
                                constW = chartConstant.maxTickTextWidth,
                                labelWidth = textLengthService
                                    .maxTextsLength(model.data, tickGetter);

                            axis.textSize = constW > labelWidth ?
                                    labelWidth : constW;
                        }

                        function onSizeChange() {
                           // updateAxesSize();
                            view.draw();
                            if(rangeControlDragInstance) {
                                rangeControlDragInstance.dragConfig.svgWidth = parseInt($element[0].querySelector('svg').clientWidth);
                            }
                        }

                        function slice() {
                            model.sliceFilter($scope.rangeLow, $scope.rangeHigh + 1);
                            rangeControlDragInstance.initDrag();
                            view.draw();
                            setContextMenuHandlers();
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
                            view.updateColor(item.getId());
                            $scope.colorChange({
                                color: color,
                                key: item.getId()
                            });
                        };

                        $scope.onAxisChange = onLabelChange;

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

                        if ($scope.slider) {
                            $scope.rangeValues = [];
                            un.each(model.data, function (group) {
                                $scope.rangeValues.push(group.getLabel());
                            });
                            $scope.rangeLow = 0;
                            $scope.rangeHigh = $scope.rangeValues.length - 1;

                            $scope.$watch('rangeLow', slice);
                            $scope.$watch('rangeHigh', slice);
                        }

                        function barId(bar) {
                            return bar.getId();
                        }

                        function barsToGrouper(bars) {
                            var groupId = bars[0].getId();
                            var color = bars[0].getColor() || npsColor.colorByValue(groupId);
                            var label = labelGetter.getValue(labels, groupId, 'legend') || bars[0].getLabel() || groupId;

                            return new Grouper({ id: groupId, label: label, color: color }, bars);
                        }

                        $scope.groups = un.chain(model.getAllBars())
                                          .groupBy(barId)
                                          .map(barsToGrouper)
                                          .value();

                        view = new View({
                            model: model,
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onItemClick: onItemClick, onLabelChange: onLabelChange }, $scope.viewConfig)
                        });

                        if ($scope.slider) {
                            rangeControlDragInstance = rangeControlDragService.getInstance($scope,
                                slider, $element[0].querySelector('svg'));
                        }

                        function onItemClick(bar, group) {
                            $scope.itemClick({
                                bar: bar,
                                group: group
                            });
                        }

                        function onLabelChange(value, type) {
                            $scope.labelChange({
                                text: value,
                                name: type,
                                type: 'axis'
                            });
                        }

                        view.init();

                        function findLegendById(id) {
                            return un.find($scope.groups, function (group) {
                                return group.getId() === id;
                            });
                        }

                        /*jslint unparam:true*/
                        function onAreaContextMenu(bar, index) {
                            /*jshint validthis: true */
                            /*jshint -W117 */
                            var initialPosition = colorPickerMountPoint.offset();
                            var clickPosition = { top: d3.event.pageY, left: d3.event.pageX };

                            var legendModel = findLegendById(bar.getId());

                            colorPickerService.show(
                                colorPickerMountPoint.offset(clickPosition),
                                legendModel.getColor(),
                                function (color) {
                                    $scope.onColorChange(legendModel, color, index);
                                },
                                colorPickerMountPoint.offset.bind(colorPickerMountPoint, initialPosition)
                            );
                        }
                        /*jslint unparam:false*/

                        setContextMenuHandlers();

                        function setContextMenuHandlers() {
                            var notReadOnly = !$scope.readOnly || $scope.readOnly === 'false';

                            if (notReadOnly) {
                                view.getColorAreas()
                                    .on('contextmenu', null);
                                view.getColorAreas()
                                    .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onAreaContextMenu));
                            }
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
