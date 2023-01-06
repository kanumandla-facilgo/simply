alter table pending_bills modify bill_amount Decimal(10,2) NOT NULL;
alter table pending_bills modify bill_amount Decimal(10,2);


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

CREATE INDEX `fk_pending_bills_stage_companies1_idx` ON `pending_bills_stage` (`customers_id` ASC) ;

CREATE INDEX `fk_pending_bills_stage_companies2_idx` ON `pending_bills_stage` (`companies_id` ASC) ;

update addresses b
inner join companies c on c.bill_addresses_id = b.id
inner join addresses a on c.addresses_id = a.id
set b.address1 = a.address1, b.address2 = a.address2, b.address3 = a.address3, 
b.state = a.state, b.city = a.city, b.pin = a.pin, b.phone1 = a.phone1,  b.phone2 = a.phone2,  b.email1 = a.email1,  b.email2 = a.email2;

update addresses a
inner join companies c on a.id = c.addresses_id
set a.phone1 = '02718-261591', a.email1 = 'go.mbtowel@gmail.com'
where c.id = 10003;


update configurations
set value = '/upload/logo_mafatlal.jpg'
where sysconfigurations_id = 10000 and companies_id = 13346;
