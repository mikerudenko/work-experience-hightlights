define(function (require) {
    'use strict';

    var Maybe = require('../monads/Maybe');

    function skipWhen(predicate) {
        return function(monad) {
            return monad.isJust && predicate(monad.get()) ? Maybe.Nothing() : monad;
        };
    }

    return skipWhen;
});
