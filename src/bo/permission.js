var Permission = function () {
  this.id             = "";
  this.description    = "";
  this.name           = "";
  this.value          = "";
  this.default_value  = "";
  this.group_id       = "";
  this.group_name     = "";
  this.created        = "";
  this.last_updated   = "";
  this.update_counter = 0;
};
/*
Permission.prototype.id = function(id) {
 this.id = id;
}

Permission.prototype.description = function(description) {
 this.description = description;
}

Permission.prototype.name = function(name) {
 this.name = name;
}

Permission.prototype.value = function(value) {
 this.value = value;
}

Permission.prototype.default_value = function(default_value) {
 this.default_value = default_value;
}

Permission.prototype.group_id = function(group_id) {
 this.group_id = group_id;
}

Permission.prototype.group_name = function(value) {
 this.group_name = value;
}

Permission.prototype.created = function(created) {
 this.created = created;
}

Permission.prototype.last_updated = function(value) {
 this.last_updated = value;
}

Permission.prototype.update_counter = function(value) {
 this.update_counter = value;
}
*/
module.exports = Permission;
