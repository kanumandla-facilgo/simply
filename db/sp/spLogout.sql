DROP PROCEDURE IF EXISTS spLogout;

delimiter //

CREATE PROCEDURE spLogout
               (
                 OUT errorcode  INT, 
                 OUT errormsg   VARCHAR(512),
                     _sessionid VARCHAR(32)
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

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

	UPDATE sessions 
	SET    expiration_at   = NOW(),
		   last_updated    = NOW()
	WHERE  sessions.id     = _sessionid;


END;
// 
delimiter ;
