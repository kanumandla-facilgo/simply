var CompanyType = function () {
  this.id             = "";
  this.description    = "";
  this.name           = "";
  this.balance_limit  = 0;
  this.master_id      = "";
  this.created        = "";
  this.is_default     = 0;
  this.last_updated   = "";
  this.update_counter = 0;
};

/*
CompanyType.prototype.id = function(id) {
 this.id = id;
}

CompanyType.prototype.description = function(description) {
 this.description = description;
}

CompanyType.prototype.name = function(name) {
 this.name = name;
}

CompanyType.prototype.balance_limit = function(balance_limit) {
 this.balance_limit = balance_limit;
}

CompanyType.prototype.master_id = function(master_id) {
 this.master_id = master_id;
}

CompanyType.prototype.created = function(created) {
 this.created = created;
}

CompanyType.prototype.last_updated = function(value) {
 this.last_updated = value;
}

CompanyType.prototype.update_counter = function(created) {
 this.update_counter = created;
}
*/
module.exports = CompanyType;

