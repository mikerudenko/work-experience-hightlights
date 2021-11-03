/*global define*/
define(function () {
    'use strict';

    function decorateArgumentsWith() {
        var decorators = [].slice.call(arguments);
        /*jshint validthis: true */
        var subject = this;

        function decorate(args) {
            return args.map(function(arg, i) {
                return decorators[i](arg);
            });
        }

        return function() {
            return subject.apply(this, decorate([].slice.call(arguments)));
        };
    }

    Function.prototype.decorateArgumentsWith = decorateArgumentsWith;
});
