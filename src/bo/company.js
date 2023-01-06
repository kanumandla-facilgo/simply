var Company = function () {
	this.id                 = "";
	this.name               = "";
	this.code               = "";
	this.description        = "";
	this.status_id          = "";
	this.bill_address       = undefined;
	this.ship_address       = undefined;
	this.address            = undefined;
	this.system_type_id     = "";
	this.subscription_template_id     = "";
	this.custom_type_id     = "";
	this.created            = "";
	this.last_updated       = "";
	this.tin                = "";
	this.update_counter     = 0;
    this.cst_number      = "";
    this.vat_number      = "";
    this.pan_number      = "";
    this.excise_number   = "";
};
/*
Company.prototype.id = function(id) {
 this.id = id;
}

Company.prototype.name = function(name) {
 this.name = name;
}

Company.prototype.code = function(code) {
 this.code = code;
}

Company.prototype.description = function(description) {
 this.description = description;
}

Company.prototype.status_id = function(status_id) {
 this.status_id = status_id;
}

Company.prototype.bill_address = function(bill_address) {
 this.bill_address = bill_address;
}

Company.prototype.ship_address = function(ship_address) {
 this.ship_address = ship_address;
}

Company.prototype.address = function(address) {
 this.address = address;
}

Company.prototype.system_type_id = function(system_type_id) {
 this.system_type_id = system_type_id;
}

Company.prototype.custom_type_id = function(custom_type_id) {
 this.custom_type_id = custom_type_id;
}

Company.prototype.created = function(created) {
 this.created = created;
}

Company.prototype.last_updated = function(value) {
 this.last_updated = value;
}

Company.prototype.update_counter = function(created) {
 this.update_counter = created;
}

Company.prototype.tin = function(tin) {
 this.tin = tin;
}
*/
module.exports = Company;
