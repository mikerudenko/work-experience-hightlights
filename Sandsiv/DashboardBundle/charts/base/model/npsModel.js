/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return ['npsModelItem', 'modelPrototype', 'npsColorService',
        function (NpsModelItem, prototype, npsColor) {
            var proto = un.clone(prototype);

            function constructor(config, groups) {
                /*jshint validthis: true */

                var self = this;

                un.extend(self, config);
                self.sourceData = self.data = groups.map(function (group) {
                    return new NpsModelItem(group);
                });

                if (!self.color) {
                    self.color = npsColor.getColor('nps');
                }
            }

            constructor.prototype = proto;

            proto.sliceFilter = function (start, end) {
                this.data = this.sourceData.slice(start, end);
            };

            return constructor;
        }];
});
