DROP PROCEDURE IF EXISTS spDeleteProductFamilyMap;

delimiter //

CREATE PROCEDURE spDeleteProductFamilyMap
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _masterid       INT,
                     _productid      INT
               )
DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound   INT;
 
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

	IF (SELECT NOT EXISTS (SELECT 1 FROM product_families WHERE master_id = _masterid AND products_id = _productid)) THEN

		SET errorcode  = -101;
		SET errormsg   = 'Product - category combination does not exist!';
		LEAVE main;

	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid AND id = _productid AND sysproducttypes_id = 4901)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Invalid product!';
		LEAVE main;
	
	END IF;

	-- delete 
	DELETE FROM product_families WHERE products_id = _productid AND master_id = _masterid;

	-- decrement count
	UPDATE products SET family_size = family_size - 1 WHERE id IN (_masterid, _productid);

END;
// 
delimiter ;
