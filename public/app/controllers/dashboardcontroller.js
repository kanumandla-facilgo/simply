app.controller('dashboardcontroller', function ($scope, $http, $location, utilService, userService, masterService, $routeParams, $rootScope, $route, $q, flash) {

$scope.utilService = utilService;

$scope.broadCastDashboardDonutClickEvent = function(section, data) {
  if(section.description.includes('Outstanding')) {
    //if permission, then only show the data
    if (utilService.getPermission(utilService.CONST_PERMISSION_BILL_VIEW) == "1")
      $rootScope.$broadcast("SearchPayment", section, data);
  }
 else if(section.description.includes('Packing Slips - Pending')) {
    $rootScope.$broadcast("SearchPackingSlip", section, data);
  }
 else if(section.description.includes('Delivery Notes - Pending')) {
    $rootScope.$broadcast("SearchDeliveryNote", section, data);
  }
   else
    $rootScope.$broadcast("SearchOrder", section, data);
}

$scope.broadCastCustomFilterClickEvent = function(custom_filter) {
  if(custom_filter.document_type == utilService.CONST_DOCUMENT_TYPE_ORDER) {
      $rootScope.$broadcast("OrderCustomFilterClick", custom_filter);
  }
  else if(custom_filter.document_type == utilService.CONST_DOCUMENT_TYPE_DELIVERY_NOTES) {
      $rootScope.$broadcast("DeliveryNoteCustomFilterClick", custom_filter);
  }
  else if(custom_filter.document_type == utilService.CONST_DOCUMENT_TYPE_PACKING_SLIPS) {
      $rootScope.$broadcast("PackingSlipCustomFilterClick", custom_filter);
  }
}



$scope.getCustomFilters = function() {
  let options = {};
  options.show_in_dashboard = 1;

  masterService.getCustomFilters(options, function(response) {
    $scope.customfilterlist = response.data.customfilterslist;
  });
}

$scope.broadCastDashboardBarClickEvent = function(data) {
  $rootScope.$broadcast("OrderBarClick", data);
}

$scope.showTallySetup = function() {
  let templateid = utilService.getTemplateID();
  return (templateid == 6302 ? true: false);
}

$scope.downloadSetup = function() {

  masterService.downloadSetup($scope.companyname, function(response) {
    if(response.statuscode == 0)
      {
        var anchor = angular.element('<a/>');
        var blob = new Blob([response.data], { type: response.headers('content-type')});
        anchor.attr({
          href: window.URL.createObjectURL(blob),
          target: '_blank',
          download: response.headers('content-disposition').split(';')[1].split('filename')[1].split('=')[1].trim()
        })[0].click();
      }
      else
      {
        alert("No setup found for this company");
      }
  });
}

	$scope.dashboard = {};
	$scope.dashboard.bounce_rate = {
        labels: [
          "Symbian",
          "Blackberry",
          "Other",
          "Android",
          "IOS"
        ],
        datasets: [{
          data: [15, 20, 30, 10, 30],
          backgroundColor: [
            "#BDC3C7",
            "#9B59B6",
            "#E74C3C",
            "#26B99A",
            "#3498DB"
          ],
          hoverBackgroundColor: [
            "#CFD4D8",
            "#B370CF",
            "#E95E4F",
            "#36CAAB",
            "#49A9EA"
          ]

        }]
    };

    // var canvasDoughnut,
    //     options = {
    //       legend: false,
    //       responsive: false
    //     };

    // new Chart(document.getElementById("canvas1i"), {
    //   type: 'doughnut',
    //   tooltipFillColor: "rgba(51, 51, 51, 0.55)",
    //   data: {
    //     labels: [
    //       "Symbian",
    //       "Blackberry",
    //       "Other",
    //       "Android",
    //       "IOS"
    //     ],
    //     datasets: [{
    //       data: [15, 50, 30, 10, 30],
    //       backgroundColor: [
    //         "#BDC3C7",
    //         "#9B59B6",
    //         "#E74C3C",
    //         "#26B99A",
    //         "#3498DB"
    //       ],
    //       hoverBackgroundColor: [
    //         "#CFD4D8",
    //         "#B370CF",
    //         "#E95E4F",
    //         "#36CAAB",
    //         "#49A9EA"
    //       ]

    //     }]
    //   },
    //   options: options
    // });

    // new Chart(document.getElementById("canvas1i2"), {
    //   type: 'doughnut',
    //   tooltipFillColor: "rgba(51, 51, 51, 0.55)",
    //   data: {
    //     labels: [
    //       "Symbian",
    //       "Blackberry",
    //       "Other",
    //       "Android",
    //       "IOS"
    //     ],
    //     datasets: [{
    //       data: [15, 20, 30, 10, 30],
    //       backgroundColor: [
    //         "#BDC3C7",
    //         "#9B59B6",
    //         "#E74C3C",
    //         "#26B99A",
    //         "#3498DB"
    //       ],
    //       hoverBackgroundColor: [
    //         "#CFD4D8",
    //         "#B370CF",
    //         "#E95E4F",
    //         "#36CAAB",
    //         "#49A9EA"
    //       ]

    //     }]
    //   },
    //   options: options
    // });

    // new Chart(document.getElementById("canvas1i3"), {
    //   type: 'doughnut',
    //   tooltipFillColor: "rgba(51, 51, 51, 0.55)",
    //   data: {
    //     labels: [
    //       "Symbian",
    //       "Blackberry",
    //       "Other",
    //       "Android",
    //       "IOS"
    //     ],
    //     datasets: [{
    //       data: [15, 20, 30, 10, 30],
    //       backgroundColor: [
    //         "#BDC3C7",
    //         "#9B59B6",
    //         "#E74C3C",
    //         "#26B99A",
    //         "#3498DB"
    //       ],
    //       hoverBackgroundColor: [
    //         "#CFD4D8",
    //         "#B370CF",
    //         "#E95E4F",
    //         "#36CAAB",
    //         "#49A9EA"
    //       ]

    //     }]
    //   },
    //   options: options
    // });

	if ($rootScope.title == "Dashboard") {
    
    if(utilService.getTemplateID() == 6302)
      $location.path("/bills");

    $scope.companyname = utilService.getCompanyName();   
		userService.getDashboard(function(response) {
	 		if (response.statuscode == 0 && response.data && response.data.dashboard) {
	 			 $scope.getCustomFilters();
         $scope.dashboard     = response.data.dashboard;

         $scope.dashboard.bargrouplist = [];
         let groupData = getGroupedBarData($scope.dashboard.barlist);
         if(groupData.length > 0)
            $scope.dashboard.bargrouplist.push(groupData);
                //var donuts = new DonutChart('donut-charts_0');

                // this is for bar chart
                $scope.data = [10,20,80,40,60];

                $scope.donut_data = [];
                $scope.donut_labels = [];
               /* $scope.dashboard.donutlst = []
                
                for (var i = 0; i < $scope.dashboard.sectionlist.length; i++) {                    
                    var temp = {
                        key: 'donutdata'+i,
                        donutdata: $scope.dashboard.sectionlist[i]
                    }
                    $scope.dashboard.donutlst.push(temp);
                    temp = {};
                }
                console.log($scope.dashboard.donutlst);
                
                for (var i = 0; i < $scope.dashboard.donutlst.length; i++) {                    
                    if ($scope.dashboard.donutlst[i].donutdata.sectionlineitems.length > 0) {
                        $scope["donut_" + i] = generateDonutData($scope.dashboard.donutlst[i].donutdata);

                        var obj = generateDonutDataAngChart($scope.dashboard.donutlst[i].donutdata, i);
                        $scope.donut_data.push(obj.data);
                        $scope.donut_labels.push(obj.labels);

                        transform_data_to_d3('donut-charts_' + i, $scope.dashboard.donutlst[i].donutdata);
                    }
                }
                */
                for (var i = 0; i < $scope.dashboard.sectionlist.length; i++) {
                    if ($scope.dashboard.sectionlist[i].sectionlineitems.length > 0) {
                        $scope["donut_" + i] = generateDonutData($scope.dashboard.sectionlist[i]);

                        var obj = generateDonutDataAngChart($scope.dashboard.sectionlist[i], i);
                        $scope.donut_data.push(obj.data);
                        $scope.donut_labels.push(obj.labels);

                        transform_data_to_d3('donut-charts_' + i, $scope.dashboard.sectionlist[i]);
                    }
                }

                $scope.data = [10,40,80,40,60];
                return;


                // var donutData = transform_data_to_d3($scope.dashboard);

                // var donuts = new DonutCharts('donut-charts');
                // donuts.create(donutData, 'donut-charts');


                /* pie chart */
                var piechart = AmCharts.makeChart( "piechartdiv", {
                  "type": "pie",
                  "theme": "light",
                  "titles": [ {
                    "text": "Visitors countries",
                    "size": 16
                  } ],
                  "dataProvider": [ {
                    "country": "United States",
                    "visits": 7252
                  }, {
                    "country": "China",
                    "visits": 3882
                  }, {
                    "country": "Japan",
                    "visits": 1809
                  }, {
                    "country": "Germany",
                    "visits": 1322
                  }, {
                    "country": "United Kingdom",
                    "visits": 1122
                  }, {
                    "country": "France",
                    "visits": 414
                  }, {
                    "country": "India",
                    "visits": 384
                  }, {
                    "country": "Spain",
                    "visits": 211
                  } ],
                  "valueField": "visits",
                  "titleField": "country",
                  "startEffect": "elastic",
                  "startDuration": 2,
                  "labelRadius": 15,
                  "innerRadius": "50%",
                  "depth3D": 10,
                  "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
                  "angle": 15,
                  "export": {
                    "enabled": true
                  }
                } );

                var piechart3d = AmCharts.makeChart( "piechartdiv3d", {
                  "type": "pie",
                  "theme": "light",
                  "dataProvider": [ {
                    "country": "Lithuania",
                    "value": 260
                  }, {
                    "country": "Ireland",
                    "value": 201
                  }, {
                    "country": "Germany",
                    "value": 65
                  }, {
                    "country": "Australia",
                    "value": 39
                  }, {
                    "country": "UK",
                    "value": 19
                  }, {
                    "country": "Latvia",
                    "value": 10
                  } ],
                  "valueField": "value",
                  "titleField": "country",
                  "outlineAlpha": 0.4,
                  "depth3D": 15,
                  "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
                  "angle": 30,
                  "export": {
                    "enabled": true
                  }
                } );

                var chartData = generateTimeLinePieChart();
                var currentYear = 1995;
                var chart = AmCharts.makeChart( "animatedpiechartdiv", {
                  "type": "pie",
                  "theme": "light",
                  "dataProvider": [],
                  "valueField": "size",
                  "titleField": "sector",
                  "startDuration": 0,
                  "innerRadius": 80,
                  "pullOutRadius": 20,
                  "marginTop": 30,
                  "titles": [{
                    "text": "South African Economy"
                  }],
                  "allLabels": [{
                    "y": "54%",
                    "align": "center",
                    "size": 25,
                    "bold": true,
                    "text": "1995",
                    "color": "#555"
                  }, {
                    "y": "49%",
                    "align": "center",
                    "size": 15,
                    "text": "Year",
                    "color": "#555"
                  }],
                  "listeners": [ {
                    "event": "init",
                    "method": function( e ) {
                      var chart = e.chart;

                      function getCurrentData() {
                        var data = chartData[currentYear];
                        currentYear++;
                        if (currentYear > 2014)
                          currentYear = 1995;
                        return data;
                      }

                      function loop() {
                        chart.allLabels[0].text = currentYear;
                        var data = getCurrentData();
                        chart.animateData( data, {
                          duration: 1000,
                          complete: function() {
                            setTimeout( loop, 3000 );
                          }
                        } );
                      }

                      loop();
                    }
                  } ],
                   "export": {
                   "enabled": true
                  }
                } );

                var barChartData = [];
                generateChartData(barChartData, $scope.dashboard.barlist[0].data);
//                generateChartData1(barChartData);

                var barchart = AmCharts.makeChart("barchartdiv", {
                    "type": "serial",
                    "theme": "light",
                    "dataProvider": barChartData,
                    "valueAxes": [ {
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    } ],
                      "gridAboveGraphs": true,
                      "startDuration": 1,
                      "graphs": [ {
                        "balloonText": "[[category]]: <b>[[value]]</b>",
                        "fillAlphas": 0.8,
                        "lineAlpha": 0.2,
                        "type": "column",
                        "valueField": "Y"
                    } ],
                      "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                      "categoryField": "X",
                      "categoryAxis": {
                        "gridPosition": "start",
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 20
                    },
                    "export": {
                        "enabled": false
                    }
                });

                var donutchart = AmCharts.makeChart("donutdivwgradient", {
                    "type": "pie",
                    "theme": "light",
                    "innerRadius": "40%",
                    "gradientRatio": [-0.4, -0.4, -0.4, -0.4, -0.4, -0.4, 0, 0.1, 0.2, 0.1, 0, -0.2, -0.5],
                    "dataProvider": [{
                        "country": "Lithuania",
                        "litres": 501.9
                    }, {
                        "country": "Czech Republic",
                        "litres": 301.9
                    }, {
                        "country": "Ireland",
                        "litres": 201.1
                    }, {
                        "country": "Germany",
                        "litres": 165.8
                    }, {
                        "country": "Australia",
                        "litres": 139.9
                    }, {
                        "country": "Austria",
                        "litres": 128.3
                    }],
                    "balloonText": "[[value]]",
                    "valueField": "litres",
                    "titleField": "country",
                    "balloon": {
                        "drop": true,
                        "adjustBorderColor": false,
                        "color": "#FFFFFF",
                        "fontSize": 16
                    },
                    "export": {
                        "enabled": true
                    }
                });

                var rotatedbarchart = AmCharts.makeChart("rotatedbarchartdiv", {
                  "type": "serial",
                  "theme": "light",
                  "marginRight": 70,
                  "dataProvider": [{
                    "country": "USA",
                    "visits": 3025,
                    "color": "#FF0F00"
                  }, {
                    "country": "China",
                    "visits": 1882,
                    "color": "#FF6600"
                  }, {
                    "country": "Japan",
                    "visits": 1809,
                    "color": "#FF9E01"
                  }, {
                    "country": "Germany",
                    "visits": 1322,
                    "color": "#FCD202"
                  }, {
                    "country": "UK",
                    "visits": 1122,
                    "color": "#F8FF01"
                  }, {
                    "country": "France",
                    "visits": 1114,
                    "color": "#B0DE09"
                  }, {
                    "country": "India",
                    "visits": 984,
                    "color": "#04D215"
                  }, {
                    "country": "Spain",
                    "visits": 711,
                    "color": "#0D8ECF"
                  }, {
                    "country": "Netherlands",
                    "visits": 665,
                    "color": "#0D52D1"
                  }, {
                    "country": "Russia",
                    "visits": 580,
                    "color": "#2A0CD0"
                  }, {
                    "country": "South Korea",
                    "visits": 443,
                    "color": "#8A0CCF"
                  }, {
                    "country": "Canada",
                    "visits": 441,
                    "color": "#CD0D74"
                  }],
                  "valueAxes": [{
                    "axisAlpha": 0,
                    "position": "left",
                    "title": "Visitors from country"
                  }],
                  "startDuration": 1,
                  "graphs": [{
                    "balloonText": "<b>[[category]]: [[value]]</b>",
                    "fillColorsField": "color",
                    "fillAlphas": 0.9,
                    "lineAlpha": 0.2,
                    "type": "column",
                    "valueField": "visits"
                  }],
                  "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": false
                  },
                  "categoryField": "country",
                  "categoryAxis": {
                    "gridPosition": "start",
                    "labelRotation": 45
                  },
                  "export": {
                    "enabled": true
                  }

                });

                var simplebarchart = AmCharts.makeChart("simplebarchartdiv", {
                  "type": "serial",
                  "theme": "light",
                  "dataProvider": [ {
                    "country": "USA",
                    "visits": 2025
                  }, {
                    "country": "China",
                    "visits": 1882
                  }, {
                    "country": "Japan",
                    "visits": 1809
                  }, {
                    "country": "Germany",
                    "visits": 1322
                  }, {
                    "country": "UK",
                    "visits": 1122
                  }, {
                    "country": "France",
                    "visits": 1114
                  }, {
                    "country": "India",
                    "visits": 984
                  }, {
                    "country": "Spain",
                    "visits": 711
                  }, {
                    "country": "Netherlands",
                    "visits": 665
                  }, {
                    "country": "Russia",
                    "visits": 580
                  }, {
                    "country": "South Korea",
                    "visits": 443
                  }, {
                    "country": "Canada",
                    "visits": 441
                  }, {
                    "country": "Brazil",
                    "visits": 395
                  } ],
                  "valueAxes": [ {
                    "gridColor": "#FFFFFF",
                    "gridAlpha": 0.2,
                    "dashLength": 0
                  } ],
                  "gridAboveGraphs": true,
                  "startDuration": 1,
                  "graphs": [ {
                    "balloonText": "[[category]]: <b>[[value]]</b>",
                    "fillAlphas": 0.8,
                    "lineAlpha": 0.2,
                    "type": "column",
                    "valueField": "visits"
                  } ],
                  "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": false
                  },
                  "categoryField": "country",
                  "categoryAxis": {
                    "gridPosition": "start",
                    "gridAlpha": 0,
                    "tickPosition": "start",
                    "tickLength": 20
                  },
                  "export": {
                    "enabled": true
                  }

                } );

                var barchart3d = AmCharts.makeChart("barchartdiv3d", {
                    "theme": "light",
                    "type": "serial",
                    "startDuration": 2,
                    "dataProvider": [{
                        "country": "USA",
                        "visits": 4025,
                        "color": "#FF0F00"
                    }, {
                        "country": "China",
                        "visits": 1882,
                        "color": "#FF6600"
                    }, {
                        "country": "Japan",
                        "visits": 1809,
                        "color": "#FF9E01"
                    }, {
                        "country": "Germany",
                        "visits": 1322,
                        "color": "#FCD202"
                    }, {
                        "country": "UK",
                        "visits": 1122,
                        "color": "#F8FF01"
                    }, {
                        "country": "France",
                        "visits": 1114,
                        "color": "#B0DE09"
                    }, {
                        "country": "India",
                        "visits": 984,
                        "color": "#04D215"
                    }, {
                        "country": "Spain",
                        "visits": 711,
                        "color": "#0D8ECF"
                    }, {
                        "country": "Netherlands",
                        "visits": 665,
                        "color": "#0D52D1"
                    }, {
                        "country": "Russia",
                        "visits": 580,
                        "color": "#2A0CD0"
                    }, {
                        "country": "South Korea",
                        "visits": 443,
                        "color": "#8A0CCF"
                    }, {
                        "country": "Canada",
                        "visits": 441,
                        "color": "#CD0D74"
                    }, {
                        "country": "Brazil",
                        "visits": 395,
                        "color": "#754DEB"
                    }, {
                        "country": "Italy",
                        "visits": 386,
                        "color": "#DDDDDD"
                    }, {
                        "country": "Australia",
                        "visits": 384,
                        "color": "#999999"
                    }, {
                        "country": "Taiwan",
                        "visits": 338,
                        "color": "#333333"
                    }, {
                        "country": "Poland",
                        "visits": 328,
                        "color": "#000000"
                    }],
                    "valueAxes": [{
                        "position": "left",
                        "title": "Visitors"
                    }],
                    "graphs": [{
                        "balloonText": "[[category]]: <b>[[value]]</b>",
                        "fillColorsField": "color",
                        "fillAlphas": 1,
                        "lineAlpha": 0.1,
                        "type": "column",
                        "valueField": "visits"
                    }],
                    "depth3D": 20,
                    "angle": 30,
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "country",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 90
                    },
                    "export": {
                        "enabled": true
                     }

                });

                var clusteredbarchart = AmCharts.makeChart("clusteredbarchartdiv", {
                    "type": "serial",
                     "theme": "light",
                    "categoryField": "year",
                    "rotate": true,
                    "startDuration": 1,
                    "categoryAxis": {
                        "gridPosition": "start",
                        "position": "left"
                    },
                    "trendLines": [],
                    "graphs": [
                        {
                            "balloonText": "Income:[[value]]",
                            "fillAlphas": 0.8,
                            "id": "AmGraph-1",
                            "lineAlpha": 0.2,
                            "title": "Income",
                            "type": "column",
                            "valueField": "income"
                        },
                        {
                            "balloonText": "Expenses:[[value]]",
                            "fillAlphas": 0.8,
                            "id": "AmGraph-2",
                            "lineAlpha": 0.2,
                            "title": "Expenses",
                            "type": "column",
                            "valueField": "expenses"
                        }
                    ],
                    "guides": [],
                    "valueAxes": [
                        {
                            "id": "ValueAxis-1",
                            "position": "top",
                            "axisAlpha": 0
                        }
                    ],
                    "allLabels": [],
                    "balloon": {},
                    "titles": [],
                    "dataProvider": [
                        {
                            "year": 2005,
                            "income": 23.5,
                            "expenses": 18.1
                        },
                        {
                            "year": 2006,
                            "income": 26.2,
                            "expenses": 22.8
                        },
                        {
                            "year": 2007,
                            "income": 30.1,
                            "expenses": 23.9
                        },
                        {
                            "year": 2008,
                            "income": 29.5,
                            "expenses": 25.1
                        },
                        {
                            "year": 2009,
                            "income": 24.6,
                            "expenses": 25
                        }
                    ],
                    "export": {
                        "enabled": true
                     }

                });

                dateBasedChart();

	 		}
	 		else if (response.statuscode === -100)  {
				$location.path("/Login/");
	 		} 
	 		else {
	 			flash.pop({title: "", body: response.message, type: "error"});
	 		}
	 	});

	}

  function getGroupedBarData(barList) {
    var hash = new Object();
    var labelHash = new Object();
    var data = [];
    for (i = 0; i < barList[0].data.length; i++) {
      var eachData = barList[0].data[i];
      var date = eachData.X.split("-");
      if(!hash[date[1]])
        hash[date[1]] = {};
      hash[date[1]][date[0]] = parseInt(eachData.Y.replace(/,/g, ''));
      if(!labelHash[date[0]])
        labelHash[date[0]] = '';
    } 
    for(var key in hash){
        var o = {};
        o.month = key
        for(var label in labelHash)
        {
          if(hash[key][label])
            o[label] = hash[key][label];
          else 
            o[label] = null;
        }
        data.push(o);        
    }
    return data;
  }

    function generateDonutDataAngChart(section, i) {

        section.id = i;

        var data = [];
        var labels = [];

        section.sectionlineitems.map(function(obj){
          data.push(obj.count);
          labels.push(obj.description);
        }); 

        return {"data": data, "labels": labels};
    }

    function generateDonutData(section) {

        var type = section.description;
        var unit = section.unit || " RS.";
        var total = 0;
        var count = 0; //section.count;

        var d3_data = [];
        section.sectionlineitems.map(function(obj){
          d3_data.push({
            "desc" : obj.description,
            "value"  : obj.value,
            "count"  : obj.count
          });
          total += obj.value;
          count += obj.count;
        }); 

        var donutDataHash  = {
                            "desc": type,
                            "unit": unit,
                            "total": total,
                            "count": count,
                            "data": d3_data
                        };
        return donutDataHash;
    }

    function transform_data_to_d3(divName, section)
    {

        var type = section.description;
        var unit = section.unit || " RS.";
        var total = 0;
        var count = 0; //section.count;

        var d3_data = [];
        section.sectionlineitems.map(function(obj){
          d3_data.push({
            "desc" : obj.description,
            "value"  : obj.value,
            "count"  : obj.count
          });
          total += obj.value;
          count += obj.count;
        }); 

        var donutDataHash  = {
                            "desc": type,
                            "unit": unit,
                            "total": total,
                            "count": count,
                            "data": d3_data
                        };

        //new DonutChart(divName, donutDataHash);

    }

    function transform_data_to_d3_old(data)
    {
      //console.log(data);
      var i = 0;
      data.sectionlist.forEach(function(section){

        i++;

        var donutDataSet =[];

        var type = section.description;
        var unit = section.unit || " RS.";
        var total = 0;
        var count = section.count;
        var d3_data = [];
        section.sectionlineitems.map(function(obj){
          d3_data.push({
            "desc" : obj.description,
            "value"  : obj.value,
            "count"  : obj.count
          });
          total += obj.value;

        }); 
        donutDataSet.push({
                    "type": type,
                    "unit": unit,
                    "data": d3_data,
                    "total": total,
                    "count": count
        });

        var donuts = new DonutCharts('donut-charts_' + i);
        donuts.create(donutDataSet, 'donut-charts_' + i);

        //var divName = 'div' + i;
        // var donut = angular.element('<div id="' + divName + '" style="float:left"></div>');
        // angular.element('#donut-charts').append(donut);

        // var donuts = new DonutCharts("donut-charts_" + i++);
        // donuts.create(new_dataset, "donut-charts_" + i);
        
      });
     //return new_dataset;
    }

    function dateBasedChart() {

        var datebasedchart1 = AmCharts.makeChart("datebasedchartdiv", {
            "type": "serial",
            "theme": "light",
            "marginRight": 40,
            "marginLeft": 40,
            "autoMarginOffset": 20,
            "mouseWheelZoomEnabled":true,
            "dataDateFormat": "YYYY-MM-DD",
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left",
                "ignoreAxisWidth":true
            }],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": [{
                "id": "g1",
                "balloon":{
                  "drop":true,
                  "adjustBorderColor":false,
                  "color":"#ffffff"
                },
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": "red line",
                "useLineColorForBulletBorder": true,
                "valueField": "value",
                "balloonText": "<span style='font-size:18px;'>[[value]]</span>"
            }],
            "chartScrollbar": {
                "graph": "g1",
                "oppositeAxis":false,
                "offset":30,
                "scrollbarHeight": 80,
                "backgroundAlpha": 0,
                "selectedBackgroundAlpha": 0.1,
                "selectedBackgroundColor": "#888888",
                "graphFillAlpha": 0,
                "graphLineAlpha": 0.5,
                "selectedGraphFillAlpha": 0,
                "selectedGraphLineAlpha": 1,
                "autoGridCount":true,
                "color":"#AAAAAA"
            },
            "chartCursor": {
                "pan": true,
                "valueLineEnabled": true,
                "valueLineBalloonEnabled": true,
                "cursorAlpha":1,
                "cursorColor":"#258cbb",
                "limitToGraph":"g1",
                "valueLineAlpha":0.2,
                "valueZoomable":true
            },
            "valueScrollbar":{
              "oppositeAxis":false,
              "offset":50,
              "scrollbarHeight":10
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "dashLength": 1,
                "minorGridEnabled": true
            },
            "export": {
                "enabled": true
            },
            "dataProvider": [{
                "date": "2012-07-27",
                "value": 13
            }, {
                "date": "2012-07-28",
                "value": 11
            }, {
                "date": "2012-07-29",
                "value": 15
            }, {
                "date": "2012-07-30",
                "value": 16
            }, {
                "date": "2012-07-31",
                "value": 18
            }, {
                "date": "2012-08-01",
                "value": 13
            }, {
                "date": "2012-08-02",
                "value": 22
            }, {
                "date": "2012-08-03",
                "value": 23
            }, {
                "date": "2012-08-04",
                "value": 20
            }, {
                "date": "2012-08-05",
                "value": 17
            }, {
                "date": "2012-08-06",
                "value": 16
            }, {
                "date": "2012-08-07",
                "value": 18
            }, {
                "date": "2012-08-08",
                "value": 21
            }, {
                "date": "2012-08-09",
                "value": 26
            }, {
                "date": "2012-08-10",
                "value": 24
            }, {
                "date": "2012-08-11",
                "value": 29
            }, {
                "date": "2012-08-12",
                "value": 32
            }, {
                "date": "2012-08-13",
                "value": 18
            }, {
                "date": "2012-08-14",
                "value": 24
            }, {
                "date": "2012-08-15",
                "value": 22
            }, {
                "date": "2012-08-16",
                "value": 18
            }, {
                "date": "2012-08-17",
                "value": 19
            }, {
                "date": "2012-08-18",
                "value": 14
            }, {
                "date": "2012-08-19",
                "value": 15
            }, {
                "date": "2012-08-20",
                "value": 12
            }, {
                "date": "2012-08-21",
                "value": 8
            }, {
                "date": "2012-08-22",
                "value": 9
            }, {
                "date": "2012-08-23",
                "value": 8
            }, {
                "date": "2012-08-24",
                "value": 7
            }, {
                "date": "2012-08-25",
                "value": 5
            }, {
                "date": "2012-08-26",
                "value": 11
            }, {
                "date": "2012-08-27",
                "value": 13
            }, {
                "date": "2012-08-28",
                "value": 18
            }, {
                "date": "2012-08-29",
                "value": 20
            }, {
                "date": "2012-08-30",
                "value": 29
            }, {
                "date": "2012-08-31",
                "value": 33
            }, {
                "date": "2012-09-01",
                "value": 42
            }, {
                "date": "2012-09-02",
                "value": 35
            }, {
                "date": "2012-09-03",
                "value": 31
            }, {
                "date": "2012-09-04",
                "value": 47
            }, {
                "date": "2012-09-05",
                "value": 52
            }, {
                "date": "2012-09-06",
                "value": 46
            }, {
                "date": "2012-09-07",
                "value": 41
            }, {
                "date": "2012-09-08",
                "value": 43
            }, {
                "date": "2012-09-09",
                "value": 40
            }, {
                "date": "2012-09-10",
                "value": 39
            }, {
                "date": "2012-09-11",
                "value": 34
            }, {
                "date": "2012-09-12",
                "value": 29
            }, {
                "date": "2012-09-13",
                "value": 34
            }, {
                "date": "2012-09-14",
                "value": 37
            }, {
                "date": "2012-09-15",
                "value": 42
            }, {
                "date": "2012-09-16",
                "value": 49
            }, {
                "date": "2012-09-17",
                "value": 46
            }, {
                "date": "2012-09-18",
                "value": 47
            }, {
                "date": "2012-09-19",
                "value": 55
            }, {
                "date": "2012-09-20",
                "value": 59
            }, {
                "date": "2012-09-21",
                "value": 58
            }, {
                "date": "2012-09-22",
                "value": 57
            }, {
                "date": "2012-09-23",
                "value": 61
            }, {
                "date": "2012-09-24",
                "value": 59
            }, {
                "date": "2012-09-25",
                "value": 67
            }, {
                "date": "2012-09-26",
                "value": 65
            }, {
                "date": "2012-09-27",
                "value": 61
            }, {
                "date": "2012-09-28",
                "value": 66
            }, {
                "date": "2012-09-29",
                "value": 69
            }, {
                "date": "2012-09-30",
                "value": 71
            }, {
                "date": "2012-10-01",
                "value": 67
            }, {
                "date": "2012-10-02",
                "value": 63
            }, {
                "date": "2012-10-03",
                "value": 46
            }, {
                "date": "2012-10-04",
                "value": 32
            }, {
                "date": "2012-10-05",
                "value": 21
            }, {
                "date": "2012-10-06",
                "value": 18
            }, {
                "date": "2012-10-07",
                "value": 21
            }, {
                "date": "2012-10-08",
                "value": 28
            }, {
                "date": "2012-10-09",
                "value": 27
            }, {
                "date": "2012-10-10",
                "value": 36
            }, {
                "date": "2012-10-11",
                "value": 33
            }, {
                "date": "2012-10-12",
                "value": 31
            }, {
                "date": "2012-10-13",
                "value": 30
            }, {
                "date": "2012-10-14",
                "value": 34
            }, {
                "date": "2012-10-15",
                "value": 38
            }, {
                "date": "2012-10-16",
                "value": 37
            }, {
                "date": "2012-10-17",
                "value": 44
            }, {
                "date": "2012-10-18",
                "value": 49
            }, {
                "date": "2012-10-19",
                "value": 53
            }, {
                "date": "2012-10-20",
                "value": 57
            }, {
                "date": "2012-10-21",
                "value": 60
            }, {
                "date": "2012-10-22",
                "value": 61
            }, {
                "date": "2012-10-23",
                "value": 69
            }, {
                "date": "2012-10-24",
                "value": 67
            }, {
                "date": "2012-10-25",
                "value": 72
            }, {
                "date": "2012-10-26",
                "value": 77
            }, {
                "date": "2012-10-27",
                "value": 75
            }, {
                "date": "2012-10-28",
                "value": 70
            }, {
                "date": "2012-10-29",
                "value": 72
            }, {
                "date": "2012-10-30",
                "value": 70
            }, {
                "date": "2012-10-31",
                "value": 72
            }, {
                "date": "2012-11-01",
                "value": 73
            }, {
                "date": "2012-11-02",
                "value": 67
            }, {
                "date": "2012-11-03",
                "value": 68
            }, {
                "date": "2012-11-04",
                "value": 65
            }, {
                "date": "2012-11-05",
                "value": 71
            }, {
                "date": "2012-11-06",
                "value": 75
            }, {
                "date": "2012-11-07",
                "value": 74
            }, {
                "date": "2012-11-08",
                "value": 71
            }, {
                "date": "2012-11-09",
                "value": 76
            }, {
                "date": "2012-11-10",
                "value": 77
            }, {
                "date": "2012-11-11",
                "value": 81
            }, {
                "date": "2012-11-12",
                "value": 83
            }, {
                "date": "2012-11-13",
                "value": 80
            }, {
                "date": "2012-11-14",
                "value": 81
            }, {
                "date": "2012-11-15",
                "value": 87
            }, {
                "date": "2012-11-16",
                "value": 82
            }, {
                "date": "2012-11-17",
                "value": 86
            }, {
                "date": "2012-11-18",
                "value": 80
            }, {
                "date": "2012-11-19",
                "value": 87
            }, {
                "date": "2012-11-20",
                "value": 83
            }, {
                "date": "2012-11-21",
                "value": 85
            }, {
                "date": "2012-11-22",
                "value": 84
            }, {
                "date": "2012-11-23",
                "value": 82
            }, {
                "date": "2012-11-24",
                "value": 73
            }, {
                "date": "2012-11-25",
                "value": 71
            }, {
                "date": "2012-11-26",
                "value": 75
            }, {
                "date": "2012-11-27",
                "value": 79
            }, {
                "date": "2012-11-28",
                "value": 70
            }, {
                "date": "2012-11-29",
                "value": 73
            }, {
                "date": "2012-11-30",
                "value": 61
            }, {
                "date": "2012-12-01",
                "value": 62
            }, {
                "date": "2012-12-02",
                "value": 66
            }, {
                "date": "2012-12-03",
                "value": 65
            }, {
                "date": "2012-12-04",
                "value": 73
            }, {
                "date": "2012-12-05",
                "value": 79
            }, {
                "date": "2012-12-06",
                "value": 78
            }, {
                "date": "2012-12-07",
                "value": 78
            }, {
                "date": "2012-12-08",
                "value": 78
            }, {
                "date": "2012-12-09",
                "value": 74
            }, {
                "date": "2012-12-10",
                "value": 73
            }, {
                "date": "2012-12-11",
                "value": 75
            }, {
                "date": "2012-12-12",
                "value": 70
            }, {
                "date": "2012-12-13",
                "value": 77
            }, {
                "date": "2012-12-14",
                "value": 67
            }, {
                "date": "2012-12-15",
                "value": 62
            }, {
                "date": "2012-12-16",
                "value": 64
            }, {
                "date": "2012-12-17",
                "value": 61
            }, {
                "date": "2012-12-18",
                "value": 59
            }, {
                "date": "2012-12-19",
                "value": 53
            }, {
                "date": "2012-12-20",
                "value": 54
            }, {
                "date": "2012-12-21",
                "value": 56
            }, {
                "date": "2012-12-22",
                "value": 59
            }, {
                "date": "2012-12-23",
                "value": 58
            }, {
                "date": "2012-12-24",
                "value": 55
            }, {
                "date": "2012-12-25",
                "value": 52
            }, {
                "date": "2012-12-26",
                "value": 54
            }, {
                "date": "2012-12-27",
                "value": 50
            }, {
                "date": "2012-12-28",
                "value": 50
            }, {
                "date": "2012-12-29",
                "value": 51
            }, {
                "date": "2012-12-30",
                "value": 52
            }, {
                "date": "2012-12-31",
                "value": 58
            }, {
                "date": "2013-01-01",
                "value": 60
            }, {
                "date": "2013-01-02",
                "value": 67
            }, {
                "date": "2013-01-03",
                "value": 64
            }, {
                "date": "2013-01-04",
                "value": 66
            }, {
                "date": "2013-01-05",
                "value": 60
            }, {
                "date": "2013-01-06",
                "value": 63
            }, {
                "date": "2013-01-07",
                "value": 61
            }, {
                "date": "2013-01-08",
                "value": 60
            }, {
                "date": "2013-01-09",
                "value": 65
            }, {
                "date": "2013-01-10",
                "value": 75
            }, {
                "date": "2013-01-11",
                "value": 77
            }, {
                "date": "2013-01-12",
                "value": 78
            }, {
                "date": "2013-01-13",
                "value": 70
            }, {
                "date": "2013-01-14",
                "value": 70
            }, {
                "date": "2013-01-15",
                "value": 73
            }, {
                "date": "2013-01-16",
                "value": 71
            }, {
                "date": "2013-01-17",
                "value": 74
            }, {
                "date": "2013-01-18",
                "value": 78
            }, {
                "date": "2013-01-19",
                "value": 85
            }, {
                "date": "2013-01-20",
                "value": 82
            }, {
                "date": "2013-01-21",
                "value": 83
            }, {
                "date": "2013-01-22",
                "value": 88
            }, {
                "date": "2013-01-23",
                "value": 85
            }, {
                "date": "2013-01-24",
                "value": 85
            }, {
                "date": "2013-01-25",
                "value": 80
            }, {
                "date": "2013-01-26",
                "value": 87
            }, {
                "date": "2013-01-27",
                "value": 84
            }, {
                "date": "2013-01-28",
                "value": 83
            }, {
                "date": "2013-01-29",
                "value": 84
            }, {
                "date": "2013-01-30",
                "value": 81
            }]
        });

        datebasedchart1.addListener("rendered", zoomChart);

        zoomChart(datebasedchart1);
    }


    function zoomChart(datebasedchart1) {
        datebasedchart1.zoomToIndexes(datebasedchart1.dataProvider.length - 40, datebasedchart1.dataProvider.length - 1);
    }

    function generateTimeLinePieChart() {

        var chartData = {
          "1995": [
            { "sector": "Agriculture", "size": 6.6 },
            { "sector": "Mining and Quarrying", "size": 0.6 },
            { "sector": "Manufacturing", "size": 23.2 },
            { "sector": "Electricity and Water", "size": 2.2 },
            { "sector": "Construction", "size": 4.5 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 14.6 },
            { "sector": "Transport and Communication", "size": 9.3 },
            { "sector": "Finance, real estate and business services", "size": 22.5 } ],
          "1996": [
            { "sector": "Agriculture", "size": 6.4 },
            { "sector": "Mining and Quarrying", "size": 0.5 },
            { "sector": "Manufacturing", "size": 22.4 },
            { "sector": "Electricity and Water", "size": 2 },
            { "sector": "Construction", "size": 4.2 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 14.8 },
            { "sector": "Transport and Communication", "size": 9.7 },
            { "sector": "Finance, real estate and business services", "size": 22 } ],
          "1997": [
            { "sector": "Agriculture", "size": 6.1 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 20.9 },
            { "sector": "Electricity and Water", "size": 1.8 },
            { "sector": "Construction", "size": 4.2 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 13.7 },
            { "sector": "Transport and Communication", "size": 9.4 },
            { "sector": "Finance, real estate and business services", "size": 22.1 } ],
          "1998": [
            { "sector": "Agriculture", "size": 6.2 },
            { "sector": "Mining and Quarrying", "size": 0.3 },
            { "sector": "Manufacturing", "size": 21.4 },
            { "sector": "Electricity and Water", "size": 1.9 },
            { "sector": "Construction", "size": 4.2 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 14.5 },
            { "sector": "Transport and Communication", "size": 10.6 },
            { "sector": "Finance, real estate and business services", "size": 23 } ],
          "1999": [
            { "sector": "Agriculture", "size": 5.7 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 20 },
            { "sector": "Electricity and Water", "size": 1.8 },
            { "sector": "Construction", "size": 4.4 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 15.2 },
            { "sector": "Transport and Communication", "size": 10.5 },
            { "sector": "Finance, real estate and business services", "size": 24.7 } ],
          "2000": [
            { "sector": "Agriculture", "size": 5.1 },
            { "sector": "Mining and Quarrying", "size": 0.3 },
            { "sector": "Manufacturing", "size": 20.4 },
            { "sector": "Electricity and Water", "size": 1.7 },
            { "sector": "Construction", "size": 4 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 16.3 },
            { "sector": "Transport and Communication", "size": 10.7 },
            { "sector": "Finance, real estate and business services", "size": 24.6 } ],
          "2001": [
            { "sector": "Agriculture", "size": 5.5 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 20.3 },
            { "sector": "Electricity and Water", "size": 1.6 },
            { "sector": "Construction", "size": 3.1 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 16.3 },
            { "sector": "Transport and Communication", "size": 10.7 },
            { "sector": "Finance, real estate and business services", "size": 25.8 } ],
          "2002": [
            { "sector": "Agriculture", "size": 5.7 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 20.5 },
            { "sector": "Electricity and Water", "size": 1.6 },
            { "sector": "Construction", "size": 3.6 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 16.1 },
            { "sector": "Transport and Communication", "size": 10.7 },
            { "sector": "Finance, real estate and business services", "size": 26 } ],
          "2003": [
            { "sector": "Agriculture", "size": 4.9 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 19.4 },
            { "sector": "Electricity and Water", "size": 1.5 },
            { "sector": "Construction", "size": 3.3 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 16.2 },
            { "sector": "Transport and Communication", "size": 11 },
            { "sector": "Finance, real estate and business services", "size": 27.5 } ],
          "2004": [
            { "sector": "Agriculture", "size": 4.7 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 18.4 },
            { "sector": "Electricity and Water", "size": 1.4 },
            { "sector": "Construction", "size": 3.3 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 16.9 },
            { "sector": "Transport and Communication", "size": 10.6 },
            { "sector": "Finance, real estate and business services", "size": 28.1 } ],
          "2005": [
            { "sector": "Agriculture", "size": 4.3 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 18.1 },
            { "sector": "Electricity and Water", "size": 1.4 },
            { "sector": "Construction", "size": 3.9 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 15.7 },
            { "sector": "Transport and Communication", "size": 10.6 },
            { "sector": "Finance, real estate and business services", "size": 29.1 } ],
          "2006": [
            { "sector": "Agriculture", "size": 4 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 16.5 },
            { "sector": "Electricity and Water", "size": 1.3 },
            { "sector": "Construction", "size": 3.7 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 14.2 },
            { "sector": "Transport and Communication", "size": 12.1 },
            { "sector": "Finance, real estate and business services", "size": 29.1 } ],
          "2007": [
            { "sector": "Agriculture", "size": 4.7 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 16.2 },
            { "sector": "Electricity and Water", "size": 1.2 },
            { "sector": "Construction", "size": 4.1 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 15.6 },
            { "sector": "Transport and Communication", "size": 11.2 },
            { "sector": "Finance, real estate and business services", "size": 30.4 } ],
          "2008": [
            { "sector": "Agriculture", "size": 4.9 },
            { "sector": "Mining and Quarrying", "size": 0.3 },
            { "sector": "Manufacturing", "size": 17.2 },
            { "sector": "Electricity and Water", "size": 1.4 },
            { "sector": "Construction", "size": 5.1 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 15.4 },
            { "sector": "Transport and Communication", "size": 11.1 },
            { "sector": "Finance, real estate and business services", "size": 28.4 } ],
          "2009": [
            { "sector": "Agriculture", "size": 4.7 },
            { "sector": "Mining and Quarrying", "size": 0.3 },
            { "sector": "Manufacturing", "size": 16.4 },
            { "sector": "Electricity and Water", "size": 1.9 },
            { "sector": "Construction", "size": 4.9 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 15.5 },
            { "sector": "Transport and Communication", "size": 10.9 },
            { "sector": "Finance, real estate and business services", "size": 27.9 } ],
          "2010": [
            { "sector": "Agriculture", "size": 4.2 },
            { "sector": "Mining and Quarrying", "size": 0.3 },
            { "sector": "Manufacturing", "size": 16.2 },
            { "sector": "Electricity and Water", "size": 2.2 },
            { "sector": "Construction", "size": 4.3 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 15.7 },
            { "sector": "Transport and Communication", "size": 10.2 },
            { "sector": "Finance, real estate and business services", "size": 28.8 } ],
          "2011": [
            { "sector": "Agriculture", "size": 4.1 },
            { "sector": "Mining and Quarrying", "size": 0.3 },
            { "sector": "Manufacturing", "size": 14.9 },
            { "sector": "Electricity and Water", "size": 2.3 },
            { "sector": "Construction", "size": 5 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 17.3 },
            { "sector": "Transport and Communication", "size": 10.2 },
            { "sector": "Finance, real estate and business services", "size": 27.2 } ],
          "2012": [
            { "sector": "Agriculture", "size": 3.8 },
            { "sector": "Mining and Quarrying", "size": 0.3 },
            { "sector": "Manufacturing", "size": 14.9 },
            { "sector": "Electricity and Water", "size": 2.6 },
            { "sector": "Construction", "size": 5.1 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 15.8 },
            { "sector": "Transport and Communication", "size": 10.7 },
            { "sector": "Finance, real estate and business services", "size": 28 } ],
          "2013": [
            { "sector": "Agriculture", "size": 3.7 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 14.9 },
            { "sector": "Electricity and Water", "size": 2.7 },
            { "sector": "Construction", "size": 5.7 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 16.5 },
            { "sector": "Transport and Communication", "size": 10.5 },
            { "sector": "Finance, real estate and business services", "size": 26.6 } ],
          "2014": [
            { "sector": "Agriculture", "size": 3.9 },
            { "sector": "Mining and Quarrying", "size": 0.2 },
            { "sector": "Manufacturing", "size": 14.5 },
            { "sector": "Electricity and Water", "size": 2.7 },
            { "sector": "Construction", "size": 5.6 },
            { "sector": "Trade (Wholesale, Retail, Motor)", "size": 16.6 },
            { "sector": "Transport and Communication", "size": 10.5 },
            { "sector": "Finance, real estate and business services", "size": 26.5 } ]
        };

        return chartData;

    }

    function generateChartData(chartData, arr) {

        for (var i = 0; i < arr.length; i++) {
            data = {"X": arr[i].X, "Y": arr[i].Y, "Z": arr[i].Z};
            chartData.push(data);
        }
    }

    function generateChartData1(chartData) {
        var firstDate = new Date();
        firstDate.setTime(firstDate.getTime() - 10 * 24 * 60 * 60 * 1000);

        for (var i = firstDate.getTime(); i < (firstDate.getTime() + 10 * 24 * 60 * 60 * 1000); i += 60 * 60 * 1000) {
            var newDate = new Date(i);

            if (i == firstDate.getTime()) {
                var value1 = Math.round(Math.random() * 10) + 1;
            } else {
                var value1 = Math.round(chartData[chartData.length - 1].value1 / 100 * (90 + Math.round(Math.random() * 20)) * 100) / 100;
            }

            if (newDate.getHours() == 12) {
                // we set daily data on 12th hour only
                var value2 = Math.round(Math.random() * 12) + 1;
                chartData.push({
                    date: newDate,
                    value1: value1,
                    value2: value2
                });
            } else {
                chartData.push({
                    date: newDate,
                    value1: value1
                });
            }
        }
    }

});
                 

 