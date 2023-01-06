var UOM   = require("../bo/uom");
var USER   = require("../bo/user");
var CUSTOMER   = require("../bo/customer");

var StockJournal = function () {

  this.id                    = "";
  this.description           = "";
  this.stock_bucket_code     = "";
  this.user_id               = "";
  this.packing_slip_id       = "";
  this.packing_slip_number   = "";
  this.product_id            = "";
  this.order_id              = "";
  this.stock_qty             = 0;
  this.stock_quote           = 0;
  this.uom_qty           = new UOM();
  this.uom_quote         = new UOM();
  this.user              = new USER();
  this.customer          = new CUSTOMER();
  this.created        = "";
  this.last_updated   = "";
  this.update_counter = 0;
  this.stock_bucket = undefined;
};
module.exports = StockJournal;
