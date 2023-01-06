
function DonutChart(divName, dataHash) {

    // var data = [
    //         {"age":"1-5","population":2000},
    //         {"age":"6-10","population":1000},
    //         {"age":"11-15","population":3000},
    //         {"age":"16-20","population":1200},
    //         {"age":"21-25","population":900},          
    //         {"age":"26-30","population":1500},
    //         {"age":"31-35","population":600},
    //         {"age":"36-40","population":1200},
    //         {"age":"41-45","population":900}];


    data = dataHash.data;

    var margin = {top:40,left:40,right:40,bottom:40};

    width = 350;
    height = 350;
    radius = Math.min(width-100,height-100)/2;

    var color = d3.scale.ordinal()
        .range(["#e53517", "#6b486b", "#ffbb78","#7ab51d","#6b486b","#e53517","#7ab51d","#ff7f0e","#ffc400"]);

    var arc = d3.svg.arc()  
        .outerRadius(radius -70)
        .innerRadius(radius - 5);

    var arcOver = d3.svg.arc()  
        .outerRadius(radius +50)
        .innerRadius(0);

//var svg = d3.select("#svgContent").append("svg")

    var svg = d3.select("#" + divName).append("svg")
        .attr("width",width)
        .attr("height",height)
        .append("g")
         .attr("transform","translate("+width/2+","+height/2+")");

    chart_r = $("#" + divName).innerWidth() / data.length / 2 * 0.85;

    div = d3.select("body")
        .append("div") 
        .attr("class", "tooltip");

    svg.append('text')
            .attr('class', 'center-txt type')
            .attr('y', 11)
            .attr('text-anchor', 'middle')
            .style('font-size', '2em')
            .text(function(d, i) {
                return dataHash.count;
            });

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d){return d.count;});

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class","arc")
        // .on("mouseover", function(d, i) {
        //     d3.select(this)
        //         .transition()
        //         .attr("r", chart_r * 0.65);
        // })
        .on("mousemove",function(d){
            var mouseVal = d3.mouse(this);
            div.style("display","none");
            div
            .html(d.data.desc+"</br>"+"Count:"+d.data.count+"</br>"+"Value:" + d.data.value + "k")
            .style("left", (d3.event.pageX+12) + "px")
            .style("top", (d3.event.pageY-10) + "px")
            .style("opacity", 1)
            .style("display","block");
        })
        .on("mouseout",function(){div.html(" ").style("display","none");})
        .on("click",function(d){
            if(d3.select(this).attr("transform") == null){
            d3.select(this).attr("transform","translate(42,0)");
            }else{
                d3.select(this).attr("transform",null);
            }
        });
        
        
    g.append("path")
        .attr("d",arc)
        .style("fill",function(d){return color(d.data.desc);});

    svg.selectAll("text").data(pie(data)).enter()
        .append("text")
        .attr("class","label1")
        .attr("transform", function(d) {
            var dist=radius+15;
            var winkel=(d.startAngle+d.endAngle)/2;
            var x=dist*Math.sin(winkel)-4;
            var y=-dist*Math.cos(winkel)-4;
       
            return "translate(" + x + "," + y + ")";
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d){
            return d.data.count;
        });
                    
}

    function DonutCharts(div) {

        var divName = "#" + div;
        var charts = d3.select(divName);

        var chart_m,
            chart_r,
            color = d3.scale.category20();

        var getCatNames = function(dataset) {
            var catNames = new Array();

            if (dataset && dataset.length > 0 && dataset[0].data) {
                for (var i = 0; i < dataset[0].data.length; i++) {
                    catNames.push(dataset[0].data[i].cat);
                }
            }


            return catNames;
        }

        var createLegend = function(catNames) {
            var legends = charts.select('.legend')
                            .selectAll('g')
                                .data(catNames)
                            .enter().append('g')
                                .attr('transform', function(d, i) {
                                    return 'translate(' + (i * 150 + 50) + ', 10)';
                                });
    
            legends.append('circle')
                .attr('class', 'legend-icon')
                .attr('r', 6)
                .style('fill', function(d, i) {
                    return color(i);
                });
    
            legends.append('text')
                .attr('dx', '1em')
                .attr('dy', '.3em')
                .text(function(d) {
                    return d;
                });
        }

        var createCenter = function(pie) {

            var eventObj = {
                'mouseover': function(d, i) {
                    d3.select(this)
                        .transition()
                        .attr("r", chart_r * 0.65);
                },

                'mouseout': function(d, i) {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .ease('bounce')
                        .attr("r", chart_r * 0.6);
                },

                'click': function(d, i) {
                    var paths = charts.selectAll('.clicked');
                    pathAnim(paths, 0);
                    paths.classed('clicked', false);
                    resetAllCenterText();
                }
            }

            var donuts = d3.selectAll('.donut');

            // The circle displaying total data.
            donuts.append("svg:circle")
                .attr("r", chart_r * 0.6)
                .style("fill", "#e7e7e7") //this is color of middle circle - E7E7E7
                .on(eventObj);
    
            donuts.append('text')
                    .attr('class', 'center-txt type')
//                    .attr('y', chart_r * -0.16)
                    .attr('y', 11)
                    .attr('text-anchor', 'middle')
                    // .style('font-weight', 'bold')
                    .style('color', '#FFFFFF')
                    .style('font-size', '2em')
                    .text(function(d, i) {
                        return d.count;
                    });

            donuts.append('text')
                    .attr('class', 'center-txt value')
                    .attr('text-anchor', 'middle');

            donuts.append('text')
                    .attr('class', 'center-txt percentage')
                    .attr('y', chart_r * 0.16)
                    .attr('text-anchor', 'middle')
                    .style('fill', '#A2A2A2');
        }

        var setCenterText = function(thisDonut) {
            var sum = d3.sum(thisDonut.selectAll('.clicked').data(), function(d) {
                return d.data.val;
            });

            thisDonut.select('.value')
                .text(function(d) {
                    return (sum)?   d.unit + sum.toFixed(2)
                                : d.unit + d.total.toFixed(2)  ;
                });
            thisDonut.select('.percentage')
                .text(function(d) {
                    return (sum)? (sum/d.total*100).toFixed(2) + '%'
                                : '';
                });
        }

        var resetAllCenterText = function() {
            charts.selectAll('.value')
                .text(function(d) {
                    return d.data.cat + ' ' + d.total.toFixed(1);// + d.unit;
                });
            charts.selectAll('.percentage')
                .text('');
        }

        var pathAnim = function(path, dir) {
            switch(dir) {
                case 0:
                    path.transition()
                        .duration(500)
                        .ease('bounce')
                        .attr('d', d3.svg.arc()
                            .innerRadius(chart_r * 0.7)
                            .outerRadius(chart_r)
                        );
                    break;

                case 1:
                    path.transition()
                        .attr('d', d3.svg.arc()
                            .innerRadius(chart_r * 0.7)
                            .outerRadius(chart_r * 1.08)
                        );
                    break;
            }
        }

        var updateDonut = function() {

            var eventObj = {

                'mouseover': function(d, i, j) {
                    pathAnim(d3.select(this), 1);

                    var thisDonut = charts.select('.type' + j);
                    thisDonut.select('.value').text(function(donut_d) {
                        return d.data.cat + ' ' + d.data.val.toFixed(1);// + donut_d.unit;
                    });
                    thisDonut.select('.percentage').text(function(donut_d) {
                        return (d.data.val/donut_d.total*100).toFixed(2) + '%';
                    });
                },
                
                'mouseout': function(d, i, j) {
                    var thisPath = d3.select(this);
                    if (!thisPath.classed('clicked')) {
                        pathAnim(thisPath, 0);
                    }
                    var thisDonut = charts.select('.type' + j);
                    setCenterText(thisDonut);
                },

                'click': function(d, i, j) {
                    var thisDonut = charts.select('.type' + j);
                    if (0 === thisDonut.selectAll('.clicked')[0].length) {
                        thisDonut.select('circle').on('click')();
                    }

                    var thisPath = d3.select(this);
                    var clicked = thisPath.classed('clicked');
                    pathAnim(thisPath, ~~(!clicked));
                    thisPath.classed('clicked', !clicked);

                    setCenterText(thisDonut);
                }
            };

            var pie = d3.layout.pie()
                            .sort(null)
                            .value(function(d) {
                                return d.val;
                            });

            var arc = d3.svg.arc()
                            .innerRadius(chart_r * 0.7)
                            .outerRadius(function() {
                                return (d3.select(this).classed('clicked'))? chart_r * 1.08
                                                                           : chart_r;
                            });

            // Start joining data with paths
            var paths = charts.selectAll('.donut')
                            .selectAll('path')
                            .data(function(d, i) {
                                return pie(d.data);
                            });

            paths
                .transition()
                .duration(1000)
                .attr('d', arc);

            paths.enter()
                .append('svg:path')
                    .attr('d', arc)
                    .style('fill', function(d, i) {
                        return color(i);
                    })
                    .style('stroke', '#FFFFFF')
                    .on(eventObj)

            paths.exit().remove();

            resetAllCenterText();
        }

        this.create = function(dataset, divName) {
            var $charts = $('#' + divName);
            chart_m = $charts.innerWidth() / dataset.length / 2 * 0.14;
            chart_r = $charts.innerWidth() / dataset.length / 2 * 0.85;

            charts.append('svg')
                .attr('class', 'legend')
                .attr('width', '100%')
                .attr('height', 100)
                .attr('transform', 'translate(0, -100)');

            var donut = charts.selectAll('.donut')
                            .data(dataset)
                        .enter().append('svg:svg')
                            .attr('width', (chart_r + chart_m) * 2)
                            .attr('height', (chart_r + chart_m) * 2)
                        .append('svg:g')
                            .attr('class', function(d, i) {
                                return 'donut type' + i;
                            })
                            .attr('transform', 'translate(' + (chart_r+chart_m) + ',' + (chart_r+chart_m) + ')');

            createLegend(getCatNames(dataset));
            createCenter();

            updateDonut();
        }
    
        this.update = function(dataset) {
            // Assume no new categ of data enter
            var donut = charts.selectAll(".donut")
                        .data(dataset);

            updateDonut();
        }
    }



