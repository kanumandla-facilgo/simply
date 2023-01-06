app.controller('mastercontroller', function ($scope, $sce, $http, $location, masterService, userService, utilService, $routeParams, $rootScope, $route, hotkeys, flash) {

$scope.utilService = utilService;

var MAX_PAGES 	= 15;
var MAX_PAGES_MOBILE 	= 8;

var PAYMENT_STATUS_ACTIVE = 5800;
var PAYMENT_STATUS_PAID	= 5801;
var PAYMENT_STATUS_PARTIALLY_PAID = 5802;
var PAYMENT_STATUS_INACTIVE  = 5803;

$scope.itemsPerPage = utilService.getRecordsPerPage();
$scope.max_pages	= MAX_PAGES;
$scope.max_pages_mobile	= MAX_PAGES_MOBILE;

$scope.a = function(c) { console.log(utilService.CONST_CONFIG_MODULE_CUSTOMER_GST); console.log(c);return (utilService.isConfigurationOn(c) == '1'); }
 $scope.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
 };

 $scope.pageChanged = function() {

 	options = utilService.getCustomerFilters();

 	if (!options) options = {};

	options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	$scope.show_customers(options);

 };

 $scope.isMobileApp = function() {
 	return isMobileApp();
 }

$scope.getBillStatusCssClass = function(statusid)
{
	if(statusid == PAYMENT_STATUS_ACTIVE)
		return "mobileIconBlue";
	else if(statusid == PAYMENT_STATUS_PAID)
		return "mobileIconGreen";
	else if(statusid == PAYMENT_STATUS_PARTIALLY_PAID)
		return "mobileIconOrange";
	else
		return "mobileIconGrey"
}

 $scope.pageBillChanged = function() {

 	options = utilService.getBillFilters();

 	if (!options) options = {};

	options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	$scope.show_bills(options);

 };

 $scope.pageNotificationChanged = function() {

 	options = utilService.getNotificationFilters();

 	if (!options) options = {};

	options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	$scope.show_notifications(options);

 };

 hotkeys.bindTo($scope).add({
		'combo': 'alt+s',
		'description': 'Save Masters',
		callback: function() {
			if ($rootScope.title == "Add Payment Term")
				$scope.savePaymentTerm();
			else if ($rootScope.title == "Add Transporter")
				$scope.saveTransporter();
			else if ($rootScope.title == "Add Customer")
				$scope.saveCustomer();
			else if ($rootScope.title == "Add Agent")
				$scope.saveAgent();
			else if ($rootScope.title == "Add Company")
				$scope.saveCompany();
			else if ($rootScope.title == "Add Rate Category")
				$scope.saveCustomerType();
			else if ($rootScope.title == "Add Uom")
				$scope.saveUnitOfMeasure();
	 	}
 });
 
 $scope.isCustomerCodeRequired = function () {
	$scope.customer_code_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_CUSTOMER_CODE_REQD) == "1");
	return $scope.customer_code_edit_flag;
 };

 $scope.enableCustomerCodeEdit = function () {
	$scope.customer_code_edit_flag = true;
 };

 $scope.isCustomerCodeEditAllowed = function() {
	return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_CUSTOMER_CODE_REQD) == "0") && (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_CODE_EDIT) == '1'));
 };

 $scope.initUnitOfMeasure = function() {
	$scope.uom = {"id":-1, "name":"", "description":"", "is_system":0, "display_flag":1, "conversion_list":[]};
 };

 $scope.showAddUnitOfMeasureForm = function() {
	$location.path("/AddUom/" );
 };
 
 $scope.uomRowClick = function(id) {
	if ($scope.isEditUnitOfMeasureAllowed())
		$scope.showEditUnitOfMeasureForm(id);
 }

 $scope.showEditUnitOfMeasureForm = function(id) {
	$location.path("/AddUom/" + id );
 };
 
 $scope.addUOMConversionToProduct1 = function () {
	$scope.product.pricegroup.uomconversionlist.push(utilService.initUOMConversion());
 };

 $scope.removeUOMConversionFromArrayProduct1 = function (index) {
	$scope.product.pricegroup.uomconversionlist.splice(index, 1);
 };

 $scope.addUOMConversionToProduct = function () {
	if (!$scope.uom.conversion_list)
 		$scope.uom.conversion_list = [];
	$scope.uom.conversion_list.push(utilService.initUOMConversion());
 };

 $scope.addHSNDetail = function () {
	if (!$scope.hsn.details)
 		$scope.hsn.details = [];

	$scope.hsn.details.push({"amount_min": "", "amount_max": "", "percent_gst": "", "percent_sgst": "", "percent_igst": "", "percent_cgst": "", "percent_cess": "", "start_date": "", "end_date": "" });

	// initialize the value of max of new line item
	if ($scope.hsn.details.length > 1) $scope.hsn.details[$scope.hsn.details.length - 1].amount_min = $scope.hsn.details[$scope.hsn.details.length - 2].amount_max + 0.01;
 };

 $scope.removeHSNDetail = function (index) {
	$scope.hsn.details.splice(index, 1);
 };

 $scope.isUserACustomer = function () {
	return (utilService.isUserACustomer());
 };

 $scope.isAgentsVisible = function () {
 	return (utilService.isConfigurationOn(utilService.CONST_CONFIG_MODULE_AGENT) == "1" && (utilService.getPermission(utilService.CONST_PERMISSION_AGENT_CREATE) == "1" || utilService.getPermission(utilService.CONST_PERMISSION_AGENT_UPDATE) == "1"));
 };

 $scope.removeUOMConversionFromArrayProduct = function (index) {
	$scope.uom.conversion_list.splice(index, 1);
 };
 
 $scope.isAgentFilterVisible = function() {
 	return (utilService.isUserAnAdministrator() || utilService.isUserASalesPerson() || utilService.isUserACompanyUser() );
 };

 $scope.isSalesmanFilterVisible = function() {
 	return (utilService.isUserAnAdministrator() || utilService.isUserACompanyUser());
 };

 $scope.isTransporterCodeRequired = function () {
	$scope.transporter_code_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD) == "1");
	return $scope.transporter_code_edit_flag;
 };

 $scope.enableTransporterCodeEdit = function () {
	$scope.transporter_code_edit_flag = true;
 };

 $scope.isTransporterCodeEditAllowed = function() {
	return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD) == "0"));
 };

 $scope.isAddTransporterAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_TRANSPORTER_CREATE) == '1');
 };

 $scope.isEditTransporterAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_TRANSPORTER_UPDATE) == '1');
 };

 $scope.isDeleteTransporterAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_TRANSPORTER_DELETE) == '1');
 };

 $scope.isAddPaymentTermAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_PAYMENTTERM_CREATE) == '1');
 };

 $scope.isEditPaymentTermAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_PAYMENTTERM_UPDATE) == '1');
 };

  $scope.isDeletePaymentTermAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_PAYMENTTERM_DELETE) == '1');
 };
 
 $scope.isAddCustomerAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_CREATE) == '1');
 };

 $scope.isEditCustomerAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_UPDATE) == '1');
 };

 $scope.isDeleteCustomerAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_DELETE) == '1');
 };
 
 $scope.isAddAgentAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_AGENT_CREATE) == '1');
 };

 $scope.isEditAgentAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_AGENT_UPDATE) == '1');
 };

 $scope.isDeleteAgentAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_AGENT_DELETE) == '1');
 };

 $scope.isAgentCodeRequired = function () {
	$scope.agent_code_edit_flag = (utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_AGENT_CODE_REQD) == "1");
	return $scope.agent_code_edit_flag;
 };

 $scope.enableAgentCodeEdit = function () {
	$scope.agent_code_edit_flag = true;
 };

 $scope.isAgentCodeEditAllowed = function() {
	return ((utilService.getConfiguration(utilService.CONST_CONFIG_COMPANY_AGENT_CODE_REQD) == "0"));
 };

 $scope.isAddCustomerTypeAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMERTYPE_CREATE) == '1');
 };

 $scope.isEditCustomerTypeAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMERTYPE_UPDATE) == '1');
 };

 $scope.isDeleteCustomerTypeAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMERTYPE_DELETE) == '1');
 };

 $scope.isCustomerTypeChangeAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_TYPE_CHANGE) == '1');
 };
 
 $scope.isUpdateCustomerBalanceAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE) == '1');
 };

 $scope.isAddUnitOfMeasureAllowed = function() {
	return (utilService.getPermission(utilService.CONST_PERMISSION_UNIT_CREATE) == '1');
 };

 $scope.isEditUnitOfMeasureAllowed = function() {
	return (utilService.getPermission(utilService.CONST_PERMISSION_UNIT_UPDATE) == '1');
 };

 $scope.isDeleteUnitOfMeasureAllowed = function(x) {
	return (utilService.getPermission(utilService.CONST_PERMISSION_UNIT_DELETE) == '1' && x.is_system == 0);
 };

 $scope.transporterRowClick = function(id) {
 	if ($scope.isEditTransporterAllowed()) {
 		$scope.showEditTransporterForm(id);
 	}
 }

 $scope.showEditTransporterForm = function(id) {
	$location.path("/AddTransporter/" + id );
 };

 $scope.showAddTransporterForm = function() {
 	$scope.initTransporter();
	$location.path("/AddTransporter/" );
 };

 $scope.showAddCustomerForm = function() {
	$location.path("/AddCustomer/" );
 };

 $scope.showAddAgentForm = function() {
	$location.path("/AddAgent/" );
 };

 $scope.customerRowClick = function(id) {
 	if ($scope.isEditCustomerAllowed())
		$scope.showEditCustomerForm(id);
 }

 $scope.showEditCustomerForm = function(id) {
	$location.path("/AddCustomer/" + id );
 };

 $scope.agentRowClick = function(id) {
 	if ($scope.isEditAgentAllowed())
		$scope.showEditAgentForm(id);
 }

 $scope.showEditAgentForm = function(id) {
	$location.path("/AddAgent/" + id );
 };

 $scope.customerTypeRowClick = function(id) {
 	if ($scope.isEditCustomerTypeAllowed())
		$scope.showEditCustomerTypeForm(id);
 }

 $scope.showEditCustomerTypeForm = function(id) {
	$location.path("/AddCustomerType/" + id );
 };

 $scope.showAddCustomerTypeForm = function() {
 	$scope.initTransporter();
	$location.path("/AddCustomerType/" );
 };

 $scope.paymentTermRowClick = function(id) {
 	if ($scope.isEditPaymentTermAllowed())
 		$scope.showEditPaymentTermForm(id);
 }

 $scope.showEditPaymentTermForm = function(id) {
	$location.path("/AddPaymentTerm/" + id );
 };

 $scope.showAddPaymentTermForm = function(id) {
 	$scope.initPaymentTerm();
	$location.path("/AddPaymentTerm/");
 };

 $scope.initPaymentTerm = function() {
     $scope.PaymentTerm = {"id":-1, "description":"", "code":"", "company_id":"", "status_id":"", "days":"0"};
 };

 $scope.initTransporter = function() {
     $scope.transporter = {"id":-1, "name":"", "code":"", "company_id":"", "status_id":"", "address": {"first_name":"", "last_name":"", "address1":"", "address2":"", "address3":"", "city":"", "state":"", "zip":"", "phone1":"", "phone2":"", "email1":"", "email2":""}};
 };

 $scope.initCustomer = function() {
     $scope.customer = {"id":-1, "name":"", "code":"", "invoicing_name":"", "status_id":"", "address": {"first_name":"", "last_name":"", "address1":"", "address2":"", "address3":"", "city":"", "state":"", "zip":"", "phone1":"", "phone2":"", "email1":"", "email2":""}, "pan_number":"", "cst_number":"", "excise_number":"", "vat_number":"", "gst_number":"", "allowed_balance": 0, "current_balance": 0, "current_overdue": 0, "payment_reminder_on": 1, "order_notification_on": 1};
 };

 $scope.initCustomerType = function() {
     $scope.customer = {"id":-1, "name":"", "description":"", "balance_limit":""};
 };
 
 $scope.copyToShipToAddress = function () {
 	isCopy = true;
 	if($scope.editmode)
 		isCopy = confirm("Copying shipping address will replace the existing shipping address. Do you want to copy?")

 	if ($scope.copyShipAddress && isCopy)
 	{
 		ship_address_id = $scope.customer.ship_address.id;
 		$scope.customer.ship_address = angular.copy($scope.customer.address);
 		$scope.customer.ship_address.id = ship_address_id;
 	}
 };
 
 $scope.copyToBillToAddress = function () {
 	isCopy = true;
 	if($scope.editmode)
 		isCopy = confirm("Copying billing address will replace the existing billing address. Do you want to copy?")

 	if ($scope.copyBillAddress && isCopy)
 	{
 		bill_address_id = $scope.customer.bill_address.id;
 		$scope.customer.bill_address = angular.copy($scope.customer.address);
 		$scope.customer.bill_address.id = bill_address_id;
 	}
 };

 $scope.onBlurCustomer = function (obj, keyname) {
	if (!obj)
		masterService.clearCustomer(keyname);
 };

 $scope.onSelectedCustomer = function (item, model, label, event, keyname) {
  	$scope.customer = item;
  	masterService.setCustomer(item, keyname);
 };


 $scope.onSelectedMultipleCustomer = function (item, keyname) {
 	
 	$scope.customer_m = '';
 	if(!$scope.customers)
		$scope.customers = [];

	let cust = $scope.customers.filter(x => x.id == item.id);
	if((cust) && (cust[0] == undefined))
	{
		if((item.address.phone1 == undefined) || (item.address.phone1 == null) || (item.address.phone1 == ''))
			alert("Couldn't select this customer, the selected customer doesn't have phone number")
		else
		{
			$scope.customers.push(item);
			masterService.setCustomer($scope.customers, keyname);
		}
	}
 };

 $scope.showCustomers = function () {
 	
 	if(($scope.customers) && ($scope.customers.length > 0))
		return true;
	return false;
};

// $scope.deleteCustomer = function (item) {
 	
//  	var index = $scope.customers.indexOf(item);
//     $scope.customers.splice(index, 1);
// };

$scope.setCustomerTypeSortParameters = function(sortby, sortdirection) {

	$scope.sortBy = sortby;
	$scope.sortDirection = sortdirection;

}

//To get the Customer List
$scope.getCustomerTypes = function(){

 	let options = {};

	options.sortby        = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;

	masterService.getCustomerTypes(options, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.companytypelist) {
 			$scope.companytypelist     = response.data.companytypelist;
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {

 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

};

$scope.setTransporterSortParameters = function(sortby) {

	if ($scope.sortBy == sortby) {
		$scope.sortDirection = $scope.sortDirection * -1;
 	}
 	else {
		$scope.sortBy = sortby;
		$scope.sortDirection = 1;
	}

}

 //To get the transporter list	
  $scope.getTransporters = function(activeonly) {

 	let options = {};

 	options.activeonly    = ($scope.activeonly && $scope.activeonly == true ? true : false);
	options.sortby        = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;

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

  };

  $scope.exportTransportersToExcel = function () {

	let options = {};

 	options.activeonly    = ($scope.activeonly && $scope.activeonly == true ? true : false);
	options.sortby        = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	options.format = "excel";

  	masterService.getTransporters(options, function(response) {
		if (response.statuscode == 0) {
			var anchor = angular.element('<a/>');
			var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
			anchor.attr({
				href: window.URL.createObjectURL(blob),
				target: '_blank',
				download: 'Transporters.xlsx'
		})[0].click();
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
		});
 };
  
$scope.setPaymentTermSortParameters = function(sortby, sortdirection) {

	if ($scope.sortBy == sortby) {
		$scope.sortDirection = $scope.sortDirection * -1;
	 }
	 else {
		$scope.sortBy = sortby;
		$scope.sortDirection = 1;
	}

}

 //To get the Payment Term list
 $scope.getPaymentTerms = function(){

 	let options = {};

 	options.activeonly    = ($scope.activeonly && $scope.activeonly == true ? true : false);
	options.sortby        = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;

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
 };

//To get the User list
$scope.getUsers = function(){
userService.getUsers(null, 4004, 4600, undefined, undefined, function(response) {
				if (response.statuscode == 0 && response.data && response.data.userlist) {
					$scope.userlist     = response.data.userlist;
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});
};

 var setSearchCriteriaToQueryString = function() {
 
	if ($scope.search_section && $scope.search_section.statusid && $scope.search_section.statusid != "")
		$location.search("statusid", $scope.search_section.statusid); 
	else
		$location.search("statusid", null); 

	if ($scope.search_section && $scope.search_section.city_name && $scope.search_section.city_name != "")
		$location.search("city_name", $scope.search_section.city_name); 
	else
		$location.search("city_name", null); 

	if ($scope.search_section && $scope.search_section.state_name && $scope.search_section.state_name != "")
		$location.search("state_name", $scope.search_section.state_name); 
	else
		$location.search("state_name", null); 

	if ($scope.search_section && $scope.search_section.doc_number && $scope.search_section.doc_number != "")
		$location.search("doc_number", $scope.search_section.doc_number); 
	else
		$location.search("doc_number", null); 
 };

 var initPageNumberFilters = function(options) {

 	if (!$scope.currentPage)
		$scope.currentPage = 1;
 	// if (!$scope.currentPage) $scope.currentPage = 1;
 	// if (!$scope.itemsPerPage) $scope.itemsPerPage = 20;

 	options.page_number = $scope.currentPage;
	options.page_size = $scope.itemsPerPage;

	return options;
 };

 $scope.setCustomerSortParameters = function(sortby, sortdirection) {
// console.log($scope.sortDirection);
 	if ($scope.sortBy == sortby) {
		$scope.sortDirection = $scope.sortDirection * -1;
 	}
 	else {
		$scope.sortBy = sortby;
		$scope.sortDirection = 1;
	 }

 }

 $scope.setBillSortParameters = function(sortby, sortdirection) {
// console.log($scope.sortDirection);
 	if ($scope.sortBy == sortby) {
		$scope.sortDirection = $scope.sortDirection * -1;
 	}
 	else {
		$scope.sortBy = sortby;
		$scope.sortDirection = 1;
	 }

 }

 $scope.setNotificationsSortParameters = function(sortby, sortdirection) {

 	if ($scope.sortBy == sortby) {
		$scope.sortDirection = $scope.sortDirection * -1;
 	}
 	else {
		$scope.sortBy = sortby;
		$scope.sortDirection = 1;
	 }

 }

 $scope.search_customers = function () {

	options = {};
	options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
	options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
	options.city_name = ($scope.search_section && $scope.search_section.city_name ? $scope.search_section.city_name : undefined);
	options.state_name = ($scope.search_section && $scope.search_section.state_name ? $scope.search_section.state_name : undefined);
	options.customer_name = ($scope.search_section && $scope.search_section.customer_name ? $scope.search_section.customer_name : undefined);
	options.agent_id = ($scope.search_section && $scope.search_section.agent ? $scope.search_section.agent.id : undefined);
	options.sales_person_id = ($scope.search_section && $scope.search_section.sales_person ? $scope.search_section.sales_person.id : undefined);

	options = initPageNumberFilters(options);

	// options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	// options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	// $scope.sortIcon = $scope.sortDirection == -1 ? 'desc' : 'asc';

	utilService.setCustomerFilters(options);

	$scope.show_customers(options);

 };

 $scope.search_bills = function () {

	options = {};
	options.bill_number   = ($scope.search_section && $scope.search_section.bill_number ? $scope.search_section.bill_number : undefined);
	options.bill_ref_number   = ($scope.search_section && $scope.search_section.bill_ref_number ? $scope.search_section.bill_ref_number : undefined);
	options.status_id   = ($scope.search_section && $scope.search_section.status_id ? $scope.search_section.status_id : undefined);
	options.fromdate = ($scope.search_section && $scope.search_section.fromdate ? new Date($scope.search_section.fromdate) : undefined);
	options.todate = ($scope.search_section && $scope.search_section.todate ? new Date($scope.search_section.todate) : undefined);
	options.duedatefrom = ($scope.search_section && $scope.search_section.duedatefrom ? new Date($scope.search_section.duedatefrom) : undefined);
	options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
	options.duedateto = ($scope.search_section && $scope.search_section.duedateto ? new Date($scope.search_section.duedateto): undefined);
	options.nextreminderfrom = ($scope.search_section && $scope.search_section.nextreminderfrom ? new Date($scope.search_section.nextreminderfrom) : undefined);
	options.nextreminderto = ($scope.search_section && $scope.search_section.nextreminderto ? new Date($scope.search_section.nextreminderto): undefined);
	
	options = initPageNumberFilters(options);

	// options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	// options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	// $scope.sortIcon = $scope.sortDirection == -1 ? 'desc' : 'asc';

	utilService.setBillFilters(options);

	$scope.show_bills(options);

 };

  $scope.exportBillsToExcel = function () {

	options = {};
	options.bill_number   = ($scope.search_section && $scope.search_section.bill_number ? $scope.search_section.bill_number : undefined);
	options.fromdate = ($scope.search_section && $scope.search_section.fromdate ? new Date($scope.search_section.fromdate) : undefined);
	options.todate = ($scope.search_section && $scope.search_section.todate ? new Date($scope.search_section.todate) : undefined);
	options.duedatefrom = ($scope.search_section && $scope.search_section.duedatefrom ? new Date($scope.search_section.duedatefrom) : undefined);
	options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
	options.duedateto = ($scope.search_section && $scope.search_section.duedateto ? new Date($scope.search_section.duedateto): undefined);
	options.page_number = 1;
	options.page_size = 2000;
	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	options.format = "excel";

	masterService.findAllBills(options, function(response) {
 		if (response.statuscode == 0) {
 			
 			var anchor = angular.element('<a/>');
			var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
			anchor.attr({
				href: window.URL.createObjectURL(blob),
				target: '_blank',
				download: 'OutstandingBills.xlsx'
			})[0].click();

 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
	});

 };

 $scope.search_notifications = function () {

	options = {};
	options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
	options.formatid   = ($scope.search_section && $scope.search_section.formatid ? $scope.search_section.formatid : undefined);
	options.typeid   = ($scope.search_section && $scope.search_section.typeid ? $scope.search_section.typeid : undefined);
	options.fromdate = ($scope.search_section && $scope.search_section.fromdate ? new Date($scope.search_section.fromdate) : undefined);
	options.todate = ($scope.search_section && $scope.search_section.todate ? new Date($scope.search_section.todate) : undefined);
	options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
	
	options = initPageNumberFilters(options);

	// options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
	// options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());

	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	// $scope.sortIcon = $scope.sortDirection == -1 ? 'desc' : 'asc';

	utilService.setNotificationFilters(options);

	$scope.show_notifications(options);

 };

  $scope.exportNotificationsToExcel = function () {

	options = {};
	options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
	options.formatid   = ($scope.search_section && $scope.search_section.formatid ? $scope.search_section.formatid : undefined);
	options.typeid   = ($scope.search_section && $scope.search_section.typeid ? $scope.search_section.typeid : undefined);
	options.fromdate = ($scope.search_section && $scope.search_section.fromdate ? new Date($scope.search_section.fromdate) : undefined);
	options.todate = ($scope.search_section && $scope.search_section.todate ? new Date($scope.search_section.todate) : undefined);
	options.customerid = ($scope.search_section && $scope.search_section.customer ? $scope.search_section.customer.id : undefined);
	
	options.page_number = 1;
	options.page_size = 2000;
	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	options.format = "excel";

	masterService.findAllNotifications(options, function(response) {
 		if (response.statuscode == 0) {
 			
 			var anchor = angular.element('<a/>');
			var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
			anchor.attr({
				href: window.URL.createObjectURL(blob),
				target: '_blank',
				download: 'Notifications.xlsx'
			})[0].click();

 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
	});

 };


$scope.exceedsToday = function(date) {
	return utilService.exceedsToday(date);
}

$scope.isAmountDue = function(amount) {
	return utilService.isAmountDue(amount);
}



$scope.add_bill = function() {
	$location.path("AddBill");
}

$scope.show_bills = function (options) {
	
	// if there is no options. the default sortby and sort order here.

	if (!options) {
 		options = {};
		options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
		options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());
	}

	if (!$scope.currentPage) $scope.currentPage = 1;

	masterService.findAllBills(options, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.billlist) {
 			$scope.billlist   = response.data.billlist;
			$scope.totalrecords   = utilService.getTotalRecords($scope.billlist);
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
	});
 };

 $scope.show_notifications = function (options) {
	
	// if there is no options. the default sortby and sort order here.

	if (!options) {
 		options = {};
		options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
		options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());
	}

	masterService.findAllNotifications(options, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.notificationlist) {
 			$scope.notificationlist   = response.data.notificationlist;
			$scope.totalrecords   = utilService.getTotalRecords($scope.notificationlist);
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
	});
 };

 $scope.exportCustomersToExcel = function (options) {
	
	// if there is no options. the default sortby and sort order here.

	options = {};
	options.statusid   = ($scope.search_section && $scope.search_section.statusid ? $scope.search_section.statusid : undefined);
	options.doc_number = ($scope.search_section && $scope.search_section.doc_number ? $scope.search_section.doc_number : undefined);
	options.city_name = ($scope.search_section && $scope.search_section.city_name ? $scope.search_section.city_name : undefined);
	options.state_name = ($scope.search_section && $scope.search_section.state_name ? $scope.search_section.state_name : undefined);
	options.customer_name = ($scope.search_section && $scope.search_section.customer_name ? $scope.search_section.customer_name : undefined);
	options.agent_id = ($scope.search_section && $scope.search_section.agent ? $scope.search_section.agent.id : undefined);
	options.sales_person_id = ($scope.search_section && $scope.search_section.sales_person ? $scope.search_section.sales_person.id : undefined);
	options.page_number = 1;
	options.page_size = 2000;
	options.sortby = $scope.sortBy;
	options.sortdirection = $scope.sortDirection;
	options.format = "excel";

	masterService.getCustomers(options, function(response) {
 		if(response.statuscode == 0)
		{
			var anchor = angular.element('<a/>');
			var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
			anchor.attr({
				href: window.URL.createObjectURL(blob),
				target: '_blank',
				download: 'customers.xlsx'
			})[0].click();
		}
	});
 };

  $scope.show_customers = function (options) {
	
	// if there is no options. the default sortby and sort order here.

	if (!options) {
 		options = {};
		options.page_number = ($scope.currentPage ? $scope.currentPage : 1);
		options.page_size = ($scope.itemsPerPage ? $scope.itemsPerPage : utilService.getRecordsPerPage());
	}

	if (!$scope.currentPage)
		$scope.currentPage = 1;
	
	masterService.getCustomers(options, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.customerlist) {
 			$scope.customerlist   = response.data.customerlist;
			$scope.totalrecords   = utilService.getTotalRecords($scope.customerlist);	
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
	});
 };
 
 $scope.getCustomerListViaPromise = function(term, enabledOnly) {
 
	//var sid = location.hash.substr(location.hash.indexOf('/', 2) + 1, 32);

	var options = {};
	options.search_text = term;
	if (enabledOnly && enabledOnly == 1)
		options.statusid = 4600;
	options.page_number = 1;
	options.page_size = 9999999;

	return masterService.getCustomers(options).then(
		function (response) {
			if (response.data.statuscode == 0)
				return response.data.data.customerlist;
			else if (response.data.statuscode == -100) {
				window.location.replace("/#/login");
				return [];
			}
			else
				return [];
		}
	);
 /*
	// get SID
	var config = {headers:  {
			'app_sid': sid
		}
	};
	
	// call API via promise
	return $http.get('/api/customers?search_text=' + term + "&enabled_only=" + (enabledOnly && enabledOnly == 1 ? 1 : 0) , config).then(
		function (response) {
			if (response.data.statuscode == 0)
				return response.data.data.customerlist;
			else if (response.data.statuscode == -100)
				window.location.replace("/#/login");
			else
				return [];
		}
	);
*/
 };

  $scope.getAgentListViaPromise = function(term, enabledOnly) {
 
	//var sid = location.hash.substr(location.hash.indexOf('/', 2) + 1, 32);

	var options = {};
	options.search_text = term;
	if (enabledOnly && enabledOnly == 1)
		options.statusid = 4600;
	options.page_number = 1;
	options.page_size = 9999999;

	return masterService.getAgents(options).then(function (response) {
			if (response.data.statuscode == 0)
				return response.data.data.agentlist;
			else if (response.data.statuscode == -100) {
				window.location.replace("/#/login");
				return [];
			}
			else
				return [];
		}
	);
 /*
	// get SID
	var config = {headers:  {
			'app_sid': sid
		}
	};
	
	// call API via promise
	return $http.get('/api/customers?search_text=' + term + "&enabled_only=" + (enabledOnly && enabledOnly == 1 ? 1 : 0) , config).then(
		function (response) {
			if (response.data.statuscode == 0)
				return response.data.data.customerlist;
			else if (response.data.statuscode == -100)
				window.location.replace("/#/login");
			else
				return [];
		}
	);
*/
 };

 $scope.deleteTransporter = function(transporter) {
 	if(confirm("Are you sure you want to delete the transporter?")) {
		masterService.deleteTransporter(
			transporter.id,
			function(response) {
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "Transporter deleted succesfully", type: "success"});
					$route.reload();
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
  
 $scope.saveTransporter = function () {
  
 	$scope.isDiabled = true;

 	if ($scope.editmode) {

		masterService.editTransporter(
					$scope.transporter.id,
					$scope.transporter.code,
					$scope.transporter.external_code,
					$scope.transporter.name,
					($scope.transporter.address !=undefined ? $scope.transporter.address.first_name : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.last_name : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.address1 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.address2 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.address3 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.city : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.state : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.zip : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.phone1 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.phone2 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.email1 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.email2 : ''),			
					$scope.transporter.status_id,
					
					function(response) {
						if (response.statuscode == 0 && response.data.transporter) {
							flash.pop({title: "", body: "Transporter updated succesfully", type: "success"});
							$location.path("/transporters/" );
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
 	else {

		masterService.createTransporter(
					$scope.transporter.code,
					$scope.transporter.external_code,
					$scope.transporter.name,
					($scope.transporter.address !=undefined ? $scope.transporter.address.first_name : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.last_name : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.address1 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.address2 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.address3 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.city : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.state : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.zip : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.phone1 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.phone2 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.email1 : ''),
					($scope.transporter.address !=undefined ? $scope.transporter.address.email2 : ''),
					
					function(response) {
						if (response.statuscode == 0 && response.data && response.data.transporter) {
							flash.pop({title: "", body: "Treansporter created succesfully", type: "success"});
							$location.path("/transporters/" );
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

 }

 $scope.deletePaymentTerm = function(term) {
 	if(confirm("Are you sure you want to delete the payment term?")) {
		masterService.deletePaymentTerm(
			term.id,
			function(response) {
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "Payment Term deleted succesfully", type: "success"});
					$route.reload();
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
 
 $scope.savePaymentTerm = function () {
  
 	$scope.isDiabled = true;

 	if ($scope.editmode) {

		masterService.editPaymentTerm(
					$scope.paymentterm.id,
					$scope.paymentterm.code,
					$scope.paymentterm.description,
					$scope.paymentterm.days, 
					$scope.paymentterm.status_id, 
					
					function(response) {
						if (response.statuscode == 0 && response.data.paymentterm) {
							flash.pop({title: "", body: "PaymentTerm updated succesfully", type: "success"});
							$location.path("/paymentterms/" );
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
 	else {

		masterService.createPaymentTerm(
					$scope.paymentterm.code,
					$scope.paymentterm.description,
					$scope.paymentterm.days, 
					
					function(response) {
						if (response.statuscode == 0 && response.data && response.data.paymentterm) {
							flash.pop({title: "", body: "PaymentTerm created succesfully", type: "success"});
							$location.path("/paymentterms/" );
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

 }

 $scope.deleteCustomerType = function(customertype) {
 	if(confirm("Are you sure you want to delete the rate category?")) {
		masterService.deleteCustomerType(
			customertype.id,
			function(response) {
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "Rate Category deleted succesfully", type: "success"});
					$route.reload();
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
 
 
 $scope.saveCustomerType = function () {
 
 	$scope.isDiabled = true;

 	if ($scope.editmode) {

		masterService.editCustomerType(
					$scope.companytype.id,
					$scope.companytype.name,
					$scope.companytype.description,
					$scope.companytype.balance_limit, 
					$scope.companytype.is_default, 
					
					function(response) {
						if (response.statuscode == 0 && response.data.companytype) {
							flash.pop({title: "", body: "CustomerType updated succesfully", type: "success"});
							$location.path("/customertypes/" );
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
 	else {

		masterService.createCustomerType(
					$scope.companytype.name,
					$scope.companytype.description,
					$scope.companytype.balance_limit, 
					$scope.companytype.is_default, 
					
					function(response) {
						if (response.statuscode == 0 && response.data && response.data.companytype) {
							flash.pop({title: "", body: "CustomerType created succesfully", type: "success"});
							$location.path("/customertypes/" );
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

 }

$scope.saveUnitOfMeasure = function () {
 
 	$scope.isDiabled = true;

	if ($scope.editmode) {

		masterService.editUnitOfMeasure(
			$scope.uom,
			
			function(response) {
				if (response.statuscode == 0 && response.data.uom) {
					flash.pop({title: "", body: "Unit Of Measure updated succesfully", type: "success"});
					$location.path("/unitofmeasures/" );
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
	else {

		masterService.createUnitOfMeasure(
			$scope.uom,
			
			function(response) {
				if (response.statuscode == 0 && response.data && response.data.uom) {
					flash.pop({title: "", body: "Unit Of Measure created succesfully", type: "success"});
					$location.path("/unitofmeasures/" );
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

}

function getCustomerNotifications(payment_reminder_on, order_notification_on)
{
	if(!$scope.customer.notifications)
		$scope.customer.notifications = [];

	const payment_notifiation_list = $scope.customer.notifications.filter(x=>x.notification_type_id == utilService.CONST_NOTIFICATION_TYPE_PAYMENT_REMINDER);
	let pr = (payment_notifiation_list.length > 0 ? payment_notifiation_list[0] : undefined);

	const order_notification_list = $scope.customer.notifications.filter(x=>x.notification_type_id == utilService.CONST_NOTIFICATION_TYPE_ORDER);
	let or = (order_notification_list.length > 0 ? order_notification_list[0] : undefined);

	if(pr)
	{
		pr.active = payment_reminder_on ? payment_reminder_on : 0 ;
		pr.phone_number = $scope.customer.payment_reminder_phone;
		pr.emails = $scope.customer.payment_reminder_emails;
		or.active = order_notification_on ? order_notification_on : 0 ;
		or.phone_number = $scope.customer.order_notification_phone;
		or.emails = $scope.customer.order_notification_emails;
	}
	else
	{
		const pr1 = {};
		pr1.notification_type_id = utilService.CONST_NOTIFICATION_TYPE_PAYMENT_REMINDER;
		pr1.active = payment_reminder_on ? payment_reminder_on : 0 ;

		const or1 = {};
		or1.notification_type_id = utilService.CONST_NOTIFICATION_TYPE_ORDER;
		or1.active = order_notification_on ? order_notification_on : 0 ;

		$scope.customer.notifications.push(pr1);		
		$scope.customer.notifications.push(or1);	
	}
}
 
var validateEmails = function(string) {
        var regex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        var result = string.replace(/\s/g, "").split(/,|;/);        
        for(var i = 0;i < result.length;i++) {
            if(!regex.test(result[i])) {
                return false;
            }
        }       
        return true;
    }

$scope.clearPRSettings = function() {
	if($scope.customer.payment_reminder_on == 0)
	{
		$scope.customer.payment_reminder_phone = '';
		$scope.customer.payment_reminder_emails = '';
	}
}

$scope.clearOrderSettings = function() {
	if($scope.customer.order_notification_on == 0)
	{
		$scope.customer.order_notification_phone = '';
		$scope.customer.order_notification_emails = '';
	}
}

$scope.deleteCustomer = function(customer) {
 	if(confirm("Are you sure you want to delete the customer?")) {
		masterService.deleteCustomer(
			customer.id,
			function(response) {
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "Customer deleted succesfully", type: "success"});
					$route.reload();
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

$scope.saveCustomer = function () {
  
 	$scope.isDiabled = true;

 	if($scope.customer.payment_reminder_emails && $scope.customer.payment_reminder_emails != '')
 	{
 		if(!validateEmails($scope.customer.payment_reminder_emails))
 		{
 			flash.pop({title: "", body: "Please enter valid email addresses for payment reminders seperated by comma", type: "error"});
 			return false;
 		}
 	}

 	if($scope.customer.order_notification_emails && $scope.customer.order_notification_emails != '')
 	{
 		if(!validateEmails($scope.customer.order_notification_emails))
 		{
 			flash.pop({title: "", body: "Please enter valid email addresses for order notifications seperated by comma", type: "error"});
 			return false;
 		}
 	}

 	getCustomerNotifications($scope.customer.payment_reminder_on, $scope.customer.order_notification_on);

	if ($scope.editmode) {

		$scope.customer.name = utilService.applyCapitalization($scope.customer.name);
		$scope.customer.invoicing_name = utilService.applyCapitalization($scope.customer.invoicing_name);

		masterService.editCustomer(
					$scope.customer,
					
					function(response) {
						if (response.statuscode == 0 && response.data.customer) {
							flash.pop({title: "", body: "Customer updated succesfully", type: "success"});
							let path = $routeParams.redirect;
							if(path)
								$location.url(path);
							else
								$location.path("/customers/");
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
	else {

		$scope.customer.name = utilService.applyCapitalization($scope.customer.name);
		$scope.customer.invoicing_name = utilService.applyCapitalization($scope.customer.invoicing_name);
		$scope.user.first_name = utilService.applyCapitalization($scope.customer.address.first_name);
		$scope.user.last_name = utilService.applyCapitalization($scope.customer.address.last_name);

		masterService.createCustomer(
					$scope.customer,
					$scope.user,
					
					function(response) {
						if (response.statuscode == 0 && response.data && response.data.customer) {
							flash.pop({title: "", body: "Customer updated succesfully", type: "success"});
							$location.path("/customers/" );
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

 }
 
 $scope.saveCompany = function () {
 
 	$scope.isDiabled = true;

    $scope.company.name = utilService.applyCapitalization($scope.company.name);

	$scope.company.user.first_name = utilService.applyCapitalization(($scope.company.address !=undefined ? $scope.company.address.first_name : ''));
	$scope.company.user.last_name = utilService.applyCapitalization(($scope.company.address !=undefined ? $scope.company.address.last_name : ''));

	$scope.company.template = {};
	$scope.company.template.id = $scope.company_template_id;

	if($scope.company_template_id != 6302)
	{
		$scope.company.template.id = ($scope.company.is_retail ? 6301 : 6300);
	}

	let notes = {};
	notes.accounting_system = $scope.company.acct_system;

	if($scope.company.template.id == utilService.CONST_COMPANY_TYPE_PAYMENTREMINDER) {		
		notes.subscription_type = "Free";
	}

	$scope.company.notes = JSON.stringify(notes);
	masterService.createcompany(
				$scope.company,
				$scope.company.user,
				function(response) {
					if (response.statuscode == 0 && response.data && response.data.company) {
						flash.pop({title: "", body: "company created succesfully", type: "success"});
						$location.path("/Login/" );
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

 $scope.updateBillBalanceAmount = function() {

 	if(($scope.bill.bill_amount > 0) && ($scope.bill.paid_amount > 0))
 		$scope.bill.balance_amount = $scope.bill.bill_amount - ($scope.bill.paid_amount ? $scope.bill.paid_amount : 0);
 }

 $scope.updateBillPaidAmount = function() {

 	if(($scope.bill.bill_amount > 0) && ($scope.bill.balance_amount > 0))
 		$scope.bill.paid_amount = $scope.bill.bill_amount - $scope.bill.balance_amount;
 }

 $scope.getBillByBillNo = function() {
		
	var options = {};
	//options.bill_number = (is_bill_id == 0) ? $routeParams.bill_no : undefined;
	options.bill_id = $routeParams.bill_no;

	masterService.findAllBills(options, function (response)	{

		if (response.statuscode == 0 && response.data && response.data.billlist) 
		{ 	
			$scope.bill = response.data.billlist[0];
			if ($scope.bill.bill_date != undefined) 
				$scope.bill.bill_date = utilService.convertToClientTimeZone($scope.bill.bill_date);
			if ($scope.bill.due_date != undefined) 
				$scope.bill.due_date = utilService.convertToClientTimeZone($scope.bill.due_date);
			if ($scope.bill.paid_date != undefined) 
				$scope.bill.paid_date = utilService.convertToClientTimeZone($scope.bill.paid_date);
			if($scope.bill.status_id == utilService.CONST_PAYMENT_STATUS_DELETE)
				$scope.bill.inactive = 1;
					
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		} 
		else {
			flash.pop({title: "", body: response.message, type: "error"});
		}
	});		

};

 $scope.saveBill = function () {

 	$scope.bill.paid_amount = ($scope.bill.paid_amount ? $scope.bill.paid_amount : 0);
 	$scope.bill.balance_amount = ($scope.bill.balance_amount ? $scope.bill.balance_amount : 0);
 	
 	let old_status_id = $scope.bill.status_id;
 	$scope.bill.old_status_id = old_status_id;

 	if($scope.bill.inactive == 1)
 		$scope.bill.status_id = utilService.CONST_PAYMENT_STATUS_DELETE;
 	else if($scope.bill.paid_amount >= $scope.bill.bill_amount)
		$scope.bill.status_id = utilService.CONST_PAYMENT_STATUS_PAID;
	else if(($scope.bill.paid_amount > 0) && ($scope.bill.paid_amount < $scope.bill.bill_amount))
		$scope.bill.status_id = utilService.CONST_PAYMENT_STATUS_PARTIALLY_PAID;
	else
		$scope.bill.status_id =  utilService.CONST_PAYMENT_STATUS_ACTIVE;

	if ($scope.bill.bill_date != undefined) 
		$scope.bill.bill_date = utilService.convertToClientTimeZone($scope.bill.bill_date);
	if ($scope.bill.due_date != undefined) 
		$scope.bill.due_date = utilService.convertToClientTimeZone($scope.bill.due_date);
	if ($scope.bill.paid_date != undefined) 
		$scope.bill.paid_date = utilService.convertToClientTimeZone($scope.bill.paid_date);

	if($scope.bill.id > 0) {
	 	masterService.updateBill(
			$scope.bill,
			
			function(response) {
				if (response.statuscode == 0 && response.data && response.data.bill) {
					flash.pop({title: "", body: "Bill created succesfully", type: "success"});
					$location.path("/bills/" );
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});

	 }
	 else {

	 	masterService.createBill(
			$scope.bill,
			
			function(response) {
				if (response.statuscode == 0 && response.data && response.data.bill) {
					flash.pop({title: "", body: "Bill created succesfully", type: "success"});
					$location.path("/bills/" );
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

 $scope.deleteUnitOfMeasure = function(uom) {
 	if(confirm("Are you sure you want to delete the unit of measure?")) {
		masterService.deleteUnitOfMeasure(
			uom.id,
			
			function(response) {
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "Unit of Measure deleted succesfully", type: "success"});
					$route.reload();
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

 $scope.deleteAgent = function(agent) {
 	if(confirm("Are you sure you want to delete the agent?")) {
		masterService.deleteAgent(
			agent.id,
			
			function(response) {
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "Agent deleted succesfully", type: "success"});
					$route.reload();
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
 
 $scope.saveAgent = function () {
 
 	$scope.isDiabled = true;

    $scope.agent.name = utilService.applyCapitalization($scope.agent.name);
    $scope.agent.accounting_name = utilService.applyCapitalization($scope.agent.accounting_name);

    if($scope.userlist.length == 1)
    {
    	$scope.agent.sales_person = {};
    	$scope.agent.sales_person = $scope.userlist[0];
    }

 	if ($scope.editmode) {


		$scope.agent.address.first_name = utilService.applyCapitalization($scope.agent.address.first_name);
		$scope.agent.address.last_name = utilService.applyCapitalization($scope.agent.address.last_name);

		masterService.editAgent(
					$scope.agent,
					
					function(response) {
						if (response.statuscode == 0 && response.data.agent) {
							flash.pop({title: "", body: "Agent updated succesfully", type: "success"});
							$location.path("/agents/" );
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
 	else {

		$scope.user.first_name = utilService.applyCapitalization(($scope.agent.address !=undefined ? $scope.agent.address.first_name : ''));
		$scope.user.last_name = utilService.applyCapitalization(($scope.agent.address !=undefined ? $scope.agent.address.last_name : ''));

		masterService.createAgent(
					$scope.agent,
					$scope.user,
					
					function(response) {
						if (response.statuscode == 0 && response.data && response.data.agent) {
							flash.pop({title: "", body: "Agent created succesfully", type: "success"});
							$location.path("/agents/" );
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

 }

 var initAgent = function () {
 	return {"id":undefined, "name":"", "status_id":undefined};
 }

 $scope.showDeliveryNoteDetail = function(id) {

 	const options = {};

	options.invoice_number = id;
	options.show_detail_if_single_record = true;
	utilService.setDeliveryNoteFilters(options);

	$location.path("/deliverynotes/" );

 };

 $scope.showBillsByCustomerId = function(id) {

 	const options = {};

	options.customerid = id;
	utilService.setBillFilters(options);

	$location.path("/bills/" );

 };

 $scope.exportAgentsToExcel = function() {


	options = {};
	options.salesperson_id = undefined;
	options.statusid = undefined;
	options.format = "excel";

	masterService.getAgents(options,  function (response) {
        if(response.statuscode == 0)
		{
			var anchor = angular.element('<a/>');
			var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
			anchor.attr({
				href: window.URL.createObjectURL(blob),
				target: '_blank',
				download: 'agents.xlsx'
			})[0].click();
		}
     });

 }

 var _getAgents = function (salespersonid, statusid, callback)
 {
     options = {};
     options.salesperson_id = salespersonid;
     options.statusid = statusid;
     options.sortby = $scope.sortBy;
     options.sortdirection = $scope.sortDirection;

     masterService.getAgents(options, callback);
 }
    
 $scope.getAgents = function(salespersonid, statusid, sortby, sortdirection)
 {
	if ($scope.sortBy == sortby) {
		$scope.sortDirection = $scope.sortDirection * -1;
 	}
 	else {
		$scope.sortBy = sortby;
		$scope.sortDirection = 1;
	} 
     _getAgents(salespersonid, statusid, function (response) {
         if (response.statuscode == 0 && response.data && response.data.agentlist) {
             $scope.agentlist     = response.data.agentlist;
         }
         else if (response.statuscode === -100)  {
             $location.path("/Login/");
         }
         else {
             flash.pop({title: "", body: response.message, type: "error"});
         }
     });
 }

 $scope.getUploads = function()
 {	
     masterService.getUploads(null, function (response) {
         if (response.statuscode == 0 && response.data && response.data.uploadlist) {
             $scope.uploadlist = response.data.uploadlist;
         }
         else if (response.statuscode === -100)  {
             $location.path("/Login/");
         }
         else {
             flash.pop({title: "", body: response.message, type: "error"});
         }
     });
 }
  

 $scope.getAgentsBySalesPersonId = function (id, statusid) { 
     _getAgents(id, statusid, function (response) {
         if (response.statuscode == 0 && response.data && response.data.agentlist) {
             $scope.agentlist = response.data.agentlist;
             $scope.customer.agent = initAgent();
         }
         else if (response.statuscode === -100) {
             $location.path("/Login/");
         }
         else {
                     $scope.customerlist = [];
             $scope.customer.agent = initAgent();
         }
    });
 }
 
 $scope.getSalesPersonInfoById = function (id) {

 	masterService.getAgentById(id, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.agent) {
 			$scope.customer.sales_person = response.data.agent.sales_person;
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			$scope.agent.sales_person = initCustomer();
 		}
 	});

 }


 $scope.getCustomerTypeById = function (id) {

 	masterService.getCustomerTypeById(id, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.companytype) {
 			$scope.companytype     = response.data.companytype;
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 }

 var prepopulateBillFilters = function(options) {

 	$scope.search_section = {};

 	if (options.bill_number)
 		$scope.search_section.bill_number = options.bill_number;

 	if (options.bill_id)
 		$scope.search_section.bill_id = options.bill_id;

 	if (options.bill_ref_number)
 		$scope.search_section.bill_ref_number = options.bill_ref_number;

	if (options.status_id)
 		$scope.search_section.status_id = options.status_id;

 	if (options.customerid) {
 		$scope.search_section.customer = {};
 		$scope.search_section.customer.id = options.customerid;

	 	masterService.getCustomerById(options.customerid, function(response) {
	 		if (response.statuscode == 0 && response.data && response.data.customer) {
				$scope.search_section.customer = response.data.customer;
	 		}
	 		else if (response.statuscode === -100)  {
				$location.path("/Login/");
	 		} 
	 		else {
	 			flash.pop({title: "", body: response.message, type: "error"});
	 		}
	 	});	

 	}

 	if (options.fromdate)
 		$scope.search_section.fromdate = options.fromdate;

 	if (options.todate)
 		$scope.search_section.todate = options.todate;

 	if (options.duedatefrom)
 		$scope.search_section.duedatefrom = options.duedatefrom;

 	if (options.duedateto)
 		$scope.search_section.duedateto = options.duedateto;

 	if (options.nextreminderfrom)
 		$scope.search_section.nextreminderfrom = options.nextreminderfrom;

 	if (options.nextreminderto)
 		$scope.search_section.nextreminderto = options.nextreminderto;
 
 	if (options.page_number && (!$scope.currentPage || $scope.currentPage != options.page_number))
 		$scope.currentPage = options.page_number;

 	if (options.page_size && (!$scope.itemsPerPage || $scope.itemsPerPage != options.page_size))
 		$scope.itemsPerPage = options.page_size;
};

 var prepopulateNotificationFilters = function(options) {

 	$scope.search_section = {};

 	if (options.customerid) {
 		$scope.search_section.customer = {};
 		$scope.search_section.customer.id = options.customerid;

	 	masterService.getCustomerById(options.customerid, function(response) {
	 		if (response.statuscode == 0 && response.data && response.data.customer) {
				$scope.search_section.customer = response.data.customer;
	 		}
	 		else if (response.statuscode === -100)  {
				$location.path("/Login/");
	 		} 
	 		else {
	 			flash.pop({title: "", body: response.message, type: "error"});
	 		}
	 	});	

 	}

 	if (options.fromdate)
 		$scope.search_section.fromdate = options.fromdate;

 	if (options.todate)
 		$scope.search_section.todate = options.todate;

 	if (options.statusid)
 		$scope.search_section.statusid = options.statusid;

 	if (options.typeid)
 		$scope.search_section.typeid = options.typeid;

 	if (options.formatid)
 		$scope.search_section.formatid = options.formatid;
 
 	if (options.page_number && (!$scope.currentPage || $scope.currentPage != options.page_number))
 		$scope.currentPage = options.page_number;

 	if (options.page_size && (!$scope.itemsPerPage || $scope.itemsPerPage != options.page_size))
 		$scope.itemsPerPage = options.page_size;

 }

 var prepopulateCustomerFilters = function(options) {

 	$scope.search_section = {};
 	if (options.statusid)
 		$scope.search_section.statusid = options.statusid;

 	if (options.doc_number)
 		$scope.search_section.doc_number = options.doc_number;

 	if (options.city_name)
 		$scope.search_section.city_name = options.city_name;

 	if (options.state_name)
 		$scope.search_section.state_name = options.state_name;

 	if (options.customer_name)
 		$scope.search_section.customer_name = options.customer_name;

 	if (options.agent_id) {
 		$scope.search_section.agent = {};
 		$scope.search_section.agent.id = options.agent_id;
 	}

 	if (options.sales_person_id) {
 		$scope.search_section.sales_person = {};
 		$scope.search_section.sales_person.id = options.sales_person_id;
 	}
 
 	if (options.page_number && (!$scope.currentPage || $scope.currentPage != options.page_number))
 		$scope.currentPage = options.page_number;

 	if (options.page_size && (!$scope.itemsPerPage || $scope.itemsPerPage != options.page_size))
 		$scope.itemsPerPage = options.page_size;

};

$scope.uploadAgents = function() {

	utilService.showDialog("upload.html", "UploadModalDialogController", {"uploadType": "Agents"}, function(result) {
		if (result == "OK") {
			$location.path("/uploads");
		}
		else {
			return;
		}
	});
};

$scope.uploadBills = function() {

	utilService.showDialog("upload.html", "UploadModalDialogController", {"uploadType": "Bills"}, function(result) {
		if (result == "OK") {
			$location.path("/uploads");
		}
		else {
			return;
		}
	});
};

$scope.uploadCustomers = function() {

	utilService.showDialog("upload.html", "UploadModalDialogController", {"uploadType": "Customers"}, function(result) {
		if (result == "OK") {
			$location.path("/uploads");
		}
		else {
			return;
		}
	});
};


$scope.uploadTransporters = function() {

	utilService.showDialog("upload.html", "UploadModalDialogController", {"uploadType": "Transporters"}, function(result) {
		if (result == "OK") {
			$location.path("/uploads");
		}
		else {
			return;
		}
	});
};


$scope.getTheFiles = function ($files) {
	$scope.formdata = new FormData();
	$scope.formdata.append('file', $files);
};

$scope.isExpandUpload = function(expand){
	if(expand.expanded)
		return $sce.trustAsHtml("<i ng-click=\"expandUpload(x)\" class=\"fas fa-angle-down\"></i>");
	else
		return $sce.trustAsHtml("<i ng-click=\"expandUpload(x)\" class=\"fas fa-angle-up\"></i>");
}

$scope.getUploadStatusCssClass = function(statusid)
{
	if(statusid == utilService.CONST_SYNC_STATUS_PENDING)
		return "mobileIconBlue";
	else if(statusid == utilService.CONST_SYNC_STATUS_PROCESSING)
		return "mobileIconYellow";
	else if(statusid == utilService.CONST_SYNC_STATUS_COMPLETED)
		return "mobileIconGreen";
	else if(statusid == utilService.CONST_SYNC_STATUS_ERROR)
		return "mobileIconRed";
	else
		return "mobileIconGrey"
}

$scope.downloadTemplate = function (uploadType) {

	masterService.getUploadTemplate(uploadType, function(response) {
		if (response.statuscode == 0) {
			var anchor = angular.element('<a/>');
			var blob = new Blob([response.data], { type: 'application/vnd.openxmlformates'});
			anchor.attr({
				href: window.URL.createObjectURL(blob),
				target: '_blank',
				download: uploadType + '.xlsx'
		})[0].click();
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
		});
 };

$scope.upload = function(uploadType) {
	masterService.uploadFile($scope.formdata, uploadType, function(response){
		if (response.statuscode == 0) {
			flash.pop({title: "", body: "File Uploaded Succesfully, View recent uploads for the status", type: "success"});
 		}
 		else if (response.statuscode == -100)  {
			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: "Input file format not valid", type: "error"});
 		}
	})
};

$scope.showUploadDetail = function(more) {
	let u = JSON.parse(more);
	if(u && u.name)
		return u.name;
	else
		more;
}

$scope.loadIndex = 10 // increment the loadindex as per yourr need       
$scope.showMore = function(x) {
    if ($scope.loadIndex < x.length) {
      $scope.loadIndex += 5;
    }
};  
$scope.showLess = function(x) {
   if ($scope.loadIndex >= x.length) {
      $scope.loadIndex -= 5;
    }
};  

$scope.download = function(x) {
    var blob = new Blob([document.getElementById('exportable_' + x.id).innerHTML], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
    });

    saveAs(blob, "Report.xls");
}

$scope.expandUpload = function(x, refresh) {

	var upload = $scope.uploadlist.filter(y=>y.id == x.id)[0]
	if(upload.expanded)
		upload.expanded = false;
	else
		upload.expanded = true;
	if(refresh) upload.expanded = true;
	if(!upload.error_details || refresh)
	{
		masterService.getUploadById(x.id, 1, function(response){
			upload.error_details = response.data.upload.error_details;
		});
	}
}

$scope.isUploadBillsVisible = function () {
	return (utilService.getPermission(utilService.CONST_PERMISSION_BILL_UPLOAD) == "1");
 };

$scope.showBillDetail = function(bill_no) {
	$location.path("/bills/" + bill_no );
};

$scope.showEditHsnForm = function (id) {
	$location.path("/AddHsn/" + id);
};

$scope.showAddHsnForm = function() {
	$location.path("/AddHsn/");
}

$scope.deleteHsn = function(id) {
	if (confirm("Are you sure you want to delete HSN?")) {
		masterService.deleteHsn(id, (response) => {
			if (response.statuscode == 0) {
				$location.path("/hsns/");
				$route.reload();
				flash.pop({title: "", body: "HSN deleted succesfully", type: "success"});
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

$scope.getHSNList = function() { 
	masterService.getHsn({}, function(response) {
		if (response.statuscode == 0 && response.data && response.data.hsnlist) {
			$scope.hsnlist     = response.data.hsnlist;
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
		else {
			flash.pop({title: "", body: response.message, type: "error"});
		}
	});
};

$scope.getHSNById = async function(id) {

	let response = await masterService.getHsnById(id);
	$scope.hsn = response.data.hsn;

	//refresh scope so template can see
	$scope.$apply();

};
$scope.hsnMaxBlur = function() {
	for (let i = 1; i < $scope.hsn.details.length; i++) {
		if ($scope.hsn.details[i].amount_min != $scope.hsn.details[i - 1].amount_max + 0.01) {
			$scope.hsn.details[i].amount_min = $scope.hsn.details[i - 1].amount_max + 0.01;
		}
	}
}

$scope.saveHSN = function() {

	if ($scope.hsn.details.length == 0) {
		flash.pop({title: "Invalid data!", body: "Please provide HSN details.", type: "error"});
		return;
	}

	if ($scope.hsn.details[$scope.hsn.details.length - 1].amount_max != null && $scope.hsn.details[$scope.hsn.details.length - 1].amount_max != "" ) {
		flash.pop({title: "Invalid data!", body: "To Amount must be empty for last line.", type: "error"});
		return;
	}

	for (let i = 0; i < $scope.hsn.details.length; i++) {

		if (i < $scope.hsn.details.length - 1 && ($scope.hsn.details[i].amount_max + 0.01 != $scope.hsn.details[i+1].amount_min)) {
			flash.pop({title: "Invalid data!", body: "Invalid From Amount in line " + (i + 1), type: "error"});
			return;
		}

		if ($scope.hsn.details[i].amount_max != null && $scope.hsn.details[i].amount_max != "" && $scope.hsn.details[i].amount_min > $scope.hsn.details[i].amount_max) {
			flash.pop({title: "Invalid data!", body: "Amount from cannot be greater than to.", type: "error"});
			return;
		}

		$scope.hsn.details[i].percent_sgst = $scope.hsn.details[i].percent_gst / 2;
		$scope.hsn.details[i].percent_cgst = $scope.hsn.details[i].percent_gst / 2;
		$scope.hsn.details[i].percent_igst = $scope.hsn.details[i].percent_gst;

	}

	if ($scope.editmode) {

		masterService.editHsn($scope.hsn, (response) => {
			if (response.statuscode == 0 && response.data && response.data.hsn) {
				$location.path("/hsns/");
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
		});
	} else {
		masterService.createHsn($scope.hsn, (response) => {
			if (response.statuscode == 0 && response.data && response.data.hsn) {
				$location.path("/hsns/");
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

 $scope.id         = $routeParams.id;

   // isten search order event
 $scope.$on("SearchPayment", function (evt, section, data) {
     
     masterService.clearCustomer('customer_filter');

     if (section.description == "Outstanding - Due" && data.data.name == "Over 30 days") {
			$scope.search_section = {};
			let d1 = moment().subtract(30, 'days');
			d1 = moment(d1).format('YYYY-MM-DD');
			$scope.search_section.duedateto = d1;
			$location.path("/bills/");
			$scope.search_bills();
     }
     else if (section.description == "Outstanding - Due" && data.data.name == "Over 7 days") {
			$scope.search_section = {};
			let d1 = moment().subtract(7, 'days');
			d1 = moment(d1).format('YYYY-MM-DD');
			$scope.search_section.duedateto = d1;
			$location.path("/bills/");
			$scope.search_bills();
     }
     else if (section.description == "Outstanding - Due" && data.data.name == "Total Due") {
			$scope.search_section = {};
			$location.path("/bills/");
			$scope.search_bills();
     }
     if (section.description == "Outstanding - Coming Due" && data.data.name == "In 30 days") {
			$scope.search_section = {};
			let d1 = moment().add(30, 'days');
			d1 = moment(d1).format('YYYY-MM-DD');
			$scope.search_section.duedateto = d1;
			let d2 = moment().add(2, 'days');
			d2 = moment(d2).format('YYYY-MM-DD');
			$scope.search_section.duedatefrom = utilService.convertToServerTimeZone(d2);
			$location.path("/bills/");
			$scope.search_bills();
     }
     else if (section.description == "Outstanding - Coming Due" && data.data.name == "In 7 days") {
			$scope.search_section = {};
			let d1 = moment().add(7, 'days');
			d1 = moment(d1).format('YYYY-MM-DD');
			$scope.search_section.duedateto = d1;
			let d2 = moment().add(2, 'days');
			d2 = moment(d2).format('YYYY-MM-DD');
			$scope.search_section.duedatefrom = utilService.convertToServerTimeZone(d2);
			$location.path("/bills/");
			$scope.search_bills();
     }
     else if (section.description == "Outstanding - Coming Due") {
			$scope.search_section = {};
			let d1 = moment().add(1, 'days');
			d1 = moment(d1).format('YYYY-MM-DD');
			$scope.search_section.duedatefrom = utilService.convertToServerTimeZone(d1);
			$location.path("/bills/");
			$scope.search_bills();
     }
 });
 
 if ($rootScope.title == "Transporters") {
 		$scope.activeonly = false;
 		$scope.getTransporters();
 }
 else if ($rootScope.title == "Payment Terms") {
 	$scope.activeonly = false;
	$scope.getPaymentTerms();
 }	
 else if ($rootScope.title == "Add Company") {
	$scope.state_list = utilService.getStates();
	const para = $rootScope.parameters;
	if (para && para.company_template_id)
		$scope.company_template_id = para.company_template_id;
	else
		$scope.company_template_id = utilService.CONST_COMPANY_TYPE_PLATINUM;
 }
 else if ($rootScope.title == "Customers") {

 	$scope.state_list = utilService.getStates();

 	if ($scope.isAgentFilterVisible()) {

 	    _getAgents(undefined, undefined, function (response) {
	 		if (response.statuscode == 0 && response.data && response.data.agentlist) {
	 			$scope.agentlist     = response.data.agentlist;
	 		}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
	 		else {
	 			flash.pop({title: "", body: response.message, type: "error"});
	 		}
	 	});
	}

	if ($scope.isSalesmanFilterVisible()) {
		userService.getUsers(undefined, 4004, undefined, undefined, undefined, function(response) {
	 		if (response.statuscode == 0 && response.data && response.data.userlist) {
	 			$scope.sales_person_list     = response.data.userlist;
	 		}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
	 		else {
	 			flash.pop({title: "", body: response.message, type: "error"});
	 		}
		 });
	}

 	options = utilService.getCustomerFilters();

 	if (!options) options = {};

 	prepopulateCustomerFilters(options);

 	// options.page_number = 1;
 	options.page_size = $scope.itemsPerPage;

	$scope.totalrecords = Number.MAX_VALUE;

	$scope.show_customers(options);

 }
 else if ($rootScope.title == "Outstanding") {

 	options = utilService.getBillFilters();

 	if (!options) options = {};

 	prepopulateBillFilters(options);

 	// options.page_number = 1;
 	options.page_size = $scope.itemsPerPage;

	$scope.totalrecords = Number.MAX_VALUE;

	$scope.show_bills(options);

 }
 else if ($rootScope.title == "Notifications") {

 	options = utilService.getNotificationFilters();

 	if (!options) options = {};

 	prepopulateNotificationFilters(options);

 	// options.page_number = 1;
 	options.page_size = $scope.itemsPerPage;

	$scope.totalrecords = Number.MAX_VALUE;

	$scope.show_notifications(options);

 }
 else if ($rootScope.title == "Agents") {
     $scope.getAgents(undefined, undefined, undefined, undefined);
 }
 else if ($rootScope.title == "HSNs") {
     $scope.getHSNList();
 }
 else if ($rootScope.title == "Recent Uploads") {
     $scope.getUploads();
 }
else if ($rootScope.title == "Rate Categories") {
		$scope.getCustomerTypes();
 }
 else if ($rootScope.title == "Edit Bill") {

	$scope.getBillByBillNo();
 }
 else if ($rootScope.title == "Edit HSN") {
	$scope.getHSNById($routeParams.id);
	$scope.editmode = true;
 } 
 else if ($rootScope.title == "Add HSN") {
	$scope.hsn = {"code":"", "name": "", "short_code": "", "description": ""};
	$scope.addHSNDetail();
	$scope.hsn.details[0].amount_min = 0;
	$scope.editmode = false;
 }
 else if ($rootScope.title == "Add Transporter" || $rootScope.title == "Add Payment Term" || $rootScope.title == "Add Customer" || $rootScope.title == "Add Agent"  || $rootScope.title == "Add Rate Category" || $rootScope.title == "Add Uom" ) {

 	$scope.state_list = utilService.getStates();

  	$scope.editmode = false;
  	if ($rootScope.title == "Add Customer" || $rootScope.title == "Add Agent" ) {
 		$scope.state_list = utilService.getStates();
 		$scope.initCustomer();

		userService.getUsers(null, 4004, 4600, undefined,  undefined, function(response) {
			if (response.statuscode == 0 && response.data && response.data.userlist) {
				$scope.userlist     = response.data.userlist;
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
		});
		
		if ($rootScope.title == "Add Agent") {

			$scope.user = userService.initUser();
		}

		if ($rootScope.title == "Add Customer" ) {
		
			$scope.user = userService.initUser();

			$scope.copyBillAddress = true;
			$scope.copyShipAddress = true;  
		  	_getAgents(undefined, 4600, function (response) {
				if (response.statuscode == 0 && response.data && response.data.agentlist) {
					$scope.agentlist     = response.data.agentlist;
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});

			$scope.getCustomerTypes();
/*
			masterService.getUnitOfMeasures(function(response) {
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
 				$scope.activeonly = true;

			  	$scope.getTransporters();

				$scope.getPaymentTerms();
		} 
  	}
 }
else if ($rootScope.title == "Unit Of Measure List") {
  	masterService.getUnitOfMeasures({}, function(response) {
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
}
else if ($rootScope.title == "Edit Unit of Measure" || $rootScope.title == "Add Unit of Measure") {
	if ($rootScope.title == "Edit Unit of Measure") {
		masterService.getUnitOfMeasureById($routeParams.id, function(response) {
			if (response.statuscode == 0 && response.data && response.data.uom) {
				$scope.uom      = response.data.uom;
				$scope.editmode = true;
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
		});
 	}
 	else {
 		$scope.initUnitOfMeasure();
 	}

  	masterService.getUnitOfMeasures({}, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.uomlist) {
 			if ($routeParams.id) {
				uomlist = [];
				for (i = 0; i < response.data.uomlist.length; i++) {
					if (response.data.uomlist[i].id != $routeParams.id) {
						uomlist.push(response.data.uomlist[i]);
					}
				}
 				$scope.uomlist     = uomlist;
			} else {
 				$scope.uomlist     = response.data.uomlist;
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
else if ($rootScope.title == "Edit Transporter" && ($routeParams.id)) {

 	$scope.state_list = utilService.getStates();

	masterService.getTransporterById($scope.id, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.transporter) {
 			$scope.transporter     = response.data.transporter;
 			$scope.editmode        = true;
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 }

 else if ($rootScope.title == "Edit Payment Term" && ($routeParams.id)) {

	masterService.getPaymentTermById($scope.id, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.paymentterm) {
 			$scope.paymentterm     = response.data.paymentterm;
 			$scope.editmode        = true;
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 } 

 else if ($rootScope.title == "Edit Rate Category" && ($routeParams.id)) {

	masterService.getCustomerTypeById($scope.id, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.companytype) {
 			$scope.companytype     = response.data.companytype;
 			$scope.editmode        = true;
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 }
 else if ($rootScope.title == "Edit Customer" && ($routeParams.id)) {

 	$scope.state_list = utilService.getStates();

 	let path = $routeParams.redirect;
	if(path == '/orders')
		$location.hash('creditlimit');
	
	$scope.copyBillAddress = true;
	$scope.copyShipAddress = true; 
	masterService.getCustomerById($scope.id, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.customer) {
 			$scope.customer        = response.data.customer;
 			if($scope.customer.notifications && $scope.customer.notifications.length > 0) {
 				const payment_notifiation_list = $scope.customer.notifications.filter(x=>x.notification_type_id == utilService.CONST_NOTIFICATION_TYPE_PAYMENT_REMINDER);
 				let pr = (payment_notifiation_list.length > 0 ? payment_notifiation_list[0] : {});
		 		$scope.customer.payment_reminder_on = (pr.active ? pr.active : 0);
		 		$scope.customer.payment_reminder_phone = (pr.phone_number ? pr.phone_number : '');
		 		$scope.customer.payment_reminder_emails = (pr.emails ? pr.emails : '');

 				const order_notification_list = $scope.customer.notifications.filter(x=>x.notification_type_id == utilService.CONST_NOTIFICATION_TYPE_ORDER);
		 		$scope.customer.order_notification_on = (order_notification_list.length > 0 ? order_notification_list[0].active : 0);
		 		let order = (order_notification_list.length > 0 ? order_notification_list[0] : {});
		 		$scope.customer.order_notification_on = (order.active ? order.active : 0);
		 		$scope.customer.order_notification_phone = (order.phone_number ? order.phone_number : '');
		 		$scope.customer.order_notification_emails = (order.emails ? order.emails : '');

		 	}
 			$scope.editmode        = true;
 			_getAgents(undefined, 4600, function (response) {
				if (response.statuscode == 0 && response.data && response.data.agentlist) {
					$scope.agentlist     = response.data.agentlist;
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});

			userService.getUsers(null, 4004, 4600, undefined, undefined, function(response) {
				if (response.statuscode == 0 && response.data && response.data.userlist) {
					$scope.userlist     = response.data.userlist;
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});

			$scope.getCustomerTypes();
/*
			masterService.getAgents($scope.customer.sales_person.id, 4600, function(response) {
				if (response.statuscode == 0 && response.data && response.data.customerlist) {
					$scope.customerlist     = response.data.customerlist;
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
			});
*/
 				$scope.activeonly = true;

			  	$scope.getTransporters();

				$scope.getPaymentTerms();
 			
 		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 }  

 else if ($rootScope.title == "Edit Agent" && ($routeParams.id)) {

 	$scope.state_list = utilService.getStates();

	masterService.getAgentById($scope.id, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.agent) {
 			$scope.agent        = response.data.agent;
 			$scope.editmode        = true;

			userService.getUsers(null, 4004, 4600, undefined, undefined, function(response) {
				if (response.statuscode == 0 && response.data && response.data.userlist) {
					$scope.userlist     = response.data.userlist;
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
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
 });