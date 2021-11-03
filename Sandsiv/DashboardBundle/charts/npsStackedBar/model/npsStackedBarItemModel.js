/*global define*/
define(function () {
    'use strict';

    return ['npsColorService', function (npsColor) {
        return function (data) {
            var self = this;

            self.data = data;
            self.group = null;

            if (!self.data.color) {
                self.data.color = npsColor.getColor(self.data.id);
            }

            self.getId = function () {
                return self.data.id;
            };

            self.getLabel = function () {
                return self.data.label;
            };

            self.setLabel = function (label) {
                self.data.label = label;
            };

            self.getCount = function () {
                return self.data.count;
            };

            self.getColor = function () {
                return self.data.color;
            };

            self.setColor = function (color) {
                self.data.color = color;
            };

            self.getPercent = function () {
                return self.data.percent;
            };

            self.getGroup = function () {
                return self.group;
            };

            self.setGroup = function (group) {
                self.group = group;
            };
        };
    }];
});
