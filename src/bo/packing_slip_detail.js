
var PackingSlipDetail = function () {

	this.id 		       = "";
	this.order_id	       = "";
	this.packing_slip_id   = "";
	this.order_detail_id   = "";
	this.product_id        = "";
	this.sku               = "";
	this.name		       = "";
	this.stock_bucket_id   = "";
    this.stock_bucket_code = "";
	this.packed_qty_quote  = "";
	this.packed_qty_qty	   = "";
	this.created	       = "";
	this.last_updated      = "";
	this.uom_name          = "";
	this.entered_uom_name  = "";
	this.piece_count       = 0;
	this.notes             = "";
	this.stock_bucket      = undefined;
	this.sub_total         = 0;
	this.tax_total         = 0;
	this.ship_total        = 0;
	this.discount_total    = 0;

};

module.exports = PackingSlipDetail;
