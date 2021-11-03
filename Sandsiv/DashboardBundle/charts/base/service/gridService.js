/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return [function () {
        return function (config) {
            var scale = config.scale,
                size = config.size,
                values = config.values,
                isVertical = config.orient === 'vertical';

            un.defaults(config, {
                rangeOffset: 0
            });

            function offset(value) {
                /*jshint validthis: true */

                var offsetValue = config.offsetFn ?
                        config.offsetFn.call(this, value) : 0;

                return scale(value) + offsetValue;
            }

            function lineUpdate() {
                /*jshint validthis: true */

                this.attr({
                    x1: isVertical ? offset : 0,
                    x2: isVertical ? offset : size,
                    y1: isVertical ? 0 : offset,
                    y2: isVertical ? size : offset
                });
            }

            function call() {
                /*jshint validthis: true */

                var lines = this.selectAll('.grid-line')
                    .data(values);

                lines.enter()
                    .append('line')
                    .attr('class', 'grid-line')
                    .call(lineUpdate);

                lines.exit()
                    .remove();

                lines.call(lineUpdate);
            }

            call.setValues = function(newValues) {
                values = Array.from(newValues);
            };

            call.size = function (newSize) {
                size = newSize;

                return this;
            };

            call.values = function (newValues) {
                values = newValues;

                return this;
            };

            return call;
        };
    }];
});
