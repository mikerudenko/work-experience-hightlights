define(function() {
    'use strict';

    /**
     * @example
     *
     * function isEven(number) {
     *   return number % 2;
     * }
     *
     * var isOdd = negate(isEven);
     *
     * isEven(2); // return true
     * isOdd(2);  // return false
     * 
     */

    function negate(subject) {
        return function() {
            return !subject.apply(this, arguments);
        };
    }

    return negate;
});
