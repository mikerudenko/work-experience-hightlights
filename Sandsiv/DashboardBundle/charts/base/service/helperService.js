/*global define*/
define(function() {
    'use strict';

    return [function() {

        this.not = function(fn) {
            return function(...args) {
                return !fn(...args);
            }
        };
    }];
});