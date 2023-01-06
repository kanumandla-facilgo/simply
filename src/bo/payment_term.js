var PaymentTerm = function () {
  this.id             = "";
  this.description    = "";
  this.status_id      = "";
  this.code           = "";
  this.days           = 0;
  this.created        = "";
  this.last_updated   = "";
  this.update_counter = 0;
};
/*
PaymentTerm.prototype.id = function(id) {
 this.id = id;
}

PaymentTerm.prototype.description = function(description) {
 this.description = description;
}

PaymentTerm.prototype.status_id = function(value) {
 this.status_id = vaue;
}

PaymentTerm.prototype.code = function(value) {
 this.code = vaue;
}

PaymentTerm.prototype.days = function(days) {
 this.days = days;
}

PaymentTerm.prototype.created = function(created) {
 this.created = created;
}

PaymentTerm.prototype.last_updated = function(value) {
 this.last_updated = value;
}

PaymentTerm.prototype.update_counter = function(created) {
 this.update_counter = created;
}
*/
module.exports = PaymentTerm;
