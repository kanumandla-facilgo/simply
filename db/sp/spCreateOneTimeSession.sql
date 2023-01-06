DROP PROCEDURE IF EXISTS spCreateOneTimeSession;


DELIMITER //

CREATE  PROCEDURE `spCreateOneTimeSession`(
                  OUT errorcode       INT, 
                  OUT errormsg        VARCHAR(512),
                    _companies_id   INT,
                    _ip        VARCHAR(32),
                    _ipcountry VARCHAR(32),
                    _sessionid      VARCHAR(32),
                    _sessiontypeid  INT
               )
    DETERMINISTIC
main: BEGIN

 DECLARE  l_notfound   INT;
 DECLARE  l_users_id   INT;
 DECLARE  l_salt       VARCHAR(32); 
 DECLARE  l_login_name VARCHAR(32);
 DECLARE  _password        VARCHAR(32);
 DECLARE  l_pwd        VARCHAR(32);
 DECLARE  l_sessionid  VARCHAR(32);
  
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
	
     Set l_notfound = 0;
     
	SELECT id into l_users_id
    from users
    where companies_id = _companies_id;
    
    if l_users_id is NULL Then
		
        SET l_salt = left(replace(uuid(), '-', ''), 32);
        SET l_login_name = left(replace(uuid(), '-', ''), 16);
		SET _password = left(replace(uuid(), '-', ''), 16);
		SET l_pwd  = MD5(CONCAT('A9074#321', _password, l_salt, 'Arihant'));
        
		INSERT INTO users (first_name, last_name, middle_name, login_name, password, salt, companies_id, addresses_id, statuses_id, sysroles_id, roles_id, is_random_generated, created, last_updated)
		select a.first_name, a.last_name, '' as middle_name, l_login_name as login_name, l_pwd as password, l_salt,
				_companies_id, c.addresses_id, 4600 as statuses_id, r.sysroles_id, r.id, 1, NOW(), NOW() from companies c
		 inner join addresses a on c.addresses_id = a.id
		 inner join roles r on c.id = r.companies_id
		 where c.id = _companies_id and r.sysroles_id = 4030;
		
		SELECT LAST_INSERT_ID() INTO l_users_id;
        
        SET l_notfound = 1;
	
    ELSE
    
		SET l_notfound = 0;
    
		IF _sessionid IS NOT NULL THEN
			SELECT id
			INTO   l_sessionid
			FROM   sessions
			WHERE  id            = _sessionid
			AND    expiration_at > SYSDATE();
		END IF;
    
    END IF;
    
    IF _sessionid IS NULL OR l_notfound = 1 THEN
			SET l_notfound = 1;
			SET _sessionid = REPLACE(UUID(), "-", "");
	END IF;
    
    IF l_notfound = 1 THEN

        INSERT INTO sessions (id, users_id, ipaddress, last_auth_at, expiration_at, ipcountry, syssessiontypes_id, created, last_updated)
        VALUES (_sessionid, l_users_id, _ip, NOW(), DATE_ADD(NOW(), INTERVAL 60 SECOND), _ipcountry, _sessiontypeid, SYSDATE(), SYSDATE());

    ELSE

        UPDATE  sessions
        SET     last_auth_at = SYSDATE(),
                users_id     = l_users_id,
                last_updated = SYSDATE()
        WHERE   id           = _sessionid;

    END IF;

    CALL spGetSession (errorcode, errormsg, _sessionid, 60);
    
END
//
DELIMITER ;