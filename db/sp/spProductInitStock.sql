DROP PROCEDURE IF EXISTS spProductInitStock;

DELIMITER //

CREATE PROCEDURE spProductInitStock
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _id                INT,
                     _uomid             INT,
                     _defaultqtyuomid   INT,
                     _userid            INT
			)
    DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound     INT;
	DECLARE  l_pcscount     INT;
	DECLARE  l_pcs_uom_id   INT;
	DECLARE  l_end_uom_id   INT;
	DECLARE  l_bucketid     INT;
	DECLARE  i              INT;
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

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	SET l_end_uom_id = null;

	-- if order unit and qty unit not same, make sure conversion is available with end_uom_id same as ordered unit id
	SELECT IFNULL(end_uom_id, _defaultqtyuomid)
	INTO   l_end_uom_id
	FROM   unit_of_measures c
	WHERE  c.id = _defaultqtyuomid;

	IF l_notfound = 1 THEN
		SET errorcode  = -120;
		SET errormsg   = 'Unit not found.';
		LEAVE main;
	END IF;

	IF _uomid <> _defaultqtyuomid THEN
		IF l_end_uom_id <> _uomid THEN
			SET errorcode  = -125;
			SET errormsg   = 'Product order unit with qty unit conversion missing. Please check units carefully.';
			LEAVE main;
		END IF;
	END IF;
	
	SET l_notfound = 0;

	INSERT INTO stock_buckets (code, description, companies_id, products_id, is_system, unit_of_measures_id, entered_unit_of_measures_id, quantity_entered, quantity_ordered, users_id, sysstatuses_id, created, last_updated)
	SELECT 'DEFAULT', 'Default Bucket', p.companies_id, p.id, 1, p.stock_unit_of_measures_id, p.stock_alt_unit_of_measures_id, 0, 0, _userid, 4600, now(), now()
	FROM   products p
	WHERE  p.id = _id;

	-- enter direct unit of measure making sure there is no conversion there.

	INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
	SELECT s.id, 'Stock Bucket Detail', 0, s.unit_of_measures_id, 1, 0, now(), now()
	FROM   stock_buckets s
	WHERE  s.products_id = _id;

	INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
	SELECT s.id, 'Stock Bucket Detail', 0, s.entered_unit_of_measures_id, 1, 0, now(), now()
	FROM   stock_buckets s
	WHERE  s.products_id = _id
	AND    s.unit_of_measures_id <> s.entered_unit_of_measures_id;

	-- handle batched inventory
	INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
	SELECT s.id, CONCAT('Piece 1 of ', c.to_qty), 0, c.to_uom_id, 1, c.to_qty, now(), now()
	FROM   stock_buckets s, unit_conversions c, products p
	WHERE  c.is_batched_inventory = 1
	AND    s.products_id          = p.id
	AND    p.id                   = _id
--	AND    (p.unit_of_measures_id = c.unit_of_measures_id OR p.default_qty_uom_id = c.unit_of_measures_id)
	AND    p.default_qty_uom_id = c.unit_of_measures_id
	AND    NOT EXISTS (SELECT 1 FROM stock_bucket_details d WHERE d.unit_of_measures_id = c.to_uom_id AND d.stock_buckets_id = s.id)
	LIMIT  1; -- just to prevent multiple rows for now. TODO

	SELECT d.stock_buckets_id, d.piece_count, d.unit_of_measures_id
	INTO   l_bucketid, l_pcscount, l_pcs_uom_id
	FROM   stock_bucket_details d, stock_buckets s
	WHERE  s.products_id          = _id
	AND    s.id                   = d.stock_buckets_id
	AND    d.piece_count          > 0;

	SET i = 1;
	lbl1: LOOP

		SET i = i + 1;

		IF i <= l_pcscount THEN

			INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated)
			VALUES (l_bucketid, CONCAT('Piece ', i, ' of ', l_pcscount), 0, l_pcs_uom_id, i, 0, now(), now());

			ITERATE lbl1;

		END IF;

		UPDATE stock_bucket_details
		SET    piece_count = 0
		WHERE  stock_buckets_id = l_bucketid
		AND    piece_count > 0;

		LEAVE lbl1;

	END LOOP lbl1;

END;
//

DELIMITER ;
