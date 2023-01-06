
insert into sysconfigurations values (25304, 'module_direct_invoice', 'Module Direct Invoice', '1,0', '1', 6001, 0, 1, 1, now(), now());

-- add configuration for existing companies
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select Case WHEN c1.syssubscriptiontemplates_id = 6302 THEN 0 ELSE 1 END, c1.id, c.id, now(), now()
from companies c1, sysconfigurations c
where c1.syscompanytypes_id = 4701
AND c.id IN (25304); 

ALTER TABLE `delivery_notes` 
ADD COLUMN `direct_invoice_flag` TINYINT(1) NOT NULL DEFAULT 0 AFTER `exportform_flag`;

UPDATE delivery_notes SET direct_invoice_flag = 0;

ALTER TABLE `delivery_note_details` 
DROP FOREIGN KEY `fk_delivery_note_details_packing_slip_details1`,
DROP FOREIGN KEY `fk_delivery_note_details_packing_slips1`;

ALTER TABLE `delivery_note_details` 
ADD COLUMN `products_id` INT NULL AFTER `packing_slip_details_id`,
ADD COLUMN `stock_buckets_id` INT NULL AFTER `products_id`,
ADD COLUMN `sku` VARCHAR(32) NULL AFTER `stock_buckets_id`,
ADD COLUMN `name` VARCHAR(256) NULL AFTER `sku`,
ADD COLUMN `unit_of_measures_id` INT NULL AFTER `name`,
ADD COLUMN `quantity_ordered_packed` DECIMAL(10,4) NULL AFTER `unit_of_measures_id`,
ADD COLUMN `entered_unit_of_measures_id` INT NULL AFTER `quantity_ordered_packed`,
ADD COLUMN `quantity_entered_packed` DECIMAL(10,4) NULL AFTER `entered_unit_of_measures_id`,
ADD COLUMN `price` DECIMAL(8,2) NULL AFTER `quantity_entered_packed`,
CHANGE COLUMN `packing_slips_id` `packing_slips_id` INT NULL ,
CHANGE COLUMN `packing_slip_details_id` `packing_slip_details_id` INT NULL ,
ADD INDEX `fk_delivery_note_details_products1_idx` (`products_id` ASC),
ADD INDEX `fk_delivery_note_details_stock_buckets1_idx` (`stock_buckets_id` ASC),
ADD INDEX `fk_delivery_note_details_unit_of_measures1_idx` (`unit_of_measures_id` ASC),
ADD INDEX `fk_delivery_note_details_unit_of_measures2_idx` (`entered_unit_of_measures_id` ASC);

ALTER TABLE `delivery_note_details` 
ADD CONSTRAINT `fk_delivery_note_details_packing_slip_details1`
  FOREIGN KEY (`packing_slip_details_id`)
  REFERENCES `packing_slip_details` (`id`),
ADD CONSTRAINT `fk_delivery_note_details_packing_slips1`
  FOREIGN KEY (`packing_slips_id`)
  REFERENCES `packing_slips` (`id`),
ADD CONSTRAINT `fk_delivery_note_details_products1`
  FOREIGN KEY (`products_id`)
  REFERENCES `products` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_delivery_note_details_stock_buckets1`
  FOREIGN KEY (`stock_buckets_id`)
  REFERENCES `stock_buckets` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_delivery_note_details_unit_of_measures1`
  FOREIGN KEY (`unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_delivery_note_details_unit_of_measures2`
  FOREIGN KEY (`entered_unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `stock_journal` 
ADD COLUMN `delivery_notes_id` INT NULL AFTER `sysjournalentrytype_id`,
ADD COLUMN `delivery_note_details_id` INT NULL AFTER `orders_id`,
ADD COLUMN `packing_slip_details_id` INT NULL AFTER `delivery_note_details_id`,
ADD COLUMN `order_details_id` INT NULL AFTER `packing_slip_details_id`;

ALTER TABLE `stock_journal` 
ADD INDEX `fk_stock_journal_order_details1_idx` (`order_details_id` ASC),
ADD INDEX `fk_stock_journal_delivery_note_details1_idx` (`delivery_note_details_id` ASC),
ADD INDEX `fk_stock_journal_packing_slip_details1_idx` (`packing_slip_details_id` ASC),
ADD INDEX `fk_stock_journal_delivery_notes1_idx` (`delivery_notes_id` ASC);

ALTER TABLE `stock_journal` 
ADD CONSTRAINT `fk_stock_journal_delivery_notes1`
  FOREIGN KEY (`delivery_notes_id`)
  REFERENCES `delivery_notes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_stock_journal_order_details1`
  FOREIGN KEY (`order_details_id`)
  REFERENCES `order_details` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_stock_journal_packing_slip_details1`
  FOREIGN KEY (`packing_slip_details_id`)
  REFERENCES `packing_slip_details` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_stock_journal_delivery_note_details1`
  FOREIGN KEY (`delivery_note_details_id`)
  REFERENCES `delivery_note_details` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

UPDATE delivery_note_details d
INNER JOIN packing_slip_details pd ON pd.id = d.packing_slip_details_id
INNER JOIN order_details od ON od.id = pd.order_details_id
INNER JOIN products p ON p.id = od.products_id
SET d.products_id = pd.products_id, 
	d.stock_buckets_id = pd.stock_buckets_id,
	d.sku = p.sku,
	d.name = p.name,
	d.unit_of_measures_id = pd.unit_of_measures_id,
	d.entered_unit_of_measures_id = pd.entered_unit_of_measures_id,
	d.quantity_ordered_packed = pd.quantity_ordered_packed,
	d.quantity_entered_packed = pd.quantity_entered_packed,
	d.price = od.unit_price;

ALTER TABLE `delivery_note_details` 
DROP FOREIGN KEY `fk_delivery_note_details_products1`,
DROP FOREIGN KEY `fk_delivery_note_details_stock_buckets1`,
DROP FOREIGN KEY `fk_delivery_note_details_unit_of_measures1`,
DROP FOREIGN KEY `fk_delivery_note_details_unit_of_measures2`;
ALTER TABLE `delivery_note_details` 
CHANGE COLUMN `products_id` `products_id` INT NOT NULL ,
CHANGE COLUMN `stock_buckets_id` `stock_buckets_id` INT NOT NULL ,
CHANGE COLUMN `sku` `sku` VARCHAR(32) NOT NULL ,
CHANGE COLUMN `name` `name` VARCHAR(256) NOT NULL ,
CHANGE COLUMN `unit_of_measures_id` `unit_of_measures_id` INT NOT NULL ,
CHANGE COLUMN `quantity_ordered_packed` `quantity_ordered_packed` DECIMAL(10,4) NOT NULL ,
CHANGE COLUMN `entered_unit_of_measures_id` `entered_unit_of_measures_id` INT NOT NULL ,
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

ALTER TABLE `transporters` 
ADD COLUMN `is_system` TINYINT(1) NOT NULL DEFAULT 0 AFTER `sysstatuses_id`;

ALTER TABLE `companies` 
ADD COLUMN `is_system_agent_id` TINYINT(1) NOT NULL DEFAULT 0 AFTER `invoicing_name`;

UPDATE companies
SET    is_system_agent_id = 1, 
       last_updated       = NOW()
WHERE  companies.id       IN (13921, 12123);

UPDATE transporters
SET    is_system    = 1, 
       last_updated = NOW()
WHERE  transporters.id in (409, 271);

UPDATE transporters SET is_system = 1 WHERE code = 'DIRECT' and companies_id NOT IN (10003);

UPDATE companies SET is_system_agent_id = 1 WHERE syscompanytypes_id = 4703 AND description = 'Direct' and code = 'DIRECT';

-- todo: update stock journal SP
-- todo: find where is tax split as delivery note details have tax fields
-- todo: 
