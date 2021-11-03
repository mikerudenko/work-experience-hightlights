/*global define*/
define([
    'angular',
    'underscore',
    'd3'
], function (ng, un, d3) {
    'use strict';

    return [function () {
        return function (conf) {
            var self = this,
                model = conf.model;

            self.svg = d3.select(conf.svg);
            self.config = {
                innerRadius: 50,
                arcSize: 20,
                arcSpace: 5,
                arcShadowOpacity: 0.1,
                arcMaskOpacity: 0.3,
                opacityDuration: 500,
                tickStep: 10,
                tickLength: 5,
                tickSpace: 5
            };

            un.extend(self.config, conf.config);

            function translateToMiddle() {
                var x = model.getWidth() / 2,
                    y = model.getHeight() / 2;

                return 'translate(' + x + ',' + y + ')';
            }

            /*jslint unparam: true*/
            function arcInnerRadius(arcData, arcIndex) {
                return arcIndex *
                    (self.config.arcSize + self.config.arcSpace) +
                    self.config.innerRadius;
            }

            function arcOuterRadius(arcData, arcIndex) {
                return arcIndex *
                    (self.config.arcSize + self.config.arcSpace) +
                    self.config.innerRadius + self.config.arcSize;
            }
            /*jslint unparam: false*/

            function arcColor(arcData) {
                return arcData.getColor();
            }

            function onArcClick(arc) {
                self.config.onItemClick(arc);
            }

            function appendArc() {
                /*jshint validthis: true */

                var group;

                group = this.append('g')
                    .attr('class', 'arc');

                group.append('path')
                    .attr({
                        d: self.arcShadow,
                        fill: arcColor,
                        opacity: self.config.arcShadowOpacity,
                        'class': 'arc-shadow'
                    });

                group.append('path')
                    .on({
                        mouseover: self.onArcOver,
                        mouseout: self.onArcOut,
                        click: onArcClick
                    })
                    .attr({
                        d: self.arc,
                        fill: arcColor,
                        'class': 'arc-value'
                    });

                return this;
            }

            function getArcsOuterRadius() {
                var config = self.config;

                return config.innerRadius +
                    (config.arcSize + config.arcSpace) *
                    model.data.length;
            }

            function tickAngel(tick) {
                return self.arcScale(tick) - Math.PI / 2;
            }

            function roundAngel(angel, pow) {
                return parseFloat(angel.toFixed(pow), 10);
            }

            function tickOffset() {
                var config = self.config;

                return getArcsOuterRadius() +
                    config.tickLength + config.tickSpace;
            }

            function appendTick() {
                /*jshint validthis: true */

                var group;

                group = this.append('g')
                    .attr('class', 'tick');

                group.append('line')
                    .attr({
                        x1: function (tick) {
                            return Math.cos(tickAngel(tick)) * getArcsOuterRadius();
                        },
                        x2: function (tick) {
                            return Math.cos(tickAngel(tick)) *
                                (getArcsOuterRadius() + self.config.tickLength);
                        },
                        y1: function (tick) {
                            return Math.sin(tickAngel(tick)) * getArcsOuterRadius();
                        },
                        y2: function (tick) {
                            return Math.sin(tickAngel(tick)) *
                                (getArcsOuterRadius() + self.config.tickLength);
                        },
                        'class': 'tick-line'
                    });

                group.append('text')
                    .attr({
                        x: function (tick) {
                            return Math.cos(tickAngel(tick)) * tickOffset();
                        },
                        y: function (tick) {
                            return Math.sin(tickAngel(tick)) * tickOffset();
                        },
                        'text-anchor': function (tick) {
                            var xAngel = Math.cos(tickAngel(tick));

                            return roundAngel(xAngel, 6) === 0 ? 'middle' : xAngel < 0 ? 'end' : 'start';
                        },
                        'class': 'tick-text'
                    })
                    .text(function (tick) {
                        return tick;
                    });
            }

            function appendNeedle() {
                /*jshint validthis: true */

                this.append('circle')
                    .attr('class', 'multiple-arc-needle-pivot')  
                    .attr('cy', 0)
                    .attr('cx', 0)
                    .attr('r',  getArcsOuterRadius() * 0.05);                                   
                    
                this.append('line')
                    .attr('class', 'multiple-arc-needle-arrow')                    
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', function (tick) { return Math.cos(tickAngel(tick)) * (getArcsOuterRadius() + self.config.tickLength);})
                    .attr('y2', function (tick) { return Math.sin(tickAngel(tick)) * (getArcsOuterRadius() + self.config.tickLength);});
            }

            function getValueArcs() {
                return self.arcs.selectAll('path.arc-value');
            }

            self.init = function () {
                self.arcScale = d3.scale.linear()
                    .domain([0, 100])
                    .range([Math.PI * 1.2, 2.8 * Math.PI]);

                self.tickRange = d3.range(0, 100, self.config.tickStep);
                self.tickRange.push(100);

                self.arcShadow = d3.svg.arc()
                    .innerRadius(arcInnerRadius)
                    .outerRadius(arcOuterRadius)
                    .startAngle(self.arcScale(0))
                    .endAngle(self.arcScale(100));

                self.arc = d3.svg.arc()
                    .innerRadius(arcInnerRadius)
                    .outerRadius(arcOuterRadius)
                    .startAngle(self.arcScale(0))
                    .endAngle(function (arcData) {
                        return self.arcScale(arcData.getPercent());
                    });

                self.arcs = self.svg
                    .append('g')
                    .attr('class', 'multiple-arc')
                    .attr("transform", translateToMiddle);

                self.ticks = self.arcs
                    .append('g')
                    .attr('class', 'ticks');

                self.draw();
            };

            self.onArcOver = function (arcData) {
                var curentType = arcData.getId();

                getValueArcs()
                    .transition()
                    .duration(self.config.opacityDuration)
                    .attr('opacity', function (arcData) {
                        return curentType === arcData.getId() ?
                                1 : self.config.arcMaskOpacity;
                    });
            };

            self.onArcOut = function () {
                getValueArcs()
                    .transition()
                    .duration(self.config.opacityDuration)
                    .attr('opacity', 1);
            };

            self.draw = function () {
                var arcs;

                self.arcs.attr("transform", translateToMiddle);
                arcs = self.arcs.selectAll('.arc')
                    .data(model.data);

                arcs.enter()
                    .call(appendArc);

                arcs.selectAll('.arc-value')
                    .attr('fill', arcColor);

                arcs.selectAll('.arc-shadow')
                    .attr('fill', arcColor);

                self.svg.selectAll('path.arc-value')
                    .transition()
                    .duration(1000)
                    .attr('d', self.arc);

                self.ticks
                    .selectAll('.tick')
                    .data(self.tickRange)
                    .enter()
                    .call(appendTick);

                self.arcs
                    .append('g')
                    .attr('class', 'multiple-arc-needle')
                    .selectAll('.multiple-arc-needle')
                    .data(model.targetPoint ? [model.targetPoint] : [])
                    .enter()
                    .call(appendNeedle);
            };

            self.getColorAreas = function () {
                return self.arcs.selectAll('.arc-value');
            };

            self.destroy = ng.noop;
        };
    }];
});
