/*global define*/
define(function () {
    'use strict';

    return [function () {
        return function (data) {
            var self = this;

            self.data = data;
            self.data.filteredValues = self.data.values;

            self.getId = function () {
                return self.data.id;
            };

            self.getLabel = function () {
                return self.data.label;
            };

            self.setLabel = function (label) {
                self.data.label = label;
            };

            self.getColor = function () {
                return self.data.color;
            };

            self.setColor = function (color) {
                self.data.color = color;
            };

            self.getValues = function () {
                return self.data.filteredValues;
            };

            self.getType = function () {
                return self.data.type;
            };

            self.setGroup = function (group) {
                self.group = group;
            };

            self.filter = function (start, end) {
                self.data.filteredValues = self.data.values.slice(start, end);
            };
        };
    }];
});
