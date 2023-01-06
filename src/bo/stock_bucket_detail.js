var UOM   = require("../bo/uom");

var StockBucketDetail = function () {

  this.id                = "";
  this.description       = "";
  this.qty          = "";
  this.index   = 0;
  this.piece_count       = 0;
  this.uom               = new UOM();
};

module.exports = StockBucketDetail;
