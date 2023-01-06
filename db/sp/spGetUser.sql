DROP PROCEDURE IF EXISTS spGetUser;

delimiter //

CREATE PROCEDURE spGetUser
            (
                OUT errorcode       INT, 
                OUT errormsg        VARCHAR(512),
                    _companyid      VARCHAR(32),
                    _id             INT,
                    _roleid         INT,
                    _sysroleid      INT,
                    _statusid       INT,
                    _loginname      VARCHAR(16),
                    _loggedInUserId INT,
                    _pagenumber     INT,
                    _pagesize       INT,
                    _sortby         VARCHAR(32),
                    _sortorder      INT
            )
DETERMINISTIC
READS SQL DATA

main: BEGIN

    DECLARE l_offset INT;
    DECLARE l_loggedinusersysroleid INT;
    DECLARE l_flag INT;
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

    SET l_flag     = 0;

    IF _pagesize IS NULL THEN
        SET _pagesize = 9999999;
    END IF;

    IF _pagenumber IS NULL THEN
        SET l_offset = 0;
    ELSE
        SET l_offset = (_pagenumber - 1) * _pagesize;
    END IF;
    
    SELECT sysroles_id
    INTO   l_loggedinusersysroleid
    FROM   users u 
    WHERE  u.id = _loggedInUserId;
    
    IF l_loggedinusersysroleid = _sysroleid THEN
        SET l_flag = 1;    
    END IF;

    SELECT a.id as addressid, a.*, u.*, r.name as rolename
    FROM   users u, addresses a, roles r, sysstatuses s
    WHERE  u.companies_id                                                    = _companyid
    AND    u.addresses_id                                                    = a.id
    AND    u.roles_id                                                        = r.id
    AND    u.statuses_id                                                     = s.id
    AND    CASE WHEN _roleid IS NOT NULL THEN u.roles_id ELSE 1 END          = CASE WHEN _roleid IS NOT NULL THEN _roleid ELSE 1 END
    AND    CASE WHEN _id IS NOT NULL THEN u.id ELSE 1 END                    = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END
    AND    CASE WHEN _statusid IS NOT NULL THEN u.statuses_id ELSE 1 END  = CASE WHEN _statusid IS NOT NULL THEN _statusid ELSE 1 END
    AND    CASE WHEN _sysroleid IS NOT NULL THEN r.sysroles_id ELSE 1 END    = CASE WHEN _sysroleid IS NOT NULL THEN _sysroleid ELSE 1 END
    AND    CASE WHEN _loginname IS NOT NULL THEN u.login_name ELSE 1 END = CASE WHEN _loginname IS NOT NULL THEN LOWER(_loginname) ELSE 1 END
    AND    CASE WHEN l_flag = 1 THEN u.id ELSE 1 END = CASE WHEN l_flag = 1 THEN _loggedInUserId ELSE 1 END
    ORDER BY 
        CASE WHEN _sortby = "role" AND _sortorder = -1 THEN r.name END DESC,
        CASE WHEN _sortby = "role" THEN r.name END,
        CASE WHEN _sortby = "name" AND _sortorder = -1 THEN CONCAT(u.first_name, ' ', u.last_name) END DESC,
        CASE WHEN _sortby = "name" THEN CONCAT(u.first_name, ' ', u.last_name) END,
        CASE WHEN _sortby = "status" AND _sortorder = -1 THEN s.name END DESC,
        CASE WHEN _sortby = "status" THEN s.name END,
        CASE WHEN _sortby IS NULL THEN CONCAT(u.first_name, ' ', u.last_name) END
    LIMIT _pagesize OFFSET l_offset;


END;
// 
delimiter ;
