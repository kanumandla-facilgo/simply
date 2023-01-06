DROP PROCEDURE IF EXISTS spResetUserApiCredentials;

delimiter //

CREATE PROCEDURE spResetUserApiCredentials
               (
                 OUT errorcode    INT, 
                 OUT errormsg     VARCHAR(512),
                 OUT api_key      VARCHAR(16),
                 OUT api_secret   VARCHAR(32),
                     _userid      INT
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

 DECLARE l_notfound INT;
 DECLARE l_loop_max INT;
 DECLARE l_loop_idx INT;

 DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;

 DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
    SET l_notfound=1;

 SET errorcode  = 0;
 SET errormsg   = 'Success';

 SET api_key    = SUBSTRING(MD5(RAND()) FROM 1 FOR 16);
 SET api_secret = REPLACE(UUID(), "-", "");

 SET l_loop_idx = 1;
 SET l_loop_max = 10;

 WHILE l_loop_idx <= l_loop_max DO
 
     UPDATE users
     SET    api_key      = api_key,
            api_secret   = MD5(CONCAT('A9074#321', api_secret, 'Arihant')),
            last_updated = NOW()
     WHERE  id = _userid
     AND    NOT EXISTS (SELECT * FROM (SELECT 1 FROM users u WHERE u.api_key = api_key) tmp);
    
    IF ROW_COUNT() = 1 THEN
        LEAVE main;
    END IF;

     SET l_loop_idx = l_loop_idx + 1;

 END WHILE;

 SET errorcode  = -201;
 SET errormsg   = 'Unable to reset api credentials!';

END;
// 

delimiter ;
