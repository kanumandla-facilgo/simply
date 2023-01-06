var User = function() {
  this.id             = "";
  this.first_name     = "";
  this.last_name      = "";
  this.company_id     = "";
  this.middle_name    = "";
  this.role_id        = "";
  this.sys_role_id    = "";
  this.role_name      = "";
  this.login_name     = "";
  this.password       = "";
  this.status_id      = "";
  this.address        = undefined;
  this.update_counter = 0;
  this.created        = "";
  this.last_updated   = "";
};
/*
User.prototype.id = function(id) {
 this.id = id;
}

User.prototype.first_name = function(first_name) {
 this.first_name = first_name;
}

User.prototype.last_name = function(last_name) {
 this.last_name = last_name;
}

User.prototype.middle_name = function(middle_name) {
 this.middle_name = middle_name;
}

User.prototype.role_id = function(role_id) {
 this.role_id = role_id;
}

User.prototype.sys_role_id = function(sys_role_id) {
 this.sys_role_id = sys_role_id;
}

User.prototype.role_name = function(rolename) {
 this.role_name = rolename;
}

User.prototype.company_id = function(company_id) {
 this.company_id = company_id;
}

User.prototype.login_name = function(login_name) {
 this.login_name = login_name;
}

User.prototype.password = function(password) {
 this.password = password;
}

User.prototype.status_id = function(status_id) {
 this.status_id = status_id;
}

User.prototype.address = function (address) {
 this.address = address;
}

User.prototype.last_updated = function(value) {
 this.last_updated = value;
}

User.prototype.update_counter = function(value) {
 this.update_counter = value;
}
*/
module.exports = User;
