/*global define*/
define(function () {
    'use strict';

    return function () {
        var smallWidth,
            hugeWidth,
            self = this;

        self.smallWidth = function (width) {
            smallWidth = width;
        };

        self.hugeWidth = function (width) {
            hugeWidth = width;
        };

        self.$get = [function () {
            var sizes;

            sizes = {
                small: {
                    axes: {
                        bottom: {
                            ticks: 5
                        }
                    }
                },
                normal: {
                    axes: {
                        bottom: {
                            ticks: 10
                        }
                    }
                },
                huge: {
                    axes: {
                        bottom: {
                            ticks: 20
                        }
                    }
                }
            };

            this.get = function (size) {
                return sizes[size <= smallWidth ? 'small' :
                        size >= hugeWidth ? 'huge' : 'normal'];
            };

            return this;
        }];
    };
});
