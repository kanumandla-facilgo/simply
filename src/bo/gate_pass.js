
var GatePass = function () {

	this.id 		         = "";
	this.gate_pass_number	 = "";
	this.gate_pass_date 	 = new Date();	
	this.contact_name        = "";
	this.vehicle_number       = "";
	this.charges             = 0;
	this.notes				 = "";
	this.gate_pass_details   = [];

};

module.exports = GatePass;
