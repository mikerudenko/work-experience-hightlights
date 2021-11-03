/*global define*/
define([
    'angular',
    'underscore',
    'd3',
    'mustache',
    'core/i18n',
    'text!../../bar/template/BarTooltipTemplate.html'
], function (ng, un, d3, mustache, i18n, barTooltipTpl) {
    'use strict';

    return ['axisService', 'gridService', 'tooltipService',
        'scaleThinningService', 'axisLabelService', 'textEditorService',
        'axisFactory', 'underscoreExtraService',
        function (
            Axis,
            grid,
            tooltip,
            scaleThinner,
            axisLabel,
            labelEditor,
            AxisFactory,
            unE
        ) {
            return function (conf) {
                var model = conf.model,
                    self = this,
                    pencilUnicode = '&#x270f;',
                    modes,
                    defaults;

                defaults = {
                    groupPadding: 10, // %
                    overMultiply: 5,
                    barSpace: 2, //px
                    minBarWidth: 0.5,
                    overOpacity: 0.4,
                    animationDuration: 500,
                    mode: 'absolute',
                    margin: {
                        left: 10,
                        top: 10,
                        right : 10,
                        bottom: 0
                    },
                    axes: {
                        left: {
                            ticks: 5
                        },
                        bottom: {
                            textSize: 40,
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
                        getYDomain: function () {
                            return [model.getMin(), model.getMax()];
                        },

                        getValue: function (bar) {
                            return bar.getCount();
                        },

                        yTickFormat: d3.format(20, 's')
                    },

                    relative: {
                        getYDomain: function () {
                            return [0, model.getMaxPercent() / 100];
                        },

                        getValue: function (bar) {
                            return bar.getPercent() / 100;
                        },

                        yTickFormat: d3.format('%')
                    }
                };

                function getChartOffset() {
                    var config = self.config;

                    return {
                        x: config.margin.left + config.axes.left.size(),
                        y: config.margin.top
                    };
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
                        config.axes.left.size();
                }

                function getChartHeight() {
                    var config = self.config;

                    return model.getHeight() -
                        config.margin.top - config.margin.bottom -
                        config.axes.bottom.size();
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

                    groupLabels = un.map(model.data, function (group) {
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
                        onRound: tickTooltip,
                        tickFormat: customLabel
                    });

                    self.xAxisView = self.svg.append("g")
                        .attr("class", "x axis");

                    self.xAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
                        .y(axisConfig.size() - axisConfig.labelSize + axisConfig.labelMargin);

                    self.vGrid = grid({
                        orient: 'vertical',
                        size: getChartHeight(),
                        scale: self.xScale,
                        values: groupLabels,
                        offsetFn: function () {
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
                        padding =  groupWidth *
                            self.config.groupPadding / 100,
                        barWidth;

                    barWidth = (groupWidth - padding * 2) /
                        group.length() - self.config.barSpace;

                    return barWidth > 0 ? barWidth : 0.5;
                }
                /*jslint unparam: false*/

                function barX(bar, index, groupIndex) {
                    return (getBarWidth(bar, groupIndex) +
                        self.config.barSpace) *
                        index + self.xScale.rangeBand() *
                        self.config.groupPadding / 100 +
                        self.config.barSpace / 2;
                }

                function barY() {
                    /*jshint validthis: true */

                    return self.yScale(modes[self.config.mode].getValue.apply(this, arguments));
                }

                function barHeight(bar) {
                    return getChartHeight() - barY(bar);
                }

                function onOverBarY(bar) {
                    var y = barY(bar);

                    return y - barHeight(bar) *
                        self.config.overMultiply / 100;
                }

                function onOverBarHeight(bar) {
                    return getChartHeight() - onOverBarY(bar);
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

                function onXTickCLick(item) {
                    /*jshint validthis: true */

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, item.getLabel())
                        .promise.then(function (text) {
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
                        .promise.then(function (text) {
                            axis.label = text;

                            self.yAxisLabel
                                .call(rotateYAxisLabel)
                                .text(text);

                            self.yAxisView.call(self.yAxisLabel);
                            self.config.onLabelChange(text, 'count', 'axis');
                        });
                }

                self.draw = function () {
                    var config = self.config,
                        groupLabels;

                    groupLabels = un.map(model.data, function (group) {
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
                        .tickValues(self.xThinner().map(function (bar) {
                            return bar.getId();
                        }));

                    self.xAxisView.attr("transform", function () {
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
                        .values(self.xThinner().map(function (bar) {
                            return bar.getId();
                        }));

                    self.vGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.vGrid);

                    self.yScale
                        .domain(modes[self.config.mode].getYDomain());

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

                    self.yAxisView.selectAll('text.axis-label')
                        .on('click', onYAxisClick);

                    self.hGrid
                        .values(self.yScale.ticks(config.axes.left.ticks))
                        .size(getChartWidth());

                    self.hGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.hGrid);

                    self.drawBars();
                };

                self.drawBars = function () {
                    var groups,
                        group;

                    groups = self.barGroupsView
                        .attr('transform', translateToChartOffset)
                        .selectAll('.bar-group')
                        .data(model.data, function (group) {
                            return group.getId();
                        });

                    groups.enter()
                        .append('g')
                        .attr({
                            'class': 'bar-group',
                            'transform': translateBarGroup
                        });

                    groups.exit()
                        .remove();

                    group = groups.selectAll('.bar')
                        .data(function (group) {
                            return group.data;
                        });

                    groups.attr('transform', translateBarGroup);

                    group.enter()
                        .append('rect')
                        .attr({
                            'class': 'bar'
                        });

                    group
                        .attr({
                            x: barX,
                            y: barY,
                            fill: barColor,
                            width: barWidth,
                            height: barHeight
                        })
                        .on('mouseover', self.onBarOver)
                        .on('mouseleave', self.onBarLeave)
                        .on('click', onBarClick);
                };

                /*jslint unparam:true*/
                function barTooltip(bar, barIndex, groupIndex) {
                    var group = model.getAt(groupIndex);

                    return mustache.render(barTooltipTpl, {
                        group: group.getLabel(),
                        categoryLabel: i18n.trans('Category'),
                        category: bar.getLabel(),
                        valueLabel: i18n.trans('Percentage'),
                        percent: d3.format('%')(bar.getPercent() / 100),
                        answerLabel: i18n.trans('Answers'),
                        count: bar.getCount()
                    });
                }
                /*jslint unparam:false*/

                self.onBarOver = function () {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr({
                            y: onOverBarY,
                            height: onOverBarHeight,
                            opacity: self.config.overOpacity
                        });

                    tooltip.show(d3.event, barTooltip.apply(this, arguments));
                };

                self.onBarLeave = function () {
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

                self.updateColor = function (type) {
                    self.barGroupsView
                        .selectAll('.bar-group')
                        .selectAll('.bar')
                        .filter(function (bar) {
                            return bar.getId() === type;
                        })
                        .attr('fill', barColor);
                };

                self.init = function () {
                    buildAxes();
                    initXAxis();
                    initYAxis();
                    initBars();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
