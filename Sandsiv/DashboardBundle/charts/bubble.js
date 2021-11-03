/*global define*/
define([
    'angular',
    'd3',
    'mustache',
    'core/i18n',
    'text!../template/tooltip.html'
], function (ng, d3, mustache, i18n, tooltipTemplate) {
    'use strict';

    var λ = require('ramda');

    return ['axisService', 'gridService', 'tooltipService',
        'underscoreExtraService', 'axisLabelService', 'textEditorService',
        function (
            Axis,
            grid,
            tooltip,
            unE,
            axisLabel,
            labelEditor
        ) {
            return function (conf) {
                var model = conf.model,
                    self = this,
                    pencilUnicode = '&#x270f;',
                    GROUP_SEGMENT_TITLE_OFFSET = -5,
                    defaults;

                defaults = {
                    overOpacity: 0.6,
                    animationDuration: 500,
                    overRadius: 10,
                    maxRadius: 50,
                    minRadius: 5,
                    axisOffset: 0.25,
                    margin: {
                        left: 50,
                        top: 10,
                        right : 10,
                        bottom: 0
                    },
                    axes: {
                        left: {
                            ticks: 10,
                            textSize: 35,
                            tickSize: 5,
                            labelSize: 15,
                            size: 0
                        },
                        bottom: {
                            textSize: 40,
                            tickSize: 5,
                            labelSize: 15,
                            labelMargin: 10
                        }
                    }
                };

                self.config = conf.config;
                unE.defaults(self.config, defaults);
                self.svg = d3.select(conf.svg);

                if(self.config.isExternalDataChart) {
                    self.segmentGroupsTitles = λ.uniq(model.data.map((x)=> {
                        return {
                            segmentGroupTitle: x.segmentGroupTitle,
                            value : x.value
                        };
                    }));

                }

                function getChartOffset() {
                    var config = self.config;

                    return {
                        x: config.margin.left + config.axes.left.size,
                        y: config.margin.top
                    };
                }

                function translateToChartOffset() {
                    var offset = getChartOffset();

                    return "translate({0}, {1})".format(offset.x, offset.y);
                }

                function getChartHeight() {
                    var config = self.config;

                    return model.getHeight() -
                        config.margin.top - config.margin.bottom -
                        config.axes.bottom.labelSize - config.axes.bottom.labelMargin;
                }

                function translateToChartEnd() {
                    var offset = getChartOffset();

                    return "translate({0}, {1})"
                        .format(offset.x, offset.y + getChartHeight());
                }

                function getChartWidth() {
                    var config = self.config;

                    return model.getWidth() -
                        config.margin.left - config.margin.right -
                        config.axes.left.size;
                }

                function axisOffset(min, max) {
                    return (max - min) * self.config.axisOffset;
                }

                function getYDomain() {
                    var max = d3.max([model.getMaxScore(), 0]),
                        min = d3.min([model.getMinScore(), 0]),
                        offset = axisOffset(min, max);

                    return [
                        min - offset,
                        max + offset
                    ];
                }

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

                function initYAxis() {
                    var axisConfig = self.config.axes.left;

                    self.yScale = d3.scale.linear()
                        .domain(getYDomain())
                        .range([getChartHeight(), 0]);

                    self.yAxis = new Axis({
                        scale: self.yScale,
                        orient: 'left',
                        ticks: axisConfig.ticks,
                        textSize: axisConfig.textSize,
                        tickFormat: function (value) {
                            return self.config.isExternalDataChart ? value : value + '%';
                        }
                    });

                    self.yAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
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

                function getXDomain() {
                    var max = model.getMaxValue(),
                        min = model.getMinValue(),
                        offset = axisOffset(min, max);

                    let domain = self.config.isExternalDataChart ? [0, Math.ceil(max + offset)] : [min - offset, max + offset];
                    return domain;
                }

                function initXAxis() {
                    var axisConfig = self.config.axes.bottom;

                    self.xScale = d3.scale.linear()
                        .domain(getXDomain());

                    self.xAxis = new Axis({
                        scale: self.xScale,
                        orient: 'bottom',
                        textSize: axisConfig.textSize,
                        tickFormat: function (value) {
                            return parseFloat(value.toFixed(2));
                        }
                    });

                    self.xAxisLabel = axisLabel()
                        .emptyText(pencilUnicode)
                        .onRound(tickTooltip)
                        .y(axisConfig.labelMargin);

                    self.vGrid = grid({
                        orient: 'vertical',
                        size: getChartHeight(),
                        scale: self.xScale,
                        values: self.xScale.ticks(axisConfig.ticks)
                    });

                    self.vGridView = self.svg.append("g")
                        .attr("class", "vertical-grid grid");

                    self.xAxisView = self.svg.append("g")
                        .attr("class", "x axis");

                    self.xAxisLabelView = self.svg.append("g")
                        .attr("class", "x axis-label");
                }

                function initBubbles() {
                    self.bubblesView = self.svg.append("g")
                        .attr("class", "bubbles");
                }

                function translateToYZero() {
                    var yZero = self.yScale(0),
                        offset = getChartOffset();

                    return "translate({0}, {1})"
                            .format(offset.x, yZero + offset.y);
                }

                function bubbleRadius(bubble) {
                    var max = model.getMaxCount(),
                        config = self.config,
                        r;

                    r = bubble.getCount() / max * config.maxRadius;

                    return r < config.minRadius ? config.minRadius : r;
                }

                function orderByRadius(fBubble, sBubble) {
                    return sBubble.getCount() - fBubble.getCount();
                }

                function bubbleX(bubble) {
                    return self.xScale(bubble.getValue());
                }

                function titleGroupXOffset(group) {
                    return "translate({0}, {1})"
                        .format(self.xScale(group.value), GROUP_SEGMENT_TITLE_OFFSET);
                }

                function bubbleY(bubble) {
                    return self.yScale(bubble.getScore());
                }

                function bubbleFill(bubble) {
                    return bubble.getColor();
                }

                //todo investigate
                // function bubbleOrderGetter(bubble) {
                //     return bubble.getLabel();
                // }

                function overRadius(bubble) {
                    return bubbleRadius(bubble) + self.config.overRadius;
                }

                function highlight() {
                    /*jshint validthis: true */

                    var config = self.config;

                    d3.select(this)
                        .transition()
                        .duration(config.animationDuration)
                        .attr({
                            opacity: config.overOpacity,
                            r: overRadius
                        });
                }

                function unhighlight() {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .duration(self.config.animationDuration)
                        .attr({
                            opacity: 1,
                            r: bubbleRadius
                        });
                }

                function bubbleTooltip(bubble) {
                    return mustache.render(tooltipTemplate, {
                        labelLabel: i18n.trans('Name'),
                        label: bubble.getLabel(),
                        valueLabel: bubble.getValueLabel(),
                        value: bubble.getValue(),
                        scoreLabel: bubble.getScoreLabel(),
                        score: bubble.getScore().toFixed(2),
                        countLabel: i18n.trans('Answers'),
                        count: bubble.getCount(),
                        sign: !self.config.isExternalDataChart ? '%' : ''
                    });
                }

                function onBubbleOver() {
                    /*jshint validthis: true */

                    highlight.apply(this, arguments);
                    tooltip.show(d3.event, bubbleTooltip.apply(this, arguments));
                }

                function onBubbleOut() {
                    /*jshint validthis: true */

                    unhighlight.apply(this, arguments);
                    tooltip.hide();
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
                            self.xAxisLabelView.call(self.xAxisLabel);
                            self.config.onLabelChange(text, 'group', 'axis');
                        });
                }

                function drawSegmentGroupTitles(groups) {
                    let groupTitles;

                    self.svg.selectAll('.group-titles').remove();

                    self.groupTitlesView = self.svg.append("g")
                        .attr("class", "group-titles");

                    groupTitles = self.groupTitlesView
                        .attr("transform", translateToChartOffset)
                        .selectAll('.group-title')
                        .remove()
                        .data(groups);

                    groupTitles.enter()
                        .append('g');

                    groupTitles
                        .attr('transform',titleGroupXOffset)
                            .append('text')
                            .attr("transform", "rotate(-65)" )
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "20px")
                            .attr("fill", "red")
                            .text((d)=> d.segmentGroupTitle);

                    groupTitles.exit().remove();

                }

                self.draw = function () {
                    var bubbles;

                    self.xScale
                        .range([0, getChartWidth()]);

                    self.xAxisView
                        .attr("transform", translateToYZero)
                        .call(self.xAxis.axisFn);

                    self.xAxisLabel
                        .x(getChartWidth() / 2)
                        .maxWidth(getChartWidth())
                        .text(self.config.axes.bottom.label)
                        .readOnly(self.config.readOnly);

                    self.xAxisLabelView
                        .attr('transform', translateToChartEnd)
                        .call(self.xAxisLabel)
                        .select('.over-helper')
                        .attr('width', getChartWidth());

                    self.xAxisLabelView.selectAll('text.axis-label')
                        .on('click', onXAxisClick);

                    self.vGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.vGrid);

                    self.yAxisLabel
                        .y(getChartHeight() / 2)
                        .call(rotateYAxisLabel)
                        .maxWidth(getChartHeight())
                        .text(self.config.axes.left.label)
                        .overRectX(-self.config.axes.left.size)
                        .readOnly(self.config.readOnly);

                    self.yAxisView
                        .attr("transform", translateToChartOffset)
                        .call(self.yAxis.axisFn)
                        .call(self.yAxisLabel);

                    self.yAxisView.selectAll('text.axis-label')
                        .on('click', onYAxisClick);

                    self.hGrid
                        .size(getChartWidth());

                    self.hGridView
                        .attr("transform", translateToChartOffset)
                        .call(self.hGrid);

                    bubbles = self.bubblesView
                        .attr("transform", translateToChartOffset)
                        .selectAll('.bubble')
                        .data(model.data);

                    //bubbleOrderGetter

                    bubbles.enter()
                        .append('circle')
                        .attr({
                            'class': 'bubble',
                            r: bubbleRadius
                        })
                        .on('mouseover', onBubbleOver)
                        .on('mouseout', onBubbleOut);


                    let bubbleConfig = {
                        cx: bubbleX,
                        cy: bubbleY,
                        fill: bubbleFill,
                        r: bubbleRadius
                    };

                    bubbleConfig = Object.assign(bubbleConfig, {
                        stroke: '#000000',
                        'stroke-linecap': 'round',
                        'stroke-width': '1'
                    });

                    if(self.config.isExternalDataChart) {
                        drawSegmentGroupTitles(self.segmentGroupsTitles);
                    }

                    bubbles
                        .attr(bubbleConfig)
                        .sort(orderByRadius);
                };

                self.highlightBubble = function (hBubble) {
                    self.bubblesView
                        .selectAll('.bubble')
                        .filter(function (bubble) {
                            return bubble === hBubble;
                        })
                        .each(highlight);
                };

                self.unHighlightBubble = function (hBubble) {
                    self.bubblesView
                        .selectAll('.bubble')
                        .filter(function (bubble) {
                            return bubble === hBubble;
                        })
                        .each(unhighlight);
                };

                self.getColorAreas = function () {
                    return self.bubblesView
                        .selectAll('.bubble');
                };

                self.updateColor = function (bubbleModel) {
                    self.bubblesView
                        .selectAll('.bubble')
                        .filter(function (bubble) {
                            return bubble.getId() === bubbleModel.getId();
                        })
                        .attr('fill', bubbleFill);
                };

                self.init = function () {
                    initYAxis();
                    initXAxis();
                    initBubbles();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
