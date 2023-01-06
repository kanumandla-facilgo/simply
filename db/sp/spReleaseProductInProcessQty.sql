DROP PROCEDURE IF EXISTS spReleaseProductInProcessQty;

DELIMITER //

CREATE PROCEDURE spReleaseProductInProcessQty
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _companyid         INT,
                     _orderid           INT,
                     _orderdetailid     INT
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound              INT;
	DECLARE l_orderid               INT;

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
	
	IF _orderid IS NULL AND _orderdetailid IS NULL THEN
		SET errorcode  = -101;
		SET errormsg   = 'Please provide order or order detail.';
		LEAVE main;
	END IF;
	
	IF _orderid IS NULL THEN
		SELECT orders_id
		INTO   l_orderid
		FROM   order_details d
		WHERE  d.id  = _orderdetailid;
	ELSE
	    SET l_orderid = _orderid;
	END IF;
	
	IF l_notfound = 1 THEN
		SET errorcode  = -103;
		SET errormsg   = 'Invaoid order detail.';
		LEAVE main;
	END IF;

	-- release the unused quantity for open items
	UPDATE products p
	INNER JOIN order_details d ON d.products_id = p.id
	SET   p.stock_in_process_quote = p.stock_in_process_quote - (d.stock_alt_quantity - d.stock_alt_quantity_packed),
	      p.stock_in_process_qty = p.stock_in_process_qty - (d.stock_quantity - d.stock_quantity_packed),
	      p.last_updated           = NOW()
	WHERE d.orders_id   = l_orderid
	AND   d.is_complete = 0
	AND   CASE WHEN _orderdetailid IS NOT NULL THEN d.id = _orderdetailid ELSE 1=1 END;

END;
//

DELIMITER ;
