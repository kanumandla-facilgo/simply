DROP PROCEDURE IF EXISTS spCancelOrder;

DELIMITER $$
CREATE  PROCEDURE `spCancelOrder`(
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                    _companyid       INT,
				    _orderid 		 INT,
				    _userid		     INT
               )
    DETERMINISTIC
main: BEGIN

	DECLARE l_permission VARCHAR(32);
	DECLARE l_current_order_amount DECIMAL(10, 2);
	DECLARE l_customerid INT;
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
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	-- Check permission
	SELECT r.value
	INTO   l_permission
	FROM   users u, role_permissions r
	WHERE  u.id = _userid
	AND    u.roles_id = r.roles_id
	AND    r.syspermissions_id = 5002;

	-- if permission is not there or missing, let's check if user has created the order
	IF IFNULL(l_permission, "0") = "0" THEN
		IF (SELECT NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = _orderid AND o.orderusers_id = _userid)) THEN
			SET errorcode  = -15001;
			SET errormsg   = 'Permission denied.';
			LEAVE main;
		END IF;
	END IF;

	-- Check if non cancelled packing slip exist
	IF (SELECT EXISTS (SELECT 1 FROM packing_slips p WHERE p.orders_id = _orderid AND p.syspackingslipstatuses_id <> 5203)) THEN
		SET errorcode  = -115;
		SET errormsg   = 'Active packing slip(s) exist. Cannot cancel order.';
		LEAVE main;
	END IF;

	-- validate order
	IF (SELECT NOT EXISTS (SELECT 1 
	                       FROM   orders 
	                       WHERE  orders.id = _orderid 
	                       AND    orders.companies_id = _companyid 
	                       AND    orders.sysorderstatuses_id IN (4200, 4201, 4203)
                           AND    orders.customers_id IN 
    									(
    									 		SELECT c1.id
    									 		FROM   companies c1, users u
    									 		WHERE  c1.syscompanytypes_id = 4702
												AND    c1.salesperson_id     = _userid
												AND    u.id                  = _userid
												AND    u.sysroles_id         = 4004
												AND    u.companies_id        = _companyid
												AND    c1.parent_id          = _companyid
												UNION ALL
    									 		SELECT c1.id
    									 		FROM   companies c1, users u, companies a
    									 		WHERE  c1.syscompanytypes_id = 4702
												AND    c1.agents_id          = a.id
												AND    u.id                  = _userid
												AND    u.sysroles_id         = 4005
												AND    u.companies_id        = a.id
												AND    c1.parent_id          = _companyid
												UNION ALL
    									 		SELECT c1.id
    									 		FROM   companies c1, users u
    									 		WHERE  c1.syscompanytypes_id = 4702
												AND    u.id                  = _userid
												AND    u.sysroles_id         IN (4002,4003)
												AND    u.companies_id        = _companyid
												AND    c1.parent_id          = _companyid
												UNION ALL
												SELECT -1
    									 ) 	                      
    					 )
	                ) THEN
		SET errorcode  = -101;
		SET errormsg   = 'Order not found or order is not pending.';
		LEAVE main;
	END IF;

	-- get current order amount to adjust current balance
	SELECT sub_total + ship_total + tax_total - discount_total
	INTO   l_current_order_amount
	FROM   orders
	WHERE  orders.id = _orderid;

	-- updating customer balance
	UPDATE `companies` set pending_order_balance = pending_order_balance - l_current_order_amount WHERE companies.id = l_customerid;

	-- workflow process will cancel the order, cancel the workflow, release the quantity from in process
	CALL spCreateWorkflow (errorcode, errormsg, _orderid, 5105, _userid, 'Order cancelled');
	IF (errorcode != 0) THEN
		LEAVE main;
	END IF;

END$$
DELIMITER ;
