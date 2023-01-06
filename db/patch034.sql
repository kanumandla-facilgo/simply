ALTER TABLE `delivery_notes` 
ADD COLUMN `destination` VARCHAR(32) NULL AFTER `eway_bill_date`;

UPDATE delivery_notes
INNER JOIN companies ON companies.id = delivery_notes.customers_id
INNER JOIN addresses ON addresses.id = companies.ship_addresses_id
SET delivery_notes.destination = addresses.city;

ALTER TABLE `delivery_notes` 
CHANGE COLUMN `destination` `destination` VARCHAR(32) NOT NULL ;