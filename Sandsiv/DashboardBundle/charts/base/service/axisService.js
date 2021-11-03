/*global define*/
define([
    'd3',
    'underscore',
    'angular'
], function(d3, un, ng) {
    'use strict';

    return ['textLengthService', function(textLengthService) {
        function Axis(config) {
            var self = this,
                defaults;

            const OFFSET_X_TICK = 10;

            defaults = {
                orient: 'bottom',
                ticks: 5,
                tickSize: 5,
                ellipseText: '..',
                rotate: null,
                onRound: ng.noop,
                annotateScoreFlag: false
            };

            un.defaults(config, defaults);

            function validateTextSize(value) {
                /*jshint validthis: true */

                if (config.tickFormat) {
                    value = config.tickFormat.apply(this, arguments);
                }

                this.textContent = value;

                if (this.getComputedTextLength() > config.textSize) {
                    config.onRound.call(this, value, true);

                    return textLengthService.trimByWidth({
                        value,
                        font: getFontConfigString(),
                        maxWidth: config.textSize
                    });
                }

                config.onRound.call(this, value, false);

                return value;
            }

            function rotate90() {
                /*jshint validthis: true */

                this.selectAll('.tick text')
                    .attr({
                        x: function() {
                            return config.annotateScoreFlag ? Number(d3.select(this).attr('y')) + OFFSET_X_TICK : +d3.select(this).attr('y');
                        },
                        y: 0,
                        'dy': '0.29em'
                    })
                    .style('text-anchor', 'start');
            }

            function rotate() {
                /*jshint validthis: true */

                var rotateOn = config.rotate;

                this.selectAll('.tick text')
                    .attr('transform', 'rotate({0})'.format(rotateOn));

                if (rotateOn === 90) {
                    this.call(rotate90);
                }
            }

            self.axis = d3.svg.axis()
                .scale(config.scale)
                .orient(config.orient)
                .ticks(config.ticks)
                .tickSize(config.tickSize)
                .tickFormat(config.tickFormat)
                .tickValues(config.tickValues);

            if (config.textSize) {
                self.axis.tickFormat(validateTextSize);
            }

            self.axisFn = function() {
                this.call(self.axis);
                if (config.rotate) {
                    this.call(rotate);
                }
            };
        }

        function getFontConfigString() {
            return "12px \"Helvetica Neue\",Helvetica,Arial,sans-serif";
        }

        function getTickWidth(tick) {
            return textLengthService.getTextWidth(tick, getFontConfigString());
        }

        function getMaxTickLength(ticksData) {
            let maxWidth = 0;

            ticksData.forEach(tickDataItem => {
                let width = getTickWidth(tickDataItem.label);

                if (width > maxWidth) {
                    maxWidth = width;
                }
            });

            return maxWidth;
        }

        Axis.rotateTicks = function({ticksCount, chartWidth, xAxisView}) {
            if (!chartWidth) {
                return;
            }

            const TICK_PADDINGS = 5;
            let avaliableHorizontalWidth = Math.ceil(chartWidth / ticksCount) - TICK_PADDINGS,
                ticks = xAxisView.selectAll('.tick text'),
                ticksData = ticks.data(),
                maxTickWidth = getMaxTickLength(ticksData),
                transformValue = 'rotate(0) translate(-10, 15)';

            const maxSizeBeforeRotate = 60;

            if (maxTickWidth > avaliableHorizontalWidth
            ) {
                transformValue = 'rotate(90)';
            }

            ticks
                .attr('transform', transformValue)
                .text(data => {
                    let mustTrimHorizontally = maxTickWidth > avaliableHorizontalWidth && maxTickWidth <= maxSizeBeforeRotate,
                        mustTrimVertically = transformValue === 'rotate(90)',
                        conditionToTrim = mustTrimVertically;

                    let config = {
                        text: data.label,
                        font: getFontConfigString()
                    };


                    return conditionToTrim
                        ? textLengthService.trimByWidth(config)
                        : data.label;
                });

            ticks.style('text-anchor', (data) => {
                    return transformValue === 'rotate(90)' ? 'start' : 'middle'
                });
        };

        return Axis;
    }];
});
