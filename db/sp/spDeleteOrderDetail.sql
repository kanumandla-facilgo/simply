DROP PROCEDURE IF EXISTS spDeleteOrderDetail;

DELIMITER //

CREATE PROCEDURE spDeleteOrderDetail
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _companyid         INT,
                     _orderid           INT,
                     _orderdetailid     INT,
                     _userid            INT
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound              INT;


	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = -300; -- @errno; 
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

	IF (SELECT NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = _orderid AND o.companies_id = _companyid AND o.sysorderstatuses_id IN (4201, 4203))) THEN
		SET errorcode  = -102;
		SET errormsg   = 'Invalid Order number OR Order is in invalid status.';
		LEAVE main;
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM orders o, order_details d WHERE o.id = _orderid AND o.companies_id = _companyid AND d.orders_id = o.id AND d.id = _orderdetailid AND d.is_complete = 0)) THEN
		SET errorcode  = -103;
		SET errormsg   = 'Invalid line item.';
		LEAVE main;
	END IF;

	-- release the remaining quantity from open order details
	CALL spReleaseProductInProcessQty (errorcode, errormsg, _companyid, _orderid, _orderdetailid);

	IF (errorcode != 0) THEN
		LEAVE main;
	END IF;

	-- delete the line item
	DELETE FROM order_details WHERE orders_id = _orderid AND id =  _orderdetailid;

END;
//

DELIMITER ;
