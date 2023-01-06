var UOM = function() {
  this.id             = "";
  this.name           = "";
  this.description    = "";
  this.short_name     = "";
  this.company_id     = "";
  this.base_id        = "";
  this.master_id      = "";
  this.conversion_factor = "";
  this.display_flag   = 1;
  this.is_system      = 0;
  this.unit_price     = "";
  this.created        = "";
  this.conversion_list = [];
  this.last_updated   = "";
  this.update_counter = 0;
};
/*
Transporter.prototype.id = function(id) {
 this.id = id;
}

Transporter.prototype.name = function(name) {
 this.name = name;
}

Transporter.prototype.code = function(value) {
 this.code = value;
}

Transporter.prototype.company_id = function(company_id) {
 this.company_id = company_id;
}

Transporter.prototype.status_id = function(status_id) {
 this.status_id = status_id;
}

Transporter.prototype.address = function (address) {
 this.address = address;
}

Transporter.prototype.last_updated = function(value) {
 this.last_updated = value;
}

Transporter.prototype.update_counter = function(value) {
 this.update_counter = value;
}
*/
module.exports = UOM;
