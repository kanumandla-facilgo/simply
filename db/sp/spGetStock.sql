DROP PROCEDURE IF EXISTS spGetStock;

delimiter //

CREATE PROCEDURE spGetStock
               (
                 OUT errorcode		       INT, 
                 OUT errormsg		       VARCHAR(512),
                     _companyid		       INT,
                     _productid            INT,
                     _categoryid           INT,
                     _pricegroupid         INT,
                     _detailflag           TINYINT,
                     _excludezeroflag      TINYINT,
                     _userid               INT
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

 
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET errorcode=200;

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

 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

 	IF _categoryid IS NOT NULL AND _categoryid = 0 THEN
 		SELECT c.id
 		INTO   _categoryid
 		FROM   categories c
 		WHERE  c.companies_id = _companyid
 		AND    c.is_root      = 1;
 	END IF;

 	IF _detailflag = 0 THEN

		SELECT d.entered_unit_of_measures_id as stock_uom_qty, d.unit_of_measures_id as stock_uom_quote, u1.name as stock_uom_qty_name, u2.name as stock_uom_quote_name, u1.short_name as stock_uom_qty_short_name, u2.short_name as stock_uom_quote_short_name,
		       p.stock_in_process_qty, p.stock_in_process_quote, d.quantity_ordered, d.quantity_entered
		FROM 
		(
		SELECT entered_unit_of_measures_id, unit_of_measures_id, SUM(quantity_entered) AS quantity_entered, SUM(quantity_ordered) AS quantity_ordered
	 	FROM   stock_buckets s
	 	WHERE  CASE WHEN _categoryid IS NOT NULL THEN products_id IN 
							 							(
							 								SELECT pc.products_id 
							 							 	FROM   product_categories pc, categories c, categories cl 
							 							 	WHERE  pc.categories_id   = c.id
							 							 	AND    c.companies_id     = _companyid
							 							 	AND    cl.id              = _categoryid
							 							 	AND    CASE WHEN cl.is_root = 0 THEN c.lineage LIKE CONCAT(cl.lineage, _categoryid, '|%')
							 							 	            ELSE                     c.lineage LIKE CONCAT(cl.lineage, '|%') END
							 							 	UNION
							 							 	SELECT pc.products_id
							 							 	FROM   product_categories pc
							 							 	WHERE  pc.categories_id = _categoryid
							 							 ) ELSE 1 = 1 END
	 	AND    CASE WHEN _pricegroupid IS NOT NULL THEN products_id IN 
	 													(
	 														SELECT p.id 
	 														FROM   products p 
	 														WHERE  p.price_groups_id = _pricegroupid
	 													) ELSE 1 =1 END
	 	AND    CASE WHEN _productid IS NOT NULL THEN products_id = _productid ELSE 1 = 1 END
	 	AND    s.sysstatuses_id                                  = 4600
	 	AND    s.companies_id                                    = _companyid
	 	GROUP BY entered_unit_of_measures_id, unit_of_measures_id
	 	HAVING SUM(quantity_entered) != CASE WHEN _excludezeroflag = 1 THEN 0 ELSE -9.94949 END AND SUM(quantity_ordered) != CASE WHEN _excludezeroflag = 1 THEN 0 ELSE -9.94949 END
	 	) d	LEFT OUTER JOIN
	 	(
		SELECT p.default_qty_uom_id, p.unit_of_measures_id, SUM(p.stock_in_process_qty) AS stock_in_process_qty, SUM(p.stock_in_process_quote) AS stock_in_process_quote
		FROM   products p
	 	WHERE  CASE WHEN _categoryid IS NOT NULL THEN p.id IN 
							 							(
							 								SELECT pc.products_id 
							 							 	FROM   product_categories pc, categories c, categories cl 
							 							 	WHERE  pc.categories_id   = c.id
							 							 	AND    c.companies_id     = _companyid
							 							 	AND    cl.id              = _categoryid
							 							 	AND    CASE WHEN cl.is_root = 0 THEN c.lineage LIKE CONCAT(cl.lineage, _categoryid, '|%')
							 							 	            ELSE                     c.lineage LIKE CONCAT(cl.lineage, '|%') END
							 							 	UNION
							 							 	SELECT pc.products_id
							 							 	FROM   product_categories pc
							 							 	WHERE  pc.categories_id = _categoryid
							 							 ) ELSE 1 = 1 END
	 	AND    CASE WHEN _pricegroupid IS NOT NULL THEN p.id IN 
	 													(
	 														SELECT p.id 
	 														FROM   products p 
	 														WHERE  p.price_groups_id = _pricegroupid
	 													) ELSE 1 = 1 END
	 	AND    CASE WHEN _productid IS NOT NULL THEN p.id = _productid ELSE 1 = 1 END
	 	AND    p.companies_id                             = _companyid
	 	GROUP BY p.default_qty_uom_id, p.unit_of_measures_id
		) p ON p.default_qty_uom_id   = d.entered_unit_of_measures_id AND p.unit_of_measures_id  = d.unit_of_measures_id
	    INNER JOIN unit_of_measures u1 ON u1.id                  = d.entered_unit_of_measures_id
	    INNER JOIN unit_of_measures u2 ON u2.id                  = d.unit_of_measures_id;

	ELSE

		SELECT s.id, s.code, s.description, s.products_id, s.sysstatuses_id, s.stock_quote_string, p.name as product_name, p.stock_in_process_qty, p.stock_in_process_quote, 
		       s.entered_unit_of_measures_id as stock_uom_qty, s.unit_of_measures_id as stock_uom_quote, s.quantity_entered, s.quantity_ordered, 
			   u1.name as stock_uom_qty_name, u1.short_name as stock_uom_qty_short_name,
			   u2.name as stock_uom_quote_name, u2.short_name as stock_uom_quote_short_name, p.is_batched_inventory
	 	FROM   stock_buckets s INNER JOIN unit_of_measures u1 ON u1.id = s.entered_unit_of_measures_id
	                           INNER JOIN unit_of_measures u2 ON u2.id = s.unit_of_measures_id
	                           INNER JOIN products p          ON p.id  = s.products_id
	 	WHERE  CASE WHEN _categoryid IS NOT NULL THEN s.products_id IN 
							 							(
							 								SELECT pc.products_id 
							 							 	FROM   product_categories pc, categories c, categories cl 
							 							 	WHERE  pc.categories_id   = c.id
							 							 	AND    c.companies_id     = _companyid
							 							 	AND    cl.id              = _categoryid
							 							 	AND    CASE WHEN cl.is_root = 0 THEN c.lineage LIKE CONCAT(cl.lineage, _categoryid, '|%')
							 							 	            ELSE                     c.lineage LIKE CONCAT(cl.lineage, '|%') END
							 							 	UNION
							 							 	SELECT pc.products_id
							 							 	FROM   product_categories pc
							 							 	WHERE  pc.categories_id = _categoryid
							 							 ) ELSE 1 = 1 END
	 	AND    CASE WHEN _pricegroupid IS NOT NULL THEN s.products_id IN 
	 													(
	 														SELECT p.id 
	 														FROM   products p 
	 														WHERE  p.price_groups_id = _pricegroupid
	 													) ELSE 1 =1 END
	 	AND    CASE WHEN _productid IS NOT NULL THEN s.products_id = _productid ELSE 1 = 1 END
	 	AND    CASE WHEN _excludezeroflag = 1 THEN NOT (s.quantity_ordered = 0 AND s.quantity_entered = 0 AND p.stock_in_process_qty = 0 AND p.stock_in_process_quote = 0) ELSE 1=1 END 
	 	-- AND    CASE WHEN _excludezeroflag = 1 THEN s.quantity_entered != 0 ELSE 1=1 END
	 	-- AND    CASE WHEN _excludezeroflag = 1 THEN p.stock_in_process_qty != 0 ELSE 1=1 END
	 	-- AND    CASE WHEN _excludezeroflag = 1 THEN p.stock_in_process_quote != 0 ELSE 1=1 END
	 	AND    s.sysstatuses_id                        = 4600
	 	AND    s.companies_id                          = _companyid
	 	ORDER BY p.name, s.code;

	END IF;

	IF _categoryid IS NOT NULL THEN
		SELECT name FROM categories c WHERE c.id = _categoryid; 
	END IF;

	IF _pricegroupid IS NOT NULL THEN
		SELECT name FROM price_groups p WHERE p.id = _pricegroupid; 
	END IF;

	IF _productid IS NOT NULL THEN
		SELECT name FROM products p WHERE p.id = _productid; 
	END IF;

END;
// 
delimiter ;
