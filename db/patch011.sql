-- -----------------------------------------------------
-- Table `images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companies_id` INT NOT NULL,
  `document_id` INT NOT NULL,
  `document_type_char` VARCHAR(1) NOT NULL,
  `url` VARCHAR(128) NOT NULL,
  `description` VARCHAR(32) NOT NULL,
  `created` DATETIME NOT NULL,
  `last_updated` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_images_companies1`
    FOREIGN KEY (`companies_id`)
    REFERENCES `companies` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 1000;

CREATE INDEX `fk_images_companies1_idx` ON `images` (`companies_id` ASC);


UPDATE configurations SET value = '4.6.5' WHERE sysconfigurations_id = 7000 and companies_id = 1;
