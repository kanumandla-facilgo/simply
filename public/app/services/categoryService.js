app.service('categoryService', function($http, utilService) {

	this.getCategories = function(parentid, productid, productsonly, enabled_only, root, withStockFlag, callback) {

		var url = "";
		if (productid) {
			url = "/api/categories?product_id=" + productid;
		}
		else if (parentid) {
			url = "/api/categories?parent_id=" + parentid;
		}
		else if(root != null)
		{
			url = "/api/categories?root=" + root;
		}
		else
			url = "/api/categories?root=1"
		
		if(productsonly)
			url = url + "&productsonly=1";

		if(enabled_only)
			url = url + "&enabled_only=1";

		if(withStockFlag)
			url = url + "&with_stock_flag=1";

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
	this.buildCategoryTreeFromList = function (categorylist) {
		let temp_categoryList = [];
		let temp_categoryHash = {};
		for (let i = 0; i < categorylist.length; i++) {

			categorylist[i].children = [];

			temp_categoryHash[categorylist[i].id] = categorylist[i];

//			if (categorylist[i].lineage.length - utilService.replaceAll(categorylist[i].lineage, "|", "").length == 2) {
			if (!categorylist[i].parent_id) {
				temp_categoryList.push(categorylist[i]);
				continue;
			}

			if (categorylist[i].parent_id && categorylist[i].parent_id in temp_categoryHash) {
				temp_categoryHash[categorylist[i].parent_id].children.push(categorylist[i]);
				// console.log("Temp category list "+temp_categoryHash[categorylist[i].parent_id].children);
			}
		}
		return temp_categoryList;

	};

	this.getCategoriesByLineage = function(parentid, products_only, enabled_only, level_count, callback) {
				
		let url = "";
		url = "/api/categories/?lineage=" + (parentid ? parentid : "*");

		if(level_count)
			url = url + "&level_count=" + level_count;

		if(products_only)
			url = url + "&productsonly=1";

		if(enabled_only)
			url = url + "&enabled_only=1";

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


	this.getCategory = function(id,  callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/categories/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.newMessage = response.data;
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
	
	this.createCategory = function(code, name, parentid, imgdata, ishidden,  callback) {

		if (imgdata) {
			data = {
						image : imgdata
					};
			$http.post(utilService.getBaseURL() + "/api/sessions/images/", data).success(
				function (response, status, headers) {
					return create(code, name, parentid, response.url, response.url_large, ishidden,  callback);
				}
			).error (
				function (data, status, headers) {
					console.log("error " + data);
					//create(code, name, parentid, "",  callback);
				}
			);
		}
		else
			return create(code, name, parentid, "", "", ishidden,  callback);
	};

	var create = function (code, name, parentid, imageurl, imageurllarge, ishidden,  callback) {
			
		

	 	data = {
  					code            : code,
  					name            : name,
  					parent_id       : parentid,
  					image_url       : imageurl,
  					image_url_large : imageurllarge,
  					is_hidden       : ishidden
  				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/categories/", data).success(
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

	this.editCategory = function(id, name, parentid, imgdata, imageurl, imageurllarge, isenabled, ishidden,  callback) {
		if (imgdata) {
			data = {
						image : imgdata
					};
			$http.post(utilService.getBaseURL() + "/api/sessions/images/", data).success(
				function (response, status, headers) {
					return edit(id, name, parentid, response.url, response.url_large, isenabled, ishidden,  callback);
				}
			).error (
				function (data, status, headers) {
					console.log("error " + data);
					//create(code, name, parentid, "",  callback);
				}
			);
		}
		else
			return edit(id, name, parentid, imageurl, imageurllarge, isenabled, ishidden,  callback);
	};

	var edit = function (id, name, parentid, imageurl, imageurllarge, isenabled, ishidden,  callback) {

		

	 	data = {
  					name            : name,
  					parent_id       : parentid,
  					image_url       : imageurl,
  					image_url_large : imageurllarge,
  					is_hidden       : ishidden,
  					is_enabled      : isenabled
  				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/categories/" + id, data).success(
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

	this.shareCategory = function (id, entities,  callback) {

		data = 
		{
			entities : entities
		};

 		$http.post(utilService.getBaseURL() + "/api/categories/" + id + "/share", data).success(
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


	this.deleteCategory = function (id,  callback) {

		

 		$http.delete(utilService.getBaseURL() + "/api/categories/" + id).success(
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

});
