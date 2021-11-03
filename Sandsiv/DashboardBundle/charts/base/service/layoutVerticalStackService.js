/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return [function () {
        return function constructor() {
            var getter,
                yGetter,
                xGetter;

            function stack(data) {
                un.each(data, function (item, index) {
                    var offset = 0;

                    un.each(getter(item, index), function (subItem, subIndex, items) {
                        subItem.y = yGetter(subItem);
                        offset += subIndex ? items[subIndex - 1].y : 0;
                        subItem.y0 = offset;
                        subItem.x = xGetter(subItem, subIndex, item);
                    });
                });

                return data;
            }

            stack.values = function (getterFn) {
                getter = getterFn;

                return this;
            };

            stack.y = function (yFn) {
                yGetter = yFn;

                return this;
            };

            stack.x = function (xFn) {
                xGetter = xFn;

                return this;
            };

            return stack;
        };
    }];
});
