
ALTER TABLE `pending_bills` 
ADD COLUMN `approx_paid_date` DATETIME NULL AFTER `balance_amount`,
ADD COLUMN `sysstatuses_id` INT NOT NULL AFTER `approx_paid_date`,
ADD COLUMN `next_reminder_date` INT NULL AFTER `sysstatuses_id`,
ADD INDEX `fk_pending_bills_sysstatuses1_idx` (`sysstatuses_id` ASC);

UPDATE pending_bills SET sysstatuses_id = 4600;

ALTER TABLE `pending_bills` 
ADD CONSTRAINT `fk_pending_bills_sysstatuses1`
  FOREIGN KEY (`sysstatuses_id`)
  REFERENCES `sysstatuses` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
