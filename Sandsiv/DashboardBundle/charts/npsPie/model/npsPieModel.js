/*global define*/
define(['underscore',
        'dashboard/dashboard/module/charts/CustomerLoyaltyFilterMixin'
], function (_, CustomerLoyaltyFilterMixin) {
    'use strict';

    return ['pieModel', function (pieModel) {
        return function () {
            var self = this;

            pieModel.apply(self, arguments);
            CustomerLoyaltyFilterMixin.apply(self, [loyaltyProvider, loyaltySelector]);

            self.type = 'nps_pie_chart';

            function loyaltyProvider() {
                return self.data;
            }

            function loyaltySelector(data) {
                return data.type;
            }

            self.getTotalPercent = function () {
                return _.first(self.getPromoters()).getPercent() -
                    _.first(self.getDetractors()).getPercent();
            };
        };
    }];
});
