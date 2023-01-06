update delivery_notes
set syssyncstatuses_id = 4101;

ALTER TABLE `delivery_notes` 
ADD COLUMN `sync_failure_reason` INT NULL AFTER `syssyncstatuses_id`;

ALTER TABLE `delivery_notes` 
ADD COLUMN `destination_distance` INT NULL AFTER `destination`;

UPDATE addresses
INNER JOIN companies c ON c.ship_addresses_id = addresses.id
SET addresses.name = c.name
WHERE addresses.name IS NULL OR addresses.name = '';

ALTER TABLE delivery_notes
ADD COLUMN proforma_invoice_flag tinyint NULL AFTER direct_invoice_flag;

update configurations
set value = 0
where sysconfigurations_id = 25304 and companies_id = 10003;
