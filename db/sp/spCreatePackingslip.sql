DROP PROCEDURE IF EXISTS spCreatePackingslip;

DELIMITER //

CREATE PROCEDURE spCreatePackingslip
             (
                 OUT errorcode        INT, 
                 OUT errormsg         VARCHAR(512),
                 OUT _id              INT,
				     _orders_id	      INT,
				     _slip_number     VARCHAR(16), 
				     _companies_id	  INT,
				     _users_id	      INT,
   				     _packing_date	  DATETIME,
				     _net_weight	  DECIMAL(10, 2),
				     _gross_weight    DECIMAL(10, 2)
			)

    DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound    INT;
	DECLARE  l_id          INT;
	DECLARE  l_packing_slip_id INT;

	DECLARE  _unit_of_measures_id int;
	DECLARE _entered_unit_of_measures_id     int;

	DECLARE l_is_auto_packing_slip_number VARCHAR(64);
	DECLARE l_is_packing_slip_number_edit_on VARCHAR(64);
	DECLARE l_packing_slip_number VARCHAR(16);

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

	-- get the next slip number
	CALL spGetNextSequence(errorcode, errormsg, l_packing_slip_number, _companies_id, 20010, 20013, 20011, _slip_number);

	-- SELECT value
	-- INTO   l_is_auto_packing_slip_number
	-- FROM   configurations
	-- WHERE  sysconfigurations_id = 20010
	-- AND    companies_id         = _companies_id;

	-- IF l_is_auto_packing_slip_number = '0' THEN

	-- 	IF _slip_number IS NOT NULL AND _slip_number != '' THEN

	-- 		SELECT value
	-- 		INTO   l_is_packing_slip_number_edit_on
	-- 		FROM   configurations
	-- 		WHERE  sysconfigurations_id = 20013
	-- 		AND    companies_id         = _companies_id;

	-- 		IF l_is_packing_slip_number_edit_on = '1' THEN

	-- 			SET l_packing_slip_number = _slip_number;

	-- 		END IF;

	-- 	END IF;

	-- 	IF l_packing_slip_number IS NULL THEN

	-- 		SELECT value
	-- 		INTO   l_packing_slip_number
	-- 		FROM   configurations
	-- 		WHERE  sysconfigurations_id = 20011
	-- 		AND    companies_id         = _companies_id
	-- 		FOR    UPDATE;

	-- 		UPDATE configurations
	-- 		SET    value = l_packing_slip_number + 1
	-- 		WHERE  sysconfigurations_id = 20011
	-- 		AND    companies_id         = _companies_id;

	-- 	END IF;


	-- ELSE

	-- 	SET l_packing_slip_number = _slip_number;

	-- END IF;

	INSERT INTO packing_slips
	(
		packing_slip_number,
		packing_date,
		syspackingslipstatuses_id,
		companies_id,
		orders_id,
		users_id,
		invoices_id,
		net_weight,
		gross_weight,
		created,
		last_updated
	)
	VALUES
	(
		l_packing_slip_number,
		_packing_date,
		5199,
		_companies_id,
		_orders_id,
		_users_id,
		null,
		_net_weight,
		_gross_weight,
		now(),
		now()
	);

	UPDATE orders
	SET    sysdeliverystatuses_id = 5701,
	       last_updated           = NOW()
	WHERE  orders.id              = _orders_id
	AND    sysdeliverystatuses_id <> 5701;

	SELECT LAST_INSERT_ID() INTO _id;

END;
//

DELIMITER ;
