/*global define*/
define([
    'angular',
    './directive/wordCloudDirective',
    './model/wordCloudModel',
    './model/wordModel',
    './view/wordCloud',
    '../base/base'
], function (ng, wordCloud, model, wordModel, wordCloudView) {
    'use strict';

    return ng.module('wordCloudChart', ['baseChart'])
        .directive('wordCloudChart', wordCloud)
        .factory('wordCloudModel', model)
        .factory('wordModel', wordModel)
        .factory('wordCloudViewService', wordCloudView);
});
