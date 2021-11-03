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
        'tooltipService', 'scaleThinningService',
        'axisLabelService', 'textEditorService', 'underscoreExtraService',
        'axisFactory',
        function (
            Axis,
            grid,
            layoutVerticalStack,
            tooltip,
            scaleThinner,
            axisLabel,
            labelEditor,
            unE,
            AxisFactory
        ) {
            return function (conf) {
                var model = conf.model,
                    npsModel = conf.npsModel,
                    self = this,
                    pencilUnicode = '&#x270f;',
                    defaults;

                defaults = {
                    groupPadding: 10, // %
                    overOpacity: 0.4,
                    animationDuration: 500,
                    nps: {
                        radius: 5,
                        overRadius: 8
                    },
                    margin: {
                        left: 10,
                        top: 10,
                        right : 10,
                        bottom: 0
                    },
                    axes: {
                        left: {
                            ticks: 10,
                            delimiter: '%'
                        },
                        bottom: {
                            decimateSize: 20,
                            labelMargin: 3
                        },
                        right: {
                            ticks: 10,
                            labelMargin: 3,
                            delimiter: '%'
                        }
                    }
                };

                self.config = conf.config;
                unE.defaults(self.config, defaults);
                self.svg = d3.select(conf.svg);

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

                function getChartWidth() {
                    var config = self.config;

                    return model.getWidth() -
                        config.margin.left - config.margin.right -
                        config.axes.left.size() -
                        config.axes.right.size();
                }

                function translateRightAxes() {
                    var offset = getChartOffset();

                    return "translate({0}, {1})".format(offset.x + getChartWidth(), offset.y);
                }


                function getChartHeight() {
                    var config = self.config;

                    return model.getHeight() -
                        config.margin.top - config.margin.bottom -
                        config.axes.bottom.size();
                }

                function onTickLeave() {
                    tooltip.hide();
                }

                function onLabelRender(label, rounded) {
                    /*jshint validthis: true */

                    d3.select(this)
                        .on('mouseover', function () {
                            if (rounded) {
                                tooltip.showText(d3.event, label);
                            }
                        })
                        .on('mouseleave', onTickLeave);
                }

                /*jslint unparam:true*/
                function customLabel(tick, groupIndex) {
                    return self.xThinner()[groupIndex].getLabel();
                }
                /*jslint unparam:false*/

                function buildAxes() {
                    un.each(self.config.axes, function (axis, key) {
                        self.config.axes[key] = new AxisFactory(axis);
                    });
                }

                function initYAxis() {
                    var axisConfig = self.config.axes.left;

                    self.yScale = d3.scale.linear()
                        .domain([0, 100])
                        .range([getChartHeight(), 0]);

                    self.yAxis = new Axis({
                        scale: self.yScale,
                        orient: 'left',
                        ticks: axisConfig.ticks,
                        textSize: axisConfig.textSize,
                        onRound: onLabelRender,
                        tickFormat: function (value) {
                            return value + axisConfig.delimiter;
                        }
                    });

                    self.yAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(onLabelRender)
                        .x(-axisConfig.textSize);

                    self.yAxisView = self.svg.append("g")
                        .attr("class", "y axis");

                    self.hGrid = grid({
                        orient: 'horizontal',
                        size: getChartWidth(),
                        scale: self.yScale,
                        values: self.yScale.ticks(axisConfig.ticks)
                    });

                    self.hGridView = self.svg.append("g")
                        .attr("class", "horizontal-grid grid");
                }

                function initRightAxis() {
                    var axisConfig = self.config.axes.right;

                    self.rightScale = d3.scale.linear()
                        .domain([-100, 100])
                        .range([getChartHeight(), 0]);

                    self.rightAxis = new Axis({
                        scale: self.rightScale,
                        orient: 'right',
                        ticks: axisConfig.ticks,
                        textSize: axisConfig.textSize,
                        onRound: onLabelRender,
                        tickFormat: function (value) {
                            return value + axisConfig.delimiter;
                        }
                    });

                    self.rightAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(onLabelRender)
                        .x(axisConfig.size() - axisConfig.labelSize + axisConfig.labelMargin);

                    self.rightAxisView = self.svg.append("g")
                        .attr("class", "y-rigth axis");

                }

                function initXAxis() {
                    var axisConfig = self.config.axes.bottom;

                    self.xScale = d3.scale.ordinal();

                    self.xThinner = scaleThinner();

                    self.xAxis = new Axis({
                        scale: self.xScale,
                        orient: 'bottom',
                        textSize: axisConfig.textSize,
                        tickSize: axisConfig.tickSize,
                        tickFormat: customLabel,
                        onRound: onLabelRender,
                        rotate: 90
                    });

                    self.xAxisView = self.svg.append("g")
                        .attr("class", "x axis");

                    self.xAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(onLabelRender)
                        .y(axisConfig.size() - axisConfig.labelSize + axisConfig.labelMargin);

                    self.vGrid = grid({
                        orient: 'vertical',
                        size: getChartHeight(),
                        scale: self.xScale,
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

                    /*jslint unparam: true*/
                    self.stacked = layoutVerticalStack()
                        .values(function (bar) {
                            return bar.data;
                        })
                        .y(function (barSlice) {
                            return barSlice.getPercent();
                        })
                        .x(function (barSlice, index, bar) {
                            return bar.getId();
                        });
                    /*jslint unparam:false*/

                }

                function npsX(bar) {
                    return self.xScale(bar.getId()) + self.xScale.rangeBand() / 2;
                }

                function npsY(bar) {
                    return self.rightScale(bar.getScore());
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
                            'class': 'nps-line',
                            fill: 'none'
                        });
                }

                /*jslint unparam:true*/
                function barX(bar, index, groupIndex) {
                    return self.xScale(bar.x) + self.xScale.rangeBand() *
                        self.config.groupPadding / 100;
                }
                /*jslint unparam:false*/

                function barY(bar) {
                    return self.yScale(bar.y0 + bar.y);
                }

                function barHeight(bar) {
                    return getChartHeight() - self.yScale(bar.y);
                }

                /*jslint unparam: true*/
                function barWidth(bar, index, groupIndex) {
                    return self.xScale.rangeBand() -
                        self.xScale.rangeBand() *
                        self.config.groupPadding / 50;
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
                function onBarItemClick(barItem, index, barIndex) {
                    self.config.onItemClick(barItem, model.getAt(barIndex));
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

                function rotateRightAxisLabel() {
                    /*jshint validthis: true */

                    var rotate = !!self.config.axes.right.label;

                    this
                        .rotate(rotate ? -90 : 0)
                        .dx(rotate ? '0em' : '1em')
                        .dy(rotate ? '0.71em' : '0em');

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

                function onXTickCLick(item, index) {
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

                function onRightAxisClick() {
                    /*jshint validthis: true */

                    var axis = self.config.axes.right;

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, axis.label)
                        .promise.then(function (text) {
                            axis.label = text;

                            self.rightAxisLabel
                                .call(rotateRightAxisLabel)
                                .text(text);

                            self.rightAxisView.call(self.rightAxisLabel);
                            self.config.onLabelChange(text, 'score', 'axis');
                        });
                }

                self.draw = function () {
                    var config = self.config,
                        groupLabels;

                    groupLabels = un.map(model.data, function (bar) {
                        return bar.getId();
                    });

                    self.xScale
                        .domain(groupLabels)
                        .rangeBands([0, getChartWidth()]);

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
                            .format(
                                offset.x,
                                model.getHeight() - config.margin.bottom -
                                    config.axes.bottom.size()
                            );
                    })
                        .call(self.xAxis.axisFn)
                        .call(self.xAxisLabel);

                    self.xAxisView.selectAll('.tick text')
                        .data(self.xThinner())
                        .on('click', onXTickCLick);

                    self.xAxisView.selectAll('text.axis-label')
                        .on('click', onXAxisClick);

                    self.vGrid.values(groupLabels);

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

                    self.yAxisView.selectAll('text.axis-label')
                        .on('click', onYAxisClick);

                    self.hGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.hGrid.size(getChartWidth()));

                    self.rightAxisLabel
                        .y(getChartHeight() / 2)
                        .call(rotateRightAxisLabel)
                        .maxWidth(getChartHeight())
                        .text(config.axes.right.label)
                        .readOnly(self.config.readOnly);

                    self.rightAxisView
                        .attr('transform', translateRightAxes)
                        .call(self.rightAxis.axisFn)
                        .call(self.rightAxisLabel);

                    self.rightAxisView.selectAll('text.axis-label')
                        .on('click', onRightAxisClick);

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
                        .on('click', onBarItemClick);
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
                            'd': self.npsLine(npsModel.data),
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
                            'class': 'nps-dot'
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
                    var bar = model.getAt(groupIndex);

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
                    return self.barGroupsView.
                        selectAll('.bar-group')
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
                    initRightAxis();
                    initBars();
                    initNpsLine();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
