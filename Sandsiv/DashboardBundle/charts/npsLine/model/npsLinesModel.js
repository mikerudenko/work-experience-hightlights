/*global define*/
define([
    'underscore',
    'dashboard/dashboard/module/charts/CustomerLoyaltyFilterMixin'
], function (un, CustomerLoyaltyFilterMixin) {
    'use strict';

    return ['npsLineModel', 'baseModel', function (LineModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);
            CustomerLoyaltyFilterMixin.apply(self, [loyaltyProvider, loyaltySelector]);

            self.type = 'npsLine';
            self.data = [];
            self.sourceData = self.data;

            self.filter = function (start, end) {
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

            self.indexSum = function (index) {
                var sum = 0;

                un.each(self.data, function (line) {
                    sum += line.getValues()[index];
                });

                return sum;
            };

            function loyaltyProvider() {
                return self.data;
            }

            function loyaltySelector(data) {
                return data.getType();
            }

            self.getAt = function (index) {
                return self.data[index];
            };

            self.getSourceAt = function (index) {
                return self.sourceData[index];
            };
        };
    }];
});
