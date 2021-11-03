/*global define*/
define([
    'angular',
    'underscore',
    'd3',
    'topojson',
    'text!../assets/countries.json',
    'text!../template/tooltip.html',
    'mustache',
    'core/i18n'
], function (ng, un, d3, topojson, worldJson, tooltipTemplate, mustache, i18n) {
    'use strict';

    return ['tooltipService', 'underscoreExtraService',
        function (tooltip, unE) {
            return function (conf) {
                var model = conf.model,
                    self = this,
                    defaults;

                defaults = {
                    fill: '#eaeaea',
                    overFill: '#bebdbd',
                    strokeWidth: 0.1,
                    strokeWidthOver: 0.4,
                    margin: {
                        left: 10,
                        top: 10,
                        right : 10,
                        bottom: 0
                    }
                };

                self.config = conf.config;
                unE.defaults(self.config, defaults);
                self.svg = d3.select(conf.svg);

                function getChartWidth() {
                    var config = self.config;

                    return model.getWidth() -
                        config.margin.left - config.margin.right;
                }

                function getChartHeight() {
                    var config = self.config;

                    return model.getHeight() -
                        config.margin.top - config.margin.bottom;
                }

                function zoomed() {
                    self.geoView
                        .attr("transform", "translate(" +
                            d3.event.translate +
                            ")scale(" + d3.event.scale + ")");
                }

                function initMap() {
                    var world = JSON.parse(worldJson);

                    self.geoData = topojson
                        .feature(world, world.objects.countries)
                        .features;

                    self.projection = d3.geo.mercator()
                        .translate([getChartWidth() / 2, getChartHeight() / 1.4])
                        .scale(80);

                    self.zoom = d3.behavior.zoom()
                        .scaleExtent([1, 15])
                        .on('zoom', zoomed);

                    self.pathFn = d3.geo.path()
                        .projection(self.projection);

                    self.geoView = self.svg
                        .append('g')
                        .attr('class', 'countries');

                    self.svg
                        .call(self.zoom);
                }

                function color(country) {
                    var countryModel = model.find(country.id);

                    return countryModel ?
                            countryModel.getColor() : self.config.fill;
                }

                function strokeColor() {
                    /*jshint validthis: true */

                    return d3.rgb(color.apply(this, arguments))
                            .darker();
                }

                function tooltipHtml(country) {
                    var cModel = model.find(country.id);

                    return mustache.render(tooltipTemplate, {
                        country: country.properties.name,
                        scoreLabel: i18n.trans('Nps score'),
                        score: cModel ? cModel.getScore() : false
                    });
                }

                function highlight() {
                    /*jshint validthis: true */

                    var config = self.config;

                    d3.select(this)
                        .transition()
                        .attr({
                            'stroke-width': config.strokeWidthOver,
                            fill: config.overFill,
                            stroke: function () {
                                return d3.rgb(config.overFill).darker();
                            }
                        });
                }

                function unHighlight() {
                    /*jshint validthis: true */

                    d3.select(this)
                        .transition()
                        .attr({
                            'stroke-width': self.config.strokeWidth,
                            fill: color,
                            stroke: strokeColor
                        });
                }

                function onCountryOver() {
                    /*jshint validthis: true */

                    highlight.apply(this, arguments);
                    tooltip.show(d3.event, tooltipHtml.apply(this, arguments));
                }

                function onCountryLeave() {
                    /*jshint validthis: true */

                    unHighlight.apply(this, arguments);
                    tooltip.hide();
                }

                function drawMap() {
                    var selection = self.geoView.selectAll('.country').data(self.geoData);
                    var attribures = {
                            class: 'country',
                            d: self.pathFn,
                            'stroke-width': self.config.strokeWidth,
                            fill: color,
                            stroke: strokeColor
                    };

                    selection
                    .enter()
                        .append('path')
                        .attr(attribures)
                        .on('mouseover', onCountryOver)
                        .on('mouseleave', onCountryLeave);
    
                    selection
                    .attr(attribures);
                }

                self.draw = function () {
                    drawMap();
                };

                self.highlight = function (countries) {
                    self.geoView.selectAll('.country')
                        .each(function (country) {
                            var item = un.find(countries, function (oCountry) {
                                return oCountry.getId() === country.id;
                            });

                            if (item) {
                                highlight.apply(this, [country]);
                            }
                        });
                };

                self.unHighligh = function (countries) {
                    self.geoView.selectAll('.country')
                        .each(function (country) {
                            var item = un.find(countries, function (oCountry) {
                                return oCountry.getId() === country.id;
                            });

                            if (item) {
                                unHighlight.call(this);
                            }
                        });
                };

                self.getColorAreas = function () {
                    return self.geoView.selectAll('.country');
                };

                self.init = function () {
                    initMap();

                    self.draw();
                };

                self.destroy = ng.noop;
            };
        }];
});
