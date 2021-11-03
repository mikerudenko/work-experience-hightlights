/*global define*/
define([
    'angular',
    './directive/lineDirective',
    './model/linesModel',
    './model/lineModel',
    './service/lineGrouperService',
    './view/line',
    'css!./style/line.css',
    '../base/base'
], function (
    ng,
    line,
    linesModel,
    lineModel,
    lineGrouperService,
    View
) {
    'use strict';

    return ng.module('lineChart', ['baseChart'])
        .directive('lineChart', line)
        .factory('linesModel', linesModel)
        .factory('lineModel', lineModel)
        .factory('lineGrouperService', lineGrouperService)
        .factory('lineViewService', View);
});
