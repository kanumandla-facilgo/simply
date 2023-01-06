var Role = function () {
  this.id             = "";
  this.description    = "";
  this.name           = "";
  this.sys_role_id    = "";
  this.created        = "";
  this.last_updated   = "";
  this.update_counter = 0;
};
/*
Role.prototype.id = function(id) {
 this.id = id;
}

Role.prototype.description = function(description) {
 this.description = description;
}

Role.prototype.name = function(name) {
 this.name = name;
}

Role.prototype.sys_role_id = function(sys_role_id) {
 this.sys_role_id = sys_role_id;
}

Role.prototype.created = function(created) {
 this.created = created;
}

Role.prototype.last_updated = function(value) {
 this.last_updated = value;
}

Role.prototype.update_counter = function(value) {
 this.update_counter = value;
}
*/
module.exports = Role;