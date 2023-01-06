DROP PROCEDURE IF EXISTS spUpdateAgent;

delimiter //

CREATE PROCEDURE spUpdateAgent
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _id              INT,
                     _companyid      INT,
                     _name           VARCHAR(128),
                     _code           VARCHAR(32),
                     _accounting_name VARCHAR(128),
                     _addressid      INT,
                     _first_name     VARCHAR(32),
                     _last_name      VARCHAR(32),
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
                     _statusid       INT,
                     _salespersonid  INT,
                     _commission_rate DECIMAL(5, 2),
                     _balance        DECIMAL(10, 4),
                     _userid         INT,
                     _loginname      VARCHAR(16),
                     _password       VARCHAR(32)                     
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound       INT;
 	DECLARE  l_addressid      INT;
 	DECLARE  l_userid         INT;
 	DECLARE  l_roleid         INT;
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;


 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

    IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.name = _name AND c.id <> _id AND c.parent_id = _companyid AND c.syscompanytypes_id = 4703)) THEN

        SET errorcode  = -201;
        SET errormsg   = 'Agent with same name already exists!';
        LEAVE main;

    END IF;

    IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.invoicing_name = _accounting_name AND c.id <> _id AND c.parent_id = _companyid AND c.syscompanytypes_id = 4703)) THEN

        SET errorcode  = -203;
        SET errormsg   = 'Agent with same accounting name already exists!';
        LEAVE main;

    END IF;

 	SET _code = TRIM(UPPER(_code));

 	-- TODO: check error code after every insert
	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.code = _code ANd c.syscompanytypes_id = 4703 AND c.id <> _id AND c.parent_id = _companyid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Agent with same code already exists!';
		LEAVE main;

	END IF;
 
	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.agents_id = _id AND c.salesperson_id <> _salespersonid)) THEN
/*
		SET errorcode  = -206;
		SET errormsg   = 'In order to update sales person with agent, first clear agent in customers!';
		LEAVE main;
*/
		UPDATE companies
		SET    salesperson_id = _salespersonid,
			   last_updated   = NOW()
		WHERE  agents_id      = _id
		AND    salesperson_id <> _salespersonid
		AND    syscompanytypes_id = 4702;

	END IF;

 	-- create address
 	CALL spUpdateAddress (errorcode, errormsg, _companyid, _addressid, _first_name, _last_name, null, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, _phone2, _email2);
	IF (errorcode != 0) THEN
		SET errorcode = -200;
		SET errormsg = 'Error updating address';
		LEAVE main;
	END IF;
	
 	-- update party	
	UPDATE companies 
	SET name               = _name, 
		code               = _code,
		description        = _name, 
		current_balance    = _balance, 
		invoicing_name     = _accounting_name,
		sysstatuses_id     = _statusid,
		salesperson_id     = _salespersonid,
		commission_rate    = _commission_rate,
		last_updated       = NOW()
	WHERE id               = _id
	AND parent_id          = _companyid
	AND syscompanytypes_id = 4703;

	IF _loginname IS NOT NULL AND _loginname <> '' AND _password IS NOT NULL AND _password <> '' THEN

        -- add admin user address record
        SELECT r.id
        INTO   l_roleid
        FROM   roles r
        WHERE  r.companies_id = _companyid
        AND    r.sysroles_id  = 4005;

        IF _userid IS NOT NULL THEN

	        SELECT id
	        INTO   l_userid  
	        FROM   users 
	        WHERE  companies_id = _id 
	        AND    sysroles_id  = 4005 
	        AND    roles_id     = l_roleid 
	        AND    statuses_id  = 4600
	        AND    id           = _userid;

	    ELSE

	        SELECT id
	        INTO   l_userid  
	        FROM   users 
	        WHERE  companies_id = _id 
	        AND    sysroles_id  = 4005 
	        AND    roles_id     = l_roleid 
	        AND    statuses_id  = 4600;

        END IF;


        IF l_userid is NULL THEN

	        CALL spCreateUser (errorcode, errormsg, l_userid, _id, _first_name, _last_name, '', _loginname, _password, l_roleid, _addressid, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, null);
	        IF (errorcode != 0) THEN
	            LEAVE main;
	        END IF;

	    ELSE
	    	CALL spUpdateUser (errorcode, errormsg, _id, l_userid, _first_name, _last_name, '', l_roleid, 4600, _addressid, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, null, _password);
	        IF (errorcode != 0) THEN
	            LEAVE main;
	        END IF;

        END IF;

    END IF;

END;
// 
delimiter ;
