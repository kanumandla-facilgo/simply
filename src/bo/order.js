
var Order = function () {
  this.id = "";
  this.customers_id = "";
  this.companies_id = "";
  this.order_date = "";
  this.sub_total = 0;
  this.ship_total = 0;
  this.tax_total = 0;
  this.grand_total = 0;
  this.discount_total = 0;
  this.discount_perc = 0;
  this.sysorderstatuses_id = "";
  this.status_name = "";
  this.sysworkflowstatuses_id = "";
  this.orderusers_id = "";
  this.ship_addresses_id = "";
  this.bill_addresses_id = "";
  this.approverusers_id = "";
  this.syssyncstatus_id = "";
  this.order_number = "";
  this.customer_order_number = "";
  this.payment_terms_id = "";
  this.payment_due_date = "";
  this.paid_total = 0;
  this.salespersons_id = "";
  this.item_count = 	0;
  this.created = "";
  this.last_updated = "";
  this.pending_approval_rolesid   = "";
  this.transporters_id   = "";
  this.notes ="";
  this.internal_notes ="";
  this.agent_notes ="";
  this.workflow_reason_string = "";
  this.payment_term_name = "";
  this.delivery_status_id = "";
  this.delivery_status_name = "";
  
  this.lineitems		= [];// new OrderDetails();
  this.packing_slips    = [];
  this.customer = undefined;
  this.order_by = undefined;
  this.transporter = undefined;
//  this.packingslip_lineitems = [];
};

module.exports = Order;
