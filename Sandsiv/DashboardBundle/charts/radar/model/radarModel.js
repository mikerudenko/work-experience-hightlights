/*jshint ignore: start */
define(function () {
    'use strict';

    return ['radarItemModel', 'baseModel', function (ItemModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);
            self.type = 'radar';
            self.data = [];

            self.addItem = function (item) {
                var itemModel = new ItemModel(item);

                self.data.push(itemModel);
            };

            self.height = 420;

            self.getHeight = function(){
                return self.height;
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
/*jshint ignore: end */
