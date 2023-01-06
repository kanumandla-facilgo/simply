var Dimension    = require("../bo/dimension");
var Quantity     = require("../bo/quantity");
var PriceGroup   = require("../bo/price_group");

var Product = function () {
  this.id                    = "";
  this.name                  = "";
  this.sku                   = "";
  this.sku_internal          = "";
  this.created               = "";
  this.description           = "";
  this.status_id             = "";
  this.sync_status_id        = "";
  this.unit_price            = "";
  this.uom_id                = "";
  this.uom_name              = "";
  this.default_qty_uom       = undefined;
  this.stock_uom_qty         = undefined;
  this.stock_uom_quote       = undefined;
  this.stock_uom_batch       = undefined;
  this.stock_batch_pcs      = 0;
  this.is_qty_uom_restricted = "";
  this.is_quote_uom_restricted = "";
  this.color                 = "";
  this.is_hidden             = 0;
  this.is_hidden_no_stock    = 1;
  this.is_taxable            = 0;
  this.is_family_head        = 0;
  this.product_type_id       = "";
  this.image_url1            = "";
  this.image_url2            = "";
  this.image_url3            = "";
  this.image_url4            = "";
  this.image_url5            = "";
  this.category_id           = "";
  this.company_id            = "";
  this.price_level_id        = "";
  this.dimension             = new Dimension();
  this.quantity              = new Quantity();
  this.pricegroup            = new PriceGroup();
  this.familymemberlist      = [];
  this.uomlist               = [];
  this.family_size           = 0;
  this.category_count        = 0;
  this.default_sell_qty      = "";
  this.is_batched_inventory  = 0;
  this.update_counter        = 0;
  this.image_list            = [];
  this.last_updated          = "";
  this.hsn                   = undefined;
};

/*
Product.prototype.id = function(id) {
 this.id = id;
}

Product.prototype.name = function(name) {
 this.name = name;
}

Product.prototype.sku = function(sku) {
 this.sku = sku;
}

Product.prototype.sku_internal = function(sku_internal) {
 this.sku_internal = sku_internal;
}

Product.prototype.created = function(created) {
 this.created = created;
}

Product.prototype.description = function(description) {
 this.description = description;
}

Product.prototype.status_id = function(status_id) {
 this.status_id = status_id;
}

Product.prototype.unit_price = function(unit_price) {
 this.unit_price = unit_price;
}

Product.prototype.uom = function(uom) {
 this.uom = uom;
}

Product.prototype.color = function(color) {
 this.color = color;
}

Product.prototype.is_hidden = function(is_hidden) {
 this.is_hidden = is_hidden;
}

Product.prototype.is_family_head = function(is_family_head) {
 this.is_family_head = is_family_head;
}

Product.prototype.image_url1 = function(image_url1) {
 this.image_url1 = image_url1;
}

Product.prototype.image_url2 = function(image_url2) {
 this.image_url2 = image_url2;
}

Product.prototype.image_url3 = function(image_url3) {
 this.image_url3 = image_url3;
}

Product.prototype.image_url4 = function(image_url4) {
 this.image_url4 = image_url4;
}

Product.prototype.image_url5 = function(image_url5) {
 this.image_url5 = image_url5;
}

Product.prototype.category_id = function(category_id) {
 this.category_id = category_id;
}

Product.prototype.company_id = function(company_id) {
 this.company_id = company_id;
}

Product.prototype.Quantity = function(Quantity) {
 this.Quantity = Quantity;
}

Product.prototype.Dimension = function(Dimension) {
 this.Dimension = Dimension;
}

Product.prototype.last_updated = function(value) {
 this.last_updated = value;
}

Product.prototype.update_counter = function(value) {
 this.update_counter = value;
}
*/
module.exports = Product;
