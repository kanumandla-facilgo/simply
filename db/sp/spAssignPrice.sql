DROP PROCEDURE IF EXISTS spAssignPrice;

delimiter //

CREATE PROCEDURE spAssignPrice
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 OUT id        		 INT,
                     _companyid      INT,
                     _groupid        INT,
                     _name           VARCHAR(32),
                     _description    VARCHAR(256),
                     _productid      INT,
                     _companytypeid  INT,
                     _price          DECIMAL(10, 4),
                     _uomid          INT,
                     _createdby      INT
               )
DETERMINISTIC

main: BEGIN

	-- this procedure is used only for variable pricing.
	
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
	
	IF _groupid IS NULL AND _productid IS NULL THEN

		SET errorcode  = -204;
		SET errormsg   = 'Group ID or Product ID must be present!';
		LEAVE main;
	
	END IF;

	-- check group ID belongs to the company
	IF _groupid IS NOT NULL THEN

		IF (SELECT NOT EXISTS (SELECT 1 FROM price_groups g WHERE g.companies_id = _companyid AND g.id = _groupid)) THEN

			SET errorcode  = -200;
			SET errormsg   = 'Invalid group ID!';
			LEAVE main;

		END IF;

		IF (SELECT NOT EXISTS (SELECT 1 FROM price_groups g WHERE g.companies_id = _companyid AND g.id = _groupid AND g.syspricelevels_id = 4801)) THEN

			SET _groupid = NULL;

		END IF;

	END IF;

	-- check uom ID belongs to the company
/*	IF (SELECT NOT EXISTS (SELECT 1 FROM unit_of_measures u WHERE u.companies_id = _companyid AND u.id = _uomid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Invalid unit!';
		LEAVE main;
	
	END IF;
*/

	-- check customer type ID belongs to the company
	IF _companytypeid IS NOT NULL AND (SELECT NOT EXISTS (SELECT 1 FROM company_types c WHERE c.master_id = 4702 AND c.companies_id = _companyid AND c.id = _companytypeid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Invalid customer type!';
		LEAVE main;

	END IF;
	
	IF _groupid IS NULL THEN

		CALL spCreatePriceGroup (errorcode, errormsg, id,  _companyid, _name, _description, 4801, _price, _uomid);

		SET _groupid = id;
		
	ELSE

		SET id = _groupid;

	END IF;
	

	UPDATE products 
	SET    price_groups_id =  _groupid,
		   last_updated    =  NOW()
	WHERE  products.id     =  _productid
	AND    (price_groups_id <> _groupid OR price_groups_id IS NULL);

	-- TODO: make conversation of price with base unit OID

	-- TODO: Before making any action, store previous price in audit table.
	
	-- Disabling current price if uom is different than given. 

	IF (SELECT NOT EXISTS (

			SELECT 1 
			FROM   price_lists l 
			WHERE  l.companies_id    = _companyid 
			AND    price_groups_id = _groupid
		    AND    CASE WHEN _companytypeid IS NOT NULL THEN company_types_id ELSE 1 END = CASE WHEN _companytypeid IS NOT NULL THEN _companytypeid ELSE 1 END
		    AND    CASE WHEN _productid IS NOT NULL THEN products_id ELSE 1 END = CASE WHEN _productid IS NOT NULL THEN _productid ELSE 1 END
		)) THEN

		INSERT INTO price_lists (companies_id, price_groups_id, products_id, company_types_id, unit_of_measures_id, qty_from, qty_to, unit_price, last_updated_by, created, last_updated)
		VALUES (_companyid, _groupid, _productid, _companytypeid, _uomid, 0, 999999, _price, _createdby, NOW(), NOW());

	ELSE	

		UPDATE price_lists 
		SET    last_updated        = NOW(),
			   last_updated_by     = _createdby,
			   unit_price          = _price
		WHERE  companies_id        = _companyid
		AND    price_groups_id     = _groupid
		AND    CASE WHEN _companytypeid IS NOT NULL THEN company_types_id ELSE 1 END = CASE WHEN _companytypeid IS NOT NULL THEN _companytypeid ELSE 1 END
		AND    CASE WHEN _productid     IS NOT NULL THEN products_id      ELSE 1 END = CASE WHEN _productid     IS NOT NULL THEN _productid     ELSE 1 END
		AND    unit_price          <> _price;

	END IF;

END;
// 
delimiter ;
