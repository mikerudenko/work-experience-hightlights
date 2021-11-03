/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return ['bubbleModel', 'baseModel', function (BubbleModel, base) {
        return function () {
            var self = this;

            base.apply(self, arguments);

            self.type = 'bubble';
            self.data = [];

            self.add = function (lineData) {
                var bubbleItem = new BubbleModel(lineData);

                self.data.push(bubbleItem);

                return bubbleItem;
            };

            self.last = function () {
                return self.data[self.data.length - 1];
            };

            self.getByLabel = function(label) {
                var currentItem;

                self.data.forEach((x)=>{
                   if(x.label === label && x.color) {
                       currentItem = x;
                   }
                });

                return currentItem;
            };

            self.getAt = function (index) {
                return self.data[index];
            };


            self.getGroup = function (label) {
                var items = [];

                self.data.forEach(function (item) {
                    if(item.label === label) {
                        items.push(item);
                    }
                });

                return items;
            };

            self.getMinScore = function () {
                return un.min(self.data, function (bubble) {
                    return bubble.getScore();
                }).getScore();
            };

            self.getMaxScore = function () {
                return un.max(self.data, function (bubble) {
                    return bubble.getScore();
                }).getScore();
            };

            self.getMinValue = function () {
                return un.min(self.data, function (bubble) {
                    return bubble.getValue();
                }).getValue();
            };

            self.getMaxValue = function () {
                return un.max(self.data, function (bubble) {
                    return bubble.getValue();
                }).getValue();
            };

            self.getMaxCount = function () {
                return un.max(self.data, function (bubble) {
                    return bubble.getCount();
                }).getCount();
            };
        };
    }];
});
