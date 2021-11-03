/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return ['wordModel', 'baseModel', function (ItemModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);

            self.type = 'wordCloud';
            self.data = [];

            self.addItem = function (item) {
                var itemModel = new ItemModel(item);

                self.data.push(itemModel);
                return itemModel;
            };

            self.last = function () {
                return self.data[self.data.length - 1];
            };

            self.maxScore = function () {
                return un.max(self.data, function (word) {
                    return word.score();
                }).score();
            };

            self.count = function () {
                return self.data.length;
            };
        };
    }];
});
