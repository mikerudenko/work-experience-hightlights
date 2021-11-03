/*global define*/
define([
    'angular',
    'underscore',
    'd3',
    'mustache',
    'core/i18n',
    'core/monads/Maybe',
    'text!../template/BarTooltipTemplate.html'
], function(ng, un, d3, mustache, i18n, Maybe, barTooltipTpl) {
    'use strict';

    return ['axisService', 'gridService', 'tooltipService',
        'scaleThinningService', 'axisLabelService', 'textEditorService',
        'axisFactory', 'underscoreExtraService',
        function(Axis,
                 grid,
                 tooltip,
                 scaleThinner,
                 axisLabel,
                 labelEditor,
                 AxisFactory,
                 unE) {
            return function(conf) {
                var model = conf.model,
                    self = this,
                    pencilUnicode = '&#x270f;',
                    modes,
                    defaults;
                const MAX_NUMBER_OF_BARS = numberOfBars(model);
                const ZERO_BAR_HEIGHT = 1;
                const LABEL_BAR_Y_OFFSET_POSITIVE = 3;
                const LABEL_BAR_Y_OFFSET_NEGATIVE = 15;

                const OFFSET_X_AXES_LABEL = conf.config.contentSettings.annotateScore ? 15 : 0;

                defaults = {
                    groupPadding: 10, // %
                    overMultiply: 5,
                    barSpace: 2, //px
                    minBarWidth: 0.5,
                    overOpacity: 0.4,
                    animationDuration: 500,
                    transitionDelay: 200,
                    mode: 'absolute',
                    margin: {
                        left: 10,
                        top: 15,
                        right: 10,
                        bottom: 0
                    },
                    axes: {
                        left: {
                            ticks: 5
                        },
                        average: {
                            ticks: 5
                        },
                        bottom: {
                            decimateSize: 20,
                            labelMargin: 3
                        }
                    }
                };

                self.config = conf.config;
                unE.defaults(self.config, defaults);
                self.svg = d3.select(conf.svg);

                modes = {
                    absolute: {
                        getYDomain: function() {
                            var upperBound = model.getMaxFromSlice() < 0 ? 0 : model.getMaxFromSlice();
                            var lowerBound = model.getMinFromSlice() > 0 ? 0 : model.getMinFromSlice();

                            return [lowerBound, upperBound];
                        },

                        getValue: function(bar) {
                            return bar.getScore();
                        },

                        yTickFormat: d3.format(20, 's')
                    },

                    relative: {
                        getYDomain: function() {
                            return [0, percentToDecimal(model.getMaxPercent())];
                        },

                        getValue: function(bar) {
                            return percentToDecimal(bar.getPercent());
                        },

                        yTickFormat: d3.format('%')
                    }
                };

                function spaceBetweenBars() {
                    // Fixed space between bars causes render of tail bars outside chart area
                    var scale = 1 - numberOfBars(model) / MAX_NUMBER_OF_BARS;
                    return scale * self.config.barSpace;
                }

                function numberOfBars(model) {
                    return un.chain(model.data).pluck('data').flatten().size().value();
                }

                function getChartOffset() {
                    var config = self.config;

                    return {
                        x: config.margin.left + config.axes.left.size(),
                        y: config.margin.top
                    };
                }

                function averageAxisOffset() {
                    var offset = getChartOffset();
                    return "translate({0}, {1})".format(offset.x + getChartWidth(), offset.y);
                }

                function translateToChartOffset() {
                    var offset = getChartOffset();

                    return "translate({0}, {1})".format(offset.x, offset.y);
                }

                function translateToAxesOffset() {
                    var offset = getChartOffset();

                    return "translate({0}, {1})".format(offset.x, offset.y);
                }

                function getChartWidth() {
                    var config = self.config;

                    return model.getWidth() -
                        config.margin.left - config.margin.right -
                        config.axes.left.size() -
                        config.axes.average.size();
                }

                function getChartHeight() {
                    var config = self.config;

                    return model.getHeight() -
                        config.margin.top - config.margin.bottom -
                        config.axes.bottom.size();
                }

                /*jslint unparam:false*/

                function onTickLeave() {
                    tooltip.hide();
                }

                function tickTooltip(label, rounded) {
                    /*jshint validthis: true */

                    d3.select(this)
                        .on('mouseover', function() {
                            if (rounded) {
                                tooltip.showText(d3.event, label);
                            }
                        })
                        .on('mouseleave', onTickLeave);
                }

                function buildAxes() {
                    un.each(self.config.axes, function(axis, key) {
                        self.config.axes[key] = new AxisFactory(axis);
                    });
                }

                function initAverageAxis() {
                    self.averageAxisScale = d3.scale.linear()
                        .range([getChartHeight(), 0]);

                    self.averageAxis = new Axis({
                        scale: self.averageAxisScale,
                        orient: 'right',
                        textSize: self.config.axes.average.textSize,
                        onRound: tickTooltip,
                        ticks: 10,
                        tickFormat: d3.format('.3g')
                    });

                    self.averageAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
                        .x(self.config.axes.average.textSize)
                        .y(getChartHeight() / 2);

                    self.averageAxisView = self.svg.append("g")
                        .attr("class", "average axis");
                }

                function initYAxis() {
                    var axisConfig = self.config.axes.left;

                    self.yScale = d3.scale.linear()
                        .range([getChartHeight(), 0]);

                    self.yAxis = new Axis({
                        scale: self.yScale,
                        orient: 'left',
                        textSize: axisConfig.textSize,
                        onRound: tickTooltip,
                        tickFormat: modes[self.config.mode].yTickFormat
                    });

                    self.yAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
                        .x(-axisConfig.textSize);

                    self.yAxisView = self.svg.append("g")
                        .attr("class", "y axis");

                    self.hGrid = grid({
                        orient: 'horizontal',
                        size: getChartWidth(),
                        scale: self.yScale
                    });

                    self.hGridView = self.svg.append("g")
                        .attr("class", "horizontal-grid grid");
                }

                function initXAxis() {
                    var groupLabels,
                        axisConfig = self.config.axes.bottom;

                    groupLabels = un.map(model.data, function(group) {
                        return group.getId();
                    });

                    self.xScale = d3.scale.ordinal()
                        .domain(groupLabels)
                        .rangeBands([0, getChartWidth()]);

                    self.xThinner = scaleThinner();

                    self.xAxis = new Axis({
                        scale: self.xScale,
                        orient: 'bottom',
                        textSize: axisConfig.textSize,
                        rotate: 90,
                        annotateScoreFlag: self.config.contentSettings.annotateScore,
                        onRound: tickTooltip,
                        tickFormat: model.labelByBarId.bind(model)
                    });

                    self.xAxisView = self.svg.append("g")
                        .attr("class", "x axis" + (model.hasAlternatingSignValues() ? ' transparent-axis' : ''));

                    if (model.hasAlternatingSignValues()) {
                        self.xPseudoAxis = new Axis({
                            scale: self.xScale,
                            orient: 'bottom',
                            rotate: 90,
                            annotateScoreFlag: self.config.contentSettings.annotateScore
                        });
                        self.xPseudoAxisView = self.svg.append('g').attr('class', 'x axis pseudo-axis');
                    }

                    self.xAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
                        .y(axisConfig.size() - axisConfig.labelSize + axisConfig.labelMargin + OFFSET_X_AXES_LABEL);

                    self.vGrid = grid({
                        orient: 'vertical',
                        size: getChartHeight(),
                        scale: self.xScale,
                        values: groupLabels,
                        offsetFn: function() {
                            return self.xScale.rangeBand() / 2;
                        }
                    });

                    self.vGridView = self.svg.append("g")
                        .attr("class", "vertical-grid grid");
                }

                function initBars() {
                    self.barGroupsView = self.svg.append("g")
                        .attr("class", "bar-groups");
                }

                function initTargetPointLine() {
                    self.targetPointView = self.svg.append('g')
                        .attr('class', 'bar-target-point-container');
                }

                function initAverageLine() {
                    self.averageLineView = self.svg.append("g")
                        .attr("class", "bar-average-line-container");
                }

                /*jslint unparam: true*/
                function translateBarGroup(group, index) {
                    var x = self.xScale.rangeBand() * index;

                    return 'translate({0}, 0)'.format(x);
                }

                /*jslint unparam: false*/

                /*jslint unparam: true*/
                function getBarWidth(bar, groupIndex) {
                    var group = model.getAt(groupIndex),
                        groupWidth = self.xScale.rangeBand(),
                        padding = groupWidth *
                            self.config.groupPadding / 100,
                        barWidth;

                    barWidth = (groupWidth - padding * 2) /
                        group.length() - spaceBetweenBars();

                    return barWidth > 0 ? barWidth : 0.5;
                }

                /*jslint unparam: false*/

                function barX(bar, index, groupIndex) {
                    return (getBarWidth(bar, groupIndex) +
                        spaceBetweenBars()) *
                        index + self.xScale.rangeBand() *
                        self.config.groupPadding / 100 +
                        spaceBetweenBars() / 2;
                }

                function barScore(bar) {
                    return modes[self.config.mode].getValue(bar);
                }

                function barTextX(bar, index, groupIndex) {
                    return barX(bar, index, groupIndex) + getBarWidth(bar, groupIndex) / 2;
                }

                function barY(bar) {
                    var score = barScore(bar);
                    var slope = (score <= 0) ? 0 : 1;
                    var mininalHeight = (score === 0) ? -ZERO_BAR_HEIGHT / 2 : 0;
                    var offset = (score <= 0) ? self.yScale(0) + mininalHeight : 0;

                    return slope * self.yScale(score) + offset;
                }

                function barTextY(bar) {
                    var offset = (bar.getScore() < 0) ? barHeight(bar) + LABEL_BAR_Y_OFFSET_NEGATIVE : -LABEL_BAR_Y_OFFSET_POSITIVE;
                    var yPosition = barY(bar) + offset;
                    return yPosition < 0 ? 0 : yPosition;
                }

                function barHeight(bar) {
                    var score = barScore(bar);

                    return (score === 0) ? ZERO_BAR_HEIGHT : Math.abs(self.yScale(score) - self.yScale(0));
                }

                function animatedBarY(bar) {
                    var score = barScore(bar);
                    var scale = (score === 0) ? 0.5 : 1;

                    return score < 0 ? self.yScale(0) : self.yScale(0) - scale * animatedBarHeight(bar);
                }

                function animatedBarHeight(bar) {
                    var scale = 1 + (self.config.overMultiply / 100);

                    return scale * barHeight(bar);
                }

                /*jslint unparam: true*/
                function barWidth(bar, index, groupIndex) {
                    return getBarWidth(bar, groupIndex);
                }

                /*jslint unparam: false*/

                function barColor(bar) {
                    return bar.getColor();
                }

                function xAxisTicks() {
                    return Math.floor(getChartWidth() /
                        self.config.axes.bottom.decimateSize);
                }

                /*jslint unparam:true*/
                function onBarClick(bar, barindex, groupIndex) {
                    self.config.onItemClick(bar, model.getAt(groupIndex));
                }

                /*jslint unparam:false*/

                function rotateYAxisLabel() {
                    /*jshint validthis: true */

                    var rotate = !!self.config.axes.left.label;

                    this
                        .rotate(rotate ? -90 : 0)
                        .dx(rotate ? '0em' : '-1em')
                        .dy(rotate ? '-0.71em' : '0em');

                    return this;
                }

                function rotateAverageAxisLabel() {
                    /*jshint validthis: true */

                    var rotate = !!self.config.axes.average.label;

                    this
                        .rotate(rotate ? -90 : 0)
                        .dx(rotate ? '0em' : '1em')
                        .dy(rotate ? '-0.71em' : '0em');

                    return this;
                }

                function onXAxisClick() {
                    /*jshint validthis: true */

                    var axis = self.config.axes.bottom;

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, axis.label)
                        .promise.then(function(text) {
                        axis.label = text;

                        self.xAxisLabel.text(text);
                        self.xAxisView.call(self.xAxisLabel);
                        self.config.onLabelChange(text, 'group', 'axis');
                    });
                }

                function onXTickCLick(item) {
                    /*jshint validthis: true */

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, item.getLabel())
                        .promise.then(function(text) {
                        item.label = text;

                        self.draw();
                        self.config.onLabelChange(text, item.getId(), 'tick');
                    });
                }

                function onYAxisClick() {
                    /*jshint validthis: true */

                    var axis = self.config.axes.left;

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, axis.label)
                        .promise.then(function(text) {
                        axis.label = text;

                        self.yAxisLabel
                            .call(rotateYAxisLabel)
                            .text(text);

                        self.yAxisView.call(self.yAxisLabel);
                        self.config.onLabelChange(text, 'count', 'axis');
                    });
                }

                function onAverageAxisClick() {
                    /*jshint validthis: true */

                    var axis = self.config.axes.average;

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, axis.label)
                        .promise.then(function(text) {
                        axis.label = text;

                        self.averageAxisLabel
                            .call(rotateAverageAxisLabel)
                            .text(text);

                        self.averageAxisView.call(self.averageAxisLabel);
                        self.config.onLabelChange(text, 'average', 'axis');
                    });
                }

                function xPseudoAxisViewTransform() {
                    var offset = getChartOffset();

                    return 'translate({0}, {1})'.format(offset.x, self.yScale(0) + offset.y);
                }

                self.draw = function() {
                    var config = self.config,
                        groupLabels;

                    groupLabels = un.map(model.data, function(group) {
                        return group.getId();
                    });

                    self.xScale
                        .rangeBands([0, getChartWidth()])
                        .domain(groupLabels);

                    self.xThinner
                        .ticks(xAxisTicks())
                        .domain(model.data);

                    self.xAxisLabel
                        .x(getChartWidth() / 2)
                        .maxWidth(getChartWidth())
                        .text(config.axes.bottom.label)
                        .readOnly(self.config.readOnly);

                    self.xAxis.axis
                        .tickValues(self.xThinner().map(function(bar) {
                            return bar.getId();
                        }));

                    self.yScale
                        .domain(modes[self.config.mode].getYDomain());

                    if (model.hasAlternatingSignValues()) {
                        self.xPseudoAxis.axis.tickValues([]);
                        self.xPseudoAxisView.attr('transform', xPseudoAxisViewTransform).call(self.xPseudoAxis.axisFn);
                    }

                    self.xAxisView.attr("transform", function() {
                        var offset = getChartOffset();

                        return "translate({0}, {1})"
                            .format(offset.x, model.getHeight() - config.margin.bottom - config.axes.bottom.size());
                    })
                        .call(self.xAxis.axisFn)
                        .call(self.xAxisLabel);

                    self.xAxisView.selectAll('.tick text')
                        .data(self.xThinner())
                        .on('click', onXTickCLick);

                    self.xAxisView.selectAll('text.axis-label')
                        .on('click', onXAxisClick);

                    self.vGrid
                        .values(self.xThinner().map(function(bar) {
                            return bar.getId();
                        }));

                    self.vGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.vGrid);

                    if (self.config.func !== 'affection') {
                        self.yAxisLabel
                            .y(getChartHeight() / 2)
                            .call(rotateYAxisLabel)
                            .maxWidth(getChartHeight())
                            .text(config.axes.left.label)
                            .overRectX(-config.axes.left.size())
                            .readOnly(self.config.readOnly);

                        self.yAxisView
                            .attr("transform", translateToAxesOffset)
                            .call(self.yAxis.axisFn)
                            .call(self.yAxisLabel);
                    }

                    if (model.containsAverageData() && self.config.contentSettings.average) {
                        self.averageAxisLabel
                            .call(rotateAverageAxisLabel)
                            .text(config.axes.average.label);

                        self.averageAxisScale
                            .domain(model.averageDomain());

                        self.averageAxisView
                            .attr("transform", averageAxisOffset)
                            .on('click', onAverageAxisClick)
                            .call(self.averageAxis.axisFn)
                            .call(self.averageAxisLabel);

                        self.drawAverageLine();
                    }

                    if (config.contentSettings.unlimitedTargetPoint.visible) {
                        Maybe.fromNullable(model.unlimitedTargetPoint.value)
                            .map(self.config.mode === 'absolute' ? un.identity : percentToDecimal)
                            .chain(self.drawTargetPointLine);
                    }

                    self.yAxisView.selectAll('text.axis-label')
                        .on('click', onYAxisClick);

                    self.hGrid
                        .values(self.yScale.ticks(config.axes.left.ticks))
                        .size(getChartWidth());

                    self.hGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.hGrid);

                    self.drawBars();
                    Axis.rotateTicks({
                        ticksCount: model.data.length,
                        chartWidth: getChartWidth(),
                        xAxisView: self.xAxisView
                    });
                };

                function percentToDecimal(percent) {
                    return percent / 100;
                }

                function annotateBars(bars) {
                    var barLabel = bars.selectAll('.label-item')
                        .data(function(bar) {
                            return bar.data;
                        })
                        .text(function(item) {
                            return item.score;
                        });

                    barLabel.enter()
                        .append('text')
                        .attr({
                            x: barTextX,
                            y: barTextY,
                            'class': 'label-item'
                        })
                        .text(function(item) {
                            return item.score;
                        });

                    barLabel.attr({
                        x: barTextX,
                        y: barTextY
                    });
                }

                self.drawBars = function() {
                    var groups,
                        group;

                    groups = self.barGroupsView
                        .attr('transform', translateToChartOffset)
                        .selectAll('.bar-group')
                        .data(model.data, function(group) {
                            return group.getId();
                        });

                    groups.enter()
                        .append('g')
                        .attr({
                            'class': 'bar-group',
                            'transform': translateBarGroup
                        });

                    group = groups.selectAll('.bar')
                        .data(function(group) {
                            return group.data;
                        });

                    groups.attr('transform', translateBarGroup);

                    group.enter()
                        .append('rect')
                        .attr({
                            'class': 'bar'
                        });

                    group.attr({
                        x: barX,
                        y: barY,
                        fill: barColor,
                        width: barWidth,
                        height: barHeight
                    })
                        .on('mouseover', self.onBarOver)
                        .on('mouseleave', self.onBarLeave)
                        .on('click', onBarClick);

                    if (self.config.contentSettings.annotateScore) {
                        annotateBars(groups);
                    }

                    groups.exit().remove();
                };

                self.drawTargetPointLine = function(value) {
                    var yScaleMax = (self.config.mode === 'absolute') ? model.getMax() : Math.round(model.getMaxPercent()) / 100;

                    self.targetPointView.select('line').remove();

                    if (yScaleMax < value) {
                        return false;
                    }

                    self.targetPointView.append('line')
                        .attr('transform', translateToChartOffset)
                        .attr('class', 'bar-target-point')
                        .attr('stroke', model.unlimitedTargetPoint.color)
                        .attr('stroke-width', 3)
                        .attr('fill', 'none')
                        .attr('x1', un.first(self.xScale.rangeExtent()))
                        .attr('y1', self.yScale(value))
                        .attr('x2', un.last(self.xScale.rangeExtent()))
                        .attr('y2', self.yScale(value));
                };

                function averagePointXСoordinate(data) {
                    return self.xScale(data.id) + self.xScale.rangeBand() / 2;
                }

                function averagePointYСoordinate(data) {
                    return self.averageAxisScale(data.average);
                }

                self.drawAverageLine = function() {
                    var linePathGenerator = d3.svg.line()
                        .x(averagePointXСoordinate)
                        .y(averagePointYСoordinate)
                        .interpolate('linear');

                    self.averageLineView.selectAll('*').remove();

                    self.averageLineView.append('path')
                        .attr('transform', translateToChartOffset)
                        .attr('d', linePathGenerator(model.data))
                        .attr('class', 'bar-average-line')
                        .attr('stroke', '#1f77b4')
                        .attr('stroke-width', 3)
                        .attr('fill', 'none');

                    self.averageLineView.selectAll('circle')
                        .data(model.data)
                        .enter()
                        .append('circle')
                        .attr('r', 4)
                        .attr('cx', averagePointXСoordinate)
                        .attr('cy', averagePointYСoordinate)
                        .attr('stroke-width', 2)
                        .attr('transform', translateToChartOffset)
                        .attr('class', 'bar-average-line-point')
                        .style('stroke', '#1f77b4')
                        .style('fill', 'white')
                        .on('mouseover', showAverageTooltip)
                        .on('mouseout', hideAverageTooltip);
                };

                function showAverageTooltip(data, index) {
                    /*jshint validthis: true */
                    d3.select(this)
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr('stroke-width', 3)
                        .attr('r', 7);

                    tooltip.show(d3.event, mustache.render(barTooltipTpl, {
                        group: data.label,
                        categoryLabel: i18n.trans('Category'),
                        category: i18n.trans('Average'),
                        valueLabel: i18n.trans('Value'),
                        percent: data.average,
                        answerLabel: i18n.trans('Answers'),
                        count: data.getTotal()
                    }));
                }

                function hideAverageTooltip() {
                    /*jshint validthis: true */
                    d3.select(this)
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr('stroke-width', 2)
                        .attr('r', 4);

                    tooltip.hide();
                }

                /*jslint unparam:true*/
                function barTooltip(bar, barIndex, groupIndex) {
                    var group = model.getAt(groupIndex);

                    var tooltipData = {
                        group: group.getLabel(),
                        categoryLabel: i18n.trans('Category'),
                        category: bar.getLabel(),
                        valueLabel: i18n.trans('Percentage'),
                        percent: d3.format('%')(percentToDecimal(bar.getPercent())),
                        answerLabel: i18n.trans(self.config.contentSettings.function || 'Count'),
                        count: bar.getScore()
                    };

                    if (self.config.func == 'affection') {
                        delete tooltipData.percent;
                        delete tooltipData.valueLabel;
                    }

                    return mustache.render(barTooltipTpl, tooltipData);
                }

                /*jslint unparam:false*/

                self.onBarOver = function() {
                    d3.select(this)
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr({
                            y: animatedBarY,
                            height: animatedBarHeight,
                            opacity: self.config.overOpacity
                        });

                    tooltip.show(d3.event, barTooltip.apply(this, arguments));
                };

                self.onBarLeave = function() {
                    d3.select(this)
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr({
                            y: barY,
                            height: barHeight,
                            opacity: 1
                        });

                    tooltip.hide();
                };

                self.highlightGroup = function(groupName) {
                    self.barGroupsView
                        .selectAll('.bar')
                        .transition()
                        .duration(self.config.animationDuration)
                        .delay(self.config.transitionDelay)
                        .attr('opacity', function(bar) {
                            return bar.getId() === groupName ?
                                1 : self.config.overOpacity;
                        });
                };

                self.unHighlighGroup = function() {
                    self.barGroupsView
                        .selectAll('.bar')
                        .transition()
                        .duration(self.config.animationDuration)
                        .delay(self.config.transitionDelay)
                        .attr('opacity', 1);
                };

                self.getColorAreas = function() {
                    return self.barGroupsView
                        .selectAll('.bar-group')
                        .selectAll('.bar');
                };


                self.init = function() {
                    buildAxes();
                    initXAxis();
                    initYAxis();
                    initAverageAxis();
                    initBars();
                    initTargetPointLine();
                    initAverageLine();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
