/*global define*/
define([
    'angular',
    './directive/npsBarDirective',
    './model/npsBarModel',
    './view/npsBarView',
    '../bar/bar'
], function (
    ng,
    npsBar,
    model,
    view
) {
    'use strict';

    return ng.module('npsBarChart', ['barChart'])
        .directive('npsBarChart', npsBar)
        .factory('npsBarModel', model)
        .service('npsBarViewService', view);
});
