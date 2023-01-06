DROP PROCEDURE IF EXISTS spDeleteCompanyType;

delimiter //

CREATE PROCEDURE spDeleteCompanyType
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _customertypeid INT,
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

	IF (SELECT NOT EXISTS (SELECT 1 FROM company_types t WHERE t.id = _customertypeid AND t.companies_id = _companyid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Rate category not found. Cannot delete the rate category!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM price_lists p WHERE p.company_types_id = _customertypeid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Price list found for this rate category. Cannot delete the rate category!';
		LEAVE main;

	END IF;

	-- delete the transporter
	DELETE FROM company_types WHERE id = _customertypeid;

END;
// 
delimiter ;
