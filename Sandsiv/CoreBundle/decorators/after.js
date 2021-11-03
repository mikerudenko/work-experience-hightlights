define(function() {
    'use strict';

    /**
     * @example
     *
     * function summ(a, b) {
     *   return a + b;
     * }
     *
     * function logOperands(a, b) {
     *   console.log('a:b=', a, ':', b);
     * }
     *
     * var add = after(summ)(logOperands);
     *
     * add(2, 3); // will call `summ` first then `logOperands`
     * 
     */

    function after(subject) {
        return function(decorator) {
            return function() {
                var result = subject.apply(this, arguments);
                decorator.apply(this, arguments);

                return result;
            };
        };
    }

    return after;
});
