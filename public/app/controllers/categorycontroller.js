app.controller('categorycontroller', function ($scope, $http, $location, $filter, categoryService, productService, utilService, masterService, $routeParams, $rootScope, $route, hotkeys, flash) {

	$scope.utilService = utilService;
	
    //get products
	var getProducts = function(categoryid) {

		let options = {};
	   options.enabled_only = 1;
	   options.is_hidden_no_stock = 1;
	   options.is_new_product_show_days = utilService.getNewProductShowXDays();
	   $scope.subCatProductsMap = {}
		 productService.getProducts(categoryid, undefined, options, function(response) {
			 if (response.statuscode == 0 && response.data && response.data.productlist) {
				// console.log(categoryid, response.data.productlist);
				$scope.subCatProductsMap[categoryid] = response.data.productlist;
			 }
		 });
		 
	 }

	 var getProducts1 = function(categoryid) {

		let options = {};
	   options.enabled_only = 1;
	   options.is_hidden_no_stock = 1;
	   options.is_new_product_show_days = utilService.getNewProductShowXDays();
		 productService.getProducts(categoryid, undefined, options, function(response) {
			 if (response.statuscode == 0 && response.data && response.data.productlist) {
				
				$scope.productlist = response.data.productlist;
		
			 }
		 });
		 
	 }
	//get categories
	$scope.searchCategory = function() {
  
	  var parentid = $routeParams.id;
	  var product = productService.getProduct();
  
	  productid = undefined;
	  if (product)
		  productid = product.id
  
	  categoryService.getCategories(parentid, productid, 0, 0, null, 0, function(response) {
	
		  if (response.statuscode == 0) {
  
			  if (response.data && response.data.categorylist) {

				  $scope.categorylist     = response.data.categorylist;
  
				  if($scope.categorylist.length == 1)

					  $location.path("/products/category/" + $scope.categorylist[0].id);
			  }
  
			  if (parentid && !productid) {
				  $scope.getParentCategory(parentid, function () {
					  $scope.lineagearray = utilService.getLineage($scope.parentcategory);
  
					  //need to add parent element into array
					  //$scope.lineagearray = $scope.addElementToLineage (arr, $scope.parentcategory.id, $scope.parentcategory.name);
				  });
			  }
  
		  }
		  else if (response.statuscode === -100)  {
			  $location.path("/Login/");
		  }
		  else {
			  flash.pop({title: "", body: response.message, type: "error"});
		  }
	  });
  
	};
  
  hotkeys.bindTo($scope).add({
		  'combo': 'alt+s',
		  'description': 'Save Categories',
		  callback: function() {
			  if ($rootScope.title == "Add category" || $rootScope.title == "Edit category")
				  $scope.saveCategory();
			  else if ($rootScope.title == "Add Role" || $rootScope.title == "Edit Role")
				  $scope.saveRole();
  
		  }
	  });
  
	  $scope.isUserACustomer = function () {
		  return (utilService.isUserACustomer());
	  };
  
	//get categories
	$scope.getCategories = function(parentid) {
  
	  var flag = ($rootScope.enabled_flag && para.enabled_flag == 1 ? 1 : 0);
  
	  var withproductsonly = $routeParams.withproductsonly? $routeParams.withproductsonly:0;
   
	  categoryService.getCategories(parentid, null, withproductsonly, flag, null, 0, function(response) {
		  if (response.statuscode == 0) {
  
			  if (response.data && response.data.categorylist) {

				  $scope.categorylist     = response.data.categorylist;
			  }
  
			  $scope.getParentCategory(parentid, function () {
				  $scope.lineagearray = utilService.getLineage($scope.parentcategory);
	  
				  //need to add parent element into array
				  //$scope.lineagearray = $scope.addElementToLineage (arr, $scope.parentcategory.id, $scope.parentcategory.name);
			  });
  
		  }
		  else if (response.statuscode === -100)  {
			  $location.path("/Login/");
		  }
		  else {
			  flash.pop({title: "", body: response.message, type: "error"});
		  }
	  });
  
	};
  
	//get category
	$scope.getCategory = function(categoryid, callback) {
	  
	  categoryService.getCategory(categoryid, function(response) {
		  if (response.statuscode == 0 && response.data && response.data.category) {
			  $scope.category  = response.data.category;
			  $scope.lineagearray = utilService.getLineage($scope.category);
			  if ($scope.category.parent_id && $scope.category.parent_id != "0") {
				  $scope.getParentCategory($scope.category.parent_id);
			  }
			  if (callback)
				  callback(response);
		  }
		  else if (response.statuscode === -100)  {
			  $location.path("/Login/");
		  }
		  else {
			  flash.pop({title: "", body: response.message, type: "error"});
		  }
	  });
  
	};
  
	//get categories by lineage
	$scope.getCategoriesByLineage = function(categoryid, level_count, callback) {
  
	  categoryService.getCategoriesByLineage(categoryid, true, true, level_count, function(response) {

		  if (response.statuscode == 0 && response.data && response.data.categorylist) {
			  if (callback) {

				  return callback(response.data.categorylist);
			  }
	
			  $scope.categorylist  = response.data.categorylist;
		  }
		  else if (response.statuscode === -100)  {
			  $location.path("/Login/");
		  }
		  else {
			  flash.pop({title: "", body: response.message, type: "error"});
		  }
	  });
  
	};
  
	$scope.getParentCategory = function(categoryid, callback) {
	  
	  categoryService.getCategory(categoryid, function(response) {
		  if (response.statuscode == 0 && response.data && response.data.category) {
			  $scope.parentcategory  = response.data.category;
		  }
		  else if (response.statuscode === -100)  {
			  $location.path("/Login/");
		  }
		  else {
			  flash.pop({title: "", body: response.message, type: "error"});
		  }
		  if (callback)
			  callback(response);
	  });
  
	};
  
	$scope.isNewCategory = function (product) {
		  var days = utilService.getConfiguration(utilService.CONST_CONFIG_NEW_CATEGORY_DAYS);
		  var date1 = new Date(product.created);
		  var date2 = new Date();
		  var diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24));
		  if(diffDays <= days)
			  return true;
		  else
			  return false;
	  };
	
	//get users
	$scope.saveCategory = function(editmode) {
  
	  var imgdata;
	  var img = $("#imgImageURL");
	  obj1 = document.getElementById('imgImageURL');
	  if (eval(img.attr('data-dirty')) > -1) {
		  imgdata = utilService.cutImageSimple('imgImageURL', 'hidImageURL_cropx', 'hidImageURL_cropy', 'hidImageURL_cropwidth', 'hidImageURL_cropheight', 'hidImageURL_imgwidth', 'hidImageURL_imgheight', 'hidImageURL_actualwidth', 'hidImageURL_actualheight', 'imgTempImageURL');
  
  //		var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  //		ctx.drawImage(obj1, 0, 0);
  //		imgdata = canvas.toDataURL("image/png");
  
	  }
  
	  $scope.category.name = utilService.applyCapitalization($scope.category.name);
  
	  if (editmode) {
  
		  categoryService.editCategory(
					  $scope.category.id,
					  $scope.category.name, 
					  $scope.category.parent_id,
					  imgdata,
					  $scope.category.image_url,
					  $scope.category.image_url_large,
					  $scope.category.is_enabled,
					  $scope.category.is_hidden,
					  
					  function(response) {
						  if (response.statuscode == 0 && response.data.category) {
							  flash.pop({title: "", body: "Category updated succesfully", type: "success"});
							  $location.path("/categories/" + ($scope.category.parent_id != undefined && $scope.category.parent_id ? $scope.category.parent_id : ""));
		  
						  }
						  else if (response.statuscode === -100)  {
							  $location.path("/Login/");
						  }
						  else {
							  flash.pop({title: "", body: response.message, type: "error"});
						  }
						  
						  $scope.editmode = false;
  
					  }
		  );
  
	  }
	  else {
  
		  categoryService.createCategory(
					  $scope.category.code, 
					  $scope.category.name, 
					  ($scope.category.parent_id ? $scope.category.parent_id : ""),
					  imgdata,
					  $scope.category.is_hidden,
					  
					  function(response) {
						  if (response.statuscode == 0 && response.data && response.data.category) {
							  flash.pop({title: "", body: "Category created succesfully", type: "success"});
							  $location.path("/categories/" + ($scope.category.parent_id != undefined && $scope.category.parent_id ? + $scope.category.parent_id : ""));
						  }
						  else if (response.statuscode === -100)  {
							  $location.path("/Login/");
						  }
						  else {
							  flash.pop({title: "", body: response.message, type: "error"});
						  }
					  }
		  );
  
	  }
  
	  return;
	  
	};
  
   $scope.showEditCategoryForm = function(id) {
	  $location.path("/EditCategory/" + id);
   };
  
   $scope.canDeleteCategory = function(category) {
	  return (utilService.getPermission(utilService.CONST_PERMISSION_CATEGORY_UPDATE) == '1') && (category.children_count == 0);
   };
  
   $scope.deleteCategory = (category) => {
  
	  categoryService.deleteCategory(
				  category.id,
				  
				  function(response) {
					  if (response.statuscode == 0) {
						  flash.pop({title: "", body: "Category deleted succesfully", type: "success"});
						  $route.reload();
					  }
					  else if (response.statuscode === -100)  {
						  $location.path("/Login/");
					  }
					  else {
						  flash.pop({title: "", body: response.message, type: "error"});
					  }
	  });
   };
  
   $scope.isCatalogShareModuleOn = function () {
	   return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_CATALOG_SHARE) == "1");
   };
  
   $scope.shareCatalog = function(category) {
	   
	   var options = {};
	  options.enabled_only = 1;
	  options.withproductsonly = ($routeParams.withproductsonly? $routeParams.withproductsonly:0);
	  options.orderid = ($routeParams.orderid ? $routeParams.orderid:"");
  
	   productService.getProducts(category.id, $scope.customerid, options, function(response) {
		  if (response.statuscode == 0 && response.data && response.data.productlist) {
			  $scope.productlist     = response.data.productlist;
			  image_urls = $scope.productlist.filter(x=>x.image_url2 != '').map(function(item) {
				  return item.image_url2;
			  });
			  
			  if(image_urls.length > 0)
				  utilService.shareMultipleImages(category.name, image_urls);
			  else
				  flash.pop({title: "", body: "No images found to share", type: "error"});
		  }
		  else if (response.statuscode === -100)  {
			  $location.path("/Login/");
		  }
		  else {
			  flash.pop({title: "", body: response.message, type: "error"});
		  }
	  });
   }

   $scope.products = function(categoryid) {
	   
	var para = $rootScope.parameters;

			var flag = (para && para.enabled_flag && para.enabled_flag == 1 ? 1 : 0);
			$scope.active_only = flag;
			var is_hidden_no_stock = (para && para.is_hidden_no_stock && para.is_hidden_no_stock == 1 ? 1 : 0);
			var is_new_product_show_days = (para && para.is_new_product_show_days && para.is_new_product_show_days == true ? utilService.getNewProductShowXDays() : 0);

			var options = {};
			options.enabled_only = flag;
			options.is_hidden_no_stock = is_hidden_no_stock;
			options.is_new_product_show_days = is_new_product_show_days;
			options.withproductsonly = $scope.withproductsonly;

			productService.getProducts(categoryid, $scope.customerid, options, function (response) {
				if (response.statuscode == 0 && response.data && response.data.productlist) {
					$scope.subCatProductslist = response.data.productlist;
				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});
}
  
   $scope.showCatalog = function(category) {
	   masterService.setCustomer("customer_catalog");
	  utilService.showCustomerDialog("modal_customers.html", "CustomersModalDialogController", {}, function(result) {
		  if (result == "OK") {
			  var data = masterService.getCustomer("customer_catalog");
			  if(data && data.length>0)
			  {
					  var entities = data.map(function (e) {
						var entity = {};
						entity.id = e.id;
						entity.name = (e.invoicing_name && e.invoicing_name != "") ? e.invoicing_name : e.name;
						entity.phone_number = e.address.phone1;
						return entity;
					  });
  
				  categoryService.shareCategory(category.id, entities, function(response){
					  if(response.statuscode == 0){
						  flash.pop({title: "", body: "Catalog shared succesfully", type: "success"});
					  }
					  else
					  {
						  flash.pop({title: "", body: response.message, type: "error"});
					  }
				  })
			  }
			  else {
				  alert("Please select customers")
				  $scope.showCatalog(category);
			  }
		  }
		  else {
			  return;
		  }
	  });
   };
  
   $scope.showAddCategoryForm = function() {
	  $scope.initCategory();
	  $location.path("/AddCategory/" + ($scope.categoryid ? $scope.categoryid : ""));
   };
  
   $scope.initCategory = function() {
	   $scope.category = {"code":"", "name":"", "parent_id":($scope.categoryid ? $scope.categoryid : ""), id:-1, "is_hidden":0};
   };
  
   $scope.isAddCategoryAllowed = function() {
	  return (utilService.getPermission(utilService.CONST_PERMISSION_CATEGORY_CREATE) == '1');
   };
  
   $scope.isEditCategoryAllowed = function() {
	  return (utilService.getPermission(utilService.CONST_PERMISSION_CATEGORY_UPDATE) == '1');
   };
  
   $scope.isCategoryCodeRequired = function () {
	  $scope.category_code_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_CATEGORY_CODE_REQD) == "1");
	  return $scope.category_code_edit_flag;
   };
  
   $scope.enableCategoryCodeEdit = function () {
	  $scope.category_code_edit_flag = true;
   };
  
   $scope.isCategoryCodeEditAllowed = function() {
	  return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_CATEGORY_CODE_REQD) == "0"));
   };
   
   $scope.isAddProductAllowed = function() {
	  return (utilService.isAddProductAllowed() == '1');
   };
  
   $scope.isEditProductAllowed = function() {
	  return (utilService.isEditProductAllowed() == '1');
   };
  
   $scope.save = function () {
	  $scope.isDisabled = true;
	  if ($scope.editmode)
		  $scope.update();
	  else {
		  if ($scope.parentcategory)
			  $scope.category.parent_id = $scope.parentcategory.id;
		  $scope.saveCategory(false);
	  }
   };
  
   $scope.update = function () {
	  $scope.saveCategory(true);
   };
  
   $scope.showSubItems = function (id) {
  
	  $scope.getCategory(id, function (response) {
		  if (response.statuscode == 0 && response.data && response.data.category && $scope.category.is_leaf && $scope.category.children_count > 0) {
			  $location.path("/products/" + "category/" + id).search( {"customerid" : $scope.customerid, "orderid":$scope.orderid});
		  }
		  else if (response.statuscode === -100)  {
			  $location.path("/Login/");
		  }
		  else {
			  $location.path("/categories/" + id).search( {"customerid" : $scope.customerid, "orderid":$scope.orderid});
		  }
	  });
  
   };
  
  $scope.showSubItems1 = function (id) {
	  
		  $scope.getCategory(id, function (response) {
			  var withproductsonly = ($routeParams.withproductsonly? $routeParams.withproductsonly:0);
			  var orderid = ($routeParams.orderid ? $routeParams.orderid:"");
			  if (response.statuscode == 0 && response.data && response.data.category && $scope.category.is_leaf && $scope.category.children_count > 0) {

				  $location.path("/products1/" + "category/" + id).search( {"customerid" : $scope.customerid, withproductsonly:withproductsonly, "orderid":orderid} );
			  }
			  else if (response.statuscode === -100)  {
	
				  $location.path("/Login/");
			  }
			  else {
	
				  // return;
				  $location.path("/categories1/" + id).search( {"customerid" : $scope.customerid, withproductsonly:withproductsonly, "orderid":orderid} );
				  
			  }
	
		  }); 
   };

  
   $scope.showSubItems2 = function (id) {
	$scope.subcategorylist=[];
	$scope.productlist=[];
	  $scope.getCategory(id, function (response) {
		var para = $rootScope.parameters;
		var flag = (para && para.enabled_flag && para.enabled_flag == 1 ? 1 : 0);
		var withproductsonly = ($routeParams.withproductsonly? $routeParams.withproductsonly:0);
		var orderid = ($routeParams.orderid ? $routeParams.orderid:"");
		$scope.active_only = flag;
		var is_hidden_no_stock = (para && para.is_hidden_no_stock && para.is_hidden_no_stock == 1 ? 1 : 0);
		var is_new_product_show_days = (para && para.is_new_product_show_days && para.is_new_product_show_days == true ? utilService.getNewProductShowXDays() : 0);
		var options = {};
		options.enabled_only = flag;
		options.is_hidden_no_stock = is_hidden_no_stock;
		options.is_new_product_show_days = is_new_product_show_days;
		options.withproductsonly = $scope.withproductsonly;
		  if (response.statuscode == 0 && response.data && response.data.category && $scope.category.is_leaf && $scope.category.children_count > 0) { 
			// getProducts1(id);
  
			  productService.getProducts(id, $scope.customerid, options, function (response) {
				  if (response.statuscode == 0 && response.data && response.data.productlist) {
					  $scope.productlist = response.data.productlist;
					
				  }
				  else if (response.statuscode === -100) {
					  $location.path("/Login/");
				  }
				  else {
					  flash.pop({ title: "", body: response.message, type: "error" });
				  }
			  });
		  }
		  else if (response.statuscode === -100)  {

			  $location.path("/Login/");
		  }else{
			$scope.subCatProductsMap = {};
			// console.log("New code", JSON.stringify($scope.categorylist.length,null, '\t\t\t'));
			for(let i=0; i<$scope.categorylist.length; i++){
				if($scope.categorylist[i].id == id){
					// console.log("Outer for loop in Show cat ",$scope.categorylist[i].id);
					for(let j= 0; i<$scope.categorylist[i].children.length; j++){
						// console.log("Inner loop in ShowsubCategories function", JSON.stringify($scope.categorylist[i].children[j].id,null,'\t\t\t'))
						if($scope.categorylist[i].children[j].id!== undefined){getProducts($scope.categorylist[i].children[j].id);}
						
					}	
					return		
				}
			}
		  }

	  });
	  
   };

   $scope.showSubCatOrProducts = function (id){
	
   }
  
   $scope.showAddProductForm = function () {
		  $location.path("/AddProduct/" + ($scope.categoryid ? $scope.categoryid : ""));
   };
  
   $scope.product_search = function(event ,search_text){	
	   var keycode =	event.which || event.keycode;
	   if(keycode == 13)
	   {
		  var customerid = $routeParams.customerid;
		  var orderid = ($routeParams.orderid ? $routeParams.orderid:"");
		  if (customerid == undefined)
			  customerid = '';
		  // if(customerid == undefined)
		  // {
		  // 	alert("Customer not selected. Please select customer.");
		  // 	return false;
		  // }
		  var is_new_product_show_days = utilService.getNewProductShowXDays();
		  $location.path("/products/search/").search({"customerid" : customerid , "q" : search_text, "enabled_flag" : 1, "is_hidden_no_stock": 1, "show_new_product_for_x_days": is_new_product_show_days, "orderid":orderid});
	   }
  
   };	
   
   $scope.categoryid = $routeParams.id;
  
   // get categories by lineage
   $scope.loadCategoryTree = function() {
	   $scope.getCategoriesByLineage(undefined, function(categoryList) {
		  let categoryHash = {};
		  let rootid;

		  if (categoryList.length > 0) {
			  rootid = categoryList[0].parent_id;
			  categoryHash[categoryList[0].parent_id] = {"id": categoryList[0].parent_id, "name": "Root", "children": []};
		  } else {
			  return;
		  }
  
		  for (let i = 0; i < categoryList.length; i++) {
  
			  let parentid = categoryList[i].parent_id;
  
			  if (parentid in categoryHash) {
				  let category = categoryHash[parentid];
				  categoryList[i].children = [];
				  category.children.push(categoryList[i]);
				  categoryHash[categoryList[i].id] = categoryList[i];
			  } else {
				  console.log("[ERROR] Invalid Tree.");
				  return;
			  }
  
		  }
  
		  $scope.categorytree = removeEmptyCategories(categoryHash[rootid]);
		  //console.log($scope.categorytree);
  
	   });
   };
  
   var removeEmptyCategories = function(categoryTree) {
  
	  for (let i = categoryTree.children.length - 1; i >= 0; i--) {
		  let category = categoryTree.children[i];
		  if (category.children_count == 0 || category.is_hidden == 1) {
			  categoryTree.children.splice(i, 1);
			  continue;
		  }
  
		  if (category.is_leaf == 0)
			  removeEmptyCategories(categoryTree.children[i]);
	  }
  
	  return categoryTree;
  
   };
  
   var prepareTreeForMenu = function (categoryTree) {
	  for (let i = categoryTree.children.length - 1; i >= 0; i--) {
		  let category = categoryTree.children[i];
  
		  if (category.children.length == 0) {
			  appendChild(cateogry, 1);
		  }
  
	  }
   }
  
   var appendChild = function (category, level) {
  
	  if (level == 1) {
		  let category2 = JSON.parse(JSON.stringify(category));
		  category.chiildren.push(category2);
		  appendChild(category2, level + 1);
  
	  }
	  if (level == 2) {
		  let category3 = JSON.parse(JSON.stringify(category));
		  category.chiildren.push(category3);
	  }
  
   }

$scope.slickConfig3Loaded = true;
$scope.slickConfigCategory = {
  method: {
	
  },
  dots: true,
//   prevArrow: '<button class="slide-arrow prev-arrow"></button>',
//   nextArrow: '<button class="slide-arrow next-arrow"></button>',
  infinite: false,
  speed: 300,
  slidesToShow: 6,
  slidesToScroll: 6,
  variableWidth: true,
  responsive: [
	{
	  breakpoint: 2160,
      settings: {
		// prevArrow: '<button class="slide-arrow prev-arrow"></button>',
  		// nextArrow: '<button class="slide-arrow next-arrow"></button>',
		arrows: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        infinite: true,
        dots: true,
		variableWidth: true,
      }
	},
    {
      breakpoint: 1366,
      settings: {
		// prevArrow: '<button class="slide-arrow prev-arrow"></button>',
  		// nextArrow: '<button class="slide-arrow next-arrow"></button>',
		arrows: true,
        slidesToShow: 4,
        slidesToScroll: 4,
        infinite: true,
        dots: true,
		variableWidth: true
      }
    },
    {
      breakpoint: 1024,
      settings: {
		// prevArrow: '<button class="slide-arrow prev-arrow"></button>',
  		// nextArrow: '<button class="slide-arrow next-arrow"></button>',
		arrows: true,
        slidesToShow: 6,
        slidesToScroll: 6,
        infinite: true,
        dots: true,
		variableWidth: true
      }
    },
    {
      breakpoint: 600,
      settings: {
		// prevArrow: '<button class="slide-arrow prev-arrow"></button>',
  		// nextArrow: '<button class="slide-arrow next-arrow"></button>',
		arrows: true,
        slidesToShow: 4,
        slidesToScroll: 4,
		variableWidth: true
      }
    },
    {
      breakpoint: 480,
      settings: {
		// prevArrow: '<button class="slide-arrow prev-arrow"></button>',
  		// nextArrow: '<button class="slide-arrow next-arrow"></button>',
        slidesToShow: 3,
        slidesToScroll: 3,
		variableWidth: true
      }
    }
  ]
};

// angular.element(document).ready($scope.slickConfigCategory());
$scope.number = [{label: 1}, {label: 2}, {label: 3}, {label: 4}, {label: 5}, {label: 6}, {label: 7}, {label: 8}];
$scope.numberLoaded = true;
$scope.numberUpdate = function(){
	$scope.numberLoaded = false; // disable slick

	//number update

	$scope.numberLoaded = true; // enable slick
};
$scope.slickConfigProduct = {
  method: {},
  dots: false,
  infinite: false,
  speed: 300,
  slidesToShow: 4,
  slidesToScroll: 4,
  responsive: [
    {
      breakpoint: 1366,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
        infinite: true,
        dots: false
      }
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: false
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};
  
   if ($rootScope.title === "Categories" || $rootScope.title === "Sub Categories" || $rootScope.title === "Stock") {
	  var para = $rootScope.parameters;
	  var flag = (para && para.enabled_flag && para.enabled_flag == 1 ? 1 : 0);
  
	  var parentid = $routeParams.id;
	  $scope.customerid = $routeParams.customerid;
	  $scope.orderid = $routeParams.orderid;
	  var withproductsonly = $routeParams.withproductsonly? $routeParams.withproductsonly:0;
	  withproductsonly = 0; // when new category is created, it gets hidden from prev statement
	  categoryService.getCategories(parentid, null, withproductsonly, flag, null, 0, function(response) {
		  if (response.statuscode == 0) {
  
			  if (response.data && response.data.categorylist) {
				  $scope.categorylist     = response.data.categorylist;
			  }
  
			  if (parentid) {
				  $scope.getParentCategory(parentid, function () {
					  $scope.lineagearray = utilService.getLineage($scope.parentcategory);
  
					  //need to add parent element into array
					  //$scope.lineagearray = $scope.addElementToLineage (arr, $scope.parentcategory.id, $scope.parentcategory.name);
				  });
			  }
  
		  }
		  else if (response.statuscode === -100)  {
			  $location.path("/Login/");
		  }
		  else {
			  flash.pop({title: "", body: response.message, type: "error"});
		  }
	  });
  }
  else if ( $rootScope.title == "Home" ) {

	const parentid = $routeParams.id;

	$scope.getCategoriesByLineage(parentid, 2, function(categorylist) {
		if (categorylist.length == 0) {
			$scope.categorylist = [];
			return;
		}

		// add the Root category into the tree manually
		categorylist.unshift({id:parseInt(categorylist[0].parent_id), name:"Root"});
		let temp_categoryList = categoryService.buildCategoryTreeFromList(categorylist);
		// for (let i = 0; i < temp_categoryList[0].children.length; i++) {
		// 	if (temp_categoryList[0].children[i].is_leaf == 0) {
		// 		for(let j = 0; j < temp_categoryList[0].children[i].children.length; j++){
		// 			getProducts(temp_categoryList[0].children[i].children[j].id);
		// 	}
		// 	}
		// }

		$scope.categorylist = temp_categoryList[0].children;
		console.log("$scope.categorylist[0].is_leaf",$scope.categorylist[0].is_leaf);
		console.log("$scope.categorylist[0].code",$scope.categorylist[0].code);
		if($scope.categorylist[0].is_leaf)
			getProducts1($scope.categorylist[0].id);
		else
			$scope.showSubItems2($scope.categorylist[0].id);
			

	});
}
  else if ($rootScope.title == "Home1") {
		  var para = $rootScope.parameters;
		  var flag = (para && para.enabled_flag && para.enabled_flag == 1 ? 1 : 0);
	
		  var parentid = $routeParams.id;
		  $scope.customerid = $routeParams.customerid;
		  $scope.orderid = $routeParams.orderid;
		  var withproductsonly = $routeParams.withproductsonly? $routeParams.withproductsonly:0;
		  if (withproductsonly == 0)
			  withproductsonly = $rootScope.parameters.withproductsonly? $rootScope.parameters.withproductsonly:0;
	
		  categoryService.getCategories(parentid, null, withproductsonly, flag, null, 0, function(response) {
			  if (response.statuscode == 0) {
	
				  if (response.data && response.data.categorylist) {
					  $scope.categorylist     = response.data.categorylist;
					  $scope.showSubItems2($scope.categorylist[0].id);
				  }
	
				  if (parentid) {
					  $scope.getParentCategory(parentid, function () {
						  $scope.lineagearray = utilService.getLineage($scope.parentcategory);
	
						  //need to add parent element into array
						  //$scope.lineagearray = $scope.addElementToLineage (arr, $scope.parentcategory.id, $scope.parentcategory.name);
					  });
				  }
	
			  }
			  else if (response.statuscode === -100)  {
				  $location.path("/Login/");
			  }
			  else {
				  flash.pop({title: "", body: response.message, type: "error"});
			  }
		  });
  }
  else if ($rootScope.title == "Add Category") {
	  $scope.initCategory();
  
	  if ($routeParams.id) {
		  $scope.getParentCategory($routeParams.id, function () {
				  var arr = utilService.getLineage($scope.parentcategory);
				  $scope.lineagearray = utilService.addElementToLineage (arr, $scope.parentcategory.id, $scope.parentcategory.name);
		  });
	  }
	  $scope.editmode = false;
   }
   else if ($rootScope.title == "Edit Category" && ($routeParams.id)) {
	  $scope.getCategory($routeParams.id);
	  $scope.editmode = true;
   }
  });
				   
  
  