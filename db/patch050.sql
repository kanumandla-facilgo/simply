INSERT INTO sysuploadtypes VALUES (1004, 'Bills', NOW(), NOW());

insert into syseventtypes values(1007, 'Bill Upload', NOW(), NOW());

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


insert into syspaymentstatuses values (5800, 'Active', now(), now());
insert into syspaymentstatuses values (5801, 'Paid', now(), now());
insert into syspaymentstatuses values (5802, 'Partially Paid', now(), now());
insert into syspaymentstatuses values (5803, 'Deleted', now(), now());


ALTER TABLE pending_bills
ADD COLUMN bill_amount int not null AFTER due_date;

ALTER TABLE pending_bills
ADD COLUMN paid_amount int not null AFTER balance_amount;

ALTER TABLE pending_bills
ADD COLUMN syspaymentstatuses_id int not null AFTER approx_paid_date;

update pending_bills
set syspaymentstatuses_id = 5800, bill_amount = balance_amount + paid_amount
where id > 0;


alter table pending_bills drop foreign key fk_pending_bills_sysstatuses1;
alter table pending_bills drop index fk_pending_bills_sysstatuses1_idx;
alter table pending_bills drop column sysstatuses_id;

alter table pending_bills add constraint fk_pending_bills_syspaymentstatuses1 foreign key (`syspaymentstatuses_id`) References `syspaymentstatuses`(id);

CREATE INDEX `fk_pending_bills_syspaymentstatuses1_idx` ON `pending_bills` (`syspaymentstatuses_id` ASC);

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5651, 'Upload Receivables', 'Upload Receivables', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5651, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5651, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5651, 0, now(), now()
from roles r
where sysroles_id IN (4005);


-- -----------------------------------------------------

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

CREATE INDEX `fk_notifications_sysdocumenttypes1_idx` ON `notifications` (`sysdocumenttypes_id` ASC) ;

CREATE INDEX `fk_notifications_sysnotificationformats1_idx` ON `notifications` (`sysnotificationformats_id` ASC) ;

CREATE INDEX `fk_notifications_sysnotificationtypes1_idx` ON `notifications` (`sysnotificationtypes_id` ASC) ;

CREATE INDEX `fk_notifications_sysnotificationstatuses1_idx` ON `notifications` (`sysnotificationstatuses_id` ASC) ;

CREATE INDEX `fk_notifications_companies1_idx` ON `notifications` (`companies_id` ASC) ;

CREATE INDEX `fk_notifications_companies2_idx` ON `notifications` (`entities_id` ASC) ;


insert into sysnotificationformats(id, name, description, created, last_updated) values (5900, 'Email', 'Email Notififaction', NOW(), NOW());
insert into sysnotificationformats(id, name, description, created, last_updated) values (5901, 'SMS', 'SMS Notififaction', NOW(), NOW());

INSERT INTO sysnotificationtypes VALUES (5801, 'Order', 'Order Create Notification', NOW(), NOW());
INSERT INTO sysnotificationtypes VALUES (5802, 'Catalog Share', 'Catalog Share Notification', NOW(), NOW());
INSERT INTO sysnotificationtypes VALUES (5803, 'Payment Reminder', 'Payment Reminder Notification', NOW(), NOW());

insert into sysnotificationstatuses values (1001, 'Pending', 'Pending', now(), now());
insert into sysnotificationstatuses values (1002, 'Error', 'Error', now(), now());
insert into sysnotificationstatuses values (1003, 'Delivered', 'Delivered', now(), now());
insert into sysnotificationstatuses values (1004, 'Undelivered', 'Undelivered', now(), now());


-- -----------------------------------------------------
-- Table `customer_notifications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `sysnotificationtypes_id` INT NOT NULL,
  `customers_id` INT NOT NULL,
  `active` TINYINT NOT NULL DEFAULT 0,
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

CREATE INDEX `fk_customer_notifications_sysnotificationtypes1_idx` ON `customer_notifications` (`sysnotificationtypes_id` ASC) ;

CREATE INDEX `fk_customer_notifications_companies1_idx` ON `customer_notifications` (`customers_id` ASC) ;

CREATE INDEX `fk_customer_notifications_companies2_idx` ON `customer_notifications` (`companies_id` ASC) ;

-- Only for MBTowel turn on payment reminder notifications
insert into customer_notifications (companies_id, sysnotificationtypes_id, customers_id, active, created, last_updated)
select c.parent_id, 5803, c.id, 1, NOW(), NOW() 
from companies c
where syscompanytypes_id = 4702 and c.parent_id = 10003;

-- Others turn off payment reminder notifications
insert into customer_notifications (companies_id, sysnotificationtypes_id, customers_id, active, created, last_updated)
select c.parent_id, 5803, c.id, 0, NOW(), NOW() 
from companies c
where syscompanytypes_id = 4702 and c.parent_id <> 10003;

-- Only for MBTowel turn on payment reminder notifications
insert into customer_notifications (companies_id, sysnotificationtypes_id, customers_id, active, created, last_updated)
select c.parent_id, 5801, c.id, 1, NOW(), NOW() 
from companies c
where syscompanytypes_id = 4702 and c.parent_id = 10003;

-- Others turn off payment reminder notifications
insert into customer_notifications (companies_id, sysnotificationtypes_id, customers_id, active, created, last_updated)
select c.parent_id, 5801, c.id, 0, NOW(), NOW() 
from companies c
where syscompanytypes_id = 4702 and c.parent_id <> 10003;

-- Only for MBTowel turn on payment reminder notifications
insert into customer_notifications (companies_id, sysnotificationtypes_id, customers_id, active, created, last_updated)
select c.parent_id, 5802, c.id, 1, NOW(), NOW() 
from companies c
where syscompanytypes_id = 4702;


-- -----------------------------------------------------
-- Table `syssubscriptiontemplates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syssubscriptiontemplates` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `description` VARCHAR(512) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


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

DELETE FROM configurations WHERE sysconfigurations_id >= 25000;

DELETE FROM sysconfigurations WHERE id >= 25000;

insert into sysconfigurations values (25001, 'module_approval_rate_diff', 'approval module rate diff', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25002, 'module_approval_payment_due', 'approval module payment due', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25003, 'module_approval_credit_limit', 'approval module credit limit', '1,0', '1', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25050, 'module_payment_terms', 'If business has 30/60/90 day payment term', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25051, 'module_rate_categories', 'if one product has multiple rates', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25052, 'module_catalog_share', 'Catalog Share', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25053, 'module_transporters', 'Module Transporters', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25054, 'module_agents', 'Module Agents', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25055, 'module_orders', 'Module Order', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25056, 'module_inventory', 'Module Inventory', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25057, 'module_users', 'Module Users', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25058, 'module_customers', 'Module Customers', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25059, 'module_reports', 'Module Reports', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25060, 'module_outstanding', 'Module Outstanding', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25061, 'module_packing_slips', 'Module Packing Slip', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25062, 'module_delivery_notes', 'Module Delivery Notes', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25063, 'module_gate_passes', 'Module Gate Passes', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25064, 'module_customer_ship_address', 'Module Ship Address', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25065, 'module_customer_bill_address', 'Module Bill Address', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25066, 'module_customer_gst', 'Module Customer GST', '1,0', '1', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25151, 'module_integration_customer', 'Customer Integration', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25152, 'module_integration_payment', 'Payment Integration', '1,0', '0', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25201, 'module_notification_sms', 'SMS Notification', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25202, 'module_notification_email', 'Email Notification', '1,0', '1', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25250, 'module_agent_login', 'Module Agent Login', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25251, 'module_salesman', 'Module Agent Login', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25252, 'module_customer_login', 'Module Customer Login', '1,0', '1', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25350, 'module_product_stock', 'Module Stock', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25351, 'module_product_kits', 'Module Kit', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25352, 'module_product_bundles', 'Module Bundle', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25353, 'module_product_product_heads', 'Module Product Head', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25354, 'module_product_multiple_units', 'Module Product multiple Unit', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25355, 'module_product_unit_restrictions', 'Product Unit Restrictions', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25356, 'module_product_hsn', 'Product HSN', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25357, 'module_product_price_groups', 'Product Price Groups', '1,0', '1', 6001, 0, 1, 1, now(), now());

insert into syssubscriptiontemplates values (6300, 'Platinum', 'Platinum', NOW(), NOW());
insert into syssubscriptiontemplates values (6301, 'Slim', 'Slim', NOW(), NOW());
insert into syssubscriptiontemplates values (6302, 'Payment Reminder', 'Payment Reminder', NOW(), NOW());

-- -- ----------------------------------------
-- Platinum (Full)
-- ----------------------------------------
insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) 
select 6300, id, default_value, now(), now()
from sysconfigurations
where sysconfigurationtypes_id = 6001;

-- ----------------------------------------
-- Slim
-- ----------------------------------------
insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) 
select 6301, id, default_value, now(), now()
from sysconfigurations
where sysconfigurationtypes_id = 6001 AND id < 25000;

insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) 
select 6301, id, '0', now(), now()
from sysconfigurations
where sysconfigurationtypes_id = 6001 AND id >= 25000;

update syssubscriptiontemplatedetails set value = 1 
where syssubscriptiontemplates_id = 6301 
AND sysconfigurations_id in (select id from sysconfigurations where name in ('module_customers', 'module_orders', 'module_inventory', 'module_reports'));

-- ----------------------------------------
-- payment reminder
-- ----------------------------------------
insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) 
select 6302, id, default_value, now(), now()
from sysconfigurations
where sysconfigurationtypes_id = 6001 AND id < 25000;

insert into syssubscriptiontemplatedetails (syssubscriptiontemplates_id, sysconfigurations_id, value, created, last_updated) 
select 6302, id, '0', now(), now()
from sysconfigurations
where sysconfigurationtypes_id = 6001 AND id >= 25000;

update syssubscriptiontemplatedetails set value = 1 
where syssubscriptiontemplates_id = 6302
AND sysconfigurations_id in (select id from sysconfigurations where name in ('module_customers', 'module_outstanding', 'module_notification_sms', 'module_notification_email'));

-- Now for current companies, add all values
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select s.default_value, c.id, s.id, now(), now()
from sysconfigurations s, companies c
where c.syscompanytypes_id = 4701
AND s.id >= 25000;

-- update GST # to upper case
UPDATE companies SET gst_number = UPPER(gst_number) WHERE gst_number IS NOT NULL AND gst_number <> '';

UPDATE configurations SET value = 1 WHERE companies_id = 10003 AND sysconfigurations_id IN (25065, 25066);

UPDATE unit_of_measures set short_name = 'pcs' where id = 100;
UPDATE unit_of_measures set short_name = 'set' where id = 101;
UPDATE unit_of_measures set short_name = 'mm' where id = 200;
UPDATE unit_of_measures set short_name = 'cm' where id = 201;
UPDATE unit_of_measures set short_name = 'mtr' where id = 202;
UPDATE unit_of_measures set short_name = 'gm' where id = 300;
UPDATE unit_of_measures set short_name = 'kg' where id = 301;

UPDATE unit_of_measures u1
INNER JOIN unit_of_measures u2 ON u1.master_id = u2.id
SET u1.short_name = u2.short_name;

UPDATE configurations SET value = 0 WHERE companies_id <> 10003 and sysconfigurations_id IN (SELECT id FROM sysconfigurations WHERE name = 'module_product_unit_restrictions');

UPDATE products SET is_qty_uom_restricted = 1, is_quote_uom_restricted = 1 WHERE companies_id <> 10003;

UPDATE configurations SET value = '7.1' WHERE sysconfigurations_id = 7000 and companies_id = 1;

UPDATE products SET default_sell_qty = 40 WHERE default_qty_uom_id = 5012 and companies_id = 10003;
UPDATE products SET default_sell_qty = 100 WHERE default_qty_uom_id = 5013 and companies_id = 10003;
UPDATE products SET default_sell_qty = 10 WHERE default_qty_uom_id = 5008 and companies_id = 10003;
UPDATE products SET default_sell_qty = 1 WHERE default_qty_uom_id not in (5008, 5012, 5013) and companies_id = 10003;

UPDATE configurations SET value = 0 WHERE companies_id not in (10003, 11409) and sysconfigurations_id IN (SELECT id FROM sysconfigurations WHERE name = 'module_product_bundles');

alter table companies add column syssubscriptiontemplates_id int null AFTER companytypes_id;

alter table companies add constraint fk_companies_syssubscriptiontemplates foreign key (`syssubscriptiontemplates_id`) References `syssubscriptiontemplates`(id);

CREATE INDEX `fk_companies_syssubscriptiontemplates1_idx` ON `companies` (`syssubscriptiontemplates_id` ASC);

update companies set syssubscriptiontemplates_id = 6300 where syscompanytypes_id = 4701;

update sysproducthsn set name = '9404 - NonCotton' where id = 6005;

insert into sysproducthsn values (0, '0000', '0000 - No Tax', 'No Tax HSN', '0000', now(), now());

insert into sysproducthsn_details (sysproducthsn_id, amount_min, amount_max, tax_percent_gst, tax_percent_cgst, tax_percent_igst, tax_percent_sgst, tax_percent_cess, activation_start_date, activation_end_date, created, last_updated)
values (0, 0, null, 0, 0, 0, 0, 0, '2018-01-01', null, now(), now());

UPDATE sysconfigurations SET default_value = '20' WHERE id = 10010;

UPDATE sysconfigurations SET default_value = '0' WHERE id IN (20050, 20060, 20070);

UPDATE configurations SET value = '0' WHERE sysconfigurations_id IN (20050, 20060, 20070); 

-- TODO: If module is off, set the default value in createCustomer
-- TODO: Test all the configurations
-- TODO: Take each config and look at consequences of entire app and do needful
-- TODO: Set the subscription template for all the three templates
-- TODO: What happens in edit customer if we turn off particular module after the usage?
-- TODO: Shall we add is_system column in most masters to use it if module is off?
-- TODO: default_payment_term_id etc usage?
