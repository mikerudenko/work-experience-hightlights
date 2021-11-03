/*global define*/
define([
    'angular',
    'd3',
    'underscore',
    'mustache',
    'core/i18n',
    'text!../template/tooltipTemplate.html'
], function (ng, d3, un, mustache, i18n, tooltipTemplate) {
    'use strict';

    return ['axisService', 'gridService', 'tooltipService',
        'underscoreExtraService', 'scaleThinningService',
        'axisLabelService', 'textEditorService', 'axisFactory',
        function (
            Axis,
            grid,
            tooltip,
            unE,
            scaleThinner,
            axisLabel,
            labelEditor,
            AxisFactory
        ) {
            return function (conf) {
                var model = conf.model,
                    npsModel = conf.npsModel,
                    labels = conf.labels,
                    self = this,
                    pencilUnicode = '&#x270f;',
                    defaults;

                defaults = {
                    overOpacity: 0.2,
                    animationDuration: 500,
                    radius: 3,
                    overRadius: 7,
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
                            textSize: 40,
                            decimateSize: 20,
                            labelMargin: 3
                        },
                        right: {
                            ticks: 10,
                            delimiter: '%',
                            labelMargin: 3
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

                function translateToAxesOffset() {
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

                function tickDelimiter(value) {
                    return value + self.config.axes.left.delimiter;
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
                    return self.xThinner()[groupIndex].label;
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
                        textSize: axisConfig.textSize,
                        tickFormat: tickDelimiter,
                        onRound: onLabelRender,
                        ticks: axisConfig.ticks
                    });

                    self.yAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(onLabelRender)
                        .x(-axisConfig.textSize);

                    self.yAxisView = self.svg.append("g")
                        .attr("class", "y axis");

                    self.hGrid = grid({
                        orient: 'horizontal',
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
                        onRound: onLabelRender,
                        tickFormat: customLabel,
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

                /*jslint unparam:true*/
                function lineX(value, index) {
                    return self.xScale(labels.getLabel(index).id);
                }
                /*jslint unparam:false*/

                function lineY(value, index) {
                    var percent = value * 100 / model.indexSum(index);

                    return self.yScale(percent);
                }

                function initLines() {
                    self.linesView = self.svg.append("g")
                        .attr("class", "lines");

                    self.lineFn = d3.svg.line()
                        .x(lineX)
                        .y(lineY)
                        .interpolate('linear');
                }

                function npsLineY(value) {
                    return self.rightScale(value);
                }

                function initNpsLine() {
                    self.npsLineView = self.linesView.append("g")
                        .datum(npsModel)
                        .attr("class", "line nps-group");

                    self.npsLineView
                        .append('path')
                        .attr({
                            'class': 'nps-line-path line-path',
                            fill: 'none'
                        });

                    self.npsLineFn = d3.svg.line()
                        .x(lineX)
                        .y(npsLineY)
                        .interpolate('linear');
                }

                function npsDotTooltip(value, index) {
                    return mustache.render(tooltipTemplate, {
                        group: labels.getLabel(index).label,
                        percentLabel: i18n.trans('Nps score'),
                        percent: value.toFixed(2),
                        countLabel: i18n.trans('Count'),
                        count: model.indexSum(index)
                    });
                }

                /*jslint unparam:true*/
                function onNpsDotOver(value, index, lineIndex) {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr('r', self.config.overRadius);

                    tooltip.show(d3.event, npsDotTooltip.apply(this, arguments));
                    self.highlightLine(npsModel);
                }
                /*jslint unparam:false*/

                function onNpsDotLeave() {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr('r', self.config.radius);

                    tooltip.hide();
                    self.unHighlightLine();
                }

                function xAxisTicks() {
                    return Math.floor(getChartWidth() /
                        self.config.axes.bottom.decimateSize);
                }

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

                function onXTickCLick(item) {
                    /*jshint validthis: true */

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, item.label)
                        .promise.then(function (text) {
                            item.label = text;

                            self.draw();
                            self.config.onLabelChange(text, item.id, 'tick');
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

                    groupLabels = labels.getLabels().map(function (label) {
                        return label.id;
                    });

                    self.xScale
                        .rangePoints([0, getChartWidth()])
                        .domain(groupLabels);

                    self.xThinner
                        .ticks(xAxisTicks())
                        .domain(labels.getLabels());

                    self.xAxisLabel
                        .x(getChartWidth() / 2)
                        .maxWidth(getChartWidth())
                        .text(config.axes.bottom.label)
                        .readOnly(self.config.readOnly);

                    self.xAxis.axis
                        .tickValues(self.xThinner().map(function (label) {
                            return label.id;
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
                        .values(self.xThinner().map(function (label) {
                            return label.id;
                        }));

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
                        .attr("transform", translateToAxesOffset)
                        .call(self.yAxis.axisFn)
                        .call(self.yAxisLabel);

                    self.yAxisView.selectAll('text.axis-label')
                        .on('click', onYAxisClick);

                    self.hGrid
                        .size(getChartWidth());

                    self.hGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.hGrid);

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

                    self.drawLines();
                };

                function color(line) {
                    return line.getColor();
                }

                function linePath(line) {
                    return self.lineFn(line.getValues());
                }

                function appendLine() {
                    /*jshint validthis: true */

                    this.append('path')
                        .attr({
                            'class': 'line-path',
                            d: linePath,
                            stroke: color,
                            fill: 'none'
                        });

                    return this;
                }

                function dotTooltip(value, index, lineIndex) {
                    var line = model.getAt(lineIndex);

                    return mustache.render(tooltipTemplate, {
                        group: labels.getLabel(index).label,
                        labelLabel: i18n.trans('Name'),
                        label: line.getLabel(),
                        percentLabel: i18n.trans('Percentage'),
                        percent: (value * 100 /
                            model.indexSum(index)).toFixed(2),
                        countLabel: i18n.trans('Count'),
                        count: value
                    });
                }

                /*jslint unparam:true*/
                function onDotOver(value, index, lineIndex) {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr('r', self.config.overRadius);

                    tooltip.show(d3.event, dotTooltip.apply(this, arguments));
                    self.highlightLine(model.getAt(lineIndex));
                }
                /*jslint unparam:false*/

                function onDotLeave() {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr('r', self.config.radius);

                    tooltip.hide();
                    self.unHighlightLine();
                }

                /*jslint unparam:true*/
                function onDotClick(value, index, lineIndex) {
                    self.config.onItemClick(model.getAt(lineIndex).getId(), labels.getLabel(index).id);
                }

                /*jslint unparam:false*/

                /*jslint unparam:true*/
                function dotColor(value, index, lineIndex) {
                    return color(model.getAt(lineIndex));
                }
                /*jslint unparam:false*/

                function appendDots() {
                    /*jshint validthis: true */

                    var dots;

                    dots = this.selectAll('circle')
                        .data(function (line) {
                            return line.getValues();
                        });

                    dots.enter()
                        .append('circle')
                        .attr({
                            r: self.config.radius,
                            'class': 'line-dot'
                        })
                        .on('mouseover', onDotOver)
                        .on('mouseleave', onDotLeave)
                        .on('click', onDotClick);

                    dots.attr({
                        cx: lineX,
                        cy: lineY,
                        fill: dotColor
                    });

                    dots.exit()
                        .remove();

                    return this;
                }

                self.drawLines = function () {
                    var lines;

                    self.linesView
                        .attr('transform', translateToChartOffset);

                    lines = self.linesView
                        .selectAll('.line-group')
                        .data(model.data, function (line) {
                            return line.getLabel();
                        });

                    lines.enter()
                        .append('g')
                        .attr('class', 'line line-group')
                        .call(appendLine)
                        .call(appendDots);
                    lines.call(appendDots);


                    lines.selectAll('.line-path')
                        .attr({
                            d: linePath,
                            stroke: color
                        });

                    self.drawNpsLine();
                };

                self.drawNpsLine = function () {
                    var dots;

                    self.npsLineView
                        .select('.nps-line-path')
                        .attr({
                            d: self.npsLineFn(npsModel.getValues()),
                            stroke: npsModel.getColor()
                        });

                    dots = self.npsLineView
                        .selectAll('.nps-line-dot')
                        .data(npsModel.getValues());

                    dots.enter()
                        .append('circle')
                        .attr({
                            r: self.config.radius,
                            'class': 'nps-line-dot line-dot'
                        })
                        .on('mouseover', onNpsDotOver)
                        .on('mouseleave', onNpsDotLeave);

                    dots.attr({
                        cx: lineX,
                        cy: npsLineY,
                        fill: npsModel.getColor()
                    });

                    dots.exit().remove();
                };

                self.highlightLine = function (hLine) {
                    self.linesView
                        .selectAll('.line')
                        .sort(function (line) {
                            return line === hLine ? 1 : -1;
                        })
                        .transition()
                        .attr('opacity', function (line) {
                            return line === hLine ?
                                    1 : self.config.overOpacity;
                        });
                };

                self.unHighlightLine = function () {
                    self.linesView
                        .selectAll('.line')
                        .transition()
                        .attr('opacity', 1);
                };

                self.getColorAreas = function () {
                    return self.linesView.selectAll('.line-group');
                };

                self.getNpsColorArea = function () {
                    return self.npsLineView;
                };

                self.updateColor = function (lineModel) {
                    var group,
                        modelColor = lineModel.getColor();

                    group = self.linesView
                        .selectAll('.line')
                        .filter(function (line) {
                            return line.getId() === lineModel.getId();
                        });

                    group.selectAll('.line-path')
                        .attr('stroke', modelColor);

                    group.selectAll('.line-dot')
                        .attr('fill', modelColor);

                };

                self.init = function () {
                    buildAxes();
                    initXAxis();
                    initYAxis();
                    initRightAxis();
                    initLines();
                    initNpsLine();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
