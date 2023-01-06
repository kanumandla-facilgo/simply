
-- -----------------------------------------------------
-- Table `pending_bills`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pending_bills` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bill_number` VARCHAR(64) NOT NULL,
  `bill_ref_number` VARCHAR(64) NULL,
  `companies_id` INT NOT NULL,
  `customers_id` INT NOT NULL,
  `bill_date` DATETIME NOT NULL,
  `due_date` DATETIME NOT NULL,
  `balance_amount` DECIMAL(10,2) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pending_bills_companies1`
    FOREIGN KEY (`customers_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_pending_bills_companies2`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_pending_bills_companies1_idx` ON `pending_bills` (`customers_id` ASC);

CREATE INDEX `fk_pending_bills_companies2_idx` ON `pending_bills` (`companies_id` ASC);

ALTER TABLE `companies` 
ADD COLUMN `current_balance_sync_date` DATETIME NULL AFTER `pending_order_balance`,
ADD COLUMN `current_overdue_sync_date` DATETIME NULL AFTER `current_balance_sync_date`;
