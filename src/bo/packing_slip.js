
var PackingSlip = function () {

	this.id 		         = "";
	this.slip_number         = "";
	this.packing_date        = "";
	this.customer_id         = "";
	this.customer_name       = "";
	this.order_id            = "";
	this.user_id             = "";
	this.user_name           = "";
	this.net_weight          = 0;
	this.gross_weight        = 0;
	this.sub_total           = 0;
	this.tax_total           = 0;
	this.ship_total          = 0;
	this.discount_total      = 0;
	this.invoice_id          = "";
	this.status_id           = "";
	this.status_name         = "";
	this.delivery_note_id    = "";
	this.note_number         = "";  
	this.created	         = "";
	this.last_updated        = "";
	this.order               = undefined;
	this.gate_pass 			 = undefined;
	this.lineitems           = [];

};

module.exports = PackingSlip;

