/*global define*/
define(function () {
    'use strict';

    var round = function (number, precision, isFixed) {
            var pow = Math.pow(10, precision),
                result = Math.round(number * pow) / pow;

            return isFixed ? result.toFixed(precision) : result;
        };

    return {
        round: function (number, precision, isFixed) {
            return round(number, precision, isFixed);
        }
    };
});
