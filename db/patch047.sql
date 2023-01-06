
-- -----------------------------------------------------
-- Table `sysuploadtypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sysuploadtypes` (
  `id` INT NOT NULL,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `uploads`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `uploads` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `sysuploadtypes_id` INT NOT NULL,
  `syssyncstatuses_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  `file_path` VARCHAR(256) NOT NULL,
  `format` VARCHAR(24) NOT NULL,
  `number_of_records` INT NOT NULL,
  `records_processed` INT NULL DEFAULT 0,
  `records_failed` INT NULL DEFAULT 0,
  `processed_time` INT NULL DEFAULT 0,
  `notes` VARCHAR(1024) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_uploads_sysuploadtypes1`
    FOREIGN KEY (`sysuploadtypes_id`)
    REFERENCES `sysuploadtypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_uploads_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_uploads_syssyncstatuses1`
    FOREIGN KEY (`syssyncstatuses_id`)
    REFERENCES `syssyncstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_uploads_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


CREATE INDEX `fk_uploads_sysuploadtypes1_idx` ON `uploads` (`sysuploadtypes_id` ASC) ;

CREATE INDEX `fk_uploads_users1_idx` ON `uploads` (`users_id` ASC) ;

CREATE INDEX `fk_uploads_syssyncstatuses1_idx` ON `uploads` (`syssyncstatuses_id` ASC) ;

CREATE INDEX `fk_uploads_companies1_idx` ON `uploads` (`companies_id` ASC) ;

-- -----------------------------------------------------
-- Table `upload_error_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `upload_error_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uploads_id` BIGINT(20) NOT NULL,
  `record_number` INT NOT NULL,
  `failure_reason` VARCHAR(256) NOT NULL,
  `more` JSON NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_upload_detail_uploads1`
    FOREIGN KEY (`uploads_id`)
    REFERENCES `uploads` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_upload_detail_uploads1_idx` ON `upload_error_details` (`uploads_id` ASC);

INSERT INTO sysuploadtypes VALUES (1001, 'Agents', NOW(), NOW());
INSERT INTO sysuploadtypes VALUES (1002, 'Customers', NOW(), NOW());
INSERT INTO sysuploadtypes VALUES (1003, 'Transporters', NOW(), NOW());

insert into syseventtypes values(1004, 'Agent Upload', NOW(), NOW());
insert into syseventtypes values(1005, 'Customer Upload', NOW(), NOW());
insert into syseventtypes values(1006, 'Transporter Upload', NOW(), NOW());

ALTER TABLE uploads CHANGE COLUMN processed_time processed_time_seconds INT;

ALTER TABLE upload_error_details CHANGE COLUMN record_number line_number INT;