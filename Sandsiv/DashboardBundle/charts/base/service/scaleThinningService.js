/*global define*/
define(function () {
    'use strict';

    return [function () {
        return function () {
            var scale,
                domain = [0, 1],
                ticks = 10;

            scale = function () {
                var i = 0,
                    slice = [],
                    step;

                step = Math.ceil(domain.length / (ticks - 1));
                slice.push(domain[0]);
                for (i += step; i <= domain.length - step; i += step) {
                    slice.push(domain[i]);
                }
                slice.push(domain[domain.length - 1]);

                return slice;
            };

            scale.domain = function (x) {
                if (!arguments.length) {
                    return domain;
                }

                domain = x;

                return scale;
            };

            scale.ticks = function (x) {
                if (!arguments.length) {
                    return ticks;
                }

                ticks = x;

                return scale;
            };

            return scale;
        };
    }];
});
