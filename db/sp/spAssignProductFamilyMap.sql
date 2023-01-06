DROP PROCEDURE IF EXISTS spAssignProductFamilyMap;

delimiter //

CREATE PROCEDURE spAssignProductFamilyMap
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _childsku       VARCHAR(32),
                     _masterid       INT
               )
DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound   INT;
	DECLARE  l_productid  INT;
 
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
	
	IF (SELECT NOT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid AND id = _masterid AND sysproducttypes_id = 4900)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Invalid Kit (Set) ID or master product not found!';
		LEAVE main;
	
	END IF;
	
	SELECT id 
	INTO   l_productid
	FROM   products 
	WHERE  companies_id       = _companyid 
	AND    sku                = _childsku 
	AND    sysproducttypes_id = 4901;

	IF (l_notfound = 1) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Invalid product!';
		LEAVE main;
	
	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM product_families WHERE master_id = _masterid AND products_id = l_productid)) THEN

		SET errorcode  = -101;
		SET errormsg   = 'Product - kit (set) mapping already exists!';
		LEAVE main;
	
	END IF;

	INSERT INTO product_families (products_id, master_id, created, last_updated)
	VALUES (l_productid, _masterid, now(), now());

	-- increment count
	UPDATE products SET family_size = family_size + 1, last_updated = now() WHERE id IN (_masterid, l_productid);

END;
// 
delimiter ;
