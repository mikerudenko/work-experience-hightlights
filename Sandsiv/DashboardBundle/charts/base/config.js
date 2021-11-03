/*global define*/
define(function () {
    'use strict';

    return ['chartViewConfigProvider', function (chartViewConfigProvider) {
        chartViewConfigProvider.smallWidth(350);
        chartViewConfigProvider.hugeWidth(600);
    }];
});
