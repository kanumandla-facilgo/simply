DROP PROCEDURE IF EXISTS spUpdatePassword;

delimiter //

CREATE PROCEDURE spUpdatePassword
               (
                 OUT errorcode     INT, 
                 OUT errormsg      VARCHAR(512),
                     _companyid    INT,
                     _loginname    VARCHAR(16),
                     _oldpassword  VARCHAR(32),
                     _newpassword  VARCHAR(32)
               )
DETERMINISTIC

main: BEGIN

 DECLARE  l_id         INT;
 DECLARE  l_notfound   INT;
 DECLARE  l_salt       VARCHAR(32);
 DECLARE  l_pwd        VARCHAR(32);


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

 SELECT id 
 INTO   l_id
 FROM   users 
 WHERE  login_name   = _loginname
 AND    password     = MD5(CONCAT('A9074#321', _oldpassword, salt, 'Arihant'))
 AND    companies_id = _companyid
 AND    statuses_id  = 4600;

 IF l_notfound = 1 THEN
 
     SET errorcode = -1011;
     SET errormsg  = 'Invalid Login or Password.';

	 LEAVE main;

 ELSE

	SET l_notfound = 0;

	SET l_salt = left(replace(uuid(), '-', ''), 32);
	SET l_pwd  = MD5(CONCAT('A9074#321', _newpassword, l_salt, 'Arihant'));
	
	UPDATE users
	SET    password     = l_pwd,
	       salt         = l_salt,
	       last_updated = NOW()
	WHERE  id           = l_id;

 END IF;

END;
// 
delimiter ;
