/*global define*/
define([
    'underscore',
    'd3'
], function (un, d3) {
    'use strict';

    return ['lineModel', 'baseModel', function (LineModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);

            self.type = 'line';
            self.data = [];
            self.sourceData = self.data;

            self.sliceFilter = function (start, end) {
                self.data = self.sourceData.slice(start, end);
            };

            self.add = function (lineData) {
                var lineModel = new LineModel(lineData);

                self.sourceData.push(lineModel);

                return lineModel;
            };

            self.last = function () {
                return self.data[self.data.length - 1];
            };

            self.getMin = function () {
                return d3.min(un.map(self.data, function (line) {
                    return d3.min(line.getData());
                }));
            };

            self.getMax = function () {
                return d3.max(un.map(self.data, function (line) {
                    return d3.max(line.getData());
                }));
            };

            self.indexSum = function (index) {
                var sum = 0;

                un.each(self.data, function (line) {
                    sum += line.getData()[index];
                });

                return sum;
            };

            self.getAt = function (index) {
                return self.data[index];
            };

            self.getSourceAt = function (index) {
                return self.sourceData[index];
            };

            self.move = function (index, moveTo) {
                var areas = self.data;

                areas.splice(moveTo, 0, areas.splice(index, 1)[0]);
            };
        };
    }];
});
