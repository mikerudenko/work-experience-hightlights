/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return [function () {
        return function (conf, bars) {
            var self = this;
            un.extend(self, conf);
            self.items = bars;

            un.each(self.items, function (bar) {
                bar.setLabel(self.label);
                bar.setColor(self.color);
            });

            self.getId = function () {
                return self.id;
            };

            self.getLabel = function () {
                return self.label;
            };

            self.setLabel = function (label) {
                self.label = label;
                un.each(self.items, function (bar) {
                    bar.setLabel(label);
                });
            };

            self.setColor = function (color) {
                self.color = color;
                un.each(self.items, function (bar) {
                    bar.setColor(color);
                });
            };

            self.getColor = function () {
                return self.color;
            };
        };
    }];
});
