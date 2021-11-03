/*global define*/
define(function () {
    'use strict';

    return ['npsArcItemModel', 'baseModel', function (ItemModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);
            self.type = 'npsArc';
            self.data = [];

            self.addItem = function (item) {
                var itemModel = new ItemModel(item);

                self.data.push(itemModel);
            };

            self.last = function () {
                return self.data[self.data.length - 1];
            };
        };
    }];
});
