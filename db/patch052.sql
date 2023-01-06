alter table pending_bills modify paid_amount Decimal(10,2);

update pending_bills
set syspaymentstatuses_id = 5801
where (bill_amount - balance_amount) <= 0;
