/*global define*/
define([
    'angular',
    './directive/radarDirective',
   './model/radarModel',
    './model/radarItemModel',
    './view/radarRendering',
    '../base/base'
], function (ng, radar, model, itemModel, radarRendering) {
    'use strict';

    return ng.module('radarChart', ['baseChart'])
        .directive('radarDir', radar)
        .factory('radarModel', model)
        .factory('radarItemModel', itemModel)
        .factory('radarRend', radarRendering);
});
