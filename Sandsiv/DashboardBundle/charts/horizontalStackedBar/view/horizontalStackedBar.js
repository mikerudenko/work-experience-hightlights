/*global define*/
define([
    'angular',
    'underscore',
    'd3',
    'mustache',
    'core/i18n',
    'text!../template/barTooltipTemplate.html'
], function (ng, un, d3, mustache, i18n, barTooltipTemplate) {
    'use strict';

    return ['axisService', 'gridService', 'layoutVerticalStackService',
        'tooltipService', 'underscoreExtraService', 'axisLabelService',
        'textEditorService', 'chartViewConfig', 'axisFactory',
        function (
            Axis,
            grid,
            layoutVerticalStack,
            tooltip,
            unE,
            axisLabel,
            labelEditor,
            chartViewConfig,
            AxisFactory
        ) {
            return function (conf) {
                var model = conf.model,
                    npsModel = conf.npsModel,
                    self = this,
                    defaults,
                    pencilUnicode = '&#x270f;',
                    modes;

                defaults = {
                    groupPadding: 10, // %
                    overOpacity: 0.4,
                    animationDuration: 500,
                    nps: {
                        radius: 5,
                        overRadius: 8
                    },
                    mode: 'relative',
                    margin: {
                        left: 10,
                        top: 10,
                        right : 10,
                        bottom: 0
                    },
                    axes: {
                        bottom: {
                            ticks: 10,
                            delimiter: '%'
                        },
                        left: {
                            textSize: 80,
                            labelMargin: 5,
                            decimateSize: 25
                        },
                        nps: {
                            labelMargin: 3,
                            delimiter: '%'
                        }
                    }
                };

                self.config = conf.config;
                unE.defaults(self.config, defaults);
                self.svg = d3.select(conf.svg);

                modes = {
                    absolute: {
                        xDomain: function () {
                            return [0, model.getMax()];
                        },

                        xTickFormat: d3.format('s'),

                        yBarSlice: function (barSlice) {
                            return barSlice.getCount();
                        }
                    },
                    relative: {
                        xDomain: function () {
                            return [0, 100];
                        },

                        xTickFormat: function (value) {
                            return value + self.config.axes.bottom.delimiter;
                        },

                        yBarSlice: function (barSlice) {
                            return barSlice.getPercent();
                        }
                    }
                };

                function getChartOffset() {
                    var config = self.config;

                    return {
                        x: config.margin.left + config.axes.left.size(),
                        y: config.margin.top + config.axes.nps.textSize
                    };
                }

                function translateToChartOffset() {
                    var offset = getChartOffset();

                    return "translate({0}, {1})".format(offset.x, offset.y);
                }

                function getChartWidth() {
                    var config = self.config;

                    return model.getWidth() -
                        config.margin.left - config.margin.right -
                        config.axes.left.size() - config.axes.left.textSize;
                }

                function translateNpsAxis() {
                    var offset = getChartOffset();

                    return "translate({0}, {1})".format(offset.x, offset.y);
                }

                function getChartHeight() {
                    var config = self.config;

                    return model.getHeight() -
                        config.margin.top - config.margin.bottom -
                        config.axes.bottom.size() - config.axes.nps.textSize;
                }

                /*jslint unparam:true*/
                function customLabel(tick, groupIndex) {
                    return model.getAt(groupIndex).getLabel();
                }
                /*jslint unparam:false*/

                function onTickLeave() {
                    tooltip.hide();
                }

                function tickTooltip(label, rounded) {
                    /*jshint validthis: true */

                    d3.select(this)
                        .on('mouseover', function () {
                            if (rounded) {
                                tooltip.showText(d3.event, label);
                            }
                        })
                        .on('mouseleave', onTickLeave);
                }

                function buildAxes() {
                    un.each(self.config.axes, function (axis, key) {
                        self.config.axes[key] = new AxisFactory(axis);
                    });
                }

                function initYAxis() {
                    var axisConfig = self.config.axes.left;

                    self.yScale = d3.scale.ordinal();

                    self.yAxis = new Axis({
                        scale: self.yScale,
                        orient: 'left',
                        textSize: axisConfig.textSize,
                        tickFormat: customLabel,
                        onRound: tickTooltip
                    });

                    self.yAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
                        .x(-axisConfig.labelOffset());

                    self.yAxisView = self.svg.append("g")
                        .attr("class", "y axis");

                    self.hGrid = grid({
                        orient: 'horizontal',
                        size: getChartWidth(),
                        scale: self.yScale,
                        offsetFn: function () {
                            return self.yScale.rangeBand() / 2;
                        }
                    });

                    self.hGridView = self.svg.append("g")
                        .attr("class", "horizontal-grid grid");
                }

                function initNpsAxis() {
                    var axisConfig = self.config.axes.nps;

                    self.npsScale = d3.scale.linear()
                        .domain([-100, 100])
                        .range([0, getChartWidth()]);

                    self.npsAxis = new Axis({
                        scale: self.npsScale,
                        orient: 'top',
                        ticks: self.config.axes.bottom.ticks,
                        textSize: axisConfig.textSize,
                        onRound: tickTooltip,
                        tickFormat: function (value) {
                            return value + axisConfig.delimiter;
                        }
                    });

                    self.npsAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
                        .y(-axisConfig.textSize);

                    self.npsAxisView = self.svg.append("g")
                        .attr("class", "nps axis");

                }

                function initXAxis() {
                    var axisConfig = self.config.axes.bottom;

                    self.xScale = d3.scale.linear()
                        .domain(modes[self.config.mode].xDomain())
                        .range([0, getChartWidth()]);

                    self.xAxis = new Axis({
                        scale: self.xScale,
                        orient: 'bottom',
                        textSize: axisConfig.textSize,
                        tickFormat: modes[self.config.mode].xTickFormat,
                        onRound: tickTooltip
                    });

                    self.xAxisView = self.svg.append("g")
                        .attr("class", "x axis");

                    self.xAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
                        .y(axisConfig.textSize);

                    self.vGrid = grid({
                        orient: 'vertical',
                        size: getChartHeight(),
                        scale: self.xScale
                    });

                    self.vGridView = self.svg.append("g")
                        .attr("class", "vertical-grid grid");
                }

                function initBars() {
                    self.barGroupsView = self.svg.append("g")
                        .attr("class", "bar-groups");

                    /*jslint unparam:true*/
                    self.stacked = layoutVerticalStack()
                        .values(function (bar) {
                            return bar.data;
                        })
                        .y(modes[self.config.mode].yBarSlice)
                        .x(function (barSlice, index, bar) {
                            return bar.getId();
                        });
                    /*jslint unparam:false*/
                }

                function npsX(bar) {
                    return self.npsScale(bar.getScore());
                }

                function npsY(bar) {
                    return self.yScale(bar.getId()) + self.yScale.rangeBand() / 2;
                }

                function initNpsLine() {
                    self.npsLine = d3.svg.line()
                        .x(npsX)
                        .y(npsY)
                        .interpolate('linear');

                    self.npsLineView = self.svg.append('g')
                        .attr('class', 'nps-line-group');

                    self.npsLineView.append('path')
                        .attr({
                            class: 'nps-line',
                            fill: 'none'
                        });
                }

                /*jslint unparam:true*/
                function barY(bar, index, groupIndex) {
                    return self.yScale(bar.x) + self.yScale.rangeBand() *
                        self.config.groupPadding / 100;
                }
                /*jslint unparam:false*/

                function barX(bar) {
                    return self.xScale(bar.y0);
                }

                function barWidth(bar) {
                    return self.xScale(bar.y);
                }

                /*jslint unparam: true*/
                function barHeight(bar, index, groupIndex) {
                    return self.yScale.rangeBand() -
                        self.yScale.rangeBand() *
                        self.config.groupPadding / 50;
                }
                /*jslint unparam: false*/

                function barColor(bar) {
                    return bar.getColor();
                }

                /*jslint unparam:true*/
                function onBarItemClick(baritem, index, barIndex) {
                    self.config.onItemClick(baritem, model.getAt(barIndex));
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

                function onXAxisClick() {
                    /*jshint validthis: true */

                    var axis = self.config.axes.bottom;

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, axis.label)
                        .promise.then(function (text) {
                            axis.label = text;

                            self.xAxisLabel.text(text);
                            self.xAxisView.call(self.xAxisLabel);
                            self.config.onLabelChange(text, 'group', 'axis');
                        });
                }

                function onYAxisClick() {
                    /*jshint validthis: true */

                    var axis = self.config.axes.left;

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, axis.label)
                        .promise.then(function (text) {
                            axis.label = text;

                            self.yAxisLabel
                                .call(rotateYAxisLabel)
                                .text(text);

                            self.yAxisView.call(self.yAxisLabel);
                            self.config.onLabelChange(text, 'count', 'axis');
                        });
                }

                function onYTickCLick(item, index) {
                    /*jshint validthis: true */

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, item.getLabel())
                        .promise.then(function (text) {
                            item.label = text;
                            npsModel.getData()[index].setLabel(text);

                            self.draw();
                            self.config.onLabelChange(text, item.getId(), 'tick');
                        });
                }

                function updateViewConfig() {
                    unE.extend(self.config, chartViewConfig.get(getChartWidth()));
                }

                function onNpsAxisClick() {
                    /*jshint validthis: true */

                    var axis = self.config.axes.nps;

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, axis.label)
                        .promise.then(function (text) {
                            axis.label = text;

                            self.npsAxisLabel
                                .text(text);

                            self.npsAxisView.call(self.npsAxisLabel);
                            self.config.onLabelChange(text, 'score', 'axis');
                        });
                }

                self.draw = function () {
                    var config = self.config,
                        groupLabels;

                    groupLabels = un.map(model.data, function (bar) {
                        return bar.getId();
                    });

                    updateViewConfig();

                    self.yScale
                        .domain(groupLabels)
                        .rangeBands([0, getChartHeight()]);

                    self.xScale.range([0, getChartWidth()]);
                    self.npsScale.range([0, getChartWidth()]);

                    self.xAxisLabel
                        .x(getChartWidth() / 2)
                        .maxWidth(getChartWidth())
                        .text(config.axes.bottom.label)
                        .readOnly(self.config.readOnly);

                    self.xAxis
                        .axis.ticks(config.axes.bottom.ticks);
                    self.npsAxis
                        .axis.ticks(config.axes.bottom.ticks);

                    self.vGrid
                        .values(self.xScale.ticks(config.axes.bottom.ticks));

                    self.xAxisView.attr("transform", function () {
                        var offset = getChartOffset();

                        return "translate({0}, {1})"
                            .format(offset.x, getChartHeight() + config.margin.top + self.config.axes.nps.textSize);
                    })
                        .call(self.xAxis.axisFn)
                        .call(self.xAxisLabel);

                    self.xAxisView.selectAll('text.axis-label')
                        .on('click', onXAxisClick);

                    self.vGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.vGrid);

                    self.yAxisLabel
                        .y(getChartHeight() / 2)
                        .call(rotateYAxisLabel)
                        .maxWidth(getChartHeight())
                        .text(config.axes.left.label)
                        .overRectX(-config.axes.left.size())
                        .readOnly(self.config.readOnly);

                    self.yAxisView
                        .attr("transform", translateToChartOffset)
                        .call(self.yAxis.axisFn)
                        .call(self.yAxisLabel);

                    self.yAxisView.selectAll('.tick text')
                        .data(model.data)
                        .on('click', onYTickCLick);

                    self.yAxisView.selectAll('text.axis-label')
                        .on('click', onYAxisClick);

                    self.hGrid
                        .values(groupLabels)
                        .size(getChartWidth());

                    self.hGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.hGrid);

                    self.npsAxisLabel
                        .x(getChartWidth() / 2)
                        .maxWidth(getChartWidth())
                        .text(config.axes.nps.label)
                        .readOnly(self.config.readOnly);

                    self.npsAxisView
                        .attr('transform', translateNpsAxis)
                        .call(self.npsAxis.axisFn)
                        .call(self.npsAxisLabel);

                    self.npsAxisView.selectAll('text.axis-label')
                        .on('click', onNpsAxisClick);

                    self.drawBars();
                    self.drawNpsLine();
                };

                self.drawBars = function () {
                    var groups,
                        group;

                    groups = self.barGroupsView
                        .attr('transform', translateToChartOffset)
                        .selectAll('.bar-group')
                        .data(self.stacked(model.data), function (bar) {
                            return bar.getId();
                        });


                    groups.enter()
                        .append('g')
                        .attr({
                            'class': 'bar-group'
                        });

                    groups.exit().remove();

                    group = groups.selectAll('.bar')
                        .data(function (group) {
                            return group.data;
                        });

                    group.enter()
                        .append('rect')
                        .attr({
                            'class': 'bar',
                            x: barX,
                            y: barY,
                            fill: barColor,
                            width: barWidth,
                            height: barHeight
                        })
                        .on('mouseover', self.onBarOver)
                        .on('mouseleave', self.onBarLeave)
                        .on('click', onBarItemClick);

                    group
                        .attr({
                            x: barX,
                            y: barY,
                            fill: barColor,
                            width: barWidth,
                            height: barHeight
                        });
                };

                function npsTooltip(npsItem) {
                    return mustache.render(barTooltipTemplate, {
                        group: npsItem.getLabel(),
                        categoryLabel: i18n.trans('Name'),
                        category: npsModel.getLabel(),
                        valueLabel: i18n.trans('Value'),
                        percent: npsItem.getScore().toFixed(2),
                        answerLabel: i18n.trans('Answers'),
                        count: npsItem.getCount()
                    });
                }

                function onNpsDotOver() {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr('r', self.config.nps.overRadius);

                    tooltip.show(d3.event, npsTooltip.apply(this, arguments));
                }

                function onNpsDotLeave() {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr('r', self.config.nps.radius);

                    tooltip.hide();
                }

                function npsColor() {
                    return npsModel.getColor();
                }

                self.drawNpsLine = function () {
                    var dots;

                    self.npsLineView
                        .attr('transform', translateToChartOffset);

                    self.npsLineView.select('.nps-line')
                        .attr({
                            d: self.npsLine(npsModel.data),
                            stroke: npsColor
                        });

                    dots = self.npsLineView.selectAll('.nps-dot')
                        .data(npsModel.data);

                    dots.enter()
                        .append('circle')
                        .attr({
                            cx: npsX,
                            cy: npsY,
                            r: self.config.nps.radius,
                            fill: 'white',
                            class: 'nps-dot'
                        })
                        .on('mouseover', onNpsDotOver)
                        .on('mouseleave', onNpsDotLeave);

                    dots.exit().remove();

                    dots.attr({
                        cx: npsX,
                        cy: npsY,
                        stroke: npsColor
                    });
                };

                /*jslint unparam:true*/
                function barTooltip(barSlice, sliceIndex, groupIndex) {
                    var bar = model.getSourceAt(groupIndex);

                    return mustache.render(barTooltipTemplate, {
                        group: bar.getLabel(),
                        categoryLabel: i18n.trans('Name'),
                        category: barSlice.getLabel(),
                        valueLabel: i18n.trans('Value'),
                        percent: barSlice.getPercent().toFixed(2),
                        answerLabel: i18n.trans('Answers'),
                        count: barSlice.getCount()
                    });
                }
                /*jslint unparam:false*/

                self.onBarOver = function () {
                    d3.select(this)
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr({
                            opacity: self.config.overOpacity
                        });

                    tooltip.show(d3.event, barTooltip.apply(this, arguments));
                };

                self.onBarLeave = function () {
                    d3.select(this)
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr({
                            opacity: 1
                        });

                    tooltip.hide();
                };

                self.highlightGroup = function (groupName) {
                    self.barGroupsView
                        .selectAll('.bar')
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr('opacity', function (bar) {
                            return bar.getId() === groupName ?
                                    1 : self.config.overOpacity;
                        });
                };

                self.unHighlighGroup = function () {
                    self.barGroupsView
                        .selectAll('.bar')
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr('opacity', 1);
                };

                self.getColorAreas = function () {
                    return self.barGroupsView
                        .selectAll('.bar-group')
                        .selectAll('.bar');
                };

                self.getNpsColorArea = function () {
                    return self.npsLineView
                        .selectAll('.nps-dot');
                };

                self.init = function () {
                    buildAxes();
                    initXAxis();
                    initYAxis();
                    initNpsAxis();
                    initBars();
                    initNpsLine();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
