DROP PROCEDURE IF EXISTS spUpdateCustomer;

delimiter //

CREATE PROCEDURE spUpdateCustomer
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _id              INT,
                     _companyid      INT,
                     _name           VARCHAR(128),
                     _invoicing_name VARCHAR(128),
                     _code           VARCHAR(32),
                     _companytypeid  INT,
                     _tin            VARCHAR(32),
                     _addressid      INT,
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
                     _billaddressid  INT,
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
                     _shipaddressid  INT,
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
                     _statusid       INT,
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
                     _userid         INT,
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
     END;*/

    SET l_notfound = 0;
    SET errorcode  = 0;
    SET errormsg   = 'Success';

    IF _gst_number IS NOT NULL AND TRIM(_gst_number) <> '' AND LENGTH(_gst_number) <> 15 THEN
        SET errorcode = -205;
        SET errormsg = 'Invalid GST Number.';
        LEAVE main;
    END IF;

    IF _gst_number IS NOT NULL THEN
        SET _pan_number = SUBSTR(_gst_number FROM 3 FOR 10);
    END IF;
    
    SET _code = TRIM(UPPER(_code));

    -- TODO: check error code after every insert
    IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.code = _code AND c.id <> _id AND c.syscompanytypes_id = 4702 AND c.parent_id = _companyid)) THEN

        SET errorcode  = -202;
        SET errormsg   = 'Company with same code already exists!';
        LEAVE main;

    END IF;

    -- validate name
    IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.name = _name AND c.id <> _id AND c.syscompanytypes_id = 4702 AND c.parent_id = _companyid)) THEN
        SET errorcode  = -210;
        SET errormsg   = 'Customer with same name already exists.';
        LEAVE main;
    END IF;

    -- validate accounting name
    IF (SELECT EXISTS (SELECT 1 FROM companies c WHERE c.invoicing_name = _invoicing_name AND c.id <> _id AND c.syscompanytypes_id = 4702 AND c.parent_id = _companyid)) THEN
        SET errorcode  = -211;
        SET errormsg   = 'Customer with same name already exists.';
        LEAVE main;
    END IF;

    IF _agentid IS NOT NULL THEN
    
        IF (SELECT NOT EXISTS (SELECT 1 FROM companies c WHERE c.id = _agentid AND c.salesperson_id = _salespersonid AND c.parent_id = _companyid)) THEN

            SET errorcode  = -206;
            SET errormsg   = 'Salesperson - Agent combination must match!';
            LEAVE main;

        END IF;

    END IF;

    -- create address
    CALL spUpdateAddress (errorcode, errormsg, _id, _addressid,  _firstname, _lastname, null, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, _phone2, _email2);
    IF (errorcode != 0) THEN
        SET errorcode = -200;
        SET errormsg = 'Error updating address';
        LEAVE main;
    END IF;
    
    -- create bill address
    CALL spUpdateAddress (errorcode, errormsg, _id, _billaddressid, _billfirstname, _billlastname, null, _billaddress1, _billaddress2, _billaddress3, _billcity, _billstate, _billzip, _billphone1, _billemail1, _billphone2, _billemail2);
    IF (errorcode != 0) THEN
        SET errorcode = -201;
        SET errormsg = 'Error updating bill address';
        LEAVE main;
    END IF;

    -- create ship address
    CALL spUpdateAddress (errorcode, errormsg, _id, _shipaddressid, _shipfirstname, _shiplastname, _shipname, _shipaddress1, _shipaddress2, _shipaddress3, _shipcity, _shipstate, _shipzip, _shipphone1, _shipemail1, _shipphone2, _shipemail2);
    IF (errorcode != 0) THEN
        SET errorcode = -202;
        SET errormsg = 'Error updating ship address';
        LEAVE main;
    END IF;

    IF _cst_number IS NULL OR _cst_number = "" THEN
        SET _taxform_flag = 0;
    END IF;

    -- update party 
    UPDATE companies 
    SET name               = _name, 
        code               = _code,
        description        = _name, 
        invoicing_name     = _invoicing_name,
        transporters_id    = _transporterid, 
        payment_terms_id   = CASE WHEN _paytermid = -1 THEN payment_terms_id ELSE _paytermid END, 
        current_balance    = CASE WHEN _currentbalance = -1 THEN current_balance ELSE _currentbalance END, 
        allowed_balance    = CASE WHEN _allowedbalance = -1 THEN allowed_balance ELSE _allowedbalance END,
        current_overdue    = CASE WHEN _currentoverdue = -1 THEN current_overdue ELSE _currentoverdue END,
        tin                = _tin,
        sysstatuses_id     = _statusid,
        salesperson_id     = _salespersonid,
        companytypes_id    = _companytypeid,
        agents_id          = _agentid,
        notes              = _notes,
        taxform_flag       = _taxform_flag,
        gst_number         = _gst_number,
        gst_registration_type = _gst_registration_type,
        pan_number         = _pan_number, 
        cst_number         = _cst_number, 
        vat_number         = _vat_number, 
        excise_number      = _excise_number,
        syssyncstatuses_id = CASE WHEN _syncstatusid = 4103 THEN 4103 ELSE 4100 END,
        last_updated       = NOW()
    WHERE id               = _id
    AND parent_id          = _companyid;

    IF _loginname IS NOT NULL AND _loginname <> '' AND _password IS NOT NULL AND _password <> '' THEN

        -- add admin user address record
        SELECT r.id
        INTO   l_roleid
        FROM   roles r
        WHERE  r.companies_id = _id
        AND    r.sysroles_id  = 4030;

        IF _userid IS NOT NULL THEN

            SELECT id
            INTO   l_userid  
            FROM   users 
            WHERE  companies_id = _id 
            AND    sysroles_id  = 4030 
            AND    roles_id     = l_roleid 
            AND    statuses_id  = 4600
            AND    id           = _userid;

        ELSE

            SELECT id
            INTO   l_userid  
            FROM   users 
            WHERE  companies_id = _id 
            AND    sysroles_id  = 4030 
            AND    roles_id     = l_roleid 
            AND    statuses_id  = 4600;

        END IF;


        IF l_userid is NULL THEN

            CALL spCreateUser (errorcode, errormsg, l_userid, _id, _firstname, _lastname, '', _loginname, _password, l_roleid, _addressid, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, null);
            IF (errorcode != 0) THEN
                LEAVE main;
            END IF;

        ELSE
        
            CALL spUpdateUser (errorcode, errormsg, _id, l_userid, _firstname, _lastname, '', l_roleid, 4600, _addressid, _address1, _address2, _address3, _city, _state, _zip, _phone1, _email1, null, _password);
            IF (errorcode != 0) THEN
                LEAVE main;
            END IF;

        END IF;

    END IF;

END;
// 
delimiter ;
