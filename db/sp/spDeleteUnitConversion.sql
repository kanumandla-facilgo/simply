DROP PROCEDURE IF EXISTS spDeleteUnitConversion;

delimiter //

CREATE PROCEDURE spDeleteUnitConversion
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _uomid          INT
               )
DETERMINISTIC

main: BEGIN

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

	IF (SELECT NOT EXISTS (SELECT 1 FROM unit_of_measures WHERE companies_id = _companyid AND id = _uomid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Invalid UOM ID!';
		LEAVE main;
	
	END IF;

	DELETE FROM unit_conversion_details WHERE unit_of_measures_id = _uomid;
	
	DELETE FROM unit_conversions WHERE unit_of_measures_id = _uomid;

END;
// 
delimiter ;
