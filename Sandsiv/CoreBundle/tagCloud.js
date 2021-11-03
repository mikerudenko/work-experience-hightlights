/*global define, document, Math*/
define([
    'jquery',
    'd3',
    'd3Cloud',
    'css!coreStyles/tagCloud.css',
    'bootstrap'
], function ($, d3) {
    'use strict';

    var defaultConfig = {
            sizes: function (selector) {
                var sizes = {};

                $(selector).parents().each(function () {
                    if ($(this).width() !== 0 && $(this).css('width') !== '100%') {
                        sizes.width = $(this).width();
                        sizes.height = sizes.width / 3;

                        return false;
                    }
                });

                return sizes;
            },
            padding: 0,
            maxTagSize: 72
        },
        tagCloud = {
            draw: function (data, selector, config) {
                var fill = tagCloud.colors(),
                    sizes,
                    wordObjects = tagCloud.words(data, config.maxTagSize);

                if (typeof config.sizes === 'function') {
                    sizes = config.sizes(selector);
                } else {
                    sizes = config.sizes;
                }

                function takeIt (words) {
                    d3.select(selector)
                        .append("svg")
                        .attr('class', 'tagCloud')
                        .attr("width", sizes.width)
                        .attr("height", sizes.height)
                        .append("g")
                        .attr("transform", "translate(" + sizes.width / 2 + "," +  sizes.height / 2 + ")")
                        .selectAll("text")
                        .data(words)
                        .enter()
                        .append("text")
                        .attr('class', function (d, i) { return 'text-word-' + i; })
                        .style("font-size", function (d) { return d.size + "px"; })
                        .style("fill", function (d, i) { return fill(i); })
                        .attr("transform", function(d) {
                            return "translate(" + [d.x, d.y] + ")";
                        })
                        .attr("text-anchor", "middle")
                        .attr("data-title", function (d) { return d.amount; })
                        .text(function (d) { return d.text; })
                        .on('click', function (d, i) {
                            $(selector).trigger('chart.click', {indexes: [i]});
                        })
                        .on('mouseover', function (d, i) {
                            d3.select(selector + ' .text-word-' + i).transition().attr('opacity', 0.5);
                        })
                        .on('mouseout', function (d, i) {
                            d3.select(selector + ' .text-word-' + i).transition().attr('opacity', 1);
                        });
                }

                d3.layout.cloud()
                    .size([sizes.width, sizes.height])
                    .words(wordObjects)
                    .padding(5)
                    .rotate(function () { return 0; })
                    .fontSize(function (d) { return Math.max(d.size, 12); })
                    .on("end", takeIt)
                    .start();

                $(document).ready(function () {
                    $(".tooltip").remove();

                    $("svg text").tooltip({
                        'container': 'body',
                        'placement': 'top'
                    });
                });
            },
            colors: function () {
                return d3.scale.category10();
            },
            words: function (data, maxWordSize) {
                var array = [],
                    maxValue = 0;

                $.each(data, function (index, value) {
                    if (value > maxValue) {
                        maxValue = value;
                    }
                });

                $.each(data, function (index, value) {
                    array.push({
                        text: index,
                        amount: value,
                        size: maxValue ? (value / maxValue * maxWordSize).toFixed(2) : 0
                    });
                });

                return array;
            }
        };

    return {
        'draw': function (data, selector, config) {
            tagCloud.draw(data, selector, $.extend({}, defaultConfig, config || {}));
        }

    };
});
