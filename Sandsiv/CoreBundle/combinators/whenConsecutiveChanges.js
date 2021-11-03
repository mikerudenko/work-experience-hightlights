define(function (require) {
    'use strict';

    function whenConsecutiveChanges(predicate) {
        return function (action) {
            return function (newValue, oldValue) {
                /*jshint -W030 */
                predicate(newValue, oldValue) ? action(newValue, oldValue) : (function nop() {})();
                /*jshint +W030 */
            };
        };
    }

    return whenConsecutiveChanges;
});
