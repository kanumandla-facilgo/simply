var Customer = function () {
  this.id              = "";
  this.name            = "";
  this.invoicing_name  = "";
  this.code            = "";
  this.description     = "";
  this.company_id      = "";
  this.status_id       = "";
  this.bill_address    = {};
  this.ship_address    = {};
  this.address         = {};
  this.sales_person    = {};
  this.transporter     = {};
  this.agent           = {};
  this.user            = {};
  this.payment_term    = "";
  this.system_type_id  = "";
  this.custom_type_id  = "";
  this.current_balance = 0;
  this.current_overdue = 0;
  this.allowed_balance = 0;
  this.overdue         = 0;
  this.current_balance_sync_date = "";
  this.current_overdue_sync_date = "";
  this.created         = "";
  this.last_updated    = "";
  this.update_counter  = 0;
  this.notes           = "";
  this.tin             = "";
  this.cst_number      = "";
  this.vat_number      = "";
  this.pan_number      = "";
  this.excise_number   = "";
  this.gst_number      = "";
  this.gst_registration_type = "";
  this.taxform_flag    = 0;
  this.sync_status_id  = "";
  this.more            = {};
};
/*
Customer.prototype.id = function(id) {
 this.id = id;
}

Customer.prototype.name = function(name) {
 this.name = name;
}

Customer.prototype.code = function(code) {
 this.code = code;
}

Customer.prototype.description = function(description) {
 this.description = description;
}

Customer.prototype.status_id = function(status_id) {
 this.status_id = status_id;
}

Customer.prototype.bill_address = function(bill_address) {
 this.bill_address = bill_address;
}

Customer.prototype.ship_address = function(ship_address) {
 this.ship_address = ship_address;
}

Customer.prototype.address = function(address) {
 this.address = address;
}

Customer.prototype.sales_person = function(vale) {
 this.sales_person = value;
}

Customer.prototype.agent = function(vale) {
 this.agent = value;
}

Customer.prototype.system_type_id = function(system_type_id) {
 this.system_type_id = system_type_id;
}

Customer.prototype.custom_type_id = function(custom_type_id) {
 this.custom_type_id = custom_type_id;
}

Customer.prototype.balance = function(value) {
 this.balance = value;
}

Customer.prototype.created = function(created) {
 this.created = created;
}

Customer.prototype.last_updated = function(value) {
 this.last_updated = value;
}

Customer.prototype.update_counter = function(created) {
 this.update_counter = created;
}

Customer.prototype.transporter = function(value) {
 this.transporter = value;
}

Customer.prototype.payment_term = function(value) {
 this.payment_term = value;
}

Customer.prototype.tin = function(tin) {
 this.tin = tin;
}
*/
module.exports = Customer;
