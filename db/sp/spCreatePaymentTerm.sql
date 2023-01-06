DROP PROCEDURE IF EXISTS spCreatePaymentTerm;

delimiter //

CREATE PROCEDURE spCreatePaymentTerm
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _code           VARCHAR(32),
                     _description    VARCHAR(128),
                     _days           INT,
                     _companyid      INT
               )
DETERMINISTIC

BEGIN

 	DECLARE  l_notfound   INT;
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;
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

 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';
 	
 	SELECT 0
    INTO   l_notfound
 	FROM   payment_terms
 	WHERE  companies_id   = _companyid
 	AND    (days           = _days OR code = UPPER(_code));

	IF l_notfound = 1 THEN

		-- add company record	
		INSERT INTO payment_terms (code, description, days, companies_id, sysstatuses_id, created, last_updated) VALUES (UPPER(_code), _description, _days, _companyid, 4600, now(), now());

		SELECT LAST_INSERT_ID()
		INTO   id;

	ELSE

	 	SET errorcode  = -20000;
 		SET errormsg   = 'Record with days or code already exist.';

	END IF;

END;
// 
delimiter ;
