DROP PROCEDURE IF EXISTS spCancelPackingslip;

DELIMITER //

CREATE PROCEDURE spCancelPackingslip
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _companyid         INT,
                     _packing_slip_id   INT,
                     _userid            INT
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound              INT;
	DECLARE l_order_id              INT;
	DECLARE l_status_id             INT;
	
-- can i replace typeahead everywhere?
-- how to go live with inventory? Orders created already. If you make packing slip.
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

	SELECT orders_id, syspackingslipstatuses_id
	INTO   l_order_id, l_status_id
	FROM   packing_slips s
	WHERE  s.id           = _packing_slip_id
	AND    s.companies_id = _companyid;

	-- if packing slip not found, error out.
	IF (l_notfound = 1) THEN
		SET errorcode  = -110;
		SET errormsg   = 'Packing slip not found.';
		LEAVE main;
	END IF;

	-- Check if slip is in open status. Status should not be different than open.
	IF (l_status_id <> 5199) THEN
		SET errorcode  = -112;
		SET errormsg   = 'Packing slip cannot be cancelled.';
		LEAVE main;
	END IF;

	-- insert stock journal
	INSERT INTO stock_journal (companies_id, description, stock_buckets_id, products_id, transaction_date, sysjournalentrytype_id, orders_id, packing_slips_id, users_id, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, system_notes, created, last_updated)
	SELECT j.companies_id, CONCAT('Order Cancellation: ', o.order_number, ' OTN: ', o.id) /*CONCAT('Order Cancellation: ', j.orders_id) */, j.stock_buckets_id, j.products_id, NOW(), 5402, j.orders_id, j.packing_slips_id, _userid, j.unit_of_measures_id, j.entered_unit_of_measures_id, j.quantity_entered * -1, j.quantity_ordered * -1, 'Packing slip cancellation', now(), now()  
	FROM   stock_journal j, orders o
	WHERE  j.packing_slips_id       = _packing_slip_id
	AND    j.sysjournalentrytype_id  = 5401
	AND    o.id = j.orders_id;

	INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, quantity, unit_of_measures_id, created, last_updated)
	SELECT j2.id, d.stock_buckets_id, d.stock_bucket_details_id, d.quantity * -1, d.unit_of_measures_id, now(), now()
	FROM   stock_journal_details d, stock_journal j1, stock_journal j2
	WHERE  j1.packing_slips_id       = _packing_slip_id
	AND    j1.sysjournalentrytype_id = 5401
	AND    j2.packing_slips_id       = _packing_slip_id
	AND    j2.sysjournalentrytype_id = 5402
	AND    j2.stock_buckets_id       = j1.stock_buckets_id
	AND    j1.id                     = d.stock_journal_id;

	-- update stock bucket
	UPDATE stock_buckets
	SET    sysstatuses_id = 4600,
	       last_updated   = NOW()
	WHERE  stock_buckets.id IN (SELECT d.stock_buckets_id FROM packing_slip_details d WHERE packing_slips_id = _packing_slip_id)
	AND    sysstatuses_id <> 4600;

	-- update product table
	-- at times, packed qty might be higher than ordered qty. when cancellation happens, you just need to set ordered qty to in process (e.g. ordered qty is 100 but packed is 105, upon cancellation, you need only 100 back in process)
	-- SUM() in order detail is just used for future use if same product is repeated multiple times in order.
	
	-- Also, at times, packed quantity can be less. If first packing slip is cancelled, the calculation will be different than subsequent ones.

	--  OQ   PSQ             = PSQ - (PQ  - OQ)
	-- 	600  500 (300 + 200) = 500 - (500 - 600) = 600
	-- 
	-- 	600  700 (400 + 300) = 700 - (700 - 600) = 600
	--  
	-- 	600 300              = 300 - (700 - 600) = 200
	-- 		400              =                   = 400
	-- 
	-- 	600 400              = 400 - (700 - 600) = 300
	-- 		300              =                   = 300
	-- 
	-- 	600 200              = 200 - (500 - 600) = 300
	-- 		300              =                   = 300
	-- 
	-- 	600 400              = 400 - (600 - 600) = 400
	-- 		200              =                   = 200

	--  OQ   PSQ PSQ - DIST  C  SIP     PSQ    PQ   OQ                       STP_NEW
	-- 	600  500 (300 + 200) 0  100   = 500    500  600 = 500 - 500 + 600  = 600
	--  600  700 (400 + 300) 0    0   = 700    700  600 = 700 - 700 + 600  = 600
	--  600  700 (400 + 300) 0    0   = 700    700  600 = 700 - 700 + 600  = 600

	-- first do processing for completed line items. Complete line item means, qty is 0 for stock_in_process. So add up difference as well
    UPDATE products
	INNER JOIN (
			SELECT od.products_id, 
 			       od.stock_unit_of_measures_id, 
 			       od.sum_qty_ordered - od.sum_qty_ordered_packed + CASE WHEN od.stock_unit_of_measures_id = pd.unit_of_measures_id THEN pd.sum_qty_ordered_packed ELSE pd.sum_qty_entered_packed END AS undo_packed_qty_quote,
 			       od.stock_alt_unit_of_measures_id,
 			       od.sum_qty_entered - od.sum_qty_entered_packed + CASE WHEN od.stock_alt_unit_of_measures_id = pd.entered_unit_of_measures_id THEN pd.sum_qty_entered_packed ELSE pd.sum_qty_ordered_packed END AS undo_packed_qty_qty,
 			       -- pd.sum_qty_ordered_packed - (od.sum_qty_ordered_packed - od.sum_qty_ordered) AS undo_packed_qty_quote,
 			       -- pd.sum_qty_entered_packed - (od.sum_qty_entered_packed - od.sum_qty_entered) AS undo_packed_qty_qty,
--  			   CASE WHEN od.sum_qty_ordered_packed - od.sum_qty_ordered > 0 THEN pd.sum_qty_ordered_packed - (od.sum_qty_ordered_packed - od.sum_qty_ordered) ELSE pd.sum_qty_ordered_packed END AS undo_packed_qty_quote,
--  			   CASE WHEN od.sum_qty_entered_packed - od.sum_qty_entered > 0 THEN pd.sum_qty_entered_packed - (od.sum_qty_entered_packed - od.sum_qty_entered) ELSE pd.sum_qty_entered_packed END AS undo_packed_qty_qty,
 			       pd.unit_of_measures_id,
 			       pd.entered_unit_of_measures_id, 
 			       pd.sum_qty_ordered_packed AS actual_ordered_qty,
 			       pd.sum_qty_entered_packed AS actual_entered_qty
			FROM (
--					SELECT d.products_id, d.stock_unit_of_measures_id, d.stock_alt_unit_of_measures_id, SUM(d.stock_quantity) AS sum_qty_ordered, SUM(d.stock_alt_quantity) AS sum_qty_entered, SUM(d.quantity_ordered_packed * CASE WHEN d.stock_alt_unit_of_measures_id = d.unit_of_measures_id THEN 1 ELSE d.stock_alt_quantity / d.stock_quantity END ) AS sum_qty_ordered_packed, SUM(d.quantity_entered_packed * CASE WHEN d.stock_unit_of_measures_id = d.entered_unit_of_measures_id THEN 1 ELSE d.stock_quantity / d.stock_alt_quantity END) AS sum_qty_entered_packed
					SELECT d.products_id, d.stock_unit_of_measures_id, d.stock_alt_unit_of_measures_id, SUM(d.stock_quantity) AS sum_qty_ordered, SUM(d.stock_alt_quantity) AS sum_qty_entered, SUM(d.stock_quantity_packed) AS sum_qty_ordered_packed, SUM(d.stock_alt_quantity_packed) AS sum_qty_entered_packed
					FROM   order_details d, packing_slips s
					WHERE  s.id          = _packing_slip_id
					AND    d.orders_id   = s.orders_id
					AND    d.is_complete = 1
					GROUP BY d.products_id, d.stock_unit_of_measures_id, d.stock_alt_unit_of_measures_id
 				) od,
				(
					SELECT d.products_id, d.unit_of_measures_id, d.entered_unit_of_measures_id, SUM(d.quantity_ordered_packed) AS sum_qty_ordered_packed, SUM(d.quantity_entered_packed) AS sum_qty_entered_packed
					FROM   packing_slip_details d
					WHERE  d.packing_slips_id = _packing_slip_id
					GROUP BY d.products_id, d.unit_of_measures_id, d.entered_unit_of_measures_id
				) pd
 			WHERE pd.products_id = od.products_id
		) d ON d.products_id = products.id
	SET    stock_in_process_quote = stock_in_process_quote + CASE WHEN products.stock_unit_of_measures_id  = d.stock_unit_of_measures_id THEN d.undo_packed_qty_quote ELSE d.undo_packed_qty_qty END,
	       stock_in_process_qty   = stock_in_process_qty + CASE WHEN products.stock_alt_unit_of_measures_id  = d.stock_alt_unit_of_measures_id THEN d.undo_packed_qty_qty ELSE d.undo_packed_qty_quote END,
	       stock_quote            = stock_quote + CASE WHEN products.stock_unit_of_measures_id  = d.unit_of_measures_id THEN d.actual_ordered_qty ELSE d.actual_entered_qty END,
	       stock_qty              = stock_qty   + CASE WHEN products.stock_alt_unit_of_measures_id  = d.entered_unit_of_measures_id THEN d.actual_entered_qty ELSE d.actual_ordered_qty END,
	-- SET    stock_in_process_quote = stock_in_process_quote + undo_packed_qty_quote,
	--        stock_in_process_qty   = stock_in_process_qty + undo_packed_qty_qty,
	--        stock_quote            = stock_quote + actual_ordered_qty,
	--        stock_qty              = stock_qty   + actual_entered_qty,
	       last_updated           = NOW();

	-- second, do processing for incomplete line items. here stock_in_process should hold qty not packed yet. So just add packing slip qty back
    UPDATE products
	INNER JOIN (

			SELECT pd.products_id, 
				   pd.unit_of_measures_id,
				   pd.entered_unit_of_measures_id,
 			       pd.sum_qty_ordered_packed AS undo_packed_qty_quote,
 			       pd.sum_qty_entered_packed AS undo_packed_qty_qty,
--  			   CASE WHEN od.sum_qty_ordered_packed - od.sum_qty_ordered > 0 THEN pd.sum_qty_ordered_packed - (od.sum_qty_ordered_packed - od.sum_qty_ordered) ELSE pd.sum_qty_ordered_packed END AS undo_packed_qty_quote,
--  			   CASE WHEN od.sum_qty_entered_packed - od.sum_qty_entered > 0 THEN pd.sum_qty_entered_packed - (od.sum_qty_entered_packed - od.sum_qty_entered) ELSE pd.sum_qty_entered_packed END AS undo_packed_qty_qty,
 			       pd.sum_qty_ordered_packed AS actual_ordered_qty,
 			       pd.sum_qty_entered_packed AS actual_entered_qty
			FROM (
--					SELECT d.products_id, SUM(d.stock_quantity) AS sum_qty_entered, SUM(d.stock_alt_quantity) AS sum_qty_ordered, SUM(CASE WHEN d.stock_alt_unit_of_measures_id = d.unit_of_measures_id THEN d.quantity_ordered_packed ELSE d.quantity_entered_packed * d.stock_quantity / d.stock_alt_quantity END) AS sum_qty_ordered_packed, SUM(CASE WHEN d.stock_unit_of_measures_id = d.entered_unit_of_measures_id THEN d.quantity_entered_packed ELSE d.quantity_ordered_packed * d.stock_alt_quantity / d.stock_quantity END ) AS sum_qty_entered_packed
					SELECT d.products_id, d.stock_unit_of_measures_id, d.stock_alt_unit_of_measures_id, SUM(d.stock_quantity_packed) AS sum_qty_ordered_packed, SUM(d.stock_alt_quantity_packed) AS sum_qty_entered_packed
					FROM   order_details d, packing_slips s
					WHERE  s.id          = _packing_slip_id
					AND    d.orders_id   = s.orders_id
					AND    d.is_complete = 0
					GROUP BY d.products_id, d.stock_unit_of_measures_id, d.stock_alt_unit_of_measures_id
 				) od,
 				(
					SELECT d.products_id, d.unit_of_measures_id, d.entered_unit_of_measures_id, SUM(d.quantity_ordered_packed) AS sum_qty_ordered_packed, SUM(d.quantity_entered_packed) AS sum_qty_entered_packed
					FROM   packing_slip_details d
					WHERE  d.packing_slips_id = _packing_slip_id
					GROUP BY d.products_id, d.unit_of_measures_id, d.entered_unit_of_measures_id
				) pd
 			WHERE pd.products_id = od.products_id

		) d ON d.products_id = products.id
	SET    stock_in_process_quote = stock_in_process_quote + CASE WHEN products.stock_unit_of_measures_id  = d.unit_of_measures_id THEN d.undo_packed_qty_quote ELSE d.undo_packed_qty_qty END,
	       stock_in_process_qty   = stock_in_process_qty + CASE WHEN products.stock_alt_unit_of_measures_id  = d.entered_unit_of_measures_id THEN d.undo_packed_qty_qty ELSE d.undo_packed_qty_quote END,
	       stock_quote            = stock_quote + CASE WHEN products.stock_unit_of_measures_id  = d.unit_of_measures_id THEN d.actual_ordered_qty ELSE d.actual_entered_qty END,
	       stock_qty              = stock_qty   + CASE WHEN products.stock_alt_unit_of_measures_id  = d.entered_unit_of_measures_id THEN d.actual_entered_qty ELSE d.actual_ordered_qty END,
	       last_updated           = NOW();

	-- if non batched inventory, update the stock. For batched inventory, we have updated status earlier
	UPDATE stock_buckets s
		   INNER JOIN (
				SELECT d.packing_slips_id, d.stock_buckets_id, d.products_id, d.unit_of_measures_id, d.entered_unit_of_measures_id, SUM(d.quantity_ordered_packed) AS sum_qty_ordered_packed, SUM(d.quantity_entered_packed) AS sum_qty_entered_packed
				FROM   packing_slip_details d
				WHERE  d.packing_slips_id = _packing_slip_id
				AND    EXISTS (SELECT 1 FROM products p WHERE p.id = d.products_id AND p.is_batched_inventory = 0)
				GROUP BY d.packing_slips_id, d.stock_buckets_id, d.products_id, d.unit_of_measures_id, d.entered_unit_of_measures_id
			) d ON d.stock_buckets_id = s.id 
	SET    s.quantity_ordered = s.quantity_ordered + CASE WHEN s.unit_of_measures_id = d.unit_of_measures_id THEN d.sum_qty_ordered_packed ELSE d.sum_qty_entered_packed END,
		   s.quantity_entered = s.quantity_entered + CASE WHEN s.entered_unit_of_measures_id = d.entered_unit_of_measures_id THEN d.sum_qty_entered_packed ELSE d.sum_qty_ordered_packed END,
		   last_updated     = NOW()
	WHERE  d.packing_slips_id = _packing_slip_id;

	-- update stock bucket details
	UPDATE stock_bucket_details d
		   INNER JOIN (
				SELECT d.packing_slips_id, d.stock_buckets_id, d.unit_of_measures_id AS unit_of_measures_id, SUM(d.quantity_ordered_packed) AS qty
				FROM   packing_slip_details d
				WHERE  d.packing_slips_id = _packing_slip_id
				AND    EXISTS (SELECT 1 FROM products p WHERE p.id = d.products_id AND p.is_batched_inventory = 0)
				GROUP BY d.packing_slips_id, d.stock_buckets_id, d.unit_of_measures_id
				UNION ALL
				SELECT d.packing_slips_id, d.stock_buckets_id, d.entered_unit_of_measures_id AS unit_of_measures_id, SUM(d.quantity_entered_packed) AS qty
				FROM   packing_slip_details d
				WHERE  d.packing_slips_id = _packing_slip_id
				AND    EXISTS (SELECT 1 FROM products p WHERE p.id = d.products_id AND p.is_batched_inventory = 0)
				AND    d.unit_of_measures_id <> d.entered_unit_of_measures_id
				GROUP BY d.packing_slips_id, d.stock_buckets_id, d.entered_unit_of_measures_id
			) pd ON pd.stock_buckets_id = d.stock_buckets_id AND pd.unit_of_measures_id = d.unit_of_measures_id
	SET    d.quantity          = d.quantity + pd.qty,
		   last_updated        = NOW()
	WHERE  pd.packing_slips_id = _packing_slip_id;

	-- reduce packed qty
	UPDATE order_details d
	SET    quantity_entered_packed = quantity_entered_packed - (SELECT SUM(CASE WHEN p.entered_unit_of_measures_id = d.entered_unit_of_measures_id THEN p.quantity_entered_packed ELSE p.quantity_ordered_packed END) FROM packing_slip_details p WHERE p.packing_slips_id = _packing_slip_id AND p.order_details_id = d.id) ,
	       quantity_ordered_packed = quantity_ordered_packed - (SELECT SUM(CASE WHEN p.unit_of_measures_id = d.unit_of_measures_id THEN p.quantity_ordered_packed ELSE p.quantity_entered_packed END) FROM packing_slip_details p WHERE p.packing_slips_id = _packing_slip_id AND p.order_details_id = d.id),
	       stock_quantity_packed   = stock_quantity_packed - (SELECT SUM(CASE WHEN p.unit_of_measures_id = d.stock_unit_of_measures_id THEN p.quantity_ordered_packed ELSE p.quantity_entered_packed END) FROM packing_slip_details p WHERE p.packing_slips_id = _packing_slip_id AND p.order_details_id = d.id),
	       stock_alt_quantity_packed   = stock_alt_quantity_packed - (SELECT SUM(CASE WHEN p.unit_of_measures_id = d.stock_alt_unit_of_measures_id THEN p.quantity_ordered_packed ELSE p.quantity_entered_packed END) FROM packing_slip_details p WHERE p.packing_slips_id = _packing_slip_id AND p.order_details_id = d.id),
	       last_updated            = NOW()
	WHERE  d.id                    IN (SELECT pd.order_details_id FROM packing_slip_details pd WHERE pd.packing_slips_id = _packing_slip_id);

/*
	-- reduce packed qty
	UPDATE order_details d
	SET    quantity_entered_packed = quantity_entered_packed - (SELECT SUM(p.quantity_entered_packed) FROM packing_slip_details p WHERE p.packing_slips_id = _packing_slip_id AND p.order_details_id = d.id) ,
	       quantity_ordered_packed = quantity_ordered_packed - (SELECT SUM(p.quantity_ordered_packed) FROM packing_slip_details p WHERE p.packing_slips_id = _packing_slip_id AND p.order_details_id = d.id),
	       last_updated            = NOW()
	WHERE  d.id                    IN (SELECT pd.order_details_id FROM packing_slip_details pd WHERE pd.packing_slips_id = _packing_slip_id);

*/

	-- set the line item to incomplete
	UPDATE order_details d
	SET    is_complete               = 0,
           last_updated              = NOW()
	WHERE  d.id                      IN (SELECT d.order_details_id FROM packing_slip_details d WHERE packing_slips_id = _packing_slip_id)
	AND    d.quantity_entered_packed < d.entered_quantity
	AND    d.is_complete             = 1;

	-- cancel packing slip
	UPDATE packing_slips
	SET    syspackingslipstatuses_id = 5203,
	       cancelusers_id            = _userid,
	       last_updated              = NOW()
	WHERE  packing_slips.id          = _packing_slip_id;

	-- update order status back to in-packing
	UPDATE orders
	SET    sysorderstatuses_id    = 4201,
	       dispatch_date          = NULL,
	       last_updated           = NOW()
	WHERE  orders.id              = l_order_id
	AND    sysorderstatuses_id    <> 4201;

	-- if only one packing slip which got cancelled, change the delivery status
	UPDATE orders
	SET    sysdeliverystatuses_id = 5700,
	       last_updated           = NOW()
	WHERE  orders.id              = l_order_id
	AND    sysdeliverystatuses_id <> 5700
	AND    NOT EXISTS (SELECT 1 FROM packing_slips p WHERE p.orders_id = orders.id AND p.syspackingslipstatuses_id IN (5200, 5201, 5202));

	-- if at least one packing slip which got cancelled, change the delivery status
	UPDATE orders
	SET    sysdeliverystatuses_id = 5701,
	       last_updated           = NOW()
	WHERE  orders.id              = l_order_id
	AND    sysdeliverystatuses_id <> 5701
	AND    EXISTS (SELECT 1 FROM packing_slips p WHERE p.orders_id = orders.id AND p.syspackingslipstatuses_id IN (5200, 5201, 5202));

END;
//

DELIMITER ;
