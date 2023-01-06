var Category = function () {
 this.id               = "";
 this.name             = "";
 this.code             = "";
 this.created          = "";
 this.is_leaf          = 1;
 this.is_enabled       = 1;
 this.is_hidden        = 0;
 this.is_root          = 0;
 this.children_count   = 0;
 this.parent_id        = "";
 this.image_url        = "";
 this.image_url_large  = "";
 this.lineage          = "";
 this.lineagename      = "";
 this.companyid        = "";
 this.update_counter   = 0;
 this.last_updated     = "";
};

/*
Category.prototype.id = function(id) {
 this.id = id;
}

Category.prototype.name = function(name) {
 this.name = name;
}

Category.prototype.code = function(code) {
 this.code = code;
}

Category.prototype.created = function(created) {
 this.created = created;
}

Category.prototype.is_leaf = function(is_leaf) {
 this.is_leaf = is_leaf;
}

Category.prototype.is_enabled = function(is_enabled) {
 this.is_enabled = is_enabled;
}

Category.prototype.is_hidden = function(is_hidden) {
 this.is_hidden = is_hidden;
}

Category.prototype.is_root = function(is_root) {
 this.is_root = is_root;
}

Category.prototype.children_count = function(children_count) {
 this.children_count = children_count;
}

Category.prototype.parent_id = function(parent_id) {
 this.parent_id = parent_id;
}

Category.prototype.image_url = function(image_url) {
 this.image_url = image_url;
}

Category.prototype.lineage = function(lineage) {
 this.lineage = lineage;
}

Category.prototype.lineagename = function(lineagename) {
 this.lineagename = lineagename;
}

Category.prototype.company_id = function(company_id) {
 this.company_id = company_id;
}


Category.prototype.last_updated = function(value) {
 this.last_updated = value;
}

Category.prototype.update_counter = function(created) {
 this.update_counter = created;
}
*/
module.exports = Category;
