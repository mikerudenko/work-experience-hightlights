/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return function (data) {
        var self = this;

        un.extend(self, data);

        self.getLabel = function () {
            return self.label;
        };

        self.getColor = function () {
            return self.color;
        };

        self.getCountries = function () {
            return self.countries;
        };
    };
});
