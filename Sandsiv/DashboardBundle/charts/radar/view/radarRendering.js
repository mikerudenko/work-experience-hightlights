/*jshint sub: false */
/*jshint ignore: start */
define([
    'angular',
    'd3',
    'core/i18n'
], function (ng, d3, i18n) {
    'use strict';

    return [function () {
        return function (conf) {
            var model = conf.model,
                self = this,
                svg,
                group;
            self.config = conf.config;

            var cfg = {
                radius: 5,
                w: 0,
                h: 0,
                factor: 1,
                factorLegend: .85,
                levels: 10,
                maxValue: 0,
                radians: 2 * Math.PI,
                opacityArea: 0.5,
                ToRight: 5,
                TranslateX: 80,
                TranslateY: 30,
                ExtraWidthX: 400,
                ExtraWidthY: 0,
                color: d3.scale.category10()

            };


            function setWidthHeight (cfg){
                var rad ;
                if(model.getHeight() < model.getWidth()){
                    rad  = model.getHeight() - 50;
                }else {
                    rad  = model.getWidth()-100
                };
                cfg.w = rad;
                cfg.h = rad;

            };

            setWidthHeight (cfg);


            self.onItemOver = function (overModel) {
                group.selectAll('polygon')
                    .transition()
                    .attr('opacity', function (itemModel) {
                        if (overModel.data === itemModel.data) {
                           /* d3.select(this)
                                .select('.label')
                                .attr('opacity', 1);
                            */
                            return 1;
                        }

                        return 0.1;
                    });
                group.selectAll('circle')
                    .transition()
                    .attr('opacity', function (itemModel) {
                        if (overModel.data === itemModel.data) {
                            return 1;
                        }
                        return 0.1;
                    });

            };


            self.onItemOut = function () {


                group.selectAll('polygon')
                    .transition()
                    .attr('opacity', 1);

                group.selectAll('circle')
                    .transition()
                    .attr('opacity', 1);
            };


            function arcColor(item) {

                return item.data.getColor ? item.data.getColor() : item.data.data.getColor()
            }


            function textChange() {

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



            function pieLabelTickUpdate() {

                this
                    .select('line')
                    .transition()
                    .duration(500)
                    .call(lineChange)
                    .attr('y2', lineY2);
            }



            function pieLabelUpdate() {

                var pieLabel = this;

                pieLabel
                    .call(pieLabelTextUpdate);

                pieLabel
                    .call(pieLabelTickUpdate);

                return pieLabel;
            }



            function pieUpdate() {

                var piePieces = this;

                piePieces
                    .call(piePathUpdate);

                piePieces
                    .call(pieLabelUpdate);

                return piePieces;
            }

            function translateToMiddle() {

                var x = model.getWidth() / 2  - cfg.w/2,
                    y = model.getHeight()  / 2 - cfg.h/2;

                return 'translate(' + x + ',' + y + ')';
            }

            function isPhantomAttribute(attribute) {
                return /others/i.test(attribute);
            }

            self.draw = function () {
                radar.draw(conf.svg,conf.model, cfg)

            };

            self.getColorAreas = function () {

               return radar.getColorAreas()
               // return group.selectAll(".arc");
            };
            self.updateColor = function (itemModel) {

                group.selectAll(".arc")
                    .filter(function (arc) {
                        var curentObj;
                       if(arc.data.getId){
                           curentObj = arc.data
                       }else {
                           curentObj = arc.data.data
                       }

                        return curentObj.getId() === itemModel.getId();
                    })
                    .style('fill', arcColor)
                    .style('stroke', arcColor);
            };

            self.init = function () {
             /*   self.reDraw()

                return;
                arc = d3.svg.arc()
                    .innerRadius(function () {
                        var diameter = getPieDiameter(),
                            min = self.config.minInnerRadius,
                            innerRadius;

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
                    .attr('class', 'total');*/
                setWidthHeight (cfg)
                radar.draw(conf.svg,conf.model, cfg)
            };

            self.destroy = ng.noop;

          //  group = conf.svg;

         //   var RadarChart
          var  radar = {
              getColorAreas : function () {
              return group.selectAll(".arc");
          },


                draw: function(id, data, options){





                    var d = [];
                    for(var a in data.data){
                        d.push(data.data[a])
                    };

                    var  series;
                    var z;
                    var newX;
                    var newY;
                    var dataValues;
                    var  greatestValue = findBiggest (data);



                   function scaleSdjustment (greatestValue,cfg,data){
                       var total = data.data[0].totalCount;
                       var perсent =  greatestValue / total;

                       if(perсent < 0.1){
                          return cfg.levels = Math.round(perсent*100)
                       } else {
                         return  cfg.levels
                       }
                   };

                    cfg.levels = scaleSdjustment (greatestValue,cfg,data);

                   function findBiggest (data) {
                       var biggest = 0;
                       data.data.forEach(function(a){
                            a.data.forEach(function(b){
                              if(b.value > biggest){
                                  biggest = b.value
                              }
                            })
                       })
                       return biggest;
                   };




                    if('undefined' !== typeof options){
                        for(var i in options){
                            if('undefined' !== typeof options[i]){
                                cfg[i] = options[i];
                            }
                        }
                    }
                    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.data.map(function(o){return o.value;}))}));

                    var allAxis = (d[0].data.map(function(i, j){return i.axis}));
                    var total = allAxis.length;
                    var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
                    var Format = d3.format('%');
                    d3.select(id).select("svg").remove();

                    var g = d3.select(id)
                       .append("svg")
                        //.attr("width", cfg.w+cfg.ExtraWidthX)
                       // .attr("height", cfg.h+cfg.ExtraWidthY)
                        .append("g");
                        g.attr("transform",translateToMiddle()/* "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")"*/);

             group = g;
                    var tooltip;
                    var axis = g.selectAll(".axis")
                        .data(allAxis)
                        .enter()
                        .append("g")
                        .attr("class", "axis");

                    axis
                        .append("text")
                        .attr("class", "label")
                        .text(function(d){return d})
                        .style("font-family", "sans-serif")
                        .style("font-size", "11px")
                        .attr("text-anchor", "middle")
                        .attr("dy", "1.5em")
                        .attr("transform", function(d, i){return "translate(0, -13)"})
                        .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
                        .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});
                    //Circular segments
                   for(var j=0; j<cfg.levels-1; j++){

                        var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
                        g.selectAll(".levels")
                            .data(allAxis)
                            .enter()
                            .append("svg:line")
                            .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                            .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                            .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
                            .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
                            .attr("class", "line")
                            .style("stroke", "grey")
                            .style("stroke-opacity", "0.75")
                            .style("stroke-width", "0.3px")
                            .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
                    }

                    //Text indicating at what % each level is
                    for(var j=0; j<cfg.levels; j++){
                        var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
                        g.selectAll(".levels")
                            .data([1]) //dummy data
                            .enter()
                            .append("svg:text")
                            .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
                            .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
                            .attr("class", "legend")
                            .style("font-family", "sans-serif")
                            .style("font-size", "10px")
                            .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
                            .attr("fill", "#737373")
                            .text(Format((j+1)*(greatestValue / d[0].totalCount) / cfg.levels));
                    }

                    series = 0;

                    axis.append("line")
                        .attr("x1", cfg.w/2)
                        .attr("y1", cfg.h/2)
                        .attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                        .attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                        .attr("class", "line")
                        .style("stroke", "grey")
                        .style("stroke-width", "1px");




                    d.forEach(function(y, x){
                        dataValues = [];
                        g.selectAll(".nodes")
                            .data(y.data, function(j, i){
                                dataValues.push([
                                    cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                                    cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
                                ]);
                            });
                        dataValues.push(dataValues[0]);
                        g.selectAll(".area")
                            .data([{"data":y,"dataValues":dataValues}])
                            .enter()
                            .append("polygon")
                            .attr("class", "radar-chart-serie"+series+' arc')
                            .style("stroke-width", "2px")
                            .style("stroke", y.color)
                            .attr("points",function(d) {

                               var pointData = d.dataValues;
                                var str="";
                                for(var pti=0;pti<pointData.length;pti++){
                                    str=str+pointData[pti][0]+","+pointData[pti][1]+" ";
                                }
                                return str;
                            })
                            .style("fill", function(j, i){return y.color})
                            .style("fill-opacity", cfg.opacityArea)
                            .on('mouseover', function (d){

                                self.onItemOver(d);

                                z = "polygon."+d3.select(this).attr("class");

                                g.selectAll("polygon")
                                    .transition(200)
                                    .style("fill-opacity", 0.1);
                                g.selectAll(z)
                                    .transition(200)
                                    .style("fill-opacity", .7);
                            })
                            .on('mouseout', function(){

                                self.onItemOut()

                                g.selectAll("polygon")
                                    .transition(200)
                                    .style("fill-opacity", cfg.opacityArea);
                            })
                            .on('click', function (item) {

                                //self.config.onItemClick(item.data);
                            });
                        series++;
                    });
                    series=0;


                    d.forEach(function(y, x){
                        g.selectAll(".nodes")
                            .data(y.data).enter()
                            .append("svg:circle")
                            .attr("class", "radar-chart-serie"+series+' arc')
                            .attr('r', cfg.radius)
                            .attr("alt", function(j){return Math.max(j.value, 0)})
                            .attr("cx", function(j, i){

                                j.data = y;
                                dataValues.push([
                                    cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                                    cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
                                ]);
                                return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
                            })
                            .attr("cy", function(j, i){
                                return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
                            })
                            .attr("data-id", function(j){return j.axis})
                            .style("fill", function(item){return item.data.color}/*cfg.color(series)*/).style("fill-opacity", .9)
                            .on('mouseover', function (d){

                                self.onItemOver(d);


                                newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                                newY =  parseFloat(d3.select(this).attr('cy')) - 5;

                                tooltip
                                    .attr('x', newX)
                                    .attr('y', newY)
                                    .text(Format(d.value/d.data.totalCount))
                                    .transition(200)
                                    .style('opacity', 1);

                                z = "polygon."+d3.select(this).attr("class");
                                g.selectAll("polygon")
                                    .transition(200)
                                    .style("fill-opacity", 0.1);
                                g.selectAll(z)
                                    .transition(200)
                                    .style("fill-opacity", .7);
                            })
                            .on('mouseout', function(d){
                             //   self.onItemOut(d)
                                self.onItemOut();
                                tooltip
                                    .transition(200)
                                    .style('opacity', 0);
                                g.selectAll("polygon")
                                    .transition(200)
                                    .style("fill-opacity", cfg.opacityArea);
                            })
                            .append("svg:title")
                            .text(function(j){
                                return  'Point count: ' + j.value  +'\n'+ 'Category: ' +j.data.label+'\n'+ 'Category ' + j.data.forTooltip;
                            });

                        series++;
                    });

                    tooltip = g.append('text')
                        .style('opacity', 0)
                        .style('font-family', 'sans-serif')
                        .style('font-size', '13px')
                        .style('cursor', 'default');
                }
            };


            function onItemClick(pieItem) {
                self.config.onItemClick(pieItem.data);
            }
            function piePathEnter() {

                this
                    .append("path")
                    .on('mouseover', self.onItemOver)
                    .on('mouseout', self.onItemOut)
                    .on('click', onItemClick);

                return this;
            }
        };
    }];
});
/*jshint ignore: end */
