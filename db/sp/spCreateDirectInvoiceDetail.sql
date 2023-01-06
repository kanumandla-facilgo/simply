DROP PROCEDURE IF EXISTS spCreateDirectInvoiceDetail;

delimiter //

CREATE  PROCEDURE spCreateDirectInvoiceDetail
		(
	         OUT errorcode                   INT, 
	         OUT errormsg                    VARCHAR(512),
	         OUT id                          INT,
	         	_deliverynoteid              INT,
				_productid	                 INT,
				_quantity	                 DECIMAL(10,2),
				_unit_price	                 DECIMAL(10,2),
				_subtotal                    DECIMAL(10,2),
				_taxtotal		             DECIMAL(10,2),
				_shiptotal	                 DECIMAL(10,2),
				_discounttotal	             DECIMAL(10,2),
				_unit_of_measures_id	     INT,
				_notes 		                 VARCHAR(512),
				_entered_unit_of_measures_id INT,
				_entered_quantity	         DECIMAL(10,2),
				_stock_bucket_id             INT,
				_userid                      INT
        )

DETERMINISTIC

main: BEGIN

	DECLARE l_notfound     INT;
	DECLARE l_id           INT;
	DECLARE l_companyid    INT;
	DECLARE l_sku          VARCHAR(32);
	DECLARE l_journal_id   INT;

	DECLARE l_product_name VARCHAR(256);
	DECLARE l_is_batched_inventory INT;
	DECLARE l_is_hidden_no_stock INT;
	
	DECLARE l_uom_id          INT;
	DECLARE l_alt_uom_id      INT;  
	DECLARE l_stock_uom_id    INT;
	DECLARE l_stock_alt_uom_id INT;
	DECLARE l_uom_main        INT;
	DECLARE l_uom_alt         INT;
	DECLARE l_uom_main_qty DECIMAL(10, 4);
	DECLARE l_uom_alt_qty  DECIMAL(10, 4);

	DECLARE l_stock_bucket_id INT;
	DECLARE l_bucket_alt_stock_qty DECIMAL(12, 4);
	DECLARE l_bucket_stock_qty DECIMAL(12, 4);
	DECLARE l_packed_qty_alt_uom DECIMAL(12, 4);
	DECLARE l_packed_qty_uom DECIMAL(12, 4);
	DECLARE l_bucket_alt_uom_id INT;
	DECLARE l_bucket_uom_id INT;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno;
		ROLLBACK;
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

	SELECT p.companies_id, p.sku, p.name, p.unit_of_measures_id, p.default_qty_uom_id, p.stock_alt_unit_of_measures_id, p.stock_unit_of_measures_id, p.is_batched_inventory, p.is_hidden_no_stock
	INTO   l_companyid, l_sku, l_product_name, l_uom_id, l_alt_uom_id, l_stock_alt_uom_id, l_stock_uom_id, l_is_batched_inventory, l_is_hidden_no_stock
	FROM   products p
	WHERE  p.id          = _productid;

	IF l_notfound = 1 THEN
		SET errorcode  = -114;
		SET errormsg   = CONCAT('Product not found - ', l_product_name);
		LEAVE main;
	END IF;

	IF l_is_batched_inventory = 1 AND _stock_bucket_id IS NULL THEN
		SET errorcode  = -105;
		SET errormsg   = CONCAT('Stock code must be passed for product - ', l_product_name);
		LEAVE main;
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.companies_id = l_companyid AND d.id = _deliverynoteid)) THEN
		SET errorcode  = -106;
		SET errormsg   = 'Delivery note not found.';
		LEAVE main;
	END IF;

	-- ==============================================================================
	-- get stock bucket information
	-- ==============================================================================
	IF l_is_batched_inventory = 0 THEN

		-- get default stock bucket
		SELECT s.id, s.quantity_entered, s.entered_unit_of_measures_id, s.quantity_ordered, s.unit_of_measures_id
		INTO   l_stock_bucket_id, l_bucket_alt_stock_qty, l_bucket_alt_uom_id, l_bucket_stock_qty, l_bucket_uom_id
		FROM   stock_buckets s
		WHERE  s.products_id    = _productid
		AND    s.is_system      = 1
		AND    s.sysstatuses_id = 4600;

	ELSE

		SET l_stock_bucket_id = _stock_bucket_id;

		SELECT s.id, s.quantity_entered, s.entered_unit_of_measures_id, s.quantity_ordered, s.unit_of_measures_id
		INTO   l_stock_bucket_id, l_bucket_alt_stock_qty, l_bucket_alt_uom_id, l_bucket_stock_qty, l_bucket_uom_id
		FROM   stock_buckets s
		WHERE  s.products_id    = _productid
		AND    s.id             = l_stock_bucket_id
		AND    s.sysstatuses_id = 4600;

	END IF;
	
	IF l_notfound = 1 THEN
		SET errorcode  = -106;
		SET errormsg   = CONCAT('Invalid stock code - ', l_product_name);
		LEAVE main;
	END IF;

	-- ==============================================================================
	-- check if there is sufficient stock
	-- ==============================================================================
	IF l_bucket_alt_uom_id = _unit_of_measures_id THEN
		SET l_packed_qty_alt_uom = _quantity;
	ELSE
		SET l_packed_qty_alt_uom = _entered_quantity;
	END IF;

	IF l_bucket_uom_id = _unit_of_measures_id THEN
		SET l_packed_qty_uom = _quantity;
	ELSE
		SET l_packed_qty_uom = _entered_quantity;
	END IF;

	IF (l_is_batched_inventory = 1 AND l_bucket_alt_stock_qty <> l_packed_qty_alt_uom) THEN
		SET errorcode  = -113;
		SET errormsg   = 'Batch QTY and Packing slip QTY is not matching.';
		LEAVE main;
	END IF;

	IF (l_is_batched_inventory = 1 OR l_is_hidden_no_stock = 1) AND (l_bucket_alt_stock_qty < l_packed_qty_alt_uom OR l_bucket_stock_qty < l_packed_qty_uom) THEN

		SET errorcode  = -111;
		SET errormsg   = CONCAT('Insufficient stock - ', l_product_name);
		LEAVE main;

	END IF;

	-- if batched inventory, disable the bucket
	IF (l_is_batched_inventory = 1) THEN
		UPDATE stock_buckets
		SET    sysstatuses_id = 4601,
	           last_updated   = NOW()
		WHERE  stock_buckets.id = l_stock_bucket_id;
	END IF;

	INSERT INTO delivery_note_details
	(
		delivery_notes_id,
		packing_slips_id,
		packing_slip_details_id,
		products_id,
		stock_buckets_id,
		name,
		sku,
		unit_of_measures_id,
		entered_unit_of_measures_id,
		quantity_ordered_packed,
		quantity_entered_packed,
		price,
		sub_total,
		ship_total,
		tax_total,
		discount_total,
		created,
		last_updated
	)
	VALUES
	(
		_deliverynoteid,
		null,
		null,
		_productid,
		l_stock_bucket_id,
		l_product_name,
		l_sku,
		_unit_of_measures_id,
		_entered_unit_of_measures_id,
		l_packed_qty_uom,
		l_packed_qty_alt_uom,
		_unit_price,
		_subtotal,
		_shiptotal,
		_taxtotal,
		_discounttotal,
		now(),
		now()
	);

	SELECT LAST_INSERT_ID() INTO id;

	-- ==============================================================================
	-- insert stock journal
	-- ==============================================================================
	INSERT INTO stock_journal (companies_id, description, stock_buckets_id, products_id, transaction_date, sysjournalentrytype_id, orders_id, packing_slips_id, delivery_notes_id, users_id, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, system_notes, created, last_updated)
	VALUES (l_companyid, 'Direct Invoice', l_stock_bucket_id, _productid, NOW(), 5401, null, null, _deliverynoteid, _userid, l_bucket_uom_id, l_bucket_alt_uom_id, l_packed_qty_alt_uom * -1, l_packed_qty_uom * -1, 'Direct Invoice Entry', now(), now());

	SELECT LAST_INSERT_ID() INTO l_journal_id;

	INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, quantity, unit_of_measures_id, created, last_updated)
	SELECT l_journal_id, l_stock_bucket_id, d.id, l_packed_qty_uom * -1, l_bucket_uom_id, now(), now()
	FROM   stock_bucket_details d
	WHERE  d.stock_buckets_id    = l_stock_bucket_id
	AND    d.unit_of_measures_id = l_bucket_uom_id;

	IF (l_bucket_uom_id <> l_bucket_alt_uom_id) THEN

		INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, quantity, unit_of_measures_id, created, last_updated)
		SELECT l_journal_id, l_stock_bucket_id, d.id, l_packed_qty_alt_uom * -1, l_bucket_alt_uom_id, now(), now()
		FROM   stock_bucket_details d
		WHERE  d.stock_buckets_id    = l_stock_bucket_id
		AND    d.unit_of_measures_id = l_bucket_alt_uom_id;

	END IF;

	-- if non batched inventory, update the stock. For batched inventory, we have updated status earlier
	IF (l_is_batched_inventory = 0) THEN

		UPDATE stock_buckets
		SET    quantity_ordered = quantity_ordered - l_packed_qty_uom,
			   quantity_entered = quantity_entered - l_packed_qty_alt_uom,
			   last_updated     = NOW()
		WHERE  stock_buckets.id = l_stock_bucket_id;

		UPDATE stock_bucket_details
		SET    quantity         = quantity - l_packed_qty_uom,
			   last_updated     = NOW()
		WHERE  stock_bucket_details.stock_buckets_id = l_stock_bucket_id
		AND    stock_bucket_details.unit_of_measures_id = l_bucket_uom_id;

		IF (l_bucket_uom_id <> l_bucket_alt_uom_id) THEN

			UPDATE stock_bucket_details
			SET    quantity         = quantity - l_packed_qty_alt_uom,
				   last_updated     = NOW()
			WHERE  stock_bucket_details.stock_buckets_id = l_stock_bucket_id
			AND    stock_bucket_details.unit_of_measures_id = l_bucket_alt_uom_id;

		END IF;
	
	END IF;

	UPDATE products
	SET    stock_quote            = stock_quote - l_packed_qty_uom,
	       stock_qty              = stock_qty - l_packed_qty_alt_uom,
	       last_updated           = NOW()
	WHERE  products.id            = _productid;


END;
//

DELIMITER ;
