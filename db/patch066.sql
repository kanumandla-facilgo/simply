ALTER TABLE `addresses` 
ADD COLUMN `name` VARCHAR(128) NULL AFTER `last_name`;

ALTER TABLE `delivery_notes` 
ADD COLUMN `ship_addresses_id` INT NULL AFTER `gate_pass_info`;

UPDATE delivery_notes
INNER JOIN companies ON companies.id = delivery_notes.customers_id
SET delivery_notes.ship_addresses_id = companies.ship_addresses_id;

ALTER TABLE `delivery_notes` 
CHANGE COLUMN `ship_addresses_id` `ship_addresses_id` INT(11) NOT NULL ;

UPDATE addresses SET name = CONCAT(TRIM(first_name), ' ', TRIM(last_name)) WHERE (first_name IS NOT NULL AND TRIM(first_name) <> '');

UPDATE addresses SET name = TRIM(name);

UPDATE delivery_note_details
INNER JOIN packing_slip_details d ON d.id = delivery_note_details.packing_slip_details_id
INNER JOIN order_details od ON d.order_details_id = od.id
INNER JOIN products p ON p.id = d.products_id
SET delivery_note_details.products_id = d.products_id,
    delivery_note_details.stock_buckets_id = d.stock_buckets_id,
    delivery_note_details.sku = p.sku,
    delivery_note_details.name = od.name,
    delivery_note_details.unit_of_measures_id = d.unit_of_measures_id,
    delivery_note_details.quantity_ordered_packed = d.quantity_ordered_packed,
    delivery_note_details.entered_unit_of_measures_id = d.entered_unit_of_measures_id,
    delivery_note_details.quantity_entered_packed = d.quantity_entered_packed,
    delivery_note_details.price = od.order_price;

ALTER TABLE `delivery_note_details` 
DROP FOREIGN KEY `fk_delivery_note_details_products1`,
DROP FOREIGN KEY `fk_delivery_note_details_stock_buckets1`,
DROP FOREIGN KEY `fk_delivery_note_details_unit_of_measures1`,
DROP FOREIGN KEY `fk_delivery_note_details_unit_of_measures2`;

ALTER TABLE `delivery_note_details` 
CHANGE COLUMN `products_id` `products_id` INT(11) NOT NULL ,
CHANGE COLUMN `stock_buckets_id` `stock_buckets_id` INT(11) NOT NULL ,
CHANGE COLUMN `sku` `sku` VARCHAR(32) NOT NULL ,
CHANGE COLUMN `name` `name` VARCHAR(256) NOT NULL ,
CHANGE COLUMN `unit_of_measures_id` `unit_of_measures_id` INT(11) NOT NULL ,
CHANGE COLUMN `quantity_ordered_packed` `quantity_ordered_packed` DECIMAL(10,4) NOT NULL ,
CHANGE COLUMN `entered_unit_of_measures_id` `entered_unit_of_measures_id` INT(11) NOT NULL ,
CHANGE COLUMN `quantity_entered_packed` `quantity_entered_packed` DECIMAL(10,4) NOT NULL ,
CHANGE COLUMN `price` `price` DECIMAL(8,2) NOT NULL ;

ALTER TABLE `delivery_note_details` 
ADD CONSTRAINT `fk_delivery_note_details_products1`
  FOREIGN KEY (`products_id`)
  REFERENCES `products` (`id`),
ADD CONSTRAINT `fk_delivery_note_details_stock_buckets1`
  FOREIGN KEY (`stock_buckets_id`)
  REFERENCES `stock_buckets` (`id`),
ADD CONSTRAINT `fk_delivery_note_details_unit_of_measures1`
  FOREIGN KEY (`unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`),
ADD CONSTRAINT `fk_delivery_note_details_unit_of_measures2`
  FOREIGN KEY (`entered_unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`);

UPDATE addresses SET name = null;
