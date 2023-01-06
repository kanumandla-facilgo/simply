var Session = function() {
  this.id             = "";
  this.user           = undefined;
  this.company_id     = "";
  this.last_auth_at   = "";
  this.expiration_at  = "";
  this.sessiontype	  = "";
  this.permissionlist = [];
  this.configurationlist = [];
};
/*
Session.prototype.id = function(id) {
 this.id = id;
}

Session.prototype.user = function(user) {
 this.user = user;
}

Session.prototype.company_id = function(company_id) {
 this.company_id = company_id;
}

Session.prototype.last_auth_at = function(last_auth_at) {
 this.last_auth_at = last_auth_at;
}

Session.prototype.expiration_at = function(expiration_at) {
 this.expiration_at = expiration_at;
}

Session.prototype.permissionlist = function(value) {
 this.permissionlist = value;
}
*/
module.exports = Session;
