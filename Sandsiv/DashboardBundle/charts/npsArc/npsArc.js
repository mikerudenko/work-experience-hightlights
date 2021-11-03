/*global define*/
define([
    'angular',
    './directive/npsArcDirective',
    './model/npsArcModel',
    './model/npsArcItemModel',
    './view/npsArc',
    'css!./style/npsArc.css',
    '../base/base'
], function (ng, npsArc, model, itemModel, npsArcView) {
    'use strict';

    return ng.module('npsArcChart', ['baseChart'])
        .directive('npsArcChart', npsArc)
        .factory('npsArcModel', model)
        .factory('npsArcItemModel', itemModel)
        .factory('npsArcViewService', npsArcView);
});
