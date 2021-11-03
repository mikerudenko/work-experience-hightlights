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
     * var add = before(summ)(logOperands);
     *
     * add(2, 3); // will call `logOperands` first then `summ`
     * 
     */

    function before(subject) {
        return function(decorator) {
            return function() {
                decorator.apply(this, arguments);

                return subject.apply(this, arguments);
            };
        };
    }

    return before;
});
