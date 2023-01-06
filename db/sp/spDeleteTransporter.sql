DROP PROCEDURE IF EXISTS spDeleteTransporter;

delimiter //

CREATE PROCEDURE spDeleteTransporter
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _transporterid  INT,
                     _userid         INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound    INT;
 
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

	IF (SELECT NOT EXISTS (SELECT 1 FROM transporters t WHERE t.id = _transporterid AND t.companies_id = _companyid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Transporter not found. Cannot delete the transporter!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM transporters t WHERE t.id = _transporterid AND t.companies_id = _companyid AND t.is_system = 1)) THEN

		SET errorcode  = -205;
		SET errormsg   = 'Transporter is a system transporter. Cannot delete the transporter!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.transporters_id = _transporterid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Customer(s) are assigned for this transporter. Cannot delete the transporter!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM orders o WHERE o.transporters_id = _transporterid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Order(s) exist for this transporter. Cannot delete the transporter!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.transporters_id = _transporterid)) THEN

		SET errorcode  = -203;
		SET errormsg   = 'Delivery note(s) exist for this transporter. Cannot delete the transporter!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM invoices i WHERE i.transporters_id = _transporterid)) THEN

		SET errorcode  = -204;
		SET errormsg   = 'Invoice(s) exist for this transporter. Cannot delete the transporter!';
		LEAVE main;

	END IF;

	-- delete the transporter
	DELETE FROM transporters WHERE id = _transporterid;

END;
// 
delimiter ;
