/*global define*/
define([
    'angular',
    './directive/npsLineDirective',
    './model/npsLinesModel',
    './model/npsLineModel',
    './view/npsLine',
    'css!./style/npsLine.css',
    '../base/base'
], function (
    ng,
    npsLine,
    npsLinesModel,
    npsLineModel,
    View
) {
    'use strict';

    return ng.module('npsLineChart', ['lineChart'])
        .directive('npsLineChart', npsLine)
        .factory('npsLinesModel', npsLinesModel)
        .factory('npsLineModel', npsLineModel)
        .factory('npsLineViewService', View);
});
