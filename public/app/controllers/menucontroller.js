app.controller('menucontroller', function ($scope, $http, $location, $routeParams, $rootScope, utilService, userService, hotkeys) {

 $scope.checkSession = function() {
	var lastSyncDateTime = utilService.getLastSyncDateTime();
	var sessionID = userService.getCookie();
    if(lastSyncDateTime != undefined)
    {
      var nowDateTime = Date.now();
      var lastSyncDate = Date.parse(lastSyncDateTime);
      var diff = Math.abs(nowDateTime - lastSyncDate);
      var minutes = Math.floor((diff/1000)/60);

      if (minutes > 5) {
        userService.getSession(function(response){
        	if (response.statuscode == 0 && response.data && response.data.session) {
          		utilService.initializeSession(response.data.session);
          	}
        })
      }
    } 
}
$scope.load = function() {
	if(!utilService.getLoadingFlag())
		utilService.clearLoadingFlag();
}
$scope.showMobileMenu = false;

$scope.toggleMobileMenu = function(){
	$scope.showMobileMenu = !$scope.showMobileMenu;
}

$scope.getIcon = function(column) {

  if ($scope.sortBy == column) {
	if($scope.sortDirection){
		return $scope.sortDirection == 1
		? 'fa fa-angle-up'
		: 'fa fa-angle-down';
	  }
	}
  return '';

}

$scope.checkSession();

 $scope.isOneTimeSession = function () {
 	return (utilService.isOneTimeSession());
 };

 $scope.isUsersVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_USER) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_USER_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_USER_UPDATE) == "1"));
 };

 $scope.isWorkflowVisible = function () {
 	return ($scope.isWorkflowModuleOn() && (utilService.getPermission(utilService.CONST_PERMISSION_WORKFLOW_SETUP) == "1"));
 };

 $scope.isRolesVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_USER) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_ROLE_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_ROLE_UPDATE) == "1"));
 };
 
 $scope.isCatalogVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_INVENTORY) == '1' && (utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_UPDATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_CATEGORY_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_CATEGORY_UPDATE) == "1"));
 };
 
 $scope.isStockVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PRODUCT_STOCK) == '1' && (utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_PRODUCT_UPDATE) == "1"));
 };
 
 $scope.isStockSummaryVisible = function () {
	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PRODUCT_STOCK) == '1' && utilService.getPermission(utilService.CONST_PERMISSION_STOCK_SUMMARY_VIEW) == "1");
 };

 $scope.isWorkflowModuleOn = function() {
 	return (
 		utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_APPROVAL_RATE_DIFF) == "1" ||
 		utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_APPROVAL_PAYMENT_DUE) == "1" ||
 		utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_APPROVAL_CREDIT_LIMIT) == "1"
	);
 };

 $scope.isUserLoggedOn = function () {
 	return (utilService.isUserLoggedOn());
 };

 $scope.isUserSiteAdmin = function() {
 	return (utilService.isUserSiteAdmin());
 }

 $scope.isTransportersVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_TRANSPORTER) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_TRANSPORTER_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_TRANSPORTER_UPDATE) == "1"));
 };

 $scope.isOrdersVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_ORDER) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_ORDER_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_ORDER_APPROVE) == "1"));
 };

 $scope.isDeliveryNoteVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_DELIVERY_NOTE) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_UPDATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_DELIVERY_NOTE_VIEW) == "1"));
 };

 $scope.isPackingslipsVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PACKING_SLIP) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_PACKING_SLIP_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_PACKING_SLIP_CANCEL) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_PACKING_SLIP_VIEW) == "1"));
 };

 $scope.isPaymentTermsVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PAYMENT_TERM) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_PAYMENTTERM_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_PAYMENTTERM_UPDATE) == "1"));
 };

 $scope.isAgentsVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_AGENT) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_AGENT_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_AGENT_UPDATE) == "1"));
 };

 $scope.isReportsVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_REPORT) == "1" );
 };

 $scope.isInventoryVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_INVENTORY) == "1");
 };

 $scope.isNormalCompany = function () {
 	return (utilService.getTemplateID() == 6302 ? false : true);
 };

 $scope.isNotificationsVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_NOTIFICATION_SMS) == "1" || utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_NOTIFICATION_EMAIL) == '1');
 };

 $scope.isCustomersVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_CUSTOMER) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_UPDATE) == "1"));
 };

 $scope.isCustomerTypesVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_MULTIPLE_RATE) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMERTYPE_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMERTYPE_UPDATE) == "1"));
 };

 $scope.isPriceGroupVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_PRODUCT_PRICE_GROUP) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_PRICEGROUP_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_PRICEGROUP_UPDATE) == "1"));
 };

 $scope.isUnitOfMeasureVisible = function () {
	return (utilService.getPermission(utilService.CONST_PERMISSION_UNIT_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_UNIT_UPDATE) == "1");
 };

 $scope.isStockSummaryVisible = function () {
	return (utilService.getPermission(utilService.CONST_PERMISSION_STOCK_SUMMARY_VIEW) == "1");
 };

 $scope.isBillsVisible = function () {
	return (utilService.getPermission(utilService.CONST_PERMISSION_BILL_VIEW) == "1");
 };

 $scope.getCompanyLogo = function() {
	var logo = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_LOGO));
	if (!logo || logo == -100)
		logo = "upload/logo_simply.jpg";

	return logo;
 };

 $scope.getUserName = function() {
	return (utilService.getUserInfo('first_name') + ' ' + utilService.getUserInfo('last_name'));
 };

 $scope.showReports = function() {
	$scope.showMobileMenu = false;
	$location.path("/reports/" );
 };

 $scope.showDashboard = function() {
 	if (utilService.isUserLoggedOn())
		$location.path("/users/dashboard");
 };

 $scope.showAgents = function () {
	$scope.showMobileMenu = false;
	$location.path("/agents/" );
 };

 $scope.showCustomers = function () {
	$scope.showMobileMenu = false;
	utilService.clearCustomerFilters();
	$location.path("/customers/" );
 };

  $scope.showBills = function () {
	  $scope.showMobileMenu = false;
	utilService.clearBillFilters();
	$location.path("/bills/" );
 };

 $scope.showNotifications = function () {
	$scope.showMobileMenu = false;
	utilService.clearNotificationFilters();
	$location.path("/notifications/" );
 };

 $scope.showPaymentTerms = function () {
	$scope.showMobileMenu = false;
	$location.path("/paymentterms/" );
 };

 $scope.showTransporters = function () {
	$scope.showMobileMenu = false;
	$location.path("/transporters/" );
 };

 $scope.showCustomerTypes = function () {
	$scope.showMobileMenu = false;
	$location.path("/customertypes/" );
 };

 $scope.showRoles = function () {
	$scope.showMobileMenu = false;
	$location.path("/roles/" );
 };

 $scope.showUsers = function () {
	 $scope.showMobileMenu = false;
	$location.path("/users/" );
 };

 $scope.showWorkflow = function () {
	$scope.showMobileMenu = false;
	$location.path("/workflowsetup/" );
 };

 $scope.showUploads = function () {
	$scope.showMobileMenu = false;
	$location.path("/uploads/" );
 };

 $scope.showPackingslips = function () {
	$scope.showMobileMenu = false;
 	utilService.clearPackingslipFilters();
	$location.path("/packingslips/" );
 };

 $scope.showHSNs = function () {
	$scope.showMobileMenu = false;
	$location.path("/hsns/" );
 };

 $scope.showDeliveryNotes = function () {
	 $scope.showMobileMenu = false;
 	utilService.clearDeliveryNoteFilters();
	$location.path("/deliverynotes/" );
 };

 $scope.showOrders = function () {
	 $scope.showMobileMenu = false;
 	utilService.clearOrderFilters();
	$location.path("/orders/" );
 };

 $scope.showOrderCatalog = function () {
	$location.path("/Home/"  ).search( {withproductsonly:1} );
 };

 $scope.showStockBatches = function () {

	$scope.showMobileMenu = false;
	utilService.clearBucketFilters();
	$location.path("/stockbuckets/" );
 };

 $scope.showStockJournal = function () {
    $scope.showMobileMenu = false;
	utilService.clearJournalFilters();
	$location.path("/stockjournal/" );
 };

 $scope.showUnits = function () {
	 $scope.showMobileMenu = false;
	$location.path("/unitofmeasures/" );
 };

 $scope.showPriceGroups = function () {
	 $scope.showMobileMenu = false;
	$location.path("/pricegroups/" );
 };

 $scope.showQuickOrder = function () {
	 $scope.showMobileMenu = false;
	$location.path("/quickorder/" );
 };

 $scope.showCatalog = function () {
	$scope.showMobileMenu = false;
	$location.path("/categories/" );
 };

$scope.showChangePasswordForm = function () {
	userService.getSession(function (response) {
		if (response.statuscode == 0 && response.data && response.data.session) {
			$location.path("/users/password/"+ response.data.session.user.id);
		}
	});
};

$scope.showProfileForm = function () {
	userService.getSession(function (response) {
		if (response.statuscode == 0 && response.data && response.data.session) {
			$location.path("/AddUser/"+ response.data.session.user.id);
		}
	});
};
 
  /*hotkeys.bindTo($scope).add({
	'combo': 'esc',
	'description': 'Back',
	callback: function() {
		history.go(-1);
	}
  });*/

 if ($scope.isAgentsVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'a',
		'description': 'Show Agents',
		callback: function() {
			$scope.showAgents();
	 	}
	});
 }

 if ($scope.isStockVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'b',
		'description': 'Show Stock Batches',
		callback: function() {
			$scope.showStockBatches();
	 	}
	});
 }

 if ($scope.isCustomersVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'c',
		'description': 'Show Customers',
		callback: function() {
			$scope.showCustomers();
	 	}
	});
 }

 if ($scope.isCustomerTypesVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'C',
		'description': 'Show Rate Categories',
		callback: function() {
			$scope.showCustomerTypes();
	 	}
	});
 }

if ($scope.isNotificationsVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'f',
		'description': 'Show Notifications',
		callback: function() {
			$scope.showNotifications();
	 	}
	});
 }

 if ($scope.isPriceGroupVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'g',
		'description': 'Show Price Groups',
		callback: function() {
			$scope.showPriceGroups();
	 	}
	});
 }

 if ($scope.isCatalogVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'i',
		'description': 'Show Inventory',
		callback: function() {
			$scope.showCatalog();
	 	}
	});
 }

 if ($scope.isStockVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'j',
		'description': 'Show Stock Journal',
		callback: function() {
			$scope.showStockJournal();
	 	}
	});
 }

hotkeys.bindTo($scope).add({
	'combo': 'l',
	'description': 'Show Catalog',
	callback: function() {
		$scope.showOrderCatalog();
 	}
});

 if ($scope.isDeliveryNoteVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'n',
		'description': 'Show Delivery Notes',
		callback: function() {
			$scope.showDeliveryNotes();
	 	}
	});
 }

 if ($scope.isOrdersVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'o',
		'description': 'Show Orders',
		callback: function() {
			$scope.showOrders();
	 	}
	});
 }

 if ($scope.isPaymentTermsVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'p',
		'description': 'Show Payment Term',
		callback: function() {
			$scope.showPaymentTerms();
	 	}
	});
 }

 if ($scope.isOrdersVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'q',
		'description': 'Quick Order',
		callback: function() {
			$scope.showQuickOrder();
	 	}
	});
 }

 if ($scope.isRolesVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'r',
		'description': 'Show Roles',
		callback: function() {
			$scope.showRoles();
	 	}
	});
 }

 if ($scope.isBillsVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'u',
		'description': 'Show Outstanding',
		callback: function() {
			$scope.showBills();
	 	}
	});
 }

 if ($scope.isPackingslipsVisible() || $scope.isDeliveryNoteVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 's',
		'description': 'Show Packing Slips',
		callback: function() {
			$scope.showPackingslips();
	 	}
	});
 }

 if ($scope.isTransportersVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 't',
		'description': 'Show Transporters',
		callback: function() {
			$scope.showTransporters();
	 	}
	});
 }
/*
 if ($scope.isUsersVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'u',
		'description': 'Show Users',
		callback: function() {
			$scope.showUsers();
	 	}
	});
 }
*/
 if ($scope.isUnitOfMeasureVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'U',
		'description': 'Show Units',
		callback: function() {
			$scope.showUnits();
	 	}
	});
 }

 if ($scope.isWorkflowVisible()) {
	hotkeys.bindTo($scope).add({
		'combo': 'w',
		'description': 'Show Workflow',
		callback: function() {
			$scope.showWorkflow();
	 	}
	});
 }

 $scope.id         = $routeParams.id;

});


app.directive('bsActiveLink', ['$location', function ($location) {
	return {
		restrict: 'A', //use as attribute
		replace: false,
		link: function (scope, elem) {
			//after the route has changed
			scope.$on("$routeChangeSuccess", function () {
				var hrefs = ['/#' + $location.path(),
					'#' + $location.path(), //html5: false
					$location.path()]; //html5: true
				angular.forEach(elem.find('a'), function (a) {
					a = angular.element(a);
					if (-1 !== hrefs.indexOf(a.attr('href'))) {
						a.parent().addClass('active');
					} else {
						a.parent().removeClass('active');
					};
				});
			});
		}
	}
}]);

//app.directive('menu1', function(){
//	return {
//		restrict: 'E',
//		replace: true,
//		transclude: true,
//		scope: {
//			active: '=',
//			lol: '&'
//		},
//		template: '<a ng-click="active = $id; lol({param: param});" class="select-show" ng-class="{active: $id === active}" ng-transclude></a>'
//	}
//});