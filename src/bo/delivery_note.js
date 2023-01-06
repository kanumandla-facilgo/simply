
var DeliveryNote = function () {

	this.id 		         = "";
	this.note_number         = "";
	this.note_date           = "";
	this.user                = undefined;
	this.customer            = undefined;
	this.status_id           = "";
	this.status_name         = "";
	this.transporter         = undefined;
	this.lr_number           = "";
	this.lr_date             = "";
	this.invoice_number      = "";
	this.orders_id_string    = "";
	this.po_string           = "";
	this.sub_total           = 0;
	this.tax_total           = 0;
	this.ship_total          = 0;
	this.discount_total      = 0;
	this.rounding_total      = 0;
	this.notes               = "";
    this.taxform_flag        = 0;
    this.exportform_flag     = 0;
    this.proforma_invoice_flag = 0;
    this.bale_count			 = 0;
	this.created	         = "";
	this.last_updated        = "";
	this.packingsliplist     = [];
	this.einvoice_info           = {};
	this.destination         = "";
	this.gate_pass_info	     = [];
	this.lineitems 			 = [];
	this.ship_address        = {};
	this.sync_status_id      = "";
	this.sync_failure_reason = "";
};

module.exports = DeliveryNote;
