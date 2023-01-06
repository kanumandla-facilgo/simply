DROP PROCEDURE IF EXISTS spUpdateAddress;

delimiter //

CREATE PROCEDURE spUpdateAddress
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _id             INT,
                     _first_name     VARCHAR(32),
                     _last_name      VARCHAR(32),
                     _name           VARCHAR(128),
                     _address1       VARCHAR(128),
                     _address2       VARCHAR(128),
                     _address3       VARCHAR(128),
                     _city           VARCHAR(32),
                     _state          VARCHAR(32),
                     _zip            VARCHAR(16),
                     _phone1         VARCHAR(24),
                     _email1         VARCHAR(128),
                     _phone2         VARCHAR(24),
                     _email2         VARCHAR(128)
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
 	
 	UPDATE  addresses
 	SET     first_name   = _first_name,
            last_name    = _last_name,
            name         = CASE WHEN _name IS NULL THEN CASE WHEN _first_name IS NOT NULL THEN CONCAT(TRIM(_first_name), ' ', TRIM(_last_name)) ELSE NULL END ELSE _name END,
            address1     = _address1,
 	        address2     = _address2,
 	        address3     = _address3,
 	        city         = _city,
 	        state        = _state,
 	        pin          = _zip,
 	        phone1       = _phone1,
 	        email1       = _email1,
            phone2       = _phone2,
            email2       = _email2,
 	        last_updated = NOW()
    WHERE   id           = _id
    AND     companies_id = _companyid;
    
    -- IF 0 record updated, set the error
    IF ROW_COUNT() = 0 THEN
     	SET errorcode  = -101;
     	SET errormsg   = 'Invalid address!';
    END IF;

END;
// 
delimiter ;
