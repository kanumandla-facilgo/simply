CREATE TABLE IF NOT EXISTS `sysdeliverystatuses` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

INSERT INTO sysdeliverystatuses VALUES (5700, 'Pending', NOW(), NOW());
INSERT INTO sysdeliverystatuses VALUES (5701, 'Partially Delivered', NOW(), NOW());
INSERT INTO sysdeliverystatuses VALUES (5702, 'Delivered', NOW(), NOW());
INSERT INTO sysdeliverystatuses VALUES (5703, 'Cancelled', NOW(), NOW());

ALTER TABLE `orders` 
ADD COLUMN `sysdeliverystatuses_id` INT NULL AFTER `sysworkflowstatuses_id`;

-- cancelled
UPDATE orders SET sysdeliverystatuses_id = 5703 WHERE sysorderstatuses_id IN (4204, 4205);

-- pending workflow approval will have delivery set to pending
UPDATE orders SET sysdeliverystatuses_id = 5700 WHERE sysorderstatuses_id IN (4203);

-- in packing will have delivery set to partially delivered if any packing slip is in dispatched etc status
UPDATE orders SET sysdeliverystatuses_id = 5701
WHERE sysorderstatuses_id IN (4201) 
AND EXISTS (SELECT 1 FROM packing_slips p WHERE p.orders_id = orders.id AND p.syspackingslipstatuses_id IN (5200, 5201,5202));

-- in packing will have delivery set to pending if none of the packing slip is ready
UPDATE orders SET sysdeliverystatuses_id = 5700
WHERE sysorderstatuses_id IN (4201) 
AND   sysdeliverystatuses_id IS NULL;

-- order is completed & all packing slips are also completed 
UPDATE orders SET sysdeliverystatuses_id = 5702 
WHERE sysorderstatuses_id IN (4202) 
AND   EXISTS (SELECT 1 FROM packing_slips p WHERE p.orders_id = orders.id AND p.syspackingslipstatuses_id = 5202)
AND   NOT EXISTS (
		SELECT 1
		FROM   packing_slips p 
		WHERE  p.orders_id         = orders.id 
		AND    p.syspackingslipstatuses_id IN (5200, 5201)
		);

UPDATE orders SET sysdeliverystatuses_id = 5701
WHERE sysorderstatuses_id IN (4202) 
AND sysdeliverystatuses_id IS NULL;

ALTER TABLE `orders`
ADD CONSTRAINT `fk_orders_sysdeliverystatuses1`
    FOREIGN KEY (`sysdeliverystatuses_id`)
    REFERENCES `sysdeliverystatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE `orders` 
CHANGE COLUMN `sysdeliverystatuses_id` `sysdeliverystatuses_id` INT(11) NOT NULL ;

UPDATE sysorderstatuses SET name = 'Completed' where id = 4202;

UPDATE configurations SET value = '5.0' WHERE sysconfigurations_id = 7000 and companies_id = 1;
