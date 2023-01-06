DROP PROCEDURE IF EXISTS spCreateCompany;

delimiter //

CREATE PROCEDURE spCreateCompany
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _name           VARCHAR(128),
                     _code           VARCHAR(16),
                     _description    VARCHAR(512),
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
                     _user_firstname VARCHAR(32),
                     _user_lastname  VARCHAR(32),
                     _login          VARCHAR(16),
                     _password       VARCHAR(32),
                     _mobile         VARCHAR(24),
                     _email          VARCHAR(128),
                     _templateid     INT,
                     _notes			 VARCHAR(512)
               )

READS SQL DATA

main: BEGIN

 	DECLARE  l_notfound   INT;
 	DECLARE  l_companyid  INT;
 	DECLARE  l_addressid  INT;
 	DECLARE  l_usertype   INT;
 	DECLARE  l_id         INT;
 	DECLARE  l_roleid     INT;
 	DECLARE  l_adminid    INT;
 	DECLARE  l_salesmanid INT;
 
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
 	
 	SET _code = LOWER(_code);

 	IF (SELECT EXISTS (SELECT 1 FROM companies WHERE code = _code)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Company code already exists!';
		LEAVE main;
	
	END IF;

	-- set default template type
	IF _templateid IS NULL THEN
		SET _templateid = 6300;
	END IF;

	-- add address	
	CALL spCreateAddress (errorcode, errormsg, l_addressid, _first_name, _last_name, null, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, _phone2, _email2, NULL);

	IF errorcode != 0 THEN
		LEAVE main;
	END IF;

	-- add company record	
	INSERT INTO companies (name, code, description, sysstatuses_id, syscompanytypes_id, companytypes_id, syssubscriptiontemplates_id, addresses_id, ship_addresses_id, bill_addresses_id, parent_id, syssyncstatuses_id, notes, created, last_updated) 
	VALUES (_name, _code, _description, 4600, 4701, 4701, _templateid, l_addressid, l_addressid, l_addressid, 1, 4100, _notes, now(), now());

	SELECT LAST_INSERT_ID()
	INTO   l_companyid;
	
	SET id = l_companyid;

	-- update address record
	UPDATE addresses SET companies_id = l_companyid, last_updated = NOW() WHERE addresses.id = l_addressid;

	-- add user type records (admin, sales person)
	INSERT INTO roles (name, description, companies_id, sysroles_id, created, last_updated)
	SELECT name, name, l_companyid, l.id, now(), now()
	FROM   sysroles l
	WHERE  l.id IN (4002, 4003, 4004, 4005, 4030, 4031);

	-- provide permission to user types
	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.admin_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id = l_companyid
	AND    r.sysroles_id  = 4002              -- admin role
	AND    p.is_company    = true;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.user_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id = l_companyid
	AND    r.sysroles_id  = 4003              -- other role
	AND    p.is_company    = true;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.sales_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id = l_companyid
	AND    r.sysroles_id  = 4004              -- sales person role
	AND    p.is_company    = true;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.agent_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id = l_companyid
	AND    r.sysroles_id  = 4005              -- agent role
	AND    p.is_company    = true;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.customeradmin_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id = l_companyid
	AND    r.sysroles_id  IN (4030)              -- customer admin role
	AND    p.is_customer  = true;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.customeruser_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id = l_companyid
	AND    r.sysroles_id  IN (4031)              -- customer user role
	AND    p.is_customer  = true;

	-- add admin user address record
	SELECT r.id
	INTO   l_roleid
	FROM   roles r
	WHERE  r.companies_id = l_companyid
	AND    r.sysroles_id  = 4002;

	CALL spCreateUser (errorcode, errormsg, l_adminid, l_companyid, _user_firstname, _user_lastname, '', _login, _password, l_roleid, null, _address1, _address2, _address3, _city, _state, _zip, _mobile, _email, null);
	IF (errorcode != 0) THEN
		LEAVE main;
	END IF;

	-- add company configurations
	INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
	SELECT d.value, l_companyid, d.sysconfigurations_id, now(), now()
	FROM   syssubscriptiontemplatedetails d
	WHERE  d.syssubscriptiontemplates_id = _templateid;

	-- insert company types
	CALL spCreateCompanyType (errorcode, errormsg, l_id, l_companyid, 'Default', 'Default', 0, 300000, 4702);
	IF (errorcode != 0) THEN
		ROLLBACK;
		LEAVE main;
	END IF;

	-- CALL spCreateCompanyType (errorcode, errormsg, l_id, l_companyid, 'Retail', 'Retail', 1, 150000, 4702);
	-- IF (errorcode != 0) THEN
	-- 	LEAVE main;
	-- END IF;

	-- add root category
	INSERT INTO categories (name, code, lineage, lineage_name, is_leaf, is_root, children_count, companies_id, is_hidden, created, last_updated)
	VALUES ('Root', 'ROOT', '', '', true, true, 0, l_companyid, 0, now(), now());

	-- add payment terms
	CALL spCreatePaymentTerm (errorcode, errormsg, l_id, 'CASH', 'Cash', 0, l_companyid);
	IF (errorcode != 0) THEN
		LEAVE main;
	END IF;

	CALL spCreatePaymentTerm (errorcode, errormsg, l_id, 'NET30', 'Net 30', 30, l_companyid);
	IF (errorcode != 0) THEN
		LEAVE main;
	END IF;

	CALL spCreatePaymentTerm (errorcode, errormsg, l_id, 'NET45', 'Net 45', 45, l_companyid);
	IF (errorcode != 0) THEN
		LEAVE main;
	END IF;

	CALL spCreatePaymentTerm (errorcode, errormsg, l_id, 'NET60', 'Net 60', 60, l_companyid);
	IF (errorcode != 0) THEN
		LEAVE main;
	END IF;

	INSERT INTO unit_of_measures(name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated)
	SELECT u.name, u.description, u.short_name, u.base_id, u.conversion_factor, u.display_flag, u.is_system, l_companyid, u.id, now(), now()
	FROM   unit_of_measures u
	WHERE  u.companies_id = 1;

	-- update base_id with new ID for this company
	UPDATE unit_of_measures, unit_of_measures u1, unit_of_measures u2
	SET    unit_of_measures.base_id      = u2.id
	WHERE  unit_of_measures.companies_id = l_companyid
	AND    unit_of_measures.base_id      IS NOT NULL
	AND    unit_of_measures.base_id      = u1.id
	AND    u1.name                       = u2.name
	AND    u2.companies_id               = l_companyid;

	-- create default tax slab with 0%
	-- INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
	-- VALUES ('0%', 0, 0, 0, l_companyid, now(), now());

	-- INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
	-- VALUES ('5%', 5, 5, 1, l_companyid, now(), now());

	-- INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
	-- VALUES ('12%', 12, 12, 0, l_companyid, now(), now());

	-- INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
	-- VALUES ('15%', 15, 15, 0, l_companyid, now(), now());

	-- INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
	-- VALUES ('18%', 18, 18, 0, l_companyid, now(), now());

	-- INSERT INTO tax_slabs (name, percent, alt_percent, is_default, companies_id, created, last_updated)
	-- VALUES ('28%', 28, 28, 0, l_companyid, now(), now());

	-- create a sales person (Direct)
	SELECT r.id
	INTO   l_roleid
	FROM   roles r
	WHERE  r.companies_id = l_companyid
	AND    r.sysroles_id = 4004; 

	CALL spCreateUser(errormsg, errormsg, l_salesmanid, l_companyid, 'Direct', 'Salesman', null, CONCAT('s.', l_companyid), _password, l_roleid, null, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, l_adminid);

	-- create an agent (Direct)
	CALL spCreateAgent(errorcode, errormsg, l_id, l_companyid, 'Direct', 'direct', 'Direct', 'Direct', 'Customer', _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, null, null,  l_salesmanid, 0, 0, _first_name, _last_name, CONCAT('a.', l_companyid), _password);

	UPDATE companies
	SET    is_system_agent_id = 1, 
	       last_updated       = NOW()
	WHERE  companies.id       = l_id;

	-- create a transporter (Direct)
	CALL spCreateTransporter(errorcode, errormsg, l_id, l_companyid, 'Direct Delivery', 'direct', 'Direct', 'Direct', _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, null, null);

	UPDATE transporters
	SET    is_system    = 1, 
	       last_updated = NOW()
	WHERE  transporters.id = l_id;

END;
// 
delimiter ;