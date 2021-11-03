/*global define*/
define([
    'angular',
    'd3',
    'underscore',
    'd3Cloud',
    'core/stringFormat'
], function (ng, d3, un) {
    'use strict';

    return ['underscoreExtraService', 'tooltipService',
        function (unE, tooltip) {
            return function (conf) {
                var model = conf.model,
                    defaults,
                    self = this;

                defaults = {
                    rotate: 0,
                    padding: 5,
                    minSize: 12,
                    maxSize: 50,
                    overOpacity: 0.5,
                    margin: {
                        left: 10,
                        top: 10,
                        right : 10,
                        bottom: 0
                    }
                };

                self.config = conf.config;
                unE.defaults(self.config, defaults);
                self.svg = d3.select(conf.svg);

                function translateToMiddle() {
                    var x = model.getWidth() / 2,
                        y = model.getHeight() / 2;

                    return 'translate(' + x + ',' + y + ')';
                }

                function text(tag) {
                    return tag.model.text();
                }

                function scaleCoefficient() {
                    var scale = model.getWidth() / Math.sqrt(model.count()),
                        maxSize = self.config.maxSize;

                    return scale > maxSize ?
                            maxSize : scale;
                }

                function wordsData() {
                    var coefficient = scaleCoefficient();

                    return un.map(model.data, function (word) {
                        var score = word.score();

                        /*
                            tbd
                            think about long words
                            couse cloud layout will moveout word
                            if it long and have big weight
                        */
                        return {
                            model: word,
                            value: score,
                            size:  score / model.maxScore() * coefficient
                        };
                    });
                }

                function onTagOver(tag) {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr('opacity', self.config.overOpacity);

                    tooltip.show(d3.event, tag.model.count());
                }

                function onTagOut() {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr('opacity', 1);

                    tooltip.hide();
                }

                function onTagClick(word) {
                    self.config.onItemClick(word.model);
                }

                function onLayoutRdy(data) {
                    var tags;

                    tags = self.view
                        .selectAll('text')
                        .data(data, function (tag) {
                            return tag.model.text();
                        });

                    tags.enter()
                        .append('text')
                        .attr({
                            'class': 'word',
                            'text-anchor': 'middle'
                        })
                        .on('mouseover', onTagOver)
                        .on('mouseout', onTagOut)
                        .on('click', onTagClick);

                    tags
                        .attr({
                            fill: function (tag) {
                                return tag.model.color();
                            },
                            transform: function (tag) {
                                return 'translate({0}, {1})rotate({2})'.format(
                                    tag.x,
                                    tag.y,
                                    tag.rotate
                                );
                            }
                        })
                        .style('font-size', function (tag) {
                            return tag.size + 'px';
                        })
                        .text(text);

                    tags.exit().remove();
                }

                self.draw = function () {
                    self.view
                        .attr('transform', translateToMiddle);

                    self.layout
                        .size([model.getWidth(), model.getHeight()])
                        .words(wordsData())
                        .start();
                };

                self.init = function () {
                    var config = self.config;

                    self.view = self.svg.append('g');

                    self.layout = d3.layout.cloud()
                        .padding(config.padding)
                        .rotate(config.rotate)
                        .text(text)
                        .fontSize(function (tag) {
                            return Math.max(tag.size, config.minSize);
                        })
                        .on('end', onLayoutRdy);

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
