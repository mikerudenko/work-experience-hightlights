/*global define*/
define([
    'underscore',
    'core/stringFormat'
], function(un) {
    'use strict';

    return ['$document', function($document) {
        var self = this,
            constantTickTextWidth = 70;

        self.getTextWidth = function(text, font) {
            let canvas = self.getTextWidth.canvas || (self.getTextWidth.canvas = document.createElement("canvas"));
            let context = canvas.getContext("2d");
            context.font = font;
            let metrics = context.measureText(text);
            return Math.round(metrics.width);
        };

        self.trimByWidth = function({text, font, maxWidth = constantTickTextWidth}) {
            let finalText = '';
            let finalWidth;
            let dotsLength = 10;

            for (let char of String(text)) {
                finalText += char;
                finalWidth = self.getTextWidth(finalText, font);

                if (finalWidth > (maxWidth - dotsLength)) {
                    finalText += '...';
                    return finalText;
                }
            }

            return finalText;
        };

        self.maxTextsLength = function(collection, textGetter) {
            return constantTickTextWidth;
        };
    }];
});


