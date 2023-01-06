INSERT INTO sysproducthsn_details (sysproducthsn_id, amount_min, amount_max, tax_percent_gst, tax_percent_cgst, tax_percent_igst, tax_percent_sgst, tax_percent_cess, activation_start_date, activation_end_date, created, last_updated) values (6003, 1000.01, null, 12, 6, 12, 6, 0, '2018-01-01', NULL, now(), now());

UPDATE sysproducthsn_details set amount_max = 1000, last_updated = NOW() WHERE id = 1003;

ALTER TABLE `delivery_notes` 
ADD COLUMN `eway_bill_number` VARCHAR(32) NULL AFTER `exportform_flag`,
ADD COLUMN `eway_bill_date` DATETIME NULL AFTER `eway_bill_number`;
