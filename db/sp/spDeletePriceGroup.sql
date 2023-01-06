DROP PROCEDURE IF EXISTS spDeletePriceGroup;

delimiter //

CREATE PROCEDURE spDeletePriceGroup
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _pricegroupid   INT,
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
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;

 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

	IF (SELECT NOT EXISTS (SELECT 1 FROM price_groups p WHERE p.id = _pricegroupid AND p.companies_id = _companyid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Price group not found. Cannot delete the price group!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM products p WHERE p.price_groups_id = _pricegroupid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Product(s) exist for this price group. Cannot delete the price group!';
		LEAVE main;

	END IF;

	-- delete the price lists
	DELETE FROM price_lists WHERE price_groups_id = _pricegroupid;

	-- delete the user record
	DELETE FROM price_groups WHERE id = _pricegroupid;

END;
// 
delimiter ;
