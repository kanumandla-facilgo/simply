DROP PROCEDURE IF EXISTS spCreateOrderDetail;


DELIMITER $$
CREATE  PROCEDURE `spCreateOrderDetail`(
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 INOUT id              INT,
				_orders_id	INT,
				_products_id	INT,
				_name 		VARCHAR(512),
				_quantity	DECIMAL(10,2),
				_unit_price	DECIMAL(10,2),
				_quote_price DECIMAL(10,2),
				_tax		DECIMAL(10,2),
				_shipping	DECIMAL(10,2),
				_discount	DECIMAL(10,2),
				_extension	DECIMAL(10,2),	
				_unit_of_measures_id	INT,
				_notes 		VARCHAR(512),
				_entered_unit_of_measures_id INT,
				_entered_quantity	DECIMAL(10,2)
               )
    DETERMINISTIC
main: BEGIN

	DECLARE l_notfound     INT;
	DECLARE l_id           INT;
	DECLARE l_companyid    INT;
	DECLARE l_internalsku  VARCHAR(32);
	
	DECLARE l_uom_main     INT;
	DECLARE l_uom_alt      INT;  
	DECLARE l_uom_main_qty DECIMAL(10, 4);
	DECLARE l_uom_alt_qty  DECIMAL(10, 4);  

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;
/*
	DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;
*/
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	SELECT u.id, IFNULL(u.end_uom_id, u.id)
	INTO   l_uom_main, l_uom_alt
	FROM   products p INNER JOIN unit_of_measures u ON p.default_qty_uom_id = u.id
	WHERE  p.id = _products_id;

	IF l_uom_main = _entered_unit_of_measures_id THEN
	
		SET l_uom_main_qty = _entered_quantity;
		
	ELSE
	
		SELECT (_entered_quantity *  c.to_qty)/c.from_qty
		INTO   l_uom_main_qty
		FROM   unit_conversion_details c
		WHERE  c.unit_of_measures_id = l_uom_main
		AND    c.from_uom_id = _entered_unit_of_measures_id
		AND    c.to_uom_id   = l_uom_main;
		
		IF l_notfound = 1 THEN
			SET errorcode  = -111;
			SET errormsg   = 'Unit conversion not found!';
			LEAVE main;
		END IF;
	
	END IF;
	
	-- TODO: ideally instead of relying on input from caller, SP should convert the details.
	IF _unit_of_measures_id = l_uom_alt THEN

		SET l_uom_alt_qty = _quantity;
	
	ELSE

		SELECT (_quantity *  c.to_qty)/c.from_qty
		INTO   l_uom_alt_qty
		FROM   unit_conversion_details c
		WHERE  c.unit_of_measures_id = l_uom_main
		AND    c.from_uom_id = _unit_of_measures_id
		AND    c.to_uom_id   = l_uom_alt;

	END IF;

	IF id  > 0 THEN

		SELECT o.companies_id
		INTO   l_companyid
		FROM   orders o
		where  o.id = _orders_id;

		-- release the remaining quantity from open order details
		CALL spReleaseProductInProcessQty (errorcode, errormsg, l_companyid, _orders_id, id);

		UPDATE `order_details` SET 
		`products_id` = _products_id ,
		`name` = _name,
		`order_quantity` = _quantity,
		`unit_price` = _unit_price,
		`order_price` = _quote_price,
		`tax` = _tax,
		`shipping` = _shipping,
		`discount` = _discount,
		`extension` = _extension,
		`unit_of_measures_id` = _unit_of_measures_id,
		`last_updated` = now(),
		`entered_quantity` =  _entered_quantity,
		`entered_unit_of_measures_id` = _entered_unit_of_measures_id,
		`stock_unit_of_measures_id` = l_uom_main,
		`stock_alt_unit_of_measures_id` = l_uom_alt,
		`stock_quantity` = `stock_quantity` + `stock_quantity` * -1 + l_uom_main_qty,
		`stock_alt_quantity` = `stock_alt_quantity` + `stock_alt_quantity` * -1 + l_uom_alt_qty,
		`notes` = _notes
		WHERE order_details.`id` = id;

		UPDATE products
		INNER  JOIN order_details d ON products.id = d.products_id
		SET    products.stock_in_process_quote = products.stock_in_process_quote + l_uom_alt_qty - d.stock_alt_quantity_packed,
		       products.stock_in_process_qty   = products.stock_in_process_qty   + l_uom_main_qty - d.stock_quantity_packed
		WHERE  products.id            = _products_id
		AND    d.id                   = id;

	ELSE

		INSERT INTO `order_details`
		(
			`orders_id`,
			`products_id`,
			`name`,
			`order_quantity`,
			`unit_price`,
			`order_price`,
			`tax`,
			`shipping`,
			`discount`,
			`extension`,
			`unit_of_measures_id`,
			`created`,
			`last_updated`,
			`entered_quantity`,
			`entered_unit_of_measures_id`,
			`stock_unit_of_measures_id`,
			`stock_alt_unit_of_measures_id`,
			`stock_quantity`,
			`stock_alt_quantity`,
			`notes`
		)
		VALUES
		(
			_orders_id,
			_products_id,
			_name,
			_quantity,
			_unit_price,
			_quote_price,
			_tax,
			_shipping,
			_discount,
			_extension,
			_unit_of_measures_id,
			NOW(),
			NOW(),
			_entered_quantity,
			_entered_unit_of_measures_id,
			l_uom_main,
			l_uom_alt,
			l_uom_main_qty,
			l_uom_alt_qty,
			_notes
		);

		SELECT LAST_INSERT_ID() INTO id;

		UPDATE products
		SET    stock_in_process_quote = stock_in_process_quote + l_uom_alt_qty,
		       stock_in_process_qty   = stock_in_process_qty   + l_uom_main_qty
		WHERE  products.id            = _products_id;

	END IF;

END$$
DELIMITER ;
