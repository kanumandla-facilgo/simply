DROP PROCEDURE IF EXISTS spCreateAddress;

delimiter //

CREATE PROCEDURE spCreateAddress
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
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
                     _email2         VARCHAR(128),
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

    IF _name IS NULL THEN
        SET _name = CONCAT(TRIM(_first_name), ' ', TRIM(_last_name));
        SET _name = TRIM(_name);
        IF _name = '' THEN
            SET _name = NULL;
        END IF;
    END IF;

 	-- add address	
	INSERT INTO addresses (companies_id, first_name, last_name, name, address1, address2, address3, city, state, pin, phone1, email1, phone2, email2, created, last_updated)
	VALUES (_companyid, _first_name, _last_name, _name, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, _phone2, _email2, now(), now());

	SELECT LAST_INSERT_ID()
	INTO   id;

END;
// 
delimiter ;
