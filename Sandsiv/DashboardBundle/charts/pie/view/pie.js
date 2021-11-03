/*global define*/
define([
    'angular',
    'd3',
    'core/i18n',
    'text!./pieTooltipTemplate.html',
    'mustache'
], function (ng, d3, i18n, pieTooltipTemplate, mustache) {
    'use strict';

    return ['tooltipService', function (tooltip) {
        return function (conf) {
            var model = conf.model,
                self = this,
                svg,
                group,
                pie,
                arc,
                isChartMathFunction = ['average', 'median', 'variance'].includes(conf.config.totalConfig.function),
                totalGroup;

            svg = d3.select(conf.svg);

            self.config = {
                borderOffset: 50,
                sideOffset: 80,
                minInnerRadius: 50,
                tickOffset: 5,
                tickSize: 15,
                labelDelimiter: '%',
                totalConfig: {
                    label: i18n.trans('Total'),
                    value: 0,
                    valueDelimiter: ''
                }
            };

            ng.extend(self.config, conf.config);

            self.onItemOver = function (overModel) {
                group.selectAll('.arc')
                    .transition()
                    .attr('opacity', function (itemModel) {
                        if (overModel.data === itemModel.data) {
                            d3.select(this)
                                .select('.label')
                                .attr('opacity', 1);

                            return 1;
                        }

                        return 0.1;
                    });

                    group.selectAll('.arc').on('mouseover', function(){
                        if(isChartMathFunction) {
                            let tooltipContent =  mustache.render(pieTooltipTemplate, {
                                mathFuncLabel: conf.config.totalConfig.function,
                                mathFuncValue: conf.config.totalConfig.value,
                                count: overModel.data.getCount(),
                                percent:overModel.data.getPercent()*100 + '%',
                            });

                            tooltip.show(d3.event, tooltipContent);
                        }
                    });
            };

            function labelOpacity(pie) {
                return pie.data.getPercent() > 0.04 ? 1 : 0;
            }

            self.onItemOut = function () {
                group.selectAll('.arc')
                    .transition()
                    .attr('opacity', 1);

                group.selectAll('.arc').on('mouseout', function(){
                        if(isChartMathFunction) {
                            tooltip.hide();
                        }
                    });

                group.selectAll('.label')
                    .attr('opacity', labelOpacity);
            };

            function totalEnter() {
                /*jshint validthis: true */

				let calculateTextConfigMathrLabel = function(text) {
					let baseFontSize = 60,
						baseTopOffset = 0.37,
						pieWidth = getPieDiameter(),
						piePaddings = 20,
						validLabel = false;

					while (!validLabel) {
						text = text.attr('dy', baseTopOffset + 'em')
							.style('font-size', baseFontSize + 'px');

						if (text.node().getComputedTextLength() < pieWidth - piePaddings) {
							validLabel = true;
						} else {
							baseFontSize--;
							baseFontSize -= 0.1;
						}
					}
				};

                if(!isChartMathFunction) {
                    this.append('text')
                    .attr('class', 'total-label')
                    .attr('text-anchor', 'middle')
                    .text(function (totalConfig) {
                        return totalConfig.label;
                    });
                }

				let textNode = this.append('text')
					.attr('dy', '1.5em')
					.style('font-size', '12px')
					.attr("class", isChartMathFunction ? 'pie-chart-math-function-text' : '')
					.attr('text-anchor', 'middle')
					.text(function(totalConfig) {
						return totalConfig.value + totalConfig.valueDelimiter;
					});

				if (isChartMathFunction) {
					calculateTextConfigMathrLabel(textNode);
				}
            }

            function getPieDiameter() {
                var heigth = model.getHeight(),
                    size = Math.min(model.getWidth(), heigth),
                    offset = size < heigth ? self.config.sideOffset : self.config.borderOffset;

                return size - offset * 2;
            }

            function getPieRadius() {
                return getPieDiameter() / 2;
            }

            function onItemClick(pieItem) {
                self.config.onItemClick(pieItem.data);
            }

            function arcColor(pieItem) {
                return pieItem.data.getColor();
            }

            function piePathEnter() {
                /*jshint validthis: true */

                this
                    .append("path")
                    .on('mouseover', self.onItemOver)
                    .on('mouseout', self.onItemOut)
                    .on('click', onItemClick);

                return this;
            }

            function piePathUpdate() {
                /*jshint validthis: true */

                this
                    .select('path')
                    .transition()
                    .duration(500)
                    .attr("fill", arcColor)
                    .attr('d', arc);

                return this;
            }

            function getMidAngle(pieItem) {
                var centroid = arc.centroid(pieItem);

                return Math.atan2(centroid[1], centroid[0]);
            }

            function lineX1(pieItem) {
                var tick = getPieRadius() + self.config.tickOffset;

                return Math.cos(getMidAngle(pieItem)) * tick;
            }

            function lineY1(pieItem) {
                var tick = getPieRadius() + self.config.tickOffset;

                return Math.sin(getMidAngle(pieItem)) * tick;
            }

            function lineX2(pieItem) {
                var endX = getPieRadius() + self.config.tickSize + self.config.tickOffset;

                return Math.cos(getMidAngle(pieItem)) * endX;
            }

            function lineY2(pieItem) {
                var endY = getPieRadius() + self.config.tickSize + self.config.tickOffset;

                return Math.sin(getMidAngle(pieItem)) * endY;
            }

            function textX(pieItem) {
                var x = lineX2(pieItem),
                    sign = (x > 0) ? 1 : -1;

                return x + (5 * sign);
            }

            function lineChange() {
                /*jshint validthis: true */

                this
                    .attr('x1', lineX1)
                    .attr('y1', lineY1)
                    .attr('x2', lineX2)
                    .attr('y2', lineY2);

                return this;
            }

            function textChange() {
                /*jshint validthis: true */

                this
                    .select('text')
                    .attr('x', textX)
                    .attr('y', lineY2)
                    .attr('text-anchor', function (pieItem) {
                        var x = Math.cos(getMidAngle(pieItem));

                        return (x > 0) ? 'start' : 'end';
                    });

                return this;
            }

            function pieLabelTextEnter() {
                /*jshint validthis: true */

                this.append('text')
                    .attr('class', 'label-text')
                    .text(function (pieItem) {
                        return d3.format('.1%')(pieItem.data.getPercent());
                    })
                    .call(textChange);
            }

            function pieLabelTextUpdate() {
                /*jshint validthis: true */

                this.call(textChange);

                return this;
            }

            function pieLabelTickEnter() {
                /*jshint validthis: true */

                this
                    .append("line")
                    .attr('class', "label-line")
                    .call(lineChange);

                return this;
            }

            function pieLabelTickUpdate() {
                /*jshint validthis: true */

                this
                    .select('line')
                    .transition()
                    .duration(500)
                    .call(lineChange)
                    .attr('y2', lineY2);
            }

            function pieLabelEnter() {
                /*jshint validthis: true */

                if(isChartMathFunction) {
                    return;
                }

                this.append('g')
                    .attr("class", "label")
                    .attr('opacity', labelOpacity)
                    .call(pieLabelTextEnter)
                    .call(pieLabelTickEnter);

                return this;
            }

            function pieLabelUpdate() {
                /*jshint validthis: true */

                var pieLabel = this;

                pieLabel.call(pieLabelTextUpdate);
                pieLabel.call(pieLabelTickUpdate);

                return pieLabel;
            }

            function piePieceEnter() {
                /*jshint validthis: true */

                this
                    .call(piePathEnter)
                    .call(pieLabelEnter);

                return this;
            }

            function pieUpdate() {
                /*jshint validthis: true */

                var piePieces = this;

                piePieces
                    .call(piePathUpdate);

                piePieces
                    .call(pieLabelUpdate);

                return piePieces;
            }

            function translateToMiddle() {
                var x = model.getWidth() / 2,
                    y = model.getHeight() / 2;

                return 'translate(' + x + ',' + y + ')';
            }

            function isPhantomAttribute(attribute) {
                return /others/i.test(attribute);
            }

            self.draw = function () {
                var data = model.data,
                    arcs,
                    total;

                group.attr("transform", translateToMiddle);
                arcs = group.selectAll(".arc")
                    .data(pie(data), function (pieItem) {
                        return pieItem.data.getId();
                    });

                arcs.enter()
                    .append("g")
                    .attr("class", function (item) {
                        var state = isPhantomAttribute(item.data.type) ? '' : 'pie-chart_arc_interactive';
                        return 'arc ' + state;
                    })
                    .call(piePieceEnter);

                arcs.call(pieUpdate);

                totalGroup.attr("transform", translateToMiddle);
				totalGroup.selectAll("*").remove();
                total = totalGroup.selectAll('.total-label')
                    .data([self.config.totalConfig]);
                total.enter().call(totalEnter);
            };

            self.getColorAreas = function () {
                return group.selectAll(".arc");
            };

            self.updateColor = function (itemModel) {
                group.selectAll("path")
                    .filter(function (arc) {
                        return arc.data.getId() === itemModel.getId();
                    })
                    .attr('fill', arcColor);
            };

            self.init = function () {
                arc = d3.svg.arc()
                    .innerRadius(function () {
                        var diameter = getPieDiameter(),
                            min = self.config.minInnerRadius,
                            innerRadius;

                        if(isChartMathFunction) {
                            return 0;
                        }

                        innerRadius = diameter / 6;

                        return innerRadius < min ? min : innerRadius;
                    })
                    .outerRadius(getPieRadius);

                pie = d3.layout.pie()
                    .value(function (pieItemModel) {
                        return pieItemModel.getCount();
                    })
                    .sort(null);

                group = svg.append("g");

                totalGroup = svg.append('g')
                    .attr('class', 'total');

                self.draw();
            };

            self.destroy = ng.noop;
        };
    }];
});
