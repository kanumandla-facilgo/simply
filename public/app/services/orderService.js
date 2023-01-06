app.service('orderService', function($http, utilService) {

	this.getOrders = function(options, currentpage, records_per_page, callback) {

		let url = "";
		url = "/api/orders/";
		var config = {};
		
		let data =  "?currentpage=" + currentpage + "&records_per_page=" + records_per_page;

		if (options.agentid)
			data = data + "&agentid=" + options.agentid;

		if (options.customerid)
			data = data + "&customerid=" + options.customerid;

		if (options.statusid)
			data = data + "&statusid=" + options.statusid;

		if (options.deliverystatusid)
			data = data + "&deliverystatusid=" + options.deliverystatusid;

		if (options.fromdate)
			data = data + "&fromdate=" + options.fromdate;

		if (options.todate)
			data = data + "&todate=" + options.todate;

		if (options.productid)
			data = data + "&productid=" + options.productid;

		if (options.custom_filter_id)
			data = data + "&custom_filter_id=" + options.custom_filter_id;

		if (options.from_page)
			data = data + "&from_page=" + options.from_page;

		if (options.doc_number)
			data = data + "&order_number=" + options.doc_number;

		if (options.my_approval_only)
			data = data + "&my_approval_only=" + options.my_approval_only;

		if (options.format)
		{
			data = data + "&format=" + options.format;
			url += "export";
			config = 
			{
				responseType: 'arraybuffer'
			};
		}

		let sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		let sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");

		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;

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
						else if((options.format != "") && (response.statuscode == undefined))
						{
							var object = new Object();
							object.statuscode    = 0;
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
	};

	this.getOrder = function(id, callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/orders/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data.order;
						
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

	this.createOrder = function(order, callback) {

			return create(order, callback);
	};

	this.findById  = function(orderid, callback) {

		
		
		var url = "";
		url = "/api/orders/"+orderid;

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
	
	this.findByIdWithCustomerCode  = function(orderid, customer_code, callback) {

		var url = "";
		url = "/api/orders/" + orderid +"?customer_code=" + customer_code;

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


	this.printOrder  = function(orderid) {

		// get SID
		var config = {headers:  {
				
			},responseType: "arraybuffer"
		};

		var url = "";
		url = "/api/orders/"+orderid + "?format=PDF";

//		$http.defaults.headers.common['content-type']= 'application/pdf';
		return $http.get(utilService.getBaseURL() + url, config);

	};

	this.printPackingSlip  = function(id) {

		// get SID
		var config = {headers:  {
				
			},responseType: "arraybuffer"
		};

		var url = "";
		url = "/api/packingslips/"+id + "?format=PDF";

//		$http.defaults.headers.common['content-type']= 'application/pdf';
		return $http.get(utilService.getBaseURL() + url, config);

	};

	this.printGatePass  = function(id) {
		
		var config = {headers:  {
				
			},responseType: "arraybuffer"
		};

		var url = "";
		url = "/api/gatepass/"+id + "?format=PDF";

		return $http.get(url, config);

	};

	this.findPackingslipsByOrderid  = function(orderid, callback) {

		
		
		var url = "";
		url = "/api/orders/"+orderid+"/packingslips/";

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

	this.findPackingslipById  = function(id, callback) {

		

		var url = "";
		url = "/api/packingslips/" + id;

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

	this.getPackingSlipDetail = function(id, callback) {

		

		var url = "";
		url = "/api/packingslips/" + id + "?detail=1";

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

	this.getPackingslips  = function(options, currentpage, records_per_page, callback) {

		
		let config = {};
		let url = "";
		url = "/api/packingslips/";

		let data =  "?currentpage=" + currentpage + "&records_per_page=" + records_per_page;

		if (options.agentid)
			data = data + "&agentid=" + options.agentid;

		if (options.customerid)
			data = data + "&customerid=" + options.customerid;

		if (options.statusid)
			data = data + "&statusid=" + options.statusid;

		if (options.fromdate)
			data = data + "&fromdate=" + options.fromdate;

		if (options.todate)
			data = data + "&todate=" + options.todate;

		if (options.productid)
			data = data + "&productid=" + options.productid;

		if (options.doc_number)
			data = data + "&slip_number=" + options.doc_number;

		if (options.gate_pass_number)
			data = data + "&gate_pass_number=" + options.gate_pass_number;

		if (options.format)
		{
			data = data + "&format=" + options.format;
			url += "export";
			config = 
			{
				responseType: 'arraybuffer'
			};
		}

		let sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		let sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");

		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;

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
						else if((options.format != "") && (response.statuscode == undefined)) {
							var object = new Object();
							object.statuscode    = 0;
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
	};

	this.getDeliveryNotes  = function(options, currentpage, records_per_page, callback) {

		
		let config = {};
		let url = "";
		url = "/api/deliverynotes/";

		let data =  "?currentpage=" + currentpage + "&records_per_page=" + records_per_page;

		if (options.agentid)
			data = data + "&agentid=" + options.agentid;

		if (options.customerid)
			data = data + "&customerid=" + options.customerid;

		if (options.statusid)
			data = data + "&statusid=" + options.statusid;

		if (options.fromdate)
			data = data + "&fromdate=" + options.fromdate;

		if (options.todate)
			data = data + "&todate=" + options.todate;

		if (options.productid)
			data = data + "&productid=" + options.productid;

		if (options.doc_number)
			data = data + "&note_number=" + options.doc_number;

		if (options.invoice_number)
			data = data + "&invoice_number=" + options.invoice_number;

		if (options.lr_number)
			data = data + "&lr_number=" + options.lr_number;

		if (options.gate_pass_number)
			data = data + "&gate_pass_number=" + options.gate_pass_number;

		if (options.format)
		{
			data = data + "&format=" + options.format;
			config = 
			{
				responseType: 'arraybuffer'
			};
			url += "export";
		}

		let sortby = (options.sortby ? "sort_by=" + options.sortby : "");
		let sortdirection = (options.sortdirection ? "sort_direction=" + options.sortdirection : "");

		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;

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
						else if((options.format != "") && (response.statuscode == undefined)) {

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
	};

	this.getEwayBills = function(data, callback) {

		var config = 
			{
				responseType: 'arraybuffer'
		};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/deliverynotes/ewaybills", data, config).success(
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
	};

	this.printDeliveryNote  = function(id, offsetLines, showTotals) {

		// get SID
		var config = {headers:  {
				
			},responseType: "arraybuffer"
		};

		var url = "";
		url = "/api/deliverynotes/"+id + "?format=PDF&offset_lines=" + offsetLines + "&show_totals=" + showTotals;
//		$http.defaults.headers.common['content-type']= 'application/pdf';
		return $http.get(utilService.getBaseURL() + url, config);

	};

	this.findDeliveryNoteById  = function(id, callback) {

		

		var url = "";
		url = "/api/deliverynotes/" + id;

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

	this.findGatePassById  = function(id, callback) {

		

		var url = "";
		url = "/api/gatepass/" + id;

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

	this.createDeliveryNote = function (delivery_note, callback) {

		

 		$http.post(utilService.getBaseURL() + "/api/deliverynotes/", delivery_note).success(
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


	this.updateDeliveryNote = function (delivery_note, callback) {

		

 		$http.put(utilService.getBaseURL() + "/api/deliverynotes/", delivery_note).success(
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

	var create = function(order, callback) {

		

		//product.uom = (product.uom && product.uom != "" ? product.uom : '100');
/*
	 	data = {
  					product          : product
  			   };
*/
		// call API
 		$http.post(utilService.getBaseURL() + "/api/orders/", order).success(
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
	
	this.createPackingslip = function(xPackingSlip, callback) {

		

		// call API
 		$http.post(utilService.getBaseURL() + "/api/orders/" + xPackingSlip.order.id +"/packingslips/", xPackingSlip).success(
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
	
	this.updateOrderStatus = function(action, order, callback) {

		

		// call API
 		$http.post(utilService.getBaseURL() + "/api/orders/" + order.id + "/" + action, order).success(
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

	this.cancelPackingslip = function(packingslip, callback) {

		

		// call API
 		$http.post(utilService.getBaseURL() + "/api/packingslips/" + packingslip.id + "/cancel", packingslip).success(
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

	this.cancelGatePass = function(id, callback) {		

		// call API
 		$http.post(utilService.getBaseURL() + "/api/gatepass/" + id + "/cancel", null).success(
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

	this.cancelDeliveryNote = function(id, callback) {

		

		// call API
 		$http.post(utilService.getBaseURL() + "/api/deliverynotes/" + id + "/cancel", null).success(
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

	this.completeDeliveryNote = function(id, callback) {

		

		// call API
 		$http.post(utilService.getBaseURL() + "/api/deliverynotes/" + id + "/complete", null).success(
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

	this.createGatePass = function(data, callback) {
		
		// call API
 		$http.post(utilService.getBaseURL() + "/api/gatepass/", data).success(
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
