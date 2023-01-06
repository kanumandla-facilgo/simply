
insert into sysconfigurations values (20030, 'customer_code_required', 'Company Customer Code Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20031, 'customer_code_next_value', 'Company Customer Code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20032, 'customer_code_format', 'Company Customer Code format', '%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20033, 'customer_code_edit_allowed', 'Customer Code edit allowed even if auto', '1,0', '0', 6001, 0, 1, 127, now(), now());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values (0, 10001, 20030, NOW(), NOW());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values (1001, 10001, 20031, NOW(), NOW());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('%d', 10001, 20032, NOW(), NOW());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('0', 10001, 20033, NOW(), NOW());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values (0, 10003, 20030, NOW(), NOW());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values (101121, 10003, 20031, NOW(), NOW());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('%d', 10003, 20032, NOW(), NOW());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('0', 10003, 20033, NOW(), NOW());

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5207, 'Edit Customer Code', 'Allow editing customer code if generated auto', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5207, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5207, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

ALTER TABLE `delivery_note_details` 
CHANGE COLUMN `sub_total` `sub_total` DECIMAL(10,2) NOT NULL DEFAULT '0.00' ;

ALTER TABLE `delivery_notes` 
CHANGE COLUMN `sub_total` `sub_total` DECIMAL(12,2) NOT NULL DEFAULT '0.00' ,
CHANGE COLUMN `discount_total` `discount_total` DECIMAL(12,2) NOT NULL DEFAULT '0.00' ;

ALTER TABLE `orders` 
CHANGE COLUMN `sub_total` `sub_total` DECIMAL(12,2) NOT NULL DEFAULT '0.00' ,
CHANGE COLUMN `discount_total` `discount_total` DECIMAL(12,2) NULL DEFAULT NULL ,
CHANGE COLUMN `paid_total` `paid_total` DECIMAL(12,2) NOT NULL DEFAULT '0.00' ,
CHANGE COLUMN `commission_amount` `commission_amount` DECIMAL(10,2) NOT NULL DEFAULT '0.00' ;

ALTER TABLE `order_details` 
CHANGE COLUMN `discount` `discount` DECIMAL(12,2) NOT NULL DEFAULT '0.00' ,
CHANGE COLUMN `extension` `extension` DECIMAL(12,2) NOT NULL ;

ALTER TABLE `packing_slip_details` 
CHANGE COLUMN `discount_total` `discount_total` DECIMAL(10,2) NOT NULL DEFAULT '0.00' ;

ALTER TABLE `packing_slips` 
CHANGE COLUMN `sub_total` `sub_total` DECIMAL(12,2) NOT NULL DEFAULT '0.00' ,
CHANGE COLUMN `discount_total` `discount_total` DECIMAL(12,2) NOT NULL DEFAULT '0.00' ;

ALTER TABLE `pending_bills` 
CHANGE COLUMN `balance_amount` `balance_amount` DECIMAL(12,2) NOT NULL ;