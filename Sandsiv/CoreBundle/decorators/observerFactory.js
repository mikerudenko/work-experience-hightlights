/*global define*/
define(function () {
    'use strict';

    function indexOfListener(listeners, fn, scope) {
        var i = 0;

        if (!listeners.length) {
            return -1;
        }

        while (listeners[i].fn !== fn || listeners[i].scope !== scope) {
            if (i === listeners.length - 1) {
                return -1;
            }
            i += 1;
        }

        return i;
    }

    function on(event, fn, scope) {
        /*jshint validthis: true */
        var self = this,
            key;

        if (typeof event !== 'string') {
            for (key in event) {
                if (event.hasOwnProperty(key) && key !== 'scope') {
                    if (typeof event[key] === 'function') {
                        self.on(key, event[key], event.scope);
                    } else {
                        self.on(key, event[key].fn, event[key].scope);
                    }
                }
            }

            return this;
        }

        if (!self.listeners[event]) {
            self.listeners[event] = [];
        }

        self.listeners[event].push({
            fn: fn,
            scope: scope
        });

        return this;
    }

    function off(event, fn, scope) {
        /*jshint validthis: true */
        var self = this,
            index = -1,
            key;

        if (typeof event !== 'string') {
            for (key in event) {
                if (event.hasOwnProperty(key) && key !== 'scope') {
                    if (typeof event[key] === 'function') {
                        self.off(key, event[key], event.scope);
                    } else {
                        self.off(key, event[key].fn, event[key].scope);
                    }
                }
            }

            return this;
        }

        index = indexOfListener(self.listeners[event], fn, scope);

        if (index !== -1) {
            self.listeners[event].splice(index, 1);
        }

        return this;
    }

    function trigger(event) {
        /*jshint validthis: true */
        var listeners = this.listeners[event] || [],
            arg = Array.prototype.slice.call(arguments, 1),
            i;

        for (i = 0; i < listeners.length; i += 1) {
            listeners[i].fn.apply(listeners[i].scope, arg);
        }

        return this;
    }

    return [function () {
        return function () {
            var self = this;

            self.listeners = {};
            self.on = on;
            self.off = off;
            self.trigger = trigger;

            return self;
        };
    }];
});
