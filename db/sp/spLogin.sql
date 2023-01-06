DROP PROCEDURE IF EXISTS spLogin;

delimiter //

CREATE PROCEDURE spLogin
               (
                 OUT errorcode        INT, 
                 OUT errormsg         VARCHAR(512),
                     _login           VARCHAR(16),
                     _password        VARCHAR(32),
                     _apikey          VARCHAR(16),
                     _apisecret       VARCHAR(32),
                     _ip              VARCHAR(32),
                     _ipcountry       VARCHAR(32),
                     _sessionid       VARCHAR(32),
                     _timeout         INT,
                     _session_type_id INT
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

 DECLARE  l_id         INT;
 DECLARE  l_notfound   INT;
 DECLARE  l_sessionid  VARCHAR(32);

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

 IF _login IS NOT NULL AND _password IS NOT NULL THEN
 
     SELECT u.id 
     INTO   l_id
     FROM   users u, companies c 
     WHERE  u.login_name     = _login
     AND    u.password       = MD5(CONCAT('A9074#321', _password, salt, 'Arihant'))
     AND    u.statuses_id    = 4600
     AND    u.companies_id   = c.id
     AND    c.sysstatuses_id = 4600;

 ELSE
     SELECT u.id 
     INTO   l_id
     FROM   users u, companies c 
     WHERE  u.api_key        = _apikey
     AND    u.api_secret     = MD5(CONCAT('A9074#321', _apisecret, 'Arihant'))
     AND    u.statuses_id    = 4600
     AND    u.companies_id   = c.id
     AND    c.sysstatuses_id = 4600;

 END IF;

 IF l_notfound = 1 THEN
 
    IF _login IS NOT NULL AND _password IS NOT NULL THEN
        SET errorcode = -1011;
        SET errormsg  = 'Invalid Login or Password.';
    ELSE
        SET errorcode = -1011;
        SET errormsg  = 'Invalid API credentials.';
    END IF;

	 -- hack to return blank rows
	 SELECT *
	 FROM   sessions s, users u
	 WHERE  s.id       = _sessionid
	 AND    s.users_id = u.id
	 AND    1          = 2;
    
	 LEAVE main;

 ELSE

	SET l_notfound = 0;

	IF _sessionid IS NOT NULL THEN
		SELECT id
		INTO   l_sessionid
		FROM   sessions
		WHERE  id            = _sessionid
		AND    expiration_at > SYSDATE();
	END IF;
	
	IF _sessionid IS NULL OR l_notfound = 1 THEN
		SET l_notfound = 1;
		SET _sessionid = REPLACE(UUID(), "-", "");
	END IF;

    IF l_notfound = 1 THEN

        INSERT INTO sessions (id, users_id, ipaddress, last_auth_at, expiration_at, ipcountry, syssessiontypes_id, created, last_updated)
        VALUES (_sessionid, l_id, _ip, NOW(), DATE_ADD(NOW(), INTERVAL 60 SECOND), _ipcountry, _session_type_id, SYSDATE(), SYSDATE());

    ELSE

        UPDATE  sessions
        SET     last_auth_at = SYSDATE(),
                users_id     = l_id,
                last_updated = SYSDATE()
        WHERE   id           = _sessionid;

    END IF;

    CALL spGetSession (errorcode, errormsg, _sessionid, 60);

 END IF;


END;
// 
delimiter ;
