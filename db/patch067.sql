ALTER TABLE `delivery_notes` 
ADD COLUMN `syssyncstatuses_id` INT NULL AFTER `ship_addresses_id`,
ADD INDEX `fk_delivery_notes_syssyncstatuses_idx` (`syssyncstatuses_id` ASC);

UPDATE delivery_notes SET syssyncstatuses_id = 4103;

ALTER TABLE `delivery_notes` 
CHANGE COLUMN `syssyncstatuses_id` `syssyncstatuses_id` INT(11) NOT NULL ;

ALTER TABLE `delivery_notes` 
ADD CONSTRAINT `fk_delivery_notes_syssyncstatuses`
  FOREIGN KEY (`syssyncstatuses_id`)
  REFERENCES `syssyncstatuses` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

insert into sysconfigurations values (25153, 'module_integration_invoice', 'Invoice Integration', '1,0', '0', 6001, 0, 1, 127, now(), now());

-- Now for current companies, add all values
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select s.default_value, c.id, s.id, now(), now()
from sysconfigurations s, companies c
where c.syscompanytypes_id = 4701
AND s.id = 25153;

-- update configurations 
-- set value = 1
-- where sysconfigurations_id = 25153
-- and companies_id = 10003;
