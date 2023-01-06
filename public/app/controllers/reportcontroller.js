app.controller('reportcontroller', function ($scope, $http, $location, utilService, reportService, $routeParams, $rootScope, $route, $q) {

  	$scope.utilService = utilService;

	var getReportViaPromise = function (reportid, options) {
	
		return reportService.printReport(reportid, options).then(
			function (response) {
				if (response.data.statuscode == 0 && response.data && response.data.data && response.data.data.report) {
					$scope.report = response.data.data.report;
					$scope.align = {};
					for (i=0; i < $scope.report.column_header_list.length; i++) {
						var align = $scope.report.column_header_list[i].align;
						if (align == 1 || align == 3)
							align = "right";
						else
							align = "left";
						$scope.align[$scope.report.column_header_list[i].name] = align;
					}
					// $scope.align = {};
					// $scope.align["stock_qty"] = "right";
					// $scope.align["stock_quote"] = "right";
					return $scope.report;
				}
				else if (response.statuscode === -100)  {
					window.location.replace("/#/login");
					return [];
				}
				else {
					return [];
				}
			}
		);

	};

	$scope.getReport = function (reportid, options) {

		options["format"] = "HTML";
		for (i = 0; i < $scope.report_list.length; i++) {
			if ($scope.report_list[i].id == reportid) {
				for (j = 0; j < $scope.report_list[i].parameterlist.length; j++) {
					options[$scope.report_list[i].parameterlist[j].name] = $scope.report_list[i].parameterlist[j].value; 
				}

			}
		}
		getReportViaPromise(reportid, options);


	};

	$scope.getReportPDF = function(reportid, options){
		$scope.loading = true;
		var q = $q.defer();

		if (!options) options = {};

		reportService.printReport(reportid, options)
				.success(function (response) {
					var file = new Blob([response], {type: 'application/pdf'});
					var fileURL = URL.createObjectURL(file);
					q.resolve(fileURL);
				})
				.error(function(err){
					q.reject(err);
				});
		return q.promise;
    };

	//To print pdf on new window/ Button_Click event.
	$scope.printReportPdf = function(reportid, options){
		options["format"] = "PDF";
		$scope.getReportPDF(reportid, options).then(function(response){
			window.open(response);
			URL.revokeObjectURL(response);
		},function(err){
			console.log('Error: ' + err);
		});
	};

	var master_report_list = [
								{
									"id":1,
									"name":"Stock In Process Report",
									"title":"Stock In Process Report",
									"sort_order":1,
									"access_right":3,
									"parameterlist":[ /*
										{
											"caption":"From Date",
											"name": "from_date",
											"data_type": "date",
											"control_type": "textbox",
											"required":true,
											"sort_order": 1,
											"default":new Date()
										},
										{
											"caption":"To Date",
											"name": "to_date",
											"data_type": "date",
											"control_type": "textbox",
											"sort_order": 2,
											"required":true,
											"default":new Date()
										},
										{
											"caption":"Status",
											"name": "statusid",
											"data_type": "int",
											"control_type": "dropdown",
											"required":true,
											"sort_order": 3,
											"default":-1,
											"options":[{
												"id": -1,
												"text": "All"

											}, {
												"id": 202,
												"text": "In Packing"
											}]
										} */
									]
								},
								{
									"id":2,
									"name":"Logged in Users",
									"title":"Logged In Users",
									"sort_order":2,
									"access_right":3,
									"parameterlist":[
										{
											"caption":"Since # of days",
											"name": "option1",
											"data_type": "int",
											"control_type": "textbox",
											"required":true,
											"sort_order": 1,
											"value": 3
										}
									]
								},
								{
									"id":3,
									"name":"Agent Balance",
									"title":"Agent Balance",
									"sort_order":3,
									"access_right":3,
									"parameterlist":[
									]
								},
								{
									"id":4,
									"name":"Customers Pending Sync",
									"title":"Customers Pending Sync",
									"sort_order":4,
									"access_right":3,
									"parameterlist":[]
								},
								{
									"id":5,
									"name":"Inventory Report",
									"title":"Inventory Report",
									"sort_order":5,
									"access_right":127,
									"parameterlist":[]
								}
							];

//	if ($rootScope.action == "show_reports") {

		$scope.report_list = [];

		let access_right = utilService.getAccessRight();

		for (let i = 0; i < master_report_list.length; i++) {
			if (access_right & master_report_list[i].access_right)
				$scope.report_list.push(master_report_list[i]);
		}
		
		return $scope.report_list;

//	}

});
                 

 