DROP PROCEDURE IF EXISTS spMarkOrderDelivered;

DELIMITER //

CREATE PROCEDURE spMarkOrderDelivered
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _companyid         INT,
                     _orderid           INT
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound              INT;

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

	IF (SELECT NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = _orderid AND o.companies_id = _companyid AND o.sysorderstatuses_id = 4201)) THEN
		SET errorcode  = -102;
		SET errormsg   = 'Invalid Order number OR Order is not in packing status.';
		LEAVE main;
	END IF;

	-- release the remaining quantity from open order details
	CALL spReleaseProductInProcessQty (errorcode, errormsg, _companyid, _orderid, NULL);

	IF (errorcode != 0) THEN
		LEAVE main;
	END IF;

	-- update all open items to completed
	UPDATE order_details d
	SET    d.is_complete  = 1,
	       d.last_updated = NOW()
	WHERE  d.orders_id    = _orderid
	AND    d.is_complete  = 0;

	-- update order status to delivered if all line items are completed
	UPDATE orders
	SET    sysorderstatuses_id    = 4202,
	       dispatch_date          = NOW(),
		   last_updated           = NOW()
	WHERE  orders.id              = _orderid;

END;
//

DELIMITER ;
