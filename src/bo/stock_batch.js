var UOM   = require("../bo/uom");

var StockBatch = function () {
  this.id                = "";
  this.index             = "";
  this.description       = "";
  this.uom               = initUOM();
  this.piece_count       = 0;
  this.qty               = 0;
  this.batch_list        = [];
};

module.exports = StockBatch;
