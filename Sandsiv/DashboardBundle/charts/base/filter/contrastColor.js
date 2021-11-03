/*global define*/
define([], function () {
    'use strict';

    function dotProduct(a, b) {
        /*jshint validthis: true */

        function summ(a, b) {
            return a + b;
        }

        function multiply(value, index) {
            return value * this[index];
        }

        return a.map(multiply.bind(b)).reduce(summ, 0);
    }

    function hexToDecimal(hex) {        
        return parseInt(hex, 16);
    }

    function contrastColor(hexcolor) {
        var LUMINANCE_THRESHOLD = 128,        
            YIQ_COEFFICIENTS = [299, 587, 114],
            colorComponents = hexcolor.match(/.{1,2}/g).map(hexToDecimal),
            luminance = dotProduct(YIQ_COEFFICIENTS, colorComponents) / 1000;
   
        return (luminance >= LUMINANCE_THRESHOLD) ? 'black' : 'white';
    }
   
    return contrastColor;
});
