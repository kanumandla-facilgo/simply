var Bill = function () {
  this.id              = "";
  this.customer        = {};
  this.bill_date       = "";
  this.due_date        = "";
  this.bill_number     = "";
  this.bill_ref_number = "";
  this.bill_amount = "";
  this.balance_amount = "";
  this.paid_amount = "";
  this.paid_date = "";
};

module.exports = Bill;
