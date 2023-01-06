ALTER TABLE `products` 
ADD COLUMN `syssyncstatuses_id` INT NOT NULL AFTER `tax_slabs_id`;

ALTER TABLE `products` ADD INDEX `fk_products_syssyncstatuses1_idx` (`syssyncstatuses_id` ASC);

UPDATE products SET syssyncstatuses_id = 4101;

ALTER TABLE `products` 
ADD CONSTRAINT `fk_products_syssyncstatuses1`
  FOREIGN KEY (`syssyncstatuses_id`)
  REFERENCES `syssyncstatuses` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


ALTER TABLE `companies` 
ADD COLUMN `syssyncstatuses_id` INT NOT NULL AFTER `taxform_flag`;

ALTER TABLE `companies` ADD INDEX `fk_companies_syssyncstatuses1_idx` (`syssyncstatuses_id` ASC);

UPDATE companies SET syssyncstatuses_id = 4101;

ALTER TABLE `companies` 
ADD CONSTRAINT `fk_companies_syssyncstatuses1`
  FOREIGN KEY (`syssyncstatuses_id`)
  REFERENCES `syssyncstatuses` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


ALTER TABLE `companies` 
ADD COLUMN `invoicing_name` VARCHAR(128) NULL AFTER `syssyncstatuses_id`;

UPDATE companies set invoicing_name = name;
