ALTER TABLE `packing_slip_details` 
ADD COLUMN `piece_count` INT NOT NULL DEFAULT 0 AFTER `tax_total`;

