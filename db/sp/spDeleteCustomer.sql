DROP PROCEDURE IF EXISTS spDeleteCustomer;

delimiter //

CREATE PROCEDURE spDeleteCustomer
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _customerid     INT,
                     _userid         INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound      INT;
 	DECLARE  l_shipaddressid INT;
 	DECLARE  l_billaddressid INT;
 	DECLARE  l_addressid     INT;
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;

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
 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

	IF (SELECT NOT EXISTS (SELECT 1 FROM companies c WHERE c.id = _customerid AND c.parent_id = _companyid AND c.syscompanytypes_id = 4702)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Customer not found. Cannot delete the customer!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM customer_shares c WHERE c.companies_id = _customerid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'You have shared categories/products with this customer. Cannot delete the customer!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM orders o WHERE o.customers_id = _customerid AND o.companies_id = _companyid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Orders found. Cannot delete the customer!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.customers_id = _customerid AND d.companies_id = _companyid)) THEN

		SET errorcode  = -203;
		SET errormsg   = 'Delivery notes found. Cannot delete the customer!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM notifications c WHERE c.entities_id = _customerid AND c.companies_id = _companyid)) THEN

		SET errorcode  = -204;
		SET errormsg   = 'Customer notifications found. Cannot delete the customer!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM pending_bills b WHERE b.customers_id = _customerid AND b.companies_id = _companyid)) THEN

		SET errorcode  = -205;
		SET errormsg   = 'Customer bills found. Cannot delete the customer!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM pending_bills_stage b WHERE b.customers_id = _customerid AND b.companies_id = _companyid)) THEN

		SET errorcode  = -206;
		SET errormsg   = 'Customer bills found. Cannot delete the customer!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM sessions s, users u WHERE s.users_id = u.id AND u.companies_id = _customerid)) THEN

		SET errorcode  = -207;
		SET errormsg   = 'Agent user has logged in to the app. Cannot delete the aegnt!';
		LEAVE main;

	END IF;


	-- delete roles and permissions
	DELETE FROM role_permissions WHERE roles_id IN (SELECT id FROM roles WHERE companies_id = _customerid);
	DELETE FROM roles WHERE companies_id = _customerid;

	-- delete customer notifications setttings
	DELETE FROM customer_notifications WHERE companies_id = _companyid AND customers_id = _customerid;

	-- delete the agent user
	DELETE FROM users WHERE companies_id = _customerid;

	-- create temp table to store address
	SELECT addresses_id, ship_addresses_id, bill_addresses_id
	INTO   l_addressid, l_shipaddressid, l_billaddressid
	FROM   companies
	WHERE  id = _customerid;

	-- update address records to set company id to null
	UPDATE addresses SET companies_id = NULL WHERE companies_id = _customerid;

	-- delete the agent company record
	DELETE FROM companies WHERE id = _customerid;

	-- delete the addresses
	DELETE FROM addresses WHERE id = l_addressid;
	DELETE FROM addresses WHERE id = l_shipaddressid;
	DELETE FROM addresses WHERE id = l_billaddressid;

END;
// 
delimiter ;
