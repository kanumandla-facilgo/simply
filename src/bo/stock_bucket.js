var UOM   = require("../bo/uom");

var StockBucket = function () {

  this.id                = "";
  this.code              = "";
  this.description       = "";
  this.is_system         = 0;
  this.product_id        = "";
  this.status_id         = "";

  this.uom_qty           = new UOM();
  this.uom_quote         = new UOM();
  this.stock_quote       = 0;
  this.stock_qty         = 0;
//  this.stock_qty_string  = "";
  this.stock_quote_string = "";
  this.stock_bucket_detail = [];

  this.more = {};
};

module.exports = StockBucket;
