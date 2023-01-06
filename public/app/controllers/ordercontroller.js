app.controller('ordercontroller', function ($scope, $sce, $http, $filter, $location, orderService,  userService, productService, utilService, categoryService, ModalService, masterService, APIInterceptor, $routeParams, $rootScope, $q, $route, $templateCache, hotkeys, $timeout, $window, flash) {

	$scope.utilService = utilService;

	var ORDER_STATUS_OPEN 		= 4200;
	var ORDER_STATUS_IN_PACKING = 4201;
	var ORDER_STATUS_DELIVERED 	= 4202;
	var ORDER_STATUS_PENDING_WF	= 4203;
	var ORDER_STATUS_REJECTED 	= 4204;
	var ORDER_STATUS_CANCELLED  = 4205;

	var USER_TYPE_ADMINISTRATOR = 4002;

	var MAX_PAGES 	= 15;
	var MAX_PAGES_MOBILE 	= 8;
    $scope.windowScreenSize;
	$scope.itemsPerPage = utilService.getRecordsPerPage();
	$scope.max_pages	= MAX_PAGES;
	$scope.max_pages_mobile	= MAX_PAGES_MOBILE;
    $scope.listLength;
    (function() {
        if($window.innerWidth < 768) {
            $scope.xs = true;
            $scope.sm = false;
            $scope.md = false;
        }
        else if($window.innerWidth > 768 && $window.innerWidth < 992) {
            $scope.xs = false;
            $scope.sm = true;
            $scope.md = false;
        }
        else {
            $scope.xs = false;
            $scope.sm = false;
            $scope.md = true;
        }
    })()
    
    $(window).resize(function(){
        if(window.innerWidth < 768) 
        {
            $scope.xs = true;
            $scope.sm = false;
            $scope.md = false;
        }
        else if($window.innerWidth > 768 && $window.innerWidth < 992) {
            $scope.xs = false;
            $scope.sm = true;
            $scope.md = false;
        }
        else {
            $scope.xs = false;
            $scope.sm = false;
            $scope.md = true;
        }
        $scope.$apply(function() {
                $scope.xs;
                $scope.md;
                $scope.sm
        }) 
        
    });

    $scope.isErrorSyncStatus = function(del_note)
    {
    	if(del_note && (del_note.sync_status_id == 4100 || del_note.sync_status_id == 4101))
    	{
	    	if(del_note.sync_failure_reason && del_note.sync_failure_reason != '') return true;
	    }
	    return false;
    }

    $scope.checkEwayBillExists = function(del_note)
    {
    	if(del_note.einvoice_info && del_note.einvoice_info.bill_number && del_note.einvoice_info.bill_number != '')
    		return true;
    	else
    		return false;
    }	

    $scope.showEwayBillNumber = function(del_note)
    {
		
    	if(del_note.einvoice_info && del_note.einvoice_info.bill_number && del_note.einvoice_info.bill_number != ''){
    		return del_note.einvoice_info.bill_number.substring(0, 2) + "...";
    	}
    	else
    		return "";
    }
	
    $scope.isEwayBillDownload = function(del_note)
    {
    	if((del_note.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_DELIVERED) ||
    		(del_note.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH))
    		return true;
    	return false;
    }

    $scope.isErrorSyncStatus = function(del_note)
    {
    	if(del_note && (del_note.sync_status_id == 4100 || del_note.sync_status_id == 4101))
    	{
	    	if(del_note.sync_failure_reason && del_note.sync_failure_reason != '') return true;
	    }
	    return false;
    }	

    $scope.isErrorSyncStatus = function(del_note)
    {
    	if(del_note && (del_note.sync_status_id == 4100 || del_note.sync_status_id == 4101))
    	{
	    	if(del_note.sync_failure_reason && del_note.sync_failure_reason != '') return true;
	    }
	    return false;
    }	

    $scope.checkGatePassInfoExists = function(gate_pass_info)
    {
    	if(!gate_pass_info) return true;
    	if(gate_pass_info && gate_pass_info.length <= 1) return true;
    	return false;
    }		

    $scope.navigateByGatePassNumber = function(gate_pass_info) {

    	if(gate_pass_info && gate_pass_info.length > 0)
    	{
    		if(gate_pass_info.length == 1)
    		{
    			if($scope.isGatePassViewPermissionExists())
    				return  $sce.trustAsHtml("<a href=\"#/AddGatePass/" + gate_pass_info[0].id + "\">" + gate_pass_info[0].gate_pass_number + "</a");
    			else
    				return gate_pass_info[0].gate_pass_number
    		}
    		else
    			return gate_pass_info[gate_pass_info.length-1].gate_pass_number + "...";
    	}
    	else
    		return "";
    }

    $scope.navigateByGatePassDate = function(gate_pass_info) {
    	if(gate_pass_info  && gate_pass_info.length > 0)
    	{
    		if(gate_pass_info.length == 1)
    		{
    			if($scope.isGatePassViewPermissionExists())
    				return  $sce.trustAsHtml("<a href=\"#/AddGatePass/" + gate_pass_info[0].id + "\">" + $filter('date')(new Date(gate_pass_info[0].gate_pass_date), 'dd-MM-yyyy') + "</a");
    			else
    				return ;[0].gate_pass_date;
    		}
    		else
    			return  $filter('date')(new Date(gate_pass_info[gate_pass_info.length-1].gate_pass_date), 'dd-MM-yyyy') + "...";
    	}
    	else
    		return "";
    }

    $scope.createGatePass = function()
    {
    	$location.path("/AddGatePass");
    }

    $scope.getOrderStatusCssClass = function(statusid)
    {
    	if(statusid ==ORDER_STATUS_PENDING_WF)
    		return "mobileIconOrange";
    	else if(statusid == ORDER_STATUS_REJECTED)
    		return "mobileIconRed";
    	else if(statusid == ORDER_STATUS_DELIVERED)
    		return "mobileIconGreen";
    	else if(statusid == ORDER_STATUS_CANCELLED)
    		return "mobileIconGrey";
    	else
    		return "mobileIconBlue"
    }

    $scope.getPackingSlipStatusCssClass = function(statusid)
    {
    	if(statusid == utilService.CONST_STATUS_PACKING_SLIP_PENDING_DISPATCH)
    		return "mobileIconYellow";
    	else if(statusid == utilService.CONST_STATUS_PACKING_SLIP_DISPATCHED)
    		return "mobileIconOrange";
    	else if(statusid == utilService.CONST_STATUS_PACKING_SLIP_COMPLETED)
    		return "mobileIconGreen";
    	else if(statusid == utilService.CONST_STATUS_PACKING_SLIP_CANCELLED)
    		return "mobileIconGrey";
    	else
    		return "mobileIconBlue"
    }

    $scope.getDeliveryNoteStatusCssClass = function(statusid)
    {
    	if(statusid == utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_LR)
    		return "mobileIconYellow";
    	else if(statusid == utilService.CONST_STATUS_DELIVERY_NOTE_DELIVERED)
    		return "mobileIconOrange";
    	else if(statusid == utilService.CONST_STATUS_DELIVERY_NOTE_COMPLETED)
    		return "mobileIconGreen";
    	else if(statusid == utilService.CONST_STATUS_DELIVERY_NOTE_CANCELLED)
    		return "mobileIconGrey";
    	else
    		return "mobileIconBlue"
    }

	$scope.view_order = function(orderid){
		var cust_code = userService.getCustomerCode();
		
		if((userService.isAuthenticated()) && (!utilService.isUserACustomer()))
		{
			$location.path("/EditOrder/" + orderid)
		}
		else if((cust_code != undefined) || (utilService.isUserACustomer()))
		{
			orderService.findByIdWithCustomerCode(orderid, cust_code, function(response){
				if (response.statuscode == 0 && response.data && response.data.order) {
					let order = response.data.order;
					$scope.order = response.data.order;
					userService.setCustomerCode(cust_code);
				}
				else
				{
					alert(response.message)
					APIInterceptor.setRedirectedURL($location.path());
					$location.path("/Login/");
				}
			});
		}
		else
		{
			APIInterceptor.setRedirectedURL($location.path());
			$location.path("/Login/");
		}
	}

    if ($rootScope.action == "view_order") {

 		$scope.view_order($routeParams.id);
 		return;
 	}

    $scope.checkaccordion = function( i, listLength) {   
        if($scope.xs || $scope.sm) {
                for(var j=0; j<listLength; j++) {
                if( j!= i) {
                    $scope['accordClass_'+j] = false;
                }
                else {
                    $scope['accordClass_'+i] = !$scope['accordClass_'+i];
                }
            }
        }
        
    };
    
	$scope.calculateDiscount = function () {
		if (!$scope.order.discount_perc) $scope.order.discount_perc = 0;
		$scope.order.discount_total = (parseFloat($scope.order.sub_total) * parseFloat($scope.order.discount_perc) / 100);
		updateLineItemDiscount($scope.order);
		calculateTax($scope.order, $scope.order.customer.taxform_flag);
		calculateCommission($scope.order);
	};

	$scope.calculateDiscountPerc = function () {
		$scope.order.discount_perc = getDiscountPercFromFields();
		updateLineItemDiscount($scope.order);
		calculateTax($scope.order, $scope.order.customer.taxform_flag);
		calculateCommission($scope.order);
	};

	var getDiscountPercFromFields = function() {
		return utilService.round((($scope.order.discount_total / $scope.order.sub_total) * 100), 2);
	};

	var updateLineItemDiscount = function (order) {
		var perc = order.discount_total / order.sub_total * 100;
		for (i = 0; i < order.lineitems.length; i++) {
			var lineitem = order.lineitems[i];
			lineitem.discount = (lineitem.order_quantity * lineitem.order_price * perc / 100).toFixed(2);
		}
	};
/*
	$scope.adjustPrice = function (order) {
	
	};
*/
	$scope.isAgentFilterVisible = function() {
	 	return (utilService.isUserAnAdministrator() || utilService.isUserASalesPerson() || utilService.isUserACompanyUser() );
	 };

	$scope.isRateVisible = function () {
		return (utilService.getConfiguration(utilService.CONST_CONFIG_CATALOG_HIDE_PRODUCT_RATE) == "1");
	};

	$scope.isUserACustomer = function () {
		return (utilService.isUserACustomer());
	};

	$scope.isUserAnAgent = function () {
		return (utilService.isUserAnAgent());
	};

	$scope.isUserAnInternal = function () {
		return (utilService.isUserAnInternal());
	};

	$scope.isOrderNumberRequired = function () {
		$scope.order_number_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_ORDER_NO_REQD) == "1");
		return $scope.order_number_edit_flag;
	};

	$scope.isGatePassNumberRequired = function () {
		$scope.gatepass_number_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_GATEPASS_NO_REQD) == "1");
		return $scope.gatepass_number_edit_flag;
	};

	$scope.enableGatePassNumberEdit = function () {
		$scope.gatepass_number_edit_flag = true;
	};


	$scope.enableOrderNumberEdit = function () {
		$scope.order_number_edit_flag = true;
	};

	$scope.isOrderNumberEditAllowed = function() {
		return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_ORDER_NO_REQD) == "0") && (utilService.getPermission(utilService.CONST_PERMISSION_ORDER_NUMBER_EDIT) == '1'));
	};

	$scope.isGatePassNumberEditAllowed = function() {
		return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_GATEPASS_NO_REQD) == "0") && (utilService.getPermission(utilService.CONST_PERMISSION_GATEPASS_NUMBER_EDIT) == '1'));
	};

	$scope.isPackingSlipNumberRequired = function () {
		$scope.packing_slip_number_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_PACKING_SLIP_NO_REQD) == "1");
		return $scope.packing_slip_number_edit_flag;
		//return (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_PACKING_SLIP_NO_REQD) == "1");
	};

	$scope.enablePackingSlipNumberEdit = function () {
		$scope.packing_slip_number_edit_flag = true;
	};

	$scope.isPackingSlipNumberEditAllowed = function() {
		return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_PACKING_SLIP_NO_REQD) == "0") && (utilService.getPermission(utilService.CONST_PERMISSION_PACKING_SLIP_NUMBER_EDIT) == '1'));
	};

	$scope.isDeliveryNoteNumberRequired = function () {
		$scope.delivery_note_number_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_DELIVERY_NOTE_NO_REQD) == "1");
		return $scope.delivery_note_number_edit_flag;
	};

	$scope.enableDeliveryNoteNumberEdit = function () {
		$scope.delivery_note_number_edit_flag = true;
	};

	$scope.isDeliveryNoteNumberEditAllowed = function() {
		return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_DELIVERY_NOTE_NO_REQD) == "0") && (utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_NUMBER_EDIT) == '1'));
	};

	$scope.isTaxAutoCalculated = function () {
		return (utilService.getConfiguration(utilService.CONST_CONFIG_TAX_AUTO_CALCULATE_ORDER) == "1");
	};

	var openPrintWindow = function(file, fileNameString, timeoutInms) {
			var anchor = document.createElement("a");
			// Chrome (all but installed on iOS), opera, Safari on Mac, 
    		if ((navigator.userAgent.indexOf("Chrome") != -1 || navigator.userAgent.indexOf("Opera") != -1 || (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Macintosh") != -1)) && !navigator.userAgent.match('CriOS')) {

				var fileURL = URL.createObjectURL(file,{oneTimeOnly:true});
				window.open(fileURL);
                setTimeout(function(){
                    URL.revokeObjectURL(fileURL);  
                }, timeoutInms);
    		}
    		// Other Chrome (primarily Chrome on iOS)
 			else if (navigator.userAgent.match('CriOS')) { //Chrome iOS
				var reader = new FileReader();
				reader.onloadend = function () { window.open(reader.result);};
				reader.readAsDataURL(file);
			}
			// iPad
     		else if(navigator.userAgent.indexOf("iPad") != -1){
                var fileURL = URL.createObjectURL(file);
                anchor.download = (fileNameString ? fileNameString : "myPDF.pdf");
                anchor.href = fileURL;
                anchor.click();
				window.setTimeout(function() {
					URL.revokeObjectURL(file);
				}, timeoutInms);
    		}
    		// Firefox or all other Safari 
    		else if(navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Safari") != -1 ){
                var fileURL = window.URL.createObjectURL(file);
                anchor.href = fileURL;
                anchor.download = (fileNameString ? fileNameString : "myPDF.pdf");
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                setTimeout(function(){
                    document.body.removeChild(anchor);
                    window.URL.revokeObjectURL(fileURL);  
                }, timeoutInms);
      		}
	};

	$scope.getOrderPDF = function(orderid){
		$scope.loading = true;
		var q = $q.defer();

		orderService.printOrder(orderid)
				.success(function (response) {
					var file = new Blob([response], {type: 'application/pdf'});
					//var fileURL = URL.createObjectURL(file);
					//q.resolve(fileURL);
					q.resolve(file);
				})
				.error(function(err){
					q.reject(err);
				});
		return q.promise;
    };

	//To print pdf on new window/ Button_Click event.
	$scope.printOrderPdf = function(orderid, share){
		$scope.getOrderPDF(orderid).then(function(file){
			if(window.cordova)
			{
				let filename = 'Order '+ orderid + '.pdf';
				utilService.downloadAndOpenInApp(filename, file, share);
			}
			else{
				openPrintWindow(file, "order_" + orderid + ".pdf", 5000);
			}
		},function(err){
			console.log('Error: ' + err);
		});
	};

	$scope.getPackingSlipPDF = function(id, sid){

		$scope.loading = true;
		var q = $q.defer();

		orderService.printPackingSlip(id, sid)
				.success(function (response) {
					var file = new Blob([response], {type: 'application/pdf'});
					// var fileURL = URL.createObjectURL(file);
					// q.resolve(fileURL);
					q.resolve(file);
				})
				.error(function(err){
					q.reject(err);
				});
		return q.promise;

    };

	//To print pdf on new window/ Button_Click event.
	$scope.printPackingSlipPdf = function(id, sid){
		$scope.getPackingSlipPDF(id, sid).then(function(file){
			if(window.cordova)
			{
				utilService.downloadAndOpenInApp("packing_slip.pdf", file, false);
			}
			else{
				openPrintWindow(file, "packing_slip.pdf", 3000);
			}
		},function(err){
			console.log('Error: ' + err);
		});
	};

	$scope.getDeliveryNotePDF = function(noteid, offsetLines, showTotals){
		$scope.loading = true;
		var q = $q.defer();

		orderService.printDeliveryNote(noteid, offsetLines, showTotals)
				.success(function (response) {
					var file = new Blob([response], {type: 'application/pdf'});
					// var fileURL = URL.createObjectURL(file);
					// q.resolve(fileURL);
					q.resolve(file);
				})
				.error(function(err){
					q.reject(err);
				});
		return q.promise;
    };

	//To print pdf on new window/ Button_Click event.
	$scope.printDeliveryNotePdf = function(delivery_note, offsetLines, show_totals, share, invoice_number){
		
		if(utilService.isConfigurationOn(utilService.CONST_CONFIG_INTEGRATION_INVOICE))
			if(delivery_note.sync_status_id == 4100)
				if(!confirm("Do you want to print this invoice as it is still pending to sync to accounting system?"))
					return false

		const noteid = delivery_note.id;

		if ($scope.myform.$dirty && !confirm('You have unsaved changes. System will save the data and then print. Do you want to continue?')) {
			return;
		}

		if ($scope.myform.$dirty) {
			doUpdateDeliveryNote(delivery_note, doPrintDeliveryNote(noteid, offsetLines, show_totals, share, invoice_number));
		}
		else {
			doPrintDeliveryNote(noteid, offsetLines, show_totals, share, invoice_number);
		}

	};

	const doPrintDeliveryNote = function(noteid, offsetLines, show_totals, share, invoice_number){
		$scope.printOnce = true;
		$scope.getDeliveryNotePDF(noteid, offsetLines, show_totals).then(function(file){
			if(window.cordova)
			{
				let filename = (invoice_number && invoice_number != '') ? 'Invoice '+ invoice_number + '.pdf' : 'Invoice '+ noteid + '.pdf'
				utilService.downloadAndOpenInApp(filename, file, share);
			}
			else{
				openPrintWindow(file, "delivery_note.pdf", 5000);
			}
		},function(err){
			console.log('Error: ' + err);
		});		
	};

	$scope.cart_list = function() {

		var cartlist = [];
		var cart = getCartObjectFromLocalStorage(); //localStorage.getItem('cart')

		if (cart) {
			keys = Object.keys(cart);
	
			for (i = 0; i < keys.length; i++) {
				var customerCart = cart[keys[i]];
				if (!customerCart || customerCart.lineitems.length == 0) {
					delete cart[keys[i]];
				}
				else
					cartlist.push(customerCart);
			}
			localStorage.setItem('cart', JSON.stringify(cart));
			cartObj = getCartObjectFromLocalStorage(); //localStorage.getItem('cart');
		}

		$scope.itemlist = cartlist;

	};

	$scope.isPackingSlipCreateAllowed = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_PACKING_SLIP_CREATE) == '1');
	};

	$scope.clearCustomerCart = function (customerid, orderid) {
		if (confirm('Are you sure?')) {
			clearCart(customerid, orderid);
			$scope.cart_list();
		}
	};

	$scope.markOrderCompleted = function (order) {
		if (confirm('Are you sure?')) {
			$scope.isDisabled = true;
			orderService.updateOrderStatus("delivered", order, function(response){
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "Order status updated succesfully", type: "success"})
					$location.path("/orders/" );
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
					$scope.isDisabled = false;
				}
			});
		}
	};
	
	$scope.onSelectedStockBucket = function (item, model, label, event, lineitemobject, packingslipdetailobject) {
  		productService.getStockBatchById(item.id, function (response) {
  			if (response.statuscode == 0 && response.data && response.data.stockbucket) {
  				var stockbucket = response.data.stockbucket;
  				packingslipdetailobject.packed_qty_qty   = stockbucket.stock_qty;
  				packingslipdetailobject.packed_qty_quote = stockbucket.stock_quote;
  				packingslipdetailobject.stock_bucket_id = stockbucket.id;
  				packingslipdetailobject.stock_bucket_code = stockbucket.code;

  				var text = "";
  				var piece_count = 0;
  				for (i = 0; i < stockbucket.stock_bucket_detail.length; i++) {
  					text = text + (text != "" ? " + " +  stockbucket.stock_bucket_detail[i].qty : stockbucket.stock_bucket_detail[i].qty);
  					piece_count = piece_count + (stockbucket.stock_bucket_detail[i].qty > 0 ? 1 : 0);
  				}

//  				packingslipdetailobject.stock_bucket_detail_summary = text;
  				packingslipdetailobject.notes                       = text;
  				packingslipdetailobject.piece_count                 = piece_count;

  			}
  		});
 	};

	$scope.getBucketListViaPromise = function (term, enabledOnly, productid) {
	
		var options = {};
		options.search_text = term;
		options.enabled_only = (enabledOnly && enabledOnly == 1 ? 1 : 0);
		options.is_system = 0;

		return productService.getStockBatches(productid, options).then(
			function (response) {
				if (response.data.statuscode == 0 && response.data && response.data.data && response.data.data.stockbucketlist) {
					return response.data.data.stockbucketlist;
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
	
	$scope.convertEquationtoQtyAndPcs = function(notes, lineitem) {

		var pcs = 0;
		try {
			var val = $scope.$eval(notes);
			var pcsArr = notes.split('+');
			for (var i = 0; i < pcsArr.length; i++) {
				if (pcsArr[i] > 0) pcs++;
			}
			lineitem.packed_qty_qty = val;
			lineitem.piece_count    = pcs;
		}
		catch (err) {
			val = notes;
			pcs = 0;
		}

		return val;
		
//		console.log(str.match(/^(?=.*[0-9])[- + 0-9]+$/) > 0);

	};

	$scope.setPackingSlipSortParameters = function(sortby) {
		if ($scope.sortBy == sortby) {
			$scope.sortDirection = $scope.sortDirection * -1;
		 }
		 else {
			$scope.sortBy = sortby;
			$scope.sortDirection = 1;
		}
	}

	$scope.search_packingslips = function () {


		var options = {};

		var custobj = masterService.getCustomer('customer_filter');
		if (custobj) {

			if (!$scope.search_section) 
				$scope.search_section = {};

			$scope.search_section.customer =  custobj;
			options.customerid = custobj.id;
		}

		if (!custobj && $scope.isUserACustomer()) {
			var user = utilService.getUser();
			if (user) {
				var customerid =  user.company_id;
				$scope.customer = customerid;
				getCustomerById(customerid, function (customer) {
					$scope.search_section.customer = customer;
				});
			}
		}

		options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
		options.fromdate   = ($scope.search_section && $scope.search_section.fromdate ? $scope.search_section.fromdate : undefined);
		options.todate     = ($scope.search_section && $scope.search_section.todate ? $scope.search_section.todate : undefined);
		options.agentid = ($scope.search_section && $scope.search_section.agent ? $scope.search_section.agent.id : undefined);
		options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
		options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
		options.productid  = ($scope.search_section && $scope.search_section.product ? $scope.search_section.product.id : undefined);
		//options.custom_filter_id = ($scope.search_section && $scope.search_section.custom_filter_id ? $scope.search_section.custom_filter_id : undefined);
		options.from_page  = ($scope.search_section && $scope.search_section.from_page ? $scope.search_section.from_page : undefined);
		options.custom_filter_name = ($scope.search_section && $scope.search_section.custom_filter_name ? $scope.search_section.custom_filter_name : undefined);
		options.custom_filter_show_in_dashboard  = ($scope.search_section && $scope.search_section.custom_filter_show_in_dashboard ? $scope.search_section.custom_filter_show_in_dashboard : undefined);
		options.gate_pass_number  = ($scope.search_section && $scope.search_section.gate_pass_number ? $scope.search_section.gate_pass_number : undefined);

		// options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
		// options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

		var name = $scope.search_section.custom_filter_name;
		if(name)
		{
			$scope.saveFilter(options, utilService.CONST_DOCUMENT_TYPE_PACKING_SLIPS);
		}


		options = initPageNumberFilters(options);

		options.sortby = $scope.sortBy;
		options.sortdirection = $scope.sortDirection;

		utilService.setPackingslipFilters(options);

		options.show_detail_if_single_record = true;

		$scope.getPackingSlips(options);

	};

	$scope.getPackingSlips = function(options) {

//		setSearchCriteriaToQueryString();

		$scope.getCustomFilters(utilService.CONST_DOCUMENT_TYPE_PACKING_SLIPS)

	 	if (!options) options = utilService.getPackingslipFilters();

	 	prepopulatePackingslipFilters(options);

	 	if (!$scope.currentPage) $scope.currentPage = 1;

		orderService.getPackingslips(options, $scope.currentPage, $scope.itemsPerPage, function(response){
			if (response.statuscode == 0 && response.data && response.data.packingsliplist) {

				// if there is only one record found, go to detail page directly to save one click
				if (options.show_detail_if_single_record && response.data.packingsliplist.length == 1) {
					$scope.showPackingSlipDetail(response.data.packingsliplist[0].id);

					//clear the filters else back button will keep bringing to the detail page
					options = {};
					utilService.setPackingslipFilters(options);
					return;
				}

				$scope.packingsliplist = response.data.packingsliplist;
				if ($scope.packingsliplist[0])
					$scope.totalrecords = utilService.getTotalRecords($scope.packingsliplist);
				else
					$scope.totalrecords = 0;
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
			else {
				$scope.orderlist = [];
			}
		});

	};

	$scope.exportPackingSlipsToExcel = function() {

		var options = {};

		var custobj = masterService.getCustomer('customer_filter');
		if (custobj) {

			if (!$scope.search_section) 
				$scope.search_section = {};

			$scope.search_section.customer =  custobj;
			options.customerid = custobj.id;
		}

		if (!custobj && $scope.isUserACustomer()) {
			var user = utilService.getUser();
			if (user) {
				var customerid =  user.company_id;
				$scope.customer = customerid;
				getCustomerById(customerid, function (customer) {
					$scope.search_section.customer = customer;
				});
			}
		}

		options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
		options.fromdate   = ($scope.search_section && $scope.search_section.fromdate ? $scope.search_section.fromdate : undefined);
		options.todate     = ($scope.search_section && $scope.search_section.todate ? $scope.search_section.todate : undefined);
		options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
		options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
		options.productid  = ($scope.search_section && $scope.search_section.product ? $scope.search_section.product.id : undefined);
		options.format = "excel";
		options.sortby = $scope.sortBy;
		options.sortdirection = $scope.sortDirection;

		orderService.getPackingslips(options, 1, utilService.CONST_DEFAULT_EXPORT_PAGE_SIZE, function(response){
			if (response.statuscode == 0) {

				var anchor = angular.element('<a/>');
				var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
				anchor.attr({
					href: window.URL.createObjectURL(blob),
					target: '_blank',
					download: 'packingslips.xlsx'
				})[0].click();


			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
		});
	}


	$scope.getPackingSlipById = function(){

		getPackingslipById($routeParams.id, function (response)	{
		
			if (response.statuscode == 0 && response.data && response.data.packingslip) 
			{ 			
				$scope.packingslip     = response.data.packingslip;
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			} 
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
		});

	};

	
	
	var getPackingslipById = function (id, callback) {

		orderService.findPackingslipById(id, function(response){
			callback(response);
		});

	};

	var getPackingSlipDetail = function (id, callback) {
		orderService.getPackingSlipDetail(id, function(response){
			callback(response);
		});
	}

	$scope.canApproveOrder = function(order){

		// if edit mode is ON (editing is going on) OR is checkout ON (means order is modified), hide the button
//		if ($scope.edit_mode || $scope.is_checkout_on) return false;
		if ($scope.edit_mode || ($scope.order.is_dirty || false)) return false;

		if(order.id > 0)
		{
			if(order.sysorderstatuses_id == ORDER_STATUS_PENDING_WF)
			{
				// If user's role is the role of Order's approver then show Approve button.
				if(order.pending_approval_rolesid == utilService.getUserInfo("role_id") || utilService.getUserInfo("sys_role_id") == USER_TYPE_ADMINISTRATOR)
				{
					return true;
				}
			}
		}
		return false;
	};

	$scope.isReasonBecauseOfCreditDays = function(order){

		if((utilService.getPermission(utilService.CONST_PERMISSION_BILL_VIEW) == "1") &&
			(utilService.isPendingApprovalReasonCreditDays(order.workflow_reason_string)))
			return true;
		return false;
	};

	$scope.isReasonBecauseOfCreditLimit = function(order){

		if((utilService.getPermission(utilService.CONST_PERMISSION_BILL_VIEW) == "1") &&
			(utilService.isPendingApprovalReasonCreditLimit(order.workflow_reason_string)))
			return true;
		return false;
	};

	$scope.canEndorseOrder = function(order){

		// if edit mode is ON (editing is going on) OR is checkout ON (means order is modified), hide the button
		if ($scope.edit_mode || ($scope.order.is_dirty || false)) return false;

		if(order.id > 0)
		{
			if(order.sysorderstatuses_id == ORDER_STATUS_PENDING_WF)
			{
				// If user's role is the role of Order's approver then show Approve button.
				if(order.pending_approval_rolesid == utilService.getUserInfo("role_id") && utilService.getUserInfo("sys_role_id") != USER_TYPE_ADMINISTRATOR)
				{
					return true;
				}
			}
		}
		return false;
	};

	$scope.showHeaderButtonDropdown = function(){
		let noOfChilderen = 0;
		if(document.getElementById('primaryHeaderButtonDiv')) {
			noOfChilderen = document.getElementById('primaryHeaderButtonDiv').childElementCount
		}
		return noOfChilderen;

	}
	$scope.canPrepareOrder = function (order) {

		// if edit mode is ON (editing is going on) OR is checkout ON (means order is modified), hide the button
		if ($scope.edit_mode || ($scope.order.is_dirty || false)) return false;

		return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PACKING_SLIP) == '1' && order.sysorderstatuses_id == ORDER_STATUS_IN_PACKING && $scope.isPackingSlipCreateAllowed());
	};

	$scope.canMarkOrderCompleted = function (order) {

		// if edit mode is ON (editing is going on) OR is checkout ON (means order is modified), hide the button
		if ($scope.edit_mode || ($scope.order.is_dirty || false)) return false;

		var packing_slip_list = [];
		var i;
		if (order.packing_slips)
			for (i = 0; i < order.packing_slips.length; i++)
				if (order.packing_slips[i].status_id != 5203)
					packing_slip_list.push(order.packing_slips[i]);

		return (order.sysorderstatuses_id == ORDER_STATUS_IN_PACKING && packing_slip_list.length > 0 && $scope.isPackingSlipCreateAllowed());
	};

	$scope.canCancelOrder = function (order) {

		if ($scope.edit_mode) return false;

		var packing_slip_list = [];
		var i;
		if (order.packing_slips)
			for (i = 0; i < order.packing_slips.length; i++)
				if (order.packing_slips[i].status_id != utilService.CONST_STATUS_PACKING_SLIP_CANCELLED)
					packing_slip_list.push(order.packing_slips[i]);

		var user = utilService.getUser();
		return ((order.sysorderstatuses_id == ORDER_STATUS_IN_PACKING || order.sysorderstatuses_id == ORDER_STATUS_PENDING_WF) && packing_slip_list.length == 0  && (isCancelOrderAllowed() || order.orderusers_id == user.id));
	};

	$scope.canCancelPackingslip = function (packingslip) {
		return (packingslip && packingslip.status_id == utilService.CONST_STATUS_PACKING_SLIP_PENDING_INVOICE && isCancelPackingslipAllowed());
	};

	$scope.approveOrder = function(order){
		$scope.isDisabled = true;		
		orderService.updateOrderStatus("approve",order,function(response){
			if(response.statuscode == 0)
			{
				flash.pop({title: "", body: "Order approved succesfully", type: "success"})
				if((order.workflow_reason_string.includes("Balance")) && (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_APPROVAL_CREDIT_LIMIT) == '1'))
				{	
					masterService.getCustomerById(order.customer.id, function(response) {
						if(response.statuscode == 0)
						{
							let allowed_balance = response.data.customer.allowed_balance;
							let current_balance = response.data.customer.current_balance;
							let order_total = order.sub_total + (order.ship_total ? order.ship_total : 0) + (order.tax_total ? order.tax_total : 0) - (order.discount_total ? order.discount_total : 0);
							if(current_balance + order_total > allowed_balance) {
								if(confirm("Do you want to increase credit limit?")) {
									$location.url("/AddCustomer/" + order.customer.id +"?redirect=/orders");
								}
							}
							else
								$scope.search_orders();
						}
						else
							$scope.search_orders();
					});
				}				
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			} 
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
			$scope.isDisabled = false;
		});	
	};
	
	$scope.rejectOrder = function(order){
		$scope.isDisabled = true;
		orderService.updateOrderStatus("reject",order,function(response){
			if(response.statuscode == 0)
			{
				flash.pop({title: "", body: "Order rejected succesfully", type: "success"})
				$scope.search_orders();
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			} 
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
			$scope.isDisabled = false;
		});	
	};

	$scope.endorseOrder = function(order){
		$scope.isDisabled = true;
		orderService.updateOrderStatus("endorse",order,function(response){
			if(response.statuscode == 0){
				flash.pop({title: "", body: "Order endorsed succesfully", type: "success"})
				$location.path("/orders/" );
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			} 
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
			$scope.isDisabled = false;
		});	
	};

	$scope.cancelOrder = function(order){
		var msg = 'Are you sure you want to cancel the order?';

		if (order.is_dirty) 
			msg = 'Your order is unsaved. Are you sure you want to cancel the order?';

		if (confirm(msg)) {
			$scope.isDisabled = true;
			orderService.updateOrderStatus("cancel", order, function(response){
				if(response.statuscode == 0){
					flash.pop({title: "", body: "Order cancelled succesfully", type: "success"})
					$location.path("/orders/" );
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
				$scope.isDisabled = false;
			});
		}
	};

	$scope.cancelPackingslip = function(packingslip){
		if (confirm('Are you sure you want to cancel the packing slip?')) {
			$scope.isDisabled = true;
			orderService.cancelPackingslip(packingslip, function(response){
				if(response.statuscode == 0)
				{
					flash.pop({title: "", body: "Packingslip cancelled succesfully", type: "success"})
					$location.path("/EditOrder" + "/" + packingslip.order_id );
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
				$scope.isDisabled = false;
			});
		}
	};

	$scope.cancelDeliveryNote = function(deliverynote){
		if (confirm('Are you sure you want to cancel the delivery note?')) {
			$scope.isDisabled = true;
			orderService.cancelDeliveryNote(deliverynote.id, function(response){
				if(response.statuscode == 0){
					flash.pop({title: "", body: "Delivery note cancelled succesfully", type: "success"})
					$location.path("/deliverynotes/" );
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
				$scope.isDisabled = false;
			});
		}
	};

 	$scope.showAddDeliveryNote = function () {
		$location.path("/deliverynotes/");
	};

	var isCancelOrderAllowed = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_ORDER_CANCEL) == '1');
	};
 
	var isCancelPackingslipAllowed = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_PACKING_SLIP_CANCEL) == '1');
	};

	$scope.canCancelDeliveryNote = function (deliverynote) {
		return (deliverynote && (deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_LR || deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH || deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_DELIVERED) && isCancelDeliveryNoteAllowed());
	};
	
	$scope.canCompleteDeliveryNote = function (deliverynote) {
		if (!deliverynote) return;
		let list = deliverynote.packingsliplist.filter(packingslip => (packingslip.gross_weight == "" || packingslip.gross_weight <= 0));
		return (list.length == 0 && deliverynote.invoice_number != ""  && deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_DELIVERED && ($scope.isDeliveryNoteCreatePermissionExists() || $scope.isDeliveryNoteUpdatePermissionExists()));
	}

	var isCancelDeliveryNoteAllowed = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_CANCEL) == '1');
	};

	$scope.isDeliveryNoteCreateAllowed = function(packingslip) {
		if (packingslip)
			return (packingslip.status_id == utilService.CONST_STATUS_PACKING_SLIP_PENDING_INVOICE && $scope.isDeliveryNoteCreatePermissionExists());
		else
			return false;
	};

	$scope.isDeliveryNoteUpdateAllowed = function(deliverynote) {
		return (deliverynote && ($scope.isDeliveryNoteEditPermissionAfterCompleteExists() || (deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_LR || deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_DELIVERED)) && $scope.isDeliveryNoteUpdatePermissionExists());
	};

	$scope.isViewOnlyDeliveryNote = function (deliverynote) {
		return (deliverynote != undefined && ( (deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_COMPLETED && !$scope.isDeliveryNoteEditPermissionAfterCompleteExists()) || deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_CANCELLED));
	};

	$scope.isDeliveryNoteCreatePermissionExists = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_CREATE) == '1');
	};

	$scope.isGatePassCreatePermissionExists = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_GATEPASS_CREATE) == '1');
	};

	$scope.isGatePassViewPermissionExists = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_GATEPASS_VIEW) == '1');
	};

	$scope.isDeliveryNoteViewPermissionExists = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_VIEW) == '1');
	};

	$scope.isPackingSlipViewPermissionExists = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_PACKING_SLIP_VIEW) == '1');
	};

	$scope.isDeliveryNoteEditPermissionAfterCompleteExists = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_EDIT_COMPLETE) == '1');
	};
	
	$scope.isDeliveryNoteUpdatePermissionExists = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_UPDATE) == '1');
	};

	$scope.isDeliveryNoteDatePermissionExists = function() {
		return (utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_DATE_EDIT) == '1');
	};

	$scope.isDeliveryNoteInDispatchStatus = function (deliverynote) {
		return (deliverynote != undefined && (deliverynote.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH));
	};

	$scope.showDeliveryNotePageForPackingSlip = function (id) {

		$location.path("/AddDeliveryNote/" + "packingslip/" + id );
	
	};
	
	$scope.showDeliveryNoteDetail = function(del_note) {
		if ($scope.isDeliveryNoteViewPermissionExists() && del_note.direct_invoice_flag && del_note.direct_invoice_flag == 1)
			$location.path("/AddDirectInvoice/" + del_note.id );
		else if ($scope.isDeliveryNoteViewPermissionExists())	
			$location.path("/deliverynotes/" + del_note.id );
	};

	$scope.invokeDeliveryNoteDetail = function(deliverynoteid) {
		if ($scope.isDeliveryNoteViewPermissionExists())	
			$location.path("/deliverynotes/" + deliverynoteid );
	};

	$scope.setDeliveryNoteSortParameters = function(sortby) {
		if ($scope.sortBy == sortby) {
			$scope.sortDirection = $scope.sortDirection * -1;
		 }
		 else {
			$scope.sortBy = sortby;
			$scope.sortDirection = 1;
		 }
	}

	$scope.search_deliverynotes = function () {

		var options = {};

		var custobj = masterService.getCustomer('customer_filter');
		if (custobj) {

			if (!$scope.search_section) 
				$scope.search_section = {};

			$scope.search_section.customer =  custobj;
			options.customerid = custobj.id;
		}

		if (!custobj && $scope.isUserACustomer()) {
			var user = utilService.getUser();
			if (user) {
				var customerid =  user.company_id;
				$scope.customer = customerid;
				getCustomerById(customerid, function (customer) {
					$scope.search_section.customer = customer;
				});
			}
		}

		options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
		options.fromdate   = ($scope.search_section && $scope.search_section.fromdate ? $scope.search_section.fromdate : undefined);
		options.todate     = ($scope.search_section && $scope.search_section.todate ? $scope.search_section.todate : undefined);
		options.agentid = ($scope.search_section && $scope.search_section.agent ? $scope.search_section.agent.id : undefined);
		options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
		options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
		options.invoice_number = ($scope.search_section && $scope.search_section.invoice_number ? $scope.search_section.invoice_number : undefined);
		options.lr_number = ($scope.search_section && $scope.search_section.lr_number ? $scope.search_section.lr_number : undefined);
		options.productid  = ($scope.search_section && $scope.search_section.product ? $scope.search_section.product.id : undefined);
		//options.custom_filter_id = ($scope.search_section && $scope.search_section.custom_filter_id ? $scope.search_section.custom_filter_id : undefined);
		options.from_page  = ($scope.search_section && $scope.search_section.from_page ? $scope.search_section.from_page : undefined);
		options.custom_filter_name = ($scope.search_section && $scope.search_section.custom_filter_name ? $scope.search_section.custom_filter_name : undefined);
		options.custom_filter_show_in_dashboard  = ($scope.search_section && $scope.search_section.custom_filter_show_in_dashboard ? $scope.search_section.custom_filter_show_in_dashboard : undefined);
	//	

		var name = $scope.search_section.custom_filter_name;
		if(name)
		{
			$scope.saveFilter(options, utilService.CONST_DOCUMENT_TYPE_DELIVERY_NOTES);
		}
		options.gate_pass_number  = ($scope.search_section && $scope.search_section.gate_pass_number ? $scope.search_section.gate_pass_number : undefined);

		options = initPageNumberFilters(options);

		options.sortby = $scope.sortBy;
		options.sortdirection = $scope.sortDirection;

		utilService.setDeliveryNoteFilters(options);

		options.show_detail_if_single_record = true;

		$scope.getDeliveryNotes(options);

	};

	$scope.getDateFormat = function(timestamp) {
	    return new Date(timestamp);
	  }

	$scope.getDeliveryNotes = function(options) {

		$scope.getCustomFilters(utilService.CONST_DOCUMENT_TYPE_DELIVERY_NOTES);

	 	if (!options) options = utilService.getDeliveryNoteFilters();

	 	if (!$scope.currentPage) $scope.currentPage = 1;

	 	prepopulateDeliveryNoteFilters(options);

		orderService.getDeliveryNotes(options, $scope.currentPage, $scope.itemsPerPage, function(response){
			if (response.statuscode == 0 && response.data && response.data.deliverynotelist) {

				// if there is only one record found, go to delivery note detail page directly to save one click
				if (options.show_detail_if_single_record && response.data.deliverynotelist.length == 1) {
					$scope.showDeliveryNoteDetail(response.data.deliverynotelist[0]);

					//clear the filters else back button will keep bringing to the detail page
					options = {};
					utilService.setDeliveryNoteFilters(options);
					return;
				}

				$scope.deliverynotelist = response.data.deliverynotelist;
				if ($scope.deliverynotelist[0])
					$scope.totalrecords = utilService.getTotalRecords($scope.deliverynotelist);
				else
					$scope.totalrecords = 0;
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
			else {
				$scope.orderlist = [];
			}
		});

	};

	$scope.exportDeliveryNotesToExcel = function(options) {

	 	var options = {};

		var custobj = masterService.getCustomer('customer_filter');
		if (custobj) {

			if (!$scope.search_section) 
				$scope.search_section = {};

			$scope.search_section.customer =  custobj;
			options.customerid = custobj.id;
		}

		if (!custobj && $scope.isUserACustomer()) {
			var user = utilService.getUser();
			if (user) {
				var customerid =  user.company_id;
				$scope.customer = customerid;
				getCustomerById(customerid, function (customer) {
					$scope.search_section.customer = customer;
				});
			}
		}

		options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
		options.fromdate   = ($scope.search_section && $scope.search_section.fromdate ? $scope.search_section.fromdate : undefined);
		options.todate     = ($scope.search_section && $scope.search_section.todate ? $scope.search_section.todate : undefined);
		options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
		options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
		options.invoice_number = ($scope.search_section && $scope.search_section.invoice_number ? $scope.search_section.invoice_number : undefined);
		options.lr_number = ($scope.search_section && $scope.search_section.lr_number ? $scope.search_section.lr_number : undefined);
		options.productid  = ($scope.search_section && $scope.search_section.product ? $scope.search_section.product.id : undefined);
		options.sortby = $scope.sortBy;
		options.sortdirection = $scope.sortDirection;

	 	options.format ="excel";
		orderService.getDeliveryNotes(options, 1, utilService.CONST_DEFAULT_EXPORT_PAGE_SIZE, function(response){
			if (response.statuscode == 0) {
				var anchor = angular.element('<a/>');
				var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
				anchor.attr({
					href: window.URL.createObjectURL(blob),
					target: '_blank',
					download: 'deliverynotes.xlsx'
				})[0].click();
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
		});

	};

	$scope.completeDeliveryNote = function(deliverynote){

		if (!deliverynote.invoice_number || deliverynote.invoice_number == "") {
			alert('Invoice number is required to mark it complete.');
			return false;
		}

		for (i =0; i < deliverynote.packingsliplist.length; i++) {
			if (deliverynote.packingsliplist[i].gross_weight == "" || deliverynote.packingsliplist[i].gross_weight <= 0) {
				alert('Gross weight is mandatory before completing delivery note.');
				return false;
			}
		}

		if (confirm('Are you sure you want to complete the delivery note?')) {
			$scope.isDisabled = true;
			if ($scope.myform.$dirty) {
				$scope.updateDeliveryNote(deliverynote, function (deliverynote) {
					completeDeliveryNote(deliverynote);
				});
			}
			else
				completeDeliveryNote(deliverynote);
		}

	};
	
	var completeDeliveryNote = function (deliverynote) {
		orderService.completeDeliveryNote(deliverynote.id, function(response){
			if(response.statuscode == 0){
				flash.pop({title: "", body: "Delivery note completed succesfully", type: "success"});
				$location.path("/deliverynotes/" );
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			} 
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
		});
	};

	var initDeliveryNote = function () {
		var obj = {};
		obj.id = -1;
		obj.invoice_type 		= "1";
		obj.note_number         = "";
		obj.note_date           = "";
		obj.user                = undefined;
		obj.customer            = undefined;
		obj.status_id           = "";
		obj.status_name         = "";
		obj.transporter         = undefined;
		obj.lr_number           = "";
		obj.lr_date             = "";
		obj.invoice_number      = "";
		obj.packingsliplist     = [];
		obj.einvoice_info           = {};
		obj.einvoice_info.transport_mode = "1";
		obj.einvoice_info.vehicle_type = "R";
		obj.einvoice_info.transaction_type = "1";
		obj.einvoice_info.vehicle_number = "";
		obj.einvoice_info.is_generate = 1;
		obj.einvoice_info.qr_string = "";
		obj.einvoice_info.irn_number = "";
		obj.sub_total = 0; 
		obj.ship_total = 0;
		obj.tax_total = 0;
		obj.discount_total = 0;
		obj.rounding_total = 0;
		return obj;
	};

	$scope.add_direct_invoice = function() { 

		var deliveryNote = initDeliveryNote();
		deliveryNote.lineitems = [];
		deliveryNote.lineitems.push({"id":0});
		$scope.delivery_note = deliveryNote;
		deliveryNote.note_date = new Date(); 
		$scope.edit_mode = true;
		$scope.delivery_note_number_edit_flag = false;
		$scope.delivery_note.direct_invoice_flag = 1;
		masterService.getAgents({}, function(response){
			if(response.statuscode == 0)
				$scope.agentlist = response.data.agentlist;
		});
		
 	}

 	$scope.addDirectInvoiceLineItem = function() {
 		$scope.delivery_note.lineitems.push({"id":0});
 	}

 	$scope.removeDirectInvoiceLineItem = function(index) {
 		if($scope.delivery_note.lineitems.length == 1)
 			flash.pop({title: "", body: "Atleast one lineitem should be added", type: "error"});
 		else {
 			$scope.delivery_note.lineitems.splice(index, 1);	
 			$scope.calculateDirectInvoiceTotals();
 		}
 	}

 	$scope.setShipAddressPanel = function(flag) {
		$scope.showShipAddressPanel = (flag);
 	};

 	$scope.clearDeliveryNoteAddress = function(delivery_note, clearAllFlag) {
 		delivery_note.ship_address.id = "";
 		if (clearAllFlag) {
	 		delivery_note.ship_address.name = "";
	 		delivery_note.ship_address.first_name = "";
	 		delivery_note.ship_address.last_name = "";
	 		delivery_note.ship_address.address1 = "";
	 		delivery_note.ship_address.address2 = "";
	 		delivery_note.ship_address.address3 = "";
	 		delivery_note.ship_address.city = "";
	 		delivery_note.ship_address.state = "";
	 		delivery_note.ship_address.zip = "";
	 		delivery_note.ship_address.phone1 = "";
	 		delivery_note.ship_address.phone2 = "";
	 		delivery_note.ship_address.email1 = "";
	 		delivery_note.ship_address.email2 = "";  			
 		}
 	};

	$scope.add_delivery_note = function(){
 
		var deliveryNote = initDeliveryNote();
		$scope.delivery_note = deliveryNote;
		$scope.today_date = new Date();
		deliveryNote.note_date = new Date(); 
		$scope.state_list = utilService.getStates();

		$scope.delivery_note_number_edit_flag = $scope.isDeliveryNoteNumberRequired();
 
		if ($routeParams.customerid) {

			getCustomerById($routeParams.customerid, function (vxCustomer) {

				if (vxCustomer) {
					deliveryNote.customer     = vxCustomer;
					deliveryNote.destination  = vxCustomer.ship_address.city;
					deliveryNote.ship_address = vxCustomer.ship_address;
					deliveryNote.transporter  = vxCustomer.transporter;
				}

				var options = {};

				options.statusid   = utilService.CONST_STATUS_PACKING_SLIP_PENDING_INVOICE;
				options.customerid = $routeParams.customerid;

				orderService.getPackingslips(options, 1, 200000, function(response){
					if (response.statuscode == 0 && response.data && response.data.packingsliplist) {
						deliveryNote.packingsliplist = response.data.packingsliplist;
						fillOrderInfo(deliveryNote.packingsliplist);
						masterService.getTransporters (1, function (response) {
							if (response.statuscode == 0 && response.data && response.data.transporterlist) {
								$scope.transporterlist = response.data.transporterlist;
							}
						});
					}
					else {
						flash.pop({title: "", body: response.message, type: "error"});
					}
				});
			});
		}

		if ($routeParams.packingslipid) {

			getPackingslipById($routeParams.packingslipid, function (response) {
				if (response.statuscode == 0 && response.data && response.data.packingslip) 
				{ 			
					$scope.expandAll = true;
					$scope.selectAll = 0;
					var packingslip  = response.data.packingslip;
				
					$scope.packingslipid = $routeParams.packingslipid;

					var options = {};

					options.statusid   = utilService.CONST_STATUS_PACKING_SLIP_PENDING_INVOICE;
					options.customerid = packingslip.order.customers_id;

					getCustomerById(options.customerid, function (vxCustomer){
						deliveryNote.customer     = vxCustomer;
						deliveryNote.destination  = vxCustomer.ship_address.city;
						deliveryNote.ship_address = vxCustomer.ship_address;
						deliveryNote.tax_type_id  = vxCustomer.taxform_flag;
						deliveryNote.transporter  = vxCustomer.transporter;
						deliveryNote.state = vxCustomer.ship_address.state;
					});

					orderService.getPackingslips(options, 1, 200000, function(response){
							if (response.statuscode == 0 && response.data && response.data.packingsliplist) {
								deliveryNote.packingsliplist = response.data.packingsliplist;
								deliveryNote.packingsliplist.forEach(element => {
									$scope.expandPackingSlipDetails(element.id);
								});
								fillOrderInfo(deliveryNote.packingsliplist);
								masterService.getTransporters (1, function (response) {
									if (response.statuscode == 0 && response.data && response.data.transporterlist) {
										$scope.transporterlist = response.data.transporterlist;
										$scope.calculateDeliveryNoteTotals(true);
									}
								});
							}
							else {
								flash.pop({title: "", body: response.message, type: "error"});
							}
					});

				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});
		}

	};

	$scope.getTempos = function(){
		masterService.getTempos(function(response){
			$scope.tempolist = response.data.tempolist;
			if($scope.tempolist && $scope.tempolist.length > 0)
			{
				$scope.tempoSelected = $scope.tempolist[0];
				$scope.selectTempo($scope.tempoSelected);
			}
		});
	}


	 $scope.saveTempo = function(){
	 	masterService.createTempo($scope.tempo.name, $scope.tempo.driver_name, $scope.tempo.vehicle_number, function(response){
	 		if (response.statuscode == 0 && response.data.tempo) {
	 			flash.pop({title: "", body: "Tempo created succesfully", type: "success"});
				
			}
			else if (response.statuscode === -100)  {
				
			}
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
	 	})
	 }

	 $scope.showTempo = function() {

		utilService.showCustomerDialog("add_tempo.html", "TempoModalDialogController", {}, function(result) {
			if (result == "OK") {
				$scope.getTempos();
			}
			else {
				return;
			}
		});
	 };

	 $scope.selectTempo = function(tempo){
	 	$scope.gatepass.vehicle_number = tempo.vehicle_number;
	 	$scope.gatepass.contact_name = tempo.driver_name;
		$scope.gatepass.company_name = tempo.name;
	 }

	$scope.add_gate_pass = function() {

		fillGatePass();
		$scope.getTempos();
		$scope.currentPage	= ($scope.currentPage ? $scope.currentPage : 1);
		$scope.getPendingDispatchedDeliveryNotes($scope.currentPage);
		
	}

	$scope.getPendingDispatchedDeliveryNotes = function(pageNumber) {

		var options = {};
		options.statusid   = utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH;
		orderService.getDeliveryNotes(options, pageNumber, $scope.itemsPerPage, function(response){
			if (response.statuscode == 0 && response.data && response.data.deliverynotelist) {				
				if(!$scope.deliverynotelist)
				{
					$scope.deliverynotelist = [];
					$scope.deliverynotelist = response.data.deliverynotelist;
				}
				else
				{
					$scope.deliverynotelist = [];
					for (var i = 0; i < response.data.deliverynotelist.length; i++) {
						let delivery_note = response.data.deliverynotelist[i];
						var filteredDeliveryNote = $scope.gatepass.delivery_note_details.filter(x=>x.id == delivery_note.id)[0];
						if(filteredDeliveryNote)
							$scope.deliverynotelist.push(filteredDeliveryNote);
						else
							$scope.deliverynotelist.push(delivery_note);
					}
				}
				if ($scope.deliverynotelist[0])
					$scope.totalrecords = utilService.getTotalRecords($scope.deliverynotelist);
				else
					$scope.totalrecords = 0;
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
			else {
				$scope.orderlist = [];
			}
		});
		
	}


	$scope.edit_gate_pass = function() {

		//$scope.getTempos();
		orderService.findGatePassById($routeParams.id, function(response){
			if (response.statuscode == 0 && response.data && response.data.gatepass) {
				$scope.gatepass = response.data.gatepass
				$scope.gatepass.gate_pass_date = utilService.convertToServerTimeZone(response.data.gatepass.gate_pass_date);
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}

		});
		
	}

	$scope.expand = function(x) {
		var del_note = $scope.deliverynotelist.filter(y=>y.id == x.id)[0]
		if(del_note.expanded)
			del_note.expanded = false;
		else
			del_note.expanded = true;
		if(!del_note.packing_slips)
		{
			orderService.findDeliveryNoteById(x.id, function(response){
				del_note.packing_slips = response.data.deliverynote.packingsliplist;
			});
		}
	}

	$scope.onChangeShipAddressState = function(del_note) {
		if(del_note.id > 0)
		{
			if(del_note.ship_address.state != del_note.customer.ship_address.state)
				del_note.einvoice_info.transaction_type = 2;
		}
		else {
			if(del_note.ship_address.state != del_note.state)
				del_note.einvoice_info.transaction_type = 2;
		}
	}

	$scope.selectAllDeliveryNotes = function() {
		if(!$scope.checkAllDeliveryNotes)
			$scope.checkAllDeliveryNotes = true;
		else
			$scope.checkAllDeliveryNotes = !$scope.checkAllDeliveryNotes;

		$scope.deliverynotelist.forEach(element => {
			element.checked = $scope.checkAllDeliveryNotes;
		});

	}

	$scope.downloadAllEwayBills = function() {
		delivery_note_ids = [];

		// Non local transporters, must have GSTIN
		emptyIDLen = $scope.deliverynotelist.filter(x=>x.checked && (x.transporter.name != "LOCAL" 
														&& (x.transporter.external_code == null || x.transporter.external_code.trim() == ''))).length;
		if(emptyIDLen > 0) {
			if (!confirm("One of your invoices have empty GSTIN for the transporter. Do you want to continue?"))
				return;
		}

		// Local transporters, must have vehicle number
		emptyIDLen = $scope.deliverynotelist.filter(x=>x.checked && (x.transporter.name == "LOCAL" 
														&& (x.einvoice_info.vehicle_number == null || x.einvoice_info.vehicle_number.trim() == ''))).length;
		if(emptyIDLen > 0) {
			if (!confirm("One of your invoices have empty vehicle_number's for the Local transporters. Do you want to continue?"))
				return;
		}

		delivery_note_ids = $scope.deliverynotelist.filter(function(x) {
			if(x.checked == true && ((x.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_DELIVERED) 
										|| (x.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH)))
				return x;
		}).map(function(obj) {return obj.id; });

		if(delivery_note_ids.length == 0)
			flash.pop({title: "", body: "Select atleast one deliverynote in delivered status", type: "error"});
		else {
			orderService.getEwayBills(delivery_note_ids, function(response) {
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
					alert("Something went wrong, please try agains");
				}
			})
		}
	}

	$scope.downloadEwayBill = function(x) {
		
		// Non local transporters, must have GSTIN
		emptyIDLen =  (x.transporter.external_code == null || x.transporter.external_code.trim() == '');
		if(emptyIDLen) {
			if (!confirm("This invoice have empty GSTIN for the transporter. Do you want to continue?"))
				return;
		}

		// Local transporters, must have vehicle number
		emptyIDLen = (x.einvoice_info.vehicle_number == null || x.einvoice_info.vehicle_number.trim() == '');
		if(emptyIDLen) {
			if (!confirm("This invoice has empty vehicle_number for the Local transporter. Do you want to continue?"))
				return;
		}

		delivery_note_ids = [x.id];		
		orderService.getEwayBills(delivery_note_ids, function(response) {
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
				alert("Something went wrong, please try agains");
			}
		})		
	}

	$scope.selectAllPackingSlips = function(x) {
		var del_note = $scope.deliverynotelist.filter(y=>y.id == x.id)[0]
		x.tempo_charges = x.tempo_charges == undefined ? 0 : x.tempo_charges;
		if(!del_note.packing_slips)
		{
			orderService.findDeliveryNoteById(x.id, function(response){
				del_note.packing_slips = response.data.deliverynote.packingsliplist;
				if(x.checked)
				{
					del_note.checked = true;
					$scope.gatepass.delivery_note_details.push(del_note);
					del_note.packing_slips.forEach(element => {
						element.checked = true;
						element.tempo_charges = element.tempo_charges == undefined ? 0 : element.tempo_charges;
						element.tempo_charges = x.tempo_charges;
						$scope.selectPackingSlip(del_note, element);
					});

				}
				else {
					del_note.checked = false;
					var index = $scope.gatepass.delivery_note_details.indexOf(del_note);
					$scope.gatepass.delivery_note_details.splice(index, 1);
					del_note.tempo_charges = 0;
					del_note.packing_slips.forEach(element => {
						element.checked = false;
						element.tempo_charges = 0;
						$scope.selectPackingSlip(del_note, element);
					});
				}
			});
		}
		else{

			if(x.checked)
			{
				del_note.checked = true;
				$scope.gatepass.delivery_note_details.push(del_note);
				del_note.packing_slips.forEach(element => {
					element.checked = true;
					element.tempo_charges = element.tempo_charges == undefined ? 0 : element.tempo_charges;
					element.tempo_charges = x.tempo_charges;
					$scope.selectPackingSlip(del_note, element);
				});
			}
			else {
				del_note.checked = false;
				var index = $scope.gatepass.delivery_note_details.indexOf(del_note);
				$scope.gatepass.delivery_note_details.splice(index, 1);
				del_note.packing_slips.forEach(element => {
					element.checked = false;
					element.tempo_charges = 0;
					$scope.selectPackingSlip(del_note, element);
				});
			}
		}

	}

	$scope.resetCharge = function()
	{
		if(!($scope.gatepass.is_total_charge == "1"))
		{
			$scope.gatepass.charges = 0;
			$scope.gatepass.gate_pass_details.forEach(element => {
				$scope.gatepass.charges += element.tempo_charges;
			});
		}
	}

	$scope.selectPackingSlip = function(x, y)
	{
		if((!y.checked) && (x.checked))
			x.checked = false;
		else
		{
			if(x.packing_slips.filter(x=>x.checked == true).length == x.packing_slips.length)
				x.checked = true;
		}
		const index = $scope.gatepass.gate_pass_details.indexOf(y);
		if(y.checked)
		{
			if(index < 0)
			{
				y.packing_slip_id = y.id;
				y.id = 0;
				$scope.gatepass.gate_pass_details.push(y);
			}
		}
		else
		{
			y.tempo_charges = 0;
  			$scope.gatepass.gate_pass_details.splice(index, 1);
		}
		$scope.resetCharge();

	}

	$scope.resetGatePass = function()
	{
		fillGatePass();
		$scope.deliverynotelist.forEach(element => {
			element.checked = false;
			element.expanded = false;
			if(element.packing_slips)
			{
				element.packing_slips.forEach(ps => {
					ps.checked = false;
				});
			}
		});
	}

	$scope.getGatePassPDF = function(id){

		$scope.loading = true;
		var q = $q.defer();

		orderService.printGatePass(id)
				.success(function (response) {
					var file = new Blob([response], {type: 'application/pdf'});
					q.resolve(file);
				})
				.error(function(err){
					q.reject(err);
				});
		return q.promise;

    };

	//To print pdf on new window/ Button_Click event.
	$scope.printGatePass = function(id){
		$scope.getGatePassPDF(id).then(function(file){
			if(window.cordova)
			{
				utilService.downloadAndOpenInApp("gate_pass.pdf", file, false);
			}
			else{
				openPrintWindow(file, "gate_pass.pdf", 3000);
			}
		},function(err){
			console.log('Error: ' + err);
		});
	};


	$scope.cancelGatePass = function()
	{
		if (confirm('Are you sure you want to cancel the gate pass?')) {
			orderService.cancelGatePass($scope.gatepass.id, function(response){
				if(response.statuscode == 0)
				{
					flash.pop({title: "", body: "Gatepass cancelled succesfully", type: "success"});
					$location.path("/packingslips/" );
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});
		}
	}

	$scope.resetGatePassCharges = function()
	{
		if(($scope.gatepass.is_total_charge == undefined) || ($scope.gatepass.is_total_charge == "0"))
			$scope.gatepass.charges = 0;
		else{
			for(i=0; i<$scope.gatepass.gate_pass_details.length; i++){
					$scope.gatepass.gate_pass_details[i].tempo_charges = 0;
				}
			for(i=0; i<$scope.deliverynotelist.length; i++){
					$scope.deliverynotelist[i].tempo_charges = 0;
				}
		}
	}

	$scope.saveGatePass = function()
	{
		$scope.gatepass.gate_pass_date = utilService.convertToServerTimeZone($scope.gatepass.gate_pass_date);

		if($scope.gatepass.is_update_tempo == "1")
		{
			masterService.updateTempo($scope.tempoSelected.id, $scope.gatepass.company_name, $scope.gatepass.contact_name, $scope.gatepass.vehicle_number, function(response){});
		}
		
		if($scope.gatepass.gate_pass_details && $scope.gatepass.gate_pass_details.length == 0)
		{
			alert("Please select atleast one of the packing slip");
			return false;
		}
		
		var tempoChrgLen = $scope.gatepass.gate_pass_details.filter(x=>x.tempo_charges == 0).length;
		if(tempoChrgLen == $scope.gatepass.gate_pass_details.length)
			$scope.gatepass.is_total_charge = "1";

		if($scope.gatepass.is_total_charge == "1"){
			var perBaleCharge = $scope.gatepass.charges / $scope.gatepass.gate_pass_details.length;
			for(i=0; i<$scope.gatepass.gate_pass_details.length; i++){
				$scope.gatepass.gate_pass_details[i].tempo_charges = perBaleCharge;
			}
		}
		$scope.gatepass.delivery_note_details = {};
		orderService.createGatePass($scope.gatepass, function(response){
	 		if (response.statuscode == 0 && response.data && response.data.gatepass) {
	 			$location.path("/deliverynotes/");
	 		}
	 		else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
		});
	}

	$scope.showProductImage = function (productid) {
		$scope.getProductById(productid, function (response) {
			if (response.statuscode == 0 && response.data && response.data.product) {
				product = response.data.product;

		        ModalService.showModal({
		            templateUrl: 'modal.html',
		            controller: "ModalController",
		            inputs: {
		        		"product": product
		      		}
		        }).then(function(modal) {
		            modal.element.modal();
		            modal.close.then(function(result) {
		                //$scope.message = "You said " + result;
		                let a = 1; 
		            });
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

    $scope.showDownloadImages = function(order){
    	if(order.lineitems)
    	{
    		var list = order.lineitems.filter(x=>x.product_image_url != '');	
    		if(list.length > 0)
    			return true;
    	}
    	return false;

    };

    $scope.downloadImages = function (id) {
    	$scope.getProductImagesByOrderId(id, function (response) {
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
				alert("No product images found for this order");
			}
		})
    };

    $scope.downloadProductImage = function (productid) {
		$scope.getProductImagesById(productid, function (response) {
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
				alert("No Product Image Found");
			}
		})

    };

    //get product
	$scope.getProductById = function(id, callback) {
		productService.getProductById(id, callback);
	};

	$scope.getProductImagesById = function(id, callback) {
		productService.getProductImagesById(id, callback);
	};

	$scope.getProductImagesByOrderId = function(id, callback) {
		productService.getProductImagesByOrderId(id, callback);
	};


	$scope.isDeliveryNotePackingSlipChecked = function(item) {
		if ($routeParams.packingslipid == item.id)
		{
			item.checked = 1;
		}
	};
	
	$scope.getDeliveryNoteTotal = function (delivery_note) {
		var tax_total = 0;
		var ship_total = 0;
		var discount_total = 0;
		for (var i = 0; i < delivery_note.packingsliplist.length; i++) {
			if(delivery_note.packingsliplist[i].checked == 1 || $scope.delivery_note.id > 0)
			{
				for (var j = 0; j < delivery_note.packingsliplist[i].lineitems.length; j++) {
					tax_total = tax_total + delivery_note.packingsliplist[i].lineitems[j].tax_total;
		//			ship_total = Util.round(ship_total + delivery_note.packingsliplist[i].lineitems[j].ship_total, 2);
					discount_total = discount_total + delivery_note.packingsliplist[i].lineitems[j].discount_total;
				} 
			}
		}
//		delivery_note.ship_total = ship_total;
		delivery_note.tax_total = tax_total;
		delivery_note.discount_total = discount_total;

		delivery_note.rounding_total = getRounding(delivery_note); //utilService.round(grandtotal, 0) - grandtotal;
	};

	var getRounding = function(delivery_note) {

		var grandtotal = delivery_note.sub_total + delivery_note.ship_total + delivery_note.tax_total - delivery_note.discount_total;

		return utilService.round(grandtotal, 0) - grandtotal;

	};

	$scope.updateRounding = function(delivery_note) {
		delivery_note.rounding_total = getRounding(delivery_note);
	};

	var setTaxForm = function (delivery_note) {
 		delivery_note.taxform_flag = (delivery_note.tax_type_id == 1 ? 1 : 0);
 		delivery_note.exportform_flag = (delivery_note.tax_type_id == -1 ? 1 : 0);
	};

	$scope.expandAllPackingSlips = function(){
		for (var i = 0; i < $scope.delivery_note.packingsliplist.length; i++) {
			$scope.expandPackingSlipDetails($scope.delivery_note.packingsliplist[i].id);
		}
		$scope.expandAll = true;
	}

	
	$scope.collapseAllPackingSlips = function(){
		for (var i = 0; i < $scope.delivery_note.packingsliplist.length; i++) {
			$scope.delivery_note.packingsliplist[i].expanded = false;
		}
		$scope.expandAll = false;
	}

	$scope.selectAllPackingSlipsInDN = function(){
		for (var i = 0; i < $scope.delivery_note.packingsliplist.length; i++) {
			$scope.delivery_note.packingsliplist[i].checked = 1;
		}
		$scope.calculateDeliveryNoteTotals(false);
		$scope.selectAll = true;
	}

	$scope.deselectAllPackingSlipsInDN = function(){
		for (var i = 0; i < $scope.delivery_note.packingsliplist.length; i++) {
			$scope.delivery_note.packingsliplist[i].checked = 0;
		}
		$scope.calculateDeliveryNoteTotals(false);
		$scope.selectAll = false;
	}

	$scope.expandPackingSlipDetails = function(packingslipid){
		var packingslip = $scope.delivery_note.packingsliplist.filter(x=>x.id == packingslipid)[0];
		if($scope.delivery_note.id > 0)
		{
			if(packingslip.expanded)
				packingslip.expanded = false;
			else
				packingslip.expanded = true;
		}
		else
		{			
			if(packingslip.expanded)
			{
				packingslip.expanded = false;
			}
			else
			{
				if(packingslip.lineitems && packingslip.lineitems.length > 0)
				{
					packingslip.expanded = true;
				}
				else
				{
					getPackingSlipDetail(packingslipid, function (response)	
					{
						if (response.statuscode == 0 && response.data && response.data.packingslip) 
						{ 			
							packingslip.lineitems = response.data.packingslip.lineitems;				
							packingslip.expanded = true;
						}
					});
				}
			}
		}
	};

	$scope.addDIPrepareLineItem = function(index){
		var line = $scope.delivery_note.lineitems[index];

		if(line.packingslip_lineitems == undefined)
			line.packingslip_lineitems = [];

		var obj = initPackingSlipDetail();
		obj.product_id      = line.id;
		line.packingslip_lineitems.push(obj);
	};

	$scope.convertEquationtoQty = function(notes, lineitem) {

		var pcs = 0;
		try {
			var val = $scope.$eval(notes);
			var pcsArr = notes.split('+');
			for (var i = 0; i < pcsArr.length; i++) {
				if (pcsArr[i] > 0) pcs++;
			}
			lineitem.entered_quantity = val;
		}
		catch (err) {
			val = notes;
			pcs = 0;
		}

		return val;	

	};


	$scope.calculateDIDiscount = function () {
		
		if (!$scope.delivery_note.discount_perc) $scope.delivery_note.discount_perc = 0;
		$scope.delivery_note.discount_total = 0;

		var perc = $scope.delivery_note.discount_perc;
		for (i = 0; i < $scope.delivery_note.lineitems.length; i++) {
			var lineitem = $scope.delivery_note.lineitems[i];
			var linetotal = lineitem.entered_quantity * lineitem.order_price;

			lineitem.discount_total = parseFloat((linetotal * perc / 100).toFixed(2));

			var disc_perc = (lineitem.disc_perc ? lineitem.disc_perc : 0);
			var li_disc = parseFloat((linetotal * disc_perc / 100).toFixed(2));
			lineitem.discount_total = parseFloat(lineitem.discount_total + li_disc);

			$scope.delivery_note.discount_total = parseFloat($scope.delivery_note.discount_total + lineitem.discount_total)
		}

		$scope.delivery_note.discount_total = parseFloat($scope.delivery_note.discount_total.toFixed(4));	
	};

	$scope.updateDILineItem = function(lineitem, index)
	{
		let id = lineitem.product.id;
		$scope.delivery_note.lineitems[index] = lineitem.product;
		$scope.delivery_note.lineitems[index].id = 0;
		$scope.delivery_note.lineitems[index].productid = id;	
		$scope.delivery_note.lineitems[index].uom_id = lineitem.product.selectedQuoteUOM.id;
		$scope.delivery_note.lineitems[index].uom_name = lineitem.product.selectedQuoteUOM.name;
		$scope.delivery_note.lineitems[index].uom_short_name = lineitem.product.selectedQuoteUOM.short_name;

		$scope.delivery_note.lineitems[index].entered_quantity = lineitem.product.orderqty;
		$scope.delivery_note.lineitems[index].entered_unit_of_measures_id = lineitem.product.selectedUOM.id;
		$scope.delivery_note.lineitems[index].entered_uom_name = lineitem.product.selectedUOM.name;
		$scope.delivery_note.lineitems[index].entered_uom_short_name = lineitem.product.selectedUOM.short_name;
		$scope.delivery_note.lineitems[index].entered_uom_id = lineitem.product.selectedUOM.id;
		
		$scope.calculateDirectInvoiceTotals();
	}

	$scope.calculateDirectInvoiceTotals = async function() {

		var subtotal = 0;
		var tax_total = 0;
		const hsnHash = {};
		let hsn;
		let requests = [];

		if (!$scope.delivery_note.sub_total) $scope.delivery_note.sub_total = 0;
		await $scope.calculateDIDiscount();

		var perc = $scope.delivery_note.discount_total / $scope.delivery_note.sub_total * 100;
		var discountWithoutTaxTotal = $scope.delivery_note.sub_total - $scope.delivery_note.discount_total;

		for(var i =0; i < $scope.delivery_note.lineitems.length; i++)
		{
			var lineitem = $scope.delivery_note.lineitems[i];
			
			if(lineitem)
			{
				lineitem.order_quantity = (lineitem.entered_quantity ? lineitem.entered_quantity : 0);
				var linetotal = parseFloat(lineitem.order_quantity * lineitem.order_price);

				lineitem.sub_total = linetotal;

				if(($scope.delivery_note.ship_total) && ($scope.delivery_note.ship_total > 0))
					lineitem.ship_total = parseFloat((((linetotal - lineitem.discount_total) * $scope.delivery_note.ship_total)/discountWithoutTaxTotal).toFixed(2));
				else
					lineitem.ship_total = 0;

				subtotal = subtotal + linetotal;

				
					if ($scope.isTaxAutoCalculated()) 
					{
						try {
			      			var deferred = $q.defer();
			      			requests.push(deferred.promise);

							if (lineitem.hsn.id in hsnHash) {
								hsn = hsnHash[lineitem.hsn.id];
							} else {
								const object = await masterService.getHsnById(lineitem.hsn.id);
								hsn = object.data.hsn;
								hsnHash[lineitem.hsn.id] = hsn;
							}
							let hsnDetailList = hsn.details.filter( row => lineitem.order_price >= row.amount_min && lineitem.order_price <= (row.amount_max || Number.MAX_VALUE) );
							if (hsnDetailList.length > 0) {
								lineitem.hsn.percent_gst    = hsnDetailList[0].percent_gst;
								lineitem.hsn.percent_cess   = hsnDetailList[0].percent_cess
								lineitem.hsn.percent_igst   = hsnDetailList[0].percent_igst;
								lineitem.hsn.percent_cgst   = hsnDetailList[0].percent_cgst;
								lineitem.hsn.percent_sgst   = hsnDetailList[0].percent_sgst;				

								lineitem.tax_total = parseFloat( (linetotal - (lineitem.discount_total || 0) ) * (lineitem.hsn.percent_gst) / 100);
								lineitem.tax_total = (parseFloat(lineitem.tax_total) + parseFloat(lineitem.tax_total * lineitem.hsn.percent_cess / 100));

							} else {
								lineitem.tax_total = 0;
							}

							deferred.resolve();	

						} catch(ex) {
							lineitem.tax_total = 0;
						}
					}
					else
						lineitem.tax_total = getManualLineItemTax(lineitem);
				

				tax_total = tax_total + parseFloat(lineitem.tax_total);
				lineitem.is_taxable = (lineitem.tax > 0 ? 1 : 0);
			}
		}

		if (requests.length > 0) {
		  	$q.all(requests).then(function () {

				if(tax_total && tax_total > 0)
					$scope.delivery_note.tax_total =  parseFloat(tax_total.toFixed(4));
				else
					$scope.delivery_note.tax_total = 0;

		    });

		} else {

			if(tax_total && tax_total > 0)
				$scope.delivery_note.tax_total =  parseFloat(tax_total.toFixed(4));
			else
				$scope.delivery_note.tax_total = 0;

		}

		$scope.delivery_note.sub_total = await parseFloat(subtotal.toFixed(4));		
		$scope.delivery_note.tax_total = await parseFloat(tax_total.toFixed(4));
	};


	$scope.calculateDeliveryNoteTotals = function (initLoad) {

		var packingsliplist = [];
		var hPackingSlipWeight = {};

		// to validate transporter is different or not. If different, show warnings.
		var isTransporterDifferent = false;

		for (var i = 0; i < $scope.delivery_note.packingsliplist.length; i++) {
			if(initLoad)
			{
				if($scope.delivery_note.packingsliplist[i].id == $routeParams.packingslipid)
					$scope.delivery_note.packingsliplist[i].checked = 1;
			}
			if ($scope.delivery_note.packingsliplist[i].checked) {

				packingsliplist.push($scope.delivery_note.packingsliplist[i]);
				hPackingSlipWeight[$scope.delivery_note.packingsliplist[i].id] = {"net_weight":$scope.delivery_note.packingsliplist[i].net_weight, "gross_weight":$scope.delivery_note.packingsliplist[i].gross_weight };

			}
		}

		//delivery_note.packingsliplist = packingsliplist;

		// get the details of selected packing slip
		requests = [];

		var subtotal = 0;
		var taxtotal = 0;
		var shiptotal = 0;
		var discounttotal = 0;
		var grandtotal = 0;
		var roundingtotal = 0;

		packingsliplist.forEach(function (obj, i) {

      		if (packingsliplist[i]) {
      			// leave var deferred here only. If you move it above forEach, it won't work
      			var deferred = $q.defer();
      			requests.push(deferred.promise);

				getPackingSlipDetail(packingsliplist[i].id, function (response)	{
		
					if (response.statuscode == 0 && response.data && response.data.packingslip) 
					{ 			
						packingsliplist[i] = response.data.packingslip;

						//overwrite the weight from user input
						var obj = hPackingSlipWeight[packingsliplist[i].id];
						packingsliplist[i].net_weight = obj.net_weight;
						packingsliplist[i].gross_weight = obj.gross_weight;

						for (j = 0; j < packingsliplist[i].lineitems.length; j++) {
							subtotal = subtotal + packingsliplist[i].lineitems[j].sub_total;
							taxtotal = taxtotal + packingsliplist[i].lineitems[j].tax_total;
							shiptotal = shiptotal + packingsliplist[i].lineitems[j].ship_total;
							discounttotal = discounttotal + packingsliplist[i].lineitems[j].discount_total;
						} 

						deferred.resolve();	
					}
					else if (response.statuscode === -100)  {
						$location.path("/Login/");
					} 
					else {
						flash.pop({title: "", body: response.message, type: "error"});
					}
				});

			}
		});
      	$q.all(requests).then(function () {
      		$scope.delivery_note.sub_total = parseFloat(subtotal);
      		$scope.delivery_note.tax_total = taxtotal;
      		$scope.delivery_note.ship_total = shiptotal;
      		$scope.delivery_note.discount_total = discounttotal;

			var grandtotal = $scope.delivery_note.sub_total + $scope.delivery_note.ship_total + $scope.delivery_note.tax_total - $scope.delivery_note.discount_total;
			$scope.delivery_note.rounding_total = utilService.round(grandtotal) - grandtotal;

      		//$scope.detailview = true;
        });

	};

	$scope.saveDirectInvoice = function(delivery_note) {
		if(!$scope.delivery_note.lineitems || $scope.delivery_note.lineitems.length == 0)
		{
			flash.pop({title: "", body: 'Please select at least one lineitem to create a delivery note.', type: "error"});
			return false;
		}
		if(($scope.delivery_note.customer.id > 0) || ($scope.delivery_note.id > 0))
		{
			masterService.editCustomer($scope.delivery_note.customer, function(response) {
				if (response.statuscode == 0 && response.data && response.data.customer) {
					$scope.delivery_note.customer = response.data.customer;
					if($scope.delivery_note.id > 0)
						$scope.updateDeliveryNote($scope.delivery_note, null);
					else
						$scope.createDeliveryNote($scope.delivery_note, 0);
				}
				else
					flash.pop({title: "", body: "Some error occurred, please contact support", type: "error"});
			});
		}
		else
		{
			masterService.createCustomer($scope.delivery_note.customer, undefined, function(response) {
				if (response.statuscode == 0 && response.data && response.data.customer)  {
					$scope.delivery_note.customer = response.data.customer;
					$scope.createDeliveryNote($scope.delivery_note, 0);
				}
				else
					flash.pop({title: "", body: "Some error occurred, please contact support", type: "error"});
			});
		}
	}
 
	$scope.createDeliveryNote = function (delivery_note, routeToPackingSlipFlag) {
		var isTransporterDifferent = false;
 
 		$scope.isDisabled = true;
 		if($scope.delivery_note.proforma_invoice_flag)
 			$scope.delivery_note.sync_status_id = 4103;

 		setTaxForm(delivery_note);

		delivery_note.note_date = utilService.convertToServerTimeZone(delivery_note.note_date);

		if (delivery_note.lr_date)	
			delivery_note.lr_date = utilService.convertToServerTimeZone(delivery_note.lr_date);

		if (delivery_note.einvoice_info.bill_date)	
			delivery_note.einvoice_info.bill_date = utilService.convertToServerTimeZone(delivery_note.einvoice_info.bill_date);

		delivery_note.destination = delivery_note.ship_address.city;

		if(delivery_note.direct_invoice_flag != 1) {

			if (delivery_note.ship_address.city != delivery_note.destination && !confirm ('Destination is different than shipping city. Do you want to continue creating?')) {
					return false;
			}
			
			delivery_note.packingsliplist = delivery_note.packingsliplist.filter(x=>x.checked == true);

			if (delivery_note.packingsliplist.length == 0) {
				flash.pop({title: "", body: 'Please select at least one packing slip to create a delivery note.', type: "error"});
				return false;
			}
			
			for (var i = 0; i < delivery_note.packingsliplist.length; i++) {
			
				if (!isTransporterDifferent && delivery_note.transporter.id != $scope.delivery_note.packingsliplist[i].order.transporter.id) {
					isTransporterDifferent = true;
				}
				
			}	
		}

		if (isTransporterDifferent && !confirm ('Transporter is not matching with selected packing slip. Do you want to continue creating?')) {
				return false;
		}

		orderService.createDeliveryNote(delivery_note, function (response) {
			if (response.statuscode == 0 && response.data && response.data.deliverynote) {
				flash.pop({title: "", body: "Delivery note created succesfully", type: "success"});
				//auto complete delivery note if it is completable
				if ($scope.canCompleteDeliveryNote(response.data.deliverynote)) {
					completeDeliveryNote(delivery_note);
					$scope.isDisabled = false;
					return;
				}
				if (routeToPackingSlipFlag)
					$location.path("/packingslips/");
				else			
					$location.path("/deliverynotes/");
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			} 
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
			$scope.isDisabled = false;
		});
 
	};

	const doUpdateDeliveryNote = function (delivery_note, callback) {
		orderService.updateDeliveryNote(delivery_note, (response) => callback(response));
	};

	$scope.checkProformaFlag = function (delivery_note) {
		if(deliverynote && deliverynote.proforma_invoice_flag)
			deliverynote.sync_status_id = 4103;
		else
			deliverynote.sync_status_id = 4100;
	}

	$scope.updateDeliveryNote = function (delivery_note, callback) {
 	
 		$scope.isDisabled = true; 		
 		delivery_note.destination = delivery_note.ship_address.city;
 		
 		if($scope.delivery_note.proforma_invoice_flag)
 			$scope.delivery_note.sync_status_id = 4103;
 		else
 			$scope.delivery_note.sync_status_id = 
 				($scope.delivery_note.sync_status_id == 4101 ? 4100 : $scope.delivery_note.sync_status_id)

 		setTaxForm(delivery_note);

		delivery_note.note_date = utilService.convertToServerTimeZone(delivery_note.note_date);

		if (delivery_note.lr_date)	
			delivery_note.lr_date = utilService.convertToServerTimeZone(delivery_note.lr_date);

		if (delivery_note.einvoice_info.bill_date)	
			delivery_note.einvoice_info.bill_date = utilService.convertToServerTimeZone(delivery_note.einvoice_info.bill_date);

		if (delivery_note.direct_invoice_flag != 1 && delivery_note.ship_address.city != delivery_note.destination && !confirm ('Destination is different than shipping city. Do you want to continue creating?')) {
				return false;
		}
		
		doUpdateDeliveryNote(delivery_note, function (response) {
			if (response.statuscode == 0 && response.data && response.data.deliverynote) {
				flash.pop({title: "", body: "Delivery note updated succesfully", type: "success"});

				if(delivery_note.direct_invoice_flag != 1) {
					//auto complete delivery note if it is completable
					if (!callback && $scope.canCompleteDeliveryNote(response.data.deliverynote)) {
						completeDeliveryNote(delivery_note);
						$scope.isDisabled = false;
						return;
					}
				}

				if (callback)
					return callback(response.data.deliverynote);

				$location.path("/deliverynotes/");
				//flash.pop({title: "", body: response.message, type: "error"});
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			} 
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
			$scope.isDisabled = false;
		});
 
	};

	$scope.isDeliveryNoteShippingAddressReadOnly = function(delivery_note) {
		return (!$scope.canUpdateDeliveryNoteShippingAddress(delivery_note) || (delivery_note.ship_address.id != '' && delivery_note.ship_address.id == delivery_note.customer.ship_address.id));
	}

	$scope.canUpdateDeliveryNoteShippingAddress = function(delivery_note) {
		return (!(delivery_note.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_DELIVERED || delivery_note.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_COMPLETED || delivery_note.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_CANCELLED));
	}

	$scope.getTax = function (deliverynote, type, forceRecalculation) {
	
		var options = {};

		if (type == 1)
			options.cform = 1;

		if (type == -1)
			options.hform = 1;

		if (deliverynote.id > 0 && forceRecalculation != 1) {
			options.deliveryid = deliverynote.id;

			masterService.getTax(options, function (response) {
				if (response.statuscode == 0 && response.data && response.data.taxlist) {
					hDeliveryDetail_Tax = {};
					for (i = 0; i < response.data.taxlist.length; i++)	
						hDeliveryDetail_Tax[response.data.taxlist[i].id] = response.data.taxlist[i].tax;

					for (i = 0; i < deliverynote.packingsliplist.length; i++) {
						for (j = 0; j < deliverynote.packingsliplist[i].lineitems.length; j++) {
							deliverynote.packingsliplist[i].lineitems[j].tax_total = hDeliveryDetail_Tax[deliverynote.packingsliplist[i].lineitems[j].id];
							$scope.getDeliveryNoteTotal(deliverynote);
						}
					}
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
				$scope.isDisabled = false;
			});
			
		}
		else {
			var hPackingLineItem = {};
			for (i = 0; i < deliverynote.packingsliplist.length; i++) {
				for (j = 0; j < deliverynote.packingsliplist[i].lineitems.length; j++) {
					options.productid = deliverynote.packingsliplist[i].lineitems[j].product_id;
					options.extension = deliverynote.packingsliplist[i].lineitems[j].sub_total - deliverynote.packingsliplist[i].lineitems[j].discount_total;
					options.id        = deliverynote.packingsliplist[i].lineitems[j].id;
					hPackingLineItem[options.id] = deliverynote.packingsliplist[i].lineitems[j];
					
					masterService.getTax(options, function (response) {
						if (response.statuscode == 0 && response.data && response.data.tax) {
							hPackingLineItem[response.data.tax.id].tax_total = response.data.tax.tax;
							$scope.getDeliveryNoteTotal(deliverynote);
//							deliverynote.packingsliplist[i].lineitems[j].tax_total = response.data.tax.tax;
						}
						else if (response.statuscode === -100)  {
							$location.path("/Login/");
						}
						else {
							flash.pop({title: "", body: response.message, type: "error"});
						}
						$scope.isDisabled = false;
					});
				}
			}
		}

	};

	$scope.getDeliveryNoteById = function(){

		$scope.state_list = utilService.getStates();

		$scope.detailview = true;
		if($routeParams.invoice_number)
		{
			var options = {}
			options.invoice_number = $routeParams.invoice_number;
			options = initPageNumberFilters(options);
			orderService.getDeliveryNotes(options, $scope.currentPage, $scope.itemsPerPage, function(response){
				if (response.statuscode == 0 && response.data && response.data.deliverynotelist)
				{
					$scope.delivery_note = response.data.deliverynotelist[0];
					fillDeliveryNote();
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});
			

		}
		else
		{
			getDelierynoteById($routeParams.id, function (response)	{

				if (response.statuscode == 0 && response.data && response.data.deliverynote) 
				{ 	
					$scope.delivery_note = response.data.deliverynote;
					fillDeliveryNote();
					
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				} 
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});
		}

	};

	var fillGatePass = function()
	{
		$scope.gatepass = {};
		$scope.gatepass.id = 0;
		$scope.gatepass.gate_pass_date = new Date();
		$scope.gatepass.charges = 0;
		$scope.gatepass.delivery_note_details = [];
		$scope.gatepass.gate_pass_details = [];
	}

	var fillDeliveryNote = function()
	{
		$scope.delivery_note.note_date = utilService.convertToClientTimeZone($scope.delivery_note.note_date);

		$scope.isDeliveryNoteNumberRequired();

		if ($scope.delivery_note.lr_date != undefined) {
			$scope.delivery_note.lr_date = utilService.convertToClientTimeZone($scope.delivery_note.lr_date);
		}

		if ($scope.delivery_note.einvoice_info && $scope.delivery_note.einvoice_info.bill_date)	
			$scope.delivery_note.einvoice_info.bill_date = utilService.convertToClientTimeZone($scope.delivery_note.einvoice_info.bill_date);

		// for tax type radio button
		$scope.delivery_note.tax_type_id = ($scope.delivery_note.taxform_flag == 1 ? 1 : $scope.delivery_note.exportform_flag == 1 ? -1 : 0);

//				if ($scope.delivery_note.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_PENDING_LR || $scope.delivery_note.status_id == utilService.CONST_STATUS_DELIVERY_NOTE_DELIVERED) {
		if (!$scope.isViewOnlyDeliveryNote($scope.delivery_note)) {
			masterService.getTransporters (1, function (response) {
				if (response.statuscode == 0 && response.data && response.data.transporterlist) {
					$scope.transporterlist = response.data.transporterlist;
				}
			});
		}

		fillOrderInfo($scope.delivery_note.packingsliplist);
		//$scope.delivery_note.sync_status_id = 4103;
		$scope.editmode = true;
	}

	var getDelierynoteById = function (id, callback) {

		orderService.findDeliveryNoteById(id, function(response){
			callback(response);
		});
	};

	function fillOrderInfo(packingsliplist) {

		requests = [];

		packingsliplist.forEach(function (obj, i) {
			// leave var deferred here only. If you move it above forEach, it won't work
			var deferred = $q.defer();
			requests.push(deferred.promise);
			orderService.findById(obj.order_id, function(response){
				if (response.statuscode == 0 && response.data && response.data.order) {
					obj.order = response.data.order;
					if ($scope.delivery_note.customer && $scope.delivery_note.customer.transporter && obj.order.transporters_id == $scope.delivery_note.customer.transporter.id) {
						obj.order.transporter = $scope.delivery_note.customer.transporter;
					}
					else {
						masterService.getTransporterById(obj.order.transporters_id, function (response) {
							if (response.statuscode == 0 && response.data && response.data.transporter) {
								obj.order.transporter = response.data.transporter;
							}
						});
					}
					deferred.resolve();
				}
			});
		});

		$q.all(requests).then(function () {
			return packingsliplist;
		});

	}

	var saveCartToLocalStorage = function(customerid, order) {

		if (!customerid) customerid = "";

		// if (!order)
		// 	clearCart(customerid);
		// else
		// {
			var cart = getCartObjectFromLocalStorage();
			if(!cart)
				cart = {};
			saveToLocalStorage(customerid, order, cart);
		// }
	};

	var saveToLocalStorage = function (customerid, order, cart) {
			order.last_updated_date = new Date(); 
			var key = getCartKey(customerid, order.id);
			cart[key] = order;
			localStorage.setItem('cart', JSON.stringify(cart));
	};

	var clearCart = function(customerid, orderid) {
		if (customerid || customerid == "")
		{
			var cart = getCartObjectFromLocalStorage();
			if (!cart) return;
			var key = getCartKey(customerid, orderid);
			cart[key] = null;
			localStorage.setItem('cart', JSON.stringify(cart));
		}
		else
		{
			localStorage.clear();
		}
	};

	var getCartObjectFromLocalStorage = function() {
		var cartobj = localStorage.getItem('cart');
		return JSON.parse(cartobj);
	};

	var getCartFromLocalStorage = function(customerid, orderid) {
		var cart = getCartObjectFromLocalStorage();
		if (!orderid) orderid = "";
		if (!customerid) customerid = "";
		if(cart)
		{
			var key = getCartKey(customerid, orderid);
			if (orderid) {
				if (orderid != "") {
					return cart[key];
				}
			}
			else
				return cart[key];
		}
		return null;
	};

	// var getOrderFromLocalStorage = function(orderid) {
	// 	var order = JSON.parse(localStorage.getItem('order_' + orderid));
	// 	if(order)
	// 	{
	// 		return order;
	// 	}
	// 	return null;
	// };

	$scope.showOrderParameterForm = function () {

		if ($scope.displayParameterFormFlag == true)
			$scope.displayParameterFormFlag = false;
		else
			$scope.displayParameterFormFlag = true;

//		$scope.displayParameterFormFlag = (!$scope.displayParameterFormFlag && $scope.displayParameterFormFlag == true ? false : true);

//		$('#btnShowParameterForm').innerText = "AAA";

		$scope.show_orders({});
	};

	//get product
	$scope.getProduct = function(id, callback) {
		productService.getProduct(id, callback);
	};
 
	$scope.addNewLineItem = function(order){

		//get the current order to cart
		saveCartToLocalStorage(order.customer.id, order);

		if (order.id)
			$location.path("/Home/" ).search( {"customerid" : order.customer.id, "orderid":order.id} );
		else
			$location.path("/Home/" ).search( {"customerid" : order.customer.id} );
	};

	$scope.removeLineItem = function(index){
		if (confirm('Are you sure?')) {
			$scope.order.lineitems.splice(index, 1);
			$scope.calculate_subtotal();
			$scope.calculateDiscount();
			saveCartToLocalStorage($scope.order.customer.id, $scope.order);
		}
	};

	$scope.removePrepareLineItem = function(lineitem, index){
		lineitem.packingslip_lineitems.splice(index,1);
//		$scope.order.lineitems.splice(index,1);
		//$scope.order.lineitems.splice(index, 1);
	};

    var initPackingSlipDetail = function () {
    	return {"id":"", "order_id":"", "packing_slip_id":"", "order_detail_id":"", "product_id":"", "stock_bucket_id":"", "stock_bucket_code":"", "packed_qty_quote":"", "packed_qty_qty":"" };
    };
    // Hotkey to open filter oprions
	hotkeys.bindTo($scope).add({
		'combo': 'alt+shift+f',
		'preventDefault': true,
		'description': 'Open Filter Fields',
		callback: function() {
			if ($scope.displayParameterFormFlag == true)
			$scope.displayParameterFormFlag = false;
		else
			$scope.displayParameterFormFlag = true;
	 	}
 });

	$scope.addPrepareLineItem = function(index){
		var line = $scope.order.lineitems[index];

		if(line.packingslip_lineitems == undefined)
			line.packingslip_lineitems = [];

		var obj = initPackingSlipDetail();
		obj.order_detail_id = line.id;
		obj.product_id      = line.products_id;
		obj.order_id        = line.orders_id;

//		line.packingslip_lineitems.push({"order_detail_id":line.id});
		line.packingslip_lineitems.push(obj);

/*		
		var line1 = Object.assign({},line);
		line1.id =0;
		$scope.order.lineitems.splice(index+1, 0,line1);
*/
	};

  $scope.saveOrder = function(){
  
  	if ($scope.order.discount_perc > 0){
		let flag = confirm("You have applied discount. Are you sure Payment Term is matching with discount applied?");
		if (!flag) return false;
  	}

	$scope.isDisabled = true;
  	orderService.createOrder($scope.order, function(response){
 		if (response.statuscode == 0 && response.data && response.data.order) {
 			flash.pop({title: "", body: "Order created succesfully", type: "success"});
			clearCart($scope.order.customer.id, $scope.order.id);
			if(utilService.isUserACustomer())
				$location.path("/orders/view/order/" + response.data.order.id)		
			else
				$location.path("/orders/");
 		}
 		else {
			flash.pop({title: "", body: response.message, type: "error"});
		}
		$scope.isDisabled = false;
	});

  };

  $scope.cloneOrder = function(order){
	  order.id= 0;
	  var i=0;
	  for(i=0; i <order.lineitems.length;i++)
	  {
		order.lineitems[i].id=0;
	  }
	  flash.pop({title: "", body: "Order has been cloned. Please update Order Number.", type: "success"});
  };

 $scope.showAddOrderForm = function() {

	if ($scope.isUserACustomer()) {
		var user = utilService.getUser();
		if (user) {
			$scope.customer =  user.company_id;
		}
	};
 
	if (!$scope.customer) {
		var customerobj = masterService.getCustomer('customer_order');
		if (customerobj)
			$scope.customer =  customerobj.id;
	}

	if($scope.customer){
		$location.path("/Home/" ).search( {"customerid" : $scope.customer,withproductsonly:1} );
		//$location.path("/AddOrder/" ).search( {"customerid" : $scope.customer} );
	}
	else
	{
		alert("Select Customer");
	}
 };
 
 $scope.showEditOrderForm = function(orderid) {
	//$location.path("/Home/" ).search( {"customerid" : $scope.customer} );
	$location.path("/EditOrder/" + orderid );
 };
 
 $scope.showPackingSlipDetail = function(slipid) {
 	if ($scope.isPackingSlipViewPermissionExists())
		$location.path("/packingslips/" + slipid );
 };

 $scope.showGatePassDetail = function(id) {
 	if ($scope.isGatePassViewPermissionExists())
		$location.path("/AddGatePass/" + id );
 };

 var initItem = function() {
 	return {"id":0,"value":"","description":""};
 };
 
 $scope.quick_order = function () {
 	var itemlist = [];
 	for (i = 0; i < 3; i++) {
 		var item = initItem();
 		itemlist.push (item);
 	}
 	$scope.itemlist = itemlist;

 	if ($routeParams.customerid) {
 		// if customer is already available, no need to fetch again
 		if (!($scope.order && $scope.order.customer.id && $scope.order.customer.id != "" && !$scope.order.customer.name))
			getCustomerById($routeParams.customerid);
 	}
 	else if ($scope.isUserACustomer()) {
		var user = utilService.getUser();
		if (user) {
			var customerid =  user.company_id;
			$scope.customer = customerid;
			getCustomerById(customerid, function (customer) {
				$scope.search_section.customer = customer;
	 			$scope.order.customer     = customer;
				//r $scope.order.customers_id = customer.id;
			});
		}
 	}
 	else {
 		// clear customer so user can enter customer name
 		$scope.order.customer = undefined;
 	}

 	return itemlist;
 };

 $scope.addItemtoItemList = function() {
	var item = initItem();
	$scope.itemlist.push (item);
 };

 $scope.assignQuickPriceQtyById = function (itemlist, product, idx) {
 
 	//TODO: take care of qty and selected UOM
 	for (var i = idx + 1; i < itemlist.length; i++) {
		if (itemlist[i].product && itemlist[i].product.pricegroup && itemlist[i].product.pricegroup.id != null && itemlist[i].product.pricegroup.id != "") {
			if (itemlist[i].product.pricegroup.id == product.pricegroup.id) {
				itemlist[i].product.order_price = product.order_price;
				itemlist[i].product.orderqty = product.orderqty;
			}
		}
 	}
 
 };
 
 $scope.assignQuickPriceQty = function (itemlist) {
 
 	var hProduct_QtyPrice = {};
 	
 	for (var i = 0; i < itemlist.length; i++) {
		if (itemlist[i].product && itemlist[i].product.pricegroup && itemlist[i].product.pricegroup.id != null && itemlist[i].product.pricegroup.id != "") {
			if (itemlist[i].product.pricegroup.id in hProduct_QtyPrice) {
				itemlist[i].product.order_price = hProduct_QtyPrice[itemlist[i].product.pricegroup.id].price;
//				itemlist[i].product.orderqty = hProduct_QtyPrice[itemlist[i].product.pricegroup.id].qty;
			}
			else {
				hProduct_QtyPrice[itemlist[i].product.pricegroup.id] = {"qty":itemlist[i].product.orderqty,"price":itemlist[i].product.order_price};
			}
		}
 	}
 
 };
 
 $scope.displayQuickOrderButton = function() {

 	var id;

 	if(utilService.isOneTimeSession()) 
 		return false;

	if (!$scope.customer) {
		var customerobj = masterService.getCustomer('customer_order');
		if (customerobj)
			id =  customerobj.id;
	}

	if (!$scope.customer) {
		var obj = $location.search();
		if (obj.customerid) {
			id = obj.customerid;
		}
	}

	if (id) return true;

	var count = $scope.getCartItemCount("", "");

	return (count == 0);

 };

 $scope.show_lineage = function(){
 	if(utilService.isOneTimeSession()) 
 		return false;
 	return true;
 }

 $scope.displayQuickOrderForm = function () {

	if (!$scope.customer) {
		var customerobj = masterService.getCustomer('customer_order');
		if (customerobj)
			$scope.customer =  customerobj.id;
	}

	if (!$scope.customer) {
		var obj = $location.search();
		if (obj.customerid) {
			$scope.customer = obj.customerid;
		}
	}

	if($scope.customer){
		$location.path("/quickorder/" + "customer/" + $scope.customer);
	}
	else
	{
//		alert("Select Customer");
		$location.path("/quickorder/");
	}
 };

$scope.isDiscountEditable = function(order) {

	var user = utilService.getUser();
	return ( ($scope.edit_mode || !order.id)  && (user.sys_role_id == 4001 || user.sys_role_id == 4002 || user.sys_role_id == 4003 || user.sys_role_id == 4004 || user.sys_role_id == 4005) );
/*
	var user = utilService.getUser();
	var order = $scope.order;
	if (order && order.id > 0 )
		return false;
	else {
		return (user.sys_role_id == 4001 || user.sys_role_id == 4002 || user.sys_role_id == 4003 || user.sys_role_id == 4004 || user.sys_role_id == 4005);
	}
	return true; */
};

$scope.applyDiscount = function (perc) {

	if (perc == undefined) {
		alert('Invalid discount percentage.');
		return;
	}

	if (perc && perc < 0) {
		alert('Value must be 0 or greater than 0.');
		return;
	}
if (confirm("You have applied discount. Are you sure Payment Term is matching with discount applied?")) {
	for (var i = 0; i < $scope.delivery_note.packingsliplist.length; i++) {
		if($scope.delivery_note.packingsliplist[i].checked == 1 || $scope.delivery_note.id > 0)
		{
			for (var j = 0; j < $scope.delivery_note.packingsliplist[i].lineitems.length; j++) {
				$scope.delivery_note.packingsliplist[i].lineitems[j].discount_total = utilService.round($scope.delivery_note.packingsliplist[i].lineitems[j].sub_total * perc / 100, 2);
			}
		}
	}
	$scope.getTax($scope.delivery_note, $scope.delivery_note.tax_type_id, 1);

	$scope.getDeliveryNoteTotal($scope.delivery_note);
}
};

$scope.createQuickOrder = function(customer) {
	var items = [];
	if (!customer)
		$scope.order.customer = masterService.getCustomer('customer_order');
	else
		$scope.order.customer = customer;

	//check the price for same items and warn user
	var hPriceGroup_Price = {};

	for (var i = 0; i < $scope.itemlist.length; i++) {
		if ($scope.itemlist[i].product && $scope.itemlist[i].product.pricegroup && $scope.itemlist[i].product.pricegroup.id != null && $scope.itemlist[i].product.pricegroup.id != "") {
			 if ($scope.itemlist[i].product.pricegroup.id in hPriceGroup_Price && hPriceGroup_Price[$scope.itemlist[i].product.pricegroup.id].price != $scope.itemlist[i].product.order_price) {
				if (confirm("Different price for same group exists. Do you want to continue?")) {
					break;
				}
				else
					return false;
			 }
			 else {
			 	hPriceGroup_Price[$scope.itemlist[i].product.pricegroup.id]= {"price" : $scope.itemlist[i].product.order_price};
			 }
		}
	}

	// start processing
	requests = [];

	$scope.itemlist.forEach(function (obj, i) {
		if ($scope.itemlist[i].product) {
			// leave var deferred here only. If you move it above forEach, it won't work
			var deferred = $q.defer();
			requests.push(deferred.promise);
			$scope.product_to_order($scope.order.customer.id, $scope.itemlist[i].product, function () {
				deferred.resolve();	
			});
		}
	});
	$q.all(requests).then(function () {
		$scope.checkoutForm($scope.order.customer.id);
	});

};
	
 $scope.isAddPackingSlipAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_PACKING_SLIP_CREATE) == '1');
 };

 $scope.isTransportChangeAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_ORDER_CREATE_TRANSPORTER_CHANGE) == '1');
 };

 $scope.isPaymentTermsChangeAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_ORDER_CREATE_TERM_CHANGE) == '1');
 };

 $scope.isAddProductAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_CREATE) == '1');
 };

 $scope.isEditProductAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_UPDATE) == '1');
 };

 $scope.getCartItemCount = function(customerid, orderid)
 {
 	if (!customerid)
 		customerid = "";

	var cart = getCartFromLocalStorage(customerid, orderid);
	if( cart != undefined && cart.lineitems != undefined)
		return cart.lineitems.length;
	else
		return 0;
 };

$scope.calculate_subtotal = function(){
	var subtotal = 0;
	for(var i =0; i < $scope.order.lineitems.length; i++)
	{
		var lineitem = $scope.order.lineitems[i];
		var linetotal = lineitem.order_quantity * lineitem.order_price;
		subtotal = subtotal + linetotal;
	}
	$scope.order.sub_total = parseFloat(subtotal.toFixed(4));
};

$scope.initShowProducts = function() {

	if ($scope.customerid)
		getCustomerById($scope.customerid);
};

//this is interface to show products
$scope.show_products = function() {
	if ($scope.customerid && $scope.customerid != "") {
		getCustomerById($scope.customerid, function (customer) {
			$scope.customer = customer;
		});
	}
};

$scope.checkout_order = function() {

	orderService.findById($scope.orderid, function(response){
		if (response.statuscode == 0 && response.data && response.data.order) {
			$scope.order = response.data.order;

			if ($scope.order.sysorderstatuses_id != ORDER_STATUS_IN_PACKING && $scope.order.sysorderstatuses_id != ORDER_STATUS_PENDING_WF) {
				clearCart($routeParams.customerid, $scope.orderid);
				alert("Order cannot be modified.");
				return;
			}

			var cart = getCartFromLocalStorage($routeParams.customerid, $scope.orderid);
			var lineitems = cart.lineitems;

			$scope.order.lineitems = lineitems;
			$scope.order.order_date = new Date($scope.order.order_date); 

			//order is being checked out. Therefore, dirty flag is set.
			$scope.order.is_dirty = true;

			$scope.calculate_subtotal();

			if($scope.order.ship_total == undefined)
				$scope.order.ship_total=0;
			if($scope.order.tax_total == undefined || $scope.order.tax_total == null)
				$scope.order.tax_total=0;
			if($scope.order.discount_total == undefined)
				$scope.order.discount_total=0;

			getPaymentTerms();
			getTransporters();

			// checkout process is going on
			//$scope.is_checkout_on = false; //?

			$scope.disablePaymentTerms 	= $scope.isPaymentTermsChangeAllowed();
			$scope.disableTransport 	= $scope.isTransportChangeAllowed();

			getCustomerById($scope.customerid, function (customer) {
				$scope.customer = customer;
				taxflag = customer.taxform_flag;
				calculateTax($scope.order, taxflag);
				$scope.calculateDiscount();

				// if agent is logging in, show the bonus rate
				if (utilService.isUserAnAgent()) {
					calculateCommission($scope.order);
				}

			});

		}
 		else if (response.statuscode === -100)  {
 			$location.path("/Login/");
 		} 
 		else {
			clearCart($routeParams.customerid, $scope.orderid);
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
	});

};

 $scope.initOrder = function (orderid) {
	orderService.findById(orderid, function(response){
		if (response.statuscode == 0 && response.data && response.data.order) {
			$scope.order = response.data.order;

			//get customer object attached with order
			getCustomerById($scope.order.customer.id);
		}
 		else if (response.statuscode === -100)  {
 			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
	});
 };

 var initBlankScopeOrder = function() {

	$scope.order = {lineitems:[]};
	$scope.order.customer = {};

 };




 $scope.init = function(){

	//$scope.currentPage = 1;

	$scope.totalrecords = Number.MAX_VALUE;

	$scope.customerid = $routeParams.customerid;
	$scope.orderid    = $routeParams.orderid;
	$scope.categoryid = $routeParams.categoryid;

	initBlankScopeOrder();

	//TODO: This line can go to only few actions
	$scope.itemcount = $scope.getCartItemCount($routeParams.customerid, $routeParams.orderid);

 	//if checkout order, we want to call checkout_order function. 
 	//I could call it directly at the end in rootScope check however, just to be safe, leaving code as is. 
 	if ($rootScope.action == "checkout_order") {
		$scope.edit_mode = false;
 		return;
 	}

 	if ($rootScope.action == "show_orders") {
 		$scope.initShowOrders();
 		return;
 	}

 	if ($rootScope.action == "show_products") {
 		$scope.initShowProducts();
 		return;
 	}

	// if order id is passed that means user is editing order
	if ($routeParams.orderid) {

		$scope.initOrder($routeParams.orderid);
		$scope.itemcount = $scope.getCartItemCount($routeParams.customerid, $routeParams.orderid);
		return;

	}
	else {
		initBlankScopeOrder();
	}


};

var prepopulateProductFilter = function(productid, sid) {
	productService.getProductById(productid, sid, function (response) {

		if (response.statuscode == 0 && response.data && response.data.product) 
		{ 			
			$scope.search_section.product = response.data.product;
 		}
 		else if (response.statuscode === -100)  {
 			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
	});
};

$scope.initShowOrders = function () {

	//initialize order search scope as it might not have initialized because of hidden
	$scope.search_section = {};

//	var options = utilService.getCustomerFilters();

	options = utilService.getOrderFilters();

 // 	if($routeParams.customerid)
	// {
	// 	getCustomerById($routeParams.customerid, function (customer) {
	// 		$scope.search_section.customer = $scope.order.customer;
	// 	});
	// }

 	if(options.customerid)
	{
		getCustomerById(options.customerid, function (customer) {
			$scope.search_section.customer = $scope.order.customer;
		});
	}

	masterService.clearCustomer('customer_order');

//	if($routeParams.productid)
	if(options.productid)
	{
		prepopulateProductFilter(options.productid);
	}

	prepopulateOrderFilters(options);

//	var obj = $location.search();
//	if (!obj.customerid) {
	if (!options.customerid) {
		masterService.clearCustomer('customer_filter')
	}
	// else {
	// 	if (!$scope.search_section.customer) {
	// 		var customer = {"id":obj.customerid};
	// 		$scope.search_section.customer = customer;
	// 	}
	// }

// //	if (!obj.productid) {
// 	if (!options.productid) {
// //		proudctService.clearProduct('product_filter')
// 	}
// 	else {
// 		if (!$scope.search_section.product) {
// 			var product = {"id":obj.productid};
// 			$scope.search_section.product = product;
// 		}
// 	}

// 	if (obj.statusid) {
// 		$scope.search_section.statusid = obj.statusid;
// 	}

// 	if (obj.deliverystatusid) {
// 		$scope.search_section.deliverystatusid = obj.deliverystatusid;
// 	}

// 	if (obj.fromdate) {
// 		$scope.search_section.fromdate = new Date(obj.fromdate);
// 	}

// 	if (obj.todate) {
// 		$scope.search_section.todate = new Date(obj.todate);
// 	}

// 	if (obj.doc_number) {
// 		$scope.search_section.doc_number = obj.doc_number;
// 	}
$scope.getCustomFilters(utilService.CONST_DOCUMENT_TYPE_ORDER);

};

$scope.getCustomFilters = function(type) {
	let options = {};
	options.document_type = type;

	masterService.getCustomFilters(options, function(response){
		$scope.customfilterlist = response.data.customfilterslist;
	})
}

$scope.getOrdersByCustomFilter = function(customFilter, from_page) {
	$scope.search_section = JSON.parse(customFilter.filters);

	$scope.search_section.custom_filter_id = customFilter.id;
	$scope.search_section.from_page = from_page;
	$scope.search_section.custom_filter_name = "";
	$scope.search_section.custom_filter_show_in_dashboard = customFilter.show_in_dashboard;
	utilService.setOrderFilters($scope.search_section);
	$scope.show_orders($scope.search_section);
	$scope.displayParameterFormFlag = false;
	$scope.search_section.custom_filter_name = customFilter.name;
}

$scope.getDeliveryNotesByCustomFilter = function(customFilter, from_page) {
	$scope.search_section = JSON.parse(customFilter.filters);

	$scope.search_section.custom_filter_id = customFilter.id;
	$scope.search_section.from_page = from_page;
	$scope.search_section.custom_filter_name = "";
	$scope.search_section.custom_filter_show_in_dashboard = customFilter.show_in_dashboard;
	utilService.setDeliveryNoteFilters($scope.search_section, from_page);
	$scope.getDeliveryNotes($scope.search_section);
	$scope.displayParameterFormFlag = false;
	$scope.search_section.custom_filter_name = customFilter.name;
}

$scope.getPackingSlipsByCustomFilter = function(customFilter, from_page) {
	$scope.search_section = JSON.parse(customFilter.filters);

	$scope.search_section.custom_filter_id = customFilter.id;
	$scope.search_section.from_page = from_page;
	$scope.search_section.custom_filter_name = "";
	$scope.search_section.custom_filter_show_in_dashboard = customFilter.show_in_dashboard;
	utilService.setPackingslipFilters($scope.search_section, from_page);
	$scope.getPackingSlips($scope.search_section);
	$scope.displayParameterFormFlag = false;
	$scope.search_section.custom_filter_name = customFilter.name;
}

//select entered_unit_of_measures_id, count(1), sum(order_quantity * order_price) from order_details where entered_unit_of_measures_id > 5014 group by entered_unit_of_measures_id;
$scope.selectDefaultQuoteUOM = function(product){

	productService.selectDefaultQuoteUOM(product);
	if($scope.isRateVisible())
		product.order_price = "";
// 	
// 	if (!product) return;
// 	var uomlist = product.uomlist;
// 	for(var i =0 ; i < uomlist.length; i++)
// 	{
// 		if(uomlist[i].id == product.default_qty_uom.id)
// 		{
// 			
// 			product.selectedUOM = uomlist[i];
// 			//product.quote_price = product.selectedUOM.unit_price;
// 		}
// 		if(uomlist[i].id == product.uom_id)
// 		{
// 			product.selectedQuoteUOM = uomlist[i];
// 			//product.quote_price = product.selectedQuoteUOM.unit_price;
// 		}
// 	}
// 	product.order_price = product.selectedQuoteUOM.unit_price;
	
}


$scope.updateQuotePrice = function(product){
	productService.updateQuotePrice(product);
};

var getCustomerList = function(enabledOnly){

	var options = {};
	options.enabled_only = (enabledOnly && enabledOnly == 1 ? 1 : 0);

	masterService.getCustomers(options, function(response) {
		if (response.statuscode == 0 && response.data && response.data.customerlist) 
		{ 			
			$scope.customerlist     = response.data.customerlist;
 		}
 		else if (response.statuscode === -100)  {
 			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});
 
 };

 $scope.setOrderSortParameters = function(sortby) {
	if ($scope.sortBy == sortby) {
		$scope.sortDirection = $scope.sortDirection * -1;
 	}
 	else {
		$scope.sortBy = sortby;
		$scope.sortDirection = 1;
	}

 };
 
 $scope.convertToServerTimeZone = function(dateString) {
 	return utilService.convertToServerTimeZone(dateString);
 }

 $scope.convertToClientTimeZone = function(dateString) {
 	return utilService.convertToClientTimeZone(dateString);
 }

 // isten search order event
 $scope.$on("OrderBarClick", function (evt, data) {

 	let arr = data.X.split("-");
 	if (arr.length == 2) {

 		year = arr[0];
 		month = arr[1];
 		day = 1;

 		let d1 = moment(year + "-" + month + "-" + day, 'YYYY-MM-DD');
 		let d1Str = moment(d1).format('YYYY-MM-DD');

 		let dTemp = d1.add(1, "months");
 		let d2 = dTemp.subtract(1, "days");
 		let d2Str = moment(d2).format('YYYY-MM-DD');

		$scope.search_section = {};
 		$scope.search_section.fromdate = d1Str;
 		$scope.search_section.todate = d2Str;

  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();

 	}

 });

 $scope.$on("OrderCustomFilterClick", function (evt, custom_filter) {
 	$scope.search_section = JSON.parse(custom_filter.filters);
	$scope.search_section.custom_filter_id = custom_filter.id;
	$location.path("/orders/");
	$scope.getOrdersByCustomFilter(custom_filter, 'Dashboard');
	
 });

 $scope.$on("DeliveryNoteCustomFilterClick", function (evt, custom_filter) {
 	$scope.search_section = JSON.parse(custom_filter.filters);
	$scope.search_section.custom_filter_id = custom_filter.id;
	$location.path("/deliverynotes/");
	$scope.getDeliveryNotesByCustomFilter(custom_filter, 'Dashboard');
	
 });

 $scope.$on("PackingSlipCustomFilterClick", function (evt, custom_filter) {
 	$scope.search_section = JSON.parse(custom_filter.filters);
	$scope.search_section.custom_filter_id = custom_filter.id;
	$location.path("/packingslips/");
	$scope.getPackingSlipsByCustomFilter(custom_filter, 'Dashboard');
	
 });

 // isten search packing slip event
 $scope.$on("SearchPackingSlip", function (evt, section, data) {
 	utilService.setPackingslipFilters({});

	$scope.search_section = {};
 	if (data.data.name == "Pending Dispatch")
		$scope.search_section.statusid = 5200;
	else
		$scope.search_section.statusid = 5199;

	$location.path("/packingslips/");

	$scope.search_packingslips();

 });

 // isten search delivery note event
 $scope.$on("SearchDeliveryNote", function (evt, section, data) {
 	utilService.setDeliveryNoteFilters({});

	$scope.search_section = {};
 	if (data.data.name == "Pending Dispatch")
		$scope.search_section.statusid = 5499;
	else
		$scope.search_section.statusid = 5500;

	$location.path("/deliverynotes/");

	$scope.search_deliverynotes();

 });

 // isten search order event
 $scope.$on("SearchOrder", function (evt, section, data) {
 	
 	masterService.clearCustomer('customer_filter');

 	if (section.description == "Pending Orders" && data.data.name == "In Packing") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4201;
  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();
 	}
 	if (section.description == "Pending Orders" && data.data.name == "All Approval") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4203;
  		$location.path("/orders/");

   		// search orders
		$scope.search_orders();
 	}
 	if (section.description == "Pending Orders" && data.data.name == "My approval") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4203;
  		$scope.search_section.more = {};
  		$scope.search_section.more.my_approval_only = 1;

  		$location.path("/orders/");

   		// search orders
		$scope.search_orders();
 	}
 	if (section.description == "Orders In Packing since" && data.data.name == "3 days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4201;
		// let d1 = utilService.convertToServerTimeZone(new Date().toString());
		// d1.setDate(d1.getDate());
  // 		$scope.search_section.todate = d1;

		let d1 = moment().subtract(2, 'days');
//		let d1 = moment().add(offset*-1).subtract(2, 'days');
  		d1 = moment(d1).format('YYYY-MM-DD');
		//d1 = utilService.convertToServerTimeZone(d1.toString());
  		$scope.search_section.fromdate = d1;
  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();
 	}
 	if (section.description == "Orders In Packing since" && data.data.name == "3+ to 7 days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4201;
		let d1 = moment().subtract(3, 'days');
  		d1 = moment(d1).format('YYYY-MM-DD');
		//d1 = utilService.convertToServerTimeZone(d1.toString());
  		$scope.search_section.todate = d1;

		let d2 = moment().subtract(6, 'days');
  		d2 = moment(d2).format('YYYY-MM-DD');
		//d2 = utilService.convertToServerTimeZone(d2.toString());
  		$scope.search_section.fromdate = d2;

  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();
 	}
 	if (section.description == "Orders In Packing since" && data.data.name == "7+ to 30 days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4201;
		let d1 = moment().subtract(7, 'days');
  		d1 = moment(d1).format('YYYY-MM-DD');
		//d1 = utilService.convertToServerTimeZone(d1.toString());
  		$scope.search_section.todate = d1;

		let d2 = moment().subtract(29, 'days');
  		d2 = moment(d2).format('YYYY-MM-DD');
		//d2 = utilService.convertToServerTimeZone(d2.toString());
  		$scope.search_section.fromdate = d2;

  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();
 	}
 	if (section.description == "Orders In Packing since" && data.data.name == "30+ days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4201;
  		let d2 = new Date(2000, 01, 01);
  		$scope.search_section.fromdate = d2;

		let d1 = moment().subtract(30, 'days');
  		d1 = moment(d1).format('YYYY-MM-DD');
		//d1 = utilService.convertToServerTimeZone(d1.toString());
  		$scope.search_section.todate = d1;

  		$location.path("/orders/");

   		// search orders
		$scope.search_orders();
 	}
 	if (section.description == "Completed but Partial Delivery since" && data.data.name == "7 days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4202;
  		$scope.search_section.deliverystatusid = 5701;

		let d1 = utilService.convertToServerTimeZone(new Date().toString());
		d1.setDate(d1.getDate()-6);
  		$scope.search_section.fromdate = d1;

		let d2 = utilService.convertToServerTimeZone(new Date().toString());
  		$scope.search_section.todate = d2;

  		$location.path("/orders/");

   		// search orders
		$scope.search_orders();
 	}
 	if (section.description == "Completed but Partial Delivery since" && data.data.name == "7+ to 30 days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4202;
  		$scope.search_section.deliverystatusid = 5701;

		let d1 = utilService.convertToServerTimeZone(new Date().toString());
		d1.setDate(d1.getDate()-29);
  		$scope.search_section.fromdate = d1;

		let d2 = utilService.convertToServerTimeZone(new Date().toString());
		d2.setDate(d2.getDate()-7);
  		$scope.search_section.todate = d2;

  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();
 	}
 	if (section.description == "Completed but Partial Delivery since" && data.data.name == "30+ days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4202;
  		$scope.search_section.deliverystatusid = 5701;
  		let d1 = new Date(2000, 01, 01);
  		$scope.search_section.fromdate = d1;

		let d2 = utilService.convertToServerTimeZone(new Date().toString());
		d2.setDate(d2.getDate()-30);
  		$scope.search_section.todate = d2;

  		$location.path("/orders/");

   		// search orders
		$scope.search_orders();
 	}
 	if (section.description == "Order Summary" && data.data.name == "30+ days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4202;
  		let d2 = new Date(2000, 01, 01);
  		$scope.search_section.fromdate = d2;

		let d1 = utilService.convertToServerTimeZone(new Date().toString());
		d1.setDate(d1.getDate()-30);
  		$scope.search_section.todate = d1;

  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();
 	}

 	if (section.description == "Order Summary" && data.data.name == "7+ to 30 days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4202;
 
		let d1 = utilService.convertToServerTimeZone(new Date().toString());
		d1.setDate(d1.getDate()-29);
  		$scope.search_section.fromdate = d1;

		let d2 = utilService.convertToServerTimeZone(new Date().toString());
		d2.setDate(d2.getDate()-7);
  		$scope.search_section.todate = d2;

  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();
 	}

 	if (section.description == "Order Summary" && data.data.name == "Since 7 days") {
 		$scope.search_section = {};
  		$scope.search_section.statusid = 4202;

		let d1 = utilService.convertToServerTimeZone(new Date().toString());
		d1.setDate(d1.getDate()-6);
  		$scope.search_section.fromdate = d1;

  		$location.path("/orders/");

  		// search orders
 		$scope.search_orders();
 	}
 });

 $scope.search_orders = function () {

 	var options = {};

	var custobj = masterService.getCustomer('customer_filter');
	if (custobj) {

		if (!$scope.search_section) 
			$scope.search_section = {};

		$scope.search_section.customer =  custobj;
		options.customerid = custobj.id;
	}

	if (!custobj && $scope.isUserACustomer()) {
		var user = utilService.getUser();
		if (user) {
			var customerid =  user.company_id;
			$scope.customer = customerid;
			getCustomerById(customerid, function (customer) {
				$scope.search_section.customer = customer;
			});
		}
	}

	options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
	options.deliverystatusid   = ($scope.search_section && $scope.search_section.deliverystatusid ? $scope.search_section.deliverystatusid : undefined);
	options.fromdate   = ($scope.search_section && $scope.search_section.fromdate ? new Date($scope.search_section.fromdate) : undefined);
	options.todate     = ($scope.search_section && $scope.search_section.todate ? new Date($scope.search_section.todate) : undefined);
	options.agentid = ($scope.search_section && $scope.search_section.agent ? $scope.search_section.agent.id : undefined);
	options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
	options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
	options.productid  = ($scope.search_section && $scope.search_section.product ? $scope.search_section.product.id : undefined);
	//options.custom_filter_id = ($scope.search_section && $scope.search_section.custom_filter_id ? $scope.search_section.custom_filter_id : undefined);
	options.from_page  = ($scope.search_section && $scope.search_section.from_page ? $scope.search_section.from_page : undefined);
	options.custom_filter_name = ($scope.search_section && $scope.search_section.custom_filter_name ? $scope.search_section.custom_filter_name : undefined);
	options.custom_filter_show_in_dashboard  = ($scope.search_section && $scope.search_section.custom_filter_show_in_dashboard ? $scope.search_section.custom_filter_show_in_dashboard : undefined);
//	

//	options.customer_order_number = ($scope.search_section && $scope.search_section.customer_order_number ? $scope.search_section.customer_order_number : undefined);

	var name = $scope.search_section.custom_filter_name;
	if(name)
	{
		$scope.saveFilter(options, utilService.CONST_DOCUMENT_TYPE_ORDER);
	}

	options = initPageNumberFilters(options);

	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;

	options.my_approval_only = ($scope.search_section.more && $scope.search_section.more.my_approval_only ? 1 : 0);

	utilService.setOrderFilters(options);

	options.show_detail_if_single_record = true;

	$scope.show_orders(options);

 };

 var getOrderFilters = function() {
 	var options = {};				
	if (!$scope.search_section) 
		$scope.search_section = {};
	options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
	options.deliverystatusid   = ($scope.search_section && $scope.search_section.deliverystatusid ? $scope.search_section.deliverystatusid : undefined);
	options.fromdate   = ($scope.search_section && $scope.search_section.fromdate ? new Date($scope.search_section.fromdate) : undefined);
	options.todate     = ($scope.search_section && $scope.search_section.todate ? new Date($scope.search_section.todate) : undefined);
	options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
	options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
	options.productid  = ($scope.search_section && $scope.search_section.product ? $scope.search_section.product.id : undefined);
	options = initPageNumberFilters(options);
	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	options.my_approval_only = ($scope.search_section.more && $scope.search_section.more.my_approval_only ? 1 : 0);
	return options;
 }

 $scope.saveFilter = function(options, type) {

 	let existsName = checkCustomFilterExistsWithSameValue($scope.search_section.custom_filter_id, JSON.stringify(options));
	if(existsName.length > 0)
	{
		alert("A similar filter already exists with name " + existsName);
		return false;
	}
	else
	{
	 	var name = $scope.search_section.custom_filter_name;
		if(name)
		{	
			if(!checkCustomFilterExistsWithSameName($scope.search_section.custom_filter_id, name))
			{
				if(!$scope.search_section.custom_filter_show_in_dashboard || $scope.search_section.custom_filter_show_in_dashboard == '')
					$scope.search_section.custom_filter_show_in_dashboard = 0;
				if($scope.search_section.custom_filter_id > 0)
				{
						masterService.updateCustomFilter($scope.search_section.custom_filter_id, type, name, JSON.stringify(options), 1, $scope.search_section.custom_filter_show_in_dashboard, function(response){
						if(response.statuscode == 0){
							flash.pop({title: "", body: "Custom Filter updated succesfully", type: "success"});
							$scope.search_section.custom_filter_id = response.data.customfilter.id;
							$scope.getCustomFilters(type);
							//alert("Filter saved succesfully");
						}
						else
						{
							flash.pop({title: "", body: response.message, type: "error"});
							return false;
						}
					})
				}
				else
				{
					masterService.createCustomFilter(type, name, JSON.stringify(options), 1, $scope.search_section.custom_filter_show_in_dashboard, function(response){
						if(response.statuscode == 0){
							flash.pop({title: "", body: "Custom Filter created succesfully", type: "success"});
							$scope.search_section.custom_filter_id = response.data.customfilter.id;
							$scope.getCustomFilters(type);
							//alert("Filter saved succesfully");
						}
						else
						{
							flash.pop({title: "", body: response.message, type: "error"});
							return false;
						}
					})

				}
			}
			else {
				alert("A filter with same name already exists, please enter different name");
				$scope.search_section.custom_filter_name = '';
				return false;
			}		
		}
		else {
			alert("Please enter filter name")
			return false;
		}
	}

 };

 $scope.clearFilter = function() {
 	$scope.search_section.custom_filter_name = '';
 	$scope.search_section.custom_filter_id = 0;
 }

 $scope.deleteFilter = function(type) {
 	if (!confirm('Are you sure you want to delete the filter ' + $scope.search_section.custom_filter_name + '?')) {
		return;
	}
	else
	{
		masterService.deleteCustomFilter($scope.search_section.custom_filter_id, function(response){
			if(response.statuscode == 0){
				flash.pop({title: "", body: "Custom Filter deleted succesfully", type: "success"});
				$scope.getCustomFilters(type);
				alert("Filter deleted succesfully");
				$scope.displayParameterFormFlag = false;
				$scope.search_section = {};
				$scope.search_orders();
			}
			else
			{
				flash.pop({title: "", body: response.message, type: "error"});
			}
		})
	}

 };

 var checkCustomFilterExistsWithSameName = function(id, value)
 {
 	if($scope.customfilterlist)
 	{
	 	var nameFilterExists = $scope.customfilterlist.filter(x => x.name == value && x.id != id && x.document_type == utilService.CONST_DOCUMENT_TYPE_ORDER);
	 	if(nameFilterExists.length > 0)
	 		return true;
	}
 	return false;
 }

 var checkCustomFilterExistsWithSameValue = function(id, value)
 {
 	if($scope.customfilterlist)
 	{
	 	var filterExists = $scope.customfilterlist.filter(x => _.isEqual(JSON.parse(x.filters), JSON.parse(value)) && x.id != id && x.document_type == utilService.CONST_DOCUMENT_TYPE_ORDER);
	 	if(filterExists.length > 0)
	 		return filterExists[0].name;
	}
 	return '';
 }

 var initPageNumberFilters = function(options) {

 	if (!$scope.currentPage)
		$scope.currentPage = 1;
 	// if (!$scope.currentPage) $scope.currentPage = 1;
 	// if (!$scope.itemsPerPage) $scope.itemsPerPage = 20;

 	options.page_number = $scope.currentPage;
	options.page_size = $scope.itemsPerPage;

	return options;
 };

 $scope.show_orders = function(options){

 	if (!options) options = utilService.getOrderFilters();

 	if (!options.page_number) {
 		options = initPageNumberFilters(options);
 	}

 	prepopulateOrderFilters(options);

 	orderService.getOrders(options, options.page_number, options.page_size, function(response){
		if (response.statuscode == 0 && response.data && response.data.orderlist) {

			// if there is only one record found, go to order detail page directly to save one click
			if (options.show_detail_if_single_record && response.data.orderlist.length == 1) {
				$scope.showEditOrderForm(response.data.orderlist[0].id);

				//clear the filters else back button will keep bringing to the detail page
				options = {};
				utilService.setOrderFilters(options);
				return;
			}

			$scope.orderlist = response.data.orderlist;
			if ($scope.orderlist[0]) {
				$scope.totalrecords = utilService.getTotalRecords($scope.orderlist);
			}
			else
				$scope.totalrecords = 0;

		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
		else {
			$scope.orderlist = [];
		}
	});

 };

 $scope.exportOrdersToExcel = function() {

 	var options = {};

	var custobj = masterService.getCustomer('customer_filter');
	if (custobj) {

		if (!$scope.search_section) 
			$scope.search_section = {};

		$scope.search_section.customer =  custobj;
		options.customerid = custobj.id;
	}

	if (!custobj && $scope.isUserACustomer()) {
		var user = utilService.getUser();
		if (user) {
			var customerid =  user.company_id;
			$scope.customer = customerid;
			getCustomerById(customerid, function (customer) {
				$scope.search_section.customer = customer;
			});
		}
	}

	options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
	options.deliverystatusid   = ($scope.search_section && $scope.search_section.deliverystatusid ? $scope.search_section.deliverystatusid : undefined);
	options.fromdate   = ($scope.search_section && $scope.search_section.fromdate ? new Date($scope.search_section.fromdate) : undefined);
	options.todate     = ($scope.search_section && $scope.search_section.todate ? new Date($scope.search_section.todate) : undefined);
	options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
	options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
	options.productid  = ($scope.search_section && $scope.search_section.product ? $scope.search_section.product.id : undefined);
	options.page_number = 1;
	options.page_size = 2000;
	options.format = "excel";
	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	options.my_approval_only = ($scope.search_section.more && $scope.search_section.more.my_approval_only ? 1 : 0);

	orderService.getOrders(options, options.page_number, options.page_size, function(response){
		if (response.statuscode == 0) {

			var anchor = angular.element('<a/>');
			var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
			anchor.attr({
				href: window.URL.createObjectURL(blob),
				target: '_blank',
				download: 'orders.xlsx'
			})[0].click();

		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
	});
 }
 
 $scope.selectOrderRow = function() {
 	$scope.order = this.x;
 };

 $scope.orderRowClick = function(id) {
 	if ($scope.isEditProductAllowed())
 		$scope.showEditOrderForm(id);
 }

 var setSearchCriteriaToQueryString = function() {
 
	if ($scope.search_section && $scope.search_section.statusid && $scope.search_section.statusid != "")
		$location.search("statusid", $scope.search_section.statusid); 
	else
		$location.search("statusid", null); 

	if ($scope.search_section && $scope.search_section.fromdate && $scope.search_section.fromdate != "")
		$location.search("fromdate", $scope.search_section.fromdate); 
	else
		$location.search("fromdate", null); 

	if ($scope.search_section && $scope.search_section.todate && $scope.search_section.todate != "")
		$location.search("todate", $scope.search_section.todate); 
	else
		$location.search("todate", null); 

	if ($scope.search_section && $scope.search_section.customer && $scope.search_section.customer.id)
		$location.search("customerid", $scope.search_section.customer.id); 
	else
		$location.search("customerid", null); 

	if ($scope.search_section && $scope.search_section.doc_number && $scope.search_section.doc_number != "")
		$location.search("doc_number", $scope.search_section.doc_number); 
	else
		$location.search("doc_number", null); 

	if ($scope.search_section && $scope.search_section.invoice_number && $scope.search_section.invoice_number != "")
		$location.search("invoice_number", $scope.search_section.invoice_number); 
	else
		$location.search("invoice_number", null); 

	if ($scope.search_section && $scope.search_section.lr_number && $scope.search_section.lr_number != "")
		$location.search("lr_number", $scope.search_section.lr_number); 
	else
		$location.search("lr_number", null); 

	if ($scope.search_section && $scope.search_section.product && $scope.search_section.product.id)
		$location.search("productid", $scope.search_section.product.id); 
	else
		$location.search("productid", null); 

	if ($scope.search_section && $scope.search_section.deliverystatusid && $scope.search_section.deliverystatusid != "")
		$location.search("deliverystatusid", $scope.search_section.deliverystatusid); 
	else
		$location.search("deliverystatusid", null); 

 };

 var prepopulateOrderFilters = function(options) {

 	$scope.search_section = {};

 	if (options.statusid)
 		$scope.search_section.statusid = options.statusid;

 	if (options.doc_number)
 		$scope.search_section.doc_number = options.doc_number;

 	if (options.agentid) {
 		$scope.search_section.agent = {};
 		$scope.search_section.agent.id = options.agentid;
		getAgentById(options.agentid, function (agent) {
			$scope.search_section.agent = agent;
		});
 	}

 	if (options.customerid) {
 		$scope.search_section.customer = {};
 		$scope.search_section.customer.id = options.customerid;
		getCustomerById(options.customerid, function (customer) {
			$scope.search_section.customer = customer;
		});
 	}

 	if (options.productid) {
 		$scope.search_section.product = {};
 		$scope.search_section.product.id = options.productid;
		prepopulateProductFilter(options.productid);
 	}

 	if (options.deliverystatusid)
 		$scope.search_section.deliverystatusid = options.deliverystatusid;

 	if (options.fromdate)
 		$scope.search_section.fromdate = options.fromdate;

 	if (options.todate)
 		$scope.search_section.todate = options.todate;
 
 	if (options.page_number && (!$scope.currentPage || $scope.currentPage != options.page_number))
 		$scope.currentPage = options.page_number;

 	if (options.page_size && (!$scope.itemsPerPage || $scope.itemsPerPage != options.page_size))
 		$scope.itemsPerPage = options.page_size;

 	if (options.from_page)
 		$scope.search_section.from_page = options.from_page;

 	if (options.custom_filter_name)
 		$scope.search_section.custom_filter_name = options.custom_filter_name;

 	if (options.custom_filter_id)
 		$scope.search_section.custom_filter_id = options.custom_filter_id;

 	if (options.custom_filter_show_in_dashboard)
 		$scope.search_section.custom_filter_show_in_dashboard = options.custom_filter_show_in_dashboard;
};

 var prepopulatePackingslipFilters = function(options) {

 	$scope.search_section = {};

 	if (options.statusid)
 		$scope.search_section.statusid = options.statusid;

 	if (options.doc_number)
 		$scope.search_section.doc_number = options.doc_number;

 	if (options.agentid) {
 		$scope.search_section.agent = {};
 		$scope.search_section.agent.id = options.agentid;
		getAgentById(options.agentid, function (agent) {
			$scope.search_section.agent = agent;
		});
 	}

 	if (options.customerid) {
 		$scope.search_section.customer = {};
 		$scope.search_section.customer.id = options.customerid;
		getCustomerById(options.customerid, function (customer) {
			$scope.search_section.customer = customer;
		});
 	}

 	if (options.productid) {
 		$scope.search_section.product = {};
 		$scope.search_section.product.id = options.productid;
		prepopulateProductFilter(options.productid);
 	}

 	if (options.fromdate)
 		$scope.search_section.fromdate = options.fromdate;

 	if (options.todate)
 		$scope.search_section.todate = options.todate;

 	if (options.gate_pass_number)
 		$scope.search_section.gate_pass_number = options.gate_pass_number;
 
 	if (options.page_number && (!$scope.currentPage || $scope.currentPage != options.page_number))
 		$scope.currentPage = options.page_number;

 	if (options.page_size && (!$scope.itemsPerPage || $scope.itemsPerPage != options.page_size))
 		$scope.itemsPerPage = options.page_size;

 	if (options.custom_filter_name)
 		$scope.search_section.custom_filter_name = options.custom_filter_name;

 	if (options.custom_filter_id)
 		$scope.search_section.custom_filter_id = options.custom_filter_id;

 	if (options.custom_filter_show_in_dashboard)
 		$scope.search_section.custom_filter_show_in_dashboard = options.custom_filter_show_in_dashboard;

 	// if (options.sortBy)
 	// 	$scope.search_section.sort_by = options.sortBy;

 	// if (options.sortDirection)
 	// 	$scope.search_section.sort_direction = options.sortDirection;

 };


 var prepopulateDeliveryNoteFilters = function(options) {

 	$scope.search_section = {};

 	if (options.statusid)
 		$scope.search_section.statusid = options.statusid;

 	if (options.doc_number)
 		$scope.search_section.doc_number = options.doc_number;

 	if (options.lr_number)
 		$scope.search_section.lr_number = options.lr_number;

 	if (options.invoice_number)
 		$scope.search_section.invoice_number = options.invoice_number;

 	if (options.agentid) {
 		$scope.search_section.agent = {};
 		$scope.search_section.agent.id = options.agentid;
		getAgentById(options.agentid, function (agent) {
			$scope.search_section.agent = agent;
		});
 	}

 	if (options.customerid) {
 		$scope.search_section.customer = {};
 		$scope.search_section.customer.id = options.customerid;
		getCustomerById(options.customerid, function (customer) {
			$scope.search_section.customer = customer;
		});
 	}

 	if (options.productid) {
 		$scope.search_section.product = {};
 		$scope.search_section.product.id = options.productid;
		prepopulateProductFilter(options.productid);
 	}

 	if (options.fromdate)
 		$scope.search_section.fromdate = options.fromdate;

 	if (options.todate)
 		$scope.search_section.todate = options.todate;

 	if (options.gate_pass_number)
 		$scope.search_section.gate_pass_number = options.gate_pass_number;

	if (options.page_number && (!$scope.currentPage || $scope.currentPage != options.page_number))
 		$scope.currentPage = options.page_number;

 	if (options.page_size && (!$scope.itemsPerPage || $scope.itemsPerPage != options.page_size))
 		$scope.itemsPerPage = options.page_size;

 	if (options.custom_filter_name)
 		$scope.search_section.custom_filter_name = options.custom_filter_name;

 	if (options.custom_filter_id)
 		$scope.search_section.custom_filter_id = options.custom_filter_id;

 	if (options.custom_filter_show_in_dashboard)
 		$scope.search_section.custom_filter_show_in_dashboard = options.custom_filter_show_in_dashboard;

 };

 // 
//  $scope.show_orders_customer_dropdown = function(){
// //	localStorage.clear();
// 
// 	if (!$scope.customerlist)
// 		getCustomerList(1);
// 
// 	var options = {};
// 
// 	options.customerid = ($scope.search_section && $scope.search_section.customerid ? $scope.search_section.customerid : undefined);
// 	options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
// 	options.fromdate   = ($scope.search_section && $scope.search_section.fromdate ? $scope.search_section.fromdate : undefined);
// 	options.todate     = ($scope.search_section && $scope.search_section.todate ? $scope.search_section.todate : undefined);
// 
//  	orderService.getOrders(options, $scope.currentPage, $scope.itemsPerPage, function(response){
// 		if (response.statuscode == 0 && response.data && response.data.orderlist) {
// 			$scope.orderlist = response.data.orderlist;
// 			$scope.totalrecords = $scope.orderlist[0].totalrecords;
// 		}
// 		else if (response.statuscode === -100)  {
// 			$location.path("/Login/");
// 		}
// 		else {
// 			$scope.orderlist = [];
// 		}
// 	});
// 
//  };
 
 
 function getCustomerById(customerid, callback)
 {
 	if (!customerid) {
 		if (callback) return callback(null);
 		return;
 	}
 	masterService.getCustomerById(customerid, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.customer) {
 			$scope.order.customer     = response.data.customer;
		//r	$scope.order.customers_id = response.data.customer.id;
			if (callback) 
				callback(response.data.customer);

 		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});	

 }

 function getAgentById(agentid, callback)
 {
 	if (!agentid) {
 		if (callback) return callback(null);
 		return;
 	}
 	masterService.getAgentById(agentid, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.agent) {
 			$scope.order.agent     = response.data.agent;
			if (callback) 
				callback(response.data.agent);

 		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});	

 }

 function getPaymentTerms()
 {
 	let options = {};
 	options.activeonly = true;
	masterService.getPaymentTerms(options, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.paymenttermlist) {
 			$scope.paymenttermlist     = response.data.paymenttermlist;
 		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 }
 
 function getTransporters()
 {
 	let options = {};
 	options.activeonly = false;
 	masterService.getTransporters(options, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.transporterlist) {
 			$scope.transporterlist     = response.data.transporterlist;
 		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 }

 function getBills(customerID)
 {
 	options = {};
	options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : 10);
	options.sortby = "due_date";
	options.sortDirection = 1;
	options.customerid = customerID;
 	masterService.findAllBills(options, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.billlist) {
 			$scope.billlist   = response.data.billlist;
 			$scope.billlist = $scope.billlist.filter(x=> x.status_id == 5800 || x.status_id == 5802);
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
	});

 }
 
 $scope.add_order = function(){
 
	getCustomerById($routeParams.customerid);
	var withproductsonly =1;
		
	productService.getProducts(null,$routeParams.customerid,withproductsonly, function(response){
	
 		if (response.statuscode == 0 && response.data && response.data.productlist) {
 			$scope.productlist     = response.data.productlist;
 		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
	
	
	});
 };

 function to_dbdate(from)
 {
	var date = new Date(from);
	var month = date.getMonth() +1;
	var day = date.getDate();
	if(month < 10) 	month 	= "0" + month;
	if(day < 10) 	day 	= "0" + day;
	
	return date.getFullYear() + "-" +  month + "-" + day;
	
 }

 $scope.updateQuantity = function(lineitem) {
 	lineitem.qty_unit_multiplier = (!lineitem.qty_unit_multiplier || lineitem.qty_unit_multiplier == null) ? 1 : lineitem.qty_unit_multiplier;
 	lineitem.order_quantity = lineitem.entered_quantity * lineitem.qty_unit_multiplier;
 	$scope.order.is_dirty = true;
 	$scope.calculate_subtotal();
 	$scope.calculateDiscount();
 };

 $scope.isDirectInvoiceModuleOn = function() {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_DIRECT_INVOICE) == "1");
 }; 

$scope.edit_order = function(){
 
 	$scope.edit_mode = false;

  	orderService.findById($routeParams.id, function(response){
		if (response.statuscode == 0 && response.data && response.data.order) {
			//$scope.message	= response.message;
			$scope.order	= response.data.order;
		
			var d = new Date($scope.order.order_date);
			$scope.order.order_date = new Date(d.getFullYear(), d.getMonth(), d.getDate());

			getCustomerById($scope.order.customer.id);
			masterService.getTransporterById($scope.order.transporters_id, function (response) {
				$scope.transporterlist = [];
				if (response.statuscode == 0 && response.data && response.data.transporter) {
					$scope.transporterlist.push(response.data.transporter);
				}
			});

			masterService.getPaymentTermById($scope.order.payment_terms_id, function (response) {
				$scope.paymenttermlist = [];
				if (response.statuscode == 0 && response.data && response.data.paymentterm) {
					$scope.paymenttermlist.push(response.data.paymentterm);
				}
			});
			if(utilService.isPendingApprovalReasonCreditDays($scope.order.workflow_reason_string))
				getBills($scope.order.customer.id);
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

};

$scope.canEditOrder = function (order) {

	var user = utilService.getUser();
//	return ((order.orderusers_id == user.id && $scope.canCancelOrder(order)) || (!order.id && ($scope.order.is_dirty || false) == true));
//	return ((order.orderusers_id == user.id && $scope.canCancelOrder(order)) || ($scope.order.is_dirty  == true && !$scope.edit_mode));
	return ((order.orderusers_id == user.id && (order.sysorderstatuses_id == ORDER_STATUS_IN_PACKING || order.sysorderstatuses_id == ORDER_STATUS_PENDING_WF) && !$scope.edit_mode) || ($scope.order.is_dirty  == true && !$scope.edit_mode));

};

$scope.edit_order_click = function(order) {

 	$scope.edit_mode = true;

	//$scope.is_checkout_on = true;

	$scope.disablePaymentTerms 	= $scope.isPaymentTermsChangeAllowed();
	$scope.disableTransport 	= $scope.isTransportChangeAllowed();

	getPaymentTerms();
	getTransporters();

};

$scope.cancel_editing_click = function (order) {

	frm = $scope.myform;

	if (frm && frm.$dirty) {
		if (!confirm('Are you sure you want to cancel editing? You will lose the changes you have made.')) {
			return;
		}
	}

	var currentPageTemplate = $route.current.templateUrl;
	$templateCache.remove(currentPageTemplate);
	$route.reload();

};

$scope.print_order = function(){
 	$scope.printOrderPdf($routeParams.id);
 };
 
 $scope.product_to_order = function(customerid, product, callback){
	var lineitem = {};
 	//lineitem.product = product;
	lineitem.products_id 	= product.id;
	lineitem.name 			= product.name;
	lineitem.sku            = product.sku;
	lineitem.order_price 	= parseFloat(product.order_price.toFixed(2));
	lineitem.unit_price 	= product.selectedQuoteUOM.unit_price.toFixed(2);

	/* Updated unit of measure and price */
	lineitem.uom_id 		= product.selectedQuoteUOM.id;
	lineitem.uom_name 		= product.selectedQuoteUOM.name;
	lineitem.uom_short_name = product.selectedQuoteUOM.short_name;

	lineitem.entered_quantity = product.orderqty;
	lineitem.entered_unit_of_measures_id 	= product.selectedUOM.id;
	lineitem.entered_uom_name = product.selectedUOM.name;
	lineitem.entered_uom_short_name = product.selectedUOM.short_name;
	lineitem.entered_uom_id   = product.selectedUOM.id;
	lineitem.product_image_url = product.image_url1;

	lineitem.hsn              = product.hsn;
	lineitem.is_taxable       = product.is_taxable;

	lineitem.packed_qty_qty   = 0;
	lineitem.packed_qty_quote = 0;

	lineitem.order_quantity		= (!isNaN(product.orderqty) ? parseFloat(product.orderqty) : 0);	

	lineitem.qty_unit_multiplier = 1; //default set to 1

	if (!customerid)
		customerid = "";

	if(product.selectedUOM.id == product.selectedQuoteUOM.id)
	{
		$scope.addProductToCart(customerid,lineitem);
		lineitem.qty_unit_multiplier = lineitem.order_quantity / lineitem.entered_quantity;
		product.added_flag=1;
		if (callback) callback();
		return;
	}

	var base_id = product.default_qty_uom.id;
	masterService.findUnitConversions(base_id,product.selectedUOM.id,product.selectedQuoteUOM.id,function(response){
		if(response.data && response.data.uomconversion)
		{
			var conversionDetail = response.data.uomconversion;
			
			lineitem.order_quantity =  (lineitem.order_quantity/conversionDetail.from_qty) * conversionDetail.to_qty;
			product.converted_quantity = lineitem.order_quantity;
			lineitem.qty_unit_multiplier = lineitem.order_quantity / lineitem.entered_quantity;
			$scope.addProductToCart(customerid,lineitem);
			product.added_flag=1;
			if (callback) callback();
		}
		else
		{
			alert("Invalid Unit selected. Conversion data is missing for " + product.name + ".");
		}
	});

 };


$scope.addProductToCart = function(customerid, lineitem) {

		if( $scope.order == undefined)
			$scope.order = {};

		if ($scope.orderid) $scope.order.id = $scope.orderid;

		if($scope.order.lineitems == undefined)
		{
			$scope.order.lineitems = [];
		}

		var cart = getCartFromLocalStorage(customerid, $routeParams.orderid);
		var lineitems = [];
		if(cart != undefined)
		{
			lineitems = cart.lineitems;
		}

		if(lineitems !=null)
		{
			lineitems = lineitems.filter(function(val){
				if(val.products_id == lineitem.products_id)
					return false;
				else
					return true;
			
				}
			);
		}
		lineitems.push(lineitem);
		
		$scope.order.lineitems = lineitems;
		$scope.order.is_dirty  = true;

		saveCartToLocalStorage(customerid, $scope.order);
		//localStorage.setItem('cart', JSON.stringify($scope.order));
		$scope.itemcount = $scope.getCartItemCount(customerid, $scope.order.id);
};

$scope.removeProductFromCart = function(product){
		var order = getCartFromLocalStorage($scope.order.customer.id, $routeParams.orderid);
		var lineitems = order.lineitems;
		if(lineitems !=null)
		{
			lineitems = lineitems.filter(function(val){
				if(val.products_id == product.id)
					return false;
				else
					return true;
			
				}
			);
		}
		$scope.order.lineitems = lineitems;
		saveCartToLocalStorage($scope.order.customer.id, $scope.order);
		//localStorage.setItem('cart', JSON.stringify($scope.order));
		$scope.itemcount = $scope.getCartItemCount($scope.order.customer.id);
		product.added_flag=0;
		product.orderqty = 0;
};

$scope.emptyCart = function(){
	clearCart();
	//localStorage.setItem('cart', JSON.stringify({}));
	$scope.itemcount = 0;//$scope.getCartItemCount();
};
// 
// $scope.checkoutForm2 = function(){
// 
// 	var cart = getCartFromLocalStorage($scope.order.customer.id); 
// 	if(cart !=null  && cart.lineitems.length >0)
// 	{
// 		$location.path("/orders/checkout/" + "/?customerid=" + $scope.order.customer.id);	
// 	}
// 	else
// 	{
// 		$scope.message = "No items to checkout.";
// 		//alert("No items to checkout");
// 	}
// 
// };

$scope.continueShoppingForm = function (customerid) {

	if (!customerid)
		customerid = $scope.order.customer.id;

	frm = $scope.myform;

	if (frm && frm.$dirty)
		saveCartToLocalStorage(customerid, $scope.order);

	// if (frm && frm.$dirty && !confirm('You have unsaved changes. Please cancel to stay on the page. Click OK to continue. Do you want to continue to next page?')) {
	// 	return;
	// }

	$location.path("/Home/" ).search( {"customerid" : customerid, "withproductsonly" : 1} );

};

var getCartKey = function(customerid, orderid) {
	if (!orderid) orderid = "";
	return ('_KEY_' + customerid + (orderid ? "_" + orderid : ""));
};
/*
var deleteUnassignedCart = function() {
	var cart = getCartObjectFromLocalStorage();
	var key = getCartKey("", "");
	delete cart[key];
	localStorage.setItem('cart', JSON.stringify(cart));
};
*/
var continueCheckout = function (customerid, orderid) {

	// this line will help to prevent execution going further when customer dialog is opened.
	if (!customerid || customerid == "") return;

	if (!orderid && $scope.orderid) orderid = $routeParams.orderid;

	if (!orderid) orderid = "";

	var cart = getCartFromLocalStorage(customerid, orderid); 
	if(cart !=null  && cart.lineitems.length >0)
	{
		$location.path("/orders/checkout/" + "customer/" + customerid + (orderid && orderid != "" ? "/order/" + orderid : "" ));	
	}
	else
	{
		flash.pop({title: "", body: "Cart is empty, no items to checkout", type: "error"});
	}

};

var convertUnassignedCartToCustomer = function (customerid, callback) {

	var cart = getCartFromLocalStorage("", undefined);
	if (!cart)
	{
		flash.pop({title: "", body: "Cart is empty, no items to checkout", type: "error"});
		return
	}

	// start processing
	requests = [];

	cart.customer.id = customerid;

	cart.lineitems.forEach(function (obj, i) {
			var deferred = $q.defer();
			requests.push(deferred.promise);
			var options = {};
			options.productid = obj.products_id;
			productService.getProducts(undefined, customerid, options, function(response) {
				if (response.statuscode == 0 && response.data && response.data.productlist) {
					if (response.data.productlist.length == 1){
						var product = response.data.productlist[0];

	product.uom_id 		= obj.uom_id;
	product.uom_name 		= obj.uom_name;
	product.uom_short_name = obj.uom_short_name;

	// lineitem.entered_quantity = product.orderqty;
	// lineitem.entered_unit_of_measures_id 	= product.selectedUOM.id;
	// lineitem.entered_uom_name = product.selectedUOM.name;
	// lineitem.entered_uom_short_name = product.selectedUOM.short_name;
	// lineitem.entered_uom_id   = product.selectedUOM.id;


						$scope.selectDefaultQuoteUOM(product);
						/*if (parseFloat(obj.order_price) > parseFloat(product.order_price.toFixed(2))) {
							obj.order_price = parseFloat(product.order_price.toFixed(2));
						}*/
						obj.unit_price 	= product.selectedQuoteUOM.unit_price.toFixed(2);
						deferred.resolve();	
					}
					else
						flash.pop({title: "", body: "Unable to fetch product information.", type: "error"});
				}
		 		else if (response.statuscode === -100)  {
		 			$location.path("/Login/");
		 		} 
		 		else {
		 			flash.pop({title: "", body: response.message, type: "error"});
		 		}

			});
	});
	$q.all(requests).then(function () {
		$scope.order.lineitems = cart.lineitems;

		getCustomerById(customerid, function (customer) {
			$scope.order.customer     = customer;
			saveCartToLocalStorage(customerid, $scope.order);
			clearCart("", "");
			callback(customerid, undefined);
		});
	});

};

$scope.checkoutForm = function(customerid, orderid){

	if (!customerid)
		customerid = $routeParams.customerid;

	if (!customerid) customerid = "";

	if (!customerid || customerid == "") {

		if ($scope.isUserACustomer()) {
			var user = utilService.getUser();
			if (user) {
				var customerid =  user.company_id;
				var cart = convertUnassignedCartToCustomer(customerid, function (customerid, orderid) {
					continueCheckout(customerid, orderid);
				});
			}
		}
		else {
			utilService.showCustomerDialog("modal_customer.html", "CustomerModalDialogController", {}, function(result) {
				if (result == "OK") {
					var data = masterService.getCustomer();
					customerid = data.id;
					var cart = convertUnassignedCartToCustomer(customerid, function (customerid, orderid) {
						continueCheckout(customerid, orderid);
					});
				}
				else {
					return;
				}
			});
		}
	}
	else
		continueCheckout(customerid, orderid);

};

// $scope.calculate_subtotal_edit = function(){
// 	var subtotal = 0;
// 	for(var i =0; i < $scope.order.lineitems.length; i++)
// 	{
// 		var lineitem = $scope.order.lineitems[i];
// 		var linetotal = lineitem.entered_quantity * lineitem.order_price * lineitem.qty_unit_multiplier;
// 		subtotal = subtotal + linetotal;
// 	}
// 	$scope.order.sub_total = subtotal;
// };

var calculateTax = async function (order, taxform_flag) {

	var tax_total = 0;
	const hsnHash = {};
	let hsn;
	let requests = [];

	for (var i = 0; i < order.lineitems.length; i++) {
		var lineitem = order.lineitems[i];
		lineitem.tax = 0;

		if ($scope.isTaxAutoCalculated()) {
			try {

      			var deferred = $q.defer();
      			requests.push(deferred.promise);

				if (lineitem.hsn.id in hsnHash) {
					hsn = hsnHash[lineitem.hsn.id];
				} else {
					const object = await masterService.getHsnById(lineitem.hsn.id);
					hsn = object.data.hsn;
					hsnHash[lineitem.hsn.id] = hsn;
				}
				let hsnDetailList = hsn.details.filter( row => lineitem.order_price >= row.amount_min && lineitem.order_price <= (row.amount_max || Number.MAX_VALUE) );
				if (hsnDetailList.length > 0) {
					lineitem.hsn.percent_gst    = hsnDetailList[0].percent_gst;
					lineitem.hsn.percent_cess   = hsnDetailList[0].percent_cess
					lineitem.hsn.percent_igst   = hsnDetailList[0].percent_igst;
					lineitem.hsn.percent_cgst   = hsnDetailList[0].percent_cgst;
					lineitem.hsn.percent_sgst   = hsnDetailList[0].percent_sgst;				

					lineitem.tax = parseFloat( (lineitem.order_quantity * lineitem.order_price - (lineitem.discount || 0) ) * (taxform_flag ? lineitem.hsn.percent_gst : lineitem.hsn.percent_gst)/100);
					lineitem.tax = (parseFloat(lineitem.tax) + parseFloat(lineitem.tax * lineitem.hsn.percent_cess/100));

				} else {
					lineitem.tax = 0;
				}

				deferred.resolve();	
				// if(lineitem.hsn.code == "6304")
				// {
				// 	if(lineitem.order_price > 999.99)
				// 		lineitem.hsn.percent_gst = 12;
				// 	else
				// 		lineitem.hsn.percent_gst = 5;
				// }


			} catch(ex) {
				lineitem.tax = 0;
			}
		}
		else
			lineitem.tax = getManualLineItemTax(lineitem);

		tax_total = tax_total + parseFloat(lineitem.tax);
		lineitem.is_taxable = (lineitem.tax > 0 ? 1 : 0);
	}

	if (requests.length > 0) {

	  	$q.all(requests).then(function () {

			if(tax_total && tax_total > 0)
				$scope.order.tax_total =  parseFloat(tax_total.toFixed(4));
			else
				$scope.order.tax_total = 0;

	    });

	} else {

		if(tax_total && tax_total > 0)
			$scope.order.tax_total =  parseFloat(tax_total.toFixed(4));
		else
			$scope.order.tax_total = 0;

	}



};

var getManualLineItemTax = function (lineitem) {
	return utilService.round( (lineitem.tax_percent || 0) * ((lineitem.order_quantity * lineitem.order_price) - (lineitem.discount || 0)) / 100, 2);
};

$scope.sumLineItemTax = function (order, lineitem) {

//	lineitem.tax = getManualLineItemTax(lineitem);
	calculateTax(order, order.customer.taxform_flag);

};

var calculateCommission = function (order) {
	var agent = order.customer.agent;
	$scope.commission = utilService.round((order.sub_total - order.discount_total)*agent.commission_rate/100, 2);;
	if (agent.more.hasOwnProperty('commission_rate_bonus')) {
		$scope.bonus_commission= utilService.round($scope.commission * agent.more.commission_rate_bonus/100, 2);
//					$scope.message = "Bonus commission:" + $scope.bonusCommission;
	}
};

$scope.confirm_order = function(){

	if(!$routeParams.customerid)
	{
		alert("Invalid customer");
		return false;
	}

	var cart = getCartFromLocalStorage($routeParams.customerid, $routeParams.orderid);
	if(cart == undefined)
	{
		alert("Cart is empty for customer");
		return false;
	}
	$scope.order = cart;

	$scope.order.is_dirty = true;

	//todo: do we need this?
	// $scope.edit_order = true;

	// // checkout process is going on
	// $scope.is_checkout_on = true;

	var today = new Date();
	$scope.order.order_date = today; 

	if($scope.order.ship_total == undefined)
		$scope.order.ship_total=0;
	if($scope.order.tax_total == undefined || $scope.order.tax_total == null)
		$scope.order.tax_total=0;
	if($scope.order.discount_total == undefined)
		$scope.order.discount_total=0;

	$scope.disablePaymentTerms 	= $scope.isPaymentTermsChangeAllowed();
	$scope.disableTransport 	= $scope.isTransportChangeAllowed();
	$scope.calculate_subtotal();

	if(cart !=null  && cart.lineitems.length >0)
	{
		getCustomerById($routeParams.customerid, function (customer) {
			$scope.order.customer = customer;
			taxflag = customer.taxform_flag;
			calculateTax($scope.order, taxflag);

			$scope.order.payment_terms_id	= $scope.order.customer.payment_term.id;
			$scope.order.transporters_id 	= $scope.order.customer.transporter.id;

			// if agent is logging in, show the bonus rate
			if (utilService.isUserAnAgent()) {
				calculateCommission($scope.order);
			}

		});
	}
	else
	{
		flash.pop({title: "", body: "No items to checkout.", type: "error"});
		//alert("No items to checkout");
	}

	getPaymentTerms();
	getTransporters();

};

 //THIS IS ANOTHER WAY TO DO LOOP. NOT USING AS ANOTHER APPROACH WORKED. BUT FOLLOWING WORKS FINE TOO  
 var addElement = function (paths) {
	 for (var i = 0, c = paths.length; i < c; i++)
	{
	  // creating an Immiedately Invoked Function Expression
	  (function( path ) {
			categoryService.getCategory(path, function (response) {
				if (response.statuscode == 0 && response.data && response.data.category) {
					$scope.product.category_list.push(response.data.category);
				}
			});
		})( paths[i] );
	  // passing paths[i] in as "path" in the closure
	}
 };
 

 $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
 };

 $scope.orderPageChanged = function() {

 	options = utilService.getOrderFilters();

 	if (!options) options = {};

	options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	$scope.show_orders(options);
 };

 $scope.packingslipPageChanged = function () {

 	options = utilService.getPackingslipFilters();

 	if (!options) options = {};

	options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	$scope.getPackingSlips(options);
 };
 
 $scope.deliveryNotesPageChanged = function () {

 	options = utilService.getDeliveryNoteFilters();

 	if (!options) options = {};

	options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	$scope.getDeliveryNotes(options);

 };
 
 $scope.redirect_to_prepare =  function (){
	var order = $scope.order;
	$location.path("/orders/"+ order.id + "/prepare/");
 };
 
 $scope.prepare = function(){

 	$scope.packingslip = {"slip_number":"", "packing_date":"", "order":undefined, "id":"", "lineitems":[]};
 	$scope.packingslip.packing_date = new Date();

	orderService.findById($routeParams.id, function(response){
		if (response.statuscode == 0 && response.data && response.data.order) {
			$scope.order	         = response.data.order;
			$scope.order.order_date  = utilService.convertToClientTimeZone($scope.order.order_date);
			$scope.order.payment_due_date = utilService.convertToClientTimeZone($scope.order.payment_due_date);
			$scope.packingslip.order = $scope.order;
		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
 	});
 };
 
 $scope.createPackingslip = function(packingslip, redirectToSameScreen){

 	$scope.isDisabled = true;

	// first clear existing item in packing slip if any
	$scope.packingslip.lineitems.splice(0);

	var count = 0; 
 	for (j = 0; j < $scope.packingslip.order.lineitems.length; j++) {
 		if ($scope.packingslip.order.lineitems[j].packingslip_lineitems && $scope.packingslip.order.lineitems[j].packingslip_lineitems.length > 0) {
 			for (i = 0; i < $scope.packingslip.order.lineitems[j].packingslip_lineitems.length; i++) {
 				count++;
 				$scope.packingslip.lineitems.push($scope.packingslip.order.lineitems[j].packingslip_lineitems[i]);
 			}
 		}
 	}

 	if (count == 0) {
 		$scope.isDisabled = false;
 		alert("Please enter packing information by clicking 'Add' on line item");
 		return false;
 	}

	orderService.createPackingslip($scope.packingslip, function(response){
  		if (response.statuscode == 0 && response.data && response.data.packingslip) {
  			flash.pop({title: "", body: "Packingslip created succesfully", type: "success"});
  			if (redirectToSameScreen && response.data.packingslip.order && response.data.packingslip.order.sysorderstatuses_id == 4201) {
  				$location.path("/orders/" + $scope.packingslip.order.id + "/prepare/");

  				//Reload the same route so page will be refreshed.
  				$route.reload();
  			}
  			else
				$location.path("/orders/");
		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
		else {
			flash.pop({title: "", body: response.message, type: "error"});
		}
	});
};

$scope.exceedsToday = function(date) {
	return utilService.exceedsToday(date);
}

$scope.isAmountDue = function(amount) {
	return utilService.isAmountDue(amount);
}

// save the session ID
//$scope.productid  = $routeParams.id;
$scope.init();

if($rootScope.action != undefined)
{
	var actionname = $rootScope.action;
	if ($rootScope.parameters && $rootScope.parameters.clear && $rootScope.parameters.clear == 1) {
		$location.search({});
		$scope.search_section = {};
	}
	$scope[actionname]();
} 
});
 