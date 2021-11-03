/*global define*/
define([
    'angular',
    './directive/bubbleDirective',
    './model/bubblesModel',
    './model/bubbleModel',
    './view/bubble',
    'css!./style/bubble.css',
    '../base/base'
], function (
    ng,
    bubble,
    bubblesModel,
    bubbleModel,
    View
) {
    'use strict';

    return ng.module('bubbleChart', ['baseChart'])
        .directive('bubbleChart', bubble)
        .factory('bubblesModel', bubblesModel)
        .factory('bubbleModel', bubbleModel)
        .factory('bubbleViewService', View);
});
