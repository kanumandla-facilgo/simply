DROP PROCEDURE IF EXISTS spUpdateProduct;

delimiter //

CREATE PROCEDURE spUpdateProduct
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _id             INT,
                     _sku            VARCHAR(32),
                     _internalsku    VARCHAR(32),
                     _name           VARCHAR(256),
                     _accounting_key VARCHAR(512),
                     _description    VARCHAR(1024),
                     _packageqty     DECIMAL(10, 2),
                     _unitprice      DECIMAL(10, 4),
                     _stock          DECIMAL(10, 2),          -- if this value is provided, address fields will be ignored 
                     _onorder        DECIMAL(10, 2),
                     _reorderqty     DECIMAL(10, 2),
                     _reorderlevel   INT,
                     _statusid       INT,
                     _syncstatusid   INT,
                     _uomid          INT,
                     _defaultqtyuomid INT,
                     _isquoteuomrestricted INT,
                     _isqtyuomrestricted INT,
                     _pricelevelid   INT,
                     _pricegroupid   INT,                     
                     _width          DECIMAL(10, 2),
                     _length         DECIMAL(10, 2),
                     _height         DECIMAL(10, 2),
                     _weight         DECIMAL(10, 2),
                     _color          VARCHAR(16),
                     _ishidden       INT,
                     _ishidden_nostock INT,
                     _linkedwith     VARCHAR(32),
                     _imageurl1	     VARCHAR(256),
                     _imageurl2      VARCHAR(256),
                     _imageurl3      VARCHAR(256),
                     _imageurl4      VARCHAR(256),
                     _imageurl5      VARCHAR(256),
					 _isbatchedinventory TINYINT,
					 _istaxable      INT,
					 _defaultsellqty  DECIMAL(12, 4),					 
					 _hsnid          INT,
					 _userid         INT
               )
DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound    INT;
	DECLARE  l_id          INT;
	DECLARE  l_internalsku VARCHAR(32);
	DECLARE  l_orig_uom_id  INT;
	DECLARE  l_orig_is_batched_inventory TINYINT;
	DECLARE  l_orig_alt_uom_id INT;    
 	DECLARE  l_end_uom_id  INT;
 	DECLARE  l_is_hidden  TINYINT;

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
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
     	SET errorcode  = -300;
     	ROLLBACK;
     END;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';

 	SET _sku         = TRIM(UPPER(_sku));
 	SET _internalsku = TRIM(UPPER(_internalsku));

	-- validate Name
	IF (SELECT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid AND name = _name AND products.id <> _id)) THEN
		SET errorcode  = -105;
		SET errormsg   = 'Product with same name already exists.';
		LEAVE main;
	END IF;

	-- validate SKU
	IF (SELECT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid and ((sku = _sku AND id <> _id) OR (sku_internal = _internalsku AND id <> _id)))) THEN
		SET errorcode  = -101;
		SET errormsg   = 'Product with same SKU already exists.';
		LEAVE main;
	END IF;

	-- validate internal SKU
	IF _internalsku IS NULL THEN
	
		SET l_internalsku = left(replace(uuid(), '-', ''), 32);
	
	ELSE
	
		SET l_internalsku = _internalsku;

		IF (SELECT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid  and sku_internal = _internalsku AND id <> _id)) THEN
			SET errorcode  = -110;
			SET errormsg   = 'Product with same internal SKU already exists.';
			LEAVE main;
		END IF;

	END IF;

	SELECT is_batched_inventory, unit_of_measures_id, default_qty_uom_id, is_hidden
	INTO   l_orig_is_batched_inventory, l_orig_uom_id, l_orig_alt_uom_id, l_is_hidden
	FROM   products
	WHERE  id = _id;

	IF l_orig_is_batched_inventory <> _isbatchedinventory THEN
		IF (SELECT EXISTS (SELECT 1 FROM order_details WHERE products_id = _id)) THEN
			SET errorcode  = -1120;
			SET errormsg   = 'Batch option cannot be changed as order exists for same product.';
			LEAVE main;
		END IF;
	END IF;

	IF (_pricelevelid = 4802 OR _pricelevelid = 4801) AND _pricegroupid IS NOT NULL THEN
		SELECT unit_price
		INTO   _unitprice
		FROM   price_groups
		WHERE  price_groups.id = _pricegroupid;
	END IF;

	UPDATE products
		SET					sku                 = _sku, 
							sku_internal        = l_internalsku, 
							name                = _name,  
							description         = _description, 
							package_qty         = _packageqty, 
							unit_price          = _unitprice,
--							units_in_stock      = _stock, 
							units_on_order      = _onorder, 
							reorder_level       = _reorderlevel, 
							reorder_qty         = _reorderqty, 
							statuses_id         = _statusid, 
							syssyncstatuses_id  = _syncstatusid,
							accounting_key      = _accounting_key, 
--							unit_of_measures_id = _uomid,
							syspricelevels_id   = _pricelevelid,
							price_groups_id     = CASE WHEN _pricelevelid = 4802 THEN _pricegroupid ELSE NULL END,
							width               = _width,
							length              = _length,
							height              = _height,
							weight              = _weight,
							is_hidden           = _ishidden,
							is_hidden_no_stock  = _ishidden_nostock,

                     		unit_of_measures_id = _uomid,
                     		default_qty_uom_id  = _defaultqtyuomid,
                     		is_qty_uom_restricted = _isqtyuomrestricted,
                     		is_quote_uom_restricted = _isquoteuomrestricted,

							color               = _color,
							image_url1          = _imageurl1,
							image_url2          = _imageurl2,
							image_url3          = _imageurl3,
							image_url4          = _imageurl4,
							image_url5          = _imageurl5,
							is_batched_inventory= _isbatchedinventory,
							is_taxable          = _istaxable,
							sysproducthsn_id    = _hsnid,
							default_sell_qty    = _defaultsellqty,
							last_updated        = NOW()
	WHERE                   id                  = _id
	AND                     companies_id        = _companyid;

	-- If hidden flag is changed, update children count
	IF l_is_hidden <> _ishidden THEN
		UPDATE categories SET children_count = children_count + (CASE WHEN _ishidden = 0 THEN 1 ELSE -1 END) WHERE id IN (SELECT categories_id FROM product_categories WHERE products_id = _id);
	END IF;

	IF _linkedwith IS NOT NULL THEN

		CALL spAssignProductCategoryMap (errorcode, errormsg, _companyid, _id, _linkedwith, NULL);
	
--		CALL spAssignProductFamilyMap (errorcode, errormsg, _companyid, _linkedwith, _id);

	END IF;

	IF l_orig_uom_id <> _uomid OR l_orig_alt_uom_id <> _defaultqtyuomid THEN

		IF (SELECT EXISTS (SELECT 1 FROM order_details WHERE products_id = _id)) THEN
			SET errorcode  = -1120;
			SET errormsg   = 'Unit of measure cannot be changed as order exists for same product.';
			LEAVE main;
		END IF;

		IF (SELECT EXISTS (SELECT 1 FROM stock_buckets WHERE products_id = _id AND is_system = 0)) THEN
			SET errorcode  = -1121;
			SET errormsg   = 'Unit of measure cannot be changed as stock exists for same product.';
			LEAVE main;
		END IF;

		DELETE FROM stock_journal_details WHERE stock_buckets_id IN (SELECT id FROM stock_buckets WHERE products_id = _id);
		DELETE FROM stock_bucket_details WHERE stock_buckets_id IN (SELECT id FROM stock_buckets WHERE products_id = _id);
		DELETE FROM stock_buckets WHERE products_id = _id;

		UPDATE products p
		INNER JOIN unit_of_measures u ON p.default_qty_uom_id = u.id
		SET    p.stock_unit_of_measures_id     = IFNULL(u.end_uom_id, u.id),
		       p.stock_alt_unit_of_measures_id = u.id
		WHERE  p.id = _id;

		UPDATE products SET stock_quote = 0, stock_qty = 0, stock_in_process_quote = 0, stock_in_process_qty = 0 WHERE id = _id;

		CALL spProductInitStock(errorcode, errormsg, _id, _uomid, _defaultqtyuomid, _userid);

	END IF;

END;
// 
delimiter ;
