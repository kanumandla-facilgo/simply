DROP PROCEDURE IF EXISTS spCreateThirdPartySystem;

delimiter //

CREATE PROCEDURE spCreateThirdPartySystem
               (
                 OUT errorcode    INT, 
                 OUT errormsg     VARCHAR(512),
                 OUT api_key      VARCHAR(16),
                 OUT api_secret   VARCHAR(32),
                     _name        VARCHAR(64),
                     _description VARCHAR(128),
                     _companyid   INT
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

 DECLARE l_notfound INT;
 DECLARE _typeid INT;

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

 SELECT syscompanytypes_id
 INTO   _typeid
 FROM   companies
 WHERE  id = _companyid;

 IF l_notfound = 1 THEN
  SET errorcode  = -201;
  SET errormsg   = 'Company not found.';
  LEAVE main;
 END IF;

 IF _typeid = 4700 THEN
   SET _typeid = 3400;
 ELSE
   SET _typeid = 3401;
 END IF;

 SET api_key    = SUBSTRING(MD5(RAND()) FROM 1 FOR 16);
 SET api_secret = REPLACE(UUID(), "-", "");

 INSERT INTO third_party_systems (name, description, api_key, api_secret, active_flag, systhirdpartysystemtypes_id, companies_id, created, last_updated)
 VALUES (_name, _description, api_key, api_secret, 1, _typeid, _companyid, NOW(), NOW());

END;
// 

delimiter ;
