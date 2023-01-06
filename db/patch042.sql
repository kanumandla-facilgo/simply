
alter table customer_shares add column name varchar(64) default '' after users_id; 
alter table customer_shares add column phone_number varchar(24) default '' after name;

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

INSERT INTO sysdocumenttypes VALUES (1003, 'DeliveryNotes', NOW(), NOW());
INSERT INTO sysdocumenttypes VALUES (1004, 'PackingSlips', NOW(), NOW());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5551, 'Create Gate Pass', 'Allow creating gate pass', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5552, 'Update Gate Pass', 'Allow updating gate pass', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5553, 'Cancel Gate Pass', 'Allow cancelling gate pass', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5554, 'View Gate Pass', 'Allow viewing gate pass', '1,0', '1', '0', '1', '1', '0', '1', '0', 0, 1, 1, 1, 4303, now(), now());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5555, 'Edit Gate Pass number', 'Allow editing gate pass # if generated auto', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, p.id, 0, now(), now()
from roles r, syspermissions p
where sysroles_id IN (4002)
and p.id in (5551, 5552, 5553, 5554, 5555);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, p.id, 0, now(), now()
from roles r, syspermissions p
where sysroles_id IN (4003, 4004)
and p.id in (5551, 5552, 5553, 5554, 5555);


-- new tables and table modifications 

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
  `last_updated` DATETIME NOT NULL,
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

ALTER TABLE `gate_pass_details` 
ADD COLUMN `tempo_charges` DECIMAL(8,2) NULL DEFAULT 0 AFTER `packing_slips_id`,
ADD COLUMN `transport_charges` DECIMAL(8,2) NULL DEFAULT 0 AFTER `tempo_charges`;

-- new status entry
INSERT INTO sysgatepassstatuses values (6200, 'Created', now(), now());
INSERT INTO sysgatepassstatuses values (6201, 'Cancelled', now(), now());
INSERT INTO sysgatepassstatuses values (6202, 'Completed', now(), now());

INSERT INTO syspackingslipstatuses VALUES (5199, 'Pending Invoice', 'Goods are packed in Bale. Pending Invoice creation..', NOW(), NOW());

-- delivery note entry 
INSERT INTO sysdeliverynotestatuses VALUES (5499, 'Pending Dispatch', NOW(), NOW());

-- add configuration for auto gate pass # creation
INSERT INTO sysconfigurations values (20040, 'gate_pass_number_required', 'Company Gate Pass # Required', '1,0', '0', 6001, 0, 1, 127, now(), now());
INSERT INTO sysconfigurations values (20041, 'gate_pass_number_next_value', 'Company Next Gate Pass #', '', '1001', 6001, 0, 1, 7, now(), now());
INSERT INTO sysconfigurations values (20042, 'gate_pass_number_format', 'Company Gate Pass # format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
INSERT INTO sysconfigurations values (20043, 'gate_pass_number_edit_allowed', 'Gate Pass # edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT c.default_value, i.id, c.id, now(), now()
FROM   sysconfigurations c, companies i
WHERE  c.id IN (20040, 20041, 20042, 20043)
AND    i.syscompanytypes_id = 4701;

-- migration
INSERT INTO gate_passes(id, companies_id, gate_pass_number, gate_pass_date, sysgatepassstatuses_id, created_by, created, last_updated_by, last_updated)
VALUES (1000, 10003, '999', now(), 6202, 5, now(), 5, now());

INSERT INTO gate_pass_details(gate_passes_id, packing_slips_id, created, last_updated)
SELECT 1000, p.id, now(), now() FROM packing_slips p WHERE p.syspackingslipstatuses_id  IN (5201, 5202);

-- UPDATE sysdeliverynotestatuses SET name = 'Dispatched' WHERE id = 5500;
UPDATE sysdeliverynotestatuses SET name = 'Delivered' WHERE id = 5501;

-- Making all existing pending lr status as pending dispatch
UPDATE delivery_notes
SET sysdeliverynotestatuses_id = 5499
WHERE sysdeliverynotestatuses_id = 5500;

-- Making all existing pending dispatch packing slips to pending invoice status
UPDATE packing_slips
SET syspackingslipstatuses_id = 5199
WHERE syspackingslipstatuses_id = 5200;

-- Correcting status of all delivery notes to dispatched if all packing slips are in dispatched status
CREATE TEMPORARY TABLE cte
  SELECT d.id,
    SUM(CASE WHEN p.syspackingslipstatuses_id = 5201 THEN 1 ELSE 0 END) as StatusCount,
    COUNT(*) as TotalCount
  FROM delivery_notes d
  INNER JOIN delivery_note_details dn on d.id = dn.delivery_notes_id
  INNER JOIN packing_slips p on dn.packing_slips_id = p.id
  WHERE d.id in (SELECT d.Id
          FROM delivery_notes d
          INNER JOIN packing_slips p ON p.delivery_notes_id = d.Id)
  GROUP BY d.id;


UPDATE delivery_notes d
INNER JOIN cte c ON c.Id = d.Id
SET d.sysdeliverynotestatuses_id =
    CASE
      WHEN c.StatusCount = c.TotalCount THEN 5500
      ELSE d.sysdeliverynotestatuses_id          
    END
where c.StatusCount > 0 AND d.sysdeliverynotestatuses_id = 5499;

DROP TABLE cte;

-- -----------------------------------------------------
-- Table `tempos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tempos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `company_name` VARCHAR(128) NOT NULL,
  `driver_name` VARCHAR(256) NULL,
  `vehicle_number` VARCHAR(128) NULL,
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
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_tempos_companies1_idx` ON `tempos` (`companies_id` ASC);

CREATE INDEX `fk_tempos_users1_idx` ON `tempos` (`created_by` ASC);

ALTER TABLE delivery_notes ADD COLUMN gate_pass_info JSON NULL AFTER `destination`;

-- migration script to update gate pass json in delivery notes
UPDATE delivery_notes dn
    INNER JOIN (
      SELECT dnid, CONCAT('[', better_result, ']') AS best_result  FROM
      (
        SELECT dnid, GROUP_CONCAT('{', my_json, '}' SEPARATOR ',') AS better_result FROM
        (
          SELECT dnid,
          CONCAT
          ( 
            '"gate_pass_number":', '"', gpno   , '"', ',' 
            '"id":', '"', gpid, '"', ','
            '"gate_pass_date":', '"', gpd, '"'
          ) AS my_json
          FROM ( 
          SELECT DISTINCT dn.delivery_notes_id as dnid, g.gate_pass_number as gpno, g.id as gpid, g.gate_pass_date as gpd
          FROM packing_slips p 
                    INNER JOIN delivery_note_details dn ON p.id = dn.packing_slips_id
          INNER JOIN gate_pass_details gd on dn.packing_slips_id = gd.packing_slips_id 
          INNER JOIN gate_passes g on g.id = gd.gate_passes_id 
          WHERE g.sysgatepassstatuses_id = 6202
                    ) q
        )  AS more_json group by dnid
      ) AS yet_more_json) d ON dn.id = d.dnid
    SET dn.gate_pass_info = d.best_result;
