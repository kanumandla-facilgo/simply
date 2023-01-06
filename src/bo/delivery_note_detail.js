
var DeliveryNoteDetail = function () {

	this.id 		         = "";
	this.delivery_note_id    = "";
    this.packing_slip_detail_id = "";
    this.sub_total           = 0;
    this.tax_total           = 0;
    this.ship_total          = 0;
    this.discount_total      = 0;
};

module.exports = DeliveryNoteDetail;
