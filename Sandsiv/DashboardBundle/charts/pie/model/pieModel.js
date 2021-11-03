/*global define*/
define(function () {
    'use strict';

    return ['pieItemModel', 'baseModel', function (ItemModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);

            self.type = 'pie';
            self.data = [];

            self.addItem = function (item) {
                var itemModel = new ItemModel(item);

                self.data.push(itemModel);
            };

            self.last = function () {
                return self.data[self.data.length - 1];
            };

            self.move = function (index, moveTo) {
                var slice = self.data;

                slice.splice(moveTo, 0, slice.splice(index, 1)[0]);
            };
        };
    }];
});
