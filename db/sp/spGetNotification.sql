DROP PROCEDURE IF EXISTS spGetNotification;

delimiter //

CREATE PROCEDURE spGetNotification
            (
                 OUT errorcode              INT, 
                 OUT errormsg               VARCHAR(512),
                 OUT _totalrecords          INT,
                    _companyid              VARCHAR(32),
                    _userid                 INT,
                    _entityid               INT,
                    _formatid               INT,
                    _typeid                 INT,
                    _statusid               INT,
                    _fromdate               DATETIME,
                    _todate                 DATETIME,
                    _currentpage            INT,
                    _recordsperpage         INT,
                    _sortby                 VARCHAR(32),
                    _sortorder              INT
           )
DETERMINISTIC
READS SQL DATA

main: BEGIN

    DECLARE offsetrecords  INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
        SET errorcode = @errno; 
    END;

    /*DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
         SET errorcode  = -300;
         SET errormsg   = 'Error';
         ROLLBACK;
     END;*/


     SET errorcode  = 0;
     SET errormsg   = 'Success';

    IF _currentpage IS NULL THEN
        SET _currentpage = 1;
    END IF;

    IF _recordsperpage IS NULL THEN
        SET _recordsperpage = 9999999;
    END IF;

    SET offsetrecords = (_currentpage -1 ) *_recordsperpage;


    SELECT SQL_CALC_FOUND_ROWS n.*, c.id as customer_id, c.name as customer_name, 
           nf.name as format_name, nt.name as type_name, ns.name as status_name
    FROM   notifications n 
           INNER JOIN companies c on n.entities_id = c.id
           INNER JOIN sysnotificationformats nf ON n.sysnotificationformats_id = nf.id 
           INNER JOIN sysnotificationtypes nt ON n.sysnotificationtypes_id = nt.id 
           INNER JOIN sysnotificationstatuses ns ON n.sysnotificationstatuses_id = ns.id 
    WHERE  n.companies_id = _companyid and n.parent_id is not null
    AND    CASE WHEN _entityid IS NOT NULL THEN n.entities_id ELSE 1 END = CASE WHEN _entityid IS NOT NULL THEN _entityid ELSE 1 END 
    AND    CASE WHEN _formatid IS NOT NULL THEN n.sysnotificationformats_id ELSE 1 END =  CASE WHEN _formatid IS NOT NULL THEN _formatid ELSE 1 END
    AND    CASE WHEN _typeid IS NOT NULL THEN n.sysnotificationtypes_id ELSE 1 END =  CASE WHEN _typeid IS NOT NULL THEN _typeid ELSE 1 END
    AND    CASE WHEN _statusid IS NOT NULL THEN n.sysnotificationstatuses_id ELSE 1 END =  CASE WHEN _statusid IS NOT NULL THEN _statusid ELSE 1 END
    AND   CASE WHEN _fromdate IS NOT NULL THEN n.created  ELSE 1 END
         >= CASE WHEN _fromdate IS NOT NULL THEN _fromdate ELSE 1 END
    AND   CASE WHEN _todate IS NOT NULL THEN n.created ELSE 1 END 
         < CASE WHEN _todate IS NOT NULL THEN DATE_ADD(_todate, INTERVAL 1 DAY) ELSE 2 END
    AND   CASE WHEN _userid IS NOT NULL THEN n.entities_id ELSE -1 END IN 
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
        CASE WHEN _sortby = "id" AND _sortorder = -1 THEN n.id END DESC,
        CASE WHEN _sortby = "id" THEN n.id END,
        CASE WHEN _sortby = "cname" AND _sortorder = -1 THEN c.name END DESC,
        CASE WHEN _sortby = "cname" THEN c.name END,
        CASE WHEN _sortby = "type_name" AND _sortorder = -1 THEN n.sysnotificationtypes_id END DESC,
        CASE WHEN _sortby = "type_name" THEN n.sysnotificationtypes_id END,
        CASE WHEN _sortby = "format_name" AND _sortorder = -1 THEN n.sysnotificationformats_id END DESC,
        CASE WHEN _sortby = "format_name" THEN n.sysnotificationformats_id END,
        CASE WHEN _sortby = "status_name" AND _sortorder = -1 THEN n.sysnotificationstatuses_id END DESC,
        CASE WHEN _sortby = "status_name" THEN n.sysnotificationstatuses_id END,
        CASE WHEN _sortby = "destination" AND _sortorder = -1 THEN n.destination END DESC,
        CASE WHEN _sortby = "destination" THEN n.destination END,
        CASE WHEN _sortby = "created" AND _sortorder = -1 THEN n.created END DESC,
        CASE WHEN _sortby = "created" THEN n.created END,
        CASE WHEN _sortby IS NULL THEN n.created END DESC
    LIMIT offsetrecords, _recordsperpage;
    
    SELECT FOUND_ROWS() INTO _totalrecords;

END;
// 
delimiter ;