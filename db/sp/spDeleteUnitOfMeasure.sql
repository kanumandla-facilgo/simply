DROP PROCEDURE IF EXISTS spDeleteUnitOfMeasure;

delimiter //

CREATE PROCEDURE spDeleteUnitOfMeasure
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _uomid          INT,
                     _userid         INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound      INT;
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;
/*
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
		ROLLBACK;
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

	IF (SELECT NOT EXISTS (SELECT 1 FROM unit_of_measures u WHERE u.id = _uomid AND u.companies_id = _companyid)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'Unit not found. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM unit_of_measures u WHERE u.id = _uomid AND u.is_system = 1)) THEN

		SET errorcode  = -200;
		SET errormsg   = 'System Unit cannot be deleted.';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM order_details d WHERE d.unit_of_measures_id = _uomid OR d.entered_unit_of_measures_id = _uomid OR d.stock_unit_of_measures_id = _uomid OR d.stock_alt_unit_of_measures_id = _uomid)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Order(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM packing_slip_details d WHERE d.unit_of_measures_id = _uomid OR d.order_unit_of_measures_id = _uomid OR d.entered_unit_of_measures_id = _uomid)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Packing slip(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM price_groups p WHERE p.unit_of_measures_id = _uomid)) THEN

		SET errorcode  = -203;
		SET errormsg   = 'Price group(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM price_lists p WHERE p.unit_of_measures_id = _uomid)) THEN

		SET errorcode  = -204;
		SET errormsg   = 'Price list(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM products p WHERE p.unit_of_measures_id = _uomid OR p.default_qty_uom_id = _uomid)) THEN

		SET errorcode  = -205;
		SET errormsg   = 'Product(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM stock_buckets s WHERE s.unit_of_measures_id = _uomid OR s.entered_unit_of_measures_id = _uomid)) THEN

		SET errorcode  = -206;
		SET errormsg   = 'Stock bucket(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM stock_journal s WHERE s.unit_of_measures_id = _uomid OR s.entered_unit_of_measures_id = _uomid)) THEN

		SET errorcode  = -207;
		SET errormsg   = 'Stock bucket(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM stock_bucket_details s WHERE s.unit_of_measures_id = _uomid)) THEN

		SET errorcode  = -208;
		SET errormsg   = 'Stock bucket(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM stock_journal_details s WHERE s.unit_of_measures_id = _uomid)) THEN

		SET errorcode  = -209;
		SET errormsg   = 'Stock bucket(s) exist for this unit. Cannot delete the unit!';
		LEAVE main;

	END IF;

	-- delete unit conversion
	CALL spDeleteUnitConversion(errorcode, errormsg, _companyid, _uomid);

	IF errorcode != 0 THEN
		LEAVE main;
	END IF;

	-- delete the unit
	DELETE FROM unit_of_measures WHERE id = _uomid;

END;
// 
delimiter ;
