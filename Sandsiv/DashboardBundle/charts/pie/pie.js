/*global define*/
define([
    'angular',
    './directive/pieDirective',
    './model/pieModel',
    './model/pieItemModel',
    './service/pieLabelSpreadService',
    './view/pie',
    '../base/base'
], function (ng, pie, model, itemModel, labelSpread, pieView) {
    'use strict';

    return ng.module('pieChart', ['baseChart'])
        .directive('pieChart', pie)
        .factory('pieModel', model)
        .factory('pieItemModel', itemModel)
        .factory('pieLabelSpreadService', labelSpread)
        .factory('pieViewService', pieView);
});
