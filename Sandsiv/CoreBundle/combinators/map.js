define(function() {
    'use strict';

    function map(func) {
        return function(monad) {
            return monad.map(func);
        };
    }

    return map;
});
