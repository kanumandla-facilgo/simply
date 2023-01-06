
-- -----------------------------------------------------
-- Table `activities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `sessions_id` VARCHAR(32) NOT NULL,
  `route_type` VARCHAR(1024) NOT NULL,
  `route` VARCHAR(256) NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_activities_sessions1`
    FOREIGN KEY (`sessions_id`)
    REFERENCES `sessions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_activities_sessions1_idx` ON `activities` (`sessions_id` ASC);


-- -----------------------------------------------------
-- Table `activity_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_details` (
  `activities_id` BIGINT(20) NOT NULL,
  `information` JSON NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`activities_id`),
  CONSTRAINT `fk_activity_details_activities1`
    FOREIGN KEY (`activities_id`)
    REFERENCES `activities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_activity_details_activities1_idx` ON `activity_details` (`activities_id` ASC);


-- -----------------------------------------------------
-- Table `syseventtypes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `syseventtypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `users_id` INT NOT NULL,
  `syseventtypes_id` INT NOT NULL,
  `document_id` INT NOT NULL,
  `syssyncstatuses_id` INT NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_events_syseventtypes1`
    FOREIGN KEY (`syseventtypes_id`)
    REFERENCES `syseventtypes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_events_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_events_syssyncstatuses1`
    FOREIGN KEY (`syssyncstatuses_id`)
    REFERENCES `syssyncstatuses` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_events_syseventtypes1_idx` ON `events` (`syseventtypes_id` ASC);

CREATE INDEX `fk_events_users1_idx` ON `events` (`users_id` ASC);

CREATE INDEX `fk_events_syssyncstatuses1_idx` ON `events` (`syssyncstatuses_id` ASC);

INSERT INTO syseventtypes VALUES ( 1001, 'Order Create', NOW(), NOW());
INSERT INTO syseventtypes VALUES ( 1002, 'Order Search', NOW(), NOW());

insert into syssyncstatuses values (4104, 'Processing', 'Processing', now(), now());       
insert into syssyncstatuses values (4105, 'Completed', 'Completed', now(), now());
insert into syssyncstatuses values (4106, 'Cancelled', 'Cancelled', now(), now());
