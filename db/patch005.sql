ALTER TABLE `companies` 
ADD COLUMN `taxform_flag` TINYINT(1) NOT NULL DEFAULT 0 AFTER `excise_number`;

drop table tax_slabs;

-- -----------------------------------------------------
-- Table `tax_slabs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tax_slabs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `percent` DECIMAL(8,4) NOT NULL,
  `alt_percent` DECIMAL(8,4) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `companies_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tax_slabs_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10000;

CREATE INDEX `fk_tax_slabs_companies1_idx` ON `tax_slabs` (`companies_id` ASC);

INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
VALUES ('0%', 0, 0, 1, 10001, now(), now());

INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
VALUES ('15%', 15, 2, 0, 10001, now(), now());

INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
VALUES ('0%', 0, 0, 1, 10003, now(), now());

INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
VALUES ('5%', 5, 2, 0, 10003, now(), now());

INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
VALUES ('15%', 15, 2, 0, 10003, now(), now());

ALTER TABLE `products` 
ADD COLUMN `tax_slabs_id` INT NOT NULL AFTER `is_batched_inventory`;

update products 
INNER JOIN tax_slabs ON products.companies_id = tax_slabs.companies_id AND tax_slabs.is_default = 1
set products.tax_slabs_id   = tax_slabs.id;

ALTER TABLE `products` 
ADD CONSTRAINT `fk_products_tax_slabs1`
  FOREIGN KEY (`tax_slabs_id`)
  REFERENCES `tax_slabs` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `products` 
ADD INDEX `fk_products_tax_slabs1_idx` (`tax_slabs_id` ASC);

ALTER TABLE `products` 
ADD COLUMN `is_hidden_no_stock` TINYINT(1) NOT NULL DEFAULT 1 AFTER `is_hidden`;

ALTER TABLE `delivery_notes` 
ADD COLUMN `sub_total` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `cancelusers_id`,
ADD COLUMN `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `sub_total`,
ADD COLUMN `tax_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `ship_total`,
ADD COLUMN `orders_id_string` VARCHAR(128) NULL AFTER `tax_total`,
ADD COLUMN `notes` VARCHAR(128) NULL AFTER `orders_id_string`,
ADD COLUMN `taxform_flag` TINYINT(1) NOT NULL DEFAULT 0 AFTER `notes`,
ADD COLUMN `exportform_flag` TINYINT(1) NOT NULL DEFAULT 0 AFTER `taxform_flag`;

ALTER TABLE `packing_slips` 
ADD COLUMN `sub_total` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `cancelusers_id`,
ADD COLUMN `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `sub_total`,
ADD COLUMN `tax_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `ship_total`;

ALTER TABLE `packing_slip_details` 
ADD COLUMN `sub_total` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `quantity_entered_packed`,
ADD COLUMN `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `sub_total`,
ADD COLUMN `tax_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `ship_total`;

-- migration script
UPDATE packing_slip_details pd
INNER JOIN order_details d ON d.id = pd.order_details_id 
SET   pd.sub_total  = ROUND( (d.extension * pd.quantity_ordered_packed/d.order_quantity), 2),
	  pd.tax_total  = ROUND( (d.tax * pd.quantity_ordered_packed/d.order_quantity), 2),
	  pd.ship_total = ROUND( (d.shipping * pd.quantity_ordered_packed/d.order_quantity), 2);

UPDATE packing_slips
INNER JOIN (
  SELECT pd.packing_slips_id, SUM(sub_total) as sub_total, SUM(tax_total) as tax_total, SUM(ship_total) as ship_total
  FROM packing_slip_details pd GROUP BY pd.packing_slips_id) pd
ON pd.packing_slips_id = packing_slips.id   
SET   packing_slips.sub_total  = pd.sub_total,
	  packing_slips.tax_total  = pd.tax_total,
	  packing_slips.ship_total = pd.ship_total;

UPDATE delivery_notes
INNER JOIN (
  SELECT d.delivery_notes_id, SUM(pd.sub_total) as sub_total, SUM(pd.tax_total) as tax_total, SUM(pd.ship_total) as ship_total
  FROM packing_slips pd, delivery_note_details d WHERE d.packing_slips_id = pd.id GROUP BY d.delivery_notes_id) pd
ON pd.delivery_notes_id = delivery_notes.id   
SET   delivery_notes.sub_total  = pd.sub_total,
	  delivery_notes.tax_total  = pd.tax_total,
	  delivery_notes.ship_total = pd.ship_total;

UPDATE delivery_notes n
INNER JOIN (
	SELECT d.delivery_notes_id, GROUP_CONCAT(distinct p.orders_id) order_ids
	FROM delivery_note_details d
	INNER JOIN packing_slips p ON d.packing_slips_id = p.id
	GROUP BY d.delivery_notes_id) d ON d.delivery_notes_id = n.id
SET n.orders_id_string = d.order_ids;

UPDATE delivery_notes SET orders_id_string = REPLACE(orders_id_string, ',', ', ');

ALTER TABLE `delivery_note_details` 
ADD COLUMN `packing_slip_details_id` INT NULL AFTER `packing_slips_id`,
ADD COLUMN `sub_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `packing_slip_details_id`,
ADD COLUMN `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `sub_total`,
ADD COLUMN `tax_total` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `ship_total`,
ADD INDEX `fk_delivery_note_details_packing_slip_details1_idx` (`packing_slip_details_id` ASC);

ALTER TABLE `delivery_note_details` 
ADD CONSTRAINT `fk_delivery_note_details_packing_slip_details1`
  FOREIGN KEY (`packing_slip_details_id`)
  REFERENCES `packing_slip_details` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

INSERT INTO delivery_note_details (delivery_notes_id, packing_slips_id, packing_slip_details_id, sub_total, ship_total, tax_total, created, last_updated)
SELECT d.delivery_notes_id, d.packing_slips_id, p.id, p.sub_total, p.ship_total, p.tax_total, d.created, d.last_updated
FROM packing_slip_details p, delivery_note_details d
WHERE d.packing_slips_id = p.packing_slips_id;

DELETE FROM delivery_note_details WHERE packing_slip_details_id IS NULL;


ALTER TABLE `delivery_note_details` 
DROP FOREIGN KEY `fk_delivery_note_details_packing_slip_details1`;

ALTER TABLE `delivery_note_details` 
CHANGE COLUMN `packing_slip_details_id` `packing_slip_details_id` INT(11) NOT NULL ;

ALTER TABLE `delivery_note_details` 
ADD CONSTRAINT `fk_delivery_note_details_packing_slip_details1`
  FOREIGN KEY (`packing_slip_details_id`)
  REFERENCES `packing_slip_details` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
UPDATE packing_slips p
INNER JOIN delivery_note_details d ON d.packing_slips_id = p.id
INNER JOIN delivery_notes n ON n.id = d.delivery_notes_id AND n.sysdeliverynotestatuses_id = 5502
SET p.syspackingslipstatuses_id = 5202
WHERE p.syspackingslipstatuses_id = 5201;

UPDATE addresses
SET phone1 = null
WHERE phone1 in ('123456789', '1234567890', '9999999999', '123456','.', '76','0000000000');

UPDATE addresses
SET email1 = null
WHERE email1 in ('a@b.com', 'a.b@c.com', 'ab.@gmail.com', 'a@abc.com','abc@gmail.com');


-- create a tax slab UI
-- update create/edit product interface to allow selecting tax slab
-- create, update, retrieve API changes to save tax slab
-- bo, mapping changes

-- tax calculation while creating order [DONE]
-- tax calculation while creating delivery note [DONE]

-- hide_if_unavailable_flag 
-- update create/edit product interface to allow setting this flag
-- create, update, retrieve API changes to save tax slab
-- bo, mapping changes
-- when stock is created, set this flag on product if not set

-- customer edit/create screen to allow selecting cform checkbox [DONE]
-- create, update, retrieve API of customer [DONE]
-- bo, mapping changes [DONE]


-- order ID string in delivery notes table [DONE]
-- update delivery notes view screen to show order ID
-- retrieve API changes
-- bo, mapping changes

-- insert into sysconfigurations values (1001, 'COMPANY_LOGO', '', '', 'logo_orbit.jpg', 
-- logo, address, hide_if_unavailable_set_upon_inventory (this is for Riteshbhai's logic to set this flag when first inventory is created), bank name, bank account number, ISFC code

