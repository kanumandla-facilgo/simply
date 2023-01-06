ALTER TABLE `companies` 
ADD COLUMN `pan_number` VARCHAR(24) NULL AFTER `notes`,
ADD COLUMN `cst_number` VARCHAR(24) NULL AFTER `pan_number`,
ADD COLUMN `vat_number` VARCHAR(24) NULL AFTER `cst_number`,
ADD COLUMN `excise_number` VARCHAR(24) NULL AFTER `vat_number`;
