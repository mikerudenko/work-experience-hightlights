/*global define*/
define(function () {
    'use strict';

    return [function () {
        return function (data) {
            var self = this;

            self.data = data;

            self.text = function (word) {
                if (!arguments.length) {
                    return self.data.word;
                }

                self.data.word = word;

                return self;
            };

            self.score = function (score) {
                if (!arguments.length) {
                    return self.data.percent;
                }

                self.data.percent = score;

                return self;
            };

            self.color = function (color) {
                if (!arguments.length) {
                    return self.data.color;
                }

                self.data.color = color;

                return self;
            };

            self.count = function (count) {
                if (!arguments.length) {
                    return self.data.count;
                }

                self.data.count = count;

                return self;
            };
        };
    }];
});
