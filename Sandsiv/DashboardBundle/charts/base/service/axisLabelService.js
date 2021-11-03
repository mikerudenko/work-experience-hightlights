/*global define*/
define([
    'angular',
    'd3',
    'core/stringFormat'
], function (ng, d3) {
    'use strict';

    return [function () {
        return function () {
            var text,
                emptyText,
                maxWidth,
                x = 0,
                y = 0,
                rotate = 0,
                dy = '0.71em',
                dx = '0em',
                overRectX = 0,
                readOnly = false,
                onRound = ng.noop;

            function transform() {
                return 'translate({0}, {1}),rotate({2})'.format(x, y, rotate);
            }

            function round(el) {
                var roundText = text,
                    rounded = false,
                    maxPossibleNumberSymbols = 400;

                if (roundText && roundText.length > maxPossibleNumberSymbols) {
                    roundText = roundText.substr(0, maxPossibleNumberSymbols);
                    el.textContent = roundText;
                }

                while (el.getComputedTextLength() > maxWidth) {
                    roundText = roundText.substr(0, roundText.length - 1);
                    el.textContent = roundText + '..';
                    rounded = true;
                }

                onRound.call(el, text, rounded);
            }

            function updateText() {
                /*jshint validthis: true */

                if (text) {
                    this.text(text);
                } else {
                    this.html(emptyText);
                }
            }

            function opacity() {
                return text ? 1 : 0;
            }

            function onOver() {
                /*jshint validthis: true */

                d3.select(this)
                    .select('text.axis-label')
                    .attr('opacity', 1);
            }

            function onLeave() {
                /*jshint validthis: true */

                d3.select(this)
                    .select('text.axis-label')
                    .attr('opacity', opacity);
            }

            function rectSize(g) {
                var size = g.node().getBBox();

                return {
                    height: size.height,
                    width: size.width
                };
            }

            function label() {
                /*jshint validthis: true */

                var el,
                    overRect;

                el = this.selectAll('text.axis-label')
                    .data([text]);

                el.enter()
                    .append('text')
                    .attr({
                        'class': 'axis-label glyphicon',
                        'text-anchor': 'middle'
                    });


                if (!readOnly) {
                    this.on('mouseover', onOver)
                        .on('mouseleave', onLeave);
                }

                el.attr({
                    'transform': transform(),
                    dy: dy,
                    dx: dx,
                    opacity: opacity
                })
                    .call(updateText);

                /*
                    used to broadcast over event
                    because g tag dont have mouse event
                    can only listen to bubbling events
                    @TODO
                    remove over rect helper
                    after view filters will be implemented
                */
                overRect = this.selectAll('.over-helper')
                    .data([null]);

                overRect.enter()
                    .insert('rect', ':first-child')
                    .style('opacity', 0)
                    .attr('class', 'over-helper');

                overRect
                    .attr(rectSize(this))
                    .attr('x', overRectX);

                if (maxWidth) {
                    round(el.node());
                }

                return this;
            }

            label.readOnly = function (value) {
                if (!arguments.length) {
                    return readOnly;
                }

                readOnly = value;

                return label;
            };

            label.overRectX = function (value) {
                if (!arguments.length) {
                    return overRectX;
                }

                overRectX = value;

                return label;
            };

            label.text = function (value) {
                if (!arguments.length) {
                    return text;
                }

                text = value;

                return label;
            };

            label.emptyText = function (value) {
                emptyText = value;

                return label;
            };

            label.maxWidth = function (value) {
                maxWidth = value;

                return label;
            };

            label.x = function (value) {
                x = value;

                return label;
            };

            label.y = function (value) {
                y = value;

                return label;
            };

            label.rotate = function (value) {
                rotate = value;

                return label;
            };

            label.dy = function (value) {
                dy = value;

                return label;
            };

            label.dx = function (value) {
                dx = value;

                return label;
            };

            label.call = function (callback) {
                var args = Array.prototype.slice.call(arguments);

                args[0] = label;

                return callback.apply(label, arguments);
            };

            label.onRound = function (handler) {
                onRound = handler;

                return label;
            };

            return label;
        };
    }];
});
