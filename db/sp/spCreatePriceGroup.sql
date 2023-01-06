DROP PROCEDURE IF EXISTS spCreatePriceGroup;

delimiter //

CREATE PROCEDURE spCreatePriceGroup
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _companyid      INT,
                     _name           VARCHAR(32),
                     _description    VARCHAR(256),
                     _pricelevelid   INT,
                     _unitprice      DECIMAL(10, 4),
                     _uomid          INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound       INT;
 
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

 	SET _name = TRIM(_name);
 	INSERT INTO price_groups (name, description, syspricelevels_id, unit_price, unit_of_measures_id, companies_id, created, last_updated)
 	VALUES (CASE WHEN _pricelevelid = 4802 THEN _name ELSE "PRODUCT" END, _description, _pricelevelid, _unitprice, _uomid, _companyid, NOW(), NOW());
 	
 	SET id = LAST_INSERT_ID();
 
END;
// 
delimiter ;
