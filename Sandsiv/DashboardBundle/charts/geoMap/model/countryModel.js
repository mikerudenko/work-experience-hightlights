/*global define*/
define(function () {
    'use strict';

    return [function () {
        return function (data) {
            var self = this;

            self.data = data;

            self.getId = function () {
                return self.data.id;
            };

            self.getScore = function () {
                return self.data.npsScore;
            };

            self.getColor = function () {
                return self.data.color;
            };

            self.setColor = function (color) {
                self.data.color = color;
            };
        };
    }];
});
