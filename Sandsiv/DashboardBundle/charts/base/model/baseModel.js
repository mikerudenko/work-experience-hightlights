/*global define*/
define([
    'angular',
    'underscore',
    'core/observable'
], function (ng, un, Observer) {
    'use strict';

    return [function () {
        return function (config) {
            var self = this;

            self.observer = new Observer();

            un.defaults(config, {
                height: 350
            });
            un.extend(self, config);

            self.setWidth = function (width) {
                self.width = width;
                self.observer.trigger('resize', self.getSize());
            };

            self.getSize = function () {
                return {
                    width: self.getWidth(),
                    height: self.getHeight()
                };
            };

            self.getWidth = function () {
                return self.width;
            };

            self.getHeight = function () {
                return self.height;
            };

            self.destroy = ng.noop;
        };
    }];
});
