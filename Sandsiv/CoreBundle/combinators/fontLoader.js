/*global define*/
/*global document*/
/*global WebFont*/
/*global setTimeout*/
define([
    'jquery',
    'fontLoader'
], function ($) {
    'use strict';

    var font = {},
        fontConfig = {},
        fontManager;

    fontManager = {
        setFamilies: function (config, prefix) {
            fontConfig[prefix] = {
                families: Array.prototype.concat([], config.families),
                urls: Array.prototype.concat([], config.url || '')
            };
        },

        loadFont: function () {
            WebFont.load(fontConfig);
        },

        forceApplyFont: function (font) {
            var fakeEl = $('<span>').hide().appendTo(document.body);

            fakeEl.text('initialize').css('font-family', font);
            setTimeout(function () {
                fakeEl.remove();
            }, 10);
        },

        load: function (config) {
            font = config;
            fontManager.loadFont();
            fontManager.forceApplyFont(config.name);
        },

        getName: function () {
            return font.name;
        }
    };

    return {
        custom: function (config) {
            fontManager.setFamilies(config, 'custom');
            fontManager.load(config);
        },

        google: function (config) {
            fontManager.setFamilies(config, 'google');
            fontManager.load(config);
        },

        getName: fontManager.getName
    };
});
