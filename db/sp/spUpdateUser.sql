DROP PROCEDURE IF EXISTS spUpdateUser;

delimiter //

CREATE PROCEDURE spUpdateUser
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _id             INT,
                     _firstname      VARCHAR(32),
                     _lastname       VARCHAR(32),
                     _middlename     VARCHAR(32),
                     _roleid         INT,
                     _statusid       INT,
                     _addressid      INT,          -- if this value is provided, address fields will be ignored 
                     _address1       VARCHAR(128),
                     _address2       VARCHAR(128),
                     _address3       VARCHAR(128),
                     _city           VARCHAR(32),
                     _state          VARCHAR(32),
                     _zip            VARCHAR(16),
                     _phone          VARCHAR(24),
                     _email          VARCHAR(128),
                     _updatedby      INT,
                     _password		 VARCHAR(32)
               )
DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound     INT;
	DECLARE  l_id           INT;
	DECLARE  l_addressid    INT;
	DECLARE  l_roleid       INT;
	DECLARE  l_cursysroleid INT;
	DECLARE  l_sysroleid    INT;
	DECLARE  l_statusid     INT;
    DECLARE  l_companytypesid INT;
    DECLARE  l_companyid 	INT;
	DECLARE  l_salt			VARCHAR(32);
    DECLARE  l_pwd			VARCHAR(32);
    
    
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

/*
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;*/


    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';
    
	SELECT CASE WHEN companytypes_id = 4703 THEN (select parent_id from companies where id = _companyid) ELSE _companyid END
	INTO l_companyid
	from companies
	where id = _companyid;
    
	SELECT roles_id, addresses_id, statuses_id, sysroles_id
	INTO   l_roleid, l_addressid, l_statusid, l_cursysroleid
	FROM   users u
	WHERE  u.id          = _id
	AND    companies_id  = _companyid;

	IF (l_notfound = 1) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Invalid user!';
		LEAVE main;

	END IF;
    
	SELECT r.sysroles_id 
	INTO   l_sysroleid
	FROM   roles r 
	WHERE  r.id = _roleid 
	AND    r.companies_id = l_companyid;

	IF (l_notfound = 1) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Invalid role!';
		LEAVE main;

	END IF;

	-- if currently admin, if status is changing or role is changing, check if any other user is still having admin access
	-- as one admin in the system is mandatory.
	IF (_statusid != 4600 AND l_statusid = 4600 AND l_cursysroleid = 4002) OR (l_cursysroleid = 4002 AND l_cursysroleid <> l_sysroleid) THEN

		IF (SELECT NOT EXISTS (SELECT 1 FROM users u WHERE u.companies_id = _companyid AND u.sysroles_id = 4002 AND u.id <> _id)) THEN

			SET errorcode  = -205;
			SET errormsg   = 'Unable to update user as one user must be an active admin user!';
			LEAVE main;
		
		END IF;
	
	END IF;

	IF _addressid IS NULL THEN

		CALL spCreateAddress (errorcode, errormsg, l_addressid, _firstname, _lastname, null, _address1, _address2, _address3, _city, _state, _zip, _phone, _email, null, null, l_companyid);
		IF (errorcode <> 0) THEN

			SET errorcode  = -200;
			SET errormsg   = 'Invalid address!';
			LEAVE main;

		END IF;

	ELSEIF l_addressid <> _addressid THEN

		SET l_addressid = _addressid;
		 
	ELSE

		CALL spUpdateAddress (errorcode, errormsg, l_companyid, l_addressid,  _firstname, _lastname, null, _address1, _address2, _address3, _city, _state, _zip, _phone, _email, null, null);
		IF (errorcode <> 0) THEN

			SET errorcode  = -204;
			SET errormsg   = 'Invalid address!';
			LEAVE main;

		END IF;
	 
	END IF;

	SET l_salt = left(replace(uuid(), '-', ''), 32);
	SET l_pwd  = MD5(CONCAT('A9074#321', _password, l_salt, 'Arihant'));

 	UPDATE  users
 	SET     first_name     = _firstname,
 	        last_name      = _lastname,
 	        middle_name    = _middlename,
 	        statuses_id    = _statusid,
 	        addresses_id   = l_addressid,
 	        sysroles_id    = l_sysroleid,
 	        roles_id       = _roleid,
 	        password	   = CASE
			   WHEN _password is NOT NULL AND _password != '' THEN l_pwd
			   ELSE password END,
 	        salt	       = CASE
			   WHEN _password is NOT NULL AND _password != '' THEN l_salt
			   ELSE salt END,
 	        last_updated   = NOW()
 	WHERE   id             = _id;
 	
 	IF ROW_COUNT() = 0 THEN
		SET errorcode  = -101;
		SET errormsg   = 'Invalid user!';
		LEAVE main;
 	END IF;

END;
// 
delimiter ;
