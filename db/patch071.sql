ALTER TABLE delivery_notes
ADD COLUMN material_out_invoice_flag tinyint NULL AFTER proforma_invoice_flag;