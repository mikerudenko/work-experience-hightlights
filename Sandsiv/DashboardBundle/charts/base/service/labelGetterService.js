/*global define*/
define([
    'underscore'
], function(un) {
    'use strict';

    return [function() {

        this.getValue = function(labels, key, type) {
            var label = un.findWhere(labels, {key: key, type: type}) ||
                un.findWhere(labels, {key: String(key), type: type}) ||             // server type coercion
                un.findWhere(labels, {key: String(key).toLowerCase(), type: type}); // server normalization

            return (label && label.value);
        };
    }];
});
