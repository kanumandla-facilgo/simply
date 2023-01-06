ALTER TABLE delivery_notes CHANGE eway_bill_info einvoice_info json;

ALTER TABLE delivery_notes
DROP COLUMN eway_bill_number;

ALTER TABLE delivery_notes
DROP COLUMN eway_bill_date;