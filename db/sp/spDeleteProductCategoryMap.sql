DROP PROCEDURE IF EXISTS spDeleteProductCategoryMap;

delimiter //

CREATE PROCEDURE spDeleteProductCategoryMap
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _productid      INT,
                     _categoryid     INT,
                     _createdby      INT,
                     _forceflag      INT
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

	IF (SELECT NOT EXISTS (SELECT 1 FROM product_categories WHERE categories_id = _categoryid AND products_id = _productid)) THEN

		SET errorcode  = -101;
		SET errormsg   = 'Product - category combination does not exist!';
		LEAVE main;
	
	END IF;

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

	IF _forceflag = 0 THEN
		IF (SELECT NOT EXISTS (SELECT 1 FROM product_categories WHERE categories_id <> _categoryid AND products_id = _productid)) THEN

			SET errorcode  = -250;
			SET errormsg   = "Product has only one category linked. Therefore, can't delink.";
			LEAVE main;
		
		END IF;
	END IF;

	DELETE FROM product_categories WHERE products_id = _productid AND categories_id = _categoryid;

	-- decrement count
	UPDATE categories SET children_count = children_count - 1 WHERE id = _categoryid AND EXISTS (SELECT 1 FROM products WHERE products.id = _productid AND products.statuses_id = 4600);
	UPDATE products SET category_count = category_count - 1 WHERE id = _productid;

	-- if primary category is delinked, update product record with new categoryid and price category id
	IF (SELECT EXISTS (SELECT categories_id FROM product_categories WHERE products_id = _productid )) THEN

		UPDATE products 
		SET    categories_id = (SELECT categories_id 
		                        FROM   product_categories 
		                        WHERE  products_id = _productid 
		                        LIMIT 1
		                        )
		WHERE id            = _productid 
		AND   categories_id = _categoryid;

	END IF;

END;
// 
delimiter ;
