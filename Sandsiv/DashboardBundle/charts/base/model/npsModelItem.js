/*global define*/
define([
    'underscore'
], function (un) {
    'use strict';

    return ['modelPrototype', function (prototype) {
        var proto = un.clone(prototype);

        function constructor(config) {
            /*jshint validthis: true */
            var self = this,
                detractors = 0,
                promoters = 0;
            function complementNpsObject(barParts) {
                var newBarParts,
                    isNPS = false,
                    mockNpsObject = [
                        {
                            "id": "Detractors",
                            "label": "Detractors",
                            "percent": 0,
                            "count": 0,
                            "value": "Detractors"
                        },
                        {
                            "id": "Passives",
                            "label": "Passives",
                            "percent": 0,
                            "count": 0,
                            "value": "Passives"
                        },
                        {
                            "id": "Promoters",
                            "label": "Promoters",
                            "percent": 0,
                            "count": 0,
                            "value": "Promoters"
                        }
                    ];
                newBarParts = mockNpsObject.map(function (obj) {
                    var currentObject = null;
                    barParts.forEach(function (barObj) {
                        if (typeof barObj.id === "string" && barObj.id.toLowerCase() === obj.id.toLowerCase()) {
                            currentObject = barObj;
                            isNPS = true;
                        }
                    });
                    return (currentObject ? currentObject : obj);
                });
                if (isNPS) {
                    return newBarParts;
                } else {
                    return null;
                }
            }

            if (config.barParts.length <= 3) {
                if (complementNpsObject(config.barParts)) {
                    config.barParts = complementNpsObject(config.barParts);
                    detractors = config.barParts[0].percent;
                    promoters = config.barParts[2].percent; 
                }
            }
            self.id = config.id;
            self.label = config.label;
            self.score = promoters - detractors;
            self.count = 0;
            config.barParts.forEach(function (barPart) {
                self.count += barPart.count;
            });

        }

        constructor.prototype = proto;

        proto.getScore = function () {
            return this.score;
        };

        proto.getCount = function () {
            return this.count;
        };

        return constructor;
    }];
});
