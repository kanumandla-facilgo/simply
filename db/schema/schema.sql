-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table `addresses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NULL,
  `first_name` VARCHAR(32) NULL,
  `last_name` VARCHAR(32) NULL,
  `name` VARCHAR(128) NULL,
  `address1` VARCHAR(128) NULL,
  `address2` VARCHAR(128) NULL,
  `address3` VARCHAR(128) NULL,
  `city` VARCHAR(32) NULL,
  `state` VARCHAR(32) NULL,
  `pin` VARCHAR(16) NULL,
  `phone1` VARCHAR(24) NULL,
  `phone2` VARCHAR(24) NULL,
  `email1` VARCHAR(128) NULL,
  `email2` VARCHAR(128) NULL,
  `update_counter` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_addresses_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_addresses_companies1_idx` ON `addresses` (`companies_id` ASC);


-- -----------------------------------------------------
-- Table `company_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `company_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(256) NOT NULL,
  `balance_limit` INT NOT NULL DEFAULT -1,
  `companies_id` INT NULL,
  `master_id` INT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `update_counter` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_partytypes_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_company_types_company_types1`
    FOREIGN KEY (`master_id`)
    REFERENCES `company_types` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_partytypes_companies1_idx` ON `company_types` (`companies_id` ASC);

CREATE INDEX `fk_company_types_company_types1_idx` ON `company_types` (`master_id` ASC);


-- -----------------------------------------------------
-- Table `sysstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysstatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `payment_terms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_terms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(32) NOT NULL,
  `description` VARCHAR(128) NOT NULL,
  `days` INT NULL,
  `companies_id` INT NOT NULL,
  `sysstatuses_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payment_terms_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_payment_terms_sysstatuses1`
    FOREIGN KEY (`sysstatuses_id`)
    REFERENCES `sysstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_payment_terms_companies1_idx` ON `payment_terms` (`companies_id` ASC);

CREATE INDEX `fk_payment_terms_sysstatuses1_idx` ON `payment_terms` (`sysstatuses_id` ASC);


-- -----------------------------------------------------
-- Table `transporters`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `transporters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  `external_code` VARCHAR(32) NULL,
  `companies_id` INT NOT NULL,
  `addresses_id` INT NOT NULL,
  `sysstatuses_id` INT NOT NULL,
  `is_system` TINYINT(1) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_transporters_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_transporters_addresses1`
    FOREIGN KEY (`addresses_id`)
    REFERENCES `addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_transporters_sysstatuses1`
    FOREIGN KEY (`sysstatuses_id`)
    REFERENCES `sysstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_transporters_companies1_idx` ON `transporters` (`companies_id` ASC);

CREATE INDEX `fk_transporters_addresses1_idx` ON `transporters` (`addresses_id` ASC);

CREATE INDEX `fk_transporters_sysstatuses1_idx` ON `transporters` (`sysstatuses_id` ASC);


-- -----------------------------------------------------
-- Table `sysroles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysroles` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `is_system` TINYINT(1) NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(128) NOT NULL,
  `companies_id` INT NOT NULL,
  `sysroles_id` INT NOT NULL,
  `update_counter` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_roles_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_roles_sysroles1`
    FOREIGN KEY (`sysroles_id`)
    REFERENCES `sysroles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_roles_companies1_idx` ON `roles` (`companies_id` ASC);

CREATE INDEX `fk_roles_sysroles1_idx` ON `roles` (`sysroles_id` ASC);


-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(32) NULL,
  `last_name` VARCHAR(32) NULL,
  `middle_name` VARCHAR(32) NULL,
  `login_name` VARCHAR(16) NOT NULL,
  `password` VARCHAR(32) NOT NULL,
  `salt` VARCHAR(32) NOT NULL,
  `companies_id` INT NOT NULL,
  `addresses_id` INT NOT NULL,
  `statuses_id` INT NOT NULL,
  `sysroles_id` INT NOT NULL,
  `roles_id` INT NOT NULL,
  `api_key` VARCHAR(16) NULL,
  `api_secret` VARCHAR(32) NULL,
  `update_counter` INT NOT NULL DEFAULT 0,
  `is_random_generated` BIT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_users_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_roles1`
    FOREIGN KEY (`roles_id`)
    REFERENCES `roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_addresses1`
    FOREIGN KEY (`addresses_id`)
    REFERENCES `addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_sysstatuses1`
    FOREIGN KEY (`statuses_id`)
    REFERENCES `sysstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_sysroles1`
    FOREIGN KEY (`sysroles_id`)
    REFERENCES `sysroles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_users_companies1_idx` ON `users` (`companies_id` ASC);

CREATE INDEX `fk_users_roles1_idx` ON `users` (`roles_id` ASC);

CREATE INDEX `fk_users_addresses1_idx` ON `users` (`addresses_id` ASC);

CREATE INDEX `fk_users_sysstatuses1_idx` ON `users` (`statuses_id` ASC);

CREATE INDEX `fk_users_sysroles1_idx` ON `users` (`sysroles_id` ASC);


-- -----------------------------------------------------
-- Table `syssyncstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syssyncstatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `syssubscriptiontemplates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syssubscriptiontemplates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `companies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `code` VARCHAR(16) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
  `syscompanytypes_id` INT NOT NULL,
  `companytypes_id` INT NOT NULL,
  `tin` VARCHAR(32) NULL,
  `addresses_id` INT NOT NULL,
  `ship_addresses_id` INT NOT NULL,
  `bill_addresses_id` INT NOT NULL,
  `syssubscriptiontemplates_id` INT NOT NULL,
  `payment_terms_id` INT NULL,
  `allowed_balance` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `current_balance` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `current_overdue` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `pending_order_balance` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `current_balance_sync_date` DATETIME NULL,
  `current_overdue_sync_date` DATETIME NULL,
  `transporters_id` INT NULL,
  `sysstatuses_id` INT NOT NULL,
  `parent_id` INT NULL,
  `agents_id` INT NULL,
  `commission_rate` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `salesperson_id` INT NULL,
  `notes` VARCHAR(512) NULL,
  `pan_number` VARCHAR(24) NULL,
  `cst_number` VARCHAR(24) NULL,
  `vat_number` VARCHAR(24) NULL,
  `excise_number` VARCHAR(24) NULL,
  `gst_number` VARCHAR(24) NULL,
  `gst_registration_type` VARCHAR(32) NULL,
  `taxform_flag` TINYINT(1) NOT NULL DEFAULT 0,
  `syssyncstatuses_id` INT NOT NULL,
  `invoicing_name` VARCHAR(128) NOT NULL,
  `is_system_agent_id` TINYINT(1) NOT NULL,
  `update_counter` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_companies_addresses1`
    FOREIGN KEY (`addresses_id`)
    REFERENCES `addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_addresses2`
    FOREIGN KEY (`ship_addresses_id`)
    REFERENCES `addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_addresses3`
    FOREIGN KEY (`bill_addresses_id`)
    REFERENCES `addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_companytypes1`
    FOREIGN KEY (`companytypes_id`)
    REFERENCES `company_types` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_payment_terms1`
    FOREIGN KEY (`payment_terms_id`)
    REFERENCES `payment_terms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_transporters1`
    FOREIGN KEY (`transporters_id`)
    REFERENCES `transporters` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_companies1`
    FOREIGN KEY (`parent_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_users1`
    FOREIGN KEY (`salesperson_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_companies2`
    FOREIGN KEY (`agents_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_sysstatuses1`
    FOREIGN KEY (`sysstatuses_id`)
    REFERENCES `sysstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_syssyncstatuses1`
    FOREIGN KEY (`syssyncstatuses_id`)
    REFERENCES `syssyncstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_companies_syssubscriptiontemplates1`
    FOREIGN KEY (`syssubscriptiontemplates_id`)
    REFERENCES `syssubscriptiontemplates` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_companies_addresses1_idx` ON `companies` (`addresses_id` ASC);

CREATE INDEX `fk_companies_addresses2_idx` ON `companies` (`ship_addresses_id` ASC);

CREATE INDEX `fk_companies_addresses3_idx` ON `companies` (`bill_addresses_id` ASC);

CREATE INDEX `fk_companies_companytypes1_idx` ON `companies` (`companytypes_id` ASC);

CREATE INDEX `fk_companies_payment_terms1_idx` ON `companies` (`payment_terms_id` ASC);

CREATE INDEX `fk_companies_transporters1_idx` ON `companies` (`transporters_id` ASC);

CREATE INDEX `fk_companies_companies1_idx` ON `companies` (`parent_id` ASC);

CREATE INDEX `fk_companies_users1_idx` ON `companies` (`salesperson_id` ASC);

CREATE INDEX `fk_companies_companies2_idx` ON `companies` (`agents_id` ASC);

CREATE INDEX `fk_companies_sysstatuses1_idx` ON `companies` (`sysstatuses_id` ASC);

CREATE INDEX `fk_companies_syssyncstatuses1_idx` ON `companies` (`syssyncstatuses_id` ASC);

CREATE INDEX `fk_companies_syssubscriptiontemplates1_idx` ON `companies` (`syssubscriptiontemplates_id` ASC);


-- -----------------------------------------------------
-- Table `syspermissiongroups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syspermissiongroups` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `syspermissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syspermissions` (
  `id` INT NOT NULL,
  `name` VARCHAR(64) NULL,
  `description` VARCHAR(512) NULL,
  `possible_values` VARCHAR(128) NULL,
  `apiuser_default_value` VARCHAR(32) NULL,
  `admin_default_value` VARCHAR(32) NULL,
  `user_default_value` VARCHAR(32) NULL,
  `sales_default_value` VARCHAR(32) NULL,
  `agent_default_value` VARCHAR(32) NULL,
  `agentuser_default_value` VARCHAR(32) NULL,
  `customeradmin_default_value` VARCHAR(32) NULL,
  `customeruser_default_value` VARCHAR(32) NULL,
  `is_system` TINYINT(1) NOT NULL DEFAULT 0,
  `is_company` TINYINT(1) NOT NULL DEFAULT 1,
  `is_customer` TINYINT(1) NOT NULL,
  `is_agent` TINYINT(1) NOT NULL DEFAULT 0,
  `syspermissiongroups_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_syspermissions_syspermissiongroups1`
    FOREIGN KEY (`syspermissiongroups_id`)
    REFERENCES `syspermissiongroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_syspermissions_syspermissiongroups1_idx` ON `syspermissions` (`syspermissiongroups_id` ASC);


-- -----------------------------------------------------
-- Table `role_permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` VARCHAR(32) NULL,
  `roles_id` INT NOT NULL,
  `syspermissions_id` INT NOT NULL,
  `update_counter` INT NOT NULL DEFAULT 0,
  `created` DATETIME NULL,
  `last_updated` DATETIME NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_role_permissions_syspermissions1`
    FOREIGN KEY (`syspermissions_id`)
    REFERENCES `syspermissions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_role_permissions_roles1`
    FOREIGN KEY (`roles_id`)
    REFERENCES `roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_role_permissions_syspermissions1_idx` ON `role_permissions` (`syspermissions_id` ASC);

CREATE INDEX `fk_role_permissions_roles1_idx` ON `role_permissions` (`roles_id` ASC);


-- -----------------------------------------------------
-- Table `categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `code` VARCHAR(16) NOT NULL,
  `lineage` VARCHAR(256) NOT NULL,
  `lineage_name` VARCHAR(512) NOT NULL,
  `children_count` INT NOT NULL,
  `is_leaf` TINYINT(1) NOT NULL,
  `is_root` TINYINT(1) NOT NULL,
  `parent_id` INT NULL,
  `companies_id` INT NOT NULL,
  `image_url` VARCHAR(256) NULL,
  `image_url_large` VARCHAR(256) NULL,
  `is_hidden` TINYINT(1) NOT NULL,
  `update_counter` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_categories_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_categories_categories1`
    FOREIGN KEY (`parent_id`)
    REFERENCES `categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_categories_companies1_idx` ON `categories` (`companies_id` ASC);

CREATE INDEX `fk_categories_categories1_idx` ON `categories` (`parent_id` ASC);


-- -----------------------------------------------------
-- Table `unit_of_measures`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `unit_of_measures` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(256) NOT NULL,
  `short_name` VARCHAR(12) NOT NULL,
  `base_id` INT NULL,
  `conversion_factor` DECIMAL(10,4) NOT NULL,
  `display_flag` TINYINT(1) NOT NULL DEFAULT 0,
  `is_system` TINYINT(1) NOT NULL DEFAULT 0,
  `companies_id` INT NULL,
  `master_id` INT NULL,
  `end_uom_id` INT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_unit_of_measures_unit_of_measures1`
    FOREIGN KEY (`base_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unit_of_measures_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unit_of_measures_unit_of_measures2`
    FOREIGN KEY (`master_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unit_of_measures_unit_of_measures4`
    FOREIGN KEY (`end_uom_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1001;

CREATE INDEX `fk_unit_of_measures_unit_of_measures1_idx` ON `unit_of_measures` (`base_id` ASC);

CREATE INDEX `fk_unit_of_measures_companies1_idx` ON `unit_of_measures` (`companies_id` ASC);

CREATE INDEX `fk_unit_of_measures_unit_of_measures2_idx` ON `unit_of_measures` (`master_id` ASC);

CREATE INDEX `fk_unit_of_measures_unit_of_measures4_idx` ON `unit_of_measures` (`end_uom_id` ASC);


-- -----------------------------------------------------
-- Table `syspricelevels`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syspricelevels` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `price_groups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `price_groups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(256) NULL,
  `companies_id` INT NOT NULL,
  `syspricelevels_id` INT NOT NULL,
  `unit_price` DECIMAL(10,4) NOT NULL COMMENT 'this column might be not needed.',
  `unit_of_measures_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_price_groups_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_price_groups_syspricelevels1`
    FOREIGN KEY (`syspricelevels_id`)
    REFERENCES `syspricelevels` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_price_groups_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10001;

CREATE INDEX `fk_price_groups_companies1_idx` ON `price_groups` (`companies_id` ASC);

CREATE INDEX `fk_price_groups_syspricelevels1_idx` ON `price_groups` (`syspricelevels_id` ASC);

CREATE INDEX `fk_price_groups_unit_of_measures1_idx` ON `price_groups` (`unit_of_measures_id` ASC);


-- -----------------------------------------------------
-- Table `sysproducttypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysproducttypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysproducthsn`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysproducthsn` (
  `id` INT NOT NULL,
  `code` VARCHAR(12) NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(256) NOT NULL,
  `short_code` VARCHAR(12) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `description` VARCHAR(1024) NOT NULL,
  `sku` VARCHAR(32) NOT NULL,
  `sku_internal` VARCHAR(32) NOT NULL,
  `package_qty` DECIMAL(12,4) NOT NULL,
  `unit_price` DECIMAL(10,4) NOT NULL,
  `stock_unit_of_measures_id` INT NOT NULL,
  `stock_alt_unit_of_measures_id` INT NOT NULL,
  `stock_quote` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `stock_qty` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `stock_in_packing_quote` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `stock_in_packing_qty` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `units_on_order` DECIMAL(12,4) NULL,
  `reorder_level` DECIMAL(12,4) NULL,
  `reorder_qty` DECIMAL(12,4) NULL,
  `sysproducttypes_id` INT NOT NULL,
  `categories_id` INT NOT NULL,
  `statuses_id` INT NOT NULL,
  `companies_id` INT NOT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `syspricelevels_id` INT NOT NULL,
  `price_groups_id` INT NULL,
  `width` DECIMAL(10,2) NULL,
  `length` DECIMAL(10,2) NULL,
  `height` DECIMAL(10,2) NULL,
  `weight` DECIMAL(10,2) NULL,
  `default_qty_uom_id` INT NULL,
  `is_qty_uom_restricted` TINYINT(1) NOT NULL DEFAULT 0,
  `is_quote_uom_restricted` TINYINT(1) NOT NULL DEFAULT 1,
  `is_family` TINYINT(1) NOT NULL DEFAULT 0,
  `is_hidden` TINYINT(1) NOT NULL DEFAULT 0,
  `is_hidden_no_stock` TINYINT(1) NOT NULL DEFAULT 1,
  `is_taxable` TINYINT(1) NOT NULL DEFAULT 0,
  `color` VARCHAR(32) NULL,
  `image_url1` VARCHAR(256) NULL,
  `image_url2` VARCHAR(256) NULL,
  `image_url3` VARCHAR(256) NULL,
  `image_url4` VARCHAR(256) NULL,
  `image_url5` VARCHAR(256) NULL,
  `family_size` INT NOT NULL DEFAULT 0,
  `category_count` INT NOT NULL DEFAULT 0,
  `is_batched_inventory` TINYINT(1) NOT NULL DEFAULT 0,
  `syssyncstatuses_id` INT NOT NULL,
  `sysproducthsn_id` INT NOT NULL,
  `default_sell_qty` DECIMAL(12,4) NULL,
  `cost` DECIMAL(10,2) NULL,
  `update_counter` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_items_categories1`
    FOREIGN KEY (`categories_id`)
    REFERENCES `categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_items_statuses1`
    FOREIGN KEY (`statuses_id`)
    REFERENCES `sysstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_items_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_items_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_products_syspricelevels1`
    FOREIGN KEY (`syspricelevels_id`)
    REFERENCES `syspricelevels` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_products_price_groups1`
    FOREIGN KEY (`price_groups_id`)
    REFERENCES `price_groups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_products_sysproducttypes1`
    FOREIGN KEY (`sysproducttypes_id`)
    REFERENCES `sysproducttypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_products_unit_of_measures1`
    FOREIGN KEY (`default_qty_uom_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_products_syssyncstatuses1`
    FOREIGN KEY (`syssyncstatuses_id`)
    REFERENCES `syssyncstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_products_sysproducthsn1`
    FOREIGN KEY (`sysproducthsn_id`)
    REFERENCES `sysproducthsn` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_items_unit_of_measures3`
    FOREIGN KEY (`stock_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_items_unit_of_measures4`
    FOREIGN KEY (`stock_alt_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_items_categories1_idx` ON `products` (`categories_id` ASC);

CREATE INDEX `fk_items_statuses1_idx` ON `products` (`statuses_id` ASC);

CREATE INDEX `fk_items_companies1_idx` ON `products` (`companies_id` ASC);

CREATE INDEX `fk_items_unit_of_measures1_idx` ON `products` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_products_syspricelevels1_idx` ON `products` (`syspricelevels_id` ASC);

CREATE INDEX `fk_products_price_groups1_idx` ON `products` (`price_groups_id` ASC);

CREATE INDEX `fk_products_sysproducttypes1_idx` ON `products` (`sysproducttypes_id` ASC);

CREATE INDEX `fk_products_unit_of_measures1_idx` ON `products` (`default_qty_uom_id` ASC);

CREATE INDEX `fk_products_created1_idx` ON `products` (`created` ASC);

CREATE INDEX `fk_products_syssyncstatuses1_idx` ON `products` (`syssyncstatuses_id` ASC);

CREATE INDEX `fk_products_sysproducthsn1_idx` ON `products` (`sysproducthsn_id` ASC);

CREATE INDEX `fk_items_unit_of_measures3_idx` ON `products` (`stock_unit_of_measures_id` ASC);

CREATE INDEX `fk_items_unit_of_measures4_idx` ON `products` (`stock_alt_unit_of_measures_id` ASC);


-- -----------------------------------------------------
-- Table `sysorderstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysorderstatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysworkflowstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysworkflowstatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysdeliverystatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysdeliverystatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customers_id` INT NOT NULL,
  `companies_id` INT NOT NULL,
  `order_date` DATETIME NOT NULL,
  `sub_total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `tax_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `discount_total` DECIMAL(8,2) NULL,
  `sysorderstatuses_id` INT NOT NULL,
  `sysworkflowstatuses_id` INT NOT NULL,
  `sysdeliverystatuses_id` INT NOT NULL,
  `orderusers_id` INT NOT NULL,
  `ship_addresses_id` INT NOT NULL,
  `bill_addresses_id` INT NOT NULL,
  `approverusers_id` INT NULL,
  `approval_date` DATETIME NULL,
  `cancelusers_id` INT NOT NULL,
  `cancellation_date` DATETIME NULL,
  `syssyncstatus_id` INT NOT NULL,
  `order_number` VARCHAR(32) NULL,
  `customer_order_number` VARCHAR(32) NULL,
  `payment_terms_id` INT NOT NULL,
  `payment_due_date` DATETIME NULL,
  `paid_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `salespersons_id` INT NOT NULL,
  `transporters_id` INT NOT NULL,
  `dispatch_date` DATETIME NULL,
  `item_count` INT(11) NOT NULL,
  `commission_amount` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `workflow_reason_string` VARCHAR(128) NULL,
  `notes` VARCHAR(512) NULL,
  `internal_notes` VARCHAR(512) NULL,
  `agent_notes` VARCHAR(512) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`, `salespersons_id`),
  CONSTRAINT `fk_orders_addresses1`
    FOREIGN KEY (`ship_addresses_id`)
    REFERENCES `addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_addresses2`
    FOREIGN KEY (`bill_addresses_id`)
    REFERENCES `addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_sysorderstatuses1`
    FOREIGN KEY (`sysorderstatuses_id`)
    REFERENCES `sysorderstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_syssyncstatus1`
    FOREIGN KEY (`syssyncstatus_id`)
    REFERENCES `syssyncstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_payment_terms1`
    FOREIGN KEY (`payment_terms_id`)
    REFERENCES `payment_terms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_users1`
    FOREIGN KEY (`orderusers_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_users2`
    FOREIGN KEY (`approverusers_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_users3`
    FOREIGN KEY (`salespersons_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_sysworkflowstatuses1`
    FOREIGN KEY (`sysworkflowstatuses_id`)
    REFERENCES `sysworkflowstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_transporters1`
    FOREIGN KEY (`transporters_id`)
    REFERENCES `transporters` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_users4`
    FOREIGN KEY (`cancelusers_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_sysdeliverystatuses1`
    FOREIGN KEY (`sysdeliverystatuses_id`)
    REFERENCES `sysdeliverystatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_orders_addresses1_idx` ON `orders` (`ship_addresses_id` ASC);

CREATE INDEX `fk_orders_addresses2_idx` ON `orders` (`bill_addresses_id` ASC);

CREATE INDEX `fk_orders_companies1_idx` ON `orders` (`companies_id` ASC);

CREATE INDEX `fk_orders_sysorderstatuses1_idx` ON `orders` (`sysorderstatuses_id` ASC);

CREATE INDEX `fk_orders_syssyncstatus1_idx` ON `orders` (`syssyncstatus_id` ASC);

CREATE INDEX `fk_orders_payment_terms1_idx` ON `orders` (`payment_terms_id` ASC);

CREATE INDEX `fk_orders_users1_idx` ON `orders` (`orderusers_id` ASC);

CREATE INDEX `fk_orders_users2_idx` ON `orders` (`approverusers_id` ASC);

CREATE INDEX `fk_orders_users3_idx` ON `orders` (`salespersons_id` ASC);

CREATE INDEX `fk_orders_sysworkflowstatuses1_idx` ON `orders` (`sysworkflowstatuses_id` ASC);

CREATE INDEX `fk_orders_transporters1_idx` ON `orders` (`transporters_id` ASC);

CREATE INDEX `fk_orders_users4_idx` ON `orders` (`cancelusers_id` ASC);

CREATE INDEX `fk_orders_sysdeliverystatuses1_idx` ON `orders` (`sysdeliverystatuses_id` ASC);

CREATE INDEX `fk_orders_customer_order_number` ON `orders` (`customers_id` ASC, `customer_order_number` ASC);

CREATE INDEX `fk_orders_customers_id_created` ON `orders` (`customers_id` ASC, `created` ASC);

CREATE INDEX `fk_orders_order_number` ON `orders` (`companies_id` ASC, `order_number` ASC);


-- -----------------------------------------------------
-- Table `order_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orders_id` INT NOT NULL,
  `products_id` INT NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  `order_quantity` DECIMAL(10,4) NOT NULL,
  `order_price` DECIMAL(8,2) NOT NULL,
  `unit_price` DECIMAL(8,2) NOT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `quantity_ordered_packed` DECIMAL(10,4) NOT NULL DEFAULT 0,
  `tax` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `shipping` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `discount` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `extension` DECIMAL(10,2) NOT NULL,
  `entered_unit_of_measures_id` INT NOT NULL,
  `entered_quantity` DECIMAL(10,4) NOT NULL,
  `quantity_entered_packed` DECIMAL(10,4) NOT NULL DEFAULT 0,
  `stock_unit_of_measures_id` INT NOT NULL,
  `stock_quantity` DECIMAL(10,4) NOT NULL DEFAULT 0,
  `stock_quantity_packed` DECIMAL(10,4) NULL,
  `stock_alt_unit_of_measures_id` INT NOT NULL,
  `stock_alt_quantity` DECIMAL(10,4) NOT NULL DEFAULT 0,
  `stock_alt_quantity_packed` DECIMAL(10,4) NULL,
  `notes` VARCHAR(512) NULL,
  `is_complete` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_details_orders1`
    FOREIGN KEY (`orders_id`)
    REFERENCES `orders` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_details_items1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_details_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_details_unit_of_measures2`
    FOREIGN KEY (`entered_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_details_unit_of_measures3`
    FOREIGN KEY (`stock_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_details_unit_of_measures4`
    FOREIGN KEY (`stock_alt_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_order_details_orders1_idx` ON `order_details` (`orders_id` ASC);

CREATE INDEX `fk_order_details_items1_idx` ON `order_details` (`products_id` ASC);

CREATE INDEX `fk_order_details_unit_of_measures1_idx` ON `order_details` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_order_details_unit_of_measures2_idx` ON `order_details` (`entered_unit_of_measures_id` ASC);

CREATE INDEX `fk_order_details_unit_of_measures3_idx` ON `order_details` (`stock_unit_of_measures_id` ASC);

CREATE INDEX `fk_order_details_unit_of_measures4_idx` ON `order_details` (`stock_alt_unit_of_measures_id` ASC);


-- -----------------------------------------------------
-- Table `sysconfigurationtypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysconfigurationtypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysconfigurations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysconfigurations` (
  `id` INT NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
  `possible_values` VARCHAR(128) NOT NULL,
  `default_value` VARCHAR(128) NOT NULL,
  `sysconfigurationtypes_id` INT NOT NULL,
  `root_edit_flag` TINYINT(1) NULL DEFAULT 0,
  `edit_flag` TINYINT(1) NOT NULL DEFAULT 0,
  `display_bits` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sysconfigurations_sysconfigurationtypes1`
    FOREIGN KEY (`sysconfigurationtypes_id`)
    REFERENCES `sysconfigurationtypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_sysconfigurations_sysconfigurationtypes1_idx` ON `sysconfigurations` (`sysconfigurationtypes_id` ASC);


-- -----------------------------------------------------
-- Table `configurations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `configurations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `value` VARCHAR(64) NOT NULL,
  `companies_id` INT NOT NULL,
  `sysconfigurations_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_configurations_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_configurations_sysconfigurations1`
    FOREIGN KEY (`sysconfigurations_id`)
    REFERENCES `sysconfigurations` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_configurations_companies1_idx` ON `configurations` (`companies_id` ASC);

CREATE INDEX `fk_configurations_sysconfigurations1_idx` ON `configurations` (`sysconfigurations_id` ASC);


-- -----------------------------------------------------
-- Table `product_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `products_id` INT NOT NULL,
  `categories_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_items_categories_items1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_items_categories_categories1`
    FOREIGN KEY (`categories_id`)
    REFERENCES `categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_items_categories_items1_idx` ON `product_categories` (`products_id` ASC);

CREATE INDEX `fk_items_categories_categories1_idx` ON `product_categories` (`categories_id` ASC);


-- -----------------------------------------------------
-- Table `syssessiontypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syssessiontypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `default_timeout_seconds` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sessions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(32) NOT NULL,
  `users_id` INT NOT NULL,
  `ipaddress` VARCHAR(32) NULL,
  `ipcity` VARCHAR(64) NULL,
  `ipcountry` VARCHAR(32) NULL,
  `last_auth_at` DATETIME NULL,
  `expiration_at` DATETIME NULL,
  `syssessiontypes_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sessions_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sessions_syssessiontypes1`
    FOREIGN KEY (`syssessiontypes_id`)
    REFERENCES `syssessiontypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_sessions_users1_idx` ON `sessions` (`users_id` ASC);

CREATE INDEX `fk_sessions_syssessiontypes1_idx` ON `sessions` (`syssessiontypes_id` ASC);


-- -----------------------------------------------------
-- Table `product_families`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_families` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `products_id` INT NOT NULL,
  `master_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_product_families_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_product_families_products2`
    FOREIGN KEY (`master_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10000;

CREATE INDEX `fk_product_families_products1_idx` ON `product_families` (`products_id` ASC);

CREATE INDEX `fk_product_families_products2_idx` ON `product_families` (`master_id` ASC);


-- -----------------------------------------------------
-- Table `price_lists`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `price_lists` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `price_groups_id` INT NOT NULL,
  `products_id` INT NULL,
  `company_types_id` INT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `qty_from` DECIMAL(10,4) NULL,
  `qty_to` DECIMAL(10,4) NULL,
  `unit_price` DECIMAL(10,4) NOT NULL,
  `last_updated_by` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_price_lists_company_types1`
    FOREIGN KEY (`company_types_id`)
    REFERENCES `company_types` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_price_lists_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_price_lists_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_price_lists_users1`
    FOREIGN KEY (`last_updated_by`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_price_lists_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_price_lists_price_groups1`
    FOREIGN KEY (`price_groups_id`)
    REFERENCES `price_groups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10000;

CREATE INDEX `fk_price_lists_company_types1_idx` ON `price_lists` (`company_types_id` ASC);

CREATE INDEX `fk_price_lists_companies1_idx` ON `price_lists` (`companies_id` ASC);

CREATE INDEX `fk_price_lists_products1_idx` ON `price_lists` (`products_id` ASC);

CREATE INDEX `fk_price_lists_users1_idx` ON `price_lists` (`last_updated_by` ASC);

CREATE INDEX `fk_price_lists_unit_of_measures1_idx` ON `price_lists` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_price_lists_price_groups1_idx` ON `price_lists` (`price_groups_id` ASC);


-- -----------------------------------------------------
-- Table `unit_conversions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `unit_conversions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `unit_of_measures_id` INT NOT NULL,
  `products_id` INT NULL,
  `from_uom_id` INT NOT NULL,
  `from_qty` DECIMAL(12,4) NOT NULL,
  `to_uom_id` INT NOT NULL,
  `to_qty` DECIMAL(12,4) NOT NULL,
  `is_batched_inventory` TINYINT(1) NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_unit_conversions_unit_of_measures1`
    FOREIGN KEY (`from_uom_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unit_conversions_unit_of_measures2`
    FOREIGN KEY (`to_uom_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unit_conversions_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unit_conversions_unit_of_measures3`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10000;

CREATE INDEX `fk_unit_conversions_unit_of_measures1_idx` ON `unit_conversions` (`from_uom_id` ASC);

CREATE INDEX `fk_unit_conversions_unit_of_measures2_idx` ON `unit_conversions` (`to_uom_id` ASC);

CREATE INDEX `fk_unit_conversions_products1_idx` ON `unit_conversions` (`products_id` ASC);

CREATE INDEX `fk_unit_conversions_unit_of_measures3_idx` ON `unit_conversions` (`unit_of_measures_id` ASC);


-- -----------------------------------------------------
-- Table `sysworkflowtypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysworkflowtypes` (
  `id` INT NOT NULL,
  `description` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `order_workflow_routes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_workflow_routes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orders_id` INT NOT NULL,
  `sysworkflowstatuses_id` INT NOT NULL,
  `arrival_roles_id` INT NOT NULL,
  `arrival_date` DATETIME NOT NULL,
  `due_date` DATETIME NULL,
  `action_roles_id` INT NOT NULL,
  `action_date` DATETIME NULL,
  `action_users_id` INT NULL,
  `action_sequence_number` INT NOT NULL DEFAULT 1,
  `notes` VARCHAR(512) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_routes_sysworkflowstatuses1`
    FOREIGN KEY (`sysworkflowstatuses_id`)
    REFERENCES `sysworkflowstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_routes_orders1`
    FOREIGN KEY (`orders_id`)
    REFERENCES `orders` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_routes_roles1`
    FOREIGN KEY (`arrival_roles_id`)
    REFERENCES `roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_routes_roles2`
    FOREIGN KEY (`action_roles_id`)
    REFERENCES `roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_workflow_routes_users1`
    FOREIGN KEY (`action_users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10000;

CREATE INDEX `fk_order_routes_sysworkflowstatuses1_idx` ON `order_workflow_routes` (`sysworkflowstatuses_id` ASC);

CREATE INDEX `fk_order_routes_orders1_idx` ON `order_workflow_routes` (`orders_id` ASC);

CREATE INDEX `fk_order_routes_roles1_idx` ON `order_workflow_routes` (`arrival_roles_id` ASC);

CREATE INDEX `fk_order_routes_roles2_idx` ON `order_workflow_routes` (`action_roles_id` ASC);

CREATE INDEX `fk_order_workflow_routes_users1_idx` ON `order_workflow_routes` (`action_users_id` ASC);


-- -----------------------------------------------------
-- Table `order_workflow_reasons`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_workflow_reasons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(32) NOT NULL,
  `orders_id` INT NOT NULL,
  `sysworkflowtypes_id` INT NOT NULL,
  `order_workflow_routes_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_workflow_reasons_orders1`
    FOREIGN KEY (`orders_id`)
    REFERENCES `orders` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_workflow_reasons_sysworkflowtypes1`
    FOREIGN KEY (`sysworkflowtypes_id`)
    REFERENCES `sysworkflowtypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_workflow_reasons_order_workflow_routes1`
    FOREIGN KEY (`order_workflow_routes_id`)
    REFERENCES `order_workflow_routes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 10000;

CREATE INDEX `fk_order_workflow_reasons_orders1_idx` ON `order_workflow_reasons` (`orders_id` ASC);

CREATE INDEX `fk_order_workflow_reasons_sysworkflowtypes1_idx` ON `order_workflow_reasons` (`sysworkflowtypes_id` ASC);

CREATE INDEX `fk_order_workflow_reasons_order_workflow_routes1_idx` ON `order_workflow_reasons` (`order_workflow_routes_id` ASC);


-- -----------------------------------------------------
-- Table `unit_conversion_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `unit_conversion_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `unit_of_measures_id` INT NOT NULL,
  `from_uom_id` INT NOT NULL,
  `from_qty` DECIMAL(12,4) NOT NULL,
  `to_uom_id` INT NOT NULL,
  `to_qty` DECIMAL(12,4) NOT NULL,
  `updated_flag` INT NOT NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_unit_conversion_detail_unit_of_measures1`
    FOREIGN KEY (`from_uom_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unit_conversion_detail_unit_of_measures2`
    FOREIGN KEY (`to_uom_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_unit_conversion_details_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_unit_conversion_detail_unit_of_measures1_idx` ON `unit_conversion_details` (`from_uom_id` ASC);

CREATE INDEX `fk_unit_conversion_detail_unit_of_measures2_idx` ON `unit_conversion_details` (`to_uom_id` ASC);

CREATE INDEX `fk_unit_conversion_details_unit_of_measures1_idx` ON `unit_conversion_details` (`unit_of_measures_id` ASC);


-- -----------------------------------------------------
-- Table `workflow_hierarchies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `workflow_hierarchies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `roles_id` INT NOT NULL,
  `variance_over` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `credit_days_over` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `credit_over` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `to_roles_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_workflow_hierarchies_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_workflow_hierarchies_roles1`
    FOREIGN KEY (`roles_id`)
    REFERENCES `roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_workflow_hierarchies_roles2`
    FOREIGN KEY (`to_roles_id`)
    REFERENCES `roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_workflow_hierarchies_companies1_idx` ON `workflow_hierarchies` (`companies_id` ASC);

CREATE INDEX `fk_workflow_hierarchies_roles1_idx` ON `workflow_hierarchies` (`roles_id` ASC);

CREATE INDEX `fk_workflow_hierarchies_roles2_idx` ON `workflow_hierarchies` (`to_roles_id` ASC);


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
-- Table `sysdeliverynotestatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysdeliverynotestatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `delivery_notes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery_notes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `customers_id` INT NOT NULL,
  `note_date` DATETIME NOT NULL,
  `note_number` VARCHAR(16) NOT NULL,
  `users_id` INT NOT NULL,
  `sysdeliverynotestatuses_id` INT NOT NULL,
  `transporters_id` INT NOT NULL,
  `lr_number` VARCHAR(32) NULL,
  `lr_date` DATETIME NULL,
  `invoice_number` VARCHAR(32) NULL,
  `cancelusers_id` INT NULL,
  `sub_total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `tax_total` DECIMAL(8,2) NOT NULL,
  `discount_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `rounding_total` DECIMAL(4,2) NOT NULL DEFAULT 0,
  `tax_total_cgst` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `tax_total_igst` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `tax_total_sgst` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `tax_total_cess` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `tax_total_vat` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `orders_id_string` VARCHAR(128) NULL,
  `po_string` VARCHAR(512) NULL,
  `notes` VARCHAR(128) NULL,
  `taxform_flag` TINYINT(1) NOT NULL DEFAULT 0,
  `exportform_flag` TINYINT(1) NOT NULL DEFAULT 0,
  `direct_invoice_flag` TINYINT(1) NOT NULL DEFAULT 0,
  `eway_bill_number` VARCHAR(32) NULL,
  `eway_bill_date` DATETIME NULL,
  `destination` VARCHAR(32) NOT NULL,
  `gate_pass_info` JSON  NULL,
  `eway_bill_info` JSON  NULL,
  `destination` VARCHAR(32) NOT NULL,
  `ship_addresses_id` INT NOT NULL,
  `syssyncstatuses_id` INT NOT NULL,
  `sync_failure_reason` text  NULL,
  `last_updated_by` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_delivery_notes_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_notes_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_notes_companies2`
    FOREIGN KEY (`customers_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_notes_transporters1`
    FOREIGN KEY (`transporters_id`)
    REFERENCES `transporters` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_notes_sysdeliverynotestatuses1`
    FOREIGN KEY (`sysdeliverynotestatuses_id`)
    REFERENCES `sysdeliverynotestatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_notes_users2`
    FOREIGN KEY (`cancelusers_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_notes_users3`
    FOREIGN KEY (`last_updated_by`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_notes_addresses1`
    FOREIGN KEY (`ship_addresses_id`)
    REFERENCES `addresses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_notes_syssyncstatuses1`
    FOREIGN KEY (`syssyncstatuses_id`)
    REFERENCES `syssyncstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_delivery_notes_users1_idx` ON `delivery_notes` (`users_id` ASC);

CREATE INDEX `fk_delivery_notes_companies1_idx` ON `delivery_notes` (`companies_id` ASC);

CREATE INDEX `fk_delivery_notes_companies2_idx` ON `delivery_notes` (`customers_id` ASC);

CREATE INDEX `fk_delivery_notes_transporters1_idx` ON `delivery_notes` (`transporters_id` ASC);

CREATE INDEX `fk_delivery_notes_sysdeliverynotestatuses1_idx` ON `delivery_notes` (`sysdeliverynotestatuses_id` ASC);

CREATE INDEX `fk_delivery_notes_users2_idx` ON `delivery_notes` (`cancelusers_id` ASC);

CREATE INDEX `fk_delivery_notes_users3_idx` ON `delivery_notes` (`last_updated_by` ASC);

CREATE INDEX `fk_delivery_notes_addresses1_idx` ON `delivery_notes` (`ship_addresses_id` ASC);

CREATE INDEX `fk_delivery_notes_syssyncstatuses1_idx` ON `delivery_notes` (`syssyncstatuses_id` ASC);


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
  `net_weight` DECIMAL(10,2) NULL,
  `gross_weight` DECIMAL(10,2) NULL,
  `delivery_notes_id` INT NULL,
  `cancelusers_id` INT NULL,
  `sub_total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `tax_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `discount_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
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
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_users2`
    FOREIGN KEY (`cancelusers_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slips_delivery_notes1`
    FOREIGN KEY (`delivery_notes_id`)
    REFERENCES `delivery_notes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_packing_slips_orders2_idx` ON `packing_slips` (`orders_id` ASC);

CREATE INDEX `fk_packing_slips_users1_idx` ON `packing_slips` (`users_id` ASC);

CREATE INDEX `fk_packing_slips_syspackingslipstatuses1_idx` ON `packing_slips` (`syspackingslipstatuses_id` ASC);

CREATE INDEX `fk_packing_slips_companies1_idx` ON `packing_slips` (`companies_id` ASC);

CREATE INDEX `fk_packing_slips_invoices1_idx` ON `packing_slips` (`invoices_id` ASC);

CREATE INDEX `fk_packing_slips_users2_idx` ON `packing_slips` (`cancelusers_id` ASC);

CREATE INDEX `fk_packing_slips_delivery_notes1_idx` ON `packing_slips` (`delivery_notes_id` ASC);


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
  `stock_quote_string` VARCHAR(128) NULL,
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
  `sub_total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `tax_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `discount_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `piece_count` INT NOT NULL DEFAULT 0,
  `order_unit_of_measures_id` INT NOT NULL,
  `notes` VARCHAR(128) NULL,
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
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_packing_slip_details_order_unit_of_measures3`
    FOREIGN KEY (`order_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
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

CREATE INDEX `fk_packing_slip_details_order_unit_of_measures3_idx` ON `packing_slip_details` (`order_unit_of_measures_id` ASC);


-- -----------------------------------------------------
-- Table `sysjournalentrytype`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysjournalentrytype` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `delivery_note_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery_note_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `delivery_notes_id` INT NOT NULL,
  `packing_slips_id` INT NULL,
  `packing_slip_details_id` INT NULL,
  `products_id` INT NOT NULL,
  `stock_buckets_id` INT NOT NULL,
  `sku` VARCHAR(32) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  `unit_of_measures_id` INT NOT NULL,
  `quantity_ordered_packed` DECIMAL(10,4) NOT NULL,
  `entered_unit_of_measures_id` INT NOT NULL,
  `quantity_entered_packed` DECIMAL(10,4) NOT NULL,
  `price` DECIMAL(8,2) NOT NULL,
  `sub_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `ship_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `tax_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `discount_total` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `tax_total_cgst` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `tax_total_igst` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `tax_total_sgst` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `tax_total_cess` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `tax_total_vat` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_delivery_note_details_delivery_notes1`
    FOREIGN KEY (`delivery_notes_id`)
    REFERENCES `delivery_notes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_note_details_packing_slips1`
    FOREIGN KEY (`packing_slips_id`)
    REFERENCES `packing_slips` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_note_details_packing_slip_details1`
    FOREIGN KEY (`packing_slip_details_id`)
    REFERENCES `packing_slip_details` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_note_details_products1`
    FOREIGN KEY (`products_id`)
    REFERENCES `products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_note_details_stock_buckets1`
    FOREIGN KEY (`stock_buckets_id`)
    REFERENCES `stock_buckets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_note_details_unit_of_measures1`
    FOREIGN KEY (`unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_delivery_note_details_unit_of_measures2`
    FOREIGN KEY (`entered_unit_of_measures_id`)
    REFERENCES `unit_of_measures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_delivery_note_details_delivery_notes1_idx` ON `delivery_note_details` (`delivery_notes_id` ASC);

CREATE INDEX `fk_delivery_note_details_packing_slips1_idx` ON `delivery_note_details` (`packing_slips_id` ASC);

CREATE INDEX `fk_delivery_note_details_packing_slip_details1_idx` ON `delivery_note_details` (`packing_slip_details_id` ASC);

CREATE INDEX `fk_delivery_note_details_products1_idx` ON `delivery_note_details` (`products_id` ASC);

CREATE INDEX `fk_delivery_note_details_stock_buckets1_idx` ON `delivery_note_details` (`stock_buckets_id` ASC);

CREATE INDEX `fk_delivery_note_details_unit_of_measures1_idx` ON `delivery_note_details` (`unit_of_measures_id` ASC);

CREATE INDEX `fk_delivery_note_details_unit_of_measures2_idx` ON `delivery_note_details` (`entered_unit_of_measures_id` ASC);


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
  `sysjournalentrytype_id` INT NOT NULL,
  `delivery_notes_id` INT NULL,
  `packing_slips_id` INT NULL,
  `orders_id` INT NULL,
  `delivery_note_details_id` INT NULL,
  `packing_slip_details_id` INT NULL,
  `order_details_id` INT NULL,
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
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_sysjournalentrytype1`
    FOREIGN KEY (`sysjournalentrytype_id`)
    REFERENCES `sysjournalentrytype` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_order_details1`
    FOREIGN KEY (`order_details_id`)
    REFERENCES `order_details` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_packing_slip_details1`
    FOREIGN KEY (`packing_slip_details_id`)
    REFERENCES `packing_slip_details` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_delivery_note_details1`
    FOREIGN KEY (`delivery_note_details_id`)
    REFERENCES `delivery_note_details` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stock_journal_delivery_notes1`
    FOREIGN KEY (`delivery_notes_id`)
    REFERENCES `delivery_notes` (`id`)
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

CREATE INDEX `fk_stock_journal_sysjournalentrytype1_idx` ON `stock_journal` (`sysjournalentrytype_id` ASC);

CREATE INDEX `fk_stock_journal_order_details1_idx` ON `stock_journal` (`order_details_id` ASC);

CREATE INDEX `fk_stock_journal_packing_slip_details1_idx` ON `stock_journal` (`packing_slip_details_id` ASC);

CREATE INDEX `fk_stock_journal_delivery_note_details1_idx` ON `stock_journal` (`delivery_note_details_id` ASC);

CREATE INDEX `fk_stock_journal_delivery_notes1_idx` ON `stock_journal` (`delivery_notes_id` ASC);


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


-- -----------------------------------------------------
-- Table `images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `document_id` INT NOT NULL,
  `document_type_char` VARCHAR(1) NOT NULL,
  `url` VARCHAR(128) NOT NULL,
  `url_large` VARCHAR(128) NULL,
  `description` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_images_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_images_companies1_idx` ON `images` (`companies_id` ASC);


-- -----------------------------------------------------
-- Table `syslovgroups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syslovgroups` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `companies_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_syslovgroups_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_syslovgroups_companies1_idx` ON `syslovgroups` (`companies_id` ASC);


-- -----------------------------------------------------
-- Table `lov_data`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lov_data` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(32) NOT NULL,
  `long_description` VARCHAR(128) NULL,
  `syslovgroups_id` INT NOT NULL,
  `companies_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_lov_data_syslovgroups1`
    FOREIGN KEY (`syslovgroups_id`)
    REFERENCES `syslovgroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_lov_data_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_lov_data_syslovgroups1_idx` ON `lov_data` (`syslovgroups_id` ASC);

CREATE INDEX `fk_lov_data_companies1_idx` ON `lov_data` (`companies_id` ASC);


-- -----------------------------------------------------
-- Table `syspaymentstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syspaymentstatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


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
  `bill_amount` DECIMAL(10,2) NOT NULL,
  `balance_amount` DECIMAL(10,2) NOT NULL,
  `syspaymentstatuses_id` INT NOT NULL,
  `paid_amount` DECIMAL(10,2) NULL,
  `approx_paid_date` DATETIME NULL,
  `next_reminder_date` DATETIME NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pending_bills_stage_companies1`
    FOREIGN KEY (`customers_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_pending_bills_stage_companies2`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_pending_bills_stage_syspaymentstatuses1`
    FOREIGN KEY (`syspaymentstatuses_id`)
    REFERENCES `syspaymentstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_pending_bills_stage_companies1_idx` ON `pending_bills` (`customers_id` ASC);

CREATE INDEX `fk_pending_bills_stage_companies2_idx` ON `pending_bills` (`companies_id` ASC);

CREATE INDEX `fk_pending_bills_stage_syspaymentstatuses1_idx` ON `pending_bills` (`syspaymentstatuses_id` ASC);

CREATE INDEX `fk_pending_bills_batch_number_idx` ON `pending_bills` (`companies_id` ASC, `customers_id` ASC, `bill_number` ASC);


-- -----------------------------------------------------
-- Table `sysproducthsn_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysproducthsn_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sysproducthsn_id` INT NOT NULL,
  `amount_min` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `amount_max` DECIMAL(12,2) NULL,
  `tax_percent_gst` DECIMAL(8,4) NOT NULL DEFAULT 0,
  `tax_percent_cgst` DECIMAL(8,4) NOT NULL DEFAULT 0,
  `tax_percent_igst` DECIMAL(8,4) NOT NULL DEFAULT 0,
  `tax_percent_sgst` DECIMAL(8,4) NOT NULL DEFAULT 0,
  `tax_percent_cess` DECIMAL(8,4) NOT NULL DEFAULT 0,
  `activation_start_date` DATETIME NOT NULL,
  `activation_end_date` DATETIME NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sysproducthsn_details_sysproducthsn1`
    FOREIGN KEY (`sysproducthsn_id`)
    REFERENCES `sysproducthsn` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_sysproducthsn_details_sysproducthsn1_idx` ON `sysproducthsn_details` (`sysproducthsn_id` ASC);


-- -----------------------------------------------------
-- Table `activities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `sessions_id` VARCHAR(32) NOT NULL,
  `route_type` VARCHAR(32) NOT NULL,
  `route` VARCHAR(256) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_activities_sessions1`
    FOREIGN KEY (`sessions_id`)
    REFERENCES `sessions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_activities_sessions1_idx` ON `activities` (`sessions_id` ASC);


-- -----------------------------------------------------
-- Table `activity_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_details` (
  `activities_id` BIGINT(20) NOT NULL,
  `information` JSON NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  CONSTRAINT `fk_activity_details_activities2`
    FOREIGN KEY (`activities_id`)
    REFERENCES `activities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_activity_details_activities1_idx` ON `activity_details` (`activities_id` ASC);


-- -----------------------------------------------------
-- Table `activity_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_details` (
  `activities_id` BIGINT(20) NOT NULL,
  `information` JSON NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  CONSTRAINT `fk_activity_details_activities2`
    FOREIGN KEY (`activities_id`)
    REFERENCES `activities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_activity_details_activities2_idx` ON `activity_details` (`activities_id` ASC);


-- -----------------------------------------------------
-- Table `syseventtypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syseventtypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `users_id` INT NOT NULL,
  `syseventtypes_id` INT NOT NULL,
  `document_id` INT NOT NULL,
  `syssyncstatuses_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_events_syseventtypes1`
    FOREIGN KEY (`syseventtypes_id`)
    REFERENCES `syseventtypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_events_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_events_syssyncstatuses1`
    FOREIGN KEY (`syssyncstatuses_id`)
    REFERENCES `syssyncstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_events_syseventtypes1_idx` ON `events` (`syseventtypes_id` ASC);

CREATE INDEX `fk_events_users1_idx` ON `events` (`users_id` ASC);

CREATE INDEX `fk_events_syssyncstatuses1_idx` ON `events` (`syssyncstatuses_id` ASC);


-- -----------------------------------------------------
-- Table `sysdocumenttypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysdocumenttypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
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
  `name` VARCHAR(64) NULL,
  `phone_number` VARCHAR(64) NULL,
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


-- -----------------------------------------------------
-- Table `sysgatepassstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysgatepassstatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gate_passes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gate_passes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `gate_pass_number` VARCHAR(32) NOT NULL,
  `gate_pass_date` DATETIME NOT NULL,
  `companies_id` INT NOT NULL,
  `vehicle_number` VARCHAR(32) NULL,
  `contact_name` VARCHAR(32) NULL,
  `sysgatepassstatuses_id` INT NOT NULL,
  `tempo_charges` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `transporter_charges` DECIMAL(8,2) NOT NULL DEFAULT 0,
  `notes` VARCHAR(512) NULL,
  `cancel_reason` VARCHAR(512) NULL,
  `cancelled_by` INT NULL,
  `created_by` INT NOT NULL,
  `last_updated_by` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_gate_passes_users1`
    FOREIGN KEY (`created_by`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_gate_passes_sysgatepassstatuses1`
    FOREIGN KEY (`sysgatepassstatuses_id`)
    REFERENCES `sysgatepassstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_gate_passes_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_gate_passes_users2`
    FOREIGN KEY (`cancelled_by`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_gate_passes_users3`
    FOREIGN KEY (`last_updated_by`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_gate_passes_users1_idx` ON `gate_passes` (`created_by` ASC);

CREATE INDEX `fk_gate_passes_sysgatepassstatuses1_idx` ON `gate_passes` (`sysgatepassstatuses_id` ASC);

CREATE INDEX `fk_gate_passes_companies1_idx` ON `gate_passes` (`companies_id` ASC);

CREATE INDEX `fk_gate_passes_users2_idx` ON `gate_passes` (`cancelled_by` ASC);

CREATE INDEX `fk_gate_passes_users3_idx` ON `gate_passes` (`last_updated_by` ASC);


-- -----------------------------------------------------
-- Table `gate_pass_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gate_pass_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `gate_passes_id` INT NOT NULL,
  `packing_slips_id` INT NOT NULL,
  `tempo_charges` DECIMAL(8,2) NULL DEFAULT 0,
  `transport_charges` DECIMAL(8,2) NULL DEFAULT 0,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_gate_pass_details_gate_passes1`
    FOREIGN KEY (`gate_passes_id`)
    REFERENCES `gate_passes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_gate_pass_details_packing_slips1`
    FOREIGN KEY (`packing_slips_id`)
    REFERENCES `packing_slips` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_gate_pass_details_gate_passes1_idx` ON `gate_pass_details` (`gate_passes_id` ASC);

CREATE INDEX `fk_gate_pass_details_packing_slips1_idx` ON `gate_pass_details` (`packing_slips_id` ASC);


-- -----------------------------------------------------
-- Table `tempos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tempos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `company_name` VARCHAR(128) NOT NULL,
  `driver_name` VARCHAR(256) NULL,
  `vehicle_number` VARCHAR(128) NULL,
  `sysstatuses_id` INT NOT NULL,
  `created_by` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tempos_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tempos_users1`
    FOREIGN KEY (`created_by`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_tempos_sysstatuses1`
    FOREIGN KEY (`sysstatuses_id`)
    REFERENCES `sysstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_tempos_companies1_idx` ON `tempos` (`companies_id` ASC);

CREATE INDEX `fk_tempos_users1_idx` ON `tempos` (`created_by` ASC);

CREATE INDEX `fk_tempos_sysstatuses1_idx` ON `tempos` (`sysstatuses_id` ASC);


-- -----------------------------------------------------
-- Table `custom_filters`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `custom_filters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  `sysdocumenttypes_id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `filters` JSON NOT NULL,
  `is_user_defined` TINYINT(1) NOT NULL,
  `show_in_dashboard` TINYINT(1) NOT NULL,
  `rank` INT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `usage_counter` INT NULL DEFAULT 0,
  `last_accessed` DATETIME NULL,
  `accessed_from` VARCHAR(45) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_custom_filters_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_custom_filters_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_custom_filters_sysdocumenttypes1`
    FOREIGN KEY (`sysdocumenttypes_id`)
    REFERENCES `sysdocumenttypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_custom_filters_companies1_idx` ON `custom_filters` (`companies_id` ASC);

CREATE INDEX `fk_custom_filters_users1_idx` ON `custom_filters` (`users_id` ASC);

CREATE INDEX `fk_custom_filters_sysdocumenttypes1_idx` ON `custom_filters` (`sysdocumenttypes_id` ASC);


-- -----------------------------------------------------
-- Table `sysuploadtypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysuploadtypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `uploads`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `uploads` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `sysuploadtypes_id` INT NOT NULL,
  `syssyncstatuses_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  `file_path` VARCHAR(256) NOT NULL,
  `format` VARCHAR(24) NOT NULL,
  `number_of_records` INT NOT NULL,
  `records_processed` INT NULL DEFAULT 0,
  `records_failed` INT NULL DEFAULT 0,
  `processed_time_seconds` INT NULL DEFAULT 0,
  `notes` VARCHAR(1024) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_uploads_sysuploadtypes1`
    FOREIGN KEY (`sysuploadtypes_id`)
    REFERENCES `sysuploadtypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_uploads_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_uploads_syssyncstatuses1`
    FOREIGN KEY (`syssyncstatuses_id`)
    REFERENCES `syssyncstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_uploads_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_uploads_sysuploadtypes1_idx` ON `uploads` (`sysuploadtypes_id` ASC);

CREATE INDEX `fk_uploads_users1_idx` ON `uploads` (`users_id` ASC);

CREATE INDEX `fk_uploads_syssyncstatuses1_idx` ON `uploads` (`syssyncstatuses_id` ASC);

CREATE INDEX `fk_uploads_companies1_idx` ON `uploads` (`companies_id` ASC);


-- -----------------------------------------------------
-- Table `upload_error_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `upload_error_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uploads_id` BIGINT(20) NOT NULL,
  `line_number` INT NOT NULL,
  `failure_reason` VARCHAR(256) NOT NULL,
  `more` JSON NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_upload_detail_uploads1`
    FOREIGN KEY (`uploads_id`)
    REFERENCES `uploads` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_upload_detail_uploads1_idx` ON `upload_error_details` (`uploads_id` ASC);


-- -----------------------------------------------------
-- Table `sysnotificationformats`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysnotificationformats` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(45) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysnotificationtypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysnotificationtypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(45) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATE NOT NULL,
  PRIMARY KEY (`id`, `name`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysnotificationstatuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysnotificationstatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(45) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATE NOT NULL,
  PRIMARY KEY (`id`, `name`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `notifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `entities_id` INT NOT NULL,
  `document_id` INT NOT NULL,
  `sysdocumenttypes_id` INT NOT NULL,
  `sysnotificationformats_id` INT NOT NULL,
  `sysnotificationtypes_id` INT NOT NULL,
  `sysnotificationstatuses_id` INT NOT NULL,
  `parent_id` INT NULL,
  `destination` VARCHAR(256) NULL,
  `notes` VARCHAR(1024) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notifications_sysdocumenttypes1`
    FOREIGN KEY (`sysdocumenttypes_id`)
    REFERENCES `sysdocumenttypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_notifications_sysnotificationformats1`
    FOREIGN KEY (`sysnotificationformats_id`)
    REFERENCES `sysnotificationformats` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_notifications_sysnotificationtypes1`
    FOREIGN KEY (`sysnotificationtypes_id`)
    REFERENCES `sysnotificationtypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_notifications_sysnotificationstatuses1`
    FOREIGN KEY (`sysnotificationstatuses_id`)
    REFERENCES `sysnotificationstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_notifications_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_notifications_companies2`
    FOREIGN KEY (`entities_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_notifications_sysdocumenttypes1_idx` ON `notifications` (`sysdocumenttypes_id` ASC);

CREATE INDEX `fk_notifications_sysnotificationformats1_idx` ON `notifications` (`sysnotificationformats_id` ASC);

CREATE INDEX `fk_notifications_sysnotificationtypes1_idx` ON `notifications` (`sysnotificationtypes_id` ASC);

CREATE INDEX `fk_notifications_sysnotificationstatuses1_idx` ON `notifications` (`sysnotificationstatuses_id` ASC);

CREATE INDEX `fk_notifications_companies1_idx` ON `notifications` (`companies_id` ASC);

CREATE INDEX `fk_notifications_companies2_idx` ON `notifications` (`entities_id` ASC);


-- -----------------------------------------------------
-- Table `customer_notifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `sysnotificationtypes_id` INT NOT NULL,
  `customers_id` INT NOT NULL,
  `active` TINYINT NOT NULL DEFAULT 0,
  `phone_number` VARCHAR(24) NULL,
  `email` TEXT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_customer_notifications_sysnotificationtypes1`
    FOREIGN KEY (`sysnotificationtypes_id`)
    REFERENCES `sysnotificationtypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_customer_notifications_companies1`
    FOREIGN KEY (`customers_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_customer_notifications_companies2`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_customer_notifications_sysnotificationtypes1_idx` ON `customer_notifications` (`sysnotificationtypes_id` ASC);

CREATE INDEX `fk_customer_notifications_companies1_idx` ON `customer_notifications` (`customers_id` ASC);

CREATE INDEX `fk_customer_notifications_companies2_idx` ON `customer_notifications` (`companies_id` ASC);


-- -----------------------------------------------------
-- Table `syssubscriptiontemplatedetails`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syssubscriptiontemplatedetails` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `syssubscriptiontemplates_id` INT NOT NULL,
  `sysconfigurations_id` INT NOT NULL,
  `value` VARCHAR(64) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_syssubscriptiontemplatedetails_syssubscriptiontemplates1`
    FOREIGN KEY (`syssubscriptiontemplates_id`)
    REFERENCES `syssubscriptiontemplates` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_syssubscriptiontemplatedetails_sysconfigurations1`
    FOREIGN KEY (`sysconfigurations_id`)
    REFERENCES `sysconfigurations` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_syssubscriptiontemplatedetails_syssubscriptiontemplates1_idx` ON `syssubscriptiontemplatedetails` (`syssubscriptiontemplates_id` ASC);

CREATE INDEX `fk_syssubscriptiontemplatedetails_sysconfigurations1_idx` ON `syssubscriptiontemplatedetails` (`sysconfigurations_id` ASC);


-- -----------------------------------------------------
-- Table `pending_bills_stage`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pending_bills_stage` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `batch_number` VARCHAR(36) NOT NULL,
  `bill_number` VARCHAR(64) NOT NULL,
  `bill_ref_number` VARCHAR(64) NULL,
  `companies_id` INT NOT NULL,
  `customers_id` INT NOT NULL,
  `bill_date` DATETIME NOT NULL,
  `due_date` DATETIME NOT NULL,
  `bill_amount` DECIMAL(10,2) NOT NULL,
  `balance_amount` DECIMAL(10,2) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pending_bills_stage_companies1`
    FOREIGN KEY (`customers_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_pending_bills_stage_companies2`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_pending_bills_stage_companies1_idx` ON `pending_bills_stage` (`customers_id` ASC);

CREATE INDEX `fk_pending_bills_stage_companies2_idx` ON `pending_bills_stage` (`companies_id` ASC);

CREATE INDEX `fk_pending_bills_stage_batch_number_idx` ON `pending_bills_stage` (`companies_id` ASC, `customers_id` ASC, `batch_number` ASC, `bill_number` ASC);


-- -----------------------------------------------------
-- Table `sysbillingpartners`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysbillingpartners` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `api_key` VARCHAR(16) NOT NULL,
  `api_secret` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `billing_companies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `billing_companies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `sysbillingpartners_id` INT NOT NULL,
  `partner_company_id` INT NOT NULL,
  `token_count` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_billing_companies_sysbillingpartners1`
    FOREIGN KEY (`sysbillingpartners_id`)
    REFERENCES `sysbillingpartners` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_billing_companies_sysbillingpartners1_idx` ON `billing_companies` (`sysbillingpartners_id` ASC);


-- -----------------------------------------------------
-- Table `sysbillingpackagetypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysbillingpackagetypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(256) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysbillingrenewals`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysbillingrenewals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(256) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sysbillingpackages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysbillingpackages` (
  `id` INT NOT NULL,
  `sku` VARCHAR(32) NOT NULL,
  `sysbillingrenewals_id` INT NOT NULL,
  `sysbillingpackagetypes_id` INT NOT NULL,
  `package_name` VARCHAR(45) NOT NULL,
  `package_qty` INT NULL,
  `threshold_qty` INT NULL,
  `price` INT NULL,
  `parent_id` INT NULL,
  `isactive` TINYINT NOT NULL DEFAULT 1,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sysbillingpackages_sysbillingrenewals1`
    FOREIGN KEY (`sysbillingrenewals_id`)
    REFERENCES `sysbillingrenewals` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sysbillingpackages_sysbillingpackagetypes1`
    FOREIGN KEY (`sysbillingpackagetypes_id`)
    REFERENCES `sysbillingpackagetypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_sysbillingpackages_sysbillingpackages1`
    FOREIGN KEY (`parent_id`)
    REFERENCES `sysbillingpackages` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_sysbillingpackages_sysbillingrenewals1_idx` ON `sysbillingpackages` (`sysbillingrenewals_id` ASC);

CREATE INDEX `fk_sysbillingpackages_sysbillingpackagetypes1_idx` ON `sysbillingpackages` (`sysbillingpackagetypes_id` ASC);

CREATE INDEX `fk_sysbillingpackages_sysbillingpackages1_idx` ON `sysbillingpackages` (`parent_id` ASC);


-- -----------------------------------------------------
-- Table `billing_company_packages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `billing_company_packages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `billing_companies_id` INT NOT NULL,
  `sysbillingpackages_id` INT NOT NULL,
  `price` INT NOT NULL,
  `activation_start_date` DATETIME NOT NULL,
  `activation_end_date` DATETIME NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_billing_company_packages_sysbillingpackages1`
    FOREIGN KEY (`sysbillingpackages_id`)
    REFERENCES `sysbillingpackages` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_billing_company_packages_billing_companies1`
    FOREIGN KEY (`billing_companies_id`)
    REFERENCES `billing_companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_billing_company_packages_sysbillingpackages1_idx` ON `billing_company_packages` (`sysbillingpackages_id` ASC);

CREATE INDEX `fk_billing_company_packages_billing_companies1_idx` ON `billing_company_packages` (`billing_companies_id` ASC);


-- -----------------------------------------------------
-- Table `billing_token_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `billing_token_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `billing_companies_id` INT NOT NULL,
  `description` VARCHAR(256) NULL,
  `transaction_token` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_billing_token_transactions_billing_companies1`
    FOREIGN KEY (`billing_companies_id`)
    REFERENCES `billing_companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_billing_token_transactions_billing_companies1_idx` ON `billing_token_transactions` (`billing_companies_id` ASC);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
