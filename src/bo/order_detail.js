
var OrderDetail = function () {
	this.id 		 = "";
	this.orders_id	 = "";
	this.products_id = "";
	this.sku         = "";
	this.name		 = "";
	this.order_quantity	 = "";
	this.unit_price	 = "";
	this.order_price = "";
	this.unit_of_measures_id	= "";
	this.tax		 = "";
	this.tax_percent = "";
	this.is_taxable  = ""; //this should not be ideally needed as we have tax and tax_percent both.
	this.shipping	 = "";
	this.discount	 = "";
	this.extension	 = "";
	this.created	 = "";
	this.last_updated= "";
	this.entered_unit_of_measures_id = "";
	this.entered_quantity ="";
	this.notes = "";
	this.uom_name = "";
	this.entered_uom_name = "";
	this.packed_qty_qty = 0;
	this.packed_qty_quote = 0;
	this.is_batched_inventory = 0;
	this.is_complete  = 0;
	this.packingslip_lineitems = [];
	
	this.stock_unit_of_measures_id = "";
	this.stock_alt_unit_of_measures_id = "";

	this.stock_quantity = "";
	this.stock_alt_quantity = "";

	this.stock_alt_uom_name = ""
	this.stock_alt_uom_short_name = "";
	this.stock_uom_name = "";
	this.stock_uom_short_name = "";
	
	this.hsn      = undefined;

	this.qty_unit_multiplier = 0;

 };

module.exports = OrderDetail;
