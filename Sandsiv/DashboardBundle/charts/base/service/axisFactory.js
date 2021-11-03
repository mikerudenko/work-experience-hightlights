/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return [function () {
        var provider = this;

        provider.tickMargin = 3;

        provider.def = {
            tickSize: 5,
            textSize: 35,
            labelMargin: 0,
            labelSize: 15
        };

        provider.setTickMargin = function (size) {
            this.tickMargin = size;
        };

        provider.setDefault = function (def) {
            un.extend(provider.def, def);
        };

        function factory() {
            return function (config) {
                var self = this;

                un.extend(self, provider.def, config);

                self.size = function () {
                    return this.tickSize + provider.tickMargin +
                        this.textSize + this.labelMargin +
                        this.labelSize;
                };

                self.labelOffset = function () {
                    return this.tickSize + provider.tickMargin +
                        this.textSize + this.labelMargin;
                };
            };
        }

        provider.$get = factory;
    }];
});
