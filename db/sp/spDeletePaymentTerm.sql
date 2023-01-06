DROP PROCEDURE IF EXISTS spDeletePaymentTerm;

delimiter //

CREATE PROCEDURE spDeletePaymentTerm
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _paymenttermid  INT,
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

	IF (SELECT NOT EXISTS (SELECT 1 FROM payment_terms t WHERE t.id = _paymenttermid AND t.companies_id = _companyid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Payment Term not found. Cannot delete the payment term!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.payment_terms_id = _paymenttermid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Customer(s) are assigned for this payment term. Cannot delete the payment term!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM orders o WHERE o.payment_terms_id = _paymenttermid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Order(s) exist for this payment term. Cannot delete the payment term!';
		LEAVE main;

	END IF;

	-- delete the transporter
	DELETE FROM payment_terms WHERE id = _paymenttermid;

END;
// 
delimiter ;
