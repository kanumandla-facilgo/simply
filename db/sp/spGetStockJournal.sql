DROP PROCEDURE IF EXISTS spGetStockJournal;

delimiter //

CREATE PROCEDURE spGetStockJournal
               (
                 OUT errorcode		INT, 
                 OUT errormsg		VARCHAR(512),
                 OUT _totalrecords	INT,
                     _companyid		INT,
                     _id            INT,
                     _productid     INT,
                     _datefrom      DATETIME,
                     _dateto        DATETIME,
                     _datetype      INT,
					 _currentpage   INT,
					 _recordsperpage INT
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

	DECLARE offsetrecords  INT;
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET errorcode=200;
 
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
	SET offsetrecords = (_currentpage -1 ) *_recordsperpage;
	

	SELECT SQL_CALC_FOUND_ROWS j.*,
		   s.code as stock_bucket_code,
		   s.sysstatuses_id as stock_bucket_status_id,
		   sysstatuses.name as stock_bucket_status_name,
		   u1.name as stock_uom_qty_name,
		   u1.short_name as stock_uom_qty_short_name,
		   u2.name as stock_uom_quote_name,
		   u2.short_name as stock_uom_quote_short_name,
		   u.first_name,
		   u.last_name,
		   u.login_name,
		   ps.packing_slip_number,
           o.order_number as order_number,
           d.id as delivery_note_id,
           d.invoice_number,
           c.name
	FROM stock_journal j
	INNER JOIN stock_buckets s ON s.id = j.stock_buckets_id
	INNER JOIN sysstatuses ON sysstatuses.id = s.sysstatuses_id 
	INNER JOIN unit_of_measures u1 ON u1.id = j.entered_unit_of_measures_id
	INNER JOIN unit_of_measures u2 ON u2.id = j.unit_of_measures_id
	INNER JOIN users u ON u.id = j.users_id
	
	-- LEFT JOIN packing_slips ps ON ps.id = j.packing_slips_id
	-- LEFT JOIN delivery_note_details dn ON dn.packing_slips_id = ps.id
	-- LEFT JOIN delivery_notes d ON d.id = dn.delivery_notes_id 
	-- LEFT JOIN companies c on d.customers_id = c.id

	LEFT JOIN packing_slips ps ON ps.id = j.packing_slips_id
	LEFT JOIN packing_slip_details psd ON psd.packing_slips_id = ps.id AND psd.stock_buckets_id = j.stock_buckets_id
	LEFT JOIN orders o ON psd.orders_id = o.id
	LEFT JOIN delivery_note_details dn ON dn.packing_slips_id = ps.id AND dn.packing_slip_details_id = psd.id AND EXISTS (SELECT 1 FROM delivery_notes d WHERE dn.delivery_notes_id = d.id AND d.sysdeliverynotestatuses_id in (5499, 5500, 5501, 5502))
	LEFT JOIN delivery_notes d ON d.id = dn.delivery_notes_id
	LEFT JOIN companies c ON o.customers_id = c.id

	WHERE j.companies_id = _companyid
	AND   CASE WHEN _productid IS NOT NULL THEN j.products_id ELSE 1 END = CASE WHEN _productid IS NOT NULL THEN _productid ELSE 1 END 
	AND   CASE WHEN _id IS NOT NULL THEN j.id ELSE 1 END = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END 
	AND   CASE WHEN _datetype IS NOT NULL THEN 
			CASE WHEN _datetype = 1 THEN j.created ELSE j.transaction_date END
		  ELSE
			 1
		  END
		 >= CASE WHEN _datetype IS NOT NULL THEN _datefrom ELSE 1 END
	AND   CASE WHEN _datetype IS NOT NULL AND _dateto IS NOT NULL THEN 
			CASE WHEN _datetype = 1 THEN j.created ELSE j.transaction_date END
		  ELSE
			 1
		  END
		 < CASE WHEN _datetype IS NOT NULL AND _dateto IS NOT NULL THEN DATE_ADD(_dateto, INTERVAL 1 DAY) ELSE 2 END
	ORDER BY j.id DESC LIMIT offsetrecords, _recordsperpage;

	SELECT FOUND_ROWS() INTO _totalrecords;

	IF _datefrom IS NOT NULL AND _dateto IS NOT NULL AND _productid IS NOT NULL THEN

		SELECT 'Opening Balance', SUM(quantity_ordered) AS quantity_ordered, SUM(quantity_entered) AS quantity_entered
		FROM   stock_journal j
		WHERE  companies_id = _companyid
		AND    j.products_id = _productid 
		AND    CASE WHEN _datetype IS NOT NULL THEN 
				 CASE WHEN _datetype = 1 THEN j.created ELSE j.transaction_date END
			   ELSE
				 1
			   END
			   < CASE WHEN _datetype IS NOT NULL THEN _datefrom ELSE 1 END;

	ELSE
		SELECT 'Opening Balance', 0 AS quantity_ordered, 0 AS quantity_entered FROM dual;
	END IF;

END;
// 
delimiter ;
