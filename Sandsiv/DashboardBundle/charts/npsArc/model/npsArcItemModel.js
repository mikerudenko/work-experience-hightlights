/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return ['modelPrototype', function (prototype) {
        var proto = un.clone(prototype);

        function constructor(config) {
            /*jshint validthis: true */

            un.extend(this, config);
        }

        constructor.prototype = proto;

        proto.getPercent = function () {
            return this.percent;
        };

        proto.getCount = function () {
            return this.count;
        };

        return constructor;
    }];
});
