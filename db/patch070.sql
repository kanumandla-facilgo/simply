ALTER TABLE `delivery_notes` 
ADD COLUMN `accounting_voucher_date` datetime NULL AFTER `sync_failure_reason`;

update delivery_notes
set accounting_voucher_date = note_date;


update delivery_notes
set accounting_voucher_date = note_date
where companies_id = 10003;