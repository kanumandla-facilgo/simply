DROP PROCEDURE IF EXISTS spCreatePackingslipDetail;

DELIMITER //

CREATE PROCEDURE spCreatePackingslipDetail
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                 OUT _id                INT,
                     _packing_slip_id   INT,
				     _orderdetail_id    INT,
				     _stock_bucket_id   INT,
				     _packed_qty1       DECIMAL(10,2),
				     _unit_of_measure1  INT,
				     _packed_qty2       DECIMAL(10,2),
				     _unit_of_measure2  INT,
				     _piece_count       INT,
				     _notes             VARCHAR(128)
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound              INT;
	DECLARE l_is_batched_inventory  INT;
	DECLARE l_order_id              INT;
	DECLARE l_order_number          VARCHAR(32);
	DECLARE l_product_id            INT;
	DECLARE l_product_name          VARCHAR(256);
	DECLARE l_stock_bucket_id       INT;
	DECLARE l_packing_slip_id       INT;
	DECLARE l_company_id            INT;
	DECLARE l_journal_id            INT;
	DECLARE l_user_id               INT;

	DECLARE l_od_stock_qty          DECIMAL(12, 4);
	DECLARE l_od_stock_alt_qty      DECIMAL(12, 4);
	DECLARE l_od_stock_uom_id       INT;
	DECLARE l_od_stock_alt_uom_id   INT;

	DECLARE l_od_qty_ordered_packed DECIMAL(12, 4);
	DECLARE l_od_qty_entered_packed DECIMAL(12, 4);

	DECLARE l_remaining_qty_ordered DECIMAL(12, 4);
	DECLARE l_remaining_qty_entered DECIMAL(12, 4);

	DECLARE l_bucket_stock_qty      DECIMAL(12, 4);
	DECLARE l_bucket_alt_stock_qty  DECIMAL(12, 4);
	DECLARE l_bucket_uom_id         INT;
	DECLARE l_bucket_alt_uom_id     INT;

	DECLARE l_qty                   DECIMAL(10, 4);

	DECLARE l_packed_qty_uom        DECIMAL(10, 2);
	DECLARE l_packed_qty_alt_uom    DECIMAL(10, 2);

	DECLARE l_unit_of_measures_id         INT;
	DECLARE l_entered_unit_of_measures_id  INT;
	DECLARE l_od_uom_id              INT;
	DECLARE l_od_entered_uom_id      INT;
	
	DECLARE l_item_closed           INT;
	DECLARE l_is_hidden_no_stock    TINYINT;
	DECLARE l_value                 VARCHAR(64);

	DECLARE l_unit1                 INT;
	DECLARE l_unit2                 INT;

/*
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;
*/

    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
     	SET errorcode  = -300;
     	ROLLBACK;
     END;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';
	
	SET l_item_closed = 0;

	IF _packed_qty1 IS NULL AND _packed_qty2 IS NULL THEN
		SET errorcode  = -110;
		SET errormsg   = CONCAT('Quantity is null - ', l_product_name);
		LEAVE main;
	END IF;

	-- find open line item information
	SELECT p.companies_id, d.name, d.orders_id, d.unit_of_measures_id, d.entered_unit_of_measures_id, d.stock_alt_unit_of_measures_id, d.stock_unit_of_measures_id, d.products_id, p.is_batched_inventory, d.stock_quantity, d.stock_alt_quantity, d.quantity_ordered_packed, d.quantity_entered_packed, p.is_hidden_no_stock, d.stock_alt_quantity - d.stock_alt_quantity_packed, d.stock_quantity - d.stock_quantity_packed
--	INTO   l_company_id, l_product_name, l_order_id, l_od_uom_id, l_od_entered_uom_id, l_unit_of_measures_id, l_entered_unit_of_measures_id, l_product_id, l_is_batched_inventory, l_remaining_qty1, l_remaining_qty2, l_is_hidden_no_stock
	INTO   l_company_id, l_product_name, l_order_id, l_od_uom_id, l_od_entered_uom_id, l_od_stock_alt_uom_id, l_od_stock_uom_id, l_product_id, l_is_batched_inventory, l_od_stock_qty, l_od_stock_alt_qty, l_od_qty_ordered_packed, l_od_qty_entered_packed, l_is_hidden_no_stock, l_remaining_qty_ordered, l_remaining_qty_entered
	FROM   order_details d, products p
	WHERE  d.id          = _orderdetail_id
	AND    p.id          = d.products_id
	AND    d.is_complete = 0;

	IF l_notfound = 1 THEN
		SET errorcode  = -114;
		SET errormsg   = CONCAT('Line item is already completed - ', l_product_name);
		LEAVE main;
	END IF;

	IF l_is_batched_inventory = 1 AND _stock_bucket_id IS NULL THEN
		SET errorcode  = -105;
		SET errormsg   = 'Stock code must be passed.';
		LEAVE main;
	END IF;

	-- -- ==============================================================================
	-- -- calculate remaining qty for both the units
	-- -- ==============================================================================
	-- IF l_od_stock_alt_uom_id = l_od_uom_id THEN

	-- 	SET l_remaining_qty_ordered = l_od_stock_alt_qty - l_od_qty_ordered_packed;

	-- END IF;

	-- IF l_od_stock_uom_id = l_od_uom_id THEN

	-- 	SET l_remaining_qty_ordered = l_od_stock_qty - l_od_qty_ordered_packed;

	-- END IF;


	-- IF l_od_stock_alt_uom_id = l_od_entered_uom_id THEN

	-- 	SET l_remaining_qty_entered = l_od_stock_alt_qty - l_od_qty_entered_packed;

	-- END IF;

	-- IF l_od_stock_uom_id = l_od_entered_uom_id THEN

	-- 	SET l_remaining_qty_entered = l_od_stock_qty - l_od_qty_entered_packed;

	-- END IF;


	-- ==============================================================================
	-- get stock bucket information
	-- ==============================================================================
	IF l_is_batched_inventory = 0 THEN

		-- get default stock bucket
		SELECT s.id, s.quantity_entered, s.entered_unit_of_measures_id, s.quantity_ordered, s.unit_of_measures_id
		INTO   l_stock_bucket_id, l_bucket_alt_stock_qty, l_bucket_alt_uom_id, l_bucket_stock_qty, l_bucket_uom_id
		FROM   stock_buckets s
		WHERE  s.products_id    = l_product_id
		AND    s.is_system      = 1
		AND    s.sysstatuses_id = 4600;

	ELSE

		SET l_stock_bucket_id = _stock_bucket_id;

		SELECT s.id, s.quantity_entered, s.entered_unit_of_measures_id, s.quantity_ordered, s.unit_of_measures_id
		INTO   l_stock_bucket_id, l_bucket_alt_stock_qty, l_bucket_alt_uom_id, l_bucket_stock_qty, l_bucket_uom_id
		FROM   stock_buckets s
		WHERE  s.products_id    = l_product_id
		AND    s.id             = l_stock_bucket_id
		AND    s.sysstatuses_id = 4600;

	END IF;
	
	IF l_notfound = 1 THEN
		SET errorcode  = -106;
		SET errormsg   = CONCAT('Invalid stock code - ', l_product_name);
		LEAVE main;
	END IF;

	-- ==============================================================================
	-- check if inputs and order detail units are matching with stock units
	-- ==============================================================================
	IF _unit_of_measure1 = _unit_of_measure2 AND l_bucket_alt_uom_id <> l_bucket_uom_id THEN
		SET errorcode  = -401;
		SET errormsg   = CONCAT('Invalid unit code combination with stock - ', l_product_name);
		LEAVE main;
	END IF;

	IF _unit_of_measure1 <> _unit_of_measure2 AND l_bucket_alt_uom_id = l_bucket_uom_id THEN
		SET errorcode  = -402;
		SET errormsg   = CONCAT('Invalid unit code combination with stock - ', l_product_name);
		LEAVE main;
	END IF;

	IF l_od_uom_id = l_od_entered_uom_id AND (l_bucket_alt_uom_id <> l_od_uom_id AND l_bucket_uom_id <> l_od_uom_id)  THEN
		SET errorcode  = -403;
		SET errormsg   = CONCAT('Invalid unit code combination with order detail - ', l_product_name, ' With:', l_od_uom_id, ' ' , l_od_entered_uom_id, ' ', l_bucket_alt_uom_id, ' ', l_bucket_uom_id);
		LEAVE main;
	END IF;

	IF l_od_uom_id <> l_od_entered_uom_id AND l_bucket_alt_uom_id = l_bucket_uom_id THEN
		SET errorcode  = -404;
		SET errormsg   = CONCAT('Invalid unit code combination with order detail - ', l_product_name);
		LEAVE main;
	END IF;

	IF _unit_of_measure1 <> l_bucket_alt_uom_id AND _unit_of_measure1 <> l_bucket_uom_id THEN
		SET errorcode  = -405;
		SET errormsg   = CONCAT('Unit does not exist in stock - ', l_product_name);
		LEAVE main;
	END IF;

	IF _unit_of_measure2 <> l_bucket_alt_uom_id AND _unit_of_measure2 <> l_bucket_uom_id THEN
		SET errorcode  = -406;
		SET errormsg   = CONCAT('Unit does not exist in stock - ', l_product_name);
		LEAVE main;
	END IF;

	IF (_unit_of_measure1 <> l_od_uom_id AND _unit_of_measure1 <> l_od_entered_uom_id) AND (_unit_of_measure2 <> l_od_uom_id AND _unit_of_measure2 <> l_od_entered_uom_id) THEN
		SET errorcode  = -407;
		SET errormsg   = CONCAT('Unit does not exist in order detail - ', l_product_name);
		LEAVE main;
	END IF;


	-- ==============================================================================
	-- IF one qty is NULL then assign from another if both units are same
	-- ==============================================================================
	IF _packed_qty1 IS NOT NULL AND l_od_uom_id = l_od_entered_uom_id AND _packed_qty2 IS NULL THEN
		SET _packed_qty2 = _packed_qty1;	
	END IF;

	IF _packed_qty1 IS NULL AND l_od_uom_id = l_od_entered_uom_id AND _packed_qty2 IS NOT NULL THEN
		SET _packed_qty1 = _packed_qty2;	
	END IF;

	IF l_od_uom_id = l_od_entered_uom_id AND (_unit_of_measure1 IS NULL OR _unit_of_measure2 IS NULL) THEN
		SET _unit_of_measure1 = l_od_uom_id;
		SET _unit_of_measure2 = l_od_uom_id;
	END IF;

	-- ==============================================================================
	-- check if there is sufficient stock
	-- ==============================================================================
	IF l_bucket_alt_uom_id = _unit_of_measure1 THEN
		SET l_packed_qty_alt_uom = _packed_qty1;
	ELSE
		SET l_packed_qty_alt_uom = _packed_qty2;
	END IF;

	IF l_bucket_uom_id = _unit_of_measure1 THEN
		SET l_packed_qty_uom = _packed_qty1;
	ELSE
		SET l_packed_qty_uom = _packed_qty2;
	END IF;

	IF (l_bucket_alt_stock_qty < l_packed_qty_alt_uom OR l_bucket_stock_qty < l_packed_qty_uom) THEN
 
		SELECT value
		INTO   l_value
		FROM   configurations
		WHERE  sysconfigurations_id = 10009
		AND    companies_id         = l_company_id;

 		IF  (l_value = '1' AND l_is_hidden_no_stock = 0 AND l_is_batched_inventory = 0) THEN

 			SET l_value = '1';

 		ELSE

			SET errorcode  = -111;
			SET errormsg   = CONCAT('Insufficient stock - ', l_product_name);
			LEAVE main;

		END IF;

	END IF;


	-- ==============================================================================
	-- check if remaining qty is not more than stock quantity - for buckets, alt uom qty can't be exceeded so check alt qty 
	-- Ideally, this error should not happen. This is just extra check
	-- ==============================================================================
	IF (l_is_batched_inventory = 1 AND l_bucket_alt_uom_id = l_od_stock_alt_uom_id AND l_bucket_alt_stock_qty > l_remaining_qty_entered) THEN
		SET errorcode  = -112;
		SET errormsg   = 'Extra packing for line item.';
		LEAVE main;
	END IF;

	-- this will not be the case most often. However just check
	IF (l_is_batched_inventory = 1 AND l_bucket_alt_uom_id = l_od_stock_uom_id AND l_bucket_alt_stock_qty > l_remaining_qty_ordered) THEN
		SET errorcode  = -112;
		SET errormsg   = 'Extra packing for line item.';
		LEAVE main;
	END IF;

	-- if batched inventory and packed QTY and bucket Qty are not matching, throw the error
	IF (l_is_batched_inventory = 1 AND l_bucket_alt_stock_qty <> l_packed_qty_alt_uom) THEN
		SET errorcode  = -113;
		SET errormsg   = 'Batch QTY and Packing slip QTY is not matching.';
		LEAVE main;
	END IF;

	-- if batched inventory, disable the bucket
	IF (l_is_batched_inventory = 1) THEN
		UPDATE stock_buckets
		SET    sysstatuses_id = 4601,
	           last_updated   = NOW()
		WHERE  stock_buckets.id = l_stock_bucket_id;
	END IF;

	-- get user from packing slip
	SELECT users_id
	INTO   l_user_id
	FROM   packing_slips s
	WHERE  s.id = _packing_slip_id;

	SET l_unit1 = l_od_uom_id;
	SET l_unit2 = CASE WHEN l_od_uom_id = l_bucket_uom_id THEN l_bucket_alt_uom_id ELSE l_bucket_uom_id END;

	INSERT INTO packing_slip_details
	(
		packing_slips_id,
		orders_id,
		order_details_id,
		products_id,
		stock_buckets_id,
		unit_of_measures_id,
		entered_unit_of_measures_id,
		quantity_ordered_packed,
		quantity_entered_packed,
		piece_count,
		order_unit_of_measures_id,
		notes,
		created,
		last_updated
	)
	VALUES
	(
		_packing_slip_id,
		l_order_id,
		_orderdetail_id,
		l_product_id,
		l_stock_bucket_id,
		l_unit1, /*l_bucket_uom_id, */
		l_unit2, /*l_bucket_alt_uom_id*/
		-- l_packed_qty_uom,
		-- l_packed_qty_alt_uom,
		CASE WHEN _unit_of_measure1 = l_unit1 /*l_bucket_uom_id */ THEN _packed_qty1 ELSE _packed_qty2 END,
		CASE WHEN _unit_of_measure2 = l_unit2 /*l_bucket_alt_uom_id*/ THEN _packed_qty2 ELSE _packed_qty1 END,
		_piece_count,
		l_od_entered_uom_id,
		_notes,
		now(),
		now()
	);

	SELECT LAST_INSERT_ID() INTO _id;

	SELECT order_number
	INTO   l_order_number
	FROM   orders
	WHERE  orders.id = l_order_id;

	-- ==============================================================================
	-- insert stock journal
	-- ==============================================================================
	INSERT INTO stock_journal (companies_id, description, stock_buckets_id, products_id, transaction_date, sysjournalentrytype_id, orders_id, packing_slips_id, users_id, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, system_notes, created, last_updated)
	VALUES (l_company_id, CONCAT('Order #: ', l_order_number, ' OTN: ', l_order_id), l_stock_bucket_id, l_product_id, NOW(), 5401, l_order_id, _packing_slip_id, l_user_id, l_bucket_uom_id, l_bucket_alt_uom_id, l_packed_qty_alt_uom * -1, l_packed_qty_uom * -1, 'Packing Slip Entry', now(), now());

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

	UPDATE order_details
	SET    quantity_entered_packed = quantity_entered_packed + CASE WHEN l_od_entered_uom_id = _unit_of_measure2 THEN _packed_qty2 WHEN l_od_entered_uom_id = _unit_of_measure1 THEN _packed_qty1 ELSE 0 END,
	       quantity_ordered_packed = quantity_ordered_packed + CASE WHEN l_od_uom_id = _unit_of_measure1 THEN _packed_qty1 WHEN l_od_uom_id = _unit_of_measure2 THEN _packed_qty2 ELSE 0 END,
	       stock_quantity_packed   = stock_quantity_packed + CASE WHEN stock_unit_of_measures_id = _unit_of_measure1 THEN _packed_qty1 ELSE _packed_qty2 END,
	       stock_alt_quantity_packed = stock_alt_quantity_packed + CASE WHEN stock_alt_unit_of_measures_id = _unit_of_measure1 THEN _packed_qty1 ELSE _packed_qty2 END,
	       last_updated            = NOW()
	WHERE  order_details.id        = _orderdetail_id;

	UPDATE order_details
	SET    is_complete             = 1,
           last_updated            = NOW()
	WHERE  order_details.id        = _orderdetail_id
	AND    (quantity_entered_packed >= entered_quantity);

	-- if order detail is closed, let's make sure offset quantity and units are matching. If not, adjust the offset qty
	IF ROW_COUNT() = 1 THEN

		SET l_item_closed = 1;

-- 		-- for toweling type, often times, both units are same in uom and entered uom. In order to find qty to offset remaining, user input can't be relied upon
-- --		IF l_od_entered_uom_id <> l_od_stock_alt_uom_id THEN
-- 		IF l_od_entered_uom_id <> l_od_stock_uom_id THEN
	
-- 			SELECT l_remaining_qty_ordered * stock_quantity / stock_alt_quantity 
-- 			INTO   l_remaining_qty_entered
-- 			FROM   order_details d
-- 			WHERE  d.id  = _orderdetail_id;
			
-- --		ELSEIF l_od_uom_id <> l_unit_of_measures_id THEN
-- 		ELSEIF l_od_uom_id <> l_od_stock_alt_uom_id THEN

-- 			SELECT l_remaining_qty_entered * stock_alt_quantity / stock_quantity 
-- 			INTO   l_remaining_qty_ordered
-- 			FROM   order_details d
-- 			WHERE  d.id  = _orderdetail_id;

-- 		END IF;
		
	END IF;

	-- if line item is completed, clear complete stock out.
	IF l_item_closed = 1 THEN

		-- UPDATE products
		-- SET    stock_in_process_quote = CASE WHEN l_item_closed = 1 THEN CASE WHEN l_od_uom_id =  l_bucket_uom_id THEN stock_in_process_quote - l_remaining_qty_ordered ELSE stock_in_process_quote - l_remaining_qty_entered END ELSE CASE WHEN _unit_of_measure1 = l_od_uom_id THEN  stock_in_process_quote - _packed_qty1 ELSE stock_in_process_quote - _packed_qty2 END END,
		--        stock_in_process_qty   = CASE WHEN l_item_closed = 1 THEN CASE WHEN l_od_entered_uom_id =  l_bucket_alt_uom_id THEN stock_in_process_qty - l_remaining_qty_entered ELSE stock_in_process_qty - l_remaining_qty_ordered END ELSE CASE WHEN _unit_of_measure2 = l_od_entered_uom_id THEN  stock_in_process_qty - _packed_qty2 ELSE stock_in_process_qty - _packed_qty1 END END, 
		--        stock_quote            = stock_quote - CASE WHEN l_od_uom_id =  l_bucket_uom_id THEN _packed_qty1 ELSE _packed_qty2 END,
		--        stock_qty              = stock_qty   - CASE WHEN l_od_entered_uom_id =  l_bucket_alt_uom_id THEN _packed_qty2 ELSE _packed_qty1 END,
		--        last_updated           = NOW()
		-- WHERE  products.id            = l_product_id;

		UPDATE products
		SET    stock_in_process_quote = stock_in_process_quote - l_remaining_qty_ordered, /*    CASE WHEN _unit_of_measure1 =  l_bucket_uom_id THEN l_remaining_qty_ordered ELSE l_remaining_qty_entered END, */
		       stock_in_process_qty   = stock_in_process_qty - l_remaining_qty_entered, /*CASE WHEN _unit_of_measure2 =  l_bucket_alt_uom_id THEN l_remaining_qty_entered ELSE l_remaining_qty_ordered END, */
		       stock_quote            = stock_quote - l_packed_qty_uom,
		       stock_qty              = stock_qty - l_packed_qty_alt_uom,
		       last_updated           = NOW()
		WHERE  products.id            = l_product_id;

	ELSE

		UPDATE products
		SET    stock_in_process_quote = stock_in_process_quote - l_packed_qty_uom,
		       stock_in_process_qty   = stock_in_process_qty - l_packed_qty_alt_uom, 
		       stock_quote            = stock_quote - l_packed_qty_uom,
		       stock_qty              = stock_qty - l_packed_qty_alt_uom,
		       last_updated           = NOW()
		WHERE  products.id            = l_product_id;

	END IF;

	-- update packing slip tax and ship total from order detail using the qty packed
	
	IF l_od_uom_id = l_bucket_uom_id THEN 
		SET l_qty = _packed_qty1; 
	ELSE 
		SET l_qty = _packed_qty2; 
	END IF;

	UPDATE packing_slip_details pd
	INNER JOIN order_details d ON d.id = pd.order_details_id 
	SET   pd.sub_total  = ROUND( (d.extension * l_qty/d.order_quantity), 2),
	      pd.discount_total = ROUND( (d.discount * l_qty/d.order_quantity), 2),
	      pd.tax_total  = ROUND( (d.tax * l_qty/d.order_quantity), 2),
	      pd.ship_total = ROUND( (d.shipping * l_qty/d.order_quantity), 2)
	WHERE pd.id = _id;

	UPDATE packing_slips
	INNER JOIN packing_slip_details pd ON pd.packing_slips_id = packing_slips.id 
	SET   packing_slips.sub_total  = packing_slips.sub_total + pd.sub_total,
	      packing_slips.discount_total = packing_slips.discount_total + pd.discount_total,	
	      packing_slips.tax_total  = packing_slips.tax_total + pd.tax_total,
	      packing_slips.ship_total = packing_slips.ship_total + pd.ship_total
	WHERE packing_slips.id = _packing_slip_id
	AND   pd.id            = _id;
/*
	UPDATE packing_slips
	INNER JOIN order_details d ON d.orders_id = packing_slips.orders_id AND d.id = _orderdetail_id
	SET   packing_slips.sub_total  = packing_slips.sub_total + ROUND( ((d.extension - d.tax - d.shipping) * l_qty/d.order_quantity), 2),
	      packing_slips.tax_total  = packing_slips.tax_total + ROUND( (d.tax * l_qty/d.order_quantity), 2),
	      packing_slips.ship_total = packing_slips.ship_total + ROUND( (d.shipping * l_qty/d.order_quantity), 2)
	WHERE packing_slips.id = _packing_slip_id;
*/
	-- update order status to delivered if all line items are completed
	UPDATE orders
	SET    sysorderstatuses_id    = 4202,
	       dispatch_date          = NOW(),
	       last_updated           = NOW()
	WHERE  orders.id              = l_order_id
	AND    NOT EXISTS (SELECT 1 FROM order_details d WHERE d.orders_id = l_order_id AND is_complete = 0);

END;
//

DELIMITER ;
