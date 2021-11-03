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

        proto.getCount = function () {
            return this.count;
        };

        proto.getScore = function () {
            return this.score;
        };

        proto.getScoreLabel = function () {
            return this.scoreLabel;
        };

        proto.getValue = function () {
            return this.value;
        };

        proto.getValueLabel = function () {
            return this.valueLabel;
        };

        return constructor;
    }];
});
