DROP PROCEDURE IF EXISTS spGetAgent;

delimiter //

CREATE PROCEDURE spGetAgent
            (
                OUT errorcode       INT, 
                OUT errormsg        VARCHAR(512),
                    _companyid      INT,
                    _id             INT,
                    _salespersonid  INT,
                    _statusid       INT,
                    _userid         INT,
                    _search_text    VARCHAR(512),
                    _sortby         VARCHAR(32),
                    _sortorder      INT
            )
DETERMINISTIC
READS SQL DATA

main: BEGIN

    DECLARE  l_sysroleid  INT;
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

    IF _userid IS NOT NULL THEN
        SELECT  sysroles_id
        INTO    l_sysroleid
        FROM    users
        WHERE   id  = _userid;
    ELSE
        SET l_sysroleid = -1;
    END IF;

    SELECT      c.*,
                a.id as "home_addressid", a.first_name as "home_first_name", a.last_name as "home_last_name", a.address1 as "home_address1", a.address2 as "home_address2", a.address3 as "home_address3", a.city as "home_city", a.state as "home_state", a.pin as "home_pin", a.phone1 as "home_phone1", a.email1 as "home_email1", a.phone2 as "home_phone2", a.email2 as "home_email2",
                u1.id as user_id, u1.first_name as user_first_name, u1.last_name as user_last_name, u1.login_name as user_login_name, 
                u.first_name as first_name, u.last_name as last_name, u.login_name, u.statuses_id as "salesperson_statusid"
    FROM   companies c
    INNER JOIN addresses a on c.addresses_id = a.id
    INNER JOIN sysstatuses s on c.sysstatuses_id = s.id
    INNER JOIN users u on c.salesperson_id = u.id
    LEFT JOIN users u1 on c.id = u1.companies_id
    WHERE  c.parent_id = CASE WHEN _companyid = 1 THEN c.parent_id ELSE _companyid END
    AND    c.syscompanytypes_id = 4703
    AND    CASE WHEN _id IS NOT NULL THEN c.id ELSE 1 END                          = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END
    AND    CASE WHEN _statusid IS NOT NULL THEN c.sysstatuses_id ELSE 1 END        = CASE WHEN _statusid IS NOT NULL THEN _statusid ELSE 1 END
    AND    CASE WHEN _search_text IS  NULL OR _search_text = '..' THEN   1=1  ELSE  (c.name like CONCAT('%', _search_text, '%')  or c.code like CONCAT(_search_text, '%') or a.phone1 like CONCAT(_search_text, '%'))   END
    AND    CASE WHEN _salespersonid IS NOT NULL THEN c.salesperson_id ELSE 1 END   = CASE WHEN _salespersonid IS NOT NULL THEN _salespersonid ELSE 1 END
    AND    CASE WHEN l_sysroleid IN (4005, 4004) THEN c.id ELSE -1 END IN 
                                        (
                                            SELECT u1.companies_id
                                            FROM   users u1
                                            WHERE  u1.id                = _userid
                                            AND    u1.sysroles_id       = 4005
                                            UNION ALL
                                            SELECT c1.id
                                            FROM   companies c1, users u1
                                            WHERE  u1.id                 = _userid
                                            AND    u1.sysroles_id        = 4004
                                            AND    c1.salesperson_id     = u1.id
                                            AND    c1.syscompanytypes_id = 4703
                                            AND    c1.parent_id          = _companyid
                                            UNION ALL -- super admin for api
                                            SELECT c2.id
                                            FROM   companies c2
                                            WHERE  c2.syscompanytypes_id = 4703
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
        CASE WHEN _sortby = "name" AND _sortorder = -1 THEN c.name END DESC,
        CASE WHEN _sortby = "name" THEN c.name END,
        CASE WHEN _sortby = "code" AND _sortorder = -1 THEN c.code END DESC,
        CASE WHEN _sortby = "code" THEN c.code END,
        CASE WHEN _sortby = "sales_person_name" AND _sortorder = -1 THEN CONCAT(u.first_name, ' ', u.last_name) END DESC,
        CASE WHEN _sortby = "sales_person_name" THEN CONCAT(u.first_name, ' ', u.last_name) END,
        CASE WHEN _sortby = "status" AND _sortorder = -1 THEN s.name END DESC,
        CASE WHEN _sortby = "status" THEN s.name END,
        CASE WHEN _sortby = "phone1" AND _sortorder = -1 THEN a.phone1 END DESC,
        CASE WHEN _sortby = "phone1" THEN a.phone1 END,
        CASE WHEN _sortby = "email1" AND _sortorder = -1 THEN a.email1 END DESC,
        CASE WHEN _sortby = "email1" THEN a.email1 END,
        CASE WHEN _sortby = "city" AND _sortorder = -1 THEN a.city END DESC,
        CASE WHEN _sortby = "city" THEN a.city END,
        CASE WHEN _sortby IS NULL THEN c.name END;

END;
// 
delimiter ;