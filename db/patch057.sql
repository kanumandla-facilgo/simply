insert into syseventtypes values(1009, 'Billing Company', NOW(), NOW());


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


insert into sysbillingpartners values(1001, 'Simply', 'S#12121212', MD5(CONCAT('A9074#321', '78778778878787', 'Arihant')), now(), now());
insert into sysbillingpartners values(1002, 'SimplyRetail', 'SRE#81818181', MD5(CONCAT('A9074#321', '29229229929292', 'Arihant')), now(), now());
insert into sysbillingpartners values(1003, 'SimplyReminders', 'SR#34343434', MD5(CONCAT('A9074#321', '64664664464646', 'Arihant')), now(), now());

insert into sysbillingrenewals values(2001, 'Yearly', 'Yearly', NOW(), NOW());

insert into sysbillingpackagetypes values(3001, 'Token', 'Token', NOW(), NOW());

insert into sysbillingpackages values(4001, 'SRYFree200', 2001, 3001, 'SRTFree200', 200, 225, 0, null, 1, now(), now());

insert into sysbillingpackages values(4002, 'STY15000', 2001, 3001, 'STY15000', 15000, 15150, 0, null, 1, now(), now());

insert into sysbillingpackages values(4003, 'SREY15000', 2001, 3001, 'SRY15000', 15000, 15150, 0, null, 1, now(), now());

insert into billing_companies(name, sysbillingpartners_id, partner_company_id, token_count, created, last_updated)
select name, Case when syssubscriptiontemplates_id = 6300 then 1001 
              when syssubscriptiontemplates_id = 6301 then 1002
              when syssubscriptiontemplates_id = 6302 then 1003 END as partner_id, 
       id, 15000, NOW(),NOW() 
from companies 
where companytypes_id = 4701;

insert into billing_company_packages(billing_companies_id, sysbillingpackages_id, price, activation_start_date, activation_end_date, created, last_updated)
select id, CASE WHEN sysbillingpartners_id = 1001 then 4002
                when sysbillingpartners_id = 1003 then 4001 END as sysbillingpackages_id,
       CASE WHEN sysbillingpartners_id = 1001 then 200
                when sysbillingpartners_id = 1003 then 15000 END as price,
         NOW() as activation_start_date, DATE_ADD(NOW(), INTERVAL 1 YEAR) as activation_end_date, NOW(), NOW()
from billing_companies;


insert into billing_company_packages(billing_companies_id, sysbillingpackages_id, price, activation_start_date, activation_end_date, created, last_updated)
select id, 4003 as sysbillingpackages_id,
       15000 as price,
       NOW() as activation_start_date, DATE_ADD(NOW(), INTERVAL 1 YEAR) as activation_end_date, NOW(), NOW()
from billing_companies where sysbillingpartners_id = 1002;

update syssubscriptiontemplatedetails
set value = 1 
where sysconfigurations_id in (25052, 25055, 25056,25057, 25350);

insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) values(6301, 25067, 0, now(), now());

insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) values(6301, 25068, 0, now(), now());