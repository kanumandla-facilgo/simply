DROP PROCEDURE IF EXISTS spAssignProductCategoryMap;

delimiter //

CREATE PROCEDURE spAssignProductCategoryMap
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _productid      INT,
                     _categoryid     INT,
                     _createdby      INT
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
	
	IF (SELECT NOT EXISTS (SELECT 1 FROM categories WHERE companies_id = _companyid AND id = _categoryid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Invalid category ID!';
		LEAVE main;
	
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid AND id = _productid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Invalid product!';
		LEAVE main;
	
	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM product_categories WHERE categories_id = _categoryid AND products_id = _productid)) THEN

		SET errorcode  = -101;
		SET errormsg   = 'Product - category mapping already exists!';
		LEAVE main;
	
	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM categories WHERE id = _categoryid AND is_leaf = 0)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Category is not leaf. Can not assign product.';
		LEAVE main;
	
	END IF;

	INSERT INTO product_categories (products_id, categories_id, created, last_updated)
	VALUES (_productid, _categoryid, now(),now());
	
	-- increment count
	UPDATE categories SET children_count = children_count + 1, last_updated = now() WHERE id = _categoryid AND EXISTS (SELECT 1 FROM products WHERE products.id = _productid AND products.statuses_id = 4600);

	UPDATE products SET category_count = category_count + 1, last_updated = now() WHERE id = _productid;
 
END;
// 
delimiter ;
