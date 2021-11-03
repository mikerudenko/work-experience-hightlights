/*global define*/
define([
    'angular',
    './directive/npsStackedBarDirective',
    './model/npsStackedBarModel',
    './model/npsStackedBarGroupModel',
    './model/npsStackedBarItemModel',
    './view/npsStackedBar',
    'css!./style/npsStackedBar.css',
    '../base/base'
], function (
    ng,
    directive,
    model,
    groupModel,
    itemModel,
    View
) {
    'use strict';

    return ng.module('npsStackedBarChart', ['baseChart'])
        .directive('npsStackedBarChart', directive)
        .factory('npsStackedBarModel', model)
        .factory('npsStackedBarGroupModel', groupModel)
        .factory('npsStackedBarItemModel', itemModel)
        .factory('npsStackedBarViewService', View);
});
