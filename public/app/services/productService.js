app.service('productService', function($http, utilService) {

	this.productHash = {};

	this.findProductAllUOM = function(productid, callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + '/api/unitofmeasures/?productid=' + productid).success(
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
	
	this.getProducts = function(categoryid, customerid, options, callback) {

		
		var config = {};
		var url = "";
		var orig_url = "";

		if (categoryid)
			orig_url = "/api/products/category/" + categoryid;
		else
			orig_url = "/api/products/";

		var flg = 0;

		if(customerid)
		{
			flg = 1;
			url += "?customerid="+customerid;
			if(options.withproductsonly)
				url += "&withproductsonly="+options.withproductsonly;
		}

		if (options.enabled_only) {
				url += (flg == 0 ? "?" : "&") + "active_only=" + options.enabled_only;
				flg = 1;
		}

		if (options.productid) {
				url += (flg == 0 ? "?" : "&") + "product_id=" + options.productid;
				flg = 1;
		}

		if (options.is_hidden_no_stock) {
				url += (flg == 0 ? "?" : "&") + "hide_non_stocked_items=" + options.is_hidden_no_stock;
				flg = 1;
		}

		if (options.is_new_product_show_days) {
				url += (flg == 0 ? "?" : "&") + "show_new_product_for_x_days=" + options.is_new_product_show_days;
				flg = 1;
		}

		if (options.format) {
			orig_url += "/export";
			url += (flg == 0 ? "?" : "&") + "format=" + options.format;
			flg = 1;
			config = 
			{
				responseType: 'arraybuffer'
			};
		}

		// call API
 		$http.get(utilService.getBaseURL() + orig_url + url, config).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else if((options.format) && (response.statuscode == undefined)) {
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

	this.getProductById = function(id, callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/products/" + id).success(
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

	this.getProductImagesById = function(id, callback) {

		var config = 
			{
				responseType: 'arraybuffer'
		};


		// call API
 		$http.get(utilService.getBaseURL() + "/api/products/" + id + "/images", config).success(
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

	this.getProductImagesByOrderId = function(id, callback) {

		var config = 
			{
				responseType: 'arraybuffer'
		};


		// call API
 		$http.get(utilService.getBaseURL() + "/api/orders/" + id + "/productimages", config).success(
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
/*
	this.getPriceListByProductId = function(id, callback) {

		

		// call API
 		$http.get("/api/pricelists/?productid=" + id).success(
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

	this.getPriceListByCategoryId = function(id, callback) {

		

		// call API
 		$http.get("/api/pricelists/?categoryid=" + id).success(
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
*/	
  	this.deleteProduct = function (id,  callback) {

 		$http.delete(utilService.getBaseURL() + "/api/products/" + id).success(
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

	this.deletePriceGroup = function (id,  callback) {
		

 		$http.delete(utilService.getBaseURL() + "/api/pricegroups/" + id).success(
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
	
	this.unlink = function(id, categoryid, callback) {

		

		// call API
 		$http.delete(utilService.getBaseURL() + "/api/products/" + id + "/category/" + categoryid).success(
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

	this.unlinkProduct = function(masterid, childid, callback) {

		

		// call API
 		$http.delete(utilService.getBaseURL() + "/api/products/" + masterid + "/family/" + childid).success(
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

	this.link = function(id, categoryid, callback) {

		
		
		var data = {};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/products/" + id + "/category/" + categoryid, data).success(
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

//	this.createProduct = function(product, imgdata, callback) {
	this.createProduct = function(product, callback) {

		return create(product, callback);
/*
		if (imgdata) {
			data = {
						image : imgdata
					};
			$http.post(utilService.getBaseURL() + "/api/sessions/images/", data).success(
				function (response, status, headers) {
					product.image_url1 = response.url;
					return create(product, callback);
				}
			).error (
				function (data, status, headers) {
					console.log("error " + data);
				}
			);
		}
		else {
			product.image_url1 = "";
			return create(product, callback);
		}
*/
	};

	var create = function(product, callback) {

		

		//product.uom = (product.uom && product.uom != "" ? product.uom : '100');

	 	data = {
  					product          : product
  			   };

		// call API
 		$http.post(utilService.getBaseURL() + "/api/products/", data).success(
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
	
	this.getStockBatchById = function (id, callback) {

		
		
		url = "/api/stock/" + id;

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
	
	this.getStockBatches = function(productid, options, callback) {

		
		var config = {};
		url = "/api/stock/";

		var search_text = (options.search_text ? "&search_text=" + options.search_text : "");
		var enabled_only = (options.enabled_only && options.enabled_only == 1 ? "&enabled_only=1" : "");
		var is_system = (options.is_system != undefined? "&is_system=" + options.is_system : "");
		var data = search_text + enabled_only + is_system;
		if(options.format != undefined){

			data += "&format=" + options.format;	
			url += "export";
			config = { responseType: "arraybuffer"};
		} 

		url = utilService.getBaseURL() + url + "?productid=" + productid + data;

		// call API
		if (callback) {
			$http.get(url, config).success(
						function (response, status, headers) {
							if (status == 200 && response.statuscode == "0") {

								var object = new Object();
								object.statuscode    = 0;
								object.message       = "Success";
								object.data          = response.data;
						
								callback(object);
							}
							else if((options.format != undefined) && (response.statuscode == undefined)) {
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
				return $http.get(url);
		} 
	};

	this.getStockJournal = function(productid, from, to, format, callback) {

		
		var orig_url = "/api/stockjournal";
		var config = {};

		url = "?productid=" + productid;

		if (from)
			url = url + "&from=" + from;

		if (to)
			url = url + "&to=" + to;

		if (format)
		{
			url = url + "&format=" + format;
			config = { responseType: "arraybuffer"};
			orig_url += "/export";
		}


		// call API
 		$http.get(utilService.getBaseURL() + orig_url + url, config).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else if((format) && (response.statuscode == undefined)) {
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

	this.getStockJournalById = function(id, callback) {

		
		
		url = "/api/stockjournal/" + id;

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

	this.printStockSummary  = function(productid, categoryid, pricegroupid, detailflag) {

		
		var config = {headers:  {
				
			},responseType: "arraybuffer"
		};

		var url = "";
		url = "/api/stocksummary?excludezeroflag=1&format=PDF" + (productid ? "&productid=" + productid : "") 
													 + (categoryid ? "&categoryid=" + categoryid : "")
		                                             + (pricegroupid ? "&pricegroupid=" + pricegroupid : "")
		                                             + (detailflag ? "&detailflag=" + detailflag : "") ;

//		$http.defaults.headers.common['content-type']= 'application/pdf';
		return $http.get(utilService.getBaseURL() + url, config);

	};

	this.getStockSummary = function(productid, categoryid, pricegroupid, detailflag, callback) {

		

		url = "/api/stocksummary/?excludezeroflag=1" + (productid ? "&productid=" + productid : "") 
													 + (categoryid ? "&categoryid=" + categoryid : "")
		                                             + (pricegroupid ? "&pricegroupid=" + pricegroupid : "")
		                                             + (detailflag ? "&detailflag=" + detailflag : "") ;

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

	this.getPriceGroups = function(sortby, sortdirection, callback) {

		let data = "";

		sortby = (sortby ? "sort_by=" + sortby : "");
		sortdirection = (sortdirection ? "sort_direction=" + sortdirection : "");

		if (sortby != "") data = data + (data != "" ? "&" : "?") + sortby;
		if (sortdirection != "") data = data + (data != "" ? "&" : "?") + sortdirection;		

		let url = "/api/pricegroups/" + data;

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

	this.getPriceGroup = function(id, callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/pricegroups/" + id).success(
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

	this.createPriceGroup = function(pricegroup, callback) {

		

	 	data = {
  					pricegroup      : pricegroup
  			   };

		// call API
 		$http.post(utilService.getBaseURL() + "/api/pricegroups/", data).success(
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


	this.editPriceGroup = function(pricegroup, callback) {

		

	 	data = {
  					pricegroup      : pricegroup
  				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/pricegroups/" + pricegroup.id, data).success(
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

//	this.editProduct = function(product, imgdata, callback) {
	this.editProduct = function(product, callback) {

		return edit(product, callback);

/*
		if (imgdata) {
			data = {
						image : imgdata
					};
			$http.post(utilService.getBaseURL() + "/api/sessions/images/", data).success(
				function (response, status, headers) {
					product.image_url1 = response.url;
					return edit(product, callback);
				}
			).error (
				function (data, status, headers) {
					console.log("error " + data);
				}
			);
		}
		else {
			product.image_url1 = "";
			return edit(product, callback);
		}
*/
	};

	var edit = function(product, callback) {

		

		//product.uom = (product.uom && product.uom != "" ? product.uom : '100');

	 	data = {
  					product          : product
  			   };

		// call API
 		$http.put(utilService.getBaseURL() + "/api/products/" + product.id, data).success(
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
	
/*
	this.editProduct = function(id, name, sku, sku_internal, description, description_long, categoryid, unitprice, uom, pricelevelid, pricegroup, length, width, height, weight, linkedWith, imgdata, imageurl, statuisbatchedinventory, istaxable, taxslabid, callback) {

		if (imgdata) {
			data = {
						image : imgdata
					};
			$http.post(utilService.getBaseURL() + "/api/sessions/images/", data).success(
				function (response, status, headers) {
					return edit(id, name, sku, sku_internal, description, description_long, categoryid, unitprice, uom, pricelevelid, pricegroup, length, width, height, weight, linkedWith, response.url, statuisbatchedinventory, istaxable, taxslabid, callback);
				}
			).error (
				function (data, status, headers) {
					console.log("error " + data);
				}
			);
		}
		else
			return edit(id, name, sku, sku_internal, description, description_long, categoryid, unitprice, uom, pricelevelid, pricegroup, length, width, height, weight, linkedWith, imageurl, statuisbatchedinventory, istaxable, taxslabid, callback);
	};

	var edit = function(id, name, sku, sku_internal, description, description_long, categoryid, unitprice, uom, pricelevelid, pricegroup, length, width, height, weight, linkedWith, imageurl, statuisbatchedinventory, istaxable, taxslabid, callback) {

		

	 	data = {
	 				id               : id,
  					name             : name,
  					sku              : sku,
  					sku_internal     : sku_internal,
  					description      : description,
  					description_long : description_long,
  					category_id      : categoryid,
  					unit_price       : unitprice,
  					uom              : uom,
  					pricelevelid     : pricelevelid, 
  					pricegroup       : pricegroup,
  					status_id        : statusid,
  					image_url1       : imageurl,
  					length           : length,
  					height           : height,
  					width            : width,
  					weight           : weight,
  					linkedwith       : linkedWith,
					is_batched_inventory : isbatchedinventory,
					is_taxable       : istaxable,
					taxslabid        : taxslabid
  				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/products/" + id, data).success(
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
*/
	this.saveNonBatchedInventoryStock = function (xStockJournal, callback) {

		

		data = {
			stockjournal  : xStockJournal
		};

		$http.post(utilService.getBaseURL() + '/api/stock/' + xStockJournal.product_id, data).success(
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

	this.editStockBatch = function (xStockJournal, callback) {

		

		data = {
			stockjournal  : xStockJournal
		};

		$http.put(utilService.getBaseURL() + '/api/stockbucket/' + xStockJournal.stock_bucket_id, data).success(
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
	
	this.searchProducts = function(customerid, search_text, enabledOnly, stockedOnly, showXDaysProducts, callback){
	
		
		
		showXDaysProducts = showXDaysProducts || 0;

		var data =  "customerid=" + customerid + "&q=" + search_text + "&enabled_only=" + (enabledOnly && enabledOnly == 1 ? 1 : 0);
		data = data + "&hide_non_stocked_items=" + (stockedOnly && stockedOnly == 1 ? 1 : 0);
		data = data + "&show_new_product_for_x_days=" + showXDaysProducts;

		if (callback) {
			$http.get(utilService.getBaseURL() + "/api/products/search?" + data).success(
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
		}
		else {
			return $http.get(utilService.getBaseURL() + "/api/products/search?" + data);
		}	
		
	};

	//select entered_unit_of_measures_id, count(1), sum(order_quantity * order_price) from order_details where entered_unit_of_measures_id > 5014 group by entered_unit_of_measures_id;
	this.selectDefaultQuoteUOM = function(product){

		if (!product) return;
		var uomlist = product.uomlist;
		for(var i =0 ; i < uomlist.length; i++)
		{
			if(uomlist[i].id == product.default_qty_uom.id)
			{
			
				product.selectedUOM = uomlist[i];
				//product.quote_price = product.selectedUOM.unit_price;
			}
			if(uomlist[i].id == product.uom_id)
			{
				product.selectedQuoteUOM = uomlist[i];
				//product.quote_price = product.selectedQuoteUOM.unit_price;
			}
		}
		product.order_price = product.selectedQuoteUOM.unit_price;

	};

	this.updateQuotePrice = function(product){
		product.order_price = product.selectedQuoteUOM.unit_price;
	};

	this.setProduct = function (product, keyname) {
		if (!keyname)
			keyname = 'product_filter';

		this.productHash[keyname] = product;
	};

	this.getProduct = function (keyname) {

		if (!keyname)
			keyname = 'product_filter';

		if (this.productHash)			
			return this.productHash[keyname];
		else
			return undefined;
	};

	this.clearProduct = function (keyname) {

		if (!keyname)
			keyname = 'product_filter';
			
		delete this.productHash[keyname];

	};
	
});
