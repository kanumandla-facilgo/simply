DROP PROCEDURE IF EXISTS spAdjustStockBucket;

delimiter //

CREATE PROCEDURE spAdjustStockBucket
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                 OUT _bucketid       INT,
                     _stockcode      VARCHAR(32),
                     _companyid      INT,
                     _productid      INT,
                     _date           DATETIME,
                     _description    VARCHAR(64),
                     _stockqty       DECIMAL(12, 4),
                     _stockquote     DECIMAL(12, 4),
                     _orderid        INT,
                     _packingslipid  INT,
                     _userid         INT
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

	IF _stockcode IS NULL THEN
		SET errorcode  = -107;
		SET errormsg   = 'Stock code must be provided.';
		LEAVE main;
	END IF;
	
	IF _productid IS NULL THEN
		SET errorcode  = -106;
		SET errormsg   = 'Product ID must be provided.';
		LEAVE main;
	END IF;

	-- validate product
	SELECT  s.id, s.unit_of_measures_id, s.entered_unit_of_measures_id, is_batched_inventory
	INTO    l_bucketid, l_uom_quote, l_uom_qty, l_batchflag
	FROM    products p  INNER JOIN stock_buckets s ON s.products_id = p.id
	INNER JOIN unit_of_measures u1 ON u1.id = s.entered_unit_of_measures_id
	INNER JOIN unit_of_measures u2 ON u2.id = s.unit_of_measures_id
	WHERE   p.companies_id         = _companyid
	AND     s.code                 = _stockcode
	AND     s.products_id          = _productid
	AND     s.companies_id         = _companyid;

	IF (l_notfound = 1) THEN
		SET errorcode  = -105;
		SET errormsg   = 'Batch not found.';
		LEAVE main;
	END IF;

	SET _bucketid = l_bucketid;

	-- 2021.04.23 - we shall not let disabled bucket get updated
	IF (SELECT EXISTS (SELECT 1 FROM stock_buckets s WHERE s.companies_id = _companyid AND s.id = l_bucketid AND s.sysstatuses_id = 4601)) THEN

		SET errorcode  = -107;
		SET errormsg   = 'Stock batch is used! Invalid action.';
		LEAVE main;
	
	END IF;

	IF l_batchflag = 1 THEN

		UPDATE stock_bucket_details 
		SET    quantity     = quantity + _stockquote,
			   last_updated = NOW()
		WHERE  stock_buckets_id = l_bucketid
		AND    unit_of_measures_id = l_uom_quote;

		IF l_uom_quote <> l_uom_qty THEN
			UPDATE stock_bucket_details 
			SET    quantity     = quantity + _stockqty,
				   last_updated = NOW()
			WHERE  stock_buckets_id = l_bucketid
			AND    unit_of_measures_id = l_uom_qty;
		END IF;

	END IF;
	
	UPDATE stock_buckets
	SET    quantity_ordered = quantity_ordered + _stockquote ,
		   quantity_entered = quantity_entered + _stockqty,
		   last_updated     = NOW()
	WHERE  stock_buckets.id = l_bucketid;

	UPDATE stock_buckets
	SET    sysstatuses_id   = CASE WHEN quantity_ordered = 0 AND quantity_entered = 0 AND is_system = 0 THEN 4601 ELSE sysstatuses_id END
	WHERE  stock_buckets.id = l_bucketid;

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
