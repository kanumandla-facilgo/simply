DROP PROCEDURE IF EXISTS spDeleteProduct;

delimiter //

CREATE PROCEDURE spDeleteProduct
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _productid      INT,
                     _userid         INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound      INT;
 	DECLARE  l_categoryid    INT;
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
		ROLLBACK;
	END;

/*
    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;
*/
 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

	IF (SELECT NOT EXISTS (SELECT 1 FROM products p WHERE p.id = _productid AND p.companies_id = _companyid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Product not found. Cannot delete the product!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM order_details d WHERE d.products_id = _productid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Order(s) exist for this product. Cannot delete the product!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM packing_slip_details d WHERE d.products_id = _productid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Packing slip(s) exist for this product. Cannot delete the product!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM product_families d WHERE d.products_id = _productid)) THEN

		SET errorcode  = -203;
		SET errormsg   = 'Product family exists for this product. Cannot delete the product!';
		LEAVE main;

	END IF;

	-- IF (SELECT EXISTS (SELECT 1 FROM price_lists p WHERE p.products_id = _productid)) THEN

	-- 	SET errorcode  = -204;
	-- 	SET errormsg   = 'Price list exists for this product. Cannot delete the product!';
	-- 	LEAVE main;

	-- END IF;

	IF (SELECT EXISTS (SELECT 1 FROM stock_journal j WHERE j.products_id = _productid)) THEN

		SET errorcode  = -205;
		SET errormsg   = 'Stock found for this product. Cannot delete the product!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM stock_buckets b WHERE b.products_id = _productid AND b.is_system = 0)) THEN

		SET errorcode  = -206;
		SET errormsg   = 'Stock batches found for this product. Cannot delete the product!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM product_categories p WHERE p.products_id = _productid GROUP by p.products_id HAVING count(1) > 1)) THEN

		SET errorcode  = -207;
		SET errormsg   = 'Multiple categories are linked with this product. Product must be having only one category in order to delete the product!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM unit_conversions u WHERE u.products_id = _productid)) THEN

		SET errorcode  = -208;
		SET errormsg   = 'Unit conversion found for this product. Cannot delete the product!';
		LEAVE main;

	END IF;

	-- delete product category map
	SELECT categories_id
	INTO   l_categoryid
	FROM   product_categories
	WHERE  products_id = _productid;

	IF l_notfound = 0 THEN

		CALL spDeleteProductCategoryMap (errorcode, errormsg, _companyid, _productid, l_categoryid, _userid, 1);

		IF errorcode != 0 THEN
			LEAVE main;
		END IF;

	ELSE

		SET l_notfound = 0;

	END IF;

	-- delete price list if variables
	DELETE FROM price_lists WHERE products_id = _productid;

	-- delete stock buckets
	DELETE FROM stock_bucket_details WHERE stock_buckets_id IN (SELECT id FROM stock_buckets WHERE products_id = _productid);

	DELETE FROM stock_buckets WHERE products_id = _productid;

	-- delete the agent company record
	DELETE FROM products WHERE id = _productid;

END;
// 
delimiter ;
