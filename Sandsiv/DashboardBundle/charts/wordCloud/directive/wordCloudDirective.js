/*global define*/
define([
    'underscore',
    'd3',
    'text!../template/wordCloud.html',
    'css!../style/wordCloud.css'
], function (un, d3, template) {
    'use strict';

    return ['wordCloudModel', 'wordCloudViewService',
        function (Model, View) {
            return {
                restrict: 'E',
                scope: {
                    chartData: '=',
                    viewConfig: '=',
                    itemClick: '&?',
                    rebuildCloud: '='
                },
                template: template,
                link: {
                    post: function ($scope, $element) {

                        var model,
                            color,
                            view;


                        function onSizeChange() {
                            view.draw();
                        }

                        function onItemClick(word) {
                            $scope.itemClick({
                                item: word
                            });
                        }


                        function modelControl(flag) {
                            if (flag) {
                                $scope.$apply();
                            }
                            model = new Model({
                                width: $element.width()
                            });
                            $scope.model = model;
                            color = d3.scale.category20();

                            model.observer.on({
                                resize: onSizeChange
                            });

                            un.each($scope.chartData, function (word, index) {
                                model.addItem(word)
                                    .color(color(index));
                            });

                            view = new View({
                                model: model,
                                svg: $element.find('svg')[0],
                                config: Object.assign({onItemClick: onItemClick}, $scope.viewConfig)
                            });

                            view.init();

                        }

                        modelControl();

                        $scope.$on('resize', function () {
                            model.setWidth($element.width());
                        });

                        $scope.$on('$destroy', function () {
                            model.observer.off({
                                resize: onSizeChange
                            });

                            view.destroy();
                        });

                        $scope.rebuildCloud = function (flag) {
                            $element.find('svg').empty();
                            modelControl(flag);
                        };

                    }
                }
            };
        }];
});
