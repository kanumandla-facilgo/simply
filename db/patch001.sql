ALTER TABLE `products` CHANGE COLUMN `package_qty` `package_qty` DECIMAL(12,4) NOT NULL  , CHANGE COLUMN `units_in_stock` `stock_qty` DECIMAL(12,4) NOT NULL DEFAULT 0 , CHANGE COLUMN `units_on_order` `units_on_order` DECIMAL(12,4) NULL DEFAULT NULL  , CHANGE COLUMN `reorder_level` `reorder_level` DECIMAL(12,4) NULL DEFAULT NULL  , CHANGE COLUMN `reorder_qty` `reorder_qty` DECIMAL(12,4) NULL DEFAULT NULL  ;

ALTER TABLE `products` ADD COLUMN `stock_quote` DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER `unit_price` ;

ALTER TABLE `products` ADD COLUMN `is_batched_inventory` TINYINT(1) NOT NULL DEFAULT 0  AFTER `category_count` ;

ALTER TABLE `unit_conversions` ADD COLUMN `is_batched_inventory` TINYINT(1) NOT NULL DEFAULT 0  AFTER `to_qty` ;

ALTER TABLE `order_details` CHANGE COLUMN `lastmodified` `last_updated` DATETIME NOT NULL;

ALTER TABLE `products` 
ADD COLUMN `stock_in_process_quote` DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER `stock_qty`,
ADD COLUMN `stock_in_process_qty` DECIMAL(12,4) NOT NULL DEFAULT 0 AFTER `stock_in_process_quote`;

UPDATE products SET stock_qty = 0, stock_quote = 0;
show warnings;

ALTER TABLE `unit_of_measures` 
ADD COLUMN `end_uom_id` INT NULL AFTER `master_id`,
ADD INDEX `fk_unit_of_measures_unit_of_measures3_idx` (`end_uom_id` ASC);
ALTER TABLE `unit_of_measures` 
ADD CONSTRAINT `fk_unit_of_measures_unit_of_measures3`
  FOREIGN KEY (`end_uom_id`)
  REFERENCES `unit_of_measures` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


-- -----------------------------------------------------
-- Table `syspackingslipstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syspackingslipstatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(256) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysinvoicestatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysinvoicestatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(256) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `invoices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `invoice_date` DATETIME NOT NULL,
  `sysinvoicestatuses_id` INT NOT NULL,
  `transporters_id` INT NOT NULL,
  `transporter_receipt_number` VARCHAR(32) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_invoices_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_invoices_sysinvoicestatuses1`
    FOREIGN KEY (`sysinvoicestatuses_id`)
    REFERENCES `sysinvoicestatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_invoices_transporters1`
    FOREIGN KEY (`transporters_id`)
    REFERENCES `transporters` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_invoices_companies1_idx` ON `invoices` (`companies_id` ASC);

CREATE INDEX `fk_invoices_sysinvoicestatuses1_idx` ON `invoices` (`sysinvoicestatuses_id` ASC);

CREATE INDEX `fk_invoices_transporters1_idx` ON `invoices` (`transporters_id` ASC);


-- -----------------------------------------------------
-- Table `packing_slips`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `packing_slips` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `packing_slip_number` VARCHAR(16) NOT NULL,
  `packing_date` DATETIME NOT NULL,
  `syspackingslipstatuses_id` INT NOT NULL,
  `companies_id` INT NOT NULL,
  `orders_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  `invoices_id` INT NULL,
  `weight` DECIMAL(10,2) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_packing_slips_orders2`
    FOREIGN KEY (`orders_id`)
    REFERENCES `orders` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_syspackingslipstatuses1`
    FOREIGN KEY (`syspackingslipstatuses_id`)
    REFERENCES `syspackingslipstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_invoices1`
    FOREIGN KEY (`invoices_id`)
    REFERENCES `invoices` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_packing_slips_orders2_idx` ON `packing_slips` (`orders_id` ASC);

CREATE INDEX `fk_packing_slips_users1_idx` ON `packing_slips` (`users_id` ASC);

CREATE INDEX `fk_packing_slips_syspackingslipstatuses1_idx` ON `packing_slips` (`syspackingslipstatuses_id` ASC);

CREATE INDEX `fk_packing_slips_companies1_idx` ON `packing_slips` (`companies_id` ASC);

CREATE INDEX `fk_packing_slips_invoices1_idx` ON `packing_slips` (`invoices_id` ASC);


-- -----------------------------------------------------
-- Table `stock_buckets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_buckets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(32) NOT NULL,
  `description` VARCHAR(64) NULL,
  `companies_id` INT NOT NULL,
  `products_id` INT NOT NULL,
  `is_system` TINYINT(1) NOT NULL DEFAULT 0,
  `entered_unit_of_measures_id` INT NOT NULL,
  `quantity_entered` DECIMAL(12,4) NOT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `quantity_ordered` DECIMAL(12,4) NOT NULL,
  `users_id` INT NOT NULL,
  `sysstatuses_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_stock_header_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_header_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_header_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_header_unit_of_measures2`
    FOREIGN KEY (`entered_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_buckets_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_buckets_sysstatuses1`
    FOREIGN KEY (`sysstatuses_id`)
    REFERENCES `sysstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10001;

CREATE INDEX `fk_stock_header_products1_idx` ON `stock_buckets` (`products_id` ASC);

CREATE INDEX `fk_stock_header_companies1_idx` ON `stock_buckets` (`companies_id` ASC);

CREATE INDEX `fk_stock_header_unit_of_measures1_idx` ON `stock_buckets` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_stock_header_unit_of_measures2_idx` ON `stock_buckets` (`entered_unit_of_measures_id` ASC);

CREATE INDEX `fk_stock_buckets_users1_idx` ON `stock_buckets` (`users_id` ASC);

CREATE INDEX `fk_stock_buckets_sysstatuses1_idx` ON `stock_buckets` (`sysstatuses_id` ASC);


-- -----------------------------------------------------
-- Table `packing_slip_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `packing_slip_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `packing_slips_id` INT NOT NULL,
  `orders_id` INT NOT NULL,
  `order_details_id` INT NOT NULL,
  `products_id` INT NOT NULL,
  `stock_buckets_id` INT NOT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `quantity_ordered_packed` DECIMAL(10,4) NOT NULL,
  `entered_unit_of_measures_id` INT NOT NULL,
  `quantity_entered_packed` DECIMAL(10,4) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_packing_slips_orders1`
    FOREIGN KEY (`orders_id`)
    REFERENCES `orders` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_unit_of_measures2`
    FOREIGN KEY (`entered_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slip_details_packing_slips1`
    FOREIGN KEY (`packing_slips_id`)
    REFERENCES `packing_slips` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slip_details_order_details1`
    FOREIGN KEY (`order_details_id`)
    REFERENCES `order_details` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slip_details_stock_buckets1`
    FOREIGN KEY (`stock_buckets_id`)
    REFERENCES `stock_buckets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_packing_slips_orders1_idx` ON `packing_slip_details` (`orders_id` ASC);

CREATE INDEX `fk_packing_slips_products1_idx` ON `packing_slip_details` (`products_id` ASC);

CREATE INDEX `fk_packing_slips_unit_of_measures1_idx` ON `packing_slip_details` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_packing_slips_unit_of_measures2_idx` ON `packing_slip_details` (`entered_unit_of_measures_id` ASC);

CREATE INDEX `fk_packing_slip_details_packing_slips1_idx` ON `packing_slip_details` (`packing_slips_id` ASC);

CREATE INDEX `fk_packing_slip_details_order_details1_idx` ON `packing_slip_details` (`order_details_id` ASC);

CREATE INDEX `fk_packing_slip_details_stock_buckets1_idx` ON `packing_slip_details` (`stock_buckets_id` ASC);


-- -----------------------------------------------------
-- Table `stock_journal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_journal` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(64) NOT NULL,
  `companies_id` INT NOT NULL,
  `stock_buckets_id` INT NOT NULL,
  `products_id` INT NOT NULL,
  `transaction_date` DATETIME NOT NULL,
  `packing_slips_id` INT NULL,
  `orders_id` INT NULL,
  `users_id` INT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `quantity_ordered` DECIMAL(12,4) NULL DEFAULT 0,
  `entered_unit_of_measures_id` INT NOT NULL,
  `quantity_entered` DECIMAL(12,4) NULL DEFAULT 0,
  `system_notes` VARCHAR(256) NULL,
  `created` DATETIME NULL,
  `last_updated` DATETIME NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_stock_journal_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_packing_slips1`
    FOREIGN KEY (`packing_slips_id`)
    REFERENCES `packing_slips` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_orders1`
    FOREIGN KEY (`orders_id`)
    REFERENCES `orders` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_unit_of_measures2`
    FOREIGN KEY (`entered_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_stock_buckets1`
    FOREIGN KEY (`stock_buckets_id`)
    REFERENCES `stock_buckets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10001;

CREATE INDEX `fk_stock_journal_products1_idx` ON `stock_journal` (`products_id` ASC);

CREATE INDEX `fk_stock_journal_packing_slips1_idx` ON `stock_journal` (`packing_slips_id` ASC);

CREATE INDEX `fk_stock_journal_orders1_idx` ON `stock_journal` (`orders_id` ASC);

CREATE INDEX `fk_stock_journal_users1_idx` ON `stock_journal` (`users_id` ASC);

CREATE INDEX `fk_stock_journal_unit_of_measures1_idx` ON `stock_journal` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_stock_journal_unit_of_measures2_idx` ON `stock_journal` (`entered_unit_of_measures_id` ASC);

CREATE INDEX `fk_stock_journal_companies1_idx` ON `stock_journal` (`companies_id` ASC);

CREATE INDEX `fk_stock_journal_stock_buckets1_idx` ON `stock_journal` (`stock_buckets_id` ASC);


-- -----------------------------------------------------
-- Table `stock_bucket_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_bucket_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `stock_buckets_id` INT NOT NULL,
  `description` VARCHAR(64) NOT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `quantity` DECIMAL(12,4) NOT NULL,
  `sequence_number` INT NOT NULL COMMENT 'If value of piece needs to be stored, this sequence will store the value of each text box ',
  `piece_count` INT NULL DEFAULT 1,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_stock_journal_details_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_bucket_details_stock_buckets1`
    FOREIGN KEY (`stock_buckets_id`)
    REFERENCES `stock_buckets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10001;

CREATE INDEX `fk_stock_journal_details_unit_of_measures1_idx` ON `stock_bucket_details` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_stock_bucket_details_stock_buckets1_idx` ON `stock_bucket_details` (`stock_buckets_id` ASC);


-- -----------------------------------------------------
-- Table `stock_journal_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_journal_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `stock_journal_id` INT NOT NULL,
  `stock_buckets_id` INT NOT NULL,
  `stock_bucket_details_id` INT NOT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `quantity` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_stock_journal_details_stock_buckets1`
    FOREIGN KEY (`stock_buckets_id`)
    REFERENCES `stock_buckets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_details_stock_bucket_details1`
    FOREIGN KEY (`stock_bucket_details_id`)
    REFERENCES `stock_bucket_details` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_details_unit_of_measures2`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_details_stock_journal1`
    FOREIGN KEY (`stock_journal_id`)
    REFERENCES `stock_journal` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10001;

CREATE INDEX `fk_stock_journal_details_stock_buckets1_idx` ON `stock_journal_details` (`stock_buckets_id` ASC);

CREATE INDEX `fk_stock_journal_details_stock_bucket_details1_idx` ON `stock_journal_details` (`stock_bucket_details_id` ASC);

CREATE INDEX `fk_stock_journal_details_unit_of_measures2_idx` ON `stock_journal_details` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_stock_journal_details_stock_journal1_idx` ON `stock_journal_details` (`stock_journal_id` ASC);


-- fix the existing unit conversions
CREATE TABLE tmp1 (uomid int, startuomidx int, enduomidx int, startuomid int, enduomid int);

INSERT INTO tmp1 (uomid, startuomidx, enduomidx)
SELECT unit_of_measures_id, MIN(id), MAX(id) FROM unit_conversions GROUP BY unit_of_measures_id;

UPDATE tmp1
INNER JOIN unit_conversions c ON tmp1.startuomidx = c.id
SET    startuomid = c.from_uom_id;

UPDATE tmp1
INNER JOIN unit_conversions c ON tmp1.enduomidx = c.id
SET    enduomid = c.to_uom_id;

UPDATE  unit_of_measures
INNER JOIN tmp1 ON unit_of_measures.id = tmp1.uomid
SET    end_uom_id = tmp1.enduomid;

UPDATE unit_conversions SET from_uom_id = unit_of_measures_id WHERE id in (SELECT startuomidx FROM tmp1);

DROP TABLE tmp1;
show warnings;

-- -- create bucket for each product
-- INSERT INTO stock_buckets (code, description, companies_id, products_id, is_system, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, users_id, sysstatuses_id, created, last_updated)
-- SELECT 'DEFAULT', 'Default Bucket', p.companies_id, p.id, 1, p.unit_of_measures_id, p.default_qty_uom_id, 0, 0, (select min(u.id) from users u where p.companies_id = u.companies_id and sysroles_id = 4002), 4600, now(), now()
-- FROM   products p
-- WHERE  NOT EXISTS (SELECT 1 FROM unit_conversions c WHERE c.unit_of_measures_id = p.unit_of_measures_id)
-- AND    NOT EXISTS (SELECT 1 FROM unit_conversions c WHERE c.unit_of_measures_id = p.default_qty_uom_id);

INSERT INTO stock_buckets (code, description, companies_id, products_id, is_system, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, users_id, sysstatuses_id, created, last_updated)
SELECT 'DEFAULT', 'Default Bucket', p.companies_id, p.id, 1, p.unit_of_measures_id, p.default_qty_uom_id, 0, 0, (select min(u.id) from users u where p.companies_id = u.companies_id and sysroles_id = 4002), 4600, now(), now()
FROM   products p;

show warnings;

-- INSERT INTO stock_buckets (code, description, companies_id, products_id, is_system, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, users_id, sysstatuses_id, created, last_updated)
-- SELECT 'DEFAULT', 'Default Bucket', p.companies_id, p.id, 1, p.unit_of_measures_id, p.default_qty_uom_id, 0, 0, (select min(u.id) from users u where p.companies_id = u.companies_id and sysroles_id = 4002), 4600, now(), now()
-- FROM   products p LEFT OUTER JOIN unit_of_measures m ON p.unit_of_measures_id = m.id AND m.end_uom_id IS NOT NULL LEFT OUTER JOIN unit_of_measures u ON u.id = p.default_qty_uom_id AND u.end_uom_id IS NOT NULL
-- WHERE  NOT EXISTS (SELECT 1 FROM stock_buckets s WHERE s.products_id = p.id);

-- enter direct unit of measure making sure there is no conversion there.
INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
SELECT s.id, 'Stock Bucket Detail', 0, s.unit_of_measures_id, 1, 0, now(), now()
FROM   stock_buckets s;
show warnings;

-- INSERT INTO stock_bucket_details (stock_buckets_id, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
-- SELECT s.id, 0, p.unit_of_measures_id, 1, 0, now(), now()
-- FROM   products p, stock_buckets s
-- WHERE  s.products_id = p.id
-- AND    NOT EXISTS (SELECT 1 FROM unit_conversions c WHERE c.unit_of_measures_id = p.unit_of_measures_id);

INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
SELECT s.id, 'Stock Bucket Detail', 0, s.entered_unit_of_measures_id, 1, 0, now(), now()
FROM   stock_buckets s
WHERE  s.unit_of_measures_id <> s.entered_unit_of_measures_id;
show warnings;

UPDATE unit_conversions
INNER JOIN unit_of_measures m ON unit_conversions.unit_of_measures_id = m.id
SET  is_batched_inventory = 1
WHERE unit_conversions.to_uom_id = 5008;
show warnings;

-- handle batched inventory
INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
SELECT s.id, CONCAT('Piece 1 of ', c.to_qty), 0, c.to_uom_id, 1, c.to_qty, now(), now()
FROM   stock_buckets s, unit_conversions c, products p
WHERE  c.is_batched_inventory = 1
AND    s.products_id = p.id
AND    (p.unit_of_measures_id = c.unit_of_measures_id OR p.default_qty_uom_id = c.unit_of_measures_id)
AND    NOT EXISTS (SELECT 1 FROM stock_bucket_details d WHERE d.unit_of_measures_id = c.to_uom_id AND d.stock_buckets_id = s.id);
show warnings;

DELIMITER //

create procedure  p()

BEGIN

DECLARE l_bucketid INT;
DECLARE l_pcscount INT;
DECLARE l_uomid    INT;
DECLARE i          INT;
DECLARE l_finished INT DEFAULT 0;

DECLARE c1 CURSOR FOR SELECT 
	d.stock_buckets_id, d.piece_count, d.unit_of_measures_id
	FROM   stock_bucket_details d
	WHERE  d.piece_count > 0;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET l_finished = 1;

OPEN c1;

mainloop: LOOP

	FETCH c1 INTO l_bucketid, l_pcscount, l_uomid;
	
	IF l_finished = 0 THEN
	
		SET i = 1;
		lbl1: LOOP

			SET i = i + 1;

			IF i <= l_pcscount THEN

				INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
				VALUES (l_bucketid, CONCAT('Piece ', i, ' of ', l_pcscount), 0, l_uomid, i, 0, now(), now());

				ITERATE lbl1;

			END IF;

			UPDATE stock_bucket_details
			SET    piece_count = 0
			WHERE  stock_buckets_id = l_bucketid
			AND    piece_count > 0;

			LEAVE lbl1;

		END LOOP lbl1;
		
		ITERATE mainloop;

	ELSE

		LEAVE mainloop;
	
	END IF;

END LOOP mainloop;

CLOSE c1;

END;
//

DELIMITER ;
show warnings;

CALL P;
show warnings;

-- INSERT INTO stock_journal (stock_buckets_id, companies_id, description, products_id, transaction_date, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, system_notes, created, last_updated)
-- SELECT s.id, s.companies_id, 'System Entry', s.products_id, now(), s.unit_of_measures_id, s.entered_unit_of_measures_id, s.quantity_entered, s.quantity_ordered, 'Migration Entry', now(), now()
-- FROM   stock_buckets s;

-- INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, unit_of_measures_id, quantity, created, last_updated)
-- SELECT s.id, s.stock_buckets_id, d.id, d.unit_of_measures_id, d.quantity, now(), now()
-- FROM   stock_journal s, stock_bucket_details d
-- WHERE  s.stock_buckets_id = d.stock_buckets_id;


update products set width = case when width = -1 then null else width end;

update products set height  = case when height = -1 then null else height end;

update products set weight  = case when weight = -1 then null else weight end;

update products set length  = case when length = -1 then null else length end;

update products set is_batched_inventory = 1 where default_qty_uom_id in (5015, 5016, 5017);

-- another file


alter table order_details add column `quantity_ordered_packed` DECIMAL(10,4) NOT NULL DEFAULT 0 AFTER `unit_of_measures_id`;
alter table order_details add column `quantity_entered_packed` DECIMAL(10,4) NOT NULL DEFAULT 0 AFTER `entered_quantity`;
alter table order_details add column `is_complete` INT NOT NULL DEFAULT 0 AFTER `notes`;

insert into syspackingslipstatuses values (5200, 'Packed', 'Packing Slip Created', now(), now());
insert into syspackingslipstatuses values (5201, 'Invoiced', 'Packing Slip Invoice Created', now(), now());
show warnings;

insert into sysinvoicestatuses values (5300, 'Created', 'Invoice Created', now(), now());
insert into sysinvoicestatuses values (5301, 'Completed', 'Invoice sent with LR updated', now(), now());
show warnings;

update sysorderstatuses set name = 'In Packing', description = 'Order is in packing' where id = 4201;

update orders set sysorderstatuses_id = 4202 where sysorderstatuses_id = 4201;

update order_details set quantity_entered_packed = entered_quantity, quantity_ordered_packed = order_quantity WHERE orders_id in (select id from orders where sysorderstatuses_id = 4202);
show warnings;

CREATE TABLE tmp2 (productid int, stock_quote decimal(12, 4), stock_qty decimal(12, 4));

INSERT INTO tmp2
SELECT products_id, SUM(order_quantity), sum(entered_quantity)
FROM   order_details
WHERE  orders_id IN (SELECT o.id FROM orders o WHERE o.sysorderstatuses_id = 4203)
GROUP BY products_id;

UPDATE products 
INNER JOIN tmp2 ON products.id = tmp2.productid
SET  stock_in_process_quote = tmp2.stock_quote, stock_in_process_qty = tmp2.stock_qty;
show warnings;

drop table tmp2;


insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5462, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);
show warnings;

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5463, 'Create Packing Slip', 'Allow creating packing slip', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());
show warnings;

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5463, 0, now(), now()
from roles r
where sysroles_id IN (4002);
show warnings;

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5463, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);
show warnings;
