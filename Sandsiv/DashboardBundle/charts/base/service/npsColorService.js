/*global define*/
define(function () {
    'use strict';

    var colors = {
        detractors: '#d2322d',
        passives: '#ed9c28',
        promoters: '#47a447',
        nps: '#1975D1'
    },
        DETRACTORS = 0.6,
        PASSIVE = 0.8,
        npsDectractors = 0,
        npsPassive = 0.4;

    return [function () {
        return {
            getColor: function (type) {
                return colors[type];
            },

            colorByValue: function (value) {
                if ((value / 10) <= DETRACTORS) {
                    return colors.detractors;
                }
                if ((value / 10) <= PASSIVE) {
                    return colors.passives;
                }

                return colors.promoters;
            },
            colorByNpsScore: function (value) {
                if (value <= npsDectractors) {
                    return colors.detractors;
                }
                if (value <= npsPassive) {
                    return colors.passives;
                }

                return colors.promoters;
            }
        };
    }];
});
