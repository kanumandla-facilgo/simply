DROP PROCEDURE IF EXISTS spGetStockBucket;

DELIMITER $$
CREATE  PROCEDURE spGetStockBucket(
                 OUT errorcode		INT, 
                 OUT errormsg		VARCHAR(512),
                     _companyid		INT,
                     _id            INT,
                     _productid  	INT,
                     _issystem      INT,
                     _activeonly    INT,
                     _searchtext    VARCHAR(32)
               )
    READS SQL DATA
    DETERMINISTIC

main: BEGIN

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

    SELECT s.*,
    s.entered_unit_of_measures_id as stock_uom_qty, 
    s.unit_of_measures_id as stock_uom_quote,
    u1.name as stock_uom_qty_name,
    u1.short_name as stock_uom_qty_short_name,
    u2.name as stock_uom_quote_name,
    u2.short_name as stock_uom_quote_short_name
    FROM  stock_buckets s
    INNER JOIN unit_of_measures u1 ON u1.id = s.entered_unit_of_measures_id
    INNER JOIN unit_of_measures u2 ON u2.id = s.unit_of_measures_id
    WHERE  s.companies_id                                                      =  _companyid
	AND    CASE WHEN _productid IS NOT NULL THEN s.products_id ELSE 1 END	   =  CASE WHEN _productid IS NOT NULL THEN _productid ELSE 1 END
    AND    CASE WHEN _id IS NOT NULL THEN s.id ELSE 1 END                      =  CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END
    AND    CASE WHEN _activeonly = 1 THEN s.sysstatuses_id = 4600 AND s.quantity_entered > 0 ELSE 1 = 1 END
	AND    CASE WHEN _issystem IS NOT NULL THEN s.is_system ELSE 1 END                 =  CASE WHEN _issystem IS NOT NULL THEN _issystem ELSE 1 END
	AND    CASE WHEN _searchtext IS NOT NULL AND _searchtext != '..' THEN s.code LIKE CONCAT(_searchtext, '%') ELSE 1 = 1 END
	ORDER BY s.is_system DESC, s.sysstatuses_id ASC, s.code ASC;

END$$
DELIMITER ;
