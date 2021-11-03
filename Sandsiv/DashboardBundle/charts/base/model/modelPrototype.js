/*global define*/
define(function () {
    'use strict';

    return {
        getId: function () {
            return this.id;
        },

        getLabel: function () {
            return this.label;
        },

        setLabel: function (label) {
            this.label = label;
        },

        getData: function () {
            return this.data;
        },

        getColor: function () {
            return this.color;
        },

        setColor: function (color) {
            this.color = color;
        }
    };
});
