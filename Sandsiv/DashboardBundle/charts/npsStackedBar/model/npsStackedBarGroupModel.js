/*global define*/
define([
    'underscore',
    'dashboard/dashboard/module/charts/CustomerLoyaltyFilterMixin'
], function (un, CustomerLoyaltyFilterMixin) {
    'use strict';

    return ['npsStackedBarItemModel', function (ItemModel) {
        return function (group) {
            var self = this;
            CustomerLoyaltyFilterMixin.apply(self, [loyaltyProvider, loyaltySelector]);

            self.data = [];
            self.label = group.label;
            self.id = group.id;

            function loyaltyProvider() {
                return self.data;
            }

            function loyaltySelector(data) {
                return data.getId();
            }

            self.addBar = function (bar) {
                var itemModel = new ItemModel(bar);

                self.data.push(itemModel);
            };

            self.last = function () {
                return self.data[self.data.length - 1];
            };

            self.getId = function () {
                return self.id;
            };

            self.getLabel = function () {
                return self.label;
            };

            self.length = function () {
                return self.data.length;
            };

            self.getScore = function () {
                return un.first(self.getPromoters()).getPercent() -
                    un.first(self.getDetractors()).getPercent();
            };

            self.getCount = function () {
                var count = 0;

                un.each(self.data, function (slice) {
                    count += slice.getCount();
                });

                return count;
            };

            self.move = function (index, moveTo) {
                var bars = self.data;

                bars.splice(moveTo, 0, bars.splice(index, 1)[0]);
            };

            un.each(group.barParts, function (bar) {
                self.addBar(bar);
            });
        };
    }];
});
