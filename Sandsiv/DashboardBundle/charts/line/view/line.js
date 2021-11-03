/*global define*/
define([
    'angular',
    'd3',
    'underscore',
    'mustache',
    'core/i18n',
    'text!../template/lineTooltipTemplate.html'
], function(ng, d3, un, mustache, i18n, lineTooltipTemplate) {
    'use strict';

    return ['axisService', 'gridService', 'tooltipService',
        'underscoreExtraService', 'scaleThinningService',
        'axisLabelService', 'textEditorService', 'axisFactory',
        function(Axis,
                 grid,
                 tooltip,
                 unE,
                 scaleThinner,
                 axisLabel,
                 labelEditor,
                 AxisFactory) {
            return function(conf) {
                var model = conf.model,
                    labels = conf.labels,
                    pencilUnicode = '&#x270f;',
                    self = this,
                    modes,
                    defaults;

                defaults = {
                    overOpacity: 0.2,
                    animationDuration: 500,
                    radius: 3,
                    overRadius: 7,
                    absolute: true,
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
                        getDomain: function() {
                            const maxValue = model.getMax();
                            const minValue = (maxValue === model.getMin() ? 0 : model.getMin());
                            let range = maxValue - minValue;
                            let offset = maxValue !== model.getMin() ? range * 0.1 : 0;

                            return [minValue, maxValue];
                        },

                        yTickFormat: d3.format(20, 's'),

                        getValue: function(value) {
                            return value;
                        }
                    },

                    relative: {
                        getDomain: function() {
                            let maxValuePercent = 0;

                            model.data.forEach(item => {
                                item.data.forEach((indexSum, index) => {
                                    const indexTotalSum = model.indexSum(index);
                                    let indexPercent = indexSum * 100 / indexTotalSum;
                                    indexPercent = isNaN(indexPercent) ? 0 : indexPercent;
                                    maxValuePercent = maxValuePercent > indexPercent ? maxValuePercent : indexPercent;
                                });
                            });

                            maxValuePercent = maxValuePercent <= 90 ? Math.ceil(maxValuePercent + 10) : 100;

                            return [0, maxValuePercent];
                        },

                        yTickFormat: function(value) {
                            return value + '%';
                        },

                        getValue: function(value, index) {
                            return model.indexSum(index) > 0 ? parseFloat((value * 100 / model.indexSum(index)).toFixed(2)) : 0;
                        }
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

                function onTickLeave() {
                    tooltip.hide();
                }

                function onLabelRender(label, rounded) {
                    /*jshint validthis: true */

                    d3.select(this)
                        .on('mouseover', function() {
                            tooltip.showText(d3.event, label);
                        })
                        .on('mouseleave', onTickLeave);
                }

                /*jslint unparam:true*/
                function customLabel(tick, groupIndex) {
                    return self.xThinner()[groupIndex].label;
                }

                /*jslint unparam:false*/

                function buildAxes() {
                    un.each(self.config.axes, function(axis, key) {
                        self.config.axes[key] = new AxisFactory(axis);
                    });
                }

                function initYAxis() {
                    var axisConfig = self.config.axes.left;

                    self.yScale = d3.scale.linear()
                        .domain(modes[self.config.mode].getDomain())
                        .range([getChartHeight(), 0]);

                    self.yAxis = new Axis({
                        scale: self.yScale,
                        orient: 'left',
                        textSize: axisConfig.textSize,
                        onRound: onLabelRender,
                        tickFormat: modes[self.config.mode].yTickFormat
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

                function initXAxis() {
                    var axisConfig = self.config.axes.bottom;

                    self.xScale = d3.scale.ordinal();
                    self.xThinner = scaleThinner();

                    self.xAxis = new Axis({
                        scale: self.xScale,
                        orient: 'bottom',
                        textSize: self.config.axes.bottom.textSize,
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
                        offsetFn: function() {
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

                function lineY() {
                    /*jshint validthis: true */

                    var modeValue = modes[self.config.mode]
                        .getValue.apply(this, arguments);

                    return self.yScale(modeValue);
                }

                function initLines() {
                    self.linesView = self.svg.append("g")
                        .attr("class", "lines");

                    self.lineFn = d3.svg.line()
                        .defined(function(d) {
                            return d !== null;
                        })
                        .x(lineX)
                        .y(lineY)
                        .interpolate('monotone');
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

                function onXTickCLick(item) {
                    /*jshint validthis: true */

                    if (self.config.readOnly) {
                        return;
                    }

                    labelEditor.open(this, item.label)
                        .promise.then(function(text) {
                        item.label = text;

                        self.draw();
                        self.config.onLabelChange(text, item.id, 'tick');
                    });
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

                self.draw = function() {
                    var config = self.config,
                        groupLabels;

                    groupLabels = labels.getLabels().map(function(label) {
                        return label.id;
                    });

                    self.xScale
                        .rangePoints([0, getChartWidth()], 1)
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
                        .tickValues(self.xThinner().map(function(label) {
                            return label.id;
                        }));

                    self.xAxisView.attr("transform", function() {
                        var offset = getChartOffset();

                        return "translate({0}, {1})"
                            .format(offset.x, model.getHeight() - config.margin.bottom - config.axes.bottom.size());
                    })
                        .call(self.xAxis.axisFn)
                        .call(self.xAxisLabel);

                    self.yScale
                        .domain(modes[self.config.mode].getDomain());

                    self.xAxisView.selectAll('.tick text')
                        .data(self.xThinner())
                        .on('click', onXTickCLick);

                    self.xAxisView.selectAll('text.axis-label')
                        .on('click', onXAxisClick);

                    self.vGrid
                        .values(self.xThinner().map(function(label) {
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

                    self.hGrid.setValues(self.yScale.ticks(config.axes.left.ticks));

                    self.hGrid
                        .size(getChartWidth());

                    self.hGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.hGrid);

                    self.drawLines();

                    Axis.rotateTicks({
                        ticksCount: model.data[0].data.length,
                        chartWidth: getChartWidth(),
                        xAxisView: self.xAxisView
                    });
                };

                function color(line) {
                    return line.getColor();
                }

                function linePath(line) {
                    return self.lineFn(line.getData(), line);
                }

                function lineScore(line, index) {
                    const value = line !== null ? modes[self.config.mode].getValue(line, index) : '';
                    return value && self.config.mode === 'relative' ? value + '%' : value ;
                }

                function lineTextX(line, index) {
                    return lineX(line, index);
                }

                function lineTextY(line, index) {
                    const offset = 5;
                    return lineY(line, index) - offset;
                }

                function annotateLines(lines) {
                    var lineAnnotates = lines.selectAll('.label-item')
                        .data(function(line) {
                            return line.data;
                        })
                        .text(lineScore);

                    lineAnnotates
                        .exit()
                        .remove();

                    lineAnnotates.enter()
                        .append('text')
                        .attr({
                            x: lineTextX,
                            y: lineTextY,
                            'class': 'label-item annotate-score'
                        })
                        .text(lineScore);

                    lineAnnotates.attr({
                        x: lineTextX,
                        y: lineTextY
                    });
                }

                function appendLine() {
                    /*jshint validthis: true */

                    this.append('path')
                        .attr({
                            'class': 'line-path',
                            d: linePath,
                            fill: 'none'
                        });

                    return this;
                }

                function dotTooltip(value, index, lineIndex, countLabel) {
                    var line = model.getAt(lineIndex);

                    return mustache.render(lineTooltipTemplate, {
                        labelLabel: i18n.trans('Name'),
                        label: line.getLabel(),
                        percentLabel: i18n.trans('Percentage'),
                        percent: model.indexSum(index) > 0 ? (value * 100 / model.indexSum(index)).toFixed(2) : 0,
                        countLabel: i18n.trans(countLabel),
                        count: value
                    });
                }

                /*jslint unparam:true*/
                function onDotOver(value, index, lineIndex) {
                    /*jshint validthis: true */
                    const label = self.config.isAccumulativeFunction ? self.config.gadgetFunction : 'Count';
                    const countLabel = label[0].toUpperCase() + label.slice(1);
                    const args = [...Array.from(arguments), countLabel];
                    d3.select(this)
                        .transition()
                        .attr('r', self.config.overRadius);

                    tooltip.show(d3.event, dotTooltip.apply(this, args));
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

                function getLineDotClass(value) {
                    let isEmpty = [null].includes(value);
                    let additionalClass = isEmpty ? 'transparent-circle' : '';
                    return 'line-dot' + ' ' + additionalClass;
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
                        .data(function(line) {
                            return line.getData()
                        });

                    dots.enter()
                        .append('circle')
                        .attr({
                            cx: lineX,
                            cy: lineY,
                            r: self.config.radius,
                            'class': getLineDotClass
                        });

                    dots.on('mouseover', onDotOver)
                        .on('mouseleave', onDotLeave)
                        .on('click', onDotClick);

                    dots.attr({
                        cx: lineX,
                        cy: lineY,
                        fill: dotColor,
                        'class': getLineDotClass
                    });

                    dots.exit()
                        .remove();

                    return this;
                }

                function isPhantomAttribute(attribute) {
                    return /others/i.test(attribute);
                }

                self.drawLines = function() {
                    var lines;

                    self.linesView
                        .attr('transform', translateToChartOffset);

                    lines = self.linesView
                        .selectAll('.line-group')
                        .data(model.data, function(line) {
                            return line.getLabel();
                        });

                    lines.enter()
                        .append('g')
                        .attr('class', function(item) {
                            var state = isPhantomAttribute(item.id) ? '' : 'line-group__interactive';
                            return 'line-group ' + state;
                        })
                        .call(appendLine)
                        .call(appendDots);
                    lines.call(appendDots);

                    lines.selectAll('.line-path')
                        .attr({
                            d: linePath,
                            stroke: color
                        });

                    if (self.config.isAnnotateScore) {
                        annotateLines(lines);
                    }
                };

                self.highlightLine = function(hLine) {
                    self.linesView
                        .selectAll('.line-group')
                        .sort(function(line) {
                            return line === hLine ? 1 : -1;
                        })
                        .transition()
                        .attr('opacity', function(line) {
                            return line === hLine ?
                                1 : self.config.overOpacity;
                        });
                };

                self.unHighlightLine = function() {
                    self.linesView
                        .selectAll('.line-group')
                        .transition()
                        .attr('opacity', 1);
                };

                self.getColorAreas = function() {
                    return this.linesView
                        .selectAll('.line-group');
                };

                self.updateColor = function(lineModel) {
                    var group,
                        modelColor = lineModel.getColor();

                    group = self.linesView
                        .selectAll('.line-group')
                        .filter(function(line) {
                            return line.getId() === lineModel.getId();
                        });

                    group.selectAll('.line-path')
                        .attr('stroke', modelColor);

                    group.selectAll('.line-dot')
                        .attr('fill', modelColor);
                };

                self.init = function() {
                    buildAxes();
                    initXAxis();
                    initYAxis();
                    initLines();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
