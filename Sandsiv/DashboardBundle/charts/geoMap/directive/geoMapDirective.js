/*global define*/
define([
    'underscore',
    'text!../template/geoMap.html',
    '../model/legendModel'
], function (un, template, LegendModel) {
    'use strict';

    return ['geoMapViewService', 'geoMapModel', 'npsColorService', 'labelGetterService',
            'chartColorPickerService',
        function (View, Model, npsColor, labelGetter, colorPickerService) {
            return {
                restrict: 'E',
                template: template,
                scope: {
                    chartData: '=',
                    colorChange: '&?',
                    labelChange: '&?',
                    viewConfig: '='
                },
                link: {
                    post: function ($scope, $element) {
                        var model,
                            labels = $scope.viewConfig.labels || [],
                            view;

                        model = new Model({
                            width: $element.width(),
                            persistedColors: $scope.viewConfig.colors
                        });
                        $scope.model = model;

                        function onSizeChange() {
                            view.draw();
                        }

                        $scope.onLegendOver = function (legendModel) {
                            view.highlight(legendModel.getCountries());
                        };

                        $scope.onLegendOut = function (legendModel) {
                            view.unHighligh(legendModel.getCountries());
                        };

                        $scope.onColorChange = function (legendModel, newColor) {
                            legendModel.color = newColor;
                            legendModel.countries.forEach(function(country) {
                                country.setColor(newColor);
                            });
                            view.draw();
                            $scope.colorChange({
                                color: newColor,
                                key: legendModel.id
                            });
                        };

                        $scope.onLabelChange = function (legend, newLabel) {
                            legend.label = newLabel;
                            $scope.labelChange({
                                text: newLabel,
                                name: legend.id,
                                type: 'legend'
                            });
                        };

                        model.observer.on({
                            resize: onSizeChange
                        });

                        $scope.$on('resize', function () {
                            model.setWidth($element.width());
                        });

                        un.each($scope.chartData, function (group) {
                            model.add(group)
                                .setColor(
                                    npsColor.colorByNpsScore(group.npsScore / 100)
                                );
                        });

                        function setCountryColor(color) {
                            return !color ? un.identity : function(country) {
                                return country.setColor(color);
                            };
                        }

                        model.getLowCountries().forEach(setCountryColor(model.getLowScoreColor()));
                        model.getMediumCountries().forEach(setCountryColor(model.getMediumScoreColor()));
                        model.getHighCountries().forEach(setCountryColor(model.getHighScoreColor()));


                        $scope.groups = [
                            new LegendModel({
                                id: model.LOW_SCORE_COLOR_ID,
                                label: labelGetter.getValue(labels, model.LOW_SCORE_COLOR_ID, 'legend') ||
                                       'Low nps score (-100% - 0%)',
                                color: model.getLowScoreColor() || npsColor.getColor('detractors'),
                                countries: model.getLowCountries()
                            }),
                            new LegendModel({
                                id: model.MEDIUM_SCORE_COLOR_ID,
                                label: labelGetter.getValue(labels, model.MEDIUM_SCORE_COLOR_ID, 'legend') ||
                                       'Medium nps score (1% - 40%)',
                                color: model.getMediumScoreColor() || npsColor.getColor('passives'),
                                countries: model.getMediumCountries()
                            }),
                            new LegendModel({
                                id: model.HIGH_SCORE_COLOR_ID,
                                label: labelGetter.getValue(labels, model.HIGH_SCORE_COLOR_ID, 'legend') ||
                                       'High nps score (41% - 100%)',
                                color: model.getHighScoreColor() || npsColor.getColor('promoters'),
                                countries: model.getHighCountries()
                            })
                        ];

                        $element[0].draggable = true;
                        $element[0].addEventListener('dragstart', function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                        }, true);

                        view = new View({
                            model: model,
                            svg: $element.find('svg')[0],
                            config: $scope.viewConfig || {}
                        });

                        view.init();

                        function onCountryContextMenu(countryShape) {
                            /*jshint validthis: true */

                            function countryId(country) {
                                return country.getId();
                            }

                            function groupContainsCountryId(group) {
                                return un.contains(un.map(group.countries, countryId), countryShape.id);
                            }

                            var legendModel = un.find($scope.groups, groupContainsCountryId);
                            if (!legendModel) {
                                return;
                            }

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
                                .on('contextmenu', colorPickerService.cancelDefaultMenuBefore(onCountryContextMenu));
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
