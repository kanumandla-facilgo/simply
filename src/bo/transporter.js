var Transporter = function() {
  this.id             = "";
  this.name           = "";
  this.code           = "";
  this.external_code  = "";
  this.company_id     = "";
  this.status_id      = "";
  this.address        = undefined;
  this.created        = "";
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
module.exports = Transporter;
