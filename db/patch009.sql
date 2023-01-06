ALTER TABLE `packing_slip_details` 
ADD COLUMN `discount_total` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total`;

ALTER TABLE `packing_slips` 
ADD COLUMN `discount_total` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total`;

ALTER TABLE `delivery_notes` 
ADD COLUMN `discount_total` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total`;

ALTER TABLE `delivery_note_details` 
ADD COLUMN `discount_total` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total`;

ALTER TABLE `delivery_notes` 
ADD COLUMN `po_string` VARCHAR(512) NULL AFTER `orders_id_string`;

ALTER TABLE `delivery_notes` 
ADD COLUMN `order_number_string` VARCHAR(512) NULL AFTER `po_string`;

UPDATE delivery_notes n
INNER JOIN (
	SELECT d.delivery_notes_id, GROUP_CONCAT(distinct o.customer_order_number) po_ids
	FROM delivery_note_details d
	INNER JOIN packing_slips p ON d.packing_slips_id = p.id
	INNER JOIN orders o ON o.id = p.orders_id
	GROUP BY d.delivery_notes_id) d ON d.delivery_notes_id = n.id
SET n.po_string = d.po_ids;

UPDATE delivery_notes SET po_string = REPLACE(po_string, ',', ', ');

UPDATE delivery_notes n
INNER JOIN (
	SELECT d.delivery_notes_id, GROUP_CONCAT(distinct o.order_number) order_numbers
	FROM delivery_note_details d
	INNER JOIN packing_slips p ON d.packing_slips_id = p.id
	INNER JOIN orders o ON o.id = p.orders_id
	GROUP BY d.delivery_notes_id) d ON d.delivery_notes_id = n.id
SET n.order_number_string = d.order_numbers;

UPDATE delivery_notes SET order_number_string = REPLACE(order_number_string, ',', ', ');

-- insert into sysconfigurations values (10007, 'order_auto_round', 'Auto round the orders and add into discount', '1,0', '0', 6001, 0, 1, 7, now(), now());

-- INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
-- SELECT c.default_value, i.id, c.id, now(), now()
-- FROM   sysconfigurations c, companies i
-- WHERE  c.sysconfigurationtypes_id = 6001
-- AND    i.syscompanytypes_id = 4701
-- AND    c.id                 = 10007;

-- UPDATE configurations SET value = '1' WHERE sysconfigurations_id = 10007 AND companies_id = 10003;

ALTER TABLE `delivery_notes` 
ADD COLUMN `rounding_total` DECIMAL(4,2) NOT NULL DEFAULT 0 AFTER `discount_total`;

UPDATE configurations SET value = '4.6' WHERE sysconfigurations_id = 7000 and companies_id = 1;

insert into sysconfigurations values (15000, 'tax_auto_calculation_order', 'If 1, Tax will be calculated by system. Tax field will be disabled.', '1,0', '0', 6001, 0, 1, 127, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT c.default_value, i.id, c.id, now(), now()
FROM   sysconfigurations c, companies i
WHERE  c.sysconfigurationtypes_id = 6001
AND    i.syscompanytypes_id = 4701
AND    c.id                 = 15000;

UPDATE configurations SET value = '1' WHERE sysconfigurations_id = 15000 AND companies_id = 10003;
