/*global define*/
define([
    'angular',
    './directive/horizontalStackedBarDirective',
    './view/horizontalStackedBar',
    'css!./style/horizontalStackedBar.css',
    '../npsStackedBar/npsStackedBar'
], function (
    ng,
    directive,
    View
) {
    'use strict';

    return ng.module('horizontalStackedBarChart', ['npsStackedBarChart'])
        .directive('horizontalStackedBarChart', directive)
        .factory('horizontalStackedBarViewService', View);
});
