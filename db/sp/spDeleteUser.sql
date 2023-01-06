DROP PROCEDURE IF EXISTS spDeleteUser;

delimiter //

CREATE PROCEDURE spDeleteUser
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _deluserid      INT,
                     _userid         INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound      INT;
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;
/*
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
		ROLLBACK;
	END;
*/

    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'User is referenced in transactions. Unable to delete user.';
     	ROLLBACK;
     END;

 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

	IF (SELECT NOT EXISTS (SELECT 1 FROM users u WHERE u.id = _deluserid AND u.companies_id = _companyid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'User not found. Cannot delete the user!';
		LEAVE main;

	END IF;

	-- delete the user record
	DELETE FROM users WHERE id = _deluserid;

END;
// 
delimiter ;
