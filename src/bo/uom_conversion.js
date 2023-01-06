var UOM    = require("../bo/uom");

var UOMConversion = function () {
  this.uom_id             = "";
//  this.product_id         = "";
  this.from_uom           = new UOM();
  this.from_qty           = 0;
  this.to_uom             = new UOM();
  this.to_qty             = 0;
};

module.exports = UOMConversion;
