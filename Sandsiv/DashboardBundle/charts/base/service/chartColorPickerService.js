/*global define*/
define(['d3', 'angular'], function (d3, angular) {
    'use strict';

    function cancelDefaultMenu() {
        d3.event.preventDefault();
    }

    function before(subject) {
        return function(decorator) {
            return function() {
                decorator.apply(this, arguments);

                return subject.apply(this, arguments);
            };
        };
    }

    return ['colorEditorFactory', function (colorEditorFactory) {
        var self = this;

        self.cancelDefaultMenuBefore = function(subject) {
            return before(subject)(cancelDefaultMenu);
        };

        self.show = function (el, color, changeCallback, onClose) {
            /*jshint shadow: true */
            var onClose = onClose || angular.noop;
            /*jshint shadow: false */
            var ctrl = colorEditorFactory
                .create(el, color)
                .controller;

            function onDestroy() {
                ctrl.off({
                    destroy: onDestroy,
                    change: changeCallback
                });
                onClose();
            }

            ctrl.on({
                destroy: onDestroy,
                change: changeCallback
            });
        };
    }];
});
