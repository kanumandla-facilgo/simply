DROP PROCEDURE IF EXISTS spCreateUser;

delimiter //

CREATE PROCEDURE spCreateUser
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _companyid      INT,
                     _firstname      VARCHAR(32),
                     _lastname       VARCHAR(32),
                     _middlename     VARCHAR(32),
                     _loginname      VARCHAR(16),
                     _password       VARCHAR(32),
                     _roleid         INT,
                     _addressid      INT,          -- if this value is provided, address fields will be ignored 
                     _address1       VARCHAR(128),
                     _address2       VARCHAR(128),
                     _address3       VARCHAR(128),
                     _city           VARCHAR(32),
                     _state          VARCHAR(32),
                     _zip            VARCHAR(16),
                     _phone          VARCHAR(24),
                     _email          VARCHAR(128),
                     _createdby      INT
               )
DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound   INT;
	DECLARE  l_id         INT;
	DECLARE  l_addressid  INT;
	DECLARE  l_sysroleid  INT;
	DECLARE  l_salt       VARCHAR(32);
	DECLARE  l_pwd        VARCHAR(32);
 
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
	
	IF (SELECT EXISTS (SELECT 1 FROM users WHERE login_name = LOWER(_loginname))) THEN

		SET errorcode  = -101;
		SET errormsg   = 'User name already exists!';
		LEAVE main;
	
	END IF;
	
	SELECT r.sysroles_id 
	INTO   l_sysroleid
	FROM   roles r 
	WHERE  r.id = _roleid;
	
	IF (l_notfound = 1) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Invalid role!';
		LEAVE main;

	END IF;

	IF (l_sysroleid = 4005) THEN

		SELECT r.sysroles_id 
		INTO   l_sysroleid
		FROM   roles r, companies c 
		WHERE  r.id               = _roleid
		AND    r.companies_id     = c.parent_id
		AND    c.id               = _companyid;

	ELSE -- IF l_sysroleid = 4005 THEN

		SELECT r.sysroles_id 
		INTO   l_sysroleid
		FROM   roles r 
		WHERE  r.id           = _roleid
		AND    r.companies_id = _companyid;

	END IF;

	IF (l_notfound = 1) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Invalid role!';
		LEAVE main;

	END IF;

	-- TODO: make sure role belongs to company type etc.

	SET l_salt = left(replace(uuid(), '-', ''), 32);
	SET l_pwd  = MD5(CONCAT('A9074#321', _password, l_salt, 'Arihant'));

	IF _addressid IS NULL THEN
		CALL spCreateAddress (errorcode, errormsg, l_addressid, _firstname, _lastname, null, _address1, _address2, _address3, _city, _state, _zip, _phone, _email, null, null, _companyid);
	ELSE
		SET l_addressid = _addressid;
	END IF;
 
 	INSERT INTO users (first_name, last_name, middle_name, login_name, password, salt, companies_id, addresses_id, statuses_id, sysroles_id, roles_id, created, last_updated)
	VALUES (_firstname, _lastname, _middlename, LOWER(_loginname), l_pwd, l_salt, _companyid, l_addressid, 4600, l_sysroleid, _roleid, now(), now());

	SELECT LAST_INSERT_ID() INTO id;

END;
// 
delimiter ;
