CREATE TABLE IF NOT EXISTS `stock_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `products_id` INT NOT NULL,
  `transaction_date` DATETIME NOT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `stock_alt_unit_of_measures_id` INT NOT NULL,
  `stock_quote` DECIMAL(12,4) NOT NULL,
  `stock_qty` DECIMAL(12,4) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_stock_history_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_history_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_history_unit_of_measures2`
    FOREIGN KEY (`stock_alt_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_stock_history_products1_idx` ON `stock_history` (`products_id` ASC);

CREATE UNIQUE INDEX `idx_stock_history_unique` ON `stock_history` (`products_id` ASC, `transaction_date` ASC);

CREATE INDEX `fk_stock_history_unit_of_measures1_idx` ON `stock_history` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_stock_history_unit_of_measures2_idx` ON `stock_history` (`stock_alt_unit_of_measures_id` ASC);
