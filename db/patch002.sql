ALTER TABLE `unit_of_measures` 
ADD COLUMN `short_name` VARCHAR(12) NULL AFTER `description`;

update unit_of_measures set short_name = left(name, 12);

update unit_of_measures set short_name = 'Set' where id in (5015, 5016, 5017);

ALTER TABLE `unit_of_measures` 
CHANGE COLUMN `short_name` `short_name` VARCHAR(12) NOT NULL;

ALTER TABLE `packing_slip_details` 
ADD COLUMN `notes` VARCHAR(128) NULL AFTER `quantity_entered_packed`;

INSERT INTO sysorderstatuses VALUES (4205, 'Cancelled', 'Order is Cancelled', NOW(), NOW());

update sysorderstatuses set name = 'Rejected', description = 'Order is rejected' where id = 4204;
 
insert into sysworkflowstatuses values (5105, 'Cancelled', now(), now());

ALTER TABLE `orders` 
ADD COLUMN `cancelusers_id` INT NULL DEFAULT NULL AFTER `approverusers_id`,
ADD INDEX `fk_orders_users4_idx` (`cancelusers_id` ASC);

ALTER TABLE `orders` 
ADD CONSTRAINT `fk_orders_users4`
  FOREIGN KEY (`cancelusers_id`)
  REFERENCES `users` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5002, 'Cancel Order', 'Allow cancelling any order', '1,0', '1', '0', '1', '1', '0', '0', '0', 0, 1, 0, 0, 4300, now(), now());
show warnings;

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5002, 0, now(), now()
from roles r
where sysroles_id IN (4002, 4004, 4005);
show warnings;

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5002, 0, now(), now()
from roles r
where sysroles_id IN (4003);
show warnings;

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5464, 'Cancel Packing Slip', 'Allow cancelling packing slip', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5464, 0, now(), now()
from roles r
where sysroles_id IN (4002);
show warnings;

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5464, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);
show warnings;

CREATE TABLE IF NOT EXISTS `sysjournalentrytype` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

ALTER TABLE `stock_journal` 
ADD COLUMN `sysjournalentrytype_id` INT NULL AFTER `transaction_date`,
ADD INDEX `fk_stock_journal_sysjournalentrytype1_idx` (`sysjournalentrytype_id` ASC);
ALTER TABLE `stock_journal` 
ADD CONSTRAINT `fk_stock_journal_sysjournalentrytype1`
  FOREIGN KEY (`sysjournalentrytype_id`)
  REFERENCES `sysjournalentrytype` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
insert into sysjournalentrytype values (5400, 'Stock Entry', 'Stock creation', now(), now());
insert into sysjournalentrytype values (5401, 'Packing slip Entry', 'Packing slip creation', now(), now());
insert into sysjournalentrytype values (5402, 'Packing slip cancellation', 'Packing slip cancellation', now(), now());

update stock_journal set sysjournalentrytype_id = 5400 where system_notes = 'Stock entry';
update stock_journal set sysjournalentrytype_id = 5401 where system_notes = 'Packing Slip Entry';

ALTER TABLE `stock_journal` 
DROP FOREIGN KEY `fk_stock_journal_sysjournalentrytype1`;

ALTER TABLE `stock_journal` 
CHANGE COLUMN `sysjournalentrytype_id` `sysjournalentrytype_id` INT(11) NOT NULL ;

ALTER TABLE `stock_journal` 
ADD CONSTRAINT `fk_stock_journal_sysjournalentrytype1`
  FOREIGN KEY (`sysjournalentrytype_id`)
  REFERENCES `sysjournalentrytype` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
UPDATE syspackingslipstatuses SET name = 'Pending Dispatch', description = 'Pending dispatch' where id = 5200;
UPDATE syspackingslipstatuses SET name = 'Dispatched', description = 'Dispatched' where id = 5201;
insert into syspackingslipstatuses values (5202, 'Completed', 'Completed', now(), now());
insert into syspackingslipstatuses values (5203, 'Cancelled', 'Cancelled', now(), now());

ALTER TABLE `packing_slips` 
ADD COLUMN `cancelusers_id` INT NULL AFTER `weight`,
ADD INDEX `fk_packing_slip_users2_idx` (`cancelusers_id` ASC);
ALTER TABLE `packing_slips` 
ADD CONSTRAINT `fk_packing_slip_users2`
  FOREIGN KEY (`cancelusers_id`)
  REFERENCES `users` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
ALTER TABLE `orders` 
ADD COLUMN `approval_date` DATETIME NULL AFTER `approverusers_id`,
ADD COLUMN `cancellation_date` DATETIME NULL AFTER `cancelusers_id`,
ADD COLUMN `dispatch_date` DATETIME NULL AFTER `transporters_id`;

update orders set dispatch_date = created where sysorderstatuses_id = 4202 and dispatch_date is null;


ALTER TABLE `order_details` 
ADD COLUMN `stock_unit_of_measures_id` INT NULL AFTER `quantity_entered_packed`,
ADD COLUMN `stock_quantity` DECIMAL(10,4) NULL AFTER `stock_unit_of_measures_id`,
ADD COLUMN `stock_alt_unit_of_measures_id` INT NULL AFTER `stock_quantity`,
ADD COLUMN `stock_alt_quantity` DECIMAL(10,4) NULL AFTER `stock_alt_unit_of_measures_id`,
ADD INDEX `fk_order_details_unit_of_measures3_idx_idx` (`stock_unit_of_measures_id` ASC),
ADD INDEX `fk_order_details_unit_of_measures4_idx_idx` (`stock_alt_unit_of_measures_id` ASC);

ALTER TABLE `order_details` 
ADD CONSTRAINT `fk_order_details_unit_of_measures3_idx`
  FOREIGN KEY (`stock_unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_order_details_unit_of_measures4_idx`
  FOREIGN KEY (`stock_alt_unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

-- UPDATE order_details 
-- SET stock_unit_of_measures_id = unit_of_measures_id, 
--     stock_alt_unit_of_measures_id = entered_unit_of_measures_id,
--     stock_quantity = order_quantity,
--     stock_alt_quantity = entered_quantity;

-- PRODUCT ID 337 AND 480
 
UPDATE order_details d
SET d.unit_of_measures_id = 5018 WHERE d.entered_unit_of_measures_id = 5018 AND d.unit_of_measures_id = 5014;

UPDATE order_details d
INNER JOIN products p ON d.products_id = p.id INNER JOIN unit_of_measures u ON p.default_qty_uom_id = u.id
SET d.stock_unit_of_measures_id = u.id,
    d.stock_alt_unit_of_measures_id = IFNULL(u.end_uom_id, u.id);

UPDATE order_details d
SET d.entered_unit_of_measures_id = CASE WHEN d.entered_unit_of_measures_id = 5008 THEN 5014 ELSE d.entered_unit_of_measures_id END
WHERE d.stock_unit_of_measures_id = 5019 AND d.stock_alt_unit_of_measures_id = 5014;

UPDATE order_details d
SET d.unit_of_measures_id = CASE WHEN d.unit_of_measures_id = 5008 THEN 5014 ELSE d.unit_of_measures_id END
WHERE d.stock_unit_of_measures_id = 5019 AND d.stock_alt_unit_of_measures_id = 5014;

UPDATE order_details d
SET    d.stock_quantity = CASE WHEN d.entered_unit_of_measures_id = d.stock_unit_of_measures_id THEN d.entered_quantity ELSE -1 END,
    d.stock_alt_quantity = CASE WHEN d.unit_of_measures_id = d.stock_alt_unit_of_measures_id THEN d.order_quantity ELSE -1 END;

UPDATE order_details d
SET    d.stock_alt_quantity = CASE WHEN d.entered_unit_of_measures_id = d.stock_alt_unit_of_measures_id THEN d.entered_quantity ELSE d.stock_alt_quantity END
WHERE stock_alt_quantity = -1;

UPDATE order_details d
SET    d.stock_quantity = CASE WHEN d.unit_of_measures_id = d.stock_unit_of_measures_id THEN d.order_quantity ELSE d.stock_quantity END
WHERE stock_quantity = -1;

UPDATE order_details d
INNER JOIN unit_conversion_details c ON c.unit_of_measures_id = d.stock_unit_of_measures_id AND c.from_uom_id = d.stock_alt_unit_of_measures_id AND c.to_uom_id = d.stock_unit_of_measures_id
SET d.stock_quantity = ROUND((d.entered_quantity * c.to_qty)/c.from_qty, 2)
WHERE d.stock_quantity = -1;

UPDATE order_details d
INNER JOIN unit_conversion_details c ON c.unit_of_measures_id = d.stock_unit_of_measures_id AND c.from_uom_id = d.stock_unit_of_measures_id  AND c.to_uom_id = d.stock_alt_unit_of_measures_id
SET d.stock_alt_quantity = ROUND((d.entered_quantity * c.to_qty)/c.from_qty, 2)
WHERE d.stock_alt_quantity = -1;

ALTER TABLE .`order_details` 
DROP FOREIGN KEY `fk_order_details_unit_of_measures3_idx`,
DROP FOREIGN KEY `fk_order_details_unit_of_measures4_idx`;

ALTER TABLE .`order_details` 
CHANGE COLUMN `stock_unit_of_measures_id` `stock_unit_of_measures_id` INT(11) NOT NULL ,
CHANGE COLUMN `stock_quantity` `stock_quantity` DECIMAL(10,4) NOT NULL ,
CHANGE COLUMN `stock_alt_unit_of_measures_id` `stock_alt_unit_of_measures_id` INT(11) NOT NULL ,
CHANGE COLUMN `stock_alt_quantity` `stock_alt_quantity` DECIMAL(10,4) NOT NULL ;

ALTER TABLE `order_details` 
ADD CONSTRAINT `fk_order_details_unit_of_measures3_idx`
  FOREIGN KEY (`stock_unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
ALTER TABLE `order_details` 
ADD CONSTRAINT `fk_order_details_unit_of_measures4_idx`
  FOREIGN KEY (`stock_alt_unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
