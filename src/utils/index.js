const Crypto  = require("crypto");
var Response  = require("../bo/response");
var Map       = require("../utils/map");
const Config  = require("../config/config");

/* PERMISSION CONSTANTS */
const CONST_PERMISSION_CUSTOMER_CREATE          = 5200;
const CONST_PERMISSION_CUSTOMER_UPDATE          = 5201;
const CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE  = 5206;
const CONST_PERMISSION_CUSTOMER_DELETE			= 5654;

const CONST_PERMISSION_CUSTOMERTYPE_CREATE      = 5202;
const CONST_PERMISSION_CUSTOMERTYPE_UPDATE      = 5203;
const CONST_PERMISSION_CUSTOMERTYPE_DELETE 		= 5657;

const CONST_PERMISSION_AGENT_CREATE             = 5204;
const CONST_PERMISSION_AGENT_UPDATE             = 5205;
const CONST_PERMISSION_AGENT_DELETE             = 5653;

const CONST_PERMISSION_PRICEGROUP_CREATE        = 5401;
const CONST_PERMISSION_PRICEGROUP_UPDATE        = 5402;
const CONST_PERMISSION_PRICEGROUP_DELETE        = 5658;

const CONST_PERMISSION_UNIT_CREATE              = 5470;
const CONST_PERMISSION_UNIT_UPDATE              = 5471;
const CONST_PERMISSION_UNIT_DELETE              = 5659;

const CONST_PERMISSION_WORKFLOW_SETUP           = 5450;
 
const CONST_PERMISSION_ORDER_CREATE             = 5000;
const CONST_PERMISSION_ORDER_APPROVE            = 5001;
const CONST_PERMISSION_ORDER_CANCEL             = 5002;
const CONST_PERMISSION_ORDER_NUMBER_EDIT        = 5003;

const CONST_PERMISSION_USER_CREATE              = 5102;
const CONST_PERMISSION_USER_UPDATE              = 5103;
const CONST_PERMISSION_USER_DELETE 	            = 5660;

const CONST_PERMISSION_ROLE_CREATE              = 5104;
const CONST_PERMISSION_ROLE_UPDATE              = 5105;

const CONST_PERMISSION_PRODUCT_CREATE           = 5106;
const CONST_PERMISSION_PRODUCT_UPDATE           = 5107;
const CONST_PERMISSION_PRODUCT_DELETE           = 5652;

const CONST_PERMISSION_CATEGORY_CREATE          = 5108;
const CONST_PERMISSION_CATEGORY_UPDATE          = 5109;

const CONST_PERMISSION_TRANSPORTER_CREATE       = 5110;
const CONST_PERMISSION_TRANSPORTER_UPDATE       = 5111;
const CONST_PERMISSION_TRANSPORTER_DELETE 		= 5655;

const CONST_PERMISSION_PAYMENTTERM_CREATE       = 5112;
const CONST_PERMISSION_PAYMENTTERM_UPDATE       = 5113;
const CONST_PERMISSION_PAYMENTTERM_DELETE 		= 5656;

const CONST_PERMISSION_UPDATE_PASSWORD          = 5114;

const CONST_PERMISSION_ORDER_CREATE_TERM_CHANGE = 5460;
const CONST_PERMISSION_ORDER_CREATE_TRANSPORTER_CHANGE = 5461;
const CONST_PERMISSION_CUSTOMER_TYPE_CHANGE     = 5462;
const CONST_PERMISSION_PACKING_SLIP_CREATE      = 5463;
const CONST_PERMISSION_PACKING_SLIP_CANCEL      = 5464;
const CONST_PERMISSION_PACKING_SLIP_VIEW        = 5465;
const CONST_PERMISSION_PACKING_SLIP_NUMBER_EDIT = 5466;

const CONST_PERMISSION_DELIVERY_NOTE_CREATE      = 5500;
const CONST_PERMISSION_DELIVERY_NOTE_UPDATE      = 5501;
const CONST_PERMISSION_DELIVERY_NOTE_CANCEL      = 5502;
const CONST_PERMISSION_DELIVERY_NOTE_VIEW        = 5503;
const CONST_PERMISSION_DELIVERY_NOTE_NUMBER_EDIT = 5504;

const CONST_PERMISSION_GATE_PASS_CREATE      	 = 5551;
const CONST_PERMISSION_GATE_PASS_UPDATE      	 = 5552;
const CONST_PERMISSION_GATE_PASS_CANCEL      	 = 5553;
const CONST_PERMISSION_GATE_PASS_VIEW       	 = 5554;
const CONST_PERMISSION_GATE_PASS_EDIT       	 = 5555;

const CONST_PERMISSION_STOCK_SUMMARY_VIEW        = 5600;

const CONST_PERMISSION_BILL_VIEW                 = 5650;

const CONST_PRICING_PRODUCT_FLAT                 = 4800;
const CONST_PRICING_PRODUCT_VARIABLE             = 4801;
const CONST_PRICING_PRODUCT_PRICEGROUP           = 4802;

const CONST_STATUS_PACKING_SLIP_PENDING_INVOICE  = 5199;
const CONST_STATUS_PACKING_SLIP_PENDING_DISPATCH = 5200;
const CONST_STATUS_PACKING_SLIP_DISPATCHED       = 5201;
const CONST_STATUS_PACKING_SLIP_COMPLETED        = 5202;
const CONST_STATUS_PACKING_SLIP_CANCELLED        = 5203;

const CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH= 5499;
const CONST_STATUS_DELIVERY_NOTE_PENDING_LR      = 5500;
const CONST_STATUS_DELIVERY_NOTE_DELIVERED       = 5501;
const CONST_STATUS_DELIVERY_NOTE_COMPLETED       = 5502;
const CONST_STATUS_DELIVERY_NOTE_CANCELLED       = 5503;

const CONST_STATUS_ORDER_IN_PACKING              = 4201;
const CONST_STATUS_ORDER_DELIVERED               = 4202;
const CONST_STATUS_ORDER_PENDING_APPROVAL        = 4203;
const CONST_STATUS_ORDER_REJECTED                = 4204;
const CONST_STATUS_ORDER_CANCELLED               = 4205;

const CONST_STATUS_DELIVERY_PARTIAL              = 5701;
const CONST_STATUS_DELIVERY_CANCEL               = 5703;
const CONST_STATUS_DELIVERY_PENDING              = 5700;
const CONST_STATUS_DELIVERY_DELIVERED            = 5702;

const CONST_PAYMENT_STATUS_ACTIVE	             = 5800;
const CONST_PAYMENT_STATUS_PAID                  = 5801;
const CONST_PAYMENT_STATUS_PARTIALLY_PAID        = 5802;
const CONST_PAYMENT_STATUS_DELETE                = 5803;

const CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD = 'transporter_code_required';
const CONST_CONFIG_COMPANY_CATEGORY_CODE_REQD    = 'category_code_required';
const CONST_CONFIG_COMPANY_AGENT_CODE_REQD       = 'agent_code_required';
const CONST_CONFIG_COMPANY_PRODUCT_CODE_REQD     = 'product_code_required';

const CONST_CONFIG_TAX_AUTO_CALCULATION          = "tax_auto_calculation_order";
const CONST_CONFIG_TAX_GST_NUMBER	             = "tax_gst_number";

const CONST_CONFIG_MODULE_NOTIFICATION_SMS 		 = "module_notification_sms";

const CONST_CONFIG_MODULE_INTEGRATION_INVOICE    = "module_integration_invoice";
const CONST_CONFIG_MODULE_INTEGRATION_PAYMENT    = "module_integration_payment";
const CONST_CONFIG_MODULE_INTEGRATION_PRODUCT    = "module_integration_product";
const CONST_CONFIG_MODULE_INTEGRATION_CUSTOMER   = "module_integration_customer";

const CONST_ACTIVITY_TYPE_CREATE				 = "ActivityCreate";

const LocalEventTypeEnum = {
	CreateBill: 2001,
	UpdateBill: 2002,
	ProductImageUpload: 2003,
	CompanyCreate: 2004
};

const CONST_DEFAULT_PAYMENT_TERM = 90;

const EventTypeEnum = {
	OrderCreate: 1001,
	OrderUpdate: 1002,
	CustomerShare: 1003,
	AgentUpload: 1004,
	CustomerUpload: 1005,
	TransporterUpload: 1006,
	BillUpload: 1007,
	WelcomeEmail: 1008,
	BillingCompany: 1009,
	CompanyCreate: 1008,
	PaymentThankYou: 1010
};

const DocumentTypeEnum = {
	Order: 1001,
	Category: 1002,
	DeliveryNote: 1003,
	PackingSlip: 1004,
};

const SyncStatusEnum = {
	Pending: 4100,
	Error: 4102,
	DoNotSync: 4103,
	Completed: 4105,
	Cancelled: 4106,
	Processing: 4104
};

const SessionTypesEnum = {
	Web: 4100,
	Mobile: 4101,
	API: 4102,
	OneTime: 4103
};

const UploadTypeEnum = {
	Agent: 1001,
	Customer: 1002,
	Transporter:1003,
	Bill: 1004
};

const NotificationStatusEnum = {
    Pending: 1001,
    Error: 1002,
    Delivered: 1003,
    Undelivered: 1004
};

const NotificationTypeEnum = {
    Order: 5801,
    Catalog: 5802,
    PaymentReminder: 5803,
    WelcomeEmail: 5804,
    PaymentThankYou: 5805
};


function setErrorResponse(code, message) {
	var response = new Response();
	response.statuscode  = code;
	response.message     = message;
	return response;
}

function setData(arr, data) {

	var object;
	var objectname;

	for (i = 0; i < arr.length; i=i+2) {
		objectname       = arr[i];
		object           = arr[i+1];
		data[objectname] = object;
	}

	return data;

}

function setOKResponse(object, objname) {

	var data = {};

 	//if (object !== null && object.constructor.toString().indexOf("Array") > -1) {
 	if (object !== null && isArray(object) > -1) {
 		if (objname === "")
 			data = setData(object, data);
 		else {
			data[objname.toLowerCase() + "list"] = object;
		}
	}
	else if (object !== null)
		data[objname.toLowerCase()] = object;

	var response           = new Response();
	response.statuscode    = 0;
	response.message       = "Success";

	//if (!isEmpty(object))
		response.data    = data;

	return response;

}

function isArray(object) {
	return object.constructor.toString().indexOf("Array");
}

function randomString(length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

function round (value, decimals) {
 	if (!decimals) decimals = 0;
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
};

function round_even (value) {
 	value = this.round(value, 2)
	v = value.toFixed(2)
	d = v.toString().split(".")[1]
	r = parseInt(d) % 2
	if(r!==0) {
	    v = parseFloat(v) + 0.01
	}
	return parseFloat(v);
};

function encryptWithMD5(chars) {
       return Crypto.createHash('md5').update(chars).digest('hex');
}

function isEmpty(object) { 
	for(var i in object) { 
		return false; 
	} 
	return true; 
}

function readSID(req) {
	//return req.header('app_sid');
	var authHeader = req.header('Authorization');
	var token = null;
	if (authHeader != null && authHeader.startsWith("Bearer "))
	     token = authHeader.substring(7, authHeader.length);
	return token;
}

function getGlobalSession()
{
	session = {}
	session.company_id = 1;
	session.user = {};
	session.user.id = null;
	return session;
}

function getAuthData(req)
{
	//return req.header('app_sid');
	var authHeader = req.header('Authorization');
	var authData = null;
	if (authHeader != null && authHeader.startsWith("Basic "))
	     authData = authHeader.substring(6, authHeader.length);
	return authData;
}

function getEventManager() {
	let EventManager = require("../events/EventManager");
	return EventManager.getInstance();
}

function getValue(field, defaultValue) {
	if (field && (typeof (field) != "function"))   //object properties are set as function. So checking that.
		return field;
	else if (defaultValue)
		return defaultValue;
	else if (typeof(field) == "number")
		return 0;
	else
		return "";
}

function isEmptyString(str) {

	return ( (typeof str === "undefined") ||  str === null || (str + "").trim().length === 0);
}

function consoleLog(str) {
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var dateTime = date+' '+time;
	console.log(dateTime + ":" + str);
}

function mapPartnerNotificationStatus(status) {
    if(status.toUpperCase() == "DELIVERED")
        return this.NotificationStatusEnum.Delivered;
    else if(status.toUpperCase() == "UNDELIVERED")
        return this.NotificationStatusEnum.Undelivered;
    else 
        return this.NotificationStatusEnum.Error;
}

function initObjectIfNotExist(object, name) {

	if (typeof object === "undefined"){

		switch (name) {
			case "Address":
				return Map.initAddress();
			case "Agent":
				return Map.initAgent();
			case "Category":
				return Map.initCategory();
			case "Company":
				return Map.initCompany();
			case "CompanyType":
				return Map.initCompanyType();
			case "Customer":
				return Map.initCustomer();
			case "Dimension":
				return Map.initDimension();
			case "PaymentTerm":
				return Map.initPaymentTerm();
			case "Permission":
				return Map.initPermission();
			case "Product":
				return Map.initProduct();
			case "Quantity":
				return Map.initQuantity();
			case "Role":
				return Map.initRole();
			case "SalesPerson":
				return Map.initSalesPerson();
			case "Session":
				return Map.initSession();
			case "StockBucket":
				return Map.initStockBucket();
			case "Transporter":
				return Map.initTransporter();
			case "User":
				return Map.initUser();
			case "UOM":
				return Map.initUOM();
			case "PriceList":
				return Map.initPriceList();
			case "PriceGroup":
				return Map.initPriceGroup();
			case "TaxSlab":
				return Map.initTaxSlab();
		}
	}
	else
		return object;

}

function decode(input){
	
	var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\+\/\=]/g;
    if (base64test.exec(input)) {
        window.alert("There were invalid base64 characters in the input text.\n" +
            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
            "Expect errors in decoding.");
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

    } while (i < input.length);

    return output;
        

}

function convertNumberToWordsIndia(amount) {
    var words = {
    	'0': '',
    	'1': 'One',
    	'2': 'Two',
	    '3': 'Three',
	    '4': 'Four',
	    '5': 'Five',
	    '6': 'Six',
	    '7': 'Seven',
	    '8': 'Eight',
	    '9': 'Nine',
	    '10': 'Ten',
	    '11': 'Eleven',
	    '12': 'Twelve',
	    '13': 'Thirteen',
	    '14': 'Fourteen',
	    '15': 'Fifteen',
	    '16': 'Sixteen',
	    '17': 'Seventeen',
	    '18': 'Eighteen',
	    '19': 'Nineteen',
	    '20': 'Twenty',
	    '30': 'Thirty',
	    '40': 'Forty',
	    '50': 'Fifty',
	    '60': 'Sixty',
	    '70': 'Seventy',
	    '80': 'Eighty',
	    '90': 'Ninety'
    };

    amount = amount.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
            received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                if (n_array[i] == 1) {
                    n_array[j] = 10 + parseInt(n_array[j]);
                    n_array[i] = 0;
                }
            }
        }
        value = "";
        for (var i = 0; i < 9; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                value = n_array[i] * 10;
            } else {
                value = n_array[i];
            }
            if (value != 0) {
                words_string += words[value] + " ";
            }
            if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Crores ";
            }
            if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Lakhs ";
            }
            if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Thousand ";
            }
            if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                words_string += "Hundred ";
//                words_string += "Hundred and ";
            } else if (i == 6 && value != 0) {
                words_string += "Hundred ";
            }
        }
        words_string = words_string.split("  ").join(" ");
    }
    words_string = words_string + (atemp.length > 1 && atemp[1] > 0 ? " and " + convertNumberToWordsIndia(atemp[1]) + " paise " : "") + "only.";
    words_string = words_string.substring(0, 1) + words_string.substring(1).toLowerCase();
    return words_string;
}

function email(from, to, subject, body, callback) {

	const nodemailer = require('nodemailer');

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
	    service: 'gmail',
	    auth: {
	        user: Config.email_user || 'simply.to.business@gmail.com',
	        pass: Config.email_pass || 'Mumbai905!'
	    }
	});

	// setup email data with unicode symbols
	let mailOptions = {
	    from: from, // sender address
	    to: to, // list of receivers
	    subject: subject, // Subject line
	    text: 'Hello world', // plain text body
	    html: body // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
	    return callback(error, info);
	});

}

function getTransporterValidHeaderList() {

		let validHeaderList = [];
		validHeaderList.push({
			name: "Code", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "First Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Last Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Govt Code", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Address1", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Address2", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Address3", type: "string", length: 128
		});

		validHeaderList.push({
			name: "City", type: "string", length: 128
		});

		validHeaderList.push({
			name: "State", type: "string", length: 32
		});

		validHeaderList.push({
			name: "PinCode", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Email", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Other Phone", type: "string", length: 32
		});		

		validHeaderList.push({
			name: "Status", type: "string", length: 32
		});

		return validHeaderList;

	}

function getCustomerValidHeaderList() {

		let validHeaderList = [];
		validHeaderList.push({
			name: "Code", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Firm Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "First Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Last Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Accounting Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Address1", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Address2", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Address3", type: "string", length: 128
		});

		validHeaderList.push({
			name: "City", type: "string", length: 128
		});

		validHeaderList.push({
			name: "State", type: "string", length: 32
		});

		validHeaderList.push({
			name: "PinCode", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Email", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Other Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Shipping Address1", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Shipping Address2", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Shipping Address3", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Shipping City", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Shipping State", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Shipping PinCode", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Shipping Email", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Shipping Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Shipping Other Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Billing Address1", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Billing Address2", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Billing Address3", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Billing City", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Billing State", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Billing PinCode", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Billing Email", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Billing Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Billing Other Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Rate Category", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Agent", type: "string", length: 32
		});
		
		validHeaderList.push({
			name: "Agent Code", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Payment Term", type: "string", length: 32
		});
		
		validHeaderList.push({
			name: "Transporter", type: "string", length: 32
		});

		validHeaderList.push({
			name: "GST Type", type: "string", length: 32
		});

		validHeaderList.push({
			name: "GST Number", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Credit Limit", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Current Balance", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Current Overdue", type: "string", length: 32
		});

		validHeaderList.push({
			name: "PAN Number", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Notes", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Login Name", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Password", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Status", type: "string", length: 32
		});

		return validHeaderList;

	}

function getBillValidHeaderList() {

		let validHeaderList = [];


		validHeaderList.push({
			name: "Customer Code", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Customer Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Phone Number", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Email", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Bill Number", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Bill Reference Number", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Bill Date", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Bill Amount", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Balance Amount", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Due Date", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Paid Amount Till Date", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Latest Paid Date", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Inactive", type: "string", length: 32
		});
		return validHeaderList;

	}

function getAgentValidHeaderList() {

		let validHeaderList = [];
		validHeaderList.push({
			name: "Code", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Firm Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "First Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Last Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Accounting Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Address1", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Address2", type: "string", length: 128
		});

		validHeaderList.push({
			name: "Address3", type: "string", length: 128
		});

		validHeaderList.push({
			name: "City", type: "string", length: 128
		});

		validHeaderList.push({
			name: "State", type: "string", length: 32
		});

		validHeaderList.push({
			name: "PinCode", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Email", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Other Phone", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Commission", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Sales Person Name", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Sales Person Login Name", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Login Name", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Password", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Status", type: "string", length: 32
		});

		return validHeaderList;

	}

function getEwayBillStates() {

		state_list = 
		[
			{
				"name": "Andaman & Nicobar Islands",
				"code": "35"
			},
			{
				"name": "Andhra Pradesh",
				"code": "37"
			},
			{
				"name": "Arunachal Pradesh",
				"code": "12"
			},
			{
				"name": "Assam",
				"code": "18"
			},
			{
				"name": "Bihar",
				"code": "10"
			},
			{
				"name": "Chandigarh",
				"code": "4"
			},
			{
				"name": "Chhattisgarh",
				"code": "22"
			},
			{
				"name": "Dadra & Nagar Haveli",
				"code": "26"
			},
			{
				"name": "Daman & Diu",
				"code": "25"
			},
			{
				"name": "Delhi",
				"code": "7"
			},
			{
				"name": "Goa",
				"code": "30"
			},
			{
				"name": "Gujarat",
				"code": "24"
			},
			{
				"name": "Haryana",
				"code": "6"
			},
			{
				"name": "Himachal Pradesh",
				"code": "2"
			},
			{
				"name": "Jammu & Kashmir",
				"code": "1"
			},
			{
				"name": "Jharkhand",
				"code": "20"
			},
			{
				"name": "Karnataka",
				"code": "29"
			},
			{
				"name": "Kerala",
				"code": "32"
			},
			{
				"name": "Ladakh",
				"code": "-1"
			},
			{
				"name": "Lakshadweep",
				"code": "31"
			},
			{
				"name": "Madhya Pradesh",
				"code": "23"
			},
			{
				"name": "Maharashtra",
				"code": "27"
			},
			{
				"name": "Manipur",
				"code": "14"
			},
			{
				"name": "Meghalaya",
				"code": "17"
			},
			{
				"name": "Mizoram",
				"code": "15"
			},
			{
				"name": "Nagaland",
				"code": "13"
			},

			{
				"name": "Odisha",
				"code": "21"
			},
			{
				"name": "Other Countries",
				"code": "99"
			},
			{
				"name": "Other Territory",
				"code": "97"
			},
			{
				"name": "Puducherry",
				"code": "34"
			},
			{
				"name": "Punjab",
				"code": "3"
			},
			{
				"name": "Rajasthan",
				"code": "8"
			},
			{
				"name": "Sikkim",
				"code": "11"
			},
			{
				"name": "Tamil Nadu",
				"code": "33"
			},
			{
				"name": "Telangana",
				"code": "36"
			},
			{
				"name": "Tripura",
				"code": "16"
			},
			{
				"name": "Uttar Pradesh",
				"code": "9"
			},
			{
				"name": "Uttarakhand",
				"code": "5"
			},
			{
				"name": "West Bengal",
				"code": "19"
			}
		];

		return state_list;
	};

	function getEwayBillStateCode(state_name) {
		return this.getEwayBillStates().filter(x=>x.name == state_name)[0].code;
	}

module.exports = {
	setErrorResponse                    : setErrorResponse,
	setOKResponse                       : setOKResponse,
	randomString                        : randomString,
	encryptWithMD5                      : encryptWithMD5,
	readSID                             : readSID,
	getAuthData							: getAuthData,
	decode								: decode,
	getValue                            : getValue,
	initObjectIfNotExist                : initObjectIfNotExist,
	isEmptyString                       : isEmptyString,
	isArray                             : isArray,
	consoleLog                          : consoleLog,
	round                               : round,
	round_even                          : round_even,
	email                               : email,
	getBillValidHeaderList				: getBillValidHeaderList,
	getAgentValidHeaderList 			: getAgentValidHeaderList,
	getTransporterValidHeaderList	    : getTransporterValidHeaderList,
	getCustomerValidHeaderList			: getCustomerValidHeaderList,
	convertNumberToWordsForIndia        : convertNumberToWordsIndia,
	getEventManager                     : getEventManager,
	getGlobalSession					: getGlobalSession,
	getEwayBillStates 					: getEwayBillStates,
	getEwayBillStateCode 				: getEwayBillStateCode,
	CONST_PERMISSION_CUSTOMER_CREATE    : CONST_PERMISSION_CUSTOMER_CREATE,
	CONST_PERMISSION_CUSTOMER_UPDATE    : CONST_PERMISSION_CUSTOMER_UPDATE,
	CONST_PERMISSION_CUSTOMER_DELETE    : CONST_PERMISSION_CUSTOMER_DELETE,
	CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE : CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE,
	CONST_PERMISSION_CUSTOMERTYPE_CREATE: CONST_PERMISSION_CUSTOMERTYPE_CREATE,
	CONST_PERMISSION_CUSTOMERTYPE_UPDATE: CONST_PERMISSION_CUSTOMERTYPE_UPDATE,
	CONST_PERMISSION_CUSTOMERTYPE_DELETE: CONST_PERMISSION_CUSTOMERTYPE_DELETE,
	CONST_PERMISSION_AGENT_CREATE       : CONST_PERMISSION_AGENT_CREATE,
	CONST_PERMISSION_AGENT_UPDATE       : CONST_PERMISSION_AGENT_UPDATE,
	CONST_PERMISSION_AGENT_DELETE       : CONST_PERMISSION_AGENT_DELETE,
	CONST_PERMISSION_USER_CREATE        : CONST_PERMISSION_USER_CREATE,
	CONST_PERMISSION_USER_UPDATE        : CONST_PERMISSION_USER_UPDATE,
	CONST_PERMISSION_USER_DELETE        : CONST_PERMISSION_USER_DELETE,
	CONST_PERMISSION_ROLE_CREATE        : CONST_PERMISSION_ROLE_CREATE,
	CONST_PERMISSION_ROLE_UPDATE        : CONST_PERMISSION_ROLE_UPDATE,
	CONST_PERMISSION_ORDER_CREATE       : CONST_PERMISSION_ORDER_CREATE,
	CONST_PERMISSION_ORDER_APPROVE      : CONST_PERMISSION_ORDER_APPROVE,
	CONST_PERMISSION_ORDER_CANCEL       : CONST_PERMISSION_ORDER_CANCEL,
	CONST_PERMISSION_ORDER_NUMBER_EDIT  : CONST_PERMISSION_ORDER_NUMBER_EDIT,
	CONST_PERMISSION_CATEGORY_CREATE    : CONST_PERMISSION_CATEGORY_CREATE,
	CONST_PERMISSION_CATEGORY_UPDATE    : CONST_PERMISSION_CATEGORY_UPDATE,
	CONST_PERMISSION_PRODUCT_CREATE     : CONST_PERMISSION_PRODUCT_CREATE,
	CONST_PERMISSION_PRODUCT_UPDATE     : CONST_PERMISSION_PRODUCT_UPDATE,
	CONST_PERMISSION_PRODUCT_DELETE     : CONST_PERMISSION_PRODUCT_DELETE,
	CONST_PERMISSION_PAYMENTTERM_CREATE : CONST_PERMISSION_PAYMENTTERM_CREATE,
	CONST_PERMISSION_PAYMENTTERM_UPDATE : CONST_PERMISSION_PAYMENTTERM_UPDATE,
	CONST_PERMISSION_PAYMENTTERM_DELETE : CONST_PERMISSION_PAYMENTTERM_DELETE,
	CONST_PERMISSION_TRANSPORTER_CREATE : CONST_PERMISSION_TRANSPORTER_CREATE,
	CONST_PERMISSION_TRANSPORTER_UPDATE : CONST_PERMISSION_TRANSPORTER_UPDATE,
	CONST_PERMISSION_TRANSPORTER_DELETE : CONST_PERMISSION_TRANSPORTER_DELETE,
	CONST_PERMISSION_PRICEGROUP_CREATE  : CONST_PERMISSION_PRICEGROUP_CREATE,
	CONST_PERMISSION_PRICEGROUP_UPDATE  : CONST_PERMISSION_PRICEGROUP_UPDATE,
	CONST_PERMISSION_PRICEGROUP_DELETE  : CONST_PERMISSION_PRICEGROUP_DELETE,
	CONST_PRICING_PRODUCT_FLAT          : CONST_PRICING_PRODUCT_FLAT,
	CONST_PRICING_PRODUCT_VARIABLE      : CONST_PRICING_PRODUCT_VARIABLE,
	CONST_PRICING_PRODUCT_PRICEGROUP    : CONST_PRICING_PRODUCT_PRICEGROUP,
	CONST_PERMISSION_WORKFLOW_SETUP     : CONST_PERMISSION_WORKFLOW_SETUP,
	CONST_PERMISSION_UNIT_CREATE        : CONST_PERMISSION_UNIT_CREATE,
	CONST_PERMISSION_UNIT_UPDATE        : CONST_PERMISSION_UNIT_UPDATE,
	CONST_PERMISSION_UNIT_DELETE        : CONST_PERMISSION_UNIT_DELETE,
	CONST_PERMISSION_UPDATE_PASSWORD    : CONST_PERMISSION_UPDATE_PASSWORD,
	CONST_PERMISSION_ORDER_CREATE_TERM_CHANGE : CONST_PERMISSION_ORDER_CREATE_TERM_CHANGE,
	CONST_PERMISSION_ORDER_CREATE_TRANSPORTER_CHANGE : CONST_PERMISSION_ORDER_CREATE_TRANSPORTER_CHANGE,
	CONST_PERMISSION_CUSTOMER_TYPE_CHANGE : CONST_PERMISSION_CUSTOMER_TYPE_CHANGE,
	CONST_PERMISSION_PACKING_SLIP_CREATE : CONST_PERMISSION_PACKING_SLIP_CREATE,
	CONST_PERMISSION_PACKING_SLIP_CANCEL : CONST_PERMISSION_PACKING_SLIP_CANCEL,
	CONST_PERMISSION_PACKING_SLIP_VIEW   : CONST_PERMISSION_PACKING_SLIP_VIEW,
	CONST_PERMISSION_PACKING_SLIP_NUMBER_EDIT : CONST_PERMISSION_PACKING_SLIP_NUMBER_EDIT,
	
	CONST_PERMISSION_DELIVERY_NOTE_CREATE : CONST_PERMISSION_DELIVERY_NOTE_CREATE,
	CONST_PERMISSION_DELIVERY_NOTE_UPDATE : CONST_PERMISSION_DELIVERY_NOTE_UPDATE,
	CONST_PERMISSION_DELIVERY_NOTE_CANCEL : CONST_PERMISSION_DELIVERY_NOTE_CANCEL,
	CONST_PERMISSION_DELIVERY_NOTE_NUMBER_EDIT : CONST_PERMISSION_DELIVERY_NOTE_NUMBER_EDIT,
	
	CONST_PERMISSION_DELIVERY_NOTE_VIEW    : CONST_PERMISSION_DELIVERY_NOTE_VIEW,

	CONST_PERMISSION_STOCK_SUMMARY_VIEW    : CONST_PERMISSION_STOCK_SUMMARY_VIEW,

	CONST_PERMISSION_BILL_VIEW             : CONST_PERMISSION_BILL_VIEW,

	CONST_STATUS_PACKING_SLIP_PENDING_DISPATCH : CONST_STATUS_PACKING_SLIP_PENDING_DISPATCH,
	CONST_STATUS_PACKING_SLIP_PENDING_INVOICE : CONST_STATUS_PACKING_SLIP_PENDING_INVOICE,
	CONST_STATUS_PACKING_SLIP_DISPATCHED : CONST_STATUS_PACKING_SLIP_DISPATCHED,
	CONST_STATUS_PACKING_SLIP_COMPLETED : CONST_STATUS_PACKING_SLIP_COMPLETED,
	CONST_STATUS_PACKING_SLIP_CANCELLED : CONST_STATUS_PACKING_SLIP_CANCELLED,

	CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH : CONST_STATUS_DELIVERY_NOTE_PENDING_DISPATCH,
	CONST_STATUS_DELIVERY_NOTE_PENDING_LR  : CONST_STATUS_DELIVERY_NOTE_PENDING_LR,
	CONST_STATUS_DELIVERY_NOTE_DELIVERED : CONST_STATUS_DELIVERY_NOTE_DELIVERED,
	CONST_STATUS_DELIVERY_NOTE_COMPLETED   : CONST_STATUS_DELIVERY_NOTE_COMPLETED,
	CONST_STATUS_DELIVERY_NOTE_CANCELLED   : CONST_STATUS_DELIVERY_NOTE_CANCELLED,

	CONST_STATUS_ORDER_IN_PACKING          : CONST_STATUS_ORDER_IN_PACKING,
	CONST_STATUS_ORDER_DELIVERED           : CONST_STATUS_ORDER_DELIVERED,
	CONST_STATUS_ORDER_PENDING_APPROVAL    : CONST_STATUS_ORDER_PENDING_APPROVAL,
	CONST_STATUS_ORDER_REJECTED            : CONST_STATUS_ORDER_REJECTED,
	CONST_STATUS_ORDER_CANCELLED           : CONST_STATUS_ORDER_CANCELLED,

	CONST_STATUS_DELIVERY_PARTIAL          : CONST_STATUS_DELIVERY_PARTIAL,
	CONST_STATUS_DELIVERY_CANCEL           : CONST_STATUS_DELIVERY_CANCEL,
	CONST_STATUS_DELIVERY_PENDING          : CONST_STATUS_DELIVERY_PENDING,
	CONST_STATUS_DELIVERY_DELIVERED        : CONST_STATUS_DELIVERY_DELIVERED,

	CONST_CONFIG_MODULE_NOTIFICATION_SMS   : CONST_CONFIG_MODULE_NOTIFICATION_SMS,
	CONST_CONFIG_TAX_GST_NUMBER			   : CONST_CONFIG_TAX_GST_NUMBER,

	CONST_CONFIG_MODULE_INTEGRATION_INVOICE : CONST_CONFIG_MODULE_INTEGRATION_INVOICE,
	CONST_CONFIG_MODULE_INTEGRATION_PAYMENT : CONST_CONFIG_MODULE_INTEGRATION_PAYMENT,
	CONST_CONFIG_MODULE_INTEGRATION_PRODUCT : CONST_CONFIG_MODULE_INTEGRATION_PRODUCT,
	CONST_CONFIG_MODULE_INTEGRATION_CUSTOMER :CONST_CONFIG_MODULE_INTEGRATION_CUSTOMER,

	CONST_CONFIG_TAX_AUTO_CALCULATION      : CONST_CONFIG_TAX_AUTO_CALCULATION,
	CONST_ACTIVITY_TYPE_CREATE			   : CONST_ACTIVITY_TYPE_CREATE,
	EventTypeEnum                          : EventTypeEnum,
	LocalEventTypeEnum                     : LocalEventTypeEnum,
	DocumentTypeEnum					   : DocumentTypeEnum,
	SyncStatusEnum                         : SyncStatusEnum,
	SessionTypesEnum					   : SessionTypesEnum,
	NotificationStatusEnum				   : NotificationStatusEnum,
	NotificationTypeEnum				   : NotificationTypeEnum,

	CONST_PERMISSION_GATE_PASS_CREATE	   : CONST_PERMISSION_GATE_PASS_CREATE,
	CONST_PERMISSION_GATE_PASS_UPDATE	   : CONST_PERMISSION_GATE_PASS_UPDATE,
	CONST_PERMISSION_GATE_PASS_CANCEL	   : CONST_PERMISSION_GATE_PASS_CANCEL,
	CONST_PERMISSION_GATE_PASS_VIEW	   	   : CONST_PERMISSION_GATE_PASS_VIEW,
	CONST_PERMISSION_GATE_PASS_EDIT		   : CONST_PERMISSION_GATE_PASS_EDIT,

	CONST_PAYMENT_STATUS_ACTIVE	           : CONST_PAYMENT_STATUS_ACTIVE,   
    CONST_PAYMENT_STATUS_PAID      		   : CONST_PAYMENT_STATUS_PAID,            
    CONST_PAYMENT_STATUS_PARTIALLY_PAID    : CONST_PAYMENT_STATUS_PARTIALLY_PAID,       
    CONST_PAYMENT_STATUS_DELETE 		   : CONST_PAYMENT_STATUS_DELETE,

	CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD : CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD,
	CONST_CONFIG_COMPANY_CATEGORY_CODE_REQD : CONST_CONFIG_COMPANY_CATEGORY_CODE_REQD,
	CONST_CONFIG_COMPANY_AGENT_CODE_REQD : CONST_CONFIG_COMPANY_AGENT_CODE_REQD,
	CONST_CONFIG_COMPANY_PRODUCT_CODE_REQD : CONST_CONFIG_COMPANY_PRODUCT_CODE_REQD,

	CONST_DEFAULT_PAYMENT_TERM : CONST_DEFAULT_PAYMENT_TERM,

	UploadTypeEnum						   : UploadTypeEnum,
	mapPartnerNotificationStatus		   : mapPartnerNotificationStatus
};
