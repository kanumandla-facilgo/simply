DROP PROCEDURE IF EXISTS spGetCustomer;

delimiter //

CREATE PROCEDURE spGetCustomer
            (
                 OUT errorcode              INT, 
                 OUT errormsg               VARCHAR(512),
                 OUT _totalrecords          INT,
                    _companyid              VARCHAR(32),
                    _id                     INT,
                    _code                   VARCHAR(16),
                    _userid                 INT,
                    _activeOnly             INT ,
                    _agentid                INT,
                    _salesmanid             INT,
                    _search_text            VARCHAR(512),
                    _sync_status_id         INT,
                    _created_since_x_mins   INT,
                    _modified_since_x_mins  INT,
                    _customer_name          VARCHAR(128),
                    _city_name              VARCHAR(32),
                    _state_name             VARCHAR(32),
                    _statusid               INT,
                    _currentpage            INT,
                    _recordsperpage         INT,
                    _sortby                 VARCHAR(32),
                    _sortorder              INT
           )
DETERMINISTIC
READS SQL DATA

main: BEGIN

    DECLARE offsetrecords  INT;
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


     SET errorcode  = 0;
     SET errormsg   = 'Success';

    IF _currentpage IS NULL THEN
        SET _currentpage = 1;
    END IF;

    IF _recordsperpage IS NULL THEN
        SET _recordsperpage = 9999999;
    END IF;

    SET offsetrecords = (_currentpage -1 ) *_recordsperpage;

    IF _created_since_x_mins IS NULL THEN
        SET _created_since_x_mins = -1;
    END IF;

    IF _modified_since_x_mins IS NULL THEN
        SET _modified_since_x_mins = -1;
    END IF;

    SELECT      SQL_CALC_FOUND_ROWS c.*,
                a.id as "home_addressid", a.first_name as "home_first_name", a.last_name as "home_last_name", a.address1 as "home_address1", a.address2 as "home_address2", a.address3 as "home_address3", a.city as "home_city", a.state as "home_state", a.pin as "home_pin", a.phone1 as "home_phone1", a.email1 as "home_email1", a.phone2 as "home_phone2", a.email2 as "home_email2",
                s.id as "ship_addressid", s.name as "ship_name", s.first_name as "ship_first_name", s.last_name as "ship_last_name", s.address1 as "ship_address1", s.address2 as "ship_address2", s.address3 as "ship_address3",
                s.city as "ship_city", s.state as "ship_state", s.pin as "ship_pin", s.phone1 as "ship_phone1", s.phone2 as "ship_phone2",
                s.email1 as "ship_email1", s.email2 as "ship_email2",b.id as "bill_addressid", b.first_name as "bill_first_name", b.last_name as "bill_last_name", b.address1 as "bill_address1", b.address2 as "bill_address2", b.address3 as "bill_address3",
                b.city as "bill_city", b.state as "bill_state", b.pin as "bill_pin", b.phone1 as "bill_phone1", b.phone2 as "bill_phone2",
                b.email1 as "bill_email1", b.email2 as "bill_email2", t.name as "typename",
                r.id as "transporter_id", r.name as "transporter_name", r.code as "transporter_code", r.sysstatuses_id as "transporter_statusid", r.external_code as 'transporter_external_code',
                m.id as "term_id", m.code as term_code, m.description as "term_description", m.sysstatuses_id as "term_statusid", m.days as "term_days",
                u.first_name as first_name, u.last_name as last_name, u.statuses_id as "salesperson_statusid",
                u1.id as user_id, u1.first_name as user_first_name, u1.last_name as user_last_name, u1.login_name as user_login_name, 
                c1.id as "agent_id", c1.name as "agent_name", c1.sysstatuses_id as "agent_statusid", c1.code as "agent_code", c1.commission_rate as "agent_commission_rate", c1.invoicing_name as "agent_invoicing_name"
    FROM   companies c 
           LEFT JOIN users u ON c.salesperson_id = u.id 
           LEFT JOIN users u1 ON c.id = u1.companies_id 
           LEFT JOIN companies c1 ON c.agents_id = c1.id 
           LEFT JOIN company_types t ON c.companytypes_id = t.id 
           LEFT JOIN transporters r ON c.transporters_id = r.id
           LEFT JOIN payment_terms m ON c.payment_terms_id = m.id
           , addresses a, addresses s, addresses b, sysstatuses y
    WHERE  c.parent_id = CASE WHEN _companyid = 1 THEN c.parent_id ELSE _companyid END
    AND    c.syscompanytypes_id           = 4702
    AND    c.addresses_id                 = a.id
    AND    c.ship_addresses_id            = s.id
    AND    c.bill_addresses_id            = b.id
    AND    c.sysstatuses_id               = y.id
    AND    CASE WHEN _code IS NOT NULL THEN c.code ELSE 1 END             =  CASE WHEN _code IS NOT NULL THEN _code ELSE 1 END
    AND    CASE WHEN _activeonly = 1 THEN c.sysstatuses_id ELSE 1 END             =  CASE WHEN _activeonly = 1 THEN 4600 ELSE 1 END
    AND    CASE WHEN _id IS NOT NULL THEN c.id ELSE 1 END           = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END
    AND    CASE WHEN _agentid IS NOT NULL THEN c.agents_id ELSE 1 END           = CASE WHEN _agentid IS NOT NULL THEN _agentid ELSE 1 END
    AND    CASE WHEN _salesmanid IS NOT NULL THEN c.salesperson_id ELSE 1 END           = CASE WHEN _salesmanid IS NOT NULL THEN _salesmanid ELSE 1 END
    AND    CASE WHEN _statusid IS NOT NULL THEN c.sysstatuses_id ELSE 1 END             =  CASE WHEN _statusid IS NOT NULL THEN _statusid ELSE 1 END
--    AND       CASE WHEN _search_text IS  NULL THEN   1=1  ELSE  (c.name like CONCAT('%', _search_text, '%')  or c.code like CONCAT(_search_text, '%'))   END
    AND       CASE WHEN _search_text IS  NULL OR _search_text = '..' THEN   1=1  ELSE  (c.name like CONCAT('%', _search_text, '%')  or c.code like CONCAT(_search_text, '%') or a.phone1 like CONCAT(_search_text, '%'))   END
    AND    CASE WHEN _created_since_x_mins > 0 THEN c.created > DATE_ADD(NOW(), interval _created_since_x_mins * -1 MINUTE) ELSE 1 = 1 END
    AND    CASE WHEN _modified_since_x_mins > 0 THEN c.last_updated > DATE_ADD(NOW(), interval _modified_since_x_mins * -1 MINUTE) ELSE 1 = 1 END
    AND    CASE WHEN _sync_status_id IS NULL THEN 1 =1 ELSE c.syssyncstatuses_id = _sync_status_id END
    AND    CASE WHEN _customer_name IS NOT NULL THEN c.name LIKE CONCAT('%', _customer_name, '%') ELSE 1 = 1 END
    AND    CASE WHEN _city_name IS NOT NULL THEN a.city LIKE CONCAT('%', _city_name, '%') ELSE 1 = 1 END
    AND    CASE WHEN _state_name IS NOT NULL THEN a.state LIKE CONCAT('%', _state_name, '%') ELSE 1 = 1 END
    AND    CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
                                        (
                                                SELECT c1.id
                                                FROM   companies c1, users u
                                                WHERE  c1.syscompanytypes_id = 4702
                                                AND    c1.salesperson_id     = _userid
                                                AND    u.id                  = _userid
                                                AND    u.sysroles_id         = 4004
                                                AND    u.companies_id        = _companyid
                                                AND    c1.parent_id          = _companyid
                                                UNION ALL
                                                SELECT c1.id
                                                FROM   companies c1, users u, companies a
                                                WHERE  c1.syscompanytypes_id = 4702
                                                AND    c1.agents_id          = a.id
                                                AND    u.id                  = _userid
                                                AND    u.sysroles_id         = 4005
                                                AND    u.companies_id        = a.id
                                                AND    c1.parent_id          = _companyid
                                                UNION ALL
                                                SELECT c1.id
                                                FROM   companies c1, users u
                                                WHERE  c1.syscompanytypes_id = 4702
                                                AND    u.id                  = _userid
                                                AND    u.sysroles_id         IN (4002,4003)
                                                AND    u.companies_id        = _companyid
                                                AND    c1.parent_id          = _companyid
                                                UNION ALL
                                                SELECT c2.id
                                                FROM   companies c1, users u, companies c2
                                                WHERE  c1.syscompanytypes_id = 4702
                                                AND    u.id                  = _userid
                                                AND    u.sysroles_id         IN (4030, 4031)
                                                AND    u.companies_id        = c2.id
                                                AND    c2.parent_id          = _companyid
                                                AND    c1.id                 = u.companies_id
                                                UNION ALL -- super admin for api
                                                SELECT c2.id
                                                FROM   companies c2
                                                WHERE  c2.syscompanytypes_id = 4702
                                                AND    EXISTS ( SELECT  1 
                                                                FROM    companies c1, users u
                                                                WHERE   c1.id                 = u.companies_id
                                                                AND     u.id                  = _userid
                                                                AND     u.companies_id        = _companyid
                                                                AND     u.sysroles_id         IN (4000)
                                                        )
                                                UNION ALL
                                                SELECT -1
                                        ) 
    ORDER BY 
        CASE WHEN _sortby = "code" AND _sortorder = -1 THEN c.code END DESC,
        CASE WHEN _sortby = "code" THEN c.code END,
        CASE WHEN _sortby = "name" AND _sortorder = -1 THEN c.name END DESC,
        CASE WHEN _sortby = "name" THEN c.name END,
        CASE WHEN _sortby = "aname" AND _sortorder = -1 THEN c1.name END DESC,
        CASE WHEN _sortby = "aname" THEN c1.name END,
        CASE WHEN _sortby = "city" AND _sortorder = -1 THEN a.city END DESC,
        CASE WHEN _sortby = "city" THEN a.city END,
        CASE WHEN _sortby = "phone" AND _sortorder = -1 THEN a.phone1 END DESC,
        CASE WHEN _sortby = "phone" THEN a.phone1 END,
        CASE WHEN _sortby = "balance" AND _sortorder = -1 THEN c.current_balance END DESC,
        CASE WHEN _sortby = "balance" THEN c.current_balance END,
        CASE WHEN _sortby = "overdue" AND _sortorder = -1 THEN c.current_overdue END DESC,
        CASE WHEN _sortby = "overdue" THEN c.current_overdue END,
        CASE WHEN _sortby = "status" AND _sortorder = -1 THEN y.name END DESC,
        CASE WHEN _sortby = "status" THEN y.name END,
        CASE WHEN _sortby IS NULL THEN CONCAT(c.sysstatuses_id, '', c.name) END
    LIMIT offsetrecords, _recordsperpage;
    
    SELECT FOUND_ROWS() INTO _totalrecords;

END;
// 
delimiter ;