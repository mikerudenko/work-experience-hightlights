/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return ['modelPrototype', function (prototype) {
        var proto = un.clone(prototype);

        function constructor(config) {
            /*jshint validthis: true */

            var self = this;

            un.extend(self, config);
            self.sourceData = self.data = self.values;
        }

        constructor.prototype = proto;

        proto.filter = function (start, end) {
            this.data = this.sourceData.slice(start, end);
        };

        return constructor;
    }];
});
