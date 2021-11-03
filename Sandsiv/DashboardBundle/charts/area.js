/*global define*/
define([
    'angular',
    'd3',
    'underscore'
], function (ng, d3, un) {
    'use strict';

    return ['axisService', 'gridService', 'underscoreExtraService',
        'scaleThinningService', 'axisLabelService', 'textEditorService',
        'tooltipService', 'axisFactory',
        function (
            Axis,
            grid,
            unE,
            scaleThinner,
            axisLabel,
            labelEditor,
            tooltip,
            AxisFactory
        ) {
            return function (conf) {
                var model = conf.model,
                    labels = conf.labels,
                    self = this,
                    pencilUnicode = '&#x270f;',
                    defaults;

                defaults = {
                    overOpacity: 0.2,
                    animationDuration: 500,
                    areaOpacity: 0.7,
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
                        config.axes.left.size();
                }

                function getChartHeight() {
                    var config = self.config;

                    return model.getHeight() -
                        config.margin.top - config.margin.bottom -
                        config.axes.bottom.size();
                }

                function tickFormat(value) {
                    return value + '%';
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
                        ticks: axisConfig.ticks,
                        onRound: onLabelRender,
                        tickFormat: tickFormat
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
                function areaX(area, index) {
                    return self.xScale(labels.getLabel(index).id);
                }
                /*jslint unparam:false*/

                function initArea() {
                    self.areasView = self.svg.append("g")
                        .attr("class", "areas");

                    self.areaFn = d3.svg.area()
                        .x(areaX)
                        .y0(function (areaPoint) {
                            return self.yScale(areaPoint.y0);
                        })
                        .y1(function (areaPoint) {
                            return self.yScale(areaPoint.y0 + areaPoint.y);
                        });

                    self.stackFn = d3.layout.stack()
                        .values(function (area) {
                            return area.getData();
                        });
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
                        .promise.then(function (text) {
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
                        .promise.then(function (text) {
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
                        .promise.then(function (text) {
                            axis.label = text;

                            self.xAxisLabel.text(text);
                            self.xAxisView.call(self.xAxisLabel);
                            self.config.onLabelChange(text, 'group', 'axis');
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

                    self.drawArea();
                };

                function color(area) {
                    return area.getColor();
                }

                function onAreaOver(area) {
                    self.highlightArea(area);
                }

                function onAreaLeave() {
                    self.unHighlightArea();
                }

                function onAreaClick(area) {
                    self.config.onItemClick(area);
                }

                function isPhantomAttribute(attribute) {
                    return /others/i.test(attribute);
                }

                self.drawArea = function () {
                    var areas;

                    self.areasView
                        .attr('transform', translateToChartOffset);

                    areas = self.areasView.selectAll('.area')
                        .data(model.data, function (item) {
                            return item.getId();
                        });

                    self.stackFn(model.data);

                    areas.enter()
                        .append('path')
                        .attr({
                            'class':  function(item) {
                                var state = isPhantomAttribute(item.id) ? '' : 'area-chart__area__interactive';
                                return 'area ' + state;
                            },
                            opacity: self.config.areaOpacity
                        })
                        .on('mouseover', onAreaOver)
                        .on('mouseleave', onAreaLeave)
                        .on('click', onAreaClick);

                    areas.attr({
                        fill: color,
                        d: function (area) {
                            return self.areaFn(area.getData());
                        }
                    });
                };

                self.highlightArea = function (hArea) {
                    var config = self.config;

                    self.areasView
                        .selectAll('.area')
                        .transition()
                        .duration(config.animationDuration)
                        .attr('opacity', function (area) {
                            return area === hArea ?
                                    1 : config.overOpacity;
                        });
                };

                self.unHighlightArea = function () {
                    self.areasView
                        .selectAll('.area')
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr('opacity', self.config.areaOpacity);
                };

                self.getColorAreas = function () {
                    return self.areasView.selectAll('.area');
                };

                self.init = function () {
                    buildAxes();
                    initXAxis();
                    initYAxis();
                    initArea();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
