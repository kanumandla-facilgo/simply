UPDATE configurations SET value = '4.8' WHERE sysconfigurations_id = 7000 and companies_id = 1;

ALTER TABLE `packing_slips` 
CHANGE COLUMN `weight` `net_weight` DECIMAL(10,2) NULL DEFAULT NULL ,
ADD COLUMN `gross_weight` DECIMAL(10,2) NULL AFTER `net_weight`;
