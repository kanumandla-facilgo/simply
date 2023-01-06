DROP PROCEDURE IF EXISTS spCreateCustomer;

delimiter //

CREATE PROCEDURE spCreateCustomer
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                 OUT code 			 VARCHAR(32),
                     _companyid      INT,
                     _name           VARCHAR(128),
                     _invoicing_name VARCHAR(128),
                     _code           VARCHAR(32),
                     _companytypeid  INT,
                     _tin            VARCHAR(32),
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
                     _email2         VARCHAR(128),
                     _billfirstname  VARCHAR(32),
                     _billlastname   VARCHAR(32),
                     _billaddress1   VARCHAR(128),
                     _billaddress2   VARCHAR(128),
                     _billaddress3   VARCHAR(128),
                     _billcity       VARCHAR(32),
                     _billstate      VARCHAR(32),
                     _billzip        VARCHAR(16),
                     _billphone1     VARCHAR(24),
                     _billemail1     VARCHAR(128),
                     _billphone2     VARCHAR(24),
                     _billemail2     VARCHAR(128),
                     _shipname       VARCHAR(128),
                     _shipfirstname  VARCHAR(32),
                     _shiplastname   VARCHAR(32),
                     _shipaddress1   VARCHAR(128),
                     _shipaddress2   VARCHAR(128),
                     _shipaddress3   VARCHAR(128),
                     _shipcity       VARCHAR(32),
                     _shipstate      VARCHAR(32),
                     _shipzip        VARCHAR(16),
                     _shipphone1     VARCHAR(24),
                     _shipemail1     VARCHAR(128),
                     _shipphone2     VARCHAR(24),
                     _shipemail2     VARCHAR(128),
                     _transporterid  INT,
                     _paytermid      INT,
                     _salespersonid  INT,
                     _agentid        INT,
                     _syncstatusid   INT,
                     _allowedbalance DECIMAL(10, 2),
                     _currentbalance DECIMAL(10, 2),
                     _currentoverdue DECIMAL(10, 2),
                     _taxform_flag   TINYINT,
                     _gst_number     VARCHAR(24),
                     _gst_registration_type varchar(32),
                     _pan_number     VARCHAR(24),
                     _cst_number     VARCHAR(24),
                     _vat_number     VARCHAR(24),
                     _excise_number  VARCHAR(24),
                     _notes          VARCHAR(512),
                     _user_firstname VARCHAR(32),
                     _user_lastname  VARCHAR(32),
                     _loginname      VARCHAR(16),
                     _password       VARCHAR(32)
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound       INT;
 	DECLARE  l_addressid      INT;
 	DECLARE  l_shipaddressid  INT;
 	DECLARE  l_billaddressid  INT;
 	DECLARE  l_userid         INT;
 	DECLARE  l_roleid         INT;
 	DECLARE l_is_auto_customer_code VARCHAR(32);
	DECLARE l_is_customer_code_edit_on VARCHAR(64);
	DECLARE l_customer_code VARCHAR(32);

 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;


	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
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

 	SET _code = TRIM(UPPER(_code));

	SELECT value
	INTO   l_is_auto_customer_code
	FROM   configurations
	WHERE  sysconfigurations_id = 20030
	AND    companies_id         = _companyid;

	IF l_is_auto_customer_code = '0' THEN

		IF _code IS NOT NULL AND _code != '' THEN

			SELECT value
			INTO   l_is_customer_code_edit_on
			FROM   configurations
			WHERE  sysconfigurations_id = 20033
			AND    companies_id         = _companyid;

			IF l_is_customer_code_edit_on = '1' THEN

				SET l_customer_code = _code;

			END IF;

		END IF;

		IF l_customer_code IS NULL THEN

			SELECT value
			INTO   l_customer_code
			FROM   configurations
			WHERE  sysconfigurations_id = 20031
			AND    companies_id         = _companyid
			FOR    UPDATE;

			UPDATE configurations
			SET    value = l_customer_code + 1
			WHERE  sysconfigurations_id = 20031
			AND    companies_id         = _companyid;

		END IF;

	ELSE

		SET l_customer_code = _code;

	END IF;

	IF l_customer_code IS NULL OR TRIM(l_customer_code) = '' THEN

		SET errorcode  = -221;
		SET errormsg   = 'Customer code is required field!';
		LEAVE main;

	END IF;

	IF _name IS NULL OR TRIM(_name) = '' THEN
		IF (SELECT EXISTS (SELECT 1 FROM configurations WHERE sysconfigurations_id IN (SELECT sc.id FROM sysconfigurations sc WHERE name = 'module_customer_gst') AND companies_id = _companyid AND value = '0')) THEN
			SET _name = CONCAT(_firstname, ' ', _lastname);
		ELSE
			SET errorcode  = -224;
			SET errormsg   = 'Customer Name is requied!';
			LEAVE main;
		END IF;
	END IF;

	-- validate name
	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.name = _name AND c.syscompanytypes_id = 4702 AND c.parent_id = _companyid)) THEN
		SET errorcode  = -210;
		SET errormsg   = 'Customer with same name already exists.';
		LEAVE main;
	END IF;

 	IF _invoicing_name IS NULL OR TRIM(_invoicing_name) = "" THEN
 		SET _invoicing_name = _name;
 	END IF;

	-- validate accounting name
	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.invoicing_name = _invoicing_name AND c.syscompanytypes_id = 4702 AND c.parent_id = _companyid)) THEN
		SET errorcode  = -211;
		SET errormsg   = 'Customer with same accounting name already exists.';
		LEAVE main;
	END IF;

	-- validate code
	IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.code = _code AND c.syscompanytypes_id = 4702 AND c.parent_id = _companyid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Company with same code already exists!';
		LEAVE main;

	END IF;

	IF _agentid IS NOT NULL THEN
	
		IF (SELECT NOT EXISTS (SELECT 1 FROM companies c WHERE c.id = _agentid AND c.salesperson_id = _salespersonid AND c.parent_id = _companyid)) THEN

			SET errorcode  = -206;
			SET errormsg   = 'Salesperson - Agent combination must match!';
			LEAVE main;

		END IF;

	ELSE

		IF (SELECT EXISTS (SELECT 1 FROM configurations WHERE sysconfigurations_id IN (SELECT sc.id FROM sysconfigurations sc WHERE name = 'module_agents') AND companies_id = _companyid AND value = '0')) THEN

			SELECT MIN(c.id)
			INTO   _agentid
			FROM   companies c
			WHERE  c.parent_id          = _companyid
			AND    c.sysstatuses_id     = 4600
			AND    c.syscompanytypes_id = 4703;

		END IF;

		IF _agentid IS NULL THEN

			SET errorcode  = -222;
			SET errormsg   = 'Agent not found!';
			LEAVE main;

		END IF;

		SELECT salesperson_id
		INTO   _salespersonid
		FROM   companies c
		WHERE  c.id           = _agentid
		AND    c.parent_id    = _companyid; 

	END IF;

	/*IF _paytermid IS NULL THEN

		IF (SELECT EXISTS (SELECT 1 FROM configurations WHERE sysconfigurations_id IN (SELECT sc.id FROM sysconfigurations sc WHERE name = 'module_payment_terms') AND companies_id = _companyid AND value = '0')) THEN

			SELECT MIN(c.id)
			INTO   _paytermid
			FROM   payment_terms c
			WHERE  c.companies_id          = _companyid
			AND    c.sysstatuses_id        = 4600;

		END IF;

		IF _paytermid IS NULL THEN
			SET errorcode = -223;
			SET errormsg = 'Invalid Pay Terms!';
			LEAVE main;
		END IF; 

	END IF;*/

 	-- create address
 	CALL spCreateAddress (errorcode, errormsg, l_addressid, _firstname, _lastname, null, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, _phone2, _email2, null);
	IF (errorcode != 0) THEN
		SET errorcode = -200;
		SET errormsg = 'Error creating address';
		LEAVE main;
	END IF;
	
 	-- create bill address
 	CALL spCreateAddress (errorcode, errormsg, l_billaddressid, _billfirstname, _billlastname, null, _billaddress1, _billaddress2, _billaddress3, _billcity, _billstate, _billzip, _billphone1, _billemail1, _billphone2, _billemail2, null);
	IF (errorcode != 0) THEN
		SET errorcode = -201;
		SET errormsg = 'Error creating bill address';
		LEAVE main;
	END IF;

 	-- create ship address
 	CALL spCreateAddress (errorcode, errormsg, l_shipaddressid, _shipfirstname, _shiplastname, _shipname, _shipaddress1, _shipaddress2, _shipaddress3, _shipcity, _shipstate, _shipzip, _shipphone1, _shipemail1, _shipphone2, _shipemail2, null);
	IF (errorcode != 0) THEN
		SET errorcode = -202;
		SET errormsg = 'Error creating ship address';
		LEAVE main;
	END IF;
	
	IF _companytypeid IS NULL THEN
		SELECT c.id
		INTO   _companytypeid
		FROM   company_types c
		WHERE  c.companies_id = _companyid
		AND    c.master_id    = 4702
		AND    c.is_default   = 1;

		IF l_notfound = 1 THEN
			SELECT min(c.id)
			INTO   _companytypeid
			FROM   company_types c
			WHERE  c.companies_id = _companyid
			AND    c.master_id    = 4702;
		END IF;

	END IF;
 

	IF _cst_number IS NULL OR _cst_number = "" THEN
		SET _taxform_flag = 0;
	END IF;

	-- if -1 is passed, then there is no permission. Set to 0 balance.
	IF _allowedbalance = -1 THEN
		SET _allowedbalance = 0;
	END IF;

	IF _currentbalance = -1 THEN
		SET _currentbalance = 0;
	END IF;

	IF _currentoverdue = -1 THEN
		SET _currentoverdue = 0;
	END IF;

	IF _syncstatusid <> 4103 OR _syncstatusid IS NULL THEN 
		SET _syncstatusid = 4100;
	END IF;

	IF _gst_number IS NOT NULL AND TRIM(_gst_number) <> '' AND LENGTH(_gst_number) <> 15 THEN
		SET errorcode = -205;
		SET errormsg = 'Invalid GST Number.';
		LEAVE main;
	END IF;

	IF _gst_number IS NOT NULL THEN
		SET _pan_number = SUBSTR(_gst_number FROM 3 FOR 10);
	END IF;

 	-- add party	
	INSERT INTO companies (parent_id, name, invoicing_name, code, description, sysstatuses_id, syscompanytypes_id, companytypes_id, addresses_id, bill_addresses_id, ship_addresses_id, transporters_id, payment_terms_id, allowed_balance, current_balance, current_overdue, tin, taxform_flag, gst_number, gst_registration_type, pan_number, cst_number, vat_number, excise_number, agents_id, salesperson_id, notes, syssyncstatuses_id, created, last_updated)
	VALUES (_companyid,  _name, _invoicing_name, l_customer_code, _name, 4600, 4702, _companytypeid, l_addressid, l_billaddressid, l_shipaddressid, _transporterid, _paytermid, _allowedbalance, _currentbalance, _currentoverdue, _tin, _taxform_flag, _gst_number, _gst_registration_type, _pan_number, _cst_number, _vat_number, _excise_number, _agentid, _salespersonid, _notes, _syncstatusid, now(),now());

	SELECT LAST_INSERT_ID()
	INTO   id;

	SET code = l_customer_code;

	UPDATE addresses
	SET    companies_id = id,
           last_updated = NOW()
	WHERE  addresses.id IN (l_addressid, l_shipaddressid, l_billaddressid);

	-- add user type records (admin, sales person)
	INSERT INTO roles (name, description, companies_id, sysroles_id, created, last_updated)
	SELECT name, name, id, l.id, now(), now()
	FROM   sysroles l
	WHERE  l.id IN (4030, 4031);

	-- provide permission to user types
	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.customeradmin_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id = id
	AND    r.sysroles_id  = 4030              -- admin role
	AND    p.is_customer = true;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.customeruser_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id = id
	AND    r.sysroles_id  = 4031              -- other role
	AND    p.is_customer = true;

	IF _loginname IS NOT NULL AND _loginname <> '' AND _password IS NOT NULL AND _password <> '' THEN
        -- add admin user address record
        SELECT r.id
        INTO   l_roleid
        FROM   roles r
        WHERE  r.companies_id = id
        AND    r.sysroles_id  = 4030;

        CALL spCreateUser (errorcode, errormsg, l_userid, id, _user_firstname, _user_lastname, '', _loginname, _password, l_roleid, l_addressid, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, null);
        IF (errorcode != 0) THEN
            LEAVE main;
        END IF;
        
    END IF;

END;
// 
delimiter ;
