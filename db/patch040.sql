-- -----------------------------------------------------
-- Table `sysdocumenttypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysdocumenttypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `customer_shares`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_shares` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `document_id` INT NOT NULL,
  `sysdocumenttypes_id` INT NOT NULL,
  `access_code` VARCHAR(32) NOT NULL,
  `salt` VARCHAR(32) NOT NULL,
  `companies_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  `expired_at` DATETIME NULL,
  `last_accessed` DATETIME NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_category_customers_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_category_customers_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_customer_shares_sysdocumenttypes1`
    FOREIGN KEY (`sysdocumenttypes_id`)
    REFERENCES `sysdocumenttypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_category_customers_companies1_idx` ON `customer_shares` (`companies_id` ASC);

CREATE INDEX `fk_category_customers_users1_idx` ON `customer_shares` (`users_id` ASC);

CREATE INDEX `fk_customer_shares_sysdocumenttypes1_idx` ON `customer_shares` (`sysdocumenttypes_id` ASC);


alter table users add column is_random_generated bit not null default 0 after `update_counter`;

INSERT INTO syseventtypes VALUES ( 1003, 'Customer Share', NOW(), NOW());

INSERT INTO sysdocumenttypes VALUES (1001, 'Order', NOW(), NOW());
INSERT INTO sysdocumenttypes VALUES (1002, 'Category', NOW(), NOW());

INSERT INTO syssessiontypes VALUES (4103, 'One Time', 60*5, NOW(), NOW());