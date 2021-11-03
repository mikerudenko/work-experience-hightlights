/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return [function () {
        return function (conf) {
            var self = this;

            self.labels = conf.labels;
            self.filterLabels = self.labels;
            self.lines = conf.lines;

            self.sliceFilter = function (start, end) {
                self.filterLabels = self.labels.slice(start, end);
                un.each(self.lines, function (line) {
                    line.filter(start, end);
                });
            };

            self.getLabels = function () {
                return self.filterLabels;
            };

            self.getLabel = function (index) {
                return self.filterLabels[index];
            };
        };
    }];
});
