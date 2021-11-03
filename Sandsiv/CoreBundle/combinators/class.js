/*global define*/
define([
    'underscore'
], function (_) {
    'use strict';

    return function (properties) {
        var proto = {},
            extend = properties.extend,
            constructor;

        constructor = function () {};

        if (properties.hasOwnProperty('constructor')) {
            constructor = properties.constructor;
        }

        if (extend) {
            proto = extend.prototype;
            constructor.prototype = Object.create(proto);
        }

        _.extend(constructor.prototype, Object.create(properties));

        return constructor;
    };
});
