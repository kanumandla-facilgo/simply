-- -----------------------------------------------------
-- Table `syslovgroups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syslovgroups` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `companies_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_syslovgroups_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_syslovgroups_companies1_idx` ON `syslovgroups` (`companies_id` ASC);


-- -----------------------------------------------------
-- Table `lov_data`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `lov_data` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(32) NOT NULL,
  `long_description` VARCHAR(128) NULL,
  `syslovgroups_id` INT NOT NULL,
  `companies_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_lov_data_syslovgroups1`
    FOREIGN KEY (`syslovgroups_id`)
    REFERENCES `syslovgroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_lov_data_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_lov_data_syslovgroups1_idx` ON `lov_data` (`syslovgroups_id` ASC);

CREATE INDEX `fk_lov_data_companies1_idx` ON `lov_data` (`companies_id` ASC);

INSERT INTO syslovgroups VALUES (1000, 'State', 1, now(), now());

INSERT INTO lov_data (description, long_description, syslovgroups_id, companies_id, created, last_updated)
VALUES 
('Andaman & Nicobar Islands', 'Andaman & Nicobar Islands', 1000, 1, now(), now()),
('Andhra Pradesh', 'Andhra Pradesh', 1000, 1, now(), now()),
('Arunachal Pradesh', 'Arunachal Pradesh', 1000, 1, now(), now()),
('Assam', 'Assam', 1000, 1, now(), now()),
('Bihar', 'Bihar', 1000, 1, now(), now()),
('Chandigarh', 'Chandigarh', 1000, 1, now(), now()),
('Chhattisgarh', 'Chhattisgarh', 1000, 1, now(), now()),
('Dadra & Nagar Haveli', 'Dadra & Nagar Haveli', 1000, 1, now(), now()),
('Daman & Diu', 'Daman & Diu', 1000, 1, now(), now()),
('Delhi', 'Delhi', 1000, 1, now(), now()),
('Goa', 'Goa', 1000, 1, now(), now()),
('Gujarat', 'Gujarat', 1000, 1, now(), now()),
('Haryana', 'Haryana', 1000, 1, now(), now()),
('Himachal Pradesh', 'Himachal Pradesh', 1000, 1, now(), now()),
('Jammu & Kashmir', 'Jammu & Kashmir', 1000, 1, now(), now()),
('Jharkhand', 'Jharkhand', 1000, 1, now(), now()),
('Karnataka', 'Karnataka', 1000, 1, now(), now()),
('Kerala', 'Kerala', 1000, 1, now(), now()),
('Lakshadweep', 'Lakshadweep', 1000, 1, now(), now()),
('Madhya Pradesh', 'Madhya Pradesh', 1000, 1, now(), now()),
('Maharashtra', 'Maharashtra', 1000, 1, now(), now()),
('Manipur', 'Manipur', 1000, 1, now(), now()),
('Meghalaya', 'Meghalaya', 1000, 1, now(), now()),
('Mizoram', 'Mizoram', 1000, 1, now(), now()),
('Nagaland', 'Nagaland', 1000, 1, now(), now()),
('Odisha', 'Odisha', 1000, 1, now(), now()),
('Puducherry', 'Puducherry', 1000, 1, now(), now()),
('Punjab', 'Punjab', 1000, 1, now(), now()),
('Rajasthan', 'Rajasthan', 1000, 1, now(), now()),
('Sikkim', 'Sikkim', 1000, 1, now(), now()),
('Tamil Nadu', 'Tamil Nadu', 1000, 1, now(), now()),
('Telangana', 'Telangana', 1000, 1, now(), now()),
('Tripura', 'Tripura', 1000, 1, now(), now()),
('Uttar Pradesh', 'Uttar Pradesh', 1000, 1, now(), now()),
('Uttarakhand', 'Uttarakhand', 1000, 1, now(), now()),
('West Bengal', 'West Bengal', 1000, 1, now(), now());

-- select distinct state from addresses a where state not in (select description from lov_data) order by 1;
-- select city, state from addresses a where state not in (select description from lov_data) order by 1;

UPDATE addresses set state = 'Andhra Pradesh' where state in ('Aandhra Pradesh', 'ANDHRA PRDESH', 'Andhrapradesh', 'Andhara Pradesh');
UPDATE addresses set state = 'Assam' where state in ('guwahati', 'Aassam');
UPDATE addresses set state = 'Chhattisgarh' where state in ('chatishgarh', 'chhatishgadh');
UPDATE addresses set state = 'Gujarat' where state in ('Gugarat', 'guj', 'gujrat', 'GUJURAT');
UPDATE addresses set state = 'Karnataka' where state in ('Kanrataka', 'karnatak');
UPDATE addresses set state = 'Kerala' where state in ('kerela');
UPDATE addresses set state = 'Madhya Pradesh' where state in ('M.P', 'M P', 'MADYA PRADESH', 'Madhyapradesh', 'M.P.');
UPDATE addresses set state = 'Maharashtra' where state in ('maha', 'Maharasahrta', 'maharasht', 'maharasthra', 'MAHARASTRA', 'maharshtra');
UPDATE addresses set state = 'Odisha' where state in ('oddisa');
UPDATE addresses set state = 'Punjab' where state in ('panjab');
UPDATE addresses set state = 'Bihar' where state in ('patna');
UPDATE addresses set state = 'Rajasthan' where state in ('ra');
UPDATE addresses set state = 'Tamil Nadu' where state in ('TA,ILNADU', 'Tamilnadu');
UPDATE addresses set state = 'Telangana' where state in ('TALANGANA', 'TEALNGANA', 'telamgana');
UPDATE addresses set state = 'Uttar Pradesh' where state in ('UTTER PRADESH', 'uttarpradesh', 'UP', 'U P');
UPDATE addresses set state = 'West Bengal' where state in ('kolkata', 'w bangal', 'west bangal', 'west bangole', 'WEST BENGOL', 'Westbengal');

UPDATE addresses set state = 'Gujarat' where state in ('india') and city in ('ahmedabad', 'anand', 'Pleasanton');
UPDATE addresses set state = 'Gujarat' where state in ('CA') and city in ('Pleasanton');
UPDATE addresses set state = 'West Bengal' where state in ('india') and city = 'kolkata';
UPDATE addresses set state = 'Punjab' where state in ('india') and city in ('punjab');
UPDATE addresses set state = 'Rajasthan' where state in ('india') and city in ('RAJSTHAN');
UPDATE addresses set state = 'Uttar Pradesh' where state in ('HAPUR') and city in ('Pilkhuwa');
UPDATE addresses set state = 'Assam' where state in ('india') and city in ('aasam');

UPDATE addresses set state = 'Gujarat', city = 'Ahmedabad' where state not in (select description from lov_data);

-- to fix the case of state as at times state is stored as gujarat
update addresses inner join lov_data on addresses.state = lov_data.description set addresses.state = lov_data.description;

-- adding new permission for customer balance
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5206, 'Customer Balance Update', 'Allow customer balance update', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5206, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5206, 0, now(), now()
from   roles r
where  sysroles_id IN (4003, 4004, 4005);

INSERT INTO sysconfigurations values (10008, 'tax_gst_number', 'Company GST #', '', 'TEST77778888', 6001, 0, 1, 7, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
VALUES ('24AAEFM6708P1ZW', 10003, 10008, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT 'T1234AAAA', c.id, 10008, now(), now()
FROM   companies c
WHERE  c.syscompanytypes_id = 4701 
AND    c.id <> 10003;
