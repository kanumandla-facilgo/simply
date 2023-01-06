delimiter //


CREATE PROCEDURE abc()

main: BEGIN

	DECLARE a INT;

	-- internal hsn
	IF (SELECT NOT EXISTS(SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'orders'
        AND column_name = 'internal_notes')
	   )  THEN

		ALTER TABLE `orders` 
		ADD COLUMN `internal_notes` VARCHAR(512) NULL AFTER `notes`,
		ADD COLUMN `agent_notes` VARCHAR(512) NULL AFTER `internal_notes`;

	END IF;

	-- product
	IF (SELECT EXISTS(SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'products'
        AND column_name = 'hsn')
	   ) THEN

		ALTER TABLE `products` 
		DROP FOREIGN KEY `fk_products_tax_slabs1`;

		ALTER TABLE `products` 
		DROP COLUMN `hsn`,
		DROP COLUMN `tax_slabs_id`,
		DROP INDEX `fk_products_tax_slabs1_idx` ;

		CREATE TABLE IF NOT EXISTS `sysproducthsn` (
		  `id` INT NOT NULL,
		  `code` VARCHAR(24) NOT NULL,
		  `name` VARCHAR(32) NOT NULL,
		  `description` VARCHAR(64) NOT NULL,
		  `short_code` VARCHAR(12) NOT NULL,
		  `created` DATETIME NOT NULL,
		  `last_updated` DATETIME NOT NULL,
		  PRIMARY KEY (`id`))
		ENGINE = InnoDB;

		-- -----------------------------------------------------
		-- Table `sysproducthsn_details`
		-- -----------------------------------------------------
		CREATE TABLE IF NOT EXISTS `sysproducthsn_details` (
		  `id` INT NOT NULL,
		  `sysproducthsn_id` INT NOT NULL,
		  `amount_min` DECIMAL(12,2) NOT NULL,
		  `amount_max` DECIMAL(12,2) NULL,
		  `tax_percent_gst` DECIMAL(8,4) NOT NULL DEFAULT 0,
		  `tax_percent_cgst` DECIMAL(8,4) NOT NULL DEFAULT 0,
		  `tax_percent_igst` DECIMAL(8,4) NOT NULL DEFAULT 0,
		  `tax_percent_sgst` DECIMAL(8,4) NOT NULL DEFAULT 0,
		  `tax_percent_cess` DECIMAL(8,4) NOT NULL DEFAULT 0,
		  `activation_start_date` DATETIME NOT NULL,
		  `activation_end_date` DATETIME NULL,
		  `created` DATETIME NOT NULL,
		  `last_updated` DATETIME NOT NULL,
		  PRIMARY KEY (`id`),
		  CONSTRAINT `fk_sysproducthsn_details_sysproducthsn1`
		    FOREIGN KEY (`sysproducthsn_id`)
		    REFERENCES `sysproducthsn` (`id`)
		    ON DELETE NO ACTION
		    ON UPDATE NO ACTION)
		ENGINE = InnoDB
		AUTO_INCREMENT = 1000;

		CREATE INDEX `fk_sysproducthsn_details_sysproducthsn1_idx` ON `sysproducthsn_details` (`sysproducthsn_id` ASC);

		INSERT INTO sysproducthsn (id, code, name, description, short_code, created, last_updated)
		VALUES 	(6000, '5205', '5205 - Fabric', 'Fabric, Towel', '5205', now(), now()),
				(6001, '5208', '5208 - Fabric', 'Fabric, Towel', '5208', now(), now()),
				(6002, '5208', '5208 - Towel', '5208 - Towel', '5208', now(), now()),
				(6003, '6302', '6302 - Bath', 'Bath', '6302', now(), now()),
				(6004, '6304', '6304 - Bedlinen', 'Bedlines', '6304', now(), now()),
				(6005, '9404-Cotton', '9404 - Cotton', 'Comforter', '9404', now(), now()),
				(6006, '9404-NonCotton', '9404-NonCotton', 'Comforter', '9404', now(), now());


		INSERT INTO sysproducthsn_details (sysproducthsn_id, tax_percent_gst, tax_percent_cess, tax_percent_igst, tax_percent_sgst, tax_percent_cgst, activation_start_date, activation_end_date, created, last_updated)
		VALUES 	(6000, 5.00, 0.00, 5.00, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
				(6001, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
				(6002, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
				(6003, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
				(6004, 5.00, 0.00, 5.0, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
				(6005, 5.00, 0.00, 5.00, 2.5, 2.5, '2018-01-01', NULL, now(), now()),
				(6006, 18.00, 0.00, 18.00, 9.00, 9.00, '2018-01-01', NULL, now(), now());

		ALTER TABLE `products` ADD COLUMN `sysproducthsn_id` INT NOT NULL AFTER `syssyncstatuses_id`, 
		ADD INDEX `fk_products_sysproducthsn1_idx` (`sysproducthsn_id` ASC);

		UPDATE products 
		SET sysproducthsn_id = 6000;

		ALTER TABLE `products` ADD CONSTRAINT `fk_products_sysproducthsn1` FOREIGN KEY (`sysproducthsn_id`) REFERENCES `sysproducthsn` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

		UPDATE products
		SET sysproducthsn_id = 6001
		WHERE id IN (
			SELECT products_id 
			FROM product_categories pc, categories c 
			WHERE pc.categories_id = c.id 
			AND c.lineage like '%|19|%' OR c.lineage like '%|13|%' OR c.lineage like '%|134|%'
		);

		UPDATE products
		SET sysproducthsn_id = 6002
		WHERE id IN (
			SELECT products_id 
			FROM product_categories pc, categories c 
			WHERE pc.categories_id = c.id 
			AND c.lineage like '%|11|%'
		);

		UPDATE products
		SET sysproducthsn_id = 6003
		WHERE id IN (
			SELECT products_id 
			FROM product_categories pc, categories c 
			WHERE pc.categories_id = c.id 
			AND c.lineage like '%|123|%'
		);

		UPDATE products
		SET sysproducthsn_id = 6000
		WHERE id IN (
			SELECT products_id 
			FROM product_categories pc, categories c 
			WHERE pc.categories_id = c.id 
			AND c.lineage like '%|133|%'
		);

	END IF;

	IF (SELECT NOT EXISTS(SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'delivery_notes'
        AND column_name = 'tax_total_cgst')
	   ) THEN

		ALTER TABLE `delivery_notes` 
		ADD COLUMN `tax_total_cgst` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `rounding_total`,
		ADD COLUMN `tax_total_igst` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total_cgst`,
		ADD COLUMN `tax_total_sgst` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total_igst`,
		ADD COLUMN `tax_total_cess` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total_sgst`,
		ADD COLUMN `tax_total_vat` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total_cess`;

		ALTER TABLE `delivery_note_details` 
		ADD COLUMN `tax_total_cgst` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `discount_total`,
		ADD COLUMN `tax_total_igst` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total_cgst`,
		ADD COLUMN `tax_total_sgst` DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER `tax_total_igst`,
		ADD COLUMN `tax_total_cess` DECIMAL(8,2) NULL DEFAULT 0.00 AFTER `tax_total_sgst`,
		ADD COLUMN `tax_total_vat` DECIMAL(8,2) NULL DEFAULT 0.00 AFTER `tax_total_cess`;

	END IF;


	-- product
	IF (SELECT NOT EXISTS(SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'delivery_notes'
        AND column_name = 'ship_address_id')
	   ) THEN


	END IF;

END;
//

delimiter ;

CALL abc();

DROP PROCEDURE IF EXISTS abc;
