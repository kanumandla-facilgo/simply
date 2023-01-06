DROP PROCEDURE IF EXISTS spCreateAgent;

delimiter //

CREATE PROCEDURE spCreateAgent
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _companyid      INT,
                     _name           VARCHAR(128),
                     _code           VARCHAR(32),
                     _accounting_name VARCHAR(128),
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
                     _salespersonid  INT,
                     _commission_rate DECIMAL(5, 2),
                     _balance        DECIMAL(10, 4),
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
    DECLARE  l_roleid         INT;
    DECLARE  l_userid         INT;
 
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

    IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.name = _name AND c.parent_id = _companyid AND c.syscompanytypes_id = 4703)) THEN

        SET errorcode  = -201;
        SET errormsg   = 'Agent with same name already exists!';
        LEAVE main;

    END IF;

    IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.invoicing_name = _accounting_name AND c.parent_id = _companyid AND c.syscompanytypes_id = 4703)) THEN

        SET errorcode  = -203;
        SET errormsg   = 'Agent with same accounting name already exists!';
        LEAVE main;

    END IF;

    -- get the next agent code
    CALL spGetNextSequence(errorcode, errormsg, _code, _companyid, 20060, 20063, 20061, TRIM(UPPER(_code)));

    SET _code = TRIM(UPPER(_code));

    IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.code = _code AND c.parent_id = _companyid AND c.syscompanytypes_id = 4703)) THEN

        SET errorcode  = -202;
        SET errormsg   = 'Agent with same code already exists!';
        LEAVE main;

    END IF;

    IF _salespersonid is NULL OR _salespersonid = 0 THEN

        SELECT MIN(u.id)
        INTO   _salespersonid
        FROM   users u
        WHERE  u.companies_id          = _companyid
        AND    u.statuses_id        = 4600
        AND    u.sysroles_id           = 4004;

    END IF;

    -- create address
    CALL spCreateAddress (errorcode, errormsg, l_addressid, _firstname, _lastname, null, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, _phone2, _email2, _companyid);
    IF (errorcode != 0) THEN
        SET errorcode = -200;
        SET errormsg = 'Error creating address';
        LEAVE main;
    END IF;

    -- add party    
    INSERT INTO companies (parent_id, name, code, description, sysstatuses_id, syscompanytypes_id, companytypes_id, addresses_id, bill_addresses_id, ship_addresses_id, transporters_id, payment_terms_id, current_balance, tin, salesperson_id, commission_rate, syssyncstatuses_id, invoicing_name, created,last_updated)
    VALUES (_companyid,  _name, _code, _name, 4600, 4703, 4703, l_addressid, l_addressid, l_addressid, null, null, _balance, null, _salespersonid, _commission_rate, 4100, _accounting_name, now(),now());

    SELECT LAST_INSERT_ID()
    INTO   id;

    IF _loginname IS NOT NULL AND _loginname <> '' AND _password IS NOT NULL AND _password <> '' THEN
        -- add admin user address record
        SELECT r.id
        INTO   l_roleid
        FROM   roles r
        WHERE  r.companies_id = _companyid
        AND    r.sysroles_id  = 4005;

        CALL spCreateUser (errorcode, errormsg, l_userid, id, _user_firstname, _user_lastname, '', _loginname, _password, l_roleid, l_addressid, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, null);
        IF (errorcode != 0) THEN
            LEAVE main;
        END IF;
        
    END IF;

END;
// 
delimiter ;
