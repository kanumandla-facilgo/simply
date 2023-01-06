ALTER TABLE `stock_buckets` 
ADD COLUMN `stock_quote_string` VARCHAR(64) NULL AFTER `sysstatuses_id`;

UPDATE stock_buckets s
INNER JOIN (
	SELECT d.stock_buckets_id, GROUP_CONCAT(ROUND(quantity, 2)) qty_string
	FROM stock_bucket_details d
	WHERE d.unit_of_measures_id = 5008
	AND  EXISTS (SELECT 1 FROM stock_bucket_details d2 WHERE d2.stock_buckets_id = d.stock_buckets_id AND d2.unit_of_measures_id = 5008 AND d2.sequence_number = 2)
	GROUP BY d.stock_buckets_id) d ON d.stock_buckets_id = s.id
SET s.stock_quote_string = d.qty_string;

UPDATE stock_buckets SET stock_quote_string = REPLACE(stock_quote_string, ',', ' + ');

insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5600, 'View Stock', 'Allow viewing stock', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5600, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5600, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004, 4005);

ALTER TABLE `sysconfigurations` CHANGE COLUMN `default_value` `default_value` VARCHAR(128) NOT NULL ;

ALTER TABLE `sysconfigurations` 
ADD COLUMN `root_edit_flag` TINYINT(1) NOT NULL DEFAULT 0 AFTER `sysconfigurationtypes_id`,
ADD COLUMN `edit_flag` TINYINT(1) NOT NULL DEFAULT 0 AFTER `root_edit_flag`,
ADD COLUMN `display_bits` INT NOT NULL DEFAULT 0 AFTER `edit_flag`;

insert into sysconfigurationtypes values (6000, 'System', now(), now());
insert into sysconfigurationtypes values (6001, 'Company', now(), now());
insert into sysconfigurationtypes values (6002, 'User', now(), now());

insert into sysconfigurations values (7000, 'system_version_number', 'System Version Number', '0.00', '0.00', 6000, 0, 0, 0, now(), now());

insert into sysconfigurations values (10000, 'logo_url', 'Company Logo URL', '-', 'upload/logo_simplytextile.png', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (10001, 'bank_name', 'Company Bank Name', '', 'Test Bank', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10002, 'bank_account_number', 'Company Bank Account #', '', 'TESTAE00000000', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10003, 'bank_isfc', 'Company Bank ISFC #', '', 'TESTU000000', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10004, 'tax_cst_number', 'Company CST #', '', 'TEST11112222', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10005, 'tax_vat_number', 'Company VAT #', '', 'TEST44445555', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (10006, 'tax_pan_number', 'Company PAN #', '', 'TEST77778888', 6001, 0, 1, 7, now(), now());

insert into sysconfigurations values (20000, 'order_number_required', 'Company Order # Required', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20001, 'order_number_next_value', 'Company Next Order #', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20002, 'order_number_format', 'Company Order # format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());

insert into sysconfigurations values (20010, 'packing_slip_number_required', 'Company Packing Slip # Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20011, 'packing_slip_number_next_value', 'Company Next Packing Slip #', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20012, 'packing_slip_number_format', 'Company Packing Slip # format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());

insert into sysconfigurations values (20020, 'delivery_note_number_required', 'Company Delivery Note # Required', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20021, 'delivery_note_number_next_value', 'Company Next Delivery Note #', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20022, 'delivery_note_number_format', 'Company Delivery Number # format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());

-- add company configurations
INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT c.default_value, i.id, c.id, now(), now()
FROM   sysconfigurations c, companies i
WHERE  c.sysconfigurationtypes_id = 6001
AND    i.syscompanytypes_id = 4701;

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated) VALUES ('4.1.2', 1, 7000, now(), now());

UPDATE configurations SET value = '/upload/mbtowel.jpg' WHERE sysconfigurations_id = 10000 AND companies_id = 10003;
UPDATE configurations SET value = 'HDFC' WHERE sysconfigurations_id = 10001 AND companies_id = 10003;
UPDATE configurations SET value = '02372790000855' WHERE sysconfigurations_id = 10002 AND companies_id = 10003;
UPDATE configurations SET value = 'HDFC0000237' WHERE sysconfigurations_id = 10003 AND companies_id = 10003;
UPDATE configurations SET value = '24571000398' WHERE sysconfigurations_id = 10004 AND companies_id = 10003;
UPDATE configurations SET value = '24071000398' WHERE sysconfigurations_id = 10005 AND companies_id = 10003;
UPDATE configurations SET value = 'AAEFM6708P' WHERE sysconfigurations_id = 10006 AND companies_id = 10003;

UPDATE configurations SET value = '4.1.2' WHERE sysconfigurations_id = 7000 and companies_id = 1;

UPDATE addresses SET address1 = 'B-73, 1st Floor, Sumel 1, B/H New Cloth Market', address2 = 'Raipur', 
city = 'Ahmedabad', pin = '380002', phone1 = '+91-79-22145487', email1 = 'info@mbtowel.com' WHERE id = 10006;

UPDATE companies SET name = 'M. Bharatkumar' WHERE id = 10003;

ALTER TABLE `orders` 
ADD COLUMN `customer_order_number` VARCHAR(32) NULL AFTER `order_number`;

-- Ask Riteshbhai for following two SQLs
UPDATE orders SET customer_order_number = order_number WHERE order_number IS NOT NULL;

UPDATE orders SET order_number = id;

ALTER TABLE `orders` 
ADD INDEX `fk_orders_order_number` (`companies_id` ASC, `order_number` ASC);

ALTER TABLE `orders` 
ADD INDEX `fk_orders_customer_order_number` (`companies_id` ASC, `customer_order_number` ASC);

UPDATE configurations SET value = (SELECT MAX(o.id) + 1 FROM orders o WHERE o.companies_id = 10003 ) WHERE sysconfigurations_id = 20001 AND companies_id = 10003;

UPDATE configurations SET value = (SELECT MAX(s.id) + 1 FROM packing_slips s WHERE s.companies_id = 10003 ) WHERE sysconfigurations_id = 20011 AND companies_id = 10003;

UPDATE configurations SET value = (SELECT MAX(d.id) + 1 FROM delivery_notes d WHERE d.companies_id = 10003 ) WHERE sysconfigurations_id = 20021 AND companies_id = 10003;

ALTER TABLE `orders` 
CHANGE COLUMN `sub_total` `sub_total` DECIMAL(10,2) NOT NULL DEFAULT '0.00' ;
