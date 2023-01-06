ALTER TABLE `companies` 
ADD COLUMN `pending_order_balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `current_overdue`;

ALTER TABLE `addresses` 
ADD COLUMN `first_name` VARCHAR(32) NULL AFTER `companies_id`,
ADD COLUMN `last_name` VARCHAR(32) NULL AFTER `first_name`;

UPDATE addresses
INNER JOIN users u ON u.addresses_id = addresses.id
SET addresses.first_name = u.first_name, addresses.last_name = u.last_name;

UPDATE addresses
INNER JOIN companies c ON addresses.id = c.addresses_id INNER JOIN users u ON u.companies_id = c.id
SET addresses.first_name = u.first_name, addresses.last_name = u.last_name;

UPDATE addresses
INNER JOIN companies c ON addresses.id = c.ship_addresses_id INNER JOIN users u ON u.companies_id = c.id
SET addresses.first_name = u.first_name, addresses.last_name = u.last_name;

UPDATE addresses
INNER JOIN companies c ON addresses.id = c.bill_addresses_id INNER JOIN users u ON u.companies_id = c.id
SET addresses.first_name = u.first_name, addresses.last_name = u.last_name;


ALTER TABLE `order_workflow_reasons` 
ADD COLUMN `order_workflow_routes_id` INT NOT NULL AFTER `sysworkflowtypes_id`;

ALTER TABLE `order_workflow_reasons` 
ADD CONSTRAINT `fk_order_workflow_reasons_order_workflow_routes1`
  FOREIGN KEY (`order_workflow_routes_id`)
  REFERENCES `order_workflow_routes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

CREATE INDEX `fk_order_workflow_reasons_order_workflow_routes1_idx` ON `order_workflow_reasons` (`order_workflow_routes_id` ASC);

ALTER TABLE `orders` 
ADD COLUMN `workflow_reason_string` VARCHAR(64) NULL AFTER `commission_amount`;

INSERT INTO `order_workflow_reasons` ( `description`, `orders_id`, `sysworkflowtypes_id`, `order_workflow_routes_id`, `created`, `last_updated`) 
SELECT 'Due to Variance', orders_id, 5000, id, now(), now()
FROM order_workflow_routes;

UPDATE orders SET workflow_reason_string = 'Due to Variance' WHERE sysorderstatuses_id in (4203, 4204);

UPDATE syspermissions SET is_customer = 1, customeradmin_default_value = 1, customeruser_default_value = 1 WHERE id in (5002);

INSERT INTO role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
SELECT 1, r.id, 5002, 0, now(), now()
FROM roles r
WHERE r.sysroles_id IN (4030, 4031)
AND r.companies_id IN (SELECT id FROM companies c WHERE c.syscompanytypes_id = 4702);
