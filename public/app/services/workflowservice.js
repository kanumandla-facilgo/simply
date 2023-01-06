app.service('workflowService', function($http, utilService) {

	this.getWorkflowHierarchy = function(callback) {
		

		var url = "";
		url = "/api/workflow";
		

		// call API
 		$http.get(utilService.getBaseURL() + url).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.createWorkflowHierarchy = function(workflow, callback) {

		

		// call API
 		$http.post(utilService.getBaseURL() + "/api/workflow/", workflow).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};
		
	
	
	

});
