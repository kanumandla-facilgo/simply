var Agent = function () {
  this.id              = "";
  this.name            = "";
  this.code            = "";
  this.accounting_name = "";
  this.status_id       = "";
  this.address         = undefined;
  this.sales_person    = undefined;
  this.user            = undefined;
  this.custom_type_id  = "";
  this.sync_status_id  = "";
  this.current_balance = 0;
  this.current_overdue = 0;
  this.allowed_balance = 0;
  this.created         = "";
  this.last_updated    = "";
  this.update_counter  = 0;
  this.notes           = "";
  this.pan_number      = "";
  this.more            = {};
};

module.exports = Agent;
