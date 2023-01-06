app.service('masterService', function($http, utilService) {
	
	this.customerHash = {};

	this.getUnitOfMeasures = function( options, callback) {

		
		
		var query_string = "";
		if (options) {
			if (options.activeonly && options.activeonly == 1) {
				query_string = (query_string != "" ? "&" + query_string : query_string) + "activeonly=1";	
			}
		}
		url = "/api/unitofmeasures/" + (query_string != "" ? "?" + query_string : "");

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

	this.getUnitOfMeasureById = function(id,  callback) {

		// call API
		$http.get(utilService.getBaseURL() + "/api/unitofmeasures/" + id).success(
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

	this.deleteUnitOfMeasure = function (id,  callback) {		

 		$http.delete(utilService.getBaseURL() + "/api/unitofmeasures/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = null;

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

	this.createUnitOfMeasure = function(uom,  callback) {


		data = {
			uom              : uom
		};

		// call API
		$http.post(utilService.getBaseURL() + "/api/unitofmeasures/", data).success(
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

	this.editUnitOfMeasure = function(uom,  callback) {

		data = {
			uom              : uom
		};

		// call API
		$http.put(utilService.getBaseURL() + "/api/unitofmeasures/" + uom.id, data).success(
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

	this.getTransporters = function( options, callback) {

		let data = "";
		let url = "/api/transporters/";
		let config = {};
		let sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		let sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");
		let format = (options.format ? "format=" + options.format : "");
		let activeonly = (options.activeonly ? "activeonly=" + options.activeonly : "");

		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;
		if (activeonly != "") data = data + (data != "" ? "&" : "?") + activeonly;
		if (format != "") {
			data = data + (data != "" ? "&" : "?") + "format=" + options.format;
			url += "export";
			config = 
			{
				responseType: 'arraybuffer'
			};
		}

		// call API
 		$http.get(utilService.getBaseURL() + url + data, config).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else if ((format != "") && (response.statuscode == undefined)) {
							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success"
							object.data          = response;

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

	this.getTransporterById = function(id,  callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/transporters/" + id).success(
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

	this.deleteTransporter = function (id,  callback) {		

 		$http.delete(utilService.getBaseURL() + "/api/transporters/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = null;

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
	
	this.createTransporter = function(code, external_code, name, first_name, last_name, address1, address2, address3, city, state, zip, phone1, phone2, email1, email2,  callback) {

		

	 	data = {
  					code             : code,
  					external_code    : external_code,
  					name             : name,
  					first_name       : first_name,
  					last_name        : last_name,
  					address1         : address1,
  					address2         : address2,
  					address3         : address3,
  					city             : city,
  					state            : state,
  					zip              : zip,
  					phone1           : phone1,
  					email1           : email1,
  					phone2           : phone2,
  					email2           : email2
  				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/transporters/", data).success(
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

	this.editTransporter = function(id, code, external_code, name, first_name, last_name, address1, address2, address3, city, state, zip, phone1, phone2, email1, email2, statusid,  callback) {

		

	 	data = {
	 				id               : id,
 					code             : code,
  					external_code    : external_code,
  					name             : name,
  					first_name       : first_name,
  					last_name        : last_name,
  					address1         : address1,
  					address2         : address2,
  					address3         : address3,
  					city             : city,
  					state            : state,
  					zip              : zip,
  					phone1           : phone1,
  					email1           : email1,
  					phone2           : phone2,
  					email2           : email2,
  					status_id        : statusid
   				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/transporters/" + id, data).success(
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
	

	this.getCustomerTypes = function( options, callback) {

		

		let data = "";

		let sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		let sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");

		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;

		url = "/api/companytypes/" + data;

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

	this.getCustomerTypeById = function(id,  callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/companytypes/" + id).success(
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

	this.deleteCustomerType = function (id,  callback) {		

 		$http.delete(utilService.getBaseURL() + "/api/companytypes/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = null;

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
	
	this.createCustomerType = function(name, description, balance, isdefault,  callback) {

		

	 	data = {
  					name             : name,
  					description      : description,
  					balance_limit    : balance,
  					is_default       : isdefault
   				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/companytypes/", data).success(
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

	this.editCustomerType = function(id, name, description, balance, isdefault,  callback) {

		

	 	data = {
	 				id               : id,
  					name             : name,
  					description      : description,
  					balance_limit    : balance,
  					is_default       : isdefault
   				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/companytypes/" + id, data).success(
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

	this.createCustomFilter = function(documenttype, name, value, isuserdefined, showindashboard,  callback) {

		

	 	data = {
  					name : name,
  					document_type : documenttype,
  					filters : value,
  					is_user_defined : isuserdefined,
  					show_in_dashboard : showindashboard
   				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/customfilters/", data).success(
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

	this.updateCustomFilter = function(id, documenttype, name, value, isuserdefined, showindashboard,  callback) {

		

	 	data = {
  					name : name,
  					document_type : documenttype,
  					filters : value,
  					is_user_defined : isuserdefined,
  					show_in_dashboard : showindashboard
   				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/customfilters/" + id, data).success(
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

	this.deleteCustomFilter  = function(id,  callback) {

		// call API
 		$http.delete(utilService.getBaseURL() + "/api/customfilters/" + id).success(
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


	this.getPaymentTerms = function( options, callback) {

		

		let data = "";

		// if (options.activeonly)
		// 	data = data + "activeonly=" + options.activeonly;

		let sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		let sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");
		let activeonly = (options.activeonly ? "activeonly=" + options.activeonly : "");

		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;
		if (activeonly != "") data = data + (data != "" ? "&" : "?")  + activeonly;

//		url = "/api/paymentterms/" + (activeonly ? "?activeonly=1" : "");;
		let url = "/api/paymentterms/" + data ; //(activeonly ? "?activeonly=1" : "");

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

	this.getTempos = function(callback) {
		

		let url = "/api/tempos/";

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

	this.getPaymentTermById = function(id,  callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/paymentterms/" + id).success(
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

	this.deletePaymentTerm = function (id,  callback) {		

 		$http.delete(utilService.getBaseURL() + "/api/paymentterms/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = null;

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
	
	this.createPaymentTerm = function(code, description, days,  callback) {

		

	 	data = {
  					code             : code,
  					description      : description,
  					days             : days
  				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/paymentterms/", data).success(
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

	this.createTempo = function(company_name, driver_name, vehicle_number,  callback) {

		

	 	data = {
  					name : company_name,
  					driver_name : driver_name,
  					vehicle_number : vehicle_number
  				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/tempos/", data).success(
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

	this.updateTempo = function(id, company_name, driver_name, vehicle_number,  callback) {

		

	 	data = {
	 				id: id,
  					name : company_name,
  					driver_name : driver_name,
  					vehicle_number : vehicle_number
  				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/tempos/"+id, data).success(
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

	this.editPaymentTerm = function(id, code, description, days, statusid,  callback) {

		

	 	data = {
	 				id               : id,
  					code             : code,
  					description      : description,
  					days             : days,
  					status_id        : statusid
   				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/paymentterms/" + id, data).success(
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
	
	this.getCustomers = function(options,  callback) {

		
		var config = {};
		//TODO: encode
		var search_text = (options.search_text ? "search_text=" + options.search_text : "");
		var enabled_only = (options.statusid ? "statusid=" + options.statusid : "");
		var agent_id = (options.agent_id ? "agent_id=" + options.agent_id : "");
		var sales_person_id = (options.sales_person_id ? "sales_person_id=" + options.sales_person_id : "");

		var page_size = (options.page_size ? "page_size=" + options.page_size : "");
		var page_number = (options.page_number ? "page_number=" + options.page_number : "");

		var customer_name = (options.customer_name ? "customer_name=" + options.customer_name : "");
		var city_name = (options.city_name ? "city_name=" + options.city_name : "");
		var state_name = (options.state_name ? "state_name=" + options.state_name : "");
		var code = (options.doc_number ? "code=" + options.doc_number : "");

		var sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		var sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");

		var format = (options.format ? "format=" + options.format : "");

		var data = "";

		if (search_text != "") data = "?" + search_text;
		if (enabled_only != "") data = data + (data != "" ? "&" : "?") +  enabled_only;
		if (agent_id != "") data = data + (data != "" ? "&" : "?") +  agent_id;
		if (sales_person_id != "") data = data + (data != "" ? "&" : "?") +  sales_person_id;

		if (page_size != "") data = data + (data != "" ? "&" : "?") +  page_size;
		if (page_number != "") data = data + (data != "" ? "&" : "?") +  page_number;

		if (customer_name != "") data = data + (data != "" ? "&" : "?") +  encodeURI(customer_name);
		if (city_name != "") data = data + (data != "" ? "&" : "?") +  encodeURI(city_name);
		if (state_name != "") data = data + (data != "" ? "&" : "?") +  state_name;
		if (code != "") data = data + (data != "" ? "&" : "?") + code;

		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;

		var url = "/api/customers/";
		if(format != "")
		{
			url = "/api/customers/export"
			config = 
			{
				responseType: 'arraybuffer'
			};
			data = data + (data != "" ? "&" : "?") + format;
		}

		// call API
		if (callback) {
			$http.get(utilService.getBaseURL() + url + data, config).success(
						function (response, status, headers) {
							if (status == 200 && response.statuscode == "0") {

								var object = new Object();
								object.statuscode    = 0;
								object.message       = "Success";
								object.data          = response.data;
						
								callback(object);
							}
							else if((format != "") && (response.statuscode == undefined))
							{
								var object = new Object();
								object.statuscode    = "0";
								object.message       = "success";
								object.data          = response;

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
		}
		else {
			return $http.get(utilService.getBaseURL() + "/api/customers/" + data);
		}
	};

	this.getCustomerById = function(id,  callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/customers/" + id).success(
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

	this.deleteCustomer = function (id,  callback) {		

 		$http.delete(utilService.getBaseURL() + "/api/customers/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = null;

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
	
	this.createCustomer = function(customer, user,  callback) {

		


	 	data = {
	 				"customer": customer,
	 				"user"    : user
   				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/customers/", data).success(
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

	this.editCustomer = function(customer,  callback) {

		

	 	data = {
	 				"customer": customer
   				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/customers/" + customer.id, data).success(
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

	this.getAgents = function ( options, callback) {

		var config = 
		{
				
		};
    
		var data = "";

		if (options.search_text)
		    data = data + "&search_text=" + options.search_text;
		
		if (options.salesperson_id)
		    data = data + "&salesperson_id=" + options.salesperson_id;

		if (options.statusid)
		    data = data + "&status_id=" + options.statusid;

		if (options.sortby)
		    data = data + "&sort_by=" + options.sortby;

		if (options.sortdirection)
		    data = data + "&sort_direction=" + options.sortdirection;

		if(options.format)
			data = data + "&format=" + options.format;

		if (data != "")
		    data = "?" + data;

		var url = "/api/agents/";

		if(options.format)
		{
			config = 
			{
				responseType: 'arraybuffer'
			};
			url += "export"
		}

		// call API
		if(callback)
		{
		    $http.get(utilService.getBaseURL() + url + data, config).success(
						function (response, status, headers) {
							if (status == 200 && response.statuscode == "0") {

								var object = new Object();
								object.statuscode    = 0;
								object.message       = "Success";
								object.data          = response.data;
							
								callback(object);
							}
							else if(response.statuscode != undefined) {
								var object = new Object();
								object.statuscode    = response.statuscode;
								object.message       = response.message;
								object.data          = null;

								callback(object);
							}
							else {
								var object = new Object();
								object.statuscode    = 0;
								object.message       = "success";
								object.data          = response;

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
        } else {
			return $http.get(utilService.getBaseURL() + "/api/agents/" + data);
		}
	};

	this.getAgentById = function(id,  callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/agents/" + id).success(
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

	this.createcompany = function(company, user, callback) {

	 	data = {
	 				"company": company,
	 				"user" : user
   				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/companies/", data).success(
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

	this.createBill = function(bill, callback) {

	 	data = {
	 				"bill": bill
   				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/bills/", data).success(
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

	this.updateBill = function(bill, callback) {

	 	data = {
	 				"bill": bill
   				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/bills/", data).success(
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


	this.findBillById = function(id, callback) {

	 	// call API
 		$http.get(utilService.getBaseURL() + "/api/bills/" + id).success(
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

	this.deleteAgent = function (id,  callback) {		

 		$http.delete(utilService.getBaseURL() + "/api/agents/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = null;

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

	this.createAgent = function(customer, user,  callback) {

	 	data = {
	 				"agent": customer,
	 				"user" : user
   				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/agents/", data).success(
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

	this.editAgent = function(customer,  callback) {

		

	 	data = {
	 				"agent": customer
   				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/agents/" + customer.id, data).success(
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

	this.findUnitConversions = function(uomid, from_uomid, to_uomid,  callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/unitconversions/" + uomid + "?from=" + from_uomid + "&to=" + to_uomid).success(
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

	this.getTaxSlabs = function( options, callback) {

		
		
		var query_string = "";
		if (options) {
			if (options.activeonly && options.activeonly == 1) {
				query_string = (query_string != "" ? "&" + query_string : query_string) + "activeonly=1";	
			}
		}
		url = "/api/taxslabs/" + (query_string != "" ? "?" + query_string : "");

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

	this.getHsn = function( options, callback) {

		
		
		var query_string = "";
		if (options) {
			if (options.activeonly && options.activeonly == 1) {
				query_string = (query_string != "" ? "&" + query_string : query_string) + "activeonly=1";	
			}
		}
		url = "/api/hsn/" + (query_string != "" ? "?" + query_string : "");

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

	this.getHsnById = function(id) {

		const url = "/api/hsn/" + id;

		return new Promise( (resolve, reject) => {
			// call API
	 		$http.get(utilService.getBaseURL() + url).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;

							return resolve(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							return resolve(object);

						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					return reject(object);

               	});
		});


	};

	this.createHsn = function(hsn,  callback) {

		// call API
 		$http.post(utilService.getBaseURL() + "/api/hsn/", hsn).success(
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

	this.editHsn = function(hsn,  callback) {

		// call API
 		$http.put(utilService.getBaseURL() + "/api/hsn/" + hsn.id, hsn).success(
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

	this.deleteHsn = function(id,  callback) {

		// call API
 		$http.delete(utilService.getBaseURL() + "/api/hsn/" + id).success(
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

	this.getTax = function( options, callback) {

		
		
		var query_string = "";
		if (options) {
			if (options.id) {
				query_string = (query_string != "" ? query_string + "&" : query_string) + "id=" + options.id;	
			}
			if (options.cform && options.cform == 1) {
				query_string = (query_string != "" ? query_string + "&" : query_string) + "cform=1";	
			}
			if (options.hform && options.hform == 1) {
				query_string = (query_string != "" ? query_string + "&" : query_string) + "hform=1";	
			}
			if (options.deliveryid) {
				query_string = (query_string != "" ? query_string + "&" : query_string) + "deliveryid=" + options.deliveryid;	
			}
			if (options.productid) {
				query_string = (query_string != "" ? query_string + "&" : query_string) + "productid=" + options.productid;	
			}
			if (options.extension) {
				query_string = (query_string != "" ? query_string + "&" : query_string) + "extension=" + options.extension;	
			}
		}

		url = "/api/tax" + (query_string != "" ? "?" + query_string : "");

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

	this.findAllBills = function(options,  callback) {

		
		var url = "/api/bills/";
		var config = {};
		//TODO: encode
		var customerid = (options.customerid ? "customerid=" + options.customerid : "");
		var fromdate = (options.fromdate ? "fromdate=" + options.fromdate : "");
		var todate = (options.todate ? "todate=" + options.todate : "");
		var duedatefrom = (options.duedatefrom ? "duedatefrom=" + options.duedatefrom : "");
		var duedateto = (options.duedateto ? "duedateto=" + options.duedateto : "");
		var nextreminderfrom = (options.nextreminderfrom ? "nextreminderfrom=" + options.nextreminderfrom : "");
		var nextreminderto = (options.nextreminderto ? "nextreminderto=" + options.nextreminderto : "");
		var bill_id = (options.bill_id ? "id=" + options.bill_id : "");
		var bill_number = (options.bill_number ? "bill_number=" + options.bill_number : "");
		var bill_ref_number = (options.bill_ref_number ? "bill_ref_number=" + options.bill_ref_number : "");

		var status_id = (options.status_id ? "status_id=" + options.status_id : "");
		var page_size = (options.page_size ? "page_size=" + options.page_size : "");
		var page_number = (options.page_number ? "page_number=" + options.page_number : "");
		var sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		var sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");
		var format = (options.format ? "format=" + options.format : "");

		var data = "";

		if (customerid != "") data = "?" + customerid;
		if (fromdate != "") data = data + (data != "" ? "&" : "?") +  fromdate;
		if (todate != "") data = data + (data != "" ? "&" : "?") +  todate;
		if (duedatefrom != "") data = data + (data != "" ? "&" : "?") +  duedatefrom;
		if (duedateto != "") data = data + (data != "" ? "&" : "?") +  duedateto;
		if (nextreminderfrom != "") data = data + (data != "" ? "&" : "?") +  nextreminderfrom;
		if (nextreminderto != "") data = data + (data != "" ? "&" : "?") +  nextreminderto;
		if (bill_id != "") data = data + (data != "" ? "&" : "?") +  bill_id;
		if (bill_number != "") data = data + (data != "" ? "&" : "?") +  bill_number;
		if (bill_ref_number != "") data = data + (data != "" ? "&" : "?") +  bill_ref_number;
		if (status_id != "") data = data + (data != "" ? "&" : "?") +  status_id;

		if (page_size != "") data = data + (data != "" ? "&" : "?") +  page_size;
		if (page_number != "") data = data + (data != "" ? "&" : "?") +  page_number;


		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;
		if (format != "") {
			data = data + (data != "" ? "&" : "?") + format;
			url += "export";
			config = 
			{
				responseType: 'arraybuffer'
			};
		}

		// call API
		if (callback) {
			$http.get(utilService.getBaseURL() + url + data, config).success(
						function (response, status, headers) {
							if (status == 200 && response.statuscode == "0") {

								var object = new Object();
								object.statuscode    = 0;
								object.message       = "Success";
								object.data          = response.data;
						
								callback(object);
							}
							else if((format != "") && (response.statuscode == undefined)) {
								var object = new Object();
								object.statuscode    = 0;
								object.message       = "Success";
								object.data          = response;

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
		}
		else {
			return $http.get(utilService.getBaseURL() + "/api/customers/" + data);
		}
	};

	this.findAllNotifications = function(options,  callback) {

		
		var url = "/api/notifications/";
		var config = {};

		//TODO: encode
		var customerid = (options.customerid ? "customerid=" + options.customerid : "");
		var nottypeid = (options.typeid ? "typeid=" + options.typeid : "");
		var notformatid = (options.formatid ? "formatid=" + options.formatid : "");
		var status_id = (options.statusid ? "statusid=" + options.statusid : "");
		var fromdate = (options.fromdate ? "fromdate=" + options.fromdate : "");
		var todate = (options.todate ? "todate=" + options.todate : "");
		var page_size = (options.page_size ? "page_size=" + options.page_size : "");
		var page_number = (options.page_number ? "page_number=" + options.page_number : "");
		var sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		var sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");
		var format = (options.format ? "format=" + options.format : "");

		var data = "";

		if (customerid != "") data = "?" + customerid;
		if (nottypeid != "") data = data + (data != "" ? "&" : "?") +   nottypeid;
		if (notformatid != "") data = data + (data != "" ? "&" : "?") +  notformatid;
		if (status_id != "") data = data + (data != "" ? "&" : "?") +  status_id;
		if (fromdate != "") data = data + (data != "" ? "&" : "?") +  fromdate;
		if (todate != "") data = data + (data != "" ? "&" : "?") +  todate;

		if (page_size != "") data = data + (data != "" ? "&" : "?") +  page_size;
		if (page_number != "") data = data + (data != "" ? "&" : "?") +  page_number;


		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;
		if (format != "") {
			data = data + (data != "" ? "&" : "?") + format;
			url += "export";
			config = 
			{
				responseType: 'arraybuffer'
			};
		}

		// call API
		if (callback) {
			$http.get(utilService.getBaseURL() + url + data, config).success(
						function (response, status, headers) {
							if (status == 200 && response.statuscode == "0") {

								var object = new Object();
								object.statuscode    = 0;
								object.message       = "Success";
								object.data          = response.data;
						
								callback(object);
							}
							else if((format != "") && (response.statuscode == undefined)) {
								var object = new Object();
								object.statuscode    = 0;
								object.message       = "Success";
								object.data          = response;

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
		}
		else {
			return $http.get(utilService.getBaseURL() + "/api/customers/" + data);
		}
	};

	this.getCustomFilters = function(options, callback) {

		var url = "/api/customfilters/";

		var document_type = (options.document_type ? "document_type=" + options.document_type : "");
		var id = (options.id ? "id=" + options.id : "");
		var show_in_dashboard = (options.show_in_dashboard ? "show_in_dashboard=" + options.show_in_dashboard : "");

		var data = "";

		if (document_type != "") data = "?" + document_type;
		if (id != "") data = data + (data != "" ? "&" : "?") +  id;
		if (show_in_dashboard != "") data = data + (data != "" ? "&" : "?") +  show_in_dashboard;

		url = url + data;

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

	this.uploadFile = function(fileData, uploadType, callback) {

		var url = "/api/uploads/";
		if(uploadType == "Agents")
		{
			url += "agents";
		}
		else if(uploadType == "Bills")
		{
			url += "bills";
		}
		
		else if(uploadType == "Customers")
		{
			url += "customers";
		}
		else if(uploadType == "Transporters")
		{
			url += "transporters";
		}

		// call API
 		$http.post(utilService.getBaseURL() + url, fileData, {headers: { 'Content-Type': undefined},
        transformRequest: angular.identity}).success(
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

	this.getUploadTemplate = function(uploadType, callback) {

		var url = "/api/uploads/";
		if(uploadType == "Agents")
		{
			url += "agents";
		}
		else if(uploadType == "Bills")
		{
			url += "bills";
		}
		else if(uploadType == "Customers")
		{
			url += "customers";
		}
		else if(uploadType == "Transporters")
		{
			url += "transporters";
		}

		url += "/templates";

		config = 
		{
			responseType: 'arraybuffer'
		};

		// call API
 		$http.get(utilService.getBaseURL() + url, config).success(
					function (response, status, headers) {
						if (response.statuscode == undefined) {
							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success"
							object.data          = response;

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

	this.getUploads = function(options, callback) {

		var url = "/api/uploads/";

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

	this.getUploadById = function(id, detail, callback) {

		var url = "/api/uploads/";

		url += id;
		url += "?detail=" + detail;

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

	this.downloadSetup = function(companyname, callback) {
		var config = 
		{
			responseType: 'arraybuffer'
		};

		// call API
 		$http.get(utilService.getBaseURL() + "/api/companies/tallysetup/download?companyname=" + companyname, config).success(
					function (response, status, headers) {
						if (status == 200) {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.headers		 = headers;
							object.data          = response;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = -1;
							object.message       = "Image not found";
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
	}

	this.setCustomer = function (customer, keyname) {
		if (!keyname)
			keyname = 'customer_filter';

		this.customerHash[keyname] = customer;
	};

	this.getCustomer = function (keyname) {

		if (!keyname)
			keyname = 'customer_filter';

		if (this.customerHash)			
			return this.customerHash[keyname];
		else
			return undefined;
	};
	
	this.clearCustomer = function (keyname) {

		if (!keyname)
			keyname = 'customer_filter';
			
		delete this.customerHash[keyname];

	};

});
