DROP PROCEDURE IF EXISTS spAssignUnitConversion;

delimiter //

CREATE PROCEDURE spAssignUnitConversion
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _uomid          INT,
                     _productid      INT,
                     _from_uom_id    INT,
                     _from_qty       DECIMAL(12,2),
                     _to_uom_id      INT,
                     _to_qty         DECIMAL(12,2),
					 _is_batched_inventory TINYINT,
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
	
	IF _uomid IS NULL AND _productid IS NULL THEN

		SET errorcode  = -204;
		SET errormsg   = 'Group ID or Product ID must be present!';
		LEAVE main;
	
	END IF;

	-- check group ID belongs to the company
	IF _uomid IS NOT NULL THEN

		IF (SELECT NOT EXISTS (SELECT 1 FROM unit_of_measures g WHERE g.companies_id = _companyid AND g.id = _uomid)) THEN

			SET errorcode  = -200;
			SET errormsg   = 'Invalid unit ID!';
			LEAVE main;

		END IF;

	END IF;



	-- check uom ID belongs to the company
	IF (SELECT NOT EXISTS (SELECT 1 FROM unit_of_measures u WHERE u.companies_id = _companyid AND u.id = _from_uom_id)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Invalid from unit!';
		LEAVE main;
	
	END IF;

	-- check uom ID belongs to the company
	IF (SELECT NOT EXISTS (SELECT 1 FROM unit_of_measures u WHERE u.companies_id = _companyid AND u.id = _to_uom_id)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Invalid To unit!';
		LEAVE main;

	END IF;

	-- TODO: make conversation of price with base unit OID

	-- TODO: Before making any action, store previous price in audit table.
	
	-- Disabling current price if uom is different than given. 

	IF (SELECT NOT EXISTS (

			SELECT 1 
			FROM   unit_conversions l 
			WHERE  from_uom_id       = _from_uom_id
			AND    to_uom_id         = _to_uom_id
		    AND    CASE WHEN _uomid IS NOT NULL THEN unit_of_measures_id ELSE 1 END = CASE WHEN _uomid IS NOT NULL THEN _uomid ELSE 1 END
		    AND    CASE WHEN _productid IS NOT NULL THEN products_id ELSE 1 END = CASE WHEN _productid IS NOT NULL THEN _productid ELSE 1 END
		)) THEN

		INSERT INTO unit_conversions (unit_of_measures_id, products_id, from_uom_id, from_qty, to_uom_id, to_qty, is_batched_inventory, created, last_updated)
		VALUES (_uomid, _productid, _from_uom_id, _from_qty, _to_uom_id, _to_qty, IFNULL(_is_batched_inventory, 0), NOW(), NOW());

	ELSE	

		UPDATE unit_conversions 
		SET    last_updated        = NOW(),
		       from_qty            = _from_qty,
		       to_qty              = _to_qty,
			   is_batched_inventory = IFNULL(_is_batched_inventory, 0)
		WHERE  from_uom_id       = _from_uom_id
		AND    to_uom_id         = _to_uom_id
		AND    CASE WHEN _uomid IS NOT NULL THEN unit_of_measures_id ELSE 1 END = CASE WHEN _uomid IS NOT NULL THEN _uomid ELSE 1 END
		AND    CASE WHEN _productid IS NOT NULL THEN products_id ELSE 1 END = CASE WHEN _productid IS NOT NULL THEN _productid ELSE 1 END
		AND    from_qty          <> _from_qty
		AND    to_qty            <> _to_qty;

	END IF;

END;
// 
delimiter ;
