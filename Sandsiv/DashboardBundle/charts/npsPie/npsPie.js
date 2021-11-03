/*global define*/
define([
    'angular',
    './directive/npsPieDirective',
    './model/npsPieModel',
    '../pie/pie'
], function (ng, pie, model) {
    'use strict';

    return ng.module('npsPieChart', ['pieChart'])
        .directive('npsPieChart', pie)
        .factory('npsPieModel', model);
});
