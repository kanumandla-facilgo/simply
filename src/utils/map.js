var Session       = require("../bo/session");
var User          = require("../bo/user");
var Customer      = require("../bo/customer");
var Notification = require("../bo/notification");
var CustomerNotification = require("../bo/customer_notification");
var Agent         = require("../bo/agent");
var Company       = require("../bo/company");
var Product       = require("../bo/product");
var Category      = require("../bo/category");
var Address       = require("../bo/address");
var Role          = require("../bo/role");
var Permission    = require("../bo/permission");
var Configuration = require("../bo/configuration");
var Quantity      = require("../bo/quantity");
var Transporter   = require("../bo/transporter");
var Dimension     = require("../bo/dimension");
var PaymentTerm   = require("../bo/payment_term");
var CompanyType   = require("../bo/company_type");
var PriceList     = require("../bo/pricelist");
var UOM           = require("../bo/uom");
var UOMConversion = require("../bo/uom_conversion");
var PriceGroup    = require("../bo/price_group");
var Order	   	  = require("../bo/order");
var OrderDetail	  = require("../bo/order_detail");
var PackingSlip   = require("../bo/packing_slip");
var PackingSlipDetail = require("../bo/packing_slip_detail");
var StockBucket   = require("../bo/stock_bucket");
var StockJournal  = require("../bo/stock_journal");
var StockBucketDetail = require("../bo/stock_bucket_detail");
var DashboardSectionItem   = require("../bo/dashboard_section_item");
var DashboardSection       = require("../bo/dashboard_section");
var Dashboard     = require("../bo/dashboard");
// var TaxSlab       = require("../bo/tax_slab");
var DeliveryNote     = require("../bo/delivery_note");
var DeliveryNoteDetail     = require("../bo/delivery_note_detail");
var GatePass     = require("../bo/gate_pass");
var GatePassDetail     = require("../bo/gate_pass_detail");
var Config         = require("../config/config");
var Hsn       = require("../bo/hsn");
var Bill      = require("../bo/bill");
var CustomFilter = require("../bo/custom_filter");
var Upload = require("../bo/upload");
var Tempo   = require("../bo/tempo");

function mapToBSession(dRow) {
	
	var session              = initSession();
	
	session.id               = dRow.sessionid;
	session.company_id       = (dRow.parent_id ? dRow.parent_id : dRow.companies_id);
	session.user             = mapToBUser(dRow);
	session.last_auth_at     = dRow.last_auth_at;
	session.sessiontype		 = dRow.sessiontype;
	session.company = {};
	session.company.template_id = dRow.syssubscriptiontemplates_id; 
	session.company.name = dRow.company_name;
	session.company.invoicing_name = dRow.company_tax_name;

	return session;

}

function mapToBHsn(dRow, id, name, code, short_code, description) {

	var hsn            = initHsn();

	hsn.id             = (id ? dRow[id] : dRow.id);
	hsn.name           = (name ? dRow[name] : dRow.name);
	hsn.code           = (code ? dRow[code] : dRow.code);
	hsn.short_code     = (short_code ? dRow[short_code] : dRow.short_code);
	hsn.description    = (description ? dRow[description] : dRow.description);
	hsn.percent_gst    = dRow.tax_percent_gst;
	hsn.percent_cess   = dRow.tax_percent_cess
	hsn.percent_igst   = dRow.tax_percent_igst;
	hsn.percent_cgst   = dRow.tax_percent_cgst;
	hsn.percent_sgst   = dRow.tax_percent_sgst;

	return hsn;

}

function mapToBBill(dRow) {

	var bill             = initBill();

	bill.id              = dRow.id;
	bill.bill_number     = dRow.bill_number;
	bill.bill_ref_number = dRow.bill_ref_number;
	bill.bill_date       = dRow.bill_date;
	bill.due_date        = dRow.due_date;
	bill.balance_amount  = dRow.balance_amount;
	bill.bill_amount  	 = dRow.bill_amount;
	bill.paid_amount	 = dRow.paid_amount;
	bill.paid_date   	 = dRow.approx_paid_date;
	bill.next_reminder_date = dRow.next_reminder_date;
	bill.status_id 		 = dRow.syspaymentstatuses_id;
	bill.status_name     = dRow.status_name;

	bill.customer        = {};
    bill.customer.id     = dRow.customer_id;
    bill.customer.name   = dRow.customer_name;
    bill.customer.code   = dRow.customer_code;
    bill.customer.address = initAddress();
    bill.customer.address.phone1 = dRow.customer_phone;
    bill.customer.address.email1 = dRow.customer_email;

	return bill;

}

function mapToBUser(dRow) {

	var user           = initUser();

	user.id            = dRow.id;
	user.first_name    = dRow.first_name;
	user.last_name     = dRow.last_name;
	user.middle_name   = dRow.middle_name;
	user.company_id    = dRow.companies_id;
	user.login_name    = dRow.login_name;
	user.address_id    = dRow.addresses_id;
	user.password      = "";
	user.role_id       = dRow.roles_id;
	user.status_id     = dRow.statuses_id;
	user.sys_role_id   = dRow.sysroles_id;
	user.role_name     = dRow.rolename;
	user.address       = mapToBAddress(dRow);

/*	another way
	var user = 
			{
				id           : dUser._id,
				first_name   : dUser.first_name,
				last_name    : dUser.last_name,
				email        : dUser.email,
				gender       : dUser.gender,
				company_id   : dUser.companies_id,
				password     : "",
				user_type_id : dUser.user_type_id
			};
*/

	return user;
}

function mapToBShare(dRow) {

	var share = {};

	share.id = dRow.id;
	share.document_id = dRow.document_id;
	share.sysdocumenttypes_id = dRow.sysdocumenttypes_id;
	share.companies_id = dRow.companies_id;
	share.company_id = dRow.companyid;
	share.users_id = dRow.users_id;
	share.name = dRow.name;
	share.phone_number = dRow.phone_number;
	share.expired_at= dRow.expired_at;
	share.salt = dRow.salt;
	share.access_code = dRow.access_code;

	return share;
}

function mapToBNotification(dRow) {

	var notification = initNotification();

	notification.id = dRow.id;
	notification.companyid = dRow.companies_id;
	notification.format_id = dRow.sysnotificationformats_id;
	notification.format_name = dRow.format_name;
	notification.type_id = dRow.sysnotificationtypes_id;
	notification.type_name = dRow.type_name;
	notification.status_id = dRow.sysnotificationstatuses_id;
	notification.status_name = dRow.status_name;
	notification.documentid = dRow.document_id;
	notification.destination = dRow.destination;
	notification.created = dRow.created;
	
	notification.customer = {};
    notification.customer.id = dRow.customer_id;
	notification.customer.name = dRow.customer_name;

	return notification;
}

function mapToBCustomerNotification(dRow) {

	var notification = initCustomerNotification();
	notification.id = dRow.id;
	notification.companyid = dRow.companies_id;
	notification.customerid = dRow.customers_id;
	notification.notification_type_id = dRow.sysnotificationtypes_id;
	notification.active = dRow.active;
	notification.phone_number = dRow.phone_number;
	notification.emails = dRow.emails;
	return notification;
}

function mapToBCustomer(dCustomer, session) {

	var customer             = initCustomer();
	customer.id              = dCustomer.id;
	customer.code            = dCustomer.code;
	customer.name            = dCustomer.name;
	customer.invoicing_name  = dCustomer.invoicing_name;
	customer.sync_status_id  = dCustomer.syssyncstatuses_id;
	customer.tin             = dCustomer.tin;
	customer.vat_number      = dCustomer.vat_number;
	customer.cst_number      = dCustomer.cst_number;
	customer.pan_number      = dCustomer.pan_number;
	customer.gst_number      = dCustomer.gst_number;
	customer.gst_registration_type = dCustomer.gst_registration_type;
	customer.excise_number   = dCustomer.excise_number;
	customer.taxform_flag    = dCustomer.taxform_flag;
	customer.custom_type_id  = dCustomer.companytypes_id;
	customer.custom_type_name= dCustomer.typename;
	customer.status_id       = dCustomer.sysstatuses_id;
	customer.allowed_balance = dCustomer.allowed_balance;
	customer.current_balance = dCustomer.current_balance;
	customer.current_overdue = dCustomer.current_overdue;
	customer.current_balance_sync_date = dCustomer.current_balance_sync_date;
	customer.current_overdue_sync_date = dCustomer.current_overdue_sync_date;
	customer.notes           = dCustomer.notes;
	customer.company_id 	 = dCustomer.parent_id;
	customer.address         = mapToBAddress(dCustomer, "home_");
	customer.ship_address    = mapToBAddress(dCustomer, "ship_");
	customer.bill_address    = mapToBAddress(dCustomer, "bill_");
	customer.transporter     = mapToBTransporter(dCustomer, true, "transporter_id", "transporter_code", "transporter_name", "transporter_statusid", "transporter_external_code");
	customer.payment_term    = mapToBPaymentTerm(dCustomer, "term_id", "term_code", "term_description", "term_statusid", "term_days");
	customer.sales_person    = mapToBSalesPerson(dCustomer);
	customer.agent           = (dCustomer.agent_id != null) ?mapToBAgent(dCustomer, "agent_", session) : initAgent();
	
	customer.user 			  = {};
	customer.user.id 		  = dCustomer.user_id;
	customer.user.first_name = dCustomer.user_first_name;
	customer.user.last_name  = dCustomer.user_last_name;
	customer.user.login_name = dCustomer.user_login_name;
	

/*	another way
	var user = 
			{
				id           : dUser._id,
				first_name   : dUser.first_name,
				last_name    : dUser.last_name,
				email        : dUser.email,
				gender       : dUser.gender,
				company_id   : dUser.companies_id,
				password     : "",
				user_type_id : dUser.user_type_id
			};
*/

	return customer;
}

function mapToBAgent(dAgent, prefix, session) {
	var agent             = initAgent();
	agent.id              = (dAgent[prefix + 'id'] ? dAgent[prefix + 'id'] : dAgent.id);
	agent.code            = (dAgent[prefix + 'code'] ? dAgent[prefix + 'code'] : dAgent.code);
	agent.name            = (dAgent[prefix + 'name'] ? dAgent[prefix + 'name'] : dAgent.name);
	agent.accounting_name = (dAgent[prefix + 'invoicing_name'] ? dAgent[prefix + 'invoicing_name'] : dAgent.invoicing_name);
	agent.status_id       = (dAgent[prefix + 'status_id'] ? dAgent[prefix + 'status_id'] : dAgent.sysstatuses_id);
	agent.sales_person    = mapToBSalesPerson(dAgent);
	agent.commission_rate = (dAgent[prefix + 'commission_rate'] ? dAgent[prefix + 'commission_rate'] : dAgent.commission_rate);
	agent.sync_status_id  = dAgent.syssyncstatuses_id;
	agent.address         = mapToBAddress(dAgent, "home_");

	if(prefix == "")
	{
		agent.user 			  = {};
		agent.user.id 		  = (dAgent[prefix + 'user_id'] ? dAgent[prefix + 'user_id'] : dAgent.user_id);
		agent.user.first_name = (dAgent[prefix + 'user_first_name'] ? dAgent[prefix + 'user_first_name'] : dAgent.user_first_name);
		agent.user.last_name  = (dAgent[prefix + 'user_last_name'] ? dAgent[prefix + 'user_last_name'] : dAgent.user_last_name);
		agent.user.login_name = (dAgent[prefix + 'user_login_name'] ? dAgent[prefix + 'user_login_name'] : dAgent.user_login_name);
	}

	var user = session.user;
	if (!(user.sys_role_id == 4002 || user.sys_role_id == 4003 || user.sys_role_id == 4004 || user.sys_role_id == 4005)) {
		agent.commission_rate = 0.00;
		return agent;
	}

	// agent.id              = dAgent.id;
	// agent.code            = dAgent.code;
	// agent.name            = dAgent.name;
	// agent.status_id       = dAgent.sysstatuses_id;
	agent.custom_type_id  = dAgent.companytypes_id;
	agent.allowed_balance = dAgent.allowed_balance;
	agent.current_balance = dAgent.current_balance;
	agent.current_overdue = dAgent.current_overdue;
	agent.pan_number      = dAgent.pan_number;	
	agent.notes           = dAgent.notes;
  	return agent;

}

function mapToBSalesPerson(row) {

	var user         = initUser();
	user.id          = row.salesperson_id;
	user.first_name  = row.first_name;
	user.last_name   = row.last_name;
	user.login_name  = row.login_name;
	user.status_id   = row.salesperson_statusid;
	return user;

}
/*
function mapToBAgent(row) {
	var customer       = initCustomer();
	customer.id        = row.agent_id;
	customer.name      = row.agent_name;
	customer.status_id = row.agent_statusid;
	customer.commission_rate = row.commission_rate;
	customer.more.commission_rate_bonus = row.commission_rate_bonus;
	return customer;
}
*/
function mapToBCompany(row) {

	var company            = initCompany();
	company.id             = row.companyid;
	company.name           = row.name;
	company.code           = row.code;
	company.description    = row.description;
	company.tin            = row.tin;
	company.vat_number     = row.vat_number;
	company.cst_number     = row.cst_number;
	company.pan_number     = row.pan_number;
	company.excise_number  = row.excise_number;
	company.custom_type_id = row.companytypes_id;
	company.status_id      = row.sysstatuses_id;
	company.system_type_id = row.syscompanytypes_id;
	company.subscription_template_id = row.syssubscriptiontemplates_id;
	company.created        = row.created;
	company.address        = mapToBAddress(row);
	company.ship_address   = mapToBAddress(row, "ship_");
	company.bill_address   = mapToBAddress(row, "bill_");
	
	return company;
}

function mapToBAddress_working(row) {

	var address            = initAddress();
	address.id             = (row.addressid ? row.addressid : "");
	address.address1       = row.address1;
	address.address2       = row.address2;
	address.address3       = row.address3;
	address.city           = row.city;
	address.state          = row.state;
	address.zip            = row.pin;
	address.phone1         = row.phone1;
	address.phone2         = row.phone2;
	address.email1         = row.email1;
	address.email2         = row.email2;

	return address;

}

function mapToBAddress(row, prefix) {

	if (!prefix) prefix = "";

	var address            = initAddress();
	address.id             = (row[prefix + 'addressid'] ? row[prefix + 'addressid'] : "");
	address.name           = row[prefix + 'name'];
	address.first_name     = row[prefix + 'first_name'];
	address.last_name      = row[prefix + 'last_name'];
	address.address1       = row[prefix + 'address1'];
	address.address2       = row[prefix + 'address2'];
	address.address3       = row[prefix + 'address3'];
	address.city           = row[prefix + 'city'];
	address.state          = row[prefix + 'state'];
	address.zip            = row[prefix + 'pin'];
	address.phone1         = row[prefix + 'phone1'];
	address.phone2         = row[prefix + 'phone2'];
	address.email1         = row[prefix + 'email1'];
	address.email2         = row[prefix + 'email2'];

	return address;

}

function getImgeURLPrefix() {
	return (Config.web.image_server_url + Config.web.image_server_root);
}

function getFullImagePath(imageURL, subprefix) {
	
	return imageURL.replace("upload/small/","upload/" + subprefix);
}

function mapToBProduct(dProduct) {

	var product         	= initProduct();

	product.id          	= dProduct.id;
	product.name        	= dProduct.name;
	product.accounting_key  = dProduct.accounting_key;
	product.image_url1   	= dProduct.image_url1;
	product.image_url2      = dProduct.image_url2;
	product.image_url3      = dProduct.image_url3;
	product.sku         	= dProduct.sku;
	product.sku_internal    = dProduct.sku_internal;
	product.description 	= dProduct.description;
//	product.description_long= dProduct.description_long;
//	product.like_count  	= dProduct.like_count;
	product.company_id  	= dProduct.companies_id;
	product.category_id 	= dProduct.categories_id;
	product.unit_price      = dProduct.unit_price;
	product.uom_id          = dProduct.unit_of_measures_id;
	product.uom_name        = dProduct.uom_name;
	product.uom_short_name  = dProduct.uom_short_name;
	product.uom_description = dProduct.uom_description;
	product.is_family_head  = (dProduct.is_family == 1 ? true : false);
	product.color           = dProduct.color;
	product.is_enabled      = (dProduct.statuses_id == 4600);
	product.status_id       = dProduct.statuses_id;
	product.sync_status_id  = dProduct.syssyncstatuses_id;
	product.created     	= dProduct.created;
	product.price_level_id  = dProduct.syspricelevels_id;

	product.pricegroup.id   = dProduct.price_groups_id;
	product.pricegroup.name = dProduct.price_groups_name;

	product.family_size     = dProduct.family_size;
	product.product_type_id = dProduct.sysproducttypes_id;
	
	product.category_count  = dProduct.category_count;

	product.dimension       = mapToBDimension(dProduct);
	product.quantity        = mapToBQuantity(dProduct);
	
	product.is_taxable      = dProduct.is_taxable;
	product.is_qty_uom_restricted = dProduct.is_qty_uom_restricted;
	product.is_quote_uom_restricted = dProduct.is_quote_uom_restricted;
	product.is_hidden_no_stock = dProduct.is_hidden_no_stock;
	product.default_qty_uom  = initUOM();
	product.default_qty_uom.id = dProduct.default_qty_uom_id;

	product.stock_uom_qty      = initUOM();
	product.stock_uom_qty.id   = dProduct.stock_uom_qty;
	product.stock_uom_qty.name = dProduct.stock_uom_qty_name;
	product.stock_uom_qty.short_name = dProduct.stock_uom_qty_short_name;

	product.stock_uom_quote    = initUOM();
	product.stock_uom_quote.id = dProduct.stock_uom_quote;
	product.stock_uom_quote.name = dProduct.stock_uom_quote_name;
	product.stock_uom_quote.short_name = dProduct.stock_uom_quote_short_name;
	
	if (dProduct.stock_uom_batch != undefined) {
		product.stock_uom_batch    = initUOM();
		product.stock_uom_batch.id = dProduct.stock_uom_batch;
		product.stock_uom_batch.name = dProduct.stock_uom_batch_name;
		product.stock_uom_batch.short_name = dProduct.stock_uom_batch_short_name;

		product.stock_batch_pcs = dProduct.stock_batch_pcs;
	}

	product.is_batched_inventory = dProduct.is_batched_inventory;
	product.default_sell_qty     = dProduct.default_sell_qty;
	product.cost                 = dProduct.cost;

	// product.tax_slab           = mapToBTaxSlab(dProduct, "tax_slab_id", "tax_slab_name");
	product.hsn                = mapToBHsn(dProduct, "hsn_id", "hsn_name", "hsn_code", "hsn_short_code", "hsn_description");
	product.sync_status_id     = dProduct.syssyncstatuses_id;

	return product;

}

function mapToBStockBucket(dRow) {

	var stockbucket = initStockBucket();

	stockbucket.id            = dRow.id;
	stockbucket.description   = dRow.description;
	stockbucket.code          = dRow.code;
	stockbucket.is_system     = dRow.is_system;
	stockbucket.status_id     = dRow.sysstatuses_id;
	stockbucket.product_id    = dRow.products_id;
	
	stockbucket.uom_qty.id    = dRow.stock_uom_qty;
	stockbucket.uom_qty.name  = dRow.stock_uom_qty_name;
	stockbucket.uom_qty.short_name = dRow.stock_uom_qty_short_name;

	stockbucket.uom_quote.id   = dRow.stock_uom_quote;
	stockbucket.uom_quote.name = dRow.stock_uom_quote_name;
	stockbucket.uom_quote.short_name = dRow.stock_uom_quote_short_name;
	
	stockbucket.stock_qty      = dRow.quantity_entered;
	stockbucket.stock_quote    = dRow.quantity_ordered;

	stockbucket.stock_quote_string = dRow.stock_quote_string;

	return stockbucket;

}

function mapToBStockBucketDetail(dRow) {

	var stockbucketdetail         = initStockBucketDetail();

	stockbucketdetail.id          = dRow.id;
	stockbucketdetail.description = dRow.description;
	stockbucketdetail.piece_count = dRow.piece_count;
	stockbucketdetail.index       = dRow.sequence_number;
	stockbucketdetail.qty         = dRow.quantity;
	stockbucketdetail.uom.id      = dRow.unit_of_measures_id;
	stockbucketdetail.uom.name    = dRow.uom_name;
	stockbucketdetail.uom.short_name = dRow.uom_short_name;

	return stockbucketdetail;

}

function mapToBStockJournal(dRow) {

	var stockjournal = initStockJournal();
	stockjournal.id                 = dRow.id;
	stockjournal.description        = dRow.description;
	stockjournal.stock_bucket_code  = dRow.stock_bucket_code;
	stockjournal.transaction_date   = dRow.transaction_date;

	stockjournal.product_id         = dRow.products_id;
	stockjournal.order_id           = dRow.orders_id;
	stockjournal.order_number       = dRow.order_number;
	stockjournal.packing_slip_id    = dRow.packing_slips_id;
	stockjournal.packing_slip_number = dRow.packing_slip_number;
	stockjournal.delivery_note_id   = dRow.delivery_note_id;
	stockjournal.invoice_number 	= dRow.invoice_number;

	stockjournal.uom_qty.id         = dRow.stock_uom_qty;
	stockjournal.uom_qty.name       = dRow.stock_uom_qty_name;
	stockjournal.uom_qty.short_name = dRow.stock_uom_qty_short_name;

	stockjournal.uom_quote.id       = dRow.stock_uom_quote;
	stockjournal.uom_quote.name     = dRow.stock_uom_quote_name;
	stockjournal.uom_quote.short_name = dRow.stock_uom_quote_short_name;

	stockjournal.stock_qty          = Number.parseFloat(dRow.quantity_entered).toFixed(2);
	stockjournal.stock_quote        = Number.parseFloat(dRow.quantity_ordered).toFixed(2);

	stockjournal.user.first_name    = dRow.first_name;
	stockjournal.user.last_name     = dRow.last_name;
	stockjournal.user.login_name    = dRow.login_name;

	stockjournal.customer.name 		= dRow.name;


	return stockjournal;

}

function mapToBPriceList(dRow) {

	var pricelist              = initPriceList();

	pricelist.group_id         = dRow.price_groups_id;
	pricelist.product_id       = dRow.products_id;
	pricelist.unit_price       = dRow.unit_price;
	pricelist.uom_id           = dRow.unit_of_measures_id;
	pricelist.customer_type_id = dRow.company_types_id;
	pricelist.qty_from         = dRow.qty_from;
	pricelist.qty_to           = dRow.qty_to;

	return pricelist;

}

function mapToBTaxSlab(row, id, name) {

	var taxslab         = initTaxSlab();
	taxslab.id          = (id ? row[id] : row.id);
	taxslab.name        = (name ? row[name] : row.name);
	taxslab.percent     = row.percent;
	taxslab.alt_percent = row.alt_percent;
	taxslab.is_default  = row.is_default;
	return taxslab;

}

function mapToBUOMConversion(dRow) {

	var uomConversion          = initUOMConversion();

//	uomConversion.group_id     = dRow.price_groups_id;
	uomConversion.uom_id       = dRow.unit_of_measures_id;
	uomConversion.product_id   = dRow.products_id;
	uomConversion.from_uom     = initUOM();
	uomConversion.to_uom       = initUOM();
	uomConversion.from_uom.id  = dRow.from_uom_id;
	uomConversion.to_uom.id    = dRow.to_uom_id;
	uomConversion.from_uom.name = dRow.from_uom_name;
	uomConversion.from_uom.short_name = dRow.from_uom_short_name;
	uomConversion.to_uom.name  = dRow.to_uom_name;
	uomConversion.to_uom.short_name = dRow.to_uom_short_name;

	uomConversion.from_qty     = dRow.from_qty;
	uomConversion.to_qty       = dRow.to_qty;
	uomConversion.is_batched_inventory = dRow.is_batched_inventory;

	return uomConversion;

}

function mapToBDimension(dProduct) {

	var dimension           = initDimension();

	dimension.width         = dProduct.width;
	dimension.length        = dProduct.length;
	dimension.height        = dProduct.height;
	dimension.weight        = dProduct.weight;
	
	return dimension;
}

function mapToBQuantity(dProduct) {

	var quantity           = initQuantity();

	quantity.stock_qty     = dProduct.stock_qty; //uom where qty is entered
	quantity.stock_quote   = dProduct.stock_quote; //uom where quote is entered and order is being created
	quantity.onorder       = dProduct.onorder;
	quantity.reorder       = dProduct.reorder;
	quantity.packageqty    = dProduct.packageqty;

	quantity.stock_in_process_quote = dProduct.stock_in_process_quote;
	quantity.stock_in_process_qty = dProduct.stock_in_process_qty;

	return quantity;
}
/*
function mapToDProduct(xProduct) {

	var product         	= initProduct();
	product.id          	= dProduct.id;
	product.code        	= dProduct.code;
	product.name        	= dProduct.name;
	product.image_url   	= dProduct.image_url;
	product.sku         	= dProduct.sku;
	product.description 	= dProduct.description;
	product.description_long= dProduct.description_long;
	product.like_count  	= dProduct.like_count;
	product.company_id  	= dProduct.companies_id;
	product.category_id 	= dProduct.categories_id;
	product.unit_price      = dProduct.unit_price;
	product.created     	= dProduct.created;
	
	return product;
}
*/
function mapToBCategory(dCategory) {

	var category             = initCategory();
	category.id              = dCategory.id;
	category.code            = dCategory.code;
	category.name            = dCategory.name;
	category.accounting_key  = dCategory.accounting_key;
	category.children_count  = dCategory.children_count;
	category.is_leaf         = dCategory.is_leaf;
//	category.is_enabled      = dCategory.is_enabled;
	category.is_hidden       = dCategory.is_hidden;
	category.parent_id       = dCategory.parent_id;
	category.is_root         = dCategory.is_root;
	category.company_id      = dCategory.companies_id;
	category.image_url       = dCategory.image_url;
	category.image_url_large = dCategory.image_url_large;
	category.lineage         = dCategory.lineage;
	category.lineagename     = dCategory.lineage_name;
	category.created         = dCategory.created;
	
	return category;
}

function mapToBRole(row) {

	var role            = initRole();
	role.id             = row.id;
	role.name           = row.name;
	role.description    = row.description;
	role.sys_role_id    = row.sysroles_id;
	role.company_id     = row.companies_id;

	return role;

}

function mapToBTransporter(row, noaddressflag, id, code, name, statusid, external_code) {

	var transporter            = initTransporter();
	transporter.id             = (id ? row[id] : row.id);
	transporter.name           = (name ? row[name] : row.name);
	transporter.code           = (code ? row[code] : row.code);
	transporter.company_id     = row.companies_id;
	transporter.status_id      = (statusid ? row[statusid] : row.sysstatuses_id);
	transporter.external_code  = (external_code ? row[external_code] : row.external_code);
	
	if (!noaddressflag)
	transporter.address        = mapToBAddress(row);

	return transporter;

}

function mapToBPaymentTerm(row, id, code, description, statusid, days) {

	var paymentterm            = initPaymentTerm();

	paymentterm.id             = (id ? row[id] : row.id);
	paymentterm.description    = (description ? row[description] : row.description);
	paymentterm.code           = (code ? row[code] : row.code);
	paymentterm.company_id     = row.companies_id;
	paymentterm.status_id      = (statusid ? row[statusid] : row.sysstatuses_id);
	paymentterm.days           = (days ? row[days] : row.days);

	return paymentterm;

}

function mapToBTempo(row, id, company_name, driver_name, vehicle_number) {

	var tempo = initTempo();

	tempo.id = (id ? row[id] : row.id);
	tempo.name = (company_name ? row[company_name] : row.company_name);
	tempo.driver_name = (driver_name ? row[driver_name] : row.driver_name);
	tempo.company_id = row.companies_id;
	tempo.vehicle_number = (vehicle_number ? row[vehicle_number] : row.vehicle_number);

	return tempo;

}

function mapToBCompanyType(row) {

	var companytype            = initCompanyType();

	companytype.id             = row.id;
	companytype.name           = row.name;
	companytype.description    = row.description;
	companytype.balance_limit  = row.balance_limit;
	companytype.master_id      = row.master_id;
	companytype.is_default     = row.is_default;
	companytype.company_id     = row.companies_id;

	return companytype;

}

function mapToBCustomFilter(row) {

	var customfilter           = initCustomFilter();

	customfilter.id = row.id;
	customfilter.users_id = row.users_id;
	customfilter.companies_id = row.companies_id;
	customfilter.name = row.name;
	customfilter.filters = row.filters;
	customfilter.document_type = row.sysdocumenttypes_id;
	customfilter.is_user_defined = row.is_user_defined;
	customfilter.show_in_dashboard = row.show_in_dashboard;

	return customfilter;

}

function mapToBPriceGroup(row) {

	var pricegroup             = initPriceGroup();

	pricegroup.id              = row.id;
	pricegroup.name            = row.name;
	pricegroup.description     = row.description;
	pricegroup.company_id      = row.companies_id;
	pricegroup.unit_price      = row.unit_price;
	pricegroup.uom_id          = row.unit_of_measures_id;
	pricegroup.uom_name	       = row.uom_name;

	return pricegroup;

}

function mapToBConfiguration(dConfiguration) {

	var configuration          = initConfiguration();

	configuration.id           = dConfiguration.id;
	configuration.code         = dConfiguration.code;
	configuration.value        = dConfiguration.value;
	configuration.name         = dConfiguration.name;
	configuration.description  = dConfiguration.description;

	return configuration;
}

function mapToBPermission(dPermission) {
	
	var permission             = initPermission();
	
	permission.id              = dPermission.id;
	permission.name            = dPermission.name;
	permission.value           = dPermission.value;
	permission.description     = dPermission.description;
//	permission.role_id         = dPermission.roles_id;
	permission.group_id        = dPermission.syspermissiongroups_id;
	permission.group_name      = dPermission.group_name;
	permission.default_value   = dPermission.user_default_value;

	return permission;
}

function mapToBUnitOfMeasure(dRow) {

	var uom                    = initUOM();
	uom.id                     = dRow.id;
	uom.name                   = dRow.name;
	uom.short_name             = dRow.short_name;
	uom.description            = dRow.description;
	uom.base_id                = dRow.base_id;
	uom.conversion_factor      = dRow.conversion_factor;
	uom.display_flag           = dRow.display_flag;
	uom.is_system              = dRow.is_system;
	uom.master_id              = dRow.master_id;
	uom.end_uom_id             = dRow.end_uom_id || "";
	uom.company_id             = dRow.companies_id;
	
	return uom;
}

function mapToBOrder(dRow) {

	var order                    	= initOrder();
	order.id 						= dRow.id;
	order.customers_id 				= dRow.customers_id;
	order.customer_name				= dRow.customer_name;
	order.customer                  = initCustomer();
	order.customer.id               = dRow.customers_id;
	order.customer.name             = dRow.customer_name;

	order.customer.notifications    = [];
	let notification = initCustomerNotification();
	notification.customerid           = dRow.customers_id;
	notification.notification_type_id  = 5802;
	order.customer.notifications.push(notification);

	notification.active			    = dRow.is_notification_on;
	order.companies_id 				= dRow.companies_id;
	order.order_date 				= dRow.order_date;
	order.sub_total 				= dRow.sub_total;
	order.ship_total 				= dRow.ship_total;
	order.tax_total 				= dRow.tax_total;
	order.discount_total 			= dRow.discount_total;
	order.discount_perc             = (dRow.discount_total / dRow.sub_total).toFixed(2) * 100;
	order.grand_total               = order.sub_total + order.ship_total + order.tax_total - order.discount_total;
	order.sysorderstatuses_id 		= dRow.sysorderstatuses_id;
	order.sysworkflowstatuses_id 	= dRow.sysworkflowstatuses_id;
	order.orderusers_id 			= dRow.orderusers_id;
	order.ship_addresses_id 		= dRow.ship_addresses_id;
	order.bill_addresses_id 		= dRow.bill_addresses_id;
	order.approverusers_id 			= dRow.approverusers_id;
	order.syssyncstatus_id 			= dRow.syssyncstatus_id;
	order.order_number 				= dRow.order_number;
	order.customer_order_number 	= dRow.customer_order_number;
	order.payment_terms_id 			= dRow.payment_terms_id;
	order.payment_term_name         = dRow.payment_term_name;
	order.payment_due_date 			= dRow.payment_due_date;
	order.paid_total 				= dRow.paid_total;
	order.salespersons_id 			= dRow.salespersons_id;
	order.item_count 				= dRow.item_count;
	order.created 					= dRow.created;
	order.last_updated 				= dRow.last_updated;
	order.pending_approval_rolesid  = dRow.pending_approval_rolesid;
	order.pending_approval_rolename	= dRow.pending_approval_rolename;
	order.transporters_id			= dRow.transporters_id;
	order.status_name			    = dRow.order_status_name;
	order.creator					= dRow.creator;
	order.approver					= dRow.approver;
	order.notes						= dRow.notes;
	order.internal_notes						= dRow.internal_notes;
	order.agent_notes						= dRow.agent_notes;
	order.workflow_reason_string    = dRow.workflow_reason_string;

	order.delivery_status_id        = dRow.sysdeliverystatuses_id;
	order.delivery_status_name      = dRow.delivery_status_name;

	order.lineitems					= [];
	return order;
}

function mapToBOrderDetail(dRow) {

	var orderdetail                    	= initOrderDetail();
	orderdetail.id 						= dRow.id;
	orderdetail.orders_id				= dRow.orders_id;
	orderdetail.products_id				= dRow.products_id;
	orderdetail.sku                     = dRow.sku;
	orderdetail.name					= dRow.name;
	orderdetail.order_quantity			= dRow.order_quantity;
	orderdetail.unit_price				= dRow.unit_price;
	orderdetail.order_price 			= dRow.order_price;
	orderdetail.unit_of_measures_id 	= dRow.unit_of_measures_id;
	orderdetail.tax						= dRow.tax;
	orderdetail.tax_percent             = dRow.tax*100/(dRow.extension - dRow.discount);
	orderdetail.is_taxable              = (dRow.tax > 0 ? 1: 0);
	orderdetail.shipping				= dRow.shipping;
	orderdetail.discount				= dRow.discount;
	orderdetail.extension				= dRow.extension;
	orderdetail.created					= dRow.created;
	orderdetail.last_updated			= dRow.last_updated;
	orderdetail.entered_quantity		= dRow.entered_quantity;
	orderdetail.entered_unit_of_measures_id=dRow.entered_unit_of_measures_id;
	orderdetail.qty_unit_multiplier     = orderdetail.order_quantity / orderdetail.entered_quantity;

	orderdetail.product_image_url       = dRow.image_url1;

	orderdetail.notes					= dRow.notes;
	orderdetail.uom_name				= dRow.uom_name;
	orderdetail.uom_short_name          = dRow.uom_short_name;
	orderdetail.entered_uom_name		= dRow.entered_uom_name;
	orderdetail.entered_uom_short_name  = dRow.entered_uom_short_name;
	orderdetail.packed_qty_qty          = dRow.quantity_entered_packed;
	orderdetail.packed_qty_quote        = dRow.quantity_ordered_packed;
	orderdetail.is_batched_inventory    = dRow.is_batched_inventory;
	orderdetail.is_complete             = dRow.is_complete;
	
	orderdetail.stock_unit_of_measures_id = dRow.stock_unit_of_measures_id;
	orderdetail.stock_alt_unit_of_measures_id = dRow.stock_alt_unit_of_measures_id;
	orderdetail.stock_alt_uom_name      = dRow.stock_alt_uom_name;
	orderdetail.stock_alt_uom_short_name = dRow.stock_alt_uom_short_name;
	orderdetail.stock_uom_name          = dRow.stock_uom_name;
	orderdetail.stock_uom_short_name    = dRow.stock_uom_short_name;
	orderdetail.stock_quantity          = dRow.stock_quantity;
	orderdetail.stock_quantity_packed   = dRow.stock_quantity_packed;
	orderdetail.stock_alt_quantity      = dRow.stock_alt_quantity;
	orderdetail.stock_alt_quantity_packed = dRow.stock_alt_quantity_packed;
	
	//orderdetail.tax_slab               = mapToBTaxSlab(dRow, "tax_slab_id", "tax_slab_name"); 
	orderdetail.hsn               = mapToBHsn(dRow, "hsn_id", "hsn_name", "hsn_code", "hsn_short_code", "hsn_description"); 

	return orderdetail;
}

function mapToBPackingSlip(dRow) {

	var packingslip                 = initPackingSlip();
	
	packingslip.id					= dRow.id;
	packingslip.slip_number         = dRow.packing_slip_number;
	packingslip.packing_date        = dRow.packing_date;
	packingslip.customer_id         = dRow.customers_id;
	packingslip.customer_name       = dRow.customer_name;
	packingslip.order_id			= dRow.orders_id;
	packingslip.user_id			    = dRow.users_id;
	packingslip.user_name           = dRow.creator;
	packingslip.net_weight          = dRow.net_weight;
	packingslip.gross_weight        = dRow.gross_weight;
	packingslip.tax_total           = dRow.tax_total;
	packingslip.discount_total      = dRow.discount_total;
	packingslip.ship_total          = dRow.ship_total;
	packingslip.sub_total           = dRow.sub_total;
	packingslip.invoice_id          = dRow.invoices_id;
	packingslip.status_id           = dRow.syspackingslipstatuses_id;
	packingslip.status_name         = dRow.status_name;
	packingslip.delivery_note_id    = dRow.delivery_notes_id ? dRow.delivery_notes_id : "";
	packingslip.note_number         = dRow.note_number ? dRow.note_number : "";
	packingslip.created				= dRow.created;
	packingslip.last_updated		= dRow.last_updated;

	packingslip.order               = {};
	packingslip.order.order_number  = dRow.order_number;

	packingslip.gate_pass = {};
	packingslip.gate_pass.id = dRow.gate_pass_id ? dRow.gate_pass_id : "";
	packingslip.gate_pass.gate_pass_number = dRow.gate_pass_number ? dRow.gate_pass_number : "";
	packingslip.gate_pass.statusid = dRow.gate_pass_status ? dRow.gate_pass_status : "";
	
	return packingslip;
}

function mapToBGatePass(dRow) {

	var gate_pass = initGatePass();

	gate_pass.id = dRow.id;
	gate_pass.gate_pass_number = dRow.gate_pass_number;
	gate_pass.gate_pass_date = dRow.gate_pass_date;
	gate_pass.contact_name = dRow.contact_name;
	gate_pass.vehicle_number = dRow.vehicle_number;
	gate_pass.charges = dRow.tempo_charges;
	gate_pass.statusid  = dRow.sysgatepassstatuses_id;
	gate_pass.notes = dRow.notes;
	gate_pass.created = dRow.created;
	gate_pass.last_updated = dRow.last_updated;
	return gate_pass;
}

function mapToBGatePassDetail(dRow) {

	var gd = initGatePassDetail();

	gd.id = dRow.id;
	gd.delivery_notes_id = dRow.delivery_notes_id;
	gd.packing_slip_id = dRow.packing_slips_id;
	gd.packing_slip_number = dRow.packing_slip_number;
	gd.packing_date = dRow.packing_date;
	gd.gross_weight = dRow.gross_weight;
	gd.tempo_charges = dRow.tempo_charges;
	gd.created = dRow.created;
	gd.last_updated = dRow.last_updated;
	return gd;
}

function mapToBPackingSlipDetail(dRow) {

	var packingslipdetail                    	= initPackingSlipDetail();
	
	packingslipdetail.id						= dRow.id 						;
	packingslipdetail.packing_slip_id			= dRow.packing_slips_id			;
	packingslipdetail.order_id					= dRow.orders_id				;
	packingslipdetail.order_detail_id			= dRow.order_details_id			;
	packingslipdetail.product_id				= dRow.products_id				;
	packingslipdetail.stock_bucket_id			= dRow.stock_buckets_id	   	    ;
	packingslipdetail.stock_bucket_code			= dRow.stock_bucket_code        ;
	packingslipdetail.packed_qty_qty			= dRow.quantity_entered_packed  ;
	packingslipdetail.packed_qty_quote		    = dRow.quantity_ordered_packed  ;
	packingslipdetail.created					= dRow.created					;
	packingslipdetail.last_updated				= dRow.last_updated				;
	packingslipdetail.sku                       = dRow.sku                      ;
	packingslipdetail.name                      = dRow.name                     ;
	packingslipdetail.unit_of_measures_id 	    = dRow.unit_of_measures_id      ;
	packingslipdetail.uom_name                  = dRow.uom_name                 ;
	packingslipdetail.uom_short_name            = dRow.uom_short_name           ;
	packingslipdetail.entered_unit_of_measures_id=dRow.entered_unit_of_measures_id;
	packingslipdetail.entered_uom_name          = dRow.entered_uom_name         ;
	packingslipdetail.entered_uom_short_name    = dRow.entered_uom_short_name   ;
	packingslipdetail.is_batched_inventory      = dRow.is_batched_inventory     ;
	packingslipdetail.order_unit_of_measures_id = dRow.order_unit_of_measures_id;
	packingslipdetail.tax_total                 = dRow.tax_total;
	packingslipdetail.discount_total            = dRow.discount_total;
	packingslipdetail.ship_total                = dRow.ship_total;
	packingslipdetail.sub_total                 = dRow.sub_total;
	packingslipdetail.notes                     = dRow.notes;
	packingslipdetail.piece_count               = dRow.piece_count;

	return packingslipdetail;
}

function mapToBDeliveryNote(dRow) {

	var deliverynote                    	    = initDeliveryNote();
	
	deliverynote.id						        = dRow.id;
	deliverynote.note_number			        = dRow.note_number;
	deliverynote.note_date					    = dRow.note_date;
	deliverynote.status_id			            = dRow.sysdeliverynotestatuses_id;
	deliverynote.status_name                    = dRow.status_name;
	deliverynote.transporter.id                 = dRow.transporters_id;
	deliverynote.transporter.name               = dRow.transporter_name;
	deliverynote.transporter.external_code      = dRow.transporter_external_code;
	deliverynote.user.id                        = dRow.users_id;
	deliverynote.user.first_name                = dRow.user_first_name;
	deliverynote.user.last_name                 = dRow.user_last_name;
	deliverynote.user.login_name                = dRow.user_login_name;
	deliverynote.customer.id                    = dRow.customers_id;
	deliverynote.customer.name                  = dRow.customer_name;
	deliverynote.lr_date                        = dRow.lr_date;
	deliverynote.lr_number                      = dRow.lr_number;
	deliverynote.invoice_number                 = dRow.invoice_number;
	deliverynote.orders_id_string               = dRow.orders_id_string;
	deliverynote.po_string                      = dRow.po_string;
	deliverynote.order_number_string            = dRow.order_number_string;
	deliverynote.tax_total                      = dRow.tax_total;
	deliverynote.tax_total_cgst                 = dRow.tax_total_cgst;
	deliverynote.tax_total_igst                 = dRow.tax_total_igst;
	deliverynote.tax_total_sgst                 = dRow.tax_total_sgst;
	deliverynote.tax_total_vat                  = dRow.tax_total_vat;
	deliverynote.discount_total                 = dRow.discount_total;
	deliverynote.rounding_total                 = dRow.rounding_total;
	deliverynote.ship_total                     = dRow.ship_total;
	deliverynote.sub_total                      = dRow.sub_total;
	deliverynote.notes                          = dRow.notes;
	deliverynote.direct_invoice_flag            = dRow.direct_invoice_flag || 0;
	deliverynote.taxform_flag                   = dRow.taxform_flag;
	deliverynote.exportform_flag                = dRow.exportform_flag;
	deliverynote.proforma_invoice_flag          = dRow.proforma_invoice_flag;
	deliverynote.material_out_invoice_flag      = dRow.material_out_invoice_flag;
	deliverynote.einvoice_info.bill_number      = dRow.einvoice_info.bill_number;
	deliverynote.einvoice_info  		        = (dRow.einvoice_info != null ? JSON.parse(dRow.einvoice_info) : null)
	deliverynote.destination                    = dRow.destination;
	deliverynote.bale_count 					= dRow.bale_count;
	deliverynote.gate_pass_info					= (dRow.gate_pass_info != null ? JSON.parse(dRow.gate_pass_info) : null);
	deliverynote.ship_address                   = {};
	deliverynote.ship_address.id                = dRow.ship_addresses_id;
	deliverynote.destination_distance	        = dRow.destination_distance;
	deliverynote.sync_status_id                 = dRow.syssyncstatuses_id;
	deliverynote.sync_failure_reason            = dRow.sync_failure_reason;
	deliverynote.accounting_voucher_date        = dRow.accounting_voucher_date;
	deliverynote.created                        = dRow.created;
	deliverynote.last_updated                   = dRow.last_updated;
	return deliverynote;
}

function maptoBDeliveryNoteDetail(dRow) {

	var deliverynote                    	    = initDeliveryNoteDetail();
	
	deliverynote.id						        = dRow.id;
	deliverynote.delivery_notes_id			    = dRow.delivery_notes_id;
	deliverynote.productid					    = dRow.products_id;
	deliverynote.stock_buckets_id			    = dRow.stock_buckets_id;
	deliverynote.sku                    		= dRow.sku;
	deliverynote.name 			                = dRow.name;
	deliverynote.uom_id 		                = dRow.uom_id;
	deliverynote.uom_name 		                = dRow.uom_name;
	deliverynote.uom_short_name	                = dRow.uom_short_name;
	deliverynote.orderqty                       = dRow.quantity_ordered_packed;
	deliverynote.entered_uom_id 		        = dRow.entered_unit_of_measures_id;
	deliverynote.entered_uom_name 		        = dRow.entered_uom_name;
	deliverynote.entered_uom_short_name	        = dRow.entered_uom_short_name;
	deliverynote.entered_quantity               = dRow.quantity_entered_packed;
	deliverynote.order_price 			        = dRow.price;
	deliverynote.sub_total                      = dRow.sub_total;
	deliverynote.ship_total                     = dRow.ship_total;
	deliverynote.tax_total                      = dRow.tax_total;
	deliverynote.discount_total                 = dRow.discount_total;
	deliverynote.tax_total_cgst                 = dRow.tax_total_cgst;
	deliverynote.tax_total_igst                 = dRow.tax_total_igst;
	deliverynote.tax_total_sgst                 = dRow.tax_total_sgst;
	deliverynote.tax_total_cess                 = dRow.tax_total_cess;
	deliverynote.tax_total_vat                  = dRow.tax_total_vat;
	deliverynote.created                        = dRow.created;
	deliverynote.last_updated                   = dRow.last_updated;

	deliverynote.hsn 									= {};
	deliverynote.hsn.id 								= dRow.hsn_id;
	return deliverynote;
}

function mapToBUpload(dRow) {

	var u = initUpload();

	u.id = dRow.id;
	u.upload_type = dRow.sysuploadtypes_id;
	u.status_id  = dRow.syssyncstatuses_id
    u.filename = dRow.file_name;
	u.format = dRow.format;
    u.number_of_records = dRow.number_of_records;
    u.userid = dRow.userid;
    u.companyid = dRow.companyid;
	u.created = dRow.created;
	u.last_updated = dRow.last_updated;
	return u;
}

function mapToBDashboard(dResultSets) {

	var section;

	var dashboard      = initDashboard();
	dashboard.tablist = [];
	dashboard.barlist = [];
	dashboard.dataset = [];

	var hMetaInfo = getDashboardMetaInfo(dResultSets[0]);

	for (i=1; i < dResultSets.length - 1; i++) {
		dRows =  dResultSets[i];

		var sectionType = hMetaInfo[i]["controltype"];

		// bar list
		if (sectionType == 1 && dRows.length > 0) {

			var keysArr = Object.keys(dRows[0]);

			var data = {};
			data["description"] = hMetaInfo[i]["description"];
			data["headerlist"] = [];
			data["rowlist"] = [];

			for (j=0; j < dRows.length; j++) {

				var dRow = dRows[j];
				var row = {};

				for (var k = 0;k < keysArr.length-1; k++) {
					row[keysArr[k]] = dRow[keysArr[k]];
					if (j == 0) {
						data["headerlist"].push(keysArr[k]);
					}
				}

				data["rowlist"].push(row);
			}

			dashboard.dataset.push(data);

		}

		// bar list
		if (sectionType == 2) {

			var bar = {};
			bar["description"] = hMetaInfo[i]["description"];
			bar["data"] = [];

			for (j=0; j < dRows.length; j++) {
				var dRow = dRows[j];
				var data = {};
				data["X"] = dRow["X"];
				data["Y"] = dRow["Y"];
				data["legendX"] = dRow["X-NAME"];
				data["legendY"] = dRow["Y-NAME"];
				if (dRow["Z"]) {
					data["Z"] = dRow["Z"];
				}

				bar["data"].push(data);
			}
			dashboard.barlist.push(bar);

		}

		if (sectionType == 4) {
			for (j=0; j < dRows.length; j++) {
				var dRow = dRows[j];
				var tab = {};
				tab["description"] = dRow["description"];
				tab["value"]       = dRow["value"];
				tab["color"]	   = dRow["color"];
				dashboard.tablist.push(tab);
			}
		}

		if (sectionType == 3) {
			if (dRows && dRows.length > 0) {
				var dashboardHash = {};
				for (j=0; j < dRows.length; j++) {
					var dRow = dRows[j];
					if (dRow.linetype == 1) {
						section = initDashboardSection();
						section.description = dRow.description;
						section.count       = dRow.linecount;
						section.value       = dRow.linevalue;
						section.source	    = dRow.source;
						dashboard.sectionlist.push(section);
						dashboardHash["section_" + dRow.sectionid] = section;
					}
					if (dRow.linetype == 0) {
					   section = dashboardHash["section_" + dRow.sectionid];
					   if (section) {
						   var sectionItem = initDashboardSectionItem();
						   sectionItem.count = dRow.linecount;
						   sectionItem.value = dRow.linevalue;
						   sectionItem.color = dRow.color;
						   sectionItem.description = dRow.description;
						   section.sectionlineitems.push(sectionItem); 
					   }
					}
				}
			}
		}
	}

	return dashboard;
}

function getDashboardMetaInfo (dRows) {
	var dashboardMetaHash = {};
	if (dRows && dRows.length > 0) {
		for (i=0; i < dRows.length; i++) {
			dashboardMetaHash[i] = {"controltype": dRows[i]["controltype"], "description": dRows[i]["description"]};
		}
	}
	return dashboardMetaHash;
}

function mapToBImage(dRow) {
	var obj         = new Object();
	obj.id          = dRow.id;
	obj.description = dRow.description;
	obj.url         = dRow.url
	obj.url_orig    = getFullImagePath(dRow.url, Config.local.image_server_folder_orig);
	obj.url_large   = dRow.url_large;
	return obj;
}

function initSession() {

	return (new Session());
}

function initUOM() {
	return (new UOM());
}

function initUOMConversion() {
	return (new UOMConversion());
}

function initPriceGroup() {
	return (new PriceGroup());
}

function initUser() {
	return (new User());
}

function initCustomer() {
	return (new Customer());
}

function initCustomerNotification() {
	return (new CustomerNotification());
}

function initNotification() {
	return (new Notification());
}

function initAgent() {
	return (new Agent());
}

function initRole() {
	return (new Role());
}

function initCompany() {
	return (new Company());
}

function initProduct() {
	return (new Product());
}

function initCategory() {
	return (new Category());
}

function initAddress() {
	return (new Address());
}

function initPermission() {
	return (new Permission());
}

function initConfiguration() {
	return (new Configuration());
}

function initQuantity() {
	return (new Quantity());
}

function initTransporter() {
	return (new Transporter());
}

function initDimension() {
	return (new Dimension());
}

function initPaymentTerm() {
	return (new PaymentTerm());
}

function initTempo() {
	return (new Tempo());
}

function initCompanyType() {
	return (new CompanyType());
}

function initSalesPerson() {
	return (initUser());
}

function initPriceList() {
	return (new PriceList());
}

function initHsn() {
	return (new Hsn());
}

function initBill() {
	return (new Bill());
}

function initTaxSlab() {
	return (new TaxSlab());
}

function initOrder() {
	return (new Order());
}

function initOrderDetail() {
	return (new OrderDetail());
}
function initPackingSlip() {
	return (new PackingSlip());
}
function initPackingSlipDetail() {
	return (new PackingSlipDetail());
}
function initGatePass() {
	return (new GatePass());
}
function initGatePassDetail() {
	return (new GatePassDetail());
}
function initStockBucket() {
	return (new StockBucket());
}
function initStockJournal() {
	return (new StockJournal());
}
function initStockBucketDetail() {
	return (new StockBucketDetail());
}
function initDashboard() {
	return (new Dashboard());
}
function initDashboardSection() {
	return (new DashboardSection());
}
function initDashboardSectionItem() {
	return (new DashboardSectionItem());
}
function initCustomFilter() {
	return (new CustomFilter());
}
function initDeliveryNote() {
	var d = new DeliveryNote();
	d.transporter = new Transporter();
	d.customer    = new Customer();
	d.user        = new User();
	return d;
}
function initDeliveryNoteDetail() {
	var d = new DeliveryNoteDetail();
	return d;
}
function initUpload() {	
	var u = new Upload();
	return u;
}

module.exports = {

	mapToBSession        : mapToBSession,
	mapToBUser           : mapToBUser,
	mapToBCustomer       : mapToBCustomer,
	mapToBAgent          : mapToBAgent,
	mapToBCompany        : mapToBCompany,
	mapToBCustomerNotification : mapToBCustomerNotification,
	mapToBAddress        : mapToBAddress,
	mapToBProduct        : mapToBProduct,
	mapToBCategory       : mapToBCategory,
	mapToBRole           : mapToBRole,
	mapToBConfiguration  : mapToBConfiguration,
	mapToBPermission     : mapToBPermission,
	mapToBTransporter    : mapToBTransporter,
	mapToBPaymentTerm    : mapToBPaymentTerm,
	mapToBCompanyType    : mapToBCompanyType,
	mapToBCustomFilter   : mapToBCustomFilter,
	mapToBPriceList      : mapToBPriceList,
	mapToBUnitOfMeasure  : mapToBUnitOfMeasure,
	mapToBPriceGroup     : mapToBPriceGroup,
	mapToBUOMConversion  : mapToBUOMConversion,
	mapToBOrder			 : mapToBOrder,
	mapToBOrderDetail	 : mapToBOrderDetail,
	mapToBPackingSlip    : mapToBPackingSlip,
	mapToBPackingSlipDetail : mapToBPackingSlipDetail,
	mapToBStockBucket    : mapToBStockBucket,
	mapToBStockJournal   : mapToBStockJournal,
	mapToBStockBucketDetail : mapToBStockBucketDetail,
	mapToBDashboard      : mapToBDashboard,
	mapToBDeliveryNote   : mapToBDeliveryNote,
	maptoBDeliveryNoteDetail : maptoBDeliveryNoteDetail,
	mapToBTaxSlab        : mapToBTaxSlab,
	mapToBImage          : mapToBImage,
	mapToBHsn            : mapToBHsn,
	mapToBBill			 : mapToBBill,
	mapToBShare			 : mapToBShare,
	mapToBGatePass		 : mapToBGatePass,
	mapToBGatePassDetail : mapToBGatePassDetail,
	mapToBTempo			 : mapToBTempo,
	mapToBUpload 		 : mapToBUpload,
	mapToBNotification 	 : mapToBNotification,
	
	initUOM              : initUOM,
	initAddress          : initAddress,
	initAgent            : initAgent,
	initCategory         : initCategory,
	initCompany          : initCompany,
	initCompanyType      : initCompanyType,
	initCustomer         : initCustomer,
	initCustomerNotification : initCustomerNotification,
	initNotification 	 : initNotification,
	initDimension        : initDimension,
	initPaymentTerm      : initPaymentTerm,
	initPermission       : initPermission,
	initProduct          : initProduct,
	initQuantity         : initQuantity,
	initRole             : initRole,
	initSalesPerson      : initSalesPerson,
	initSession          : initSession,
	initTransporter      : initTransporter,
	initUser             : initUser,
	initPriceList        : initPriceList,
	initPriceGroup       : initPriceGroup,
	initStockBucket      : initStockBucket,
	initStockJournal     : initStockJournal,
	initPackingSlip      : initPackingSlip,
	initPackingSlipDetail: initPackingSlipDetail,
	initDeliveryNote     : initDeliveryNote,
	initDeliveryNoteDetail : initDeliveryNoteDetail,
	initTaxSlab          : initTaxSlab,
	initCustomFilter     : initCustomFilter,
	initUpload			 : initUpload
};
