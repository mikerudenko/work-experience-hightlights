/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return ['barModel', function (base) {
        return function () {
            var self = this;

            base.apply(self, arguments);
            self.type = 'bar';

            self.getPromoters = function () {
                var promoters = [];

                un.each(self.data, function (group) {
                    un.each(group.data, function (bar) {
                        var value = bar.getValue();

                        if (value > 8 && value <= 10) {
                            promoters.push(bar);
                        }
                    });
                });

                return promoters;
            };

            self.getDetractors = function () {
                var detractors = [];

                un.each(self.data, function (group) {
                    un.each(group.data, function (bar) {
                        if (bar.getValue() <= 6) {
                            detractors.push(bar);
                        }
                    });
                });

                return detractors;
            };

            self.getPassives = function () {
                var passive = [];

                un.each(self.data, function (group) {
                    un.each(group.data, function (bar) {
                        var value = bar.getValue();

                        if (value > 6 && value <= 8) {
                            passive.push(bar);
                        }
                    });
                });

                return passive;
            };
        };
    }];
});
