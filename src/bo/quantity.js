var Quantity = function () {
  this.onorder     = 0;
  this.reorder     = 0;
  this.stock_qty   = 0;
  this.stock_quote = 0;
  this.packageqty  = 0;
  this.stock_in_process_qty = 0;
  this.stock_in_process_quote = 0;
};
/*
Quantity.prototype.onorder = function(onorder) {
 this.onorder = onorder;
}

Quantity.prototype.reorder = function(reorder) {
 this.reorder = reorder;
}

Quantity.prototype.stock = function(stock) {
 this.stock = stock;
}

Quantity.prototype.packageqty = function(packageqty) {
 this.packageqty = packageqty;
}
*/
module.exports = Quantity;
