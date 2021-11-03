/*global define*/
define([
    'underscore',
    'text!../template/npsLine.html',
    'd3'
], function (un, template, d3) {
    'use strict';

    return ['npsLineViewService',
        'npsLinesModel', 'lineGrouperService', 'grouperService',
        'npsColorService', 'npsLineModel', 'labelGetterService',
        'chartColorPickerService', 'textLengthService',
        'chartConstant','rangeControlDragService',
        function (
            View,
            Model,
            Grouper,
            LegendGrouper,
            npsColor,
            LineModel,
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
                            npsModel,
                            grouper,
                            view,
                            rangeControlDragInstance,
                            slider = $element[0].querySelector('slider .selection'),
                            labels = $scope.viewConfig.labels || [],
                            npsCustomColor = $scope.viewConfig.colors.find('npsScore');
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
                          //  updateAxesSize();
                            view.draw();
                            if(rangeControlDragInstance) {
                                rangeControlDragInstance.dragConfig.svgWidth = parseInt($element[0].querySelector('svg').clientWidth);
                            }
                        }

                        function slice() {
                            grouper.sliceFilter($scope.rangeLow, $scope.rangeHigh + 1);
                            rangeControlDragInstance.initDrag();
                            view.draw();
                        }

                        function buildNps() {
                            var detractorsValues,
                                promotersValues;

                            detractorsValues = un.first(model.getDetractors()).getValues();
                            promotersValues = un.first(model.getPromoters()).getValues();

                            return {
                                id: 'npsScore',
                                label: 'Nps score',
                                type: 'nps',
                                color: (npsCustomColor && npsCustomColor.value) || npsColor.getColor('nps'),
                                values: un.map(detractorsValues, function (value, index) {
                                    var sum = model.indexSum(index);

                                    return (promotersValues[index] * 100 / sum) -
                                        (value * 100 / sum);
                                })
                            };
                        }

                        $scope.onLegendOver = function (grouper) {
                            view.highlightLine(grouper.items[0]);
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

                        model.observer.on({
                            resize: onSizeChange
                        });

                        $scope.$on('resize', function () {
                            model.setWidth($element.width());
                        });

                        un.each($scope.chartData.lines, function (line) {
                            var lineModel = model.add(line);

                            if (!lineModel.getColor()) {
                                lineModel.setColor(
                                    npsColor
                                        .getColor(lineModel.getId())
                                );
                            }
                        });

                        npsModel = new LineModel(buildNps());

                        grouper = new Grouper({
                            labels: $scope.chartData.labels,
                            lines: model.data.concat(npsModel)
                        });

                        updateAxesSize();

                        function labelOrderIndex(group) {
                            return labels.order.indexOf(group.id);
                        }

                        $scope.groups = un.sortBy([
                            new LegendGrouper({
                                id: 'detractors',
                                label: labelGetter.getValue(labels, 'detractors', 'legend') || 'Detractors',
                                color: un.first(model.getDetractors()).getColor()
                            }, model.getDetractors()),
                            new LegendGrouper({
                                id: 'passives',
                                label: labelGetter.getValue(labels, 'passives', 'legend') || 'Passives',
                                color: un.first(model.getPassives()).getColor()
                            }, model.getPassives()),
                            new LegendGrouper({
                                id: 'promoters',
                                label: labelGetter.getValue(labels, 'promoters', 'legend') || 'Promoters',
                                color: un.first(model.getPromoters()).getColor()
                            }, model.getPromoters()),
                            new LegendGrouper({
                                id: 'npsScore',
                                label: labelGetter.getValue(labels, 'npsscore', 'legend') || 'Nps score',
                                color: npsModel.getColor()
                            }, [npsModel])
                        ],
                        labelOrderIndex);

                        if ($scope.slider) {
                            $scope.rangeValues = grouper.getLabels().map(function (line) {
                                return line.label;
                            });
                            $scope.rangeLow = 0;
                            $scope.rangeHigh = $scope.rangeValues.length - 1;

                            $scope.$watch('rangeLow', slice);
                            $scope.$watch('rangeHigh', slice);
                        }

                        view = new View({
                            model: model,
                            labels: grouper,
                            npsModel: npsModel,
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onItemClick: onItemClick, onLabelChange: onLabelChange }, $scope.viewConfig)
                        });

                        if ($scope.slider) {
                            rangeControlDragInstance = rangeControlDragService.getInstance($scope,
                                slider, $element[0].querySelector('svg'));
                        }

                        function onItemClick(line, dot) {
                            $scope.itemClick({
                                line: line,
                                dot: dot
                            });
                        }

                        function onLabelChange(value, key, type) {
                            $scope.labelChange({
                                text: value,
                                name: key,
                                type: type
                            });
                        }

                        view.init();

                        function showColorPicker(legendModel) {
                            /*jshint validthis: true */
                            /*jshint -W117 */
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

                        /*jslint unparam:true*/
                        function onLineContextMenu(line, lineIndex) {
                            /*jshint validthis: true */
                            d3.event.preventDefault();
                            showColorPicker.call(d3.event.target, $scope.groups[lineIndex]);
                        }
                        /*jslint unparam:false*/

                        function onNpsContextMenu() {
                            /*jshint validthis: true */
                            d3.event.preventDefault();
                            showColorPicker.call(d3.event.target, $scope.groups[3]);
                        }


                        var notReadOnly = !$scope.readOnly || $scope.readOnly === 'false';

                        if (notReadOnly) {
                            view.getColorAreas()
                                .on('contextmenu', null);
                            view.getColorAreas()
                                .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onLineContextMenu));

                            view.getNpsColorArea()
                                .on('contextmenu', null);
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
