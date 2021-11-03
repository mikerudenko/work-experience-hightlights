/*global define*/
define([
    'underscore',
    'd3',
    'text!../template/line.html'
], function (un, d3, template) {
    'use strict';

    return ['lineViewService',
        'linesModel', 'lineGrouperService', 'chartColorPickerService',
        'textLengthService', 'chartConstant', 'rangeControlDragService',
        'chartColorFactory',
        function (
            View,
            Model,
            Grouper,
            colorPickerService,
            textLengthService,
            chartConstant,
            rangeControlDragService,
            chartColorFactory
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
                    orderChange: '&?',
                    readOnly: '@'
                },
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
                            grouper,
                            rangeControlDragInstance,
                            slider = $element[0].querySelector('slider .selection'),
                            view;
                        var colorPickerMountPoint = $element.find('.color-picker-mount-point');

                        model = new Model({
                            width: $element.width()
                        });
                        $scope.model = model;

                        function tickGetter(label) {
                            return label.label;
                        }

                        function updateAxesSize() {
                            var axis = $scope.viewConfig.axes.bottom,
                                constW = chartConstant.maxTickTextWidth,
                                labelWidth = textLengthService
                                    .maxTextsLength(grouper.getLabels(), tickGetter);

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
                            grouper.sliceFilter($scope.rangeLow, $scope.rangeHigh + 1);
                            rangeControlDragInstance.initDrag();
                            view.draw();
                            setContextMenuHandlers();
                        }

                        $scope.onLegendOver = function (line) {
                            view.highlightLine(line);
                        };

                        $scope.onLegendOut = function () {
                            view.unHighlightLine();
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

                        $scope.onAxisChange = onLabelChange;

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
                        };

                        model.observer.on({
                            resize: onSizeChange
                        });

                        $scope.$on('resize', function () {
                            model.setWidth($element.width());
                        });

                        un.each($scope.chartData.lines, function (line) {
                            var lineModel = model.add(line);

                            if (!lineModel.getColor()) {
                                lineModel.setColor(chartColorFactory.getRandomColor($scope.chartData.lines, line.id));
                            }
                        });

                        grouper = new Grouper({
                            labels: $scope.chartData.labels,
                            lines: model.data
                        });

                        $scope.groups = grouper.lines;

                        updateAxesSize();

                        if ($scope.slider) {
                            $scope.rangeValues = grouper.getLabels().map(function (label) {
                                return label.label;
                            });
                            $scope.rangeLow = 0;
                            $scope.rangeHigh = $scope.rangeValues.length - 1;

                            $scope.$watch('rangeLow', slice);
                            $scope.$watch('rangeHigh', slice);
                        }

                        view = new View({
                            model: model,
                            labels: grouper,
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onItemClick: onItemClick, onLabelChange: onLabelChange }, $scope.viewConfig)
                        });

                        if ($scope.slider) {
                            rangeControlDragInstance = rangeControlDragService.getInstance($scope, slider,
                                $element[0].querySelector('svg'));
                        }

                        function onItemClick(line, dot) {
                            $scope.itemClick({
                                line: line,
                                dot: dot
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

                        /*jslint unparam:true*/
                        function onAreaContextMenu(line, index) {
                            /*jshint validthis: true */
                            var initialPosition = colorPickerMountPoint.offset();
                            var clickPosition = { top: d3.event.pageY, left: d3.event.pageX };

                            colorPickerService.show(
                                colorPickerMountPoint.offset(clickPosition),
                                line.getColor(),
                                function (color) {
                                    $scope.onColorChange(line, color);
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
