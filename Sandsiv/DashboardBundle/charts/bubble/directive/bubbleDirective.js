/*global define*/
define([
    'underscore',
    'd3',
    'text!../template/bubble.html'
], function (un, d3, template) {
    'use strict';

    var λ = require('ramda');

    return ['bubbleViewService',
        'bubblesModel', 'chartColorPickerService', 'grouperService', 'labelGetterService',
        function (View, Model, colorPickerService, Grouper, labelGetter) {
            return {
                restrict: 'E',
                template: template,
                scope: {
                    chartData: '=',
                    viewConfig: '=',
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
                            color,
                            labels = $scope.viewConfig.labels || [],
                            view,
                            npsColors = {
                                detractors: '#d2322d',
                                passives: '#ed9c28',
                                promoters: '#47a447',
                                'null': '#428bca'
                            };
                        model =  new Model({width: $element.width()});
                        color = d3.scale.category20();

                        //Rewrite method
                        if($scope.viewConfig.isExternalDataChart) {
                            model.getMinValue = ()=> 0;
                        }


                        $scope.model = model;
                        color = d3.scale.category20();

                        function onSizeChange() {
                            view.draw();
                        }

                        function setColor(model, slice) {
                            return slice.getColor();
                        }

                        $scope.onLegendOver = function (bubble) {
                            view.highlightBubble(bubble);
                        };

                        $scope.onLegendOut = function (bubble) {
                            view.unHighlightBubble(bubble);
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

                        un.each($scope.chartData, function (bubble, index) {
                            let bubbleModel = model.add(bubble);

                            if (!bubbleModel.getColor() && !$scope.viewConfig.isExternalDataChart) {
                                bubbleModel.setColor(color(index));
                            }

                        });

                        $scope.groups =  λ.uniq(model.data.map(x=> x.label)).map((name)=> {
                            let slices = model.getGroup(name);
                            if(!slices[0]) {
                                return;
                            }

                            let label = slices[0].getLabel(),
                                id = slices[0].getId(),
                                groupColor;

                            if(!slices[0].getColor()) {
                                switch(id) {
                                    case 'Detractors' :
                                        groupColor = npsColors.detractors;
                                        break;
                                    case 'Promoters' :
                                        groupColor = npsColors.promoters;
                                        break;
                                    case 'Passives' :
                                        groupColor = npsColors.passives;
                                        break;
                                    default:
                                        groupColor = color(id);
                                        break;
                                }
                            }

                            return new Grouper({
                                id: id,
                                label: labelGetter.getValue(labels, id, 'legend') || label || id,
                                color: groupColor || setColor(model, slices[0])
                            }, slices);

                        }).filter(x => x);

                        $scope.labelGroups = $scope.groups;

                        view = new View({
                            model: model,
                            svg: $element.find('svg')[0],
                            config: Object.assign({ onLabelChange: onLabelChange }, $scope.viewConfig)
                        });

                        function onLabelChange(value, type) {
                            $scope.labelChange({
                                text: value,
                                name: type,
                                type: 'axis'
                            });
                        }

                        view.init();

                        /*jslint unparam:true*/
                        function onAreaContextMenu(area, index) {
                            /*jshint validthis: true */

                            var legendModel = $scope.groups.find( x => x.items.find(λ.equals(area)) );

                            colorPickerService.show(
                                this,
                                area.getColor(),
                                function (color) {
                                    $scope.onColorChange(legendModel, color);
                                }
                            );
                        }
                        /*jslint unparam:false*/

                        if (!$scope.readOnly) {
                            view.getColorAreas()
                                .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onAreaContextMenu));
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
