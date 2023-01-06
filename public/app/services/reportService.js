app.service('reportService', function($http, utilService) {

	this.printReport  = function(reportid, options) {


		if (options["format"] == "PDF") {
			config["responseType"] = "arraybuffer";
		}

		var url = "";

		for (var key in options) {
	  		if (options.hasOwnProperty(key))
				url = url + "&" + key + "=" + options[key];
		}

		// for (j=0; j < options.length; j++) {
		// 	url = url + "&" + key + "=" + options[key];
		// }

		url = "/api/reports/"+reportid + "?a=1" + url;

//		$http.defaults.headers.common['content-type']= 'application/pdf';
		return $http.get(utilService.getBaseURL() + url);

	};

});
