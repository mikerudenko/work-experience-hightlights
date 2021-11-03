/*global define*/
define([
    'underscore',
    'dashboard/dashboard/module/charts/CustomerLoyaltyFilterMixin'
], function (un, CustomerLoyaltyFilterMixin) {
    'use strict';

    return ['npsStackedBarGroupModel', 'baseModel', function (GroupModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);
            CustomerLoyaltyFilterMixin.apply(self, [loyaltyProvider, loyaltySelector]);

            self.data = [];
            self.allBars = [];
            self.min = 0;
            self.max = 0;
            self.sourceData = self.data;

            function onGroupAdded(groupModel) {
                var count = groupModel.getCount();

                Array.prototype.push.apply(self.allBars, groupModel.data);
                self.max = self.max > count ? self.max : count;
            }

            function loyaltyProvider() {
                return self.allBars;
            }

            function loyaltySelector(data) {
                return data.getId();
            }

            self.sliceFilter = function (start, end) {
                self.data = self.sourceData.slice(start, end);
            };

            self.addGroup = function (group) {
                var groupModel = new GroupModel(group);

                self.data.push(groupModel);
                onGroupAdded(groupModel);
            };

            self.getAllBars = function () {
                return self.allBars;
            };

            self.last = function () {
                return self.data[self.data.length - 1];
            };

            self.getMin = function () {
                return self.min;
            };

            self.getMax = function () {
                return self.max;
            };

            self.getAt = function (index) {
                return self.data[index];
            };

            self.getSourceAt = function (index) {
                return self.sourceData[index];
            };

            self.move = function (index, moveTo) {
                self.data.forEach(function (group) {
                    group.move(index, moveTo);
                });
            };
        };
    }];
});
