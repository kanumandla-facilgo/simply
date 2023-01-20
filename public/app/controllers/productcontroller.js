app.controller('productcontroller', function ($scope, $http, $location, productService, utilService, categoryService, masterService, $routeParams, $rootScope, $route, $q, ModalService, hotkeys, flash) {

	$scope.utilService = utilService;


	$scope.expand = function (x) {
		var del_note = $scope.pricegrouplist.filter(y => y.id == x.id)[0]

		if (del_note.expanded)
			del_note.expanded = false;
		else {

			del_note.expanded = true;

			if (x.new_pricegroup == undefined) {


				$scope.editmode = true;
				$scope.getUnitOfMeasureslist();
				productService.getPriceGroup(x.id, function (response) {
					if (response.statuscode == 0 && response.data && response.data.pricegroup) {

						x.new_pricegroup = response.data.pricegroup;

						var companytypeHash = {};

						for (i = 0; i < x.new_pricegroup.pricelistlist.length; i++) {
							companytypeHash[x.new_pricegroup.pricelistlist[i].customer_type_id] = x.new_pricegroup.pricelistlist[i];
						}

						masterService.getCustomerTypes({}, function (response) {
							if (response.statuscode == 0 && response.data && response.data.companytypelist) {
								var companytypelist = response.data.companytypelist;
								for (i = 0; i < companytypelist.length; i++) {
									if (companytypeHash[companytypelist[i].id] == undefined) {
										var obj = initPriceList();
										obj.customer_type_id = companytypelist[i].id;
										obj.customer_type_name = companytypelist[i].name;
										x.new_pricegroup.pricelistlist.push(obj);
									}
									else {
										companytypeHash[companytypelist[i].id].customer_type_name = companytypelist[i].name;
									}
								}
							}
							else if (response1.statuscode === -100) {
								$location.path("/Login/");
							}
							else {
								flash.pop({ title: "", body: response1.message, type: "error" });
							}
						});
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
					}
				});

			}


		}
	}

	$scope.expandAllPricegroups = function () {
		for (var i = 0; i < $scope.pricegrouplist.length; i++) {
			$scope.expand($scope.pricegrouplist[i]);
		}
		$scope.expandAll = true;
	}


	$scope.collapseAllPricegroups = function () {
		for (var i = 0; i < $scope.pricegrouplist.length; i++) {
			$scope.pricegrouplist[i].expanded = false;
		}
		$scope.expandAll = false;
	}



	$scope.onSelectedProduct = function (product, model, label, event, keyname) {


		if (product) {
			productService.selectDefaultQuoteUOM(product);
			productService.updateQuotePrice(product);
			productService.setProduct(product, keyname);
			if ($scope.isRateVisible())
				product.order_price = "";

			// assign default sell qty to order qty for Quick Order Form
			product.orderqty = product.default_sell_qty;
		}

		//		product.order_price = product.selectedQuoteUOM.unit_price;
	};

	$scope.updatePriceValue = function (obj, lineitem, indx) {
		var obj1 = JSON.parse(lineitem.uom);
		lineitem.uom = obj1;
	};

	$scope.isAddStockAllowed = function () {
		return (utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_CREATE) == '1');
	};

	$scope.isEditStockAllowed = function () {
		return (utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_UPDATE) == '1');
	};

	$scope.isPriceLevelDropDownVisible = function () {
		return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PRODUCT_PRICE_GROUP) == '1' || utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_MULTIPLE_RATE) == '1')
	}

	$scope.isAddPriceGroupAllowed = function () {
		return (utilService.getPermission(utilService.CONST_PERMISSION_PRICEGROUP_CREATE) == '1');
	};

	$scope.isEditPriceGroupAllowed = function () {
		return (utilService.getPermission(utilService.CONST_PERMISSION_PRICEGROUP_UPDATE) == '1');
	};

	$scope.isDeletePriceGroupAllowed = function () {
		return (utilService.getPermission(utilService.CONST_PERMISSION_PRICEGROUP_DELETE) == '1');
	};

	$scope.isStockSummaryVisible = function () {
		return (utilService.getPermission(utilService.CONST_PERMISSION_STOCK_SUMMARY_VIEW) == "1");
	};

	$scope.isNewProduct = function (product) {
		var days = utilService.getConfiguration(utilService.CONST_CONFIG_NEW_PRODUCT_DAYS);
		var date1 = new Date(product.created);
		var date2 = new Date();
		var diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24));
		if (diffDays <= days)
			return true;
		else
			return false;
	};


	$scope.isRateVisible = function () {
		return (utilService.getConfiguration(utilService.CONST_CONFIG_CATALOG_HIDE_PRODUCT_RATE) == "1");
	};

	hotkeys.bindTo($scope).add({
		'combo': 'alt+s',
		'description': 'Save Non Batch Inventory Stock',
		callback: function () {
			if ($rootScope.title == "Stock Entry")
				$scope.saveNonBatchInventoryStock();
		}
	});

	//get products
	$scope.getProductsByCategoryId = function (categoryid, customerid, options, callback) {
		productService.getProducts(categoryid, customerid, options, callback);
	};

	//get product
	$scope.getProductById = function (id, callback) {
		productService.getProductById(id, callback);
	};

	$scope.deleteImage = function (product) {
		product.image_url1 = '';
		product.image_url2 = '';
		product.image_url3 = '';
	};

	$scope.deleteImageNode = function (id, index) {
		$scope.product.image_list.splice(index, 1);
	};

	$scope.addImageNode = function (obj, objtype) {
		var node = { 'id': '', 'description': '', 'url': utilService.CONST_URL_NO_IMAGE, 'dirty': 1 };
		obj.image_list.push(node);
	};

	$scope.$on("fileSelected", function (event, args) {

		var item = args;
		item.description = '';
		item.dirty = 1;

		if (args.index != -1) {
			$scope.product.image_list = $scope.product.image_list.filter(x => x.url != utilService.CONST_URL_NO_IMAGE);
			$scope.product.image_list.push(item);
		}
		else
			$scope.product.main_image = item;

		var reader = new FileReader();
		reader.addEventListener("load", function () {
			$scope.$apply(function () {
				item.url = reader.result;
				if (args.index == -1)
					$scope.product.image_url1 = reader.result;
			});
		}, false);

		if (item.file) {
			reader.readAsDataURL(item.file);
		}
	});

	$scope.onPhotoClick = function (product) {
		$scope.getProductById(product.id, function (response) {
			if (response.statuscode == 0 && response.data && response.data.product) {
				product = response.data.product;

				ModalService.showModal({
					templateUrl: 'modal.html',
					controller: "ModalController",
					inputs: {
						"product": product
					}
				}).then(function (modal) {
					modal.element.modal();
					modal.close.then(function (result) {
						//"You said " + result;
						let a = 1;
					});
				});
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});

	};

	$scope.getCustomerFromModalDialog = function () {
		return masterService.getCustomer();
	};

	// this method is called when user selects price group from drop down
	$scope.selectPriceGroup = function (pricegroup, product) {
		product.unit_price = pricegroup.unit_price;
		product.uom_id = pricegroup.uom_id;
	};

	$scope.showStockSummary = function (parentcategory) {
		$location.path("/stocksummary/" + "category/" + (parentcategory ? parentcategory.id : 0));
	};

	$scope.showStockJournalById = function (id) {
		$location.path("/stockjournal/" + id);
	};

	$scope.showStockJournal = function (productid) {
		utilService.clearJournalFilters();
		$location.path("/stockjournal/" + "product/" + productid);
	};

	$scope.showAddStockForm = function (productid) {
		if (productid)
			$location.path("/AddStock/" + "product/" + productid);
		else
			$location.path("/AddStock/");
	};

	$scope.stockBucketRowClick = function (id, flag) {
		if ($scope.isEditStockAllowed()) {
			if (!flag || flag == 1)
				$scope.showEditStockBucketForm(id);
		}
	}

	$scope.showEditStockBucketForm = function (id) {
		$location.path("/stockbuckets/" + id);
	};

	$scope.showStockBuckets = function (productid) {
		utilService.clearBucketFilters();
		$location.path("/stockbuckets/" + "product/" + productid);
	};

	$scope.showStockSummaryByPriceGroup = function (id) {
		$location.path("/stocksummary/" + "pricegroup/" + id);
	};

	$scope.showStockDetail = function () {
		if ($routeParams.pricegroupid)
			$location.path("/stockdetail/" + "pricegroup/" + $routeParams.pricegroupid);
		if ($routeParams.categoryid)
			$location.path("/stockdetail/" + "category/" + $routeParams.categoryid);
	};

	$scope.showStockDetailById = function (id) {
		$location.path("/stockdetail/" + "category/" + id);
	};

	$scope.showStockSummary = function () {
		if ($routeParams.pricegroupid)
			$location.path("/stocksummary/" + "pricegroup/" + $routeParams.pricegroupid);
		if ($routeParams.categoryid)
			$location.path("/stocksummary/" + "category/" + $routeParams.categoryid);
	};

	$scope.getKeysCount = function (object) {
		return Object.keys(object).length;
	}

	$scope.show_lineage = function () {
		if (utilService.isOneTimeSession())
			return false;
		return true;
	}

	var openPrintWindow = function (file, fileNameString, timeoutInms) {
		var anchor = document.createElement("a");
		// Chrome (all but installed on iOS), opera, Safari on Mac, 
		if ((navigator.userAgent.indexOf("Chrome") != -1 || navigator.userAgent.indexOf("Opera") != -1 || (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Macintosh") != -1)) && !navigator.userAgent.match('CriOS')) {

			var fileURL = URL.createObjectURL(file, { oneTimeOnly: true });
			window.open(fileURL);
			setTimeout(function () {
				URL.revokeObjectURL(fileURL);
			}, timeoutInms);
		}
		// Other Chrome (primarily Chrome on iOS)
		else if (navigator.userAgent.match('CriOS')) { //Chrome iOS
			var reader = new FileReader();
			reader.onloadend = function () { window.open(reader.result); };
			reader.readAsDataURL(file);
		}
		// iPad
		else if (navigator.userAgent.indexOf("iPad") != -1) {
			var fileURL = URL.createObjectURL(file);
			anchor.download = (fileNameString ? fileNameString : "myPDF.pdf");
			anchor.href = fileURL;
			anchor.click();
			window.setTimeout(function () {
				URL.revokeObjectURL(file);
			}, timeoutInms);
		}
		// Firefox or all other Safari 
		else if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Safari") != -1) {
			var fileURL = window.URL.createObjectURL(file);
			anchor.href = fileURL;
			anchor.download = (fileNameString ? fileNameString : "myPDF.pdf");
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			setTimeout(function () {
				document.body.removeChild(anchor);
				window.URL.revokeObjectURL(fileURL);
			}, timeoutInms);
		}
	};

	$scope.getStockSummaryPDF = function (sid, productid, categoryid, pricegroupid, detailflag) {
		var q = $q.defer();

		productService.printStockSummary(sid, productid, categoryid, pricegroupid, detailflag)
			.success(function (response) {
				var file = new Blob([response], { type: 'application/pdf' });
				//var fileURL = URL.createObjectURL(file);
				q.resolve(file);
			})
			.error(function (err) {
				q.reject(err);
			});
		return q.promise;
	};

	//To print pdf on new window/ Button_Click event.
	$scope.printStockSummaryPdf = function (detailflag) {

		$scope.getStockSummaryPDF($routeParams.productid, $routeParams.categoryid, $routeParams.pricegroupid, detailflag).then(function (file) {
			if (window.cordova) {
				utilService.downloadAndOpenInApp("stock_summary.pdf", file);
			}
			else {
				openPrintWindow(file, "stock_summary.pdf", 5000);
			}
		}, function (err) {
			console.log('Error: ' + err);
		});
	};

	var initStockJournal = function () {
		return { "stock_bucket_id": "", "stock_bucket_code": "", "product_id": "", "order_id": "", "packing_slip_id": "", "user_id": "", "stock_qty": "", "stock_quote": "", "description": "", "batch_list": [] };
	};

	var initStockJournalBatchItem = function () {
		return { "id": "", "index": "", "piece_count": "", "qty": "", "description": "", "uom": { "id": "", "name": "" } };
	};
	/*
		$scope.onSelectedProduct = function (item, model, label, event) {
			$scope.customer = item;
		};
	*/
	/* for typeahead
	  $scope.cities = function(cityName) {
		return $http.jsonp("http://gd.geobytes.com/AutoCompleteCity?callback=JSON_CALLBACK &filter=US&q="+cityName).then(function(response){
		  return limitToFilter(response.data, 15);
		});
	  };	
	*/




	$scope.getProductListViaPromise = function (term, customer, enabledOnly, stockedOnly) {

		//var sid = location.hash.substr(location.hash.indexOf('/', 2) + 1, 32);

		if (!customer)
			customer = masterService.getCustomer();

		if (!customer) {
			alert("Please select valid customer.");
			return false;

		}


		return productService.searchProducts((customer ? customer.id : ""), term, enabledOnly, stockedOnly, 15).then(
			function (response) {
				if (response.data.statuscode == 0) {

					function val(x) {
						let flag = 0;
						for (let j = 0; j < $scope.itemlist.length; j++) {
							if ($scope.itemlist[j].product != undefined && $scope.itemlist[j].product != null) {
								if (x.id === $scope.itemlist[j].product.id) {
									flag = 1;
									break;
								}
							}

						}
						if (flag === 0) {
							return x;
						}
					}

					return response.data.data.productlist.filter(val);

				}
				else if (response.data.statuscode == -100) {
					window.location.replace("/#/login");
					return [];
				}
				return [];
			}
		);

	};

	$scope.getNonBatchProductListNoCustomer = function (term, enabledOnly, stockedOnly) {

		//var sid = location.hash.substr(location.hash.indexOf('/', 2) + 1, 32);

		return productService.searchProducts("", term, enabledOnly, stockedOnly, 15).then(
			function (response) {
				if (response.data.statuscode == 0) {
					let productlist = response.data.data.productlist;
					productlist = productlist.filter(x => x.is_batched_inventory == 0);
					return productlist;
				}
				else if (response.data.statuscode == -100) {
					window.location.replace("/#/login");
					return [];
				}
				return [];
			}
		);

	};

	$scope.getProductListViaPromiseNoCustomer = function (term, enabledOnly, stockedOnly) {

		//var sid = location.hash.substr(location.hash.indexOf('/', 2) + 1, 32);

		return productService.searchProducts("", term, enabledOnly, stockedOnly, 15).then(
			function (response) {
				if (response.data.statuscode == 0)
					return response.data.data.productlist;
				else if (response.data.statuscode == -100) {
					window.location.replace("/#/login");
					return [];
				}
				return [];
			}
		);

	};

	$scope.calculateStockTotal = function () {
		var total = 0;
		for (i = 0; i < $scope.stock_journal.batch_list.length; i++) {
			if ($scope.stock_journal.batch_list[i].qty != "")
				total = total + eval($scope.stock_journal.batch_list[i].qty);
		}
		$scope.stock_journal.stock_quote = utilService.round(total, 4);
	};

	$scope.saveNonBatchInventoryStock = function (redirectToSamePage) {

		$scope.isDisabled = true;

		if ($scope.product.is_batched_inventory == 1 && $scope.editmode) {
			var tmpStockJournal = angular.copy($scope.stock_journal);
			// adjusting quantity in the object		
			tmpStockJournal.stock_qty = tmpStockJournal.stock_qty - $scope.stock_journal_original.stock_qty;
			tmpStockJournal.stock_quote = tmpStockJournal.stock_quote - $scope.stock_journal_original.stock_quote;

			if ($scope.stock_journal.stock_qty > 1 || $scope.stock_journal.stock_qty < 0 || parseInt($scope.stock_journal.stock_qty) != $scope.stock_journal.stock_qty) {
				flash.pop({ title: "", body: "Stock [" + $scope.product.stock_uom_qty.name + "] can be zero or one only. Please remove the Batch from packing slip by clicking Delete and add it back.", type: "error" });
				$scope.isDisabled = false;
				return false;
			}
			if ($scope.stock_journal.stock_quote <= 0 && $scope.stock_journal.stock_qty != 0) {
				flash.pop({ title: "", body: "Stock [" + $scope.product.stock_uom_quote.name + "] is zero however Stock [" + $scope.product.stock_uom_qty.name + "] is non zero. Please fix.", type: "error" });
				$scope.isDisabled = false;
				return false;
			}

			if ($scope.stock_journal.stock_quote != 0 && $scope.stock_journal.stock_qty <= 0) {
				flash.pop({ title: "", body: "Stock [" + $scope.product.stock_uom_qty.name + "] is zero however Stock [" + $scope.product.stock_uom_quote.name + "] is non zero. Please fix.", type: "error" });
				$scope.isDisabled = false;
				return false;
			}

			for (i = 0; i < $scope.stock_journal.batch_list.length; i++) {
				tmpStockJournal.batch_list[i].qty = tmpStockJournal.batch_list[i].qty - $scope.stock_journal_original.batch_list[i].qty;
			}

			productService.editStockBatch(
				tmpStockJournal,

				function (response) {

					if (response.statuscode == 0 && response.data && response.data.stockjournal) {
						flash.pop({ title: "", body: "Stock bucket updated succesfully", type: "success" });
						$location.path("/stockbuckets/" + "product/" + $scope.product.id);
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
						$scope.isDisabled = false;
					}

				}
			);
		}
		else {

			if ($scope.product.stock_uom_qty.id == $scope.product.stock_uom_quote.id)
				$scope.stock_journal.stock_quote = $scope.stock_journal.stock_qty;

			$scope.stock_journal.product_id = $scope.product.id;

			productService.saveNonBatchedInventoryStock(
				$scope.stock_journal,

				function (response) {

					if (response.statuscode == 0 && response.data && response.data.stockjournal) {
						flash.pop({ title: "", body: "Stock updated succesfully", type: "success" });
						if (redirectToSamePage) {
							$scope.isDisabled = false;
							$scope.getProductById($scope.product.id, function (response) {
								if (response.statuscode == 0 && response.data && response.data.product) {
									$scope.product = response.data.product;
									$scope.populateStockJournal($scope.product);
									$location.path("/AddStock/" + "product/" + $scope.product.id);
								}
								else if (response.statuscode === -100) {
									$location.path("/Login/");
								}
								else {
									flash.pop({ title: "", body: response.message, type: "error" });
									$scope.isDisabled = false;
								}
							});
						}
						else
							$location.path("/stockjournal/" + "product/" + $scope.product.id);
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
						$scope.isDisabled = false;
					}

				}
			);
		}
	};

	$scope.show_stockjournal = function () {
		if (!$scope.stock_journal || !$scope.stock_journal.product) {
			alert("Please select a product.");
			return;
		}

		let options = {};
		options.productid = $scope.stock_journal.product.id ? $scope.stock_journal.product.id : undefined;
		options.fromdate = $scope.stock_journal.fromdate ? $scope.stock_journal.fromdate : undefined;
		options.todate = $scope.stock_journal.todate ? $scope.stock_journal.todate : undefined;

		$scope.product = $scope.stock_journal.product;

		if (!options) options = utilService.getJournalFilters();

		productService.getStockJournal(
			options.productid,
			options.fromdate,
			options.todate,
			null,
			function (response) {

				if (response.statuscode == 0 && response.data && response.data.stockjournal) {
					$scope.stockjournal = response.data.stockjournal;

					options.productid = $scope.stock_journal.product.id;
					options.from_date = $scope.stock_journal.fromdate;
					options.to_date = $scope.stock_journal.todate;
					utilService.setJournalFilters(options);

				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});

	};

	$scope.exportStockJournalsToExcel = function () {
		if (!$scope.stock_journal || !$scope.stock_journal.product) {
			alert("Please select a product.");
			return;
		}

		$scope.product = $scope.stock_journal.product;

		productService.getStockJournal(
			$scope.stock_journal.product.id,
			$scope.stock_journal.fromdate,
			$scope.stock_journal.todate,
			"excel",
			function (response) {

				if (response.statuscode == 0) {
					var anchor = angular.element('<a/>');
					var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates' });
					anchor.attr({
						href: window.URL.createObjectURL(blob),
						target: '_blank',
						download: 'StockJournal.xlsx'
					})[0].click();
				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});

	};


	/*
	  //get product
	  $scope.getProduct1 = function(id, callback) {
		
		  productService.getProductById(id, function(response) {
				if (response.statuscode == 0 && response.data && response.data.product) {
					$scope.product  = response.data.product;
	
				if ($scope.categoryid) {
					categoryService.getCategory($scope.categoryid, function (response) {
						if (response.statuscode == 0 && response.data && response.data.category) {
							$scope.category  = response.data.category;
							$scope.lineagearray = utilService.getLineage($scope.category);
							if (callback) return callback(response);
						}
					});
				}
	
				}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				if (callback) return callback(response);
				}
	 
		  });
	
	  };
	*/
	//get users
	$scope.saveProduct = function (editmode) {

		var imgdata;
		var img;

		var requests = [];
		var product = $scope.product;

		$scope.product.sync_status_id = ($scope.product.sync_status_id == 4101 ? 4100 : $scope.product.sync_status_id)
		// let's first upload additional images
		product.image_list.forEach(function (obj, i) {

			img = $("#imgImageURL" + i);
			if (obj.dirty > -1) {
				//imgdata = utilService.cutImageSimple('imgImageURL' + i, 'hidImageURL' + i + '_cropx', 'hidImageURL' + i + '_cropy', 'hidImageURL' + i + '_cropwidth', 'hidImageURL' + i + '_cropheight', 'hidImageURL' + i + '_imgwidth', 'hidImageURL' + i + '_imgheight', 'hidImageURL' + i + '_actualwidth', 'hidImageURL' + i + '_actualheight', 'imgTempImageURL' + i);
				let f = new FormData();
				f.append('file', obj.file);

				var deferred = $q.defer();
				requests.push(deferred.promise);

				utilService.uploadImage(f, function (response) {

					if (response.statuscode == 0 && response.data) {
						//flash.pop({title: "", body: "Image uploaded succesfully", type: "success"});
						product.image_list[i].url = response.data.url;
						product.image_list[i].url_large = response.data.url_large;
						deferred.resolve();
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
						return;
					}

				});

			}
		});

		// let's upload main image
		img = $("#imgImageURL");
		if (product.main_image && product.main_image.dirty > -1) {
			//imgdata = utilService.cutImageSimple('imgImageURL', 'hidImageURL_cropx', 'hidImageURL_cropy', 'hidImageURL_cropwidth', 'hidImageURL_cropheight', 'hidImageURL_imgwidth', 'hidImageURL_imgheight', 'hidImageURL_actualwidth', 'hidImageURL_actualheight', 'imgTempImageURL');
			let imgdata = new FormData();
			imgdata.append('file', product.main_image.file);

			var deferred = $q.defer();
			requests.push(deferred.promise);

			utilService.uploadImage(imgdata, function (response) {

				if (response.statuscode == 0 && response.data) {
					//flash.pop({title: "", body: "Image uploaded succesfully", type: "success"});
					product.image_url1 = response.data.url;
					product.image_url2 = response.data.url_large;
					product.image_url3 = response.data.url_orig;
					product.main_image = null;
					deferred.resolve();
				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
					return;
				}

			});
		}

		$scope.product.image_list.filter(function (e) {
			if (e.dirty > -1)
				e.file = null;
		})


		$q.all(requests).then(function () {

			$scope.product.name = utilService.applyCapitalization($scope.product.name);
			$scope.product.sku_internal = $scope.product.sku;

			if (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PRODUCT_MULTIPLE_UNIT) != '1') {
				$scope.product.default_qty_uom = {};
				$scope.product.default_qty_uom.id = $scope.product.uom_id;
			}

			if (editmode) {

				productService.editProduct(
					$scope.product,


					/*						$scope.product.id,
											$scope.product.name,
											$scope.product.sku,
											$scope.product.sku_internal, 
											$scope.product.description,
											$scope.product.description_long,
											$scope.product.category_id,
											$scope.product.unit_price,
											$scope.product.uom_id,
											$scope.product.price_level_id,
											$scope.product.pricegroup,
											$scope.product.dimension.length, 
											$scope.product.dimension.width, 
											$scope.product.dimension.height, 
											$scope.product.dimension.weight, 
											$scope.product.linkproduct,
											imgdata,
											$scope.product.image_url1,
											$scope.product.status_id,
											$scope.product.is_batched_inventory,
											$scope.product.is_taxable,
											$scope.product.tax_slab.id,
											*/
					function (response) {
						if (response.statuscode == 0 && response.data.product) {
							if ($scope.product.linkproduct) {
								productService.link($scope.product.id, $scope.product.linkproduct, function (response) {
									if (response.statuscode == 0) {
										flash.pop({ title: "", body: "Product linked succesfully", type: "success" });
										$location.path("/products/" + ($scope.product.category_id != undefined && $scope.product.category_id.length > 0 ? "category/" + $scope.product.category_id[0] : ""));
									}
									else if (response.statuscode === -100) {
										$location.path("/Login/");
									}
									else
										flash.pop({ title: "", body: response.message, type: "error" });
								});
							}
							else if (response.statuscode === -100) {
								$location.path("/Login/");
							}
							else {
								//								$location.path("/products/" + ($scope.product.category_id != undefined && $scope.product.category_list.length > 0 ? "/category/" + $scope.product.category_id : ""));
								$location.path("/products/" + ($scope.product.category_id != undefined ? "category/" + $scope.product.category_id : ""));
							}
						}
						else if (response.statuscode === -100) {
							$location.path("/Login/");
						}
						else {
							flash.pop({ title: "", body: response.message, type: "error" });
						}


					}
				);

			}
			else {

				$scope.product.category_id = $scope.categoryid;

				productService.createProduct(
					$scope.product,

					function (response) {
						if (response.statuscode == 0 && response.data && response.data.product) {
							flash.pop({ title: "", body: "Product created succesfully", type: "success" });
							if ($scope.product.linkwith) {
								productService.link(response.data.product.id, $scope.product.linkwith, function (response) {
									if (response.statuscode == 0) {
										flash.pop({ title: "", body: "Product linked succesfully", type: "error" });
										$location.path("/products/" + ($routeParams.categoryid != undefined ? "category/" + $routeParams.categoryid : ""));
									}
									else
										flash.pop({ title: "", body: response.message, type: "error" });
								});
							}
							else
								$location.path("/products/" + ($routeParams.categoryid != undefined ? "category/" + $routeParams.categoryid : ""));
						}
						else if (response.statuscode === -100) {
							$location.path("/Login/");
						}
						else {
							flash.pop({ title: "", body: response.message, type: "error" });
						}
					}
				);
			}
			/*
					productService.createProduct(
								$scope.product.sku,
								$scope.product.sku_internal,
								$scope.product.name, 
								$scope.product.description,
								$scope.product.description_long,
								$scope.categoryid,
								$scope.product.unit_price,
								($scope.product.uom && $scope.product.uom != "" ? $scope.product.uom : '1'),
								imgdata,
								
								function(response) {
									if (response.statuscode == 0 && response.data && response.data.product) {
										if ($scope.product.linkwith) {
											productService.link(response.data.product.id, $scope.product.linkwith, function (response) {
												if (response.statuscode == 0)
													$location.path("/products/" + ($routeParams.categoryid != undefined ? "/category/" + $routeParams.categoryid : ""));
												else
													flash.pop({title: "", body: response.message, type: "error"});
											});
										}
										else 
											$location.path("/products/" + ($routeParams.categoryid != undefined ? "/category/" + $routeParams.categoryid : ""));
									}
									else {
										flash.pop({title: "", body: response.message, type: "error"});
									}
								}
					);
				*/
		});

		return;

	};


	$scope.newdata = function (new_pricegroup) {

		for (let i = 0; i < $scope.pricegrouplist.length; i++) {
			if ($scope.pricegrouplist[i].id === new_pricegroup.id) {


				let num1 = new_pricegroup.pricelistlist[0].unit_price;
				let num2 = new_pricegroup.pricelistlist[1].unit_price;
				let num3 = new_pricegroup.pricelistlist[2].unit_price;

				$scope.pricegrouplist[i].name = new_pricegroup.name;
				$scope.pricegrouplist[i].description = new_pricegroup.description;
				$scope.pricegrouplist[i].unit_price = Math.max(num1, num2, num3);

				for (let j = 0; j < $scope.uomlist.length; j++) {
					if ($scope.uomlist[j].id === new_pricegroup.uom_id) {
						$scope.pricegrouplist[i].uom_name = $scope.uomlist[j].name;
					}
				}

				$scope.expand(new_pricegroup);
			}
		}
	}

	$scope.savePriceGroup = function (pricegroup) {
		$scope.isDiabled = true;

		pricegroup.name = utilService.applyCapitalization(pricegroup.name);
		if ($scope.editmode) {

			productService.editPriceGroup(
				pricegroup,

				function (response) {
					if (response.statuscode == 0 && response.data.pricegroup) {
						flash.pop({ title: "", body: "Pricegroup updated succesfully", type: "success" });
						$location.path("/pricegroups");
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
					}

				}
			);

		}
		else {

			productService.createPriceGroup(
				$scope.pricegroup,

				function (response) {
					if (response.statuscode == 0 && response.data && response.data.pricegroup) {
						flash.pop({ title: "", body: "Pricegroup created succesfully", type: "success" });
						$location.path("/pricegroups");
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
					}
				}
			);
		}

	}

	$scope.showCloneProductForm = function (id) {
		$location.path("/CloneProduct/" + id + ($scope.categoryid ? "/category/" + $scope.categoryid : ""));
	};

	$scope.productRowClick = function (id) {
		if ($scope.isEditProductAllowed())
			$scope.showEditProductForm(id);
	}

	$scope.showEditProductForm = function (id) {
		$location.path("/EditProduct/" + id + ($scope.categoryid ? "/category/" + $scope.categoryid : ""));
	};

	$scope.showAddProductForm = function (id) {
		$scope.product = initProduct();
		$location.path("/AddProduct/" + id);
	};

	$scope.showAddProductForm1 = function (id) {
		$scope.product = initProduct();
		$location.path("/AddProduct1/" + id);
	};

	$scope.showAddPriceGroupForm = function (id) {
		initPriceGroup();
		$location.path("/AddPriceGroup/");
	};

	$scope.priceGroupRowClick = function (id) {
		if ($scope.isEditPriceGroupAllowed(id))
			$scope.showEditPriceGroupForm(id);
	}

	$scope.showEditPriceGroupForm = function (id) {
		//$scope.initPriceGroup();
		$location.path("/AddPriceGroup/" + id);
	};

	$scope.showProduct1 = function (id) {
		$location.path("/products2/" + id);
	};

	$scope.product_search = function (search_text, enabledOnly, stockedOnly, is_new_product_show_days) {

		// if blank search text return empty list
		if (!search_text || search_text == "") {
			$scope.productlist = [];
			return;
		}

		productService.searchProducts($routeParams.customerid, search_text, enabledOnly, stockedOnly, is_new_product_show_days, function (response) {
			if (response.statuscode == 0 /* && response.data  && response.data.productlist */) {
				if (response.data == undefined) {

					//$scope.productlist =[];
				}
				else {
					var new_data = response.data.productlist;
					var existing_data = $scope.productlist;
					if (existing_data == undefined)
						existing_data = [];

					for (var i = 0; i < new_data.length; i++) {
						var exists = false;
						for (var j = 0; j < existing_data.length; j++) {
							if (existing_data[j].id == new_data[i].id) {
								exists = true;
							}
						}
						if (exists == false) {
							existing_data.unshift(new_data[i]);
						}
					}
					$scope.productlist = existing_data;
				}
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});
	};

	var initProduct = function () {
		var obj = { "sku": "", "name": "", "unit_price": "", "uom": "EA", "is_quote_uom_restricted": 1, "is_qty_uom_restricted": 1, "description": "", "description_long": "", "parent_id": ($scope.productid ? $scope.productid : ""), id: -1, "uomconversionlist": [], "image_list": [] };
		obj.pricegroup = initPriceGroup();
		if (!$scope.isPriceLevelDropDownVisible())
			obj.price_level_id = 4800;
		return obj;
	};

	var initPriceGroup = function () {
		return { "id": -1, "name": "", "description": "", "unit_price": -1, "pricelistlist": [], "uomconversionlist": [] };
	};

	var initPriceList = function () {
		return { "id": "", "group_id": "", "product_id": "", "qty_from": 0, "qty_to": 999999, "uom_id": "", "customer_type_id": "", "unit_price": "" };
	}

	$scope.addUOMConversionToPriceGroup = function () {
		$scope.pricegroup.uomconversionlist.push(utilService.initUOMConversion());
	};

	$scope.removeUOMConversionFromArray = function (index) {
		$scope.pricegroup.uomconversionlist.splice(index, 1);
	};

	$scope.isAddProductAllowed = function () {
		return (utilService.isAddProductAllowed() == '1');
	};

	$scope.isEditProductAllowed = function () {
		return (utilService.isEditProductAllowed() == '1');
	};

	$scope.isDeleteProductAllowed = function () {
		return (utilService.isDeleteProductAllowed() == '1');
	};

	$scope.isProductCodeRequired = function () {
		$scope.product_code_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_PRODUCT_CODE_REQD) == "1");
		return $scope.product_code_edit_flag;
	};

	$scope.enableProductCodeEdit = function () {
		$scope.product_code_edit_flag = true;
	};

	$scope.isProductCodeEditAllowed = function () {
		return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_PRODUCT_CODE_REQD) == "0"));
	};

	// $scope.isAddProductAllowed = function() {
	// 	return (utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_CREATE) == '1');
	// };

	// $scope.isEditProductAllowed = function() {
	// 	return (utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_UPDATE) == '1');
	// };

	$scope.save = function () {
		$scope.isDisabled = true;
		$scope.saveProduct($scope.editmode);
	};

	$scope.deletePriceGroup = (pricegroup) => {
		if (confirm("Are you sure you want to delete the price group?")) {
			productService.deletePriceGroup(
				pricegroup.id,
				function (response) {
					if (response.statuscode == 0) {
						flash.pop({ title: "", body: "Price Group deleted succesfully", type: "success" });
						$route.reload();
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
					}
				});
		}
	};

	$scope.deleteProduct = (product) => {
		if (confirm("Are you sure you want to delete the product?")) {
			productService.deleteProduct(
				product.id,
				function (response) {
					if (response.statuscode == 0) {
						flash.pop({ title: "", body: "Product deleted succesfully", type: "success" });
						$route.reload();
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
					}
				});
		}
	};

	$scope.unlink = function (categoryid) {

		productService.unlink($scope.productid, categoryid, function (response) {
			if (response.statuscode == 0) {
				flash.pop({ title: "", body: "Product unlinked succesfully", type: "success" });
				$location.path("/products/" + ($routeParams.categoryid != undefined ? "category/" + $routeParams.categoryid : ""));
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});

	};

	$scope.unlinkProduct = function (masterid, childid) {

		productService.unlinkProduct(masterid, childid, function (response) {
			if (response.statuscode == 0) {
				flash.pop({ title: "", body: "Product unlinked succesfully", type: "success" });
				$location.path("/products/" + ($routeParams.categoryid != undefined ? "category/" + $routeParams.categoryid : ""));
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});

	};

	$scope.convertEquationToQty = function (notes, obj) {

		var pcs = 0;
		try {
			var val = $scope.$eval(notes);
			obj.stock_qty = val;
		}
		catch (err) {
			val = notes;
			pcs = 0;
		}

		return val;

	};
	/*
	 $scope.getProductList = function (categoryid, customerid, showOnlyIfCategoryHasProducts, activeonly) {
	
		productService.getProducts(categoryid, customerid, showOnlyIfCategoryHasProducts, activeonly, function(response) {
			if (response.statuscode == 0 && response.data && response.data.productlist) {
				$scope.productlist     = response.data.productlist;
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
		});
	 }
	 */

	$scope.shareCatalog = function (product) {

		$scope.getProductById(product.id, function (response) {
			if (response.statuscode == 0 && response.data && response.data.product) {

				let product = response.data.product;
				image_urls = product.image_list.filter(x => x.url_orig != '').map(function (item) {
					return item.url_orig;
				});

				if (!image_urls) image_urls = [];

				if (product.image_url2 != '')
					image_urls.push(product.image_url2);

				if (image_urls.length > 0)
					utilService.shareMultipleImages(product.name, image_urls);
				else
					flash.pop({ title: "", body: "No images found to share", type: "error" });
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});
	}

	$scope.populateStockJournal = function (product) {

		$scope.stock_journal = initStockJournal();
		if (product.is_batched_inventory == 1) {
			$scope.stock_journal.stock_qty = 1;
		}
		if (product.stock_batch_pcs && product.stock_batch_pcs > 0) {
			for (i = 0; i < product.stock_batch_pcs; i++) {
				var obj = initStockJournalBatchItem();
				obj.index = i + 1;
				obj.piece_count = 1;
				obj.uom = product.stock_uom_batch;

				$scope.stock_journal.batch_list.push(obj);
			}
		}
	};

	var getAllStockBatches = function (productid, options, callback) {

		productService.getStockBatches(productid, options, callback);

		if (productid) {
			productService.getProductById(productid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.product) {
					$scope.product = response.data.product;
				}
			});
		}
	};


	$scope.get_allStockBatches = function () {

		let options = utilService.getBucketFilters() || {};

		let productid = undefined;

		if ($scope.stockbucket.product && $scope.stockbucket.product.id)
			productid = $scope.stockbucket.product.id;
		else if (options.productid)
			productid = options.productid;
		else if ($routeParams.productid)
			productid = $routeParams.productid;

		if (productid) {

			if ($scope.stockbucket.status_id == 4600)
				options.enabled_only = 1;
			else
				options.enabled_only = 0;

			options["productid"] = productid;

			getAllStockBatches(productid, options, function (response) {
				if (response.statuscode == 0 && response.data && response.data.stockbucketlist) {
					$scope.stockbucketlist = response.data.stockbucketlist;
					utilService.setBucketFilters(options);
				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});
		}
	};

	$scope.exportStockBatchesToExcel = function () {
		var productid = ($scope.stockbucket.product ? $scope.stockbucket.product.id : $routeParams.productid);

		if (productid) {
			var options = {};
			options.format = "excel";
			if ($scope.stockbucket.status_id == 4600) options.enabled_only = 1;

			productService.getStockBatches(productid, options, function (response) {
				if (response.statuscode == 0) {
					var anchor = angular.element('<a/>');
					var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates' });
					anchor.attr({
						href: window.URL.createObjectURL(blob),
						target: '_blank',
						download: 'StockBuckets.xlsx'
					})[0].click();
				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});
		}
	};

	//To get Unit of Measureslist
	$scope.getUnitOfMeasureslist = function () {
		masterService.getUnitOfMeasures({ "activeonly": 1 }, function (response) {
			if (response.statuscode == 0 && response.data && response.data.uomlist) {
				$scope.uomlist = response.data.uomlist;
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});

	};

	$scope.setPriceGroupSortParameters = function (sortby, sortdirection) {

		if ($scope.sortBy == sortby) {
			$scope.sortDirection = $scope.sortDirection * -1;
		}
		else {
			$scope.sortBy = sortby;
			$scope.sortDirection = 1;
		}

	}

	// To get price grouplist
	$scope.getPriceGrouplist = function () {
		productService.getPriceGroups($scope.sortBy, $scope.sortDirection, function (response) {
			if (response.statuscode == 0 && response.data && response.data.pricegrouplist) {
				$scope.pricegrouplist = response.data.pricegrouplist;

			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});

	};

	$scope.getProductsByCategoryWithActiveStatus = function () {

		var options = {};
		options.enabled_only = $scope.active_only;

		$scope.getProductsByCategoryId($routeParams.categoryid, $scope.customerid, options, function (response) {
			if (response.statuscode == 0 && response.data && response.data.productlist) {
				$scope.productlist = response.data.productlist;

				categoryService.getCategory($routeParams.categoryid, function (response) {
					if (response.statuscode == 0 && response.data && response.data.category) {
						$scope.category = response.data.category;
						var arr = utilService.getLineage($scope.category);
						$scope.lineagearray = arr;
						//	$scope.lineagearray = utilService.addElementToLineage (arr, $scope.category.id, $scope.category.name);
					}
				});
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});

	};

	$scope.exportProductsToExcel = function () {

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
		options.format = "excel";

		$scope.getProductsByCategoryId($routeParams.categoryid, $scope.customerid, options, function (response) {
			if (response.statuscode == 0) {

				var anchor = angular.element('<a/>');
				var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates' });
				anchor.attr({
					href: window.URL.createObjectURL(blob),
					target: '_blank',
					download: 'Products.xlsx'
				})[0].click();

			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});
	}

	$scope.productid = ($routeParams.productid ? $routeParams.productid : $routeParams.id);
	$scope.categoryid = $routeParams.categoryid;
	$scope.customerid = $routeParams.customerid;

	if (utilService.isUserACustomer()) {
		var user = utilService.getUser();
		if (user) {
			var customerid = user.company_id;
			$scope.customerid = user.company_id;
		}
	}

	$scope.withproductsonly = $routeParams.withproductsonly;

	$scope.slickConfigProduct = {
		method: {},
		dots: true,
		infinite: false,
		speed: 300,
		slidesToShow: 6,
		slidesToScroll: 6,
		responsive: [
		  {
			breakpoint: 1366,
			settings: {
			  slidesToShow: 4,
			  slidesToScroll: 4,
			  infinite: true,
			  dots: true
			}
		  },
		  {
			breakpoint: 1024,
			settings: {
			  slidesToShow: 4,
			  slidesToScroll: 4,
			  infinite: true,
			  dots: true
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
			  slidesToShow: 2,
			  slidesToScroll: 2
			}
		  }
		]
	  };

	if ($rootScope.title == "Products") {
		if ($routeParams.q) {
			$scope.searchText = $routeParams.q;
			var enabled_flag = $routeParams.enabled_flag || 0;
			var stocked_flag = $routeParams.is_hidden_no_stock || 0;
			var show_new_product_x_days = utilService.getNewProductShowXDays() || 0;

			$scope.product_search($scope.searchText, enabled_flag, stocked_flag, show_new_product_x_days);
		}
		else if ($routeParams.categoryid) {

			var para = $rootScope.parameters;
			console.log(para);
			var flag = (para && para.enabled_flag && para.enabled_flag == 1 ? 1 : 0);
			$scope.active_only = flag;
			var is_hidden_no_stock = (para && para.is_hidden_no_stock && para.is_hidden_no_stock == 1 ? 1 : 0);
			var is_new_product_show_days = (para && para.is_new_product_show_days && para.is_new_product_show_days == true ? utilService.getNewProductShowXDays() : 0);

			var options = {};
			options.enabled_only = flag;
			options.is_hidden_no_stock = is_hidden_no_stock;
			options.is_new_product_show_days = is_new_product_show_days;
			options.withproductsonly = $scope.withproductsonly;

			$scope.getProductsByCategoryId($routeParams.categoryid, $scope.customerid, options, function (response) {
				if (response.statuscode == 0 && response.data && response.data.productlist) {
					$scope.productlist = response.data.productlist;

					categoryService.getCategory($routeParams.categoryid, function (response) {
						if (response.statuscode == 0 && response.data && response.data.category) {
							$scope.category = response.data.category;
							var arr = utilService.getLineage($scope.category);
							$scope.lineagearray = arr;
							//	$scope.lineagearray = utilService.addElementToLineage (arr, $scope.category.id, $scope.category.name);
						}
					});
				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});
		}
	}

	else if (($rootScope.title == "Single Product" || $rootScope.title == "Stock Entry")) {

		// if ID is provided
		if ($routeParams.productid) {
			productService.getProductById($routeParams.productid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.product) {
					$scope.product = response.data.product;

					if ($rootScope.title == "Stock Entry") {

						$scope.productlist = [];
						$scope.populateStockJournal($scope.product);
						$scope.productlist.push($scope.product);
						/*				$scope.stock_journal = initStockJournal();
										
										if ($scope.product.is_batched_inventory == 1) {
											$scope.stock_journal.stock_qty = 1;
										}
										if ($scope.product.stock_batch_pcs && $scope.product.stock_batch_pcs > 0) {
											for (i = 0; i < $scope.product.stock_batch_pcs; i++) {
												var obj = initStockJournalBatchItem();
												obj.index = i + 1;
												obj.piece_count = 1;
												obj.uom         = $scope.product.stock_uom_batch;
						
												$scope.stock_journal.batch_list.push(obj);
											}
										}*/
					}

				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});
		}
		else if ($rootScope.title == "Stock Entry") {
			$scope.productlist = [];
		}
		/*
		else {
			if (!$scope.productlist) {
				productService.getProducts(null, null, 0, 0, function(response) {
					if (response.statuscode == 0 && response.data && response.data.productlist) {
						$scope.productlist     = response.data.productlist;
					}
					else if (response.statuscode === -100)  {
						$location.path("/Login/");
					}
				});
			}
		} */
	}

	else if ($rootScope.title == "Stock Batches") {
		if ($routeParams.id) {
			productService.getStockBatchById($routeParams.id, function (response) {
				if (response.statuscode == 0 && response.data && response.data.stockbucket) {
					var stockbucket = response.data.stockbucket;
					productService.getProductById(stockbucket.product_id, function (response) {
						if (response.statuscode == 0 && response.data && response.data.product) {
							$scope.product = response.data.product;

							$scope.editmode = true;

							var stock_journal = initStockJournal();
							stock_journal.stock_bucket_code = stockbucket.code;
							stock_journal.stock_bucket_id = stockbucket.id;
							stock_journal.product_id = stockbucket.product_id;
							stock_journal.description = stockbucket.description;
							stock_journal.stock_qty = stockbucket.stock_qty;
							stock_journal.stock_quote = stockbucket.stock_quote;

							stock_journal.stock_bucket = stockbucket;

							if ($scope.product.is_batched_inventory && $scope.product.stock_batch_pcs > 0) {
								for (i = 0; i < stockbucket.stock_bucket_detail.length; i++) {
									var stockJournalDetail = initStockJournalBatchItem();
									stockJournalDetail.description = stockbucket.stock_bucket_detail[i].description;
									stockJournalDetail.piece_count = stockbucket.stock_bucket_detail[i].piece_count;
									stockJournalDetail.index = stockbucket.stock_bucket_detail[i].index;
									stockJournalDetail.uom = stockbucket.stock_bucket_detail[i].uom;
									stockJournalDetail.id = stockbucket.stock_bucket_detail[i].id;
									stockJournalDetail.qty = stockbucket.stock_bucket_detail[i].qty;
									stockJournalDetail.original_qty = stockbucket.stock_bucket_detail[i].qty;
									stock_journal.batch_list.push(stockJournalDetail);
								}
							}
							$scope.stock_journal = stock_journal;
							$scope.stock_journal_original = angular.copy(stock_journal);
						}
						else
							flash.pop({ title: "", body: response.message, type: "error" });
					});
				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});
		}
		else {

			let options = utilService.getBucketFilters() || {};

			//let's show enabled only by default
			options["enabled_only"] = 1;

			let productid = options["productid"] || $routeParams.productid;

			if (productid) {

				getAllStockBatches(productid, options, function (response) {
					if (response.statuscode == 0 && response.data && response.data.stockbucketlist) {
						$scope.stockbucketlist = response.data.stockbucketlist;
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
					}
				});

				productService.getProductById(productid, function (response) {
					if (response.statuscode == 0 && response.data && response.data.product) {
						$scope.product = response.data.product;
						$scope.stock_journal = {};
						$scope.stock_journal.product = response.data.product;
					}
				});
			}
			/*
						productService.getStockBatches( $routeParams.productid, options, function(response) {
						if (response.statuscode == 0 && response.data && response.data.stockbucketlist) {
							$scope.stockbucketlist     = response.data.stockbucketlist;
						}
						else if (response.statuscode === -100)  {
							$location.path("/Login/");
						}
						else {
							flash.pop({title: "", body: response.message, type: "error"});
						}
					});
			*/

		}
	}

	else if ($rootScope.title == "Stock Journal") {

		let options = utilService.getJournalFilters() || {};

		let productid = options["productid"] || $routeParams.productid;
		let fromdate = options["from_date"] || null;
		let todate = options["to_date"] || null;

		if (productid) {
			productService.getStockJournal(productid, fromdate, todate, null, function (response) {
				if (response.statuscode == 0 && response.data && response.data.stockjournal) {
					$scope.stockjournal = response.data.stockjournal;
				}
				else if (response.statuscode === -100) {
					$location.path("/Login/");
				}
				else {
					flash.pop({ title: "", body: response.message, type: "error" });
				}
			});

			//if (!$scope.product) {
			productService.getProductById(productid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.product) {
					$scope.product = response.data.product;
					$scope.stock_journal = {};
					$scope.stock_journal.product = response.data.product;
				}
			});
			//}
		}
	}
	else if ($rootScope.action == "show_stocksummary") {
		if ($routeParams.categoryid && $routeParams.categoryid != 0) {
			categoryService.getCategory($routeParams.categoryid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.category) {
					$rootScope.title = "Stock Summary" + " - Category: " + response.data.category.name;
					$scope.category = response.data.category;
					$scope.lineagearray = utilService.getLineage(response.data.category);
					//					$scope.lineagearray = utilService.addElementToLineage ($scope.lineagearray, response.data.category.id, response.data.category.name);
				}
			});
		}
		if ($routeParams.pricegroupid) {
			productService.getPriceGroup($routeParams.pricegroupid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.pricegroup)
					$rootScope.title = "Stock Summary" + " - Price Group: " + response.data.pricegroup.name;
			});
		}
		productService.getStockSummary($routeParams.productid, $routeParams.categoryid, $routeParams.pricegroupid, 0, function (response) {
			if (response.statuscode == 0 && response.data && response.data.stockbucketlist) {
				$scope.stockbucketlist = response.data.stockbucketlist;
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});
	}
	else if ($rootScope.action == "show_stockdetail") {
		if ($routeParams.categoryid && $routeParams.categoryid != 0) {
			categoryService.getCategory($routeParams.categoryid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.category) {
					$rootScope.title = "Stock Detail" + " - Category: " + response.data.category.name;
					$scope.category = response.data.category;
					$scope.lineagearray = utilService.getLineage(response.data.category);
				}
			});
		}
		if ($routeParams.pricegroupid) {
			productService.getPriceGroup($routeParams.pricegroupid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.pricegroup)
					$rootScope.title = "Stock Detail" + " - Price Group: " + response.data.pricegroup.name;
			});
		}
		productService.getStockSummary($routeParams.productid, $routeParams.categoryid, $routeParams.pricegroupid, 1, function (response) {
			if (response.statuscode == 0 && response.data && response.data.stockbucketlist) {
				$scope.stockbucketlist = response.data.stockbucketlist;
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});
	}
	else if ($rootScope.title == "Price Groups") {
		$scope.getPriceGrouplist();
	}
	else if ($rootScope.title == "Add Price Group") {

		$scope.editmode = false;

		$scope.pricegroup = initPriceGroup();

		masterService.getCustomerTypes({}, function (response) {
			if (response.statuscode == 0 && response.data && response.data.companytypelist) {

				for (i = 0; i < response.data.companytypelist.length; i++) {
					obj = initPriceList();
					var companytype = response.data.companytypelist[i];
					obj.customer_type_id = companytype.id;
					obj.customer_type_name = companytype.name;
					$scope.pricegroup.pricelistlist.push(obj);
				}

			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});
		$scope.getUnitOfMeasureslist();

	}
	else if ($rootScope.title == "Edit Price Group") {

		$scope.editmode = true;
		$scope.getUnitOfMeasureslist();

		productService.getPriceGroup($routeParams.id, function (response) {
			if (response.statuscode == 0 && response.data && response.data.pricegroup) {
				$scope.pricegroup = response.data.pricegroup;

				var companytypeHash = {};
				for (i = 0; i < $scope.pricegroup.pricelistlist.length; i++) {
					companytypeHash[$scope.pricegroup.pricelistlist[i].customer_type_id] = $scope.pricegroup.pricelistlist[i];
				}

				masterService.getCustomerTypes({}, function (response) {
					if (response.statuscode == 0 && response.data && response.data.companytypelist) {
						var companytypelist = response.data.companytypelist;
						for (i = 0; i < companytypelist.length; i++) {
							if (companytypeHash[companytypelist[i].id] == undefined) {
								var obj = initPriceList();
								obj.customer_type_id = companytypelist[i].id;
								obj.customer_type_name = companytypelist[i].name;
								$scope.pricegroup.pricelistlist.push(obj);
							}
							else {
								companytypeHash[companytypelist[i].id].customer_type_name = companytypelist[i].name;
							}
						}
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
					}
				});

			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});

	}
	else if ($rootScope.title == "Add Product") {
		$scope.editmode = false;

		$scope.product = initProduct();

		masterService.getCustomerTypes({}, function (response) {
			if (response.statuscode == 0 && response.data && response.data.companytypelist) {

				for (i = 0; i < response.data.companytypelist.length; i++) {
					obj = initPriceList();
					var companytype = response.data.companytypelist[i];
					obj.customer_type_id = companytype.id;
					obj.customer_type_name = companytype.name;
					$scope.product.pricegroup.pricelistlist.push(obj);
				}

			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});

		$scope.getUnitOfMeasureslist();

		masterService.getHsn({}, function (response) {
			if (response.statuscode == 0 && response.data && response.data.hsnlist) {
				$scope.hsnlist = response.data.hsnlist;
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
			}
		});
		/*
			masterService.getTaxSlabs({"activeonly":1}, function(response) {
				if (response.statuscode == 0 && response.data && response.data.taxslablist) {
					$scope.taxslablist     = response.data.taxslablist;
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});
		*/
		$scope.getPriceGrouplist();

		if ($scope.categoryid) {
			categoryService.getCategory($scope.categoryid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.category) {
					$scope.category = response.data.category;
					$scope.lineagearray = utilService.getLineage($scope.category);
				}
			});
			/*
					productService.getPriceListByCategoryId($scope.categoryid, function (response) {
						if (response.statuscode == 0 && response.data && response.data.pricelistlist) {
							$scope.product.priceListList  = response.data.pricelistlist;
							populatePriceListHash(response.data.pricelistlist);
						}
					});
			*/
		}
	}
	/*
	else if ($rootScope.title == "Edit Product" && ($routeParams.id)) {
	   $scope.getProductById($routeParams.id, function (response){
		   if (response.statuscode == 0 && response.data && response.data.product && response.data.product.category_id.length > 1) {
			   var tmp = [];
			   for (i = 0; i < response.data.product.category_id.length; i++) {
				   tmp.push(categoryService.getCategory(response.data.product.category_id[i], $scope.sessionid));
			   }
			   $q.all(tmp).then (function (result) {
				   angular.forEach(result, function(response) {
					   tmp.push(response.data);
					 });			
			   });
		   }
	   });
	   $scope.editmode = true;
	}
	*/
	else if (($rootScope.title == "Edit Product" && ($routeParams.id)) || ($rootScope.title == "Clone Product" && ($routeParams.id))) {

		$scope.getProductById($routeParams.id, function (response) {
			if (response.statuscode == 0 && response.data && response.data.product) {
				$scope.product = response.data.product;
				$scope.editmode = true;

				categoryService.getCategories(null, null, null, null, 0, 0, function (response) {
					$scope.categorylist = response.data.categorylist;
				});

				if ($rootScope.title == "Clone Product") {
					$scope.product.id = "";
					$scope.product.sku = "";
					$scope.product.sku_internal = "";
					$scope.product.name = "";
					$scope.product.is_hidden_no_stock = (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PRODUCT_STOCK) == '1' ? $scope.product.is_hidden_no_stock : 0);
					$scope.product.image_list = [];
					$scope.product.image_url1 = "";
					$scope.product.image_url2 = "";
					$scope.product.image_url3 = "";
					$scope.product.image_url4 = "";
					$scope.product.image_url5 = "";
					$scope.editmode = false;
				}

				$scope.current_batch_inventory_flag = $scope.product.is_batched_inventory;

				if ($scope.product.price_level_id + "" === utilService.CONST_PRICING_PRODUCT_VARIABLE + "") {

					productService.getPriceGroup($scope.product.pricegroup.id, function (response) {
						if (response.statuscode == 0 && response.data && response.data.pricegroup) {
							$scope.product.pricegroup = response.data.pricegroup;
							var companytypeHash = {};
							for (i = 0; i < $scope.product.pricegroup.pricelistlist.length; i++) {
								companytypeHash[$scope.product.pricegroup.pricelistlist[i].customer_type_id] = $scope.product.pricegroup.pricelistlist[i];
							}
							masterService.getCustomerTypes({}, function (response) {
								if (response.statuscode == 0 && response.data && response.data.companytypelist) {
									var companytypelist = response.data.companytypelist;
									for (i = 0; i < companytypelist.length; i++) {
										if (companytypeHash[companytypelist[i].id] == undefined) {
											var obj = initPriceList();
											obj.customer_type_id = companytypelist[i].id;
											obj.customer_type_name = companytypelist[i].name;
											$scope.product.pricegroup.pricelistlist.push(obj);
										}
										else {
											companytypeHash[companytypelist[i].id].customer_type_name = companytypelist[i].name;
										}
									}
								}
								else if (response.statuscode === -100) {
									$location.path("/Login/");
								}
								else {
									flash.pop({ title: "", body: response.message, type: "error" });
								}
							});

						}
						else if (response.statuscode === -100) {
							$location.path("/Login/");
						}
						else {
							flash.pop({ title: "", body: response.message, type: "error" });
						}
					});
				}
				else {
					masterService.getCustomerTypes({}, function (response) {
						if (response.statuscode == 0 && response.data && response.data.companytypelist) {

							for (i = 0; i < response.data.companytypelist.length; i++) {
								obj = initPriceList();
								var companytype = response.data.companytypelist[i];
								obj.customer_type_id = companytype.id;
								obj.customer_type_name = companytype.name;
								$scope.product.pricegroup.pricelistlist.push(obj);
							}

						}
						else if (response.statuscode === -100) {
							$location.path("/Login/");
						}
						else {
							flash.pop({ title: "", body: response.message, type: "error" });
						}
					});
				}

				// get category list if product is attached to more than one categories
				if ($scope.product.category_count > 1) {

					categoryService.getCategories(null, $scope.product.id, 0, 0, null, function (response) {
						if (response.statuscode == 0 && response.data && response.data.categorylist) {
							$scope.product.category_list = response.data.categorylist;
						}
					});
				}

				// for pricing
				/*
				masterService.getCustomerTypes(function(response) {
					if (response.statuscode == 0 && response.data && response.data.companytypelist) {
						$scope.companytypelist     = response.data.companytypelist;
					}
					else {
						flash.pop({title: "", body: response.message, type: "error"});
					}
				});
				*/

				$scope.getPriceGrouplist();

				masterService.getHsn({}, function (response) {
					if (response.statuscode == 0 && response.data && response.data.hsnlist) {
						$scope.hsnlist = response.data.hsnlist;
					}
					else if (response.statuscode === -100) {
						$location.path("/Login/");
					}
					else {
						flash.pop({ title: "", body: response.message, type: "error" });
					}
				});
				/*
							masterService.getTaxSlabs({"activeonly":1}, function(response) {
								if (response.statuscode == 0 && response.data && response.data.taxslablist) {
									$scope.taxslablist     = response.data.taxslablist;
								}
								else if (response.statuscode === -100)  {
									$location.path("/Login/");
								}
								else {
									flash.pop({title: "", body: response.message, type: "error"});
								}
							});
				*/
				$scope.getUnitOfMeasureslist();
				/*
							masterService.getUnitOfMeasures({"activeonly":1}, function(response) {
								if (response.statuscode == 0 && response.data && response.data.uomlist) {
									$scope.uomlist     = response.data.uomlist;
								}
								else if (response.statuscode === -100)  {
									$location.path("/Login/");
								}
								else {
									flash.pop({title: "", body: response.message, type: "error"});
								}
							});
				*/
				/* 	 	
							if ($scope.product.price_level_id == 4801) {
								productService.getPriceListByProductId($routeParams.id, function (response) {
									if (response.statuscode == 0 && response.data && response.data.pricelistlist) {
										$scope.product.priceListList  = response.data.pricelistlist;
										populatePriceListHash(response.data.pricelistlist);
									}
								});
							}
				
							if ($scope.product.price_level_id == 4802) {
								productService.getPriceListByCategoryId($scope.categoryid, function (response) {
									if (response.statuscode == 0 && response.data && response.data.pricelistlist) {
										$scope.product.priceListList  = response.data.pricelistlist;
										populatePriceListHash(response.data.pricelistlist);
									}
								});
							}
				*/

				/* RUPESH - COMMENTED ON 01/31/2016  - DO WE NEED IT?
				if ($scope.categoryid) {
	
					categoryService.getCategory($scope.categoryid, function (response) {
						if (response.statuscode == 0 && response.data && response.data.category) {
							$scope.category  = response.data.category;
							$scope.lineagearray = utilService.getLineage($scope.category);
	
							$scope.product.category_list = [];
							$scope.product.category_list.push($scope.category);
	
							if ($scope.product.category_id.length > 1) {
								// addElement($scope.product.category_id); THIS LINE WORKS TOO. BUT FOLLOWING LINE WORKED TOO SO KEEPTING IN SIMPLE. 
							
								for (i = 0; i < $scope.product.category_id.length; i++) {
									if ($scope.product.category_id[i] != $scope.category.id) {
									
										categoryService.getCategory($scope.product.category_id[i], function (response) {
											if (response.statuscode == 0 && response.data && response.data.category) {
												$scope.product.category_list.push(response.data.category);
											}
										});
										
										
									}
								}
								
							}
	
						}
					});
					
				}
				*/
			}
			else if (response.statuscode === -100) {
				$location.path("/Login/");
			}
			else {
				flash.pop({ title: "", body: response.message, type: "error" });
				if (callback) return callback(response);
			}


		});

	}

	//THIS IS ANOTHER WAY TO DO LOOP. NOT USING AS ANOTHER APPROACH WORKED. BUT FOLLOWING WORKS FINE TOO  
	var addElement = function (paths) {
		for (var i = 0, c = paths.length; i < c; i++) {
			// creating an Immiedately Invoked Function Expression
			(function (path) {
				categoryService.getCategory(path, function (response) {
					if (response.statuscode == 0 && response.data && response.data.category) {
						$scope.product.category_list.push(response.data.category);
					}
				});
			})(paths[i]);
			// passing paths[i] in as "path" in the closure
		}
	};

	var populatePriceListHash = function (priceListList) {

		priceListList.forEach(function (priceList) {
			for (i = 0; i < $scope.companytypelist.length; i++) {
				if (priceList.customer_type_id == $scope.companytypelist[i].id)
					$scope.companytypelist[i].pricelist = priceList;
			}
		});
	};

	$scope.search = function (event, search_text, enabledOnly, stockedOnly) {
		var keycode = event.which || event.keycode;
		if (keycode == 13 && search_text != "") {
			$scope.product_search(search_text, enabledOnly, stockedOnly, utilService.getNewProductShowXDays());
		}
	}
});
