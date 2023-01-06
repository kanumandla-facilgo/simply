DROP PROCEDURE IF EXISTS spCreateCompanyType;

delimiter //

CREATE PROCEDURE spCreateCompanyType
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                 	 _companyid      INT,
                 	 _name           VARCHAR(32),
                     _description    VARCHAR(256),
                     _isdefault      TINYINT,
                     _balancelimit   INT,
                     _masterid       INT
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

	-- add company types	
	INSERT INTO company_types (name, description, balance_limit, is_default, master_id, companies_id, created, last_updated) 
	VALUES (_name, _description, _balancelimit, _isdefault, _masterid, _companyid, NOW(), NOW());

	IF _isdefault = true THEN
		UPDATE company_types
		SET    is_default      = 0,
		       last_updated    = NOW()
		WHERE  companies_id    = _companyid
		AND    company_types.id <> id
		AND    is_default      = 1;    
	END IF;

	SELECT LAST_INSERT_ID()
	INTO   id;

END;
// 
delimiter ;
