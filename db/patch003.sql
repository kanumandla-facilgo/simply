
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

-- -----------------------------------------------------
-- Table `delivery_note_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery_note_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `delivery_notes_id` INT NOT NULL,
  `packing_slips_id` INT NOT NULL,
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
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_delivery_note_details_delivery_notes1_idx` ON `delivery_note_details` (`delivery_notes_id` ASC);

CREATE INDEX `fk_delivery_note_details_packing_slips1_idx` ON `delivery_note_details` (`packing_slips_id` ASC);

insert into sysdeliverynotestatuses values (5500, 'Pending LR', now(), now());
insert into sysdeliverynotestatuses values (5501, 'Transported', now(), now());
insert into sysdeliverynotestatuses values (5502, 'Completed', now(), now());
insert into sysdeliverynotestatuses values (5503, 'Cancelled', now(), now());

ALTER TABLE `packing_slips` 
ADD COLUMN `delivery_notes_id` INT NULL AFTER `weight`,
ADD INDEX `fk_packing_slips_delivery_notes1_idx` (`delivery_notes_id` ASC);

ALTER TABLE `packing_slips` 
ADD CONSTRAINT `fk_packing_slips_delivery_notes1`
  FOREIGN KEY (`delivery_notes_id`)
  REFERENCES `delivery_notes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5500, 'Create Delivery Note', 'Allow creating delivery note', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5500, 0, now(), now()
from roles r
where sysroles_id IN (4002);
show warnings;

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5500, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);
show warnings;

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5501, 'Update Delivery Note', 'Allow updating delivery note', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5501, 0, now(), now()
from roles r
where sysroles_id IN (4002);
show warnings;

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5501, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);
show warnings;

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5502, 'Cancel Delivery Note', 'Allow cancelling delivery note', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5502, 0, now(), now()
from roles r
where sysroles_id IN (4002);
show warnings;

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5502, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);
show warnings;
