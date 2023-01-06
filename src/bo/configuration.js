var Configuration = function () {
  this.id              = "";
  this.code            = "";
  this.value           = "";
  this.name            = "";
  this.description     = "";
  this.documentid      = "";
  this.documenttypeid  = "";
  this.last_updated    = "";
  this.created         = "";
  this.update_counter  = 0;
};
/*
Configuration.prototype.id = function(id) {
 this.id = id;
}

Configuration.prototype.code = function(code) {
 this.code = code;
}

Configuration.prototype.value = function(value) {
 this.value = value;
}

Configuration.prototype.description = function(description) {
 this.description = description;
}

Configuration.prototype.documentid = function(documentid) {
 this.documentid = documentid;
}

Configuration.prototype.documenttypeid = function(documenttypeid) {
 this.documenttypeid = documenttypeid;
}

Configuration.prototype.last_updated = function(value) {
 this.last_updated = value;
}

Configuration.prototype.update_counter = function(created) {
 this.update_counter = created;
}
*/
module.exports = Configuration;
