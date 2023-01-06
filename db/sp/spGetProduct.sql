DROP PROCEDURE IF EXISTS spGetProduct;

DELIMITER $$
CREATE  PROCEDURE spGetProduct(
                 OUT errorcode		INT, 
                 OUT errormsg		VARCHAR(512),
                     _companyid		VARCHAR(32),
                     _id            INT,
                     _categoryid  	INT,
                     _sku           VARCHAR(32),
                     _sku_internal  VARCHAR(32),
                     _deepFlag      INT,
                     _activeOnly    INT ,
                     _stockedOnly   INT,
                     _show_new_for_x_days INT,
                     _search_text   VARCHAR(512),
                     _customerid    INT,
                     _pricegroupid  INT,
                     _sync_status_id INT
               )
    READS SQL DATA
    DETERMINISTIC

main: BEGIN

    DECLARE  _companytypeid INT;		

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

    IF _customerid IS NOT NULL then 
        SELECT companytypes_id 
        INTO   _companytypeid 
        FROM   companies 
        WHERE  id = _customerid;
    END IF;

    SELECT p.*, g.name as price_groups_name, m.name as uom_name, m.short_name as uom_short_name, m.description as uom_description,
    CASE  WHEN pl.unit_price IS NOT NULL THEN pl.unit_price ELSE p.unit_price END unit_price,
    s.entered_unit_of_measures_id as stock_uom_qty, 
    s.unit_of_measures_id as stock_uom_quote,
    u1.name as stock_uom_qty_name,
    u1.short_name as stock_uom_qty_short_name,
    u2.name as stock_uom_quote_name,
    u2.short_name as stock_uom_quote_short_name,
    c.to_uom_id as stock_uom_batch,
    u3.name as stock_uom_batch_name,
    u3.short_name as stock_uom_batch_short_name,
    c.to_qty as stock_batch_pcs,
    t.id as hsn_id,
    t.name as hsn_name,
    t.code as hsn_code,
    t.description as hsn_description,
    t.short_code as hsn_short_code,
    hd.tax_percent_gst,
    hd.tax_percent_cess
    FROM  products p
    INNER JOIN sysproducthsn t ON t.id = p.sysproducthsn_id
    INNER JOIN sysproducthsn_details hd ON hd.sysproducthsn_id = t.id
    INNER JOIN stock_buckets s ON s.products_id = p.id AND s.is_system = 1
    INNER JOIN unit_of_measures u1 ON u1.id = s.entered_unit_of_measures_id
    INNER JOIN unit_of_measures u2 ON u2.id = s.unit_of_measures_id
    LEFT JOIN price_lists pl ON pl.company_types_id = _companytypeid AND p.price_groups_id =  pl.price_groups_id
    INNER JOIN unit_of_measures m ON  m.id  = case when pl.unit_of_measures_id is null then p.unit_of_measures_id else pl.unit_of_measures_id  end
    LEFT OUTER JOIN price_groups g ON p.price_groups_id = g.id
    LEFT OUTER JOIN unit_conversions c ON c.is_batched_inventory = 1 AND p.default_qty_uom_id = c.unit_of_measures_id
    LEFT OUTER JOIN unit_of_measures u3 on u3.id = c.to_uom_id
    WHERE  p.companies_id                                                      =  _companyid
    AND    CASE WHEN _id IS NOT NULL THEN p.id ELSE 1 END                      =  CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END
    AND    CASE WHEN _sku IS NOT NULL THEN p.sku ELSE 1 END                    =  CASE WHEN _sku IS NOT NULL THEN _sku ELSE 1 END
    AND    CASE WHEN _sku_internal IS NOT NULL THEN p.sku_internal ELSE 1 END  =  CASE WHEN _sku_internal IS NOT NULL THEN _sku_internal ELSE 1 END
    AND    CASE WHEN _activeonly = 1 THEN p.statuses_id ELSE 1 END             =  CASE WHEN _activeonly = 1 THEN 4600 ELSE 1 END
    AND    CASE WHEN _stockedOnly = 1 THEN p.is_hidden_no_stock = 0 OR (p.stock_quote - p.stock_in_process_quote > 0 AND p.stock_qty - p.stock_in_process_qty > 0) OR p.created > DATE_ADD(now(), interval _show_new_for_x_days * -1 day) ELSE 1 = 1 END
    AND    CASE WHEN _pricegroupid IS NOT NULL THEN p.price_groups_id ELSE 1 END  =  CASE WHEN _pricegroupid IS NOT NULL THEN _pricegroupid ELSE 1 END
    AND    CASE WHEN _sync_status_id IS NULL THEN 1 = 1 ELSE p.syssyncstatuses_id = _sync_status_id END
--    AND	   CASE WHEN _search_text IS  NULL THEN   1=1  ELSE  (p.name like _search_text  or p.sku like _search_text or p.description like _search_text)   END
    AND	   CASE WHEN _search_text IS  NULL OR _search_text = '..' THEN   1=1  ELSE  (p.name like CONCAT('%', _search_text, '%')  or p.sku like CONCAT(_search_text, '%'))   END
    AND    EXISTS (
                   SELECT 1 
                   FROM   product_categories pc 
                   WHERE  p.id = pc.products_id 
                   AND    CASE WHEN _categoryid IS NOT NULL THEN pc.categories_id ELSE 1 END = CASE WHEN _categoryid IS NOT NULL THEN _categoryid ELSE 1 END
                   )
    AND    EXISTS (
                   SELECT 1 
                   FROM   product_categories pc, categories c, categories cl 
                   WHERE  p.id = pc.products_id 
                   AND    pc.categories_id = c.id 
                   AND    cl.id = c.id 
                   AND    CASE WHEN _deepFlag = 1 THEN cl.lineage ELSE 'A' END LIKE CASE WHEN _deepFlag = 1 THEN concat('%|', _categoryid, '|%') ELSE 'A' END
				  )
    AND     NOW() BETWEEN hd.activation_start_date AND IFNULL(hd.activation_end_date, DATE_ADD(NOW(), INTERVAL 5 MINUTE)) 
    AND     CASE  WHEN pl.unit_price IS NOT NULL THEN pl.unit_price ELSE p.unit_price END BETWEEN hd.amount_min AND IFNULL(hd.amount_max, 1000000000) 
	ORDER BY p.statuses_id, p.name;
END$$
DELIMITER ;
