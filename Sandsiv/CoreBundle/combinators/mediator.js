/*global define*/
define(function () {
    'use strict';

    var mediator = {
            subscribers: {},
            subscribe: function (channel, callback) {
                if (typeof callback === 'function') {
                    if (this.subscribers[channel] === undefined) {
                        this.subscribers[channel] = [];
                    }

                    this.subscribers[channel].push(callback);
                }
            },
            publish: function (channel, data) {
                var i;

                if (this.subscribers[channel]) {
                    for (i = 0; i < this.subscribers[channel].length; i +=  1) {
                        this.subscribers[channel][i](data);
                    }
                }
            }
        };

    return {
        subscribe: function (channel, callback) {
            mediator.subscribe(channel, callback);
        },
        publish: function (channel, data) {
            mediator.publish(channel, data);
        }
    };
});
