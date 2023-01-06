DROP PROCEDURE IF EXISTS spCreateCustomerShare;

DELIMITER //

CREATE PROCEDURE spCreateCustomerShare
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _companyid      INT,
                     _name			 VARCHAR(64),
                     _phonenumber	 VARCHAR(62),
                     _documentid     INT,
                     _documenttypeid   INT,
                     _userid	     INT,
                     _expiry_days	INT
               )
DETERMINISTIC

main: BEGIN

	DECLARE  l_salt       VARCHAR(32);
	DECLARE  l_pwd        VARCHAR(32);
 

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;

/*
    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;*/

	SET errorcode  = 0;
	SET errormsg   = 'Success';
	
	-- TODO: make sure role belongs to company type etc.

	SET l_salt = left(replace(uuid(), '-', ''), 32);
	SET l_pwd  = MD5(CONCAT('A9074#321', _documentid, l_salt, 'Arihant'));

 	INSERT INTO customer_shares (document_id, sysdocumenttypes_id, salt, access_code, companies_id, users_id, `name`, phone_number, expired_at, created, last_updated)
	VALUES (_documentid, _documenttypeid, l_salt, l_pwd, _companyid, _userid, _name, _phonenumber, DATE_ADD(now(), INTERVAL _expiry_days DAY), now(), now());

	SELECT LAST_INSERT_ID() INTO id;
END;
// 
DELIMITER ; 