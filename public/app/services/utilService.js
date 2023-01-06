app.service('utilService', function($http, $filter, $location,APIInterceptor, CommonFunctions) {

// this.baseURL="http://dev.simplytextile.com:8082";
 var baseURL = "";

 this.customerFilters = {};
 this.orderFilters = {};
 this.deliveryNoteFilters = {};
 this.packingSlipFilters = {};
 this.billFilters = {};
 this.notificationFilters = {};
 this.bucketFilters = {};
 this.journalFilters = {};
 
 //var permissionHash = {};

 this.CONST_PERMISSION_CUSTOMER_CREATE          = 5200;
 this.CONST_PERMISSION_CUSTOMER_UPDATE          = 5201;
 this.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE  = 5206;
 this.CONST_PERMISSION_CUSTOMER_DELETE			= 5654;

 this.CONST_PERMISSION_CUSTOMERTYPE_CREATE      = 5202;
 this.CONST_PERMISSION_CUSTOMERTYPE_UPDATE      = 5203; 
 this.CONST_PERMISSION_CUSTOMERTYPE_DELETE 		= 5657;

 this.CONST_PERMISSION_AGENT_CREATE             = 5204;
 this.CONST_PERMISSION_AGENT_UPDATE             = 5205;
 this.CONST_PERMISSION_AGENT_DELETE             = 5653;
 
 this.CONST_PERMISSION_PRICEGROUP_CREATE        = 5401;
 this.CONST_PERMISSION_PRICEGROUP_UPDATE        = 5402;
 this.CONST_PERMISSION_PRICEGROUP_DELETE        = 5658;
 
 this.CONST_PERMISSION_UNIT_CREATE              = 5470;
 this.CONST_PERMISSION_UNIT_UPDATE              = 5471;
 this.CONST_PERMISSION_UNIT_DELETE              = 5659;
 

 this.CONST_PERMISSION_WORKFLOW_SETUP           = 5450;
 
 this.CONST_PERMISSION_ORDER_CREATE             = 5000;
 this.CONST_PERMISSION_ORDER_APPROVE            = 5001;
 this.CONST_PERMISSION_ORDER_CANCEL             = 5002;
 this.CONST_PERMISSION_ORDER_NUMBER_EDIT        = 5003;

 this.CONST_PERMISSION_USER_CREATE              = 5102;
 this.CONST_PERMISSION_USER_UPDATE              = 5103;
 this.CONST_PERMISSION_USER_DELETE 	            = 5660;

 this.CONST_PERMISSION_ROLE_CREATE              = 5104;
 this.CONST_PERMISSION_ROLE_UPDATE              = 5105;

 this.CONST_PERMISSION_PRODUCT_CREATE           = 5106;
 this.CONST_PERMISSION_PRODUCT_UPDATE           = 5107;
 this.CONST_PERMISSION_PRODUCT_DELETE           = 5652;

 this.CONST_PERMISSION_CATEGORY_CREATE          = 5108;
 this.CONST_PERMISSION_CATEGORY_UPDATE          = 5109;

 this.CONST_PERMISSION_TRANSPORTER_CREATE       = 5110
 this.CONST_PERMISSION_TRANSPORTER_UPDATE       = 5111;
 this.CONST_PERMISSION_TRANSPORTER_DELETE 		= 5655;

 this.CONST_PERMISSION_PAYMENTTERM_CREATE       = 5112;
 this.CONST_PERMISSION_PAYMENTTERM_UPDATE       = 5113;
 this.CONST_PERMISSION_PAYMENTTERM_DELETE 		= 5656;

 this.CONST_PERMISSION_UPDATE_PASSWORD          = 5114;

 this.CONST_PRICING_PRODUCT_FLAT                = 4800;
 this.CONST_PRICING_PRODUCT_VARIABLE            = 4801;
 this.CONST_PRICING_PRODUCT_PRICEGROUP          = 4802;

 this.CONST_PERMISSION_ORDER_CREATE_TERM_CHANGE = 5460;
 this.CONST_PERMISSION_ORDER_CREATE_TRANSPORTER_CHANGE = 5461;
 this.CONST_PERMISSION_CUSTOMER_TYPE_CHANGE     = 5462;

 this.CONST_PERMISSION_PACKING_SLIP_CREATE       = 5463;
 this.CONST_PERMISSION_PACKING_SLIP_CANCEL       = 5464;
 this.CONST_PERMISSION_PACKING_SLIP_VIEW         = 5465,
 this.CONST_PERMISSION_PACKING_SLIP_NUMBER_EDIT  = 5466,

 this.CONST_PERMISSION_DELIVERY_NOTE_CREATE      = 5500;
 this.CONST_PERMISSION_DELIVERY_NOTE_UPDATE      = 5501;
 this.CONST_PERMISSION_DELIVERY_NOTE_CANCEL      = 5502;
 this.CONST_PERMISSION_DELIVERY_NOTE_VIEW        = 5503;
 this.CONST_PERMISSION_DELIVERY_NOTE_NUMBER_EDIT = 5504;
 this.CONST_PERMISSION_DELIVERY_NOTE_EDIT_COMPLETE = 5505;
 this.CONST_PERMISSION_DELIVERY_NOTE_DATE_EDIT = 5506;

 this.CONST_PERMISSION_GATEPASS_CREATE      	 = 5500;
 this.CONST_PERMISSION_GATEPASS_VIEW	      	 = 5554;

 this.CONST_PERMISSION_CUSTOMER_CODE_EDIT        = 5207;

 this.CONST_PERMISSION_STOCK_SUMMARY_VIEW        = 5600;

 this.CONST_PERMISSION_BILL_VIEW                 = 5650;
 this.CONST_PERMISSION_BILL_UPLOAD               = 5651;

 this.CONST_STATUS_PACKING_SLIP_PENDING_INVOICE  = 5199;
 this.CONST_STATUS_PACKING_SLIP_PENDING_DISPATCH = 5200;
 this.CONST_STATUS_PACKING_SLIP_DISPATCHED       = 5201;
 this.CONST_STATUS_PACKING_SLIP_COMPLETED        = 5202;
 this.CONST_STATUS_PACKING_SLIP_CANCELLED        = 5203;

 this.CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH= 5499;
 this.CONST_STATUS_DELIVERY_NOTE_PENDING_LR      = 5500;
 this.CONST_STATUS_DELIVERY_NOTE_DELIVERED       = 5501;
 this.CONST_STATUS_DELIVERY_NOTE_COMPLETED       = 5502;
 this.CONST_STATUS_DELIVERY_NOTE_CANCELLED       = 5503;
 
 this.CONST_CONFIG_COMPANY_LOGO                  = "logo_url";
 this.CONST_CONFIG_COMPANY_ORDER_NO_REQD         = "order_number_required";
 this.CONST_CONFIG_COMPANY_PACKING_SLIP_NO_REQD  = "packing_slip_number_required";
 this.CONST_CONFIG_COMPANY_DELIVERY_NOTE_NO_REQD = "delivery_note_number_required";
 this.CONST_CONFIG_COMPANY_CUSTOMER_CODE_REQD    = "customer_code_required";
 this.CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD = "transporter_code_required";
 this.CONST_CONFIG_COMPANY_AGENT_CODE_REQD       = "agent_code_required";
 this.CONST_CONFIG_COMPANY_PRODUCT_CODE_REQD     = "product_code_required";
 
 this.CONST_CONFIG_TAX_AUTO_CALCULATE_ORDER      = "tax_auto_calculation_order";
 this.CONST_CONFIG_CATALOG_HIDE_PRODUCT_RATE     = "catalog_hide_product_rate";
 this.CONST_CONFIG_RECORDS_PER_PAGE			     = "display_records_per_page";
 this.CONST_CONFIG_NEW_PRODUCT_DAYS			     = "new_product_days";
 this.CONST_CONFIG_NEW_CATEGORY_DAYS			 = "new_category_days";

 this.CONST_URL_NO_IMAGE                         = "app/assets/images/no-image-found.jpg";

 this.CONST_CONFIG_COMPANY_PRODUCT_NEW_SHOW_X_DAYS = "product_new_show_x_days"; 

 this.CONST_DEFAULT_EXPORT_PAGE_SIZE			 = 2000;

 this.CONST_SESSIONTYPE_ONETIME					 = 4103;

 this.CONST_DOCUMENT_TYPE_ORDER = 1001;
 this.CONST_DOCUMENT_TYPE_CATALOG = 1002;
 this.CONST_DOCUMENT_TYPE_DELIVERY_NOTES = 1003;
 this.CONST_DOCUMENT_TYPE_PACKING_SLIPS = 1004;
 this.CONST_CONFIG_COMPANY_GATEPASS_NO_REQD      = "gate_pass_number_required";
 this.CONST_PERMISSION_GATEPASS_NUMBER_EDIT      = 5555;

 this.CONST_CONFIG_MODULE_TRANSPORTER                = "module_transporters";
 this.CONST_CONFIG_MODULE_PAYMENT_TERM               = "module_payment_terms";
 this.CONST_CONFIG_MODULE_AGENT                      = "module_agents";
 this.CONST_CONFIG_MODULE_USER                       = "module_users";
 this.CONST_CONFIG_MODULE_CUSTOMER                   = "module_customers";
 this.CONST_CONFIG_MODULE_ORDER                      = "module_orders";
 this.CONST_CONFIG_MODULE_REPORT                     = "module_reports";
 this.CONST_CONFIG_MODULE_INVENTORY                  = "module_inventory";
 this.CONST_CONFIG_MODULE_OUTSTANDING                = "module_outstanding";
 this.CONST_CONFIG_MODULE_MULTIPLE_RATE              = "module_rate_categories";
 this.CONST_CONFIG_MODULE_DELIVERY_NOTE              = "module_delivery_notes";
 this.CONST_CONFIG_MODULE_PACKING_SLIP               = "module_packing_slips";
 this.CONST_CONFIG_MODULE_APPROVAL_RATE_DIFF         = "module_approval_rate_diff";
 this.CONST_CONFIG_MODULE_APPROVAL_PAYMENT_DUE       = "module_approval_payment_due";
 this.CONST_CONFIG_MODULE_APPROVAL_CREDIT_LIMIT      = "module_approval_credit_limit";
 this.CONST_CONFIG_MODULE_CUSTOMER_GST               = "module_customer_gst";
 this.CONST_CONFIG_MODULE_CUSTOMER_FIRM              = "module_customer_firm";
 this.CONST_CONFIG_MODULE_CUSTOMER_BILL_ADDRESS      = "module_customer_bill_address";
 this.CONST_CONFIG_MODULE_CUSTOMER_SHIP_ADDRESS      = "module_customer_ship_address";
 this.CONST_CONFIG_MODULE_CUSTOMER_ADDRESS           = "module_customer_address";
 this.CONST_CONFIG_MODULE_CUSTOMER_LOGIN             = "module_customer_login";
 this.CONST_CONFIG_MODULE_AGENT_LOGIN                = "module_agent_login";
 this.CONST_CONFIG_MODULE_SALESMAN                   = "module_salesman";

 this.CONST_CONFIG_MODULE_NOTIFICATION_SMS           = "module_notification_sms";
 this.CONST_CONFIG_MODULE_NOTIFICATION_EMAIL         = "module_notification_email";

 this.CONST_CONFIG_INTEGRATION_CUSTOMER              = "module_integration_customer";
 this.CONST_CONFIG_INTEGRATION_PRODUCT               = "module_integration_product";
 this.CONST_CONFIG_INTEGRATION_INVOICE               = "module_integration_invoice";
 this.CONST_CONFIG_INTEGRATION_PAYMENT               = "module_integration_payment";

 this.CONST_CONFIG_INTEGRATION_EWAYBILL              = "module_integration_eway_bill";

 this.CONST_CONFIG_MODULE_CATALOG_SHARE              = "module_catalog_share";

 this.CONST_CONFIG_MODULE_PRODUCT_STOCK              = "module_product_stock";
 this.CONST_CONFIG_MODULE_PRODUCT_HSN                = "module_product_hsn";
 this.CONST_CONFIG_MODULE_PRODUCT_PRICE_GROUP        = "module_product_price_groups";
 this.CONST_CONFIG_MODULE_PRODUCT_KIT                = "module_product_kits";
 this.CONST_CONFIG_MODULE_PRODUCT_BUNDLE             = "module_product_bundles";
 this.CONST_CONFIG_MODULE_PRODUCT_PRODUCT_HEAD       = "module_product_product_heads";
 this.CONST_CONFIG_MODULE_PRODUCT_MULTIPLE_UNIT      = "module_product_multiple_units";
 this.CONST_CONFIG_MODULE_PRODUCT_UNIT_RESTRICTION   = "module_product_unit_restrictions";

 this.CONST_CONFIG_MODULE_DIRECT_INVOICE         = "module_direct_invoice";

 this.CONST_SYNC_STATUS_PENDING = 4100;
 this.CONST_SYNC_STATUS_ERROR = 4102;
 this.CONST_SYNC_STATUS_PROCESSING = 4104;
 this.CONST_SYNC_STATUS_CANCELLED = 4106;
 this.CONST_SYNC_STATUS_COMPLETED = 4105;

 this.CONST_UPLOAD_TYPE_AGENT = 1001;
 this.CONST_UPLOAD_TYPE_CUSTOMER = 1002;

 this.CONST_NOTIFICATION_TYPE_ORDER = 5801;
 this.CONST_NOTIFICATION_TYPE_CATALOG_SHARE = 5802;
 this.CONST_NOTIFICATION_TYPE_PAYMENT_REMINDER = 5803;

 this.CONST_COMPANY_TYPE_PLATINUM = 6300;
 this.CONST_COMPANY_TYPE_SLIM = 6301;
 this.CONST_COMPANY_TYPE_PAYMENTREMINDER = 6302;

 this.CONST_PAYMENT_STATUS_ACTIVE	             = 5800;
 this.CONST_PAYMENT_STATUS_PAID                  = 5801;
 this.CONST_PAYMENT_STATUS_PARTIALLY_PAID        = 5802;
 this.CONST_PAYMENT_STATUS_DELETE                = 5803;
 
 this.initUOMConversion = function () {
	var obj = {from_qty: 1, to_qty:0, price_group_id: "", product_id: ""};
	obj.from_uom = this.initUOM();
	obj.to_uom  = this.initUOM();
	return obj;
 };

 this.getBaseURL = function() {
 	return baseURL;
 };

 this.initUOM = function () {
    var obj = {id:"", name:"", description:"", base_id:"", conversion_factor:""};
    return obj; 
 };

 this.drawImage = function(objName, hidCropX, hidCropY, hidCropW, hidCropH, hidImgW, hidImgH, hidActualW, hidActualH, imgTempImageURL) {

	var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');

		canvas.width = 240;
		canvas.height = 240;
		ctx.drawImage(
			$(inputs[9])[0],
			0,
			0
			);

		return canvas.toDataURL("image/png");

 };

 this.cutImageSimple = function(objName, hidCropX, hidCropY, hidCropW, hidCropH, hidImgW, hidImgH, hidActualW, hidActualH, imgTempImageURL) {

	var inputs = [objName, "#" + hidCropX, "#" + hidCropY, "#" + hidCropW, "#" + hidCropH, "#" + hidImgW, "#" + hidImgH, "#" + hidActualW, "#" + hidActualH, "#" + imgTempImageURL];

	var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');

	if (inputs.length > 9) {

		var width  = $(inputs[3]).val();
		var height = $(inputs[4]).val();

		if (!width || width < 240)
			width = $(inputs[9])[0].width; //240

		if (!height || height < 240)
			height = $(inputs[9])[0].height; //240

		canvas.width = width;//($(inputs[3]).val());
		canvas.height = height; //($(inputs[4]).val());
		ctx.drawImage(
			$(inputs[9])[0],
			0,
			0
			);

		return canvas.toDataURL("image/png");
	}

 };

 this.cutImage = function(objName, hidCropX, hidCropY, hidCropW, hidCropH, hidImgW, hidImgH, hidActualW, hidActualH, imgTempImageURL) {

  		var inputs = [objName, "#" + hidCropX, "#" + hidCropY, "#" + hidCropW, "#" + hidCropH, "#" + hidImgW, "#" + hidImgH, "#" + hidActualW, "#" + hidActualH, "#" + imgTempImageURL];

		var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
 
		if (inputs.length > 9) {

			canvas.width = 240;//($(inputs[3]).val());
			canvas.height = 240; //($(inputs[4]).val());
			ctx.drawImage(
				$(inputs[9])[0],
				0,
				0
				);
			
			return canvas.toDataURL("image/png");


			/// step 1
			var oc = document.createElement('canvas'),
				octx = oc.getContext('2d');

			oc.width = $(inputs[9])[0].width * 0.5;
			oc.height = $(inputs[9])[0].height * 0.5;

			steps = Math.ceil(Math.log(oc.width*2 / $(inputs[3]).val()) / Math.log(2));

			octx.drawImage(
				$(inputs[9])[0], 
				($(inputs[1]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[2]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				($(inputs[3]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[4]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				0, 
				0, 
				oc.width * 0.5, 
				oc.height * 0.5
				);

			var oc1 = document.createElement('canvas'),
				octx1 = oc1.getContext('2d');

			octx1.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
return oc1.toDataURL("image/png");

			canvas.width = ($(inputs[3]).val());
			canvas.height = ($(inputs[4]).val());

			ctx.drawImage(
				oc1,
				0,
				0,
				oc1.width * 0.5,
				oc1.height * 0.5,
				0,
				0,
				canvas.width,
				canvas.height
				);

			return canvas.toDataURL("image/png");


			octx.drawImage(
				oc, 
				($(inputs[1]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[2]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				($(inputs[3]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[4]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				0, 
				0, 
				oc.width * 0.25, 
				oc.height * 0.25
				);

			canvas.width = $(inputs[3]).val();
			canvas.height = $(inputs[4]).val();

			ctx.drawImage(
				oc,
				0,
				0,
				oc.width * 0.25,
				oc.height * 0.25,
				0,
				0,
				canvas.width,
				canvas.height
				);

			return canvas.toDataURL("image/png");
			

			return oc.toDataURL("image/png");

			for (i = 0; i < steps; i++) {
				width = width * 0.5;
				height = height * 0.5;
				oc.width = width;
				oc.height = height;			
				octx.drawImage(
					oc, 
					($(inputs[1]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
					($(inputs[2]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
					($(inputs[3]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
					($(inputs[4]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
					0,
					0,
					width,
					height
				);
			}

			canvas.width = 240;
			canvas.height = 240;

			ctx.drawImage(
				oc,
				0,
				0,
				oc.width * 0.5,
				oc.height * 0.5,
				0,
				0,
				canvas.width,
				canvas.height
				);

			return canvas.toDataURL("image/png");

			octx.drawImage(
				$(inputs[9])[0], 
				($(inputs[1]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[2]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				($(inputs[3]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[4]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				0, 
				0, 
				oc.width, 
				oc.height
				);
		
			/// step 2
			octx.drawImage
			(
				oc,
				0,
				0,
				oc.width * 0.5,
				oc.height * 0.5
			);

//			canvas.width=600;
//			canvas.height=1050;

			canvas.width = $(inputs[3]).val();
			canvas.height= $(inputs[4]).val();

			ctx.drawImage
			(
				oc,
				0,
				0,
				oc.width * 0.5, 
				oc.height * 0.5,
				0,
				0,
				canvas.width,
				canvas.height
			);		
		}
		else 
		{

			canvas.width = $(inputs[3]).val();//this.options.width;
			canvas.height = $(inputs[4]).val();//this.options.height;
			canvas.style.color="red";

			ctx.drawImage(
				$(inputs[0])[0], 
				($(inputs[1]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[2]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				($(inputs[3]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[4]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				0, 
				0, 
				$(inputs[3]).val(), 
				$(inputs[4]).val()
				);

		}

		return canvas.toDataURL("image/png");
       
  };
  
 this.cutImage2 = function(objName, hidCropX, hidCropY, hidCropW, hidCropH, hidImgW, hidImgH, hidActualW, hidActualH, imgTempImageURL) {

  		var inputs = [objName, "#" + hidCropX, "#" + hidCropY, "#" + hidCropW, "#" + hidCropH, "#" + hidImgW, "#" + hidImgH, "#" + hidActualW, "#" + hidActualH, "#" + imgTempImageURL];

		var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
 
		if (inputs.length > 9) {

			/// step 1
			var oc = document.createElement('canvas'),
				octx = oc.getContext('2d');
//			oc.width = $(inputs[9])[0].width * 1.2;
//			oc.height = $(inputs[9])[0].height * 1.2;

			oc.width = $(inputs[9])[0].width;
			oc.height = $(inputs[9])[0].height;

			octx.drawImage(
				$(inputs[9])[0], 
				($(inputs[1]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[2]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				($(inputs[3]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[4]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				0, 
				0, 
				oc.width, 
				oc.height
				);
		
			/// step 2
			octx.drawImage
			(
				oc,
				0,
				0,
				oc.width * 0.5,
				oc.height * 0.5
			);

//			canvas.width=600;
//			canvas.height=1050;

			canvas.width = $(inputs[3]).val();
			canvas.height= $(inputs[4]).val();

			ctx.drawImage
			(
				oc,
				0,
				0,
				oc.width * 0.5, 
				oc.height * 0.5,
				0,
				0,
				canvas.width,
				canvas.height
			);		
		}
		else 
		{

			canvas.width = $(inputs[3]).val();//this.options.width;
			canvas.height = $(inputs[4]).val();//this.options.height;
			canvas.style.color="red";

			ctx.drawImage(
				$(inputs[0])[0], 
				($(inputs[1]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[2]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				($(inputs[3]).val())*(($(inputs[7]).val())/($(inputs[5]).val())), 
				($(inputs[4]).val())*(($(inputs[8]).val())/($(inputs[6]).val())), 
				0, 
				0, 
				$(inputs[3]).val(), 
				$(inputs[4]).val()
				);

		}

		return canvas.toDataURL("image/png");
       
  };
  
 this.cutImage1 = function(obj, hidCropX, hidCropY, hidCropW, hidCropH, hidImgW, hidImgH, hidActualW, hidActualH, imgTempImageURL) {
  
		inputs = [
					obj, 
					$("#" + hidCropX), 
					$("#" + hidCropY), 
					$("#" + hidCropW), 
					$("#" + hidCropH), 
					$("#" + hidImgW), 
					$("#" + hidImgH), 
					$("#" + hidActualW), 
					$("#" + hidActualH), 
					$("#" + imgTempImageURL)
				];

		var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
 
		if (inputs.length > 9) {

			/// step 1
			var oc =    document.createElement('canvas'),
				octx =  oc.getContext('2d');
			oc.width =  (inputs[9])[0].width * 1.2;
			oc.height = (inputs[9])[0].height * 1.2;

			octx.drawImage(
				(inputs[9])[0], 
				((inputs[1]).val())*(((inputs[7]).val())/((inputs[5]).val())), 
				((inputs[2]).val())*(((inputs[8]).val())/((inputs[6]).val())), 
				((inputs[3]).val())*(((inputs[7]).val())/((inputs[5]).val())), 
				((inputs[4]).val())*(((inputs[8]).val())/((inputs[6]).val())), 
				0, 
				0, 
				oc.width, 
				oc.height
				);
		
			/// step 2
			octx.drawImage
			(
				oc,
				0,
				0,
				oc.width * 0.5,
				oc.height * 0.5
			);

			canvas.width=600;
			canvas.height=1050;

			ctx.drawImage
			(
				oc,
				0,
				0,
				oc.width * 0.5, 
				oc.height * 0.5,
				0,
				0,
				canvas.width,
				canvas.height
			);		
		}
		else 
		{

			canvas.width = (inputs[3]).val();//this.options.width;
			canvas.height = (inputs[4]).val();//this.options.height;
			canvas.style.color="red";

			ctx.drawImage(
				(inputs[0])[0], 
				((inputs[1]).val())*(((inputs[7]).val())/((inputs[5]).val())), 
				((inputs[2]).val())*(((inputs[8]).val())/((inputs[6]).val())), 
				((inputs[3]).val())*(((inputs[7]).val())/((inputs[5]).val())), 
				((inputs[4]).val())*(((inputs[8]).val())/((inputs[6]).val())), 
				0, 
				0, 
				(inputs[3]).val(), 
				(inputs[4]).val()
				);

		}

		return canvas.toDataURL("image/png");
       
  	};
  
	this.getLineage = function (category) {
		var arr = [];
		if (!category) return arr;

		var arrId;
		var arrName;
		arrId   = category.lineage.split("|");
		arrName = category.lineagename.split("~");
		for (i = 0; i < arrId.length; i++) {

			// if value is empty, continue.
			if (arrId[i] == "")
				continue;

			if (arrId[i] == "0") {
				arrId[i] = "";
				arrName[i] = "Root";
			}
			arr = this.addElementToLineage (arr, arrId[i],arrName[i]);
		}
		return arr; 
	 };

	this.addElementToLineage = function (arr, id, name) {
		arr.push ({"id" : id, "name":name});
		return arr;
	};

	this.initializeSession = function (value) {
	//	this.permissionHash = value;
		value.lastSyncDateTime = new Date();
		localStorage.setItem('sessionHash', JSON.stringify(value));
	};

	this.removeSession = function() {
		localStorage.removeItem('sessionHash');
	}

	this.getLastSyncDateTime = function() {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (obj && obj != null && obj.lastSyncDateTime ? obj.lastSyncDateTime : undefined);
	}

	this.getTemplateID = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (obj && obj != null && obj.company ? obj.company.template_id : undefined);
	};

	this.getCompanyName = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (obj && obj != null && obj.company ? obj.company.name : undefined);
	};

	this.getUser = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (this.isUserHashExist() ? obj.user : undefined);
	};

	this.getUserInfo = function (value) {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));
		return (this.isUserHashExist() ? obj.user[value] : -100);
	};

	this.isUserHashExist = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (obj ? (obj.user) : false);
	};
	
	this.getPermission = function (value) {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (this.isPermissionHashExist() ? obj.permissionlist[value] : -100);
	};

	this.isPermissionHashExist = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (obj ? (obj.permissionlist) : false);
	};

	this.getAccessRight = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (this.isUserHashExist() ? this.getAccessRightByRole() : 0);
	};

	this.getAccessRightByRole = function() {

		if (this.isUserAnAdministrator())
			return 2;

		if (this.isUserACompanyUser())
			return 4;

		if (this.isUserASalesPerson())
			return 8;

		if (this.isUserAnAgent())
			return 16;

		if (this.isUserACustomerAdmin())
			return 32;

		if (this.isUserACustomerUser())
			return 64;

		return 0;

	}

	this.isConfigurationOn = function (value) {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));
		return (this.isConfigurationHashExist() ? obj.configurationlist[value] == 1 : 0);
	};

	this.getConfiguration = function (value) {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));	
		return (this.isConfigurationHashExist() ? obj.configurationlist[value] : -100);
	};

	this.isConfigurationHashExist = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (obj!=null ? (obj.configurationlist) : null);
	};

	this.isUserLoggedOn = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));		
		return (obj != null);
	};

	this.isUserSiteAdmin = function () {
		return (this.getUserInfo("sys_role_id") == 4000);
	};

	this.isUserAnAdministrator = function () {
		return (this.getUserInfo("sys_role_id") == 4002);
	};

	this.isUserACompanyUser = function () {
		return (this.getUserInfo("sys_role_id") == 4003);
	};

	this.isUserASalesPerson = function () {
		return (this.getUserInfo("sys_role_id") == 4004);
	};

	this.isUserAnAgent = function () {
		return (this.getUserInfo("sys_role_id") == 4005);
	};

	this.isUserACustomerAdmin = function () {
		return (this.getUserInfo("sys_role_id") == 4030);
	};

	this.isUserACustomerUser = function () {
		return (this.getUserInfo("sys_role_id") == 4031);
	};

	this.isUserACustomer = function () {
		return ( (this.getUserInfo("sys_role_id") == 4030) || (this.getUserInfo("sys_role_id") == 4031));
	};

	this.isUserAnInternal = function () {
		return ( (!this.isUserACustomer()) && (!this.isUserAnAgent()));
	};

	this.isOneTimeSession = function () {
		var obj = JSON.parse(localStorage.getItem('sessionHash'));	
		return (obj && obj.sessiontype == this.CONST_SESSIONTYPE_ONETIME ? true : false);
	};

	this.getCartItemCount = function(customerid)
	 {
		if(customerid)
		{
			var cart = getCartFromLocalStorage(customerid);
			if( cart != undefined && cart.lineitems != undefined)
				return cart.lineitems.length;
		}
		return 0;
	 };

	this.round = function(value, decimals) {
		if (!decimals) decimals = 0;
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	};

	this.uploadImage = function (imgdata, callback) {

		data = {
					image : imgdata
				};
		$http.post(baseURL + "/api/sessions/images/", imgdata, {headers: { 'Content-Type': undefined},
        transformRequest: angular.identity}).success(
			function (response, status, headers, config) {
				var object = new Object();
				object.statuscode    = 0;
				object.message       = "Success";
				object.data          = response;
				callback(object);
			}
		).error (
			function (data, status, headers, config) {
				var object = new Object();
				object.statuscode    = "-200";
				object.message       = "Unknown Error";
				object.data          = null;

				callback(object);
			}
		);

	};

	this.uploadFile = function (imgdata, callback) {

		data = {
					image : imgdata
				};

		$http.post(baseURL + "/api/sessions/files/", data).success(
			function (response, status, headers, config) {
				var object = new Object();
				object.statuscode    = 0;
				object.message       = "Success";
				object.data          = response;
				callback(object);
			}
		).error (
			function (data, status, headers, config) {
				var object = new Object();
				object.statuscode    = "-200";
				object.message       = "Unknown Error";
				object.data          = null;

				callback(object);
			}
		);

	};

	this.convertToServerTimeZone = function (dateString) {
		var tempDate = new Date(dateString);
		var userTimezoneOffset = tempDate.getTimezoneOffset() * 60000;
		return (new Date(tempDate.getTime() - userTimezoneOffset));			
	}

	this.convertToClientTimeZone = function (dateString) {
		var tempDate = new Date(dateString);
		var userTimezoneOffset = tempDate.getTimezoneOffset() * 60000;
		return (new Date(tempDate.getTime() + userTimezoneOffset));			
	}

	this.getNewProductShowXDays = function() {
		return (this.getConfiguration(this.CONST_CONFIG_COMPANY_PRODUCT_NEW_SHOW_X_DAYS));
	};

	this.getTotalRecords = function(data) {
		if(data[0])
			return data[0].totalrecords;
		else
			return 0;
	}

	this.getStates = function () {
		state_list = 
		[
			'Andaman & Nicobar Islands',
			'Andhra Pradesh',
			'Arunachal Pradesh',
			'Assam',
			'Bihar',
			'Chandigarh',
			'Chhattisgarh',
			'Dadra & Nagar Haveli',
			'Daman & Diu',
			'Delhi',
			'Goa',
			'Gujarat',
			'Haryana',
			'Himachal Pradesh',
			'Jammu & Kashmir',
			'Jharkhand',
			'Karnataka',
			'Kerala',
			'Ladakh',
			'Lakshadweep',
			'Madhya Pradesh',
			'Maharashtra',
			'Manipur',
			'Meghalaya',
			'Mizoram',
			'Nagaland',
			'Odisha',
			'Puducherry',
			'Punjab',
			'Rajasthan',
			'Sikkim',
			'Tamil Nadu',
			'Telangana',
			'Tripura',
			'Uttar Pradesh',
			'Uttarakhand',
			'West Bengal'
		];

		return state_list;
	};

	this.setBucketFilters = function (options) {
		this.bucketFilters = options;
	};

	this.clearBucketFilters = function () {
		this.bucketFilters = {};
	};

	this.getBucketFilters = function () {
		return this.bucketFilters;;
	};

	this.setJournalFilters = function (options) {
		this.journalFilters = options;
	};

	this.clearJournalFilters = function () {
		this.journalFilters = {};
	};

	this.getJournalFilters = function () {
		return this.journalFilters;;
	};

	this.setBillFilters = function (options) {
		this.billFilters = options;
	};

	this.clearBillFilters = function () {
		this.billFilters = {};
	};

	this.getBillFilters = function () {
		return this.billFilters;;
	};

	this.setNotificationFilters = function (options) {
		this.notificationFilters = options;
	};

	this.clearNotificationFilters = function () {
		this.notificationFilters = {};
	};

	this.getNotificationFilters = function () {
		return this.notificationFilters;;
	};

	this.setCustomerFilters = function (options) {
		this.customerFilters = options;
	};

	this.clearCustomerFilters = function () {
		this.customerFilters = {};
	};

	this.getCustomerFilters = function () {
		return this.customerFilters;;
	};

	this.setLoadingFlag = function (value) {
		if(!this.httpRequestCount) this.httpRequestCount = 0;
		
		this.spinnerFlag = value;
		if(value)
		{
			$('#loadingDiv').show();
			this.httpRequestCount++;
		}
		else {
			this.httpRequestCount--;
		}
	};

	this.clearLoadingFlag = function () {
		this.spinnerFlag = false;
		this.httpRequestCount = 0;
		$('#loadingDiv').hide();
	};

	this.getLoadingFlag = function () {

		return (this.httpRequestCount > 0 ? true :this.spinnerFlag);
	};

	this.checkExcludeUrlList = function (url, method) {

		var urlparts = url.split('/');
		var exclusionlist = ['customers', 'agents', 'transporters', 'paymentterms', 'companytypes', 'taxslabs', 'tax', 'hsn', 'unitofmeasures', 'customfilters', 'tempos', 'pricegroups', 'roles', 'users'];
		var name;
		
		if(urlparts.length > 1) name = urlparts[2];
		else return false;
		
		if(method == 'GET' &&  exclusionlist.includes(name)) return true;

		return false;
		
	}

	this.setDeliveryNoteFilters = function (options) {
		this.deliveryNoteFilters = options;
	};

	this.clearDeliveryNoteFilters = function () {
		this.deliveryNoteFilters = {};
	};

	this.getDeliveryNoteFilters = function () {
		return this.deliveryNoteFilters;;
	};

	this.setOrderFilters = function (options) {
		this.orderFilters = options;
	};

	this.clearOrderFilters = function () {
		this.orderFilters = {};
	};

	this.getOrderFilters = function () {
		return this.orderFilters;;
	};

	this.setPackingslipFilters = function (options) {
		this.packingSlipFilters = options;
	};

	this.clearPackingslipFilters = function () {
		this.packingSlipFilters = {};
	};

	this.getPackingslipFilters = function () {
		return this.packingSlipFilters;;
	};

	this.applyCapitalization = function(name) {
		return $filter('capitalize')(name, true);
	};

	this.showCustomerDialog = function (id, controllerName, inputHash, callback) {
		CommonFunctions.showDialog(id, controllerName, inputHash, callback);
	};

	this.showCustomersDialog = function (id, controllerName, inputHash, callback) {
		CommonFunctions.showDialog(id, controllerName, inputHash, callback);
	};

	this.showDialog = function (id, controllerName, inputHash, callback) {
		CommonFunctions.showDialog(id, controllerName, inputHash, callback);
	};


	this.isAddProductAllowed = function() {
 		return (this.getPermission(this.CONST_PERMISSION_PRODUCT_CREATE) == '1');
 	};

 	this.isEditProductAllowed = function() {
 		return (this.getPermission(this.CONST_PERMISSION_PRODUCT_UPDATE) == '1');
 	};

 	this.isDeleteProductAllowed = function() {
 		return (this.getPermission(this.CONST_PERMISSION_PRODUCT_DELETE) == '1');
 	};

 	this.isPendingApprovalReasonCreditDays = function(order_workflow_reason){
 		return (order_workflow_reason!= undefined ? order_workflow_reason.toLowerCase().includes("due") : false);
 	}

 	this.isPendingApprovalReasonCreditLimit = function(order_workflow_reason){
 		return (order_workflow_reason!= undefined ? order_workflow_reason.toLowerCase().includes("balance") : false);
 	}

 	this.exceedsToday = function(date){
 		var today = new Date();
	 	if(Date.parse(date) < today)
	 		return true; 	 
	 	return false;
 	}

 	this.isAmountDue = function(amount) {
		if(amount > 0)
			return true;
		else
			return false;
	 }

	 this.getRecordsPerPage = function()
	 {
	 	var itemsPerPage = this.getConfiguration(this.CONST_CONFIG_RECORDS_PER_PAGE);
		if(itemsPerPage == undefined || itemsPerPage == null)
			itemsPerPage = 20;
		return itemsPerPage;
	 }

	 this.shareMultipleImages  = function(catalogName, imageurls) {
	 	imageurls = imageurls.filter(x=>x != null && x != undefined);
		window.plugins.socialsharing.share('Catalog ' + catalogName + ' shared by ' + this.getCompanyName() + ' through Simply', null, imageurls);
	 }

	 this.downloadAndOpenInApp = function(fileName, file, share) {
		var storageLocation = cordova.file.externalDataDirectory;
		window.resolveLocalFileSystemURL(storageLocation, function (fileSystem) {

		        fileSystem.getDirectory('Download', {
		                create: true,
		                exclusive: false
		            },
		            function (directory) {

		                //You need to put the name you would like to use for the file here.
		                directory.getFile(fileName, {create: true}, function (fileEntry) {

		                        fileEntry.createWriter(function (writer) {
		                        	var url = fileEntry.toURL();
		                            writer.onwriteend = function () {
		                            	if(share) {
		                            		window.plugins.socialsharing.share('Please find the attached invoice for your reference', 'Invoice PDF', 
		                            			url);
		                            	}
		                            	else {			                                
			                                cordova.plugins.fileOpener2.open(url, 'application/pdf', {
								                      error: function error(err) {
								                        console.error(err);
								                        alert("Unable to open file");
								                      },
								                      success: function success() {
								                        console.log("success with opening the file");
								                      }
								            });
			                            }
		                            };

		                            writer.seek(0);
		                            writer.write(file); //You need to put the file, blob or base64 representation here.

		                        }, errorCallback);
		                    }, errorCallback);
		            }, errorCallback);
		    }, errorCallback);

		var errorCallback = function(e) {
		    
		    console.log("Error: " + e)
		    
		}
	}

	this.isMobileApp = function() {		
		  if(window.cordova)
		    return true;
		  return false;
		//return document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
	}

});
