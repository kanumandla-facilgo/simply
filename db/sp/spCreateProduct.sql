DROP PROCEDURE IF EXISTS spCreateProduct;

delimiter //

CREATE PROCEDURE spCreateProduct
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id              INT,
                     _companyid      INT,
                     _sku            VARCHAR(32),
                     _internalsku    VARCHAR(32),
                     _name           VARCHAR(256),
                     _description    VARCHAR(1024),
                     _packageqty     DECIMAL(10, 2),
                     _unitprice      DECIMAL(10, 4),
                     _stock          DECIMAL(10, 2),          -- if this value is provided, address fields will be ignored 
                     _onorder        DECIMAL(10, 2),
                     _reorderqty     DECIMAL(10, 2),
                     _reorderlevel   INT,
                     _categoryid     INT,
                     _uomid          INT,
                     _pricelevelid   INT,
                     _pricegroupid   INT,                     
                     _width          DECIMAL(10, 2),
                     _length         DECIMAL(10, 2),
                     _height         DECIMAL(10, 2),
                     _weight         DECIMAL(10, 2),
                     _color          VARCHAR(16),
                     _producttypeid  INT,
                     _isfamily       INT,
                     _ishidden       INT,
                     _ishidden_nostock INT,
                     _istaxable      INT,
                     _defaultqtyuomid INT,
                     _isquoteuomrestricted INT,
                     _isqtyuomrestricted INT,
					 _isbatchedinventory TINYINT,
					 _defaultsellqty DECIMAL(12, 4),
					 _hsnid          INT,
                     _imageurl1	     VARCHAR(256),
                     _imageurl2      VARCHAR(256),
                     _imageurl3      VARCHAR(256),
                     _imageurl4      VARCHAR(256),
                     _imageurl5      VARCHAR(256),
                     _userid         INT
               )
DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound                      INT;
	DECLARE  l_id                            INT;
	DECLARE  l_internalsku                   VARCHAR(32);
	DECLARE  l_stock_unit_of_measures_id     INT;
	DECLARE  l_stock_alt_unit_of_measures_id INT;
 
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

	-- validate Name
	IF (SELECT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid AND name = _name)) THEN
		SET errorcode  = -105;
		SET errormsg   = 'Product with same name already exists.';
		LEAVE main;
	END IF;

    -- get the next product code
    CALL spGetNextSequence(errorcode, errormsg, _sku, _companyid, 20080, 20083, 20081, TRIM(UPPER(_sku)));

	-- validate SKU
	IF (SELECT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid AND sku = lower(_sku))) THEN
		SET errorcode  = -101;
		SET errormsg   = 'Product with same SKU already exists.';
		LEAVE main;
	END IF;

	-- validate internal SKU
	IF _internalsku IS NULL THEN
	
		SET l_internalsku = lower(left(replace(uuid(), '-', ''), 32));
	
	ELSE
	
		SET l_internalsku = _internalsku;

		IF (SELECT EXISTS (SELECT 1 FROM products WHERE companies_id = _companyid AND sku_internal = lower(_internalsku))) THEN
			SET errorcode  = -110;
			SET errormsg   = 'Product with same internal SKU already exists.';
			LEAVE main;
		END IF;

	END IF;

	-- if price level is flat, create 4800
	IF _pricelevelid = 4800 OR _pricelevelid = 4801 THEN
		CALL spCreatePriceGroup (errorcode, errormsg, l_id, _companyid, concat('PRODUCT ', _pricelevelid), 'PRODUCT', _pricelevelid, _unitprice, _uomid);
	ELSE
		SET l_id = _pricegroupid;
	END IF;

	IF (_pricelevelid = 4802 OR _pricelevelid = 4801) AND _pricegroupid IS NOT NULL THEN
		SELECT unit_price
		INTO   _unitprice
		FROM   price_groups
		WHERE  price_groups.id = _pricegroupid;
	END IF;

	SELECT IFNULL(u.end_uom_id, u.id), u.id
	INTO  l_stock_unit_of_measures_id, l_stock_alt_unit_of_measures_id
	FROM unit_of_measures u
	WHERE u.id = _defaultqtyuomid;

	INSERT INTO products (
							companies_id,
							sku, 
							sku_internal, 
							name, 
							description, 
							package_qty, 
							unit_price, 
							stock_qty, 
							units_on_order, 
							reorder_level, 
							reorder_qty, 
							categories_id, 
							statuses_id, 
							unit_of_measures_id,
							syspricelevels_id,
							price_groups_id,
							width,
							length,
							height,
							weight,
							is_family,
							is_hidden,
							is_hidden_no_stock,
							is_taxable,
							default_qty_uom_id,
							is_qty_uom_restricted,
							is_quote_uom_restricted,
							stock_unit_of_measures_id,
							stock_alt_unit_of_measures_id,
							color,
							sysproducttypes_id,
							family_size,
							category_count,
							image_url1,
							image_url2,
							image_url3,
							image_url4,
							image_url5,
							is_batched_inventory,
							default_sell_qty,
							sysproducthsn_id,
							syssyncstatuses_id,
							created,
							last_updated)
	VALUES (_companyid, lower(_sku), lower(l_internalsku), _name, _description, _packageqty, _unitprice, _stock, _onorder, _reorderlevel,
	_reorderqty, _categoryid, 4600, _uomid, _pricelevelid, l_id, _width, _length, _height, _weight, _isfamily, _ishidden, _ishidden_nostock, CASE WHEN _istaxable IS NULL THEN 0 ELSE 1 END, 
	_defaultqtyuomid, CASE WHEN _isqtyuomrestricted IS NULL THEN 0 ELSE 1 END, CASE WHEN _isquoteuomrestricted IS NULL THEN 0 ELSE 1 END,
	l_stock_unit_of_measures_id, l_stock_alt_unit_of_measures_id, _color, _producttypeid, 0, 0, _imageurl1, _imageurl2,
	_imageurl3, _imageurl4, _imageurl5, _isbatchedinventory, _defaultsellqty, _hsnid, 4100, NOW(), NOW());

	SELECT LAST_INSERT_ID() INTO id;
/*
	-- insert unit conversion
	IF l_id IS NOT NULL THEN
		INSERT INTO unit_conversions (unit_of_measures_id, products_id, from_uom_id, from_qty, to_uom_id, to_qty, created, last_updated)
		VALUES (l_id, id, _uomid, 1, _uomid, 1, now(), now());

		-- uom conversion detail
		CALL spCreateUpdateUOMConversionDetail (errorcode, errormsg, l_id, _uomid);
 	END IF;
*/

	CALL spAssignProductCategoryMap (errorcode, errormsg, _companyid, id, _categoryid, NULL);

	CALL spProductInitStock(errorcode, errormsg, id, _uomid, _defaultqtyuomid, _userid);

END;
// 
delimiter ;
