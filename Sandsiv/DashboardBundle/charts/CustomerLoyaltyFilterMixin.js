define(['underscore'], function (_) {
    'use strict';

    function CustomerLoyaltyFilterMixin(provider, selector) {

        function withLoyalty(loyalty) {
            return function(data) {
                return selector(data) === loyalty;
            };
        }

        this.getDetractors = function() {
            return _.filter(provider(), withLoyalty('detractors'));
        };

        this.getPassives = function() {
            return _.filter(provider(), withLoyalty('passives'));
        };

        this.getPromoters = function() {
            return _.filter(provider(), withLoyalty('promoters'));
        };
    }

    return CustomerLoyaltyFilterMixin;
});
