DROP PROCEDURE IF EXISTS spGetSession;

delimiter //

CREATE PROCEDURE spGetSession
               (
                 OUT errorcode  INT, 
                 OUT errormsg   VARCHAR(512),
                     _sessionid VARCHAR(32),
                     _seconds   INT
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

 	DECLARE  l_notfound   INT;
 	DECLARE  l_userid     INT;
 	DECLARE  l_sysroleid  INT;
 	DECLARE  l_companyid  INT;

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

	SELECT s.users_id
	INTO   l_userid
	FROM   sessions s
	WHERE  s.id            = _sessionid
	AND    s.expiration_at > NOW();

	IF l_notfound = 0 THEN

		SELECT s.id as sessionid,
			   s.syssessiontypes_id as sessiontype,
		       s.last_auth_at, 
		       u.*, 
		       CASE WHEN u.sysroles_id = 4005 OR u.sysroles_id = 4030 OR u.sysroles_id = 4031 THEN c.parent_id ELSE NULL END as parent_id,
		       c.syssubscriptiontemplates_id, c.syssubscriptiontemplates_id, c.name as company_name, c.invoicing_name as company_tax_name
		FROM   sessions s, 
			   users u,
			   companies c
		WHERE  s.id            = _sessionid
		AND    s.users_id      = u.id
		AND    u.companies_id  = c.id;

		SELECT c.id
		INTO   l_companyid
		FROM   companies c, sessions s, users u
		WHERE  c.id  = u.companies_id
		AND    u.id  = s.users_id
		AND    s.id  = _sessionid;

		IF _seconds > 0 THEN

			UPDATE sessions 
			SET    last_auth_at    = SYSDATE(),
				   expiration_at   = DATE_ADD(now(), INTERVAL _seconds SECOND),
				   last_updated    = NOW()
			WHERE  sessions.id     = _sessionid;
            
            UPDATE sessions s
			inner join syssessiontypes st on s.syssessiontypes_id = st.id
			SET     last_auth_at    = SYSDATE(),
					s.expiration_at   = DATE_ADD(now(), INTERVAL st.default_timeout_seconds SECOND),
					s.last_updated    = NOW()
			WHERE  s.id     = _sessionid;

		END IF;

		SELECT  rp.syspermissions_id, rp.value
		FROM    role_permissions rp, users u
		WHERE   u.roles_id = rp.roles_id
		AND     u.id       = l_userid;

		-- get configurations
		CALL spGetConfiguration (errorcode, errormsg, l_companyid, null, null, null, l_userid, null);

		/*
		-- right now returning all the information. Ideally permission id & value are required.
		SELECT	p.id, rp.value, rp.roles_id, p.name, p.description, p.user_default_value, p.syspermissiongroups_id, 
				rp.created, pg.name as group_name 
		FROM	role_permissions rp, syspermissions p, syspermissiongroups pg, users u
		WHERE	rp.roles_id          = u.roles_id 
		AND		rp.syspermissions_id = p.id
		AND		pg.id                = p.syspermissiongroups_id
		AND		u.id                 = l_userid;
		*/

	ELSE

		SET errorcode  = -100;
		SET errormsg   = 'Session not found.';

	END IF;

END;
// 
delimiter ;
