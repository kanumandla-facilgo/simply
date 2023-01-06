ALTER TABLE `users` 
ADD COLUMN `api_key` VARCHAR(16) NULL AFTER `roles_id`,
ADD COLUMN `api_secret` VARCHAR(32) NULL AFTER `api_key`;


-- -----------------------------------------------------
-- Table `syssessiontypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syssessiontypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `default_timeout_seconds` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

INSERT INTO syssessiontypes VALUES (4100, 'Web', 60*30, NOW(), NOW());
INSERT INTO syssessiontypes VALUES (4101, 'Mobile', 60*60*24*5, NOW(), NOW());
INSERT INTO syssessiontypes VALUES (4102, 'API', 60*30, NOW(), NOW());

ALTER TABLE `sessions` 
ADD COLUMN `syssessiontypes_id` INT NOT NULL DEFAULT 4100 AFTER `expiration_at`,
ADD INDEX `fk_sessions_syssessiontypes1_idx` (`syssessiontypes_id` ASC);

ALTER TABLE `sessions` 
ADD CONSTRAINT `fk_sessions_syssessiontypes1`
  FOREIGN KEY (`syssessiontypes_id`)
  REFERENCES `syssessiontypes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

