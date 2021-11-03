/*global define*/
define([
    'd3'
], function (d3) {
    'use strict';

    return [function () {
        return function (texts) {
            var map = [];

            function spread() {
                function isOverlap(bb1, bb2) {
                    bb2.y1 = bb2.y + bb2.height;
                    bb1.y1 = bb1.y + bb1.height;

                    return !(bb1.y1 < bb2.y ||
                        bb1.y > bb2.y1);
                }

                /*jslint unparam:true*/
                texts.each(function (text, itemIndex, index) {
                    var textEl = d3.select(this),
                        sign;

                    if (!map[index]) {
                        map[index] = {
                            y: parseFloat(textEl.attr('y'), 10),
                            height: this.getBBox().height
                        };
                    }
                    texts.each(function (itext, oIndex, iIndex) {
                        var itemEl = d3.select(this);

                        if (!map[iIndex]) {
                            map[iIndex] = {
                                y: parseFloat(itemEl.attr('y'), 10),
                                height: this.getBBox().height
                            };
                        }
                        if (iIndex === index) {
                            return;
                        }
                        if (textEl.attr("text-anchor") !== itemEl.attr("text-anchor")) {
                            return;
                        }
                        if (isOverlap(map[index], map[iIndex])) {
                            sign = map[index].y - map[iIndex].y >= 0 ? -1 : 1;
                            map[index].y +=  sign * -0.5;
                            map[iIndex].y += sign * 0.5;
                            spread();
                        }

                    });
                });
                /*jslint unparam:false*/

                return texts;
            }

            spread();

            return map;
        };
    }];
});
