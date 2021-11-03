/*global define*/
define([
    'angular',
    './service/chartProxyService',
    './service/npsColorService',
    './service/axisService',
    './service/gridService',
    './service/layoutVerticalStackService',
    './service/grouperService',
    './service/scaleThinningService',
    './service/axisLabelService',
    './service/labelGetterService',
    './service/chartViewConfigProvider',
    './service/chartColorPickerService',
    './service/textLengthService',
    './service/axisFactory',
    './service/helperService',
    './filter/contrastColor',
    './model/baseModel',
    './model/modelPrototype',
    './model/npsModel',
    './model/npsModelItem',
    './chartConstant',
    './config',
    '../../textEditor/textEditor',
    '../../colorEditor/colorEditor',
    '../../listOrder/listOrder'
], function (
    ng,
    chartProxyService,
    npsColorService,
    axisService,
    gridService,
    layoutVerticalStackService,
    grouperService,
    scaleThinningService,
    axisLabelService,
    labelGetterService,
    chartViewConfigProvider,
    chartColorPickerService,
    textLengthService,
    axisFactory,
    helperService,
    contrastColor,
    baseModel,
    modelPrototype,
    npsModel,
    npsModelItem,
    chartConstant,
    config
) {
    'use strict';

    return ng.module('baseChart', ['textEditor', 'visual.colorEditor', 'visual.listOrder'])
        .service('chartProxyService', chartProxyService)
        .service('npsColorService', npsColorService)
        .factory('axisService', axisService)
        .factory('gridService', gridService)
        .filter('contrastColor', function contrastColorProvider() { return contrastColor; })
        .factory('layoutVerticalStackService', layoutVerticalStackService)
        .factory('grouperService', grouperService)
        .factory('scaleThinningService', scaleThinningService)
        .factory('axisLabelService', axisLabelService)
        .service('labelGetterService', labelGetterService)
        .provider('chartViewConfig', chartViewConfigProvider)
        .service('chartColorPickerService', chartColorPickerService)
        .service('textLengthService', textLengthService)
        .service('helperService', helperService)
        .provider('axisFactory', axisFactory)
        .factory('baseModel', baseModel)
        .factory('npsModel', npsModel)
        .factory('npsModelItem', npsModelItem)
        .constant('chartConstant', chartConstant)
        .constant('modelPrototype', modelPrototype)
        .config(config);
});
