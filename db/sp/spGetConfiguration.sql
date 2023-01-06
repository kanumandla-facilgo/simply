DROP PROCEDURE IF EXISTS spGetConfiguration;

delimiter //

CREATE PROCEDURE spGetConfiguration
               (
                 OUT errorcode      INT, 
                 OUT errormsg       VARCHAR(512),
                     _companyid     INT,
                     _id            INT,
                     _sysid         INT,
                     _systypeid     INT,
                     _userid        INT,
                     _sysconfigname varchar(128)
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

    DECLARE  l_sysroleid  INT;
    DECLARE  l_pattern    INT;
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
     END;

    SET errorcode  = 0;
    SET errormsg   = 'Success';

    IF _userid IS NOT NULL AND _userid > 0 THEN
        SELECT  u.sysroles_id
        INTO    l_sysroleid
        FROM    users u
        WHERE   u.id  = _userid;
    ELSEIF _userid IS NOT NULL AND _userid = 0 THEN    -- this will be called internally
        SET l_sysroleid = 4002;
    ELSE
        SET errorcode = -201;
        SET errormsg = 'Invalid User!';
        LEAVE main;
    END IF;

    IF l_sysroleid = 4005 OR l_sysroleid = 4030 OR l_sysroleid = 4031 THEN

        SELECT c.parent_id
        INTO   _companyid
        FROM   companies c
        WHERE  c.id = _companyid;

    END IF;

    IF l_sysroleid = 4000 THEN 
        SET l_pattern = 1;
    ELSEIF l_sysroleid = 4001 THEN
        SET l_pattern = 2;
    ELSEIF l_sysroleid = 4002 THEN
        SET l_pattern = 4;
    ELSEIF l_sysroleid = 4003 THEN
        SET l_pattern = 8;
    ELSEIF l_sysroleid = 4004 THEN
        SET l_pattern = 16;
    ELSEIF l_sysroleid = 4005 THEN
        SET l_pattern = 32;
    ELSEIF l_sysroleid = 4030 THEN
        SET l_pattern = 64;
    ELSEIF l_sysroleid = 4031 THEN
        SET l_pattern = 128;
    ELSE
        SET l_pattern = 0;
    END IF;

    -- todo: this l_sysroleid logic needs to change. For time being, this is the one.
    SELECT      c.*,
                s.name,
                s.description
    FROM   configurations c, sysconfigurations s
    WHERE  c.companies_id                 = _companyid
    AND    c.sysconfigurations_id         = s.id
    AND    CASE WHEN l_sysroleid IN (4000, 4001, 4002) THEN s.edit_flag IN (1, 0) ELSE s.display_bits & l_pattern = l_pattern END
    AND    CASE WHEN l_sysroleid IN (4000) THEN 1 = 1 ELSE s.root_edit_flag = 0 END
    AND    CASE WHEN _id IS NOT NULL THEN c.id = _id ELSE 1 = 1 END
    AND    CASE WHEN _sysid IS NOT NULL THEN c.sysconfigurations_id = _sysid ELSE 1 = 1 END
    AND    CASE WHEN _systypeid IS NOT NULL THEN s.sysconfigurationtypes_id = _systypeid ELSE 1 = 1 END
    AND    CASE WHEN _sysconfigname IS NOT NULL THEN s.name = _sysconfigname ELSE 1 = 1 END
    ORDER BY s.name;

END;
// 
delimiter ;