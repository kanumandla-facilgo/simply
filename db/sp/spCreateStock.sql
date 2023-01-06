DROP PROCEDURE IF EXISTS spCreateStock;

delimiter //

CREATE PROCEDURE spCreateStock
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                 OUT _bucketid       INT,
                     _companyid      INT,
                     _productid      INT,
                     _date           DATETIME,
                     _description    VARCHAR(64),
                     _stockqty       DECIMAL(12, 4),
                     _stockquote     DECIMAL(12, 4),
                     _orderid        INT,
                     _packingslipid  INT,
                     _userid         INT,
                     _stockcode      VARCHAR(32)
               )
DETERMINISTIC

main: BEGIN

	-- THIS SP creates header records. It does not create intermediate unit records such as pieces. Caller has to create it. 
	-- THIS SP call will be enough for non batched inventory records. 
	-- However for batched inventory product, this SP just creates new batch. Record for pieces will be created by caller afterwards.
  
	DECLARE  l_notfound    INT;
	DECLARE  l_id          INT;
	DECLARE  l_uom_qty     INT;
	DECLARE  l_uom_quote   INT;
	DECLARE  l_bucketid    INT;
	DECLARE  l_batchflag   INT;
 
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

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
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;

	SET errorcode  = 0;
	SET errormsg   = 'Success';

	If _date IS NULL THEN
		SET _date = NOW();
	END IF;
	
	SET l_notfound = 0;

	-- validate product
	SELECT  s.id, s.unit_of_measures_id, s.entered_unit_of_measures_id, p.is_batched_inventory
	INTO    l_bucketid, l_uom_quote, l_uom_qty, l_batchflag
	FROM    products p  INNER JOIN stock_buckets s ON s.products_id = p.id AND s.is_system = 1
    INNER JOIN unit_of_measures u1 ON u1.id = s.entered_unit_of_measures_id
    INNER JOIN unit_of_measures u2 ON u2.id = s.unit_of_measures_id
	WHERE   p.id                   = _productid
	AND     p.companies_id         = _companyid;

	IF (l_notfound = 1) THEN
		SET errorcode  = -105;
		SET errormsg   = 'Product not found.';
		LEAVE main;
	END IF;

	IF l_batchflag = 1 THEN

		IF _stockcode IS NULL THEN
			SET errorcode  = -107;
			SET errormsg   = 'Stock code must be provided.';
			LEAVE main;
		END IF;

		IF (SELECT EXISTS (SELECT 1 FROM stock_buckets WHERE products_id = _productid AND code = UPPER(_stockcode))) THEN
			SET errorcode  = -101;
			SET errormsg   = 'Stock code already exists.';
			LEAVE main;
		END IF;

		SET l_notfound = 0;

		INSERT INTO stock_buckets (code, description, companies_id, products_id, is_system, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, users_id, sysstatuses_id, created, last_updated)
		VALUES (UPPER(_stockcode), CONCAT(_stockcode, ' Bucket'), _companyid, _productid, 0, l_uom_quote, l_uom_qty, 0, 0, _userid, 4600, now(), now());

		SELECT LAST_INSERT_ID() INTO l_bucketid;

		SET _bucketid = l_bucketid;

		INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
		VALUES (l_bucketid, 'Stock Bucket Detail', 0, l_uom_quote, 1, 0, now(), now());
		
		IF l_uom_quote <> l_uom_qty THEN
			INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
			VALUES (l_bucketid, 'Stock Bucket Detail', 0, l_uom_qty, 1, 0, now(), now());
		END IF;

	END IF;

	UPDATE stock_buckets
	SET    quantity_entered = quantity_entered + _stockqty,
	       quantity_ordered = quantity_ordered + _stockquote,
	       last_updated     = NOW()
	WHERE  stock_buckets.id = l_bucketid;

	UPDATE stock_bucket_details
	SET    quantity = quantity + _stockquote,
	       last_updated = NOW() 
	WHERE  stock_buckets_id = l_bucketid
	AND    unit_of_measures_id = l_uom_quote;

	-- update stock bucket detail again for other unit of measure
	UPDATE stock_bucket_details
	SET    quantity = quantity + _stockqty,
	       last_updated = NOW() 
	WHERE  stock_buckets_id = l_bucketid
	AND    unit_of_measures_id = l_uom_qty
	AND    l_uom_qty <> l_uom_quote;

	INSERT INTO stock_journal (companies_id, description, stock_buckets_id, products_id, transaction_date, sysjournalentrytype_id, orders_id, packing_slips_id, users_id, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, system_notes, created, last_updated)
	VALUES (_companyid, _description, l_bucketid, _productid, _date, 5400, _orderid, _packingslipid, _userid, l_uom_quote, l_uom_qty, _stockqty, _stockquote, 'Stock entry', now(), now());

	SELECT LAST_INSERT_ID() INTO id;

	INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, quantity, unit_of_measures_id, created, last_updated)
	SELECT id, l_bucketid, d.id, _stockquote, l_uom_quote, now(), now()
	FROM   stock_bucket_details d
	WHERE  d.stock_buckets_id    = l_bucketid
	AND    d.unit_of_measures_id = l_uom_quote;

	IF (l_uom_quote <> l_uom_qty) THEN

		INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, quantity, unit_of_measures_id, created, last_updated)
		SELECT id, l_bucketid, d.id, _stockqty, l_uom_qty, now(), now()
		FROM   stock_bucket_details d
		WHERE  d.stock_buckets_id    = l_bucketid
		AND    d.unit_of_measures_id = l_uom_qty;

	END IF;

	UPDATE products 
	SET    stock_qty    = stock_qty   + _stockqty,
	       stock_quote  = stock_quote + _stockquote,
	       last_updated = NOW()
	WHERE  products.id = _productid;
	
	-- IF Pieces are there, caller has to create pieces record in stock_bucket_details

END;
// 
delimiter ;
