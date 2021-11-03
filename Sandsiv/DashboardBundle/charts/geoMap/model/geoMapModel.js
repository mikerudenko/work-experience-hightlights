/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return ['countryModel', 'baseModel', function (CountryModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);

            self.type = 'geoMap';
            self.data = [];
            self.LOW_SCORE_COLOR_ID = 'low_nps_score';
            self.MEDIUM_SCORE_COLOR_ID = 'medium_nps_score';
            self.HIGH_SCORE_COLOR_ID = 'high_nps_score';

            self.add = function (countryData) {
                var countryModel = new CountryModel(countryData);

                self.data.push(countryModel);

                return countryModel;
            };

            self.last = function () {
                return self.data[self.data.length - 1];
            };

            self.getAt = function (index) {
                return self.data[index];
            };

            self.find = function (id) {
                return un.find(self.data, function (country) {
                    return country.getId() === id;
                });
            };

            self.getLowCountries = function () {
                return un.filter(self.data, function (country) {
                    return country.getScore() <= 0;
                });
            };

            self.getMediumCountries = function () {
                return un.filter(self.data, function (country) {
                    var score = country.getScore();
                    return score > 0 && score <= 40;
                });
            };

            self.getHighCountries = function () {
                return un.filter(self.data, function (country) {
                    return country.getScore() > 40;
                });
            };

            self.getLowScoreColor = function () {
                return un.chain(self.persistedColors)
                         .findWhere({key: self.LOW_SCORE_COLOR_ID})
                         .result('value')
                         .value();
            };

            self.getMediumScoreColor = function () {
                return un.chain(self.persistedColors)
                         .findWhere({key: self.MEDIUM_SCORE_COLOR_ID})
                         .result('value')
                         .value();
            };

            self.getHighScoreColor = function () {
                return un.chain(self.persistedColors)
                         .findWhere({key: self.HIGH_SCORE_COLOR_ID})
                         .result('value')
                         .value();
            };
        };
    }];
});
