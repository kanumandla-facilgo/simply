DROP PROCEDURE IF EXISTS spCreateTransporter;

delimiter //

CREATE PROCEDURE spCreateTransporter
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _companyid      INT,
                     _name           VARCHAR(128),
                     _code           VARCHAR(32),
                     _firstname      VARCHAR(32),
                     _lastname       VARCHAR(32),
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
 	DECLARE  l_addressid  INT;
 
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
 	
 	-- TODO: validate dup of code
 
    -- get the next gatepass number
    CALL spGetNextSequence(errorcode, errormsg, _code, _companyid, 20050, 20053, 20051, _code);

 	-- create address
 	CALL spCreateAddress (errorcode, errormsg, l_addressid, _firstname, _lastname, null, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, _phone2, _email2, _companyid);

 	-- add transporter	
	INSERT INTO transporters (companies_id, addresses_id, name, code, sysstatuses_id, created, last_updated)
	VALUES (_companyid,  l_addressid, _name, _code, 4600, now(), now());
 
	SELECT LAST_INSERT_ID()
	INTO   id;

END;
// 
delimiter ;
