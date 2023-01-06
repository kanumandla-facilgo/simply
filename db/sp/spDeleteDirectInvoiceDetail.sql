DROP PROCEDURE IF EXISTS spDeleteDirectInvoiceDetail;

delimiter //

CREATE  PROCEDURE spDeleteDirectInvoiceDetail
		(
	         OUT errorcode                   INT, 
	         OUT errormsg                    VARCHAR(512),
	         	_deliverynoteid              INT,
	         	_deliverynotedetailid        INT,
	         	_companyid                   INT,
				_userid                      INT,
				_updateflag                  INT
        )

DETERMINISTIC

main: BEGIN

	DECLARE l_notfound     INT;
	DECLARE l_companyid    INT;
	DECLARE l_journal_id   INT;
	DECLARE l_productid    INT;

	DECLARE l_is_batched_inventory INT;
	
	DECLARE l_uom_id          INT;
	DECLARE l_alt_uom_id      INT;  
	DECLARE l_stock_uom_id    INT;
	DECLARE l_stock_alt_uom_id INT;

	DECLARE l_note_uom_id     INT;
	DECLARE l_note_alt_uom_id INT;

	DECLARE l_stock_bucket_id INT;
	DECLARE l_alt_stock_qty DECIMAL(12, 4);
	DECLARE l_stock_qty DECIMAL(12, 4);
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

	IF (SELECT NOT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.companies_id = _companyid AND d.id = _deliverynoteid AND d.sysdeliverynotestatuses_id IN (5501) )) THEN
		SET errorcode  = -106;
		SET errormsg   = 'Delivery note not found.';
		LEAVE main;
	END IF;

	SELECT p.companies_id, p.id, p.unit_of_measures_id, p.default_qty_uom_id, p.stock_alt_unit_of_measures_id, p.stock_unit_of_measures_id, p.is_batched_inventory,
	       dn.unit_of_measures_id, dn.entered_unit_of_measures_id, dn.quantity_ordered_packed, dn.quantity_entered_packed, dn.stock_buckets_id
	INTO   l_companyid, l_productid, l_uom_id, l_alt_uom_id, l_stock_alt_uom_id, l_stock_uom_id, l_is_batched_inventory,
	       l_note_uom_id, l_note_alt_uom_id, l_stock_qty, l_alt_stock_qty, l_stock_bucket_id
	FROM   products p, delivery_note_details dn, delivery_notes d
	WHERE  p.id          = dn.products_id
	AND    d.id          = dn.delivery_notes_id
	AND    dn.id         = _deliverynotedetailid
	AND    d.id          = _deliverynoteid;

	IF l_notfound = 1 THEN
		SET errorcode  = -114;
		SET errormsg   = 'Delivery note detail not found.';
		LEAVE main;
	END IF;

	SELECT s.id, s.entered_unit_of_measures_id, s.unit_of_measures_id
	INTO   l_stock_bucket_id, l_bucket_alt_uom_id, l_bucket_uom_id
	FROM   stock_buckets s
	WHERE  s.products_id    = l_productid
	AND    s.id             = l_stock_bucket_id
	AND    s.companies_id   = _companyid;

	-- if batched inventory, re-enable the bucket
	IF (l_is_batched_inventory = 1) THEN
		UPDATE stock_buckets
		SET    sysstatuses_id = 4600,
	           last_updated   = NOW()
		WHERE  stock_buckets.id = l_stock_bucket_id;
	END IF;

	DELETE FROM delivery_note_details WHERE id = _deliverynotedetailid;

	-- ==============================================================================
	-- insert stock journal
	-- ==============================================================================
	INSERT INTO stock_journal (companies_id, description, stock_buckets_id, products_id, transaction_date, sysjournalentrytype_id, orders_id, packing_slips_id, delivery_notes_id, users_id, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, system_notes, created, last_updated)
	VALUES (l_companyid, CASE WHEN _updateflag = 1 THEN 'Direct Invoice - Update Line Item' ELSE 'Direct Invoice - Delete Line Item' END, l_stock_bucket_id, l_productid, NOW(), 5401, null, null, _deliverynoteid, _userid, l_bucket_uom_id, l_bucket_alt_uom_id, CASE WHEN l_bucket_alt_uom_id = l_note_alt_uom_id THEN l_alt_stock_qty ELSE l_stock_qty END * 1, CASE WHEN l_bucket_uom_id = l_note_uom_id THEN l_stock_qty ELSE l_alt_stock_qty END * 1, CASE WHEN _updateflag = 1 THEN 'Direct Invoice Entry - Update Line Item' ELSE 'Direct Invoice Entry - Delete Line Item' END, now(), now());

	SELECT LAST_INSERT_ID() INTO l_journal_id;

	INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, quantity, unit_of_measures_id, created, last_updated)
	SELECT l_journal_id, l_stock_bucket_id, d.id, CASE WHEN l_bucket_uom_id = l_note_uom_id THEN l_stock_qty ELSE l_alt_stock_qty END * 1, l_bucket_uom_id, now(), now()
	FROM   stock_bucket_details d
	WHERE  d.stock_buckets_id    = l_stock_bucket_id
	AND    d.unit_of_measures_id = l_bucket_uom_id;

	IF (l_bucket_uom_id <> l_bucket_alt_uom_id) THEN

		INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, quantity, unit_of_measures_id, created, last_updated)
		SELECT l_journal_id, l_stock_bucket_id, d.id, CASE WHEN l_bucket_alt_uom_id = l_note_alt_uom_id THEN l_alt_stock_qty ELSE l_stock_qty END * 1, l_bucket_alt_uom_id, now(), now()
		FROM   stock_bucket_details d
		WHERE  d.stock_buckets_id    = l_stock_bucket_id
		AND    d.unit_of_measures_id = l_bucket_alt_uom_id;

	END IF;

	-- if non batched inventory, update the stock. For batched inventory, we have updated status earlier
	IF (l_is_batched_inventory = 0) THEN

		UPDATE stock_buckets
		SET    quantity_ordered = quantity_ordered + CASE WHEN stock_buckets.unit_of_measures_id = l_note_uom_id THEN l_stock_qty ELSE l_alt_stock_qty END,
			   quantity_entered = quantity_entered + CASE WHEN stock_buckets.entered_unit_of_measures_id = l_note_alt_uom_id THEN l_alt_stock_qty ELSE l_stock_qty END,
			   last_updated     = NOW()
		WHERE  stock_buckets.id = l_stock_bucket_id;

		UPDATE stock_bucket_details
		SET    quantity         = quantity + CASE WHEN l_bucket_uom_id = l_note_uom_id THEN l_stock_qty ELSE l_alt_stock_qty END,
			   last_updated     = NOW()
		WHERE  stock_bucket_details.stock_buckets_id = l_stock_bucket_id
		AND    stock_bucket_details.unit_of_measures_id = l_bucket_uom_id;

		IF (l_bucket_uom_id <> l_bucket_alt_uom_id) THEN

			UPDATE stock_bucket_details
			SET    quantity         = quantity + CASE WHEN l_bucket_alt_uom_id = l_note_uom_id THEN l_stock_qty ELSE l_alt_stock_qty END,
				   last_updated     = NOW()
			WHERE  stock_bucket_details.stock_buckets_id = l_stock_bucket_id
			AND    stock_bucket_details.unit_of_measures_id = l_bucket_alt_uom_id;

		END IF;
	
	END IF;

	UPDATE products
	SET    stock_quote            = stock_quote + CASE WHEN products.stock_unit_of_measures_id = l_note_uom_id THEN l_stock_qty ELSE l_alt_stock_qty END,
	       stock_qty              = stock_qty +  CASE WHEN products.stock_alt_unit_of_measures_id = l_note_uom_id THEN l_stock_qty ELSE l_alt_stock_qty END,
	       last_updated           = NOW()
	WHERE  products.id            = l_productid;

END;
//

DELIMITER ;
