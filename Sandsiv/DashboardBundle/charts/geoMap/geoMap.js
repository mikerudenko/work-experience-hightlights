/*global define*/
define([
    'angular',
    './directive/geoMapDirective',
    './model/geoMapModel',
    './model/countryModel',
    './view/geoMap',
    'css!./style/geoMap.css',
    '../base/base'
], function (
    ng,
    geoMap,
    geoMapModel,
    countryModel,
    View
) {
    'use strict';

    return ng.module('geoMapChart', ['baseChart'])
        .directive('geoMapChart', geoMap)
        .factory('geoMapModel', geoMapModel)
        .factory('countryModel', countryModel)
        .factory('geoMapViewService', View);
});
