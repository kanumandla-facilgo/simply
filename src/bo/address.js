var Address = function() {
 this.id             = "";
 this.first_name     = "";
 this.last_name      = "";
 this.address1       = "";
 this.address2       = "";
 this.address3       = "";
 this.city           = "";
 this.state          = "";
 this.zip            = "";
 this.phone1         = "";
 this.email1         = "";
 this.phone2         = "";
 this.email2         = "";
 this.update_counter = 0;
 this.created        = "";
 this.last_updated   = "";
};

/*
Address.prototype.id = function(id) {
 this.id = id;
}

Address.prototype.address1 = function(address1) {
 this.address1 = address1;
}

Address.prototype.address2 = function(address2) {
 this.address3 = address3;
}

Address.prototype.address3 = function(address3) {
 this.address3 = address3;
}

Address.prototype.city = function(city) {
 this.city = city;
}

Address.prototype.state = function(state) {
 this.state = state;
}

Address.prototype.zip = function(zip) {
 this.zip = zip;
}

Address.prototype.phone1 = function(phone1) {
 this.phone1 = phone1;
}

Address.prototype.email1 = function(email1) {
 this.email1 = email1;
}

Address.prototype.phone2 = function(phone2) {
 this.phone2 = phone2;
}

Address.prototype.email2 = function(email2) {
 this.email2 = email2;
}

Address.prototype.update_counter = function(update_counter) {
 this.update_counter = update_counter;
}

Address.prototype.created = function(created) {
 this.created = created;
}

Address.prototype.last_updated = function(value) {
 this.last_updated = value;
}
*/
module.exports = Address;
