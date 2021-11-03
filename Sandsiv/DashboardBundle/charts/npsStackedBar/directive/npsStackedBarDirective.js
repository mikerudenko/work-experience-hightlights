/*global define*/
define([
    'underscore',
    'text!../template/npsStackedBar.html'
], function (un, template) {
    'use strict';

    return ['npsStackedBarModel', 'npsStackedBarViewService',
        'grouperService',
        'labelGetterService', 'npsModel', 'chartColorPickerService',
        'textLengthService', 'chartConstant', 'rangeControlDragService',
        function (
            Model,
            View,
            Grouper,
            labelGetter,
            NpsModel,
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
                            view,
                            rangeControlDragInstance,
                            slider = $element[0].querySelector('slider .selection'),
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
                            npsModel.sliceFilter($scope.rangeLow, $scope.rangeHigh + 1);
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
                            view.draw();
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
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onItemClick: onItemClick, onLabelChange: onLabelChange }, $scope.viewConfig)
                        });

                        if ($scope.slider) {
                            rangeControlDragInstance = rangeControlDragService.getInstance($scope,
                                slider, $element[0].querySelector('svg'));
                        }

                        function onItemClick(barItem, bar) {
                            $scope.itemClick({
                                barItem: barItem,
                                bar: bar
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
                        function onBarContextMenu(bar, barIndex) {
                            /*jshint validthis: true */

                            showColorPicker.call(this, $scope.groups[barIndex]);
                        }
                        /*jslint unparam:false*/

                        function onNpsContextMenu() {
                            /*jshint validthis: true */

                            showColorPicker.call(this, $scope.groups[3]);
                        }


                        setContextMenuHandlers();

                        function setContextMenuHandlers() {
                            var notReadOnly = !$scope.readOnly || $scope.readOnly === 'false';

                            if (notReadOnly) {
                                view.getColorAreas()
                                    .on('contextmenu', null);
                                view.getColorAreas()
                                    .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onBarContextMenu));

                                view.getNpsColorArea()
                                    .on('contextmenu', null);
                                view.getNpsColorArea()
                                    .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onNpsContextMenu));
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
