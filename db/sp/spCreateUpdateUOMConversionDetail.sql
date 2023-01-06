DROP PROCEDURE IF EXISTS spCreateUpdateUOMConversionDetail;

delimiter //

CREATE PROCEDURE spCreateUpdateUOMConversionDetail
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _uomid          INT, -- set of 4 etc
                     _baseuomid      INT -- set etc
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

	-- first delete existing entries
	DELETE FROM unit_conversion_details WHERE unit_of_measures_id = _uomid;

	-- insert unit and base unit combination so next queries can create all combinations of unit (e.g. set of 4)
	IF _baseuomid IS NOT NULL THEN

		IF (SELECT NOT EXISTS (SELECT 1 
						FROM unit_conversions d 
						WHERE d.unit_of_measures_id = _uomid
						AND   d.from_uom_id = _uomid
						AND   d.to_uom_id = _baseuomid)) THEN

			INSERT INTO unit_conversions (unit_of_measures_id, from_uom_id, from_qty, to_uom_id, to_qty, created, last_updated)
			VALUES (_uomid, _uomid, 1, _baseuomid, 1, NOW(), NOW());

		END IF;

	END IF;

	-- insert all combinations
	INSERT INTO unit_conversion_details (unit_of_measures_id, from_uom_id, from_qty, to_uom_id, to_qty, updated_flag, created, last_updated)
	SELECT DISTINCT _uomid, f.from_uom_id, f.from_qty, t.to_uom_id, t.to_qty, 0, NOW(), NOW()
	FROM   unit_conversions f, unit_conversions t 
	WHERE  f.unit_of_measures_id = _uomid 
	AND    t.unit_of_measures_id = _uomid
	AND    f.from_uom_id <> t.to_uom_id
	AND    f.from_uom_id <> f.to_uom_id
	AND    t.from_uom_id <> t.to_uom_id;

	UPDATE unit_conversion_details
	SET    updated_flag = 1
	WHERE  unit_of_measures_id = _uomid
	AND EXISTS (SELECT 1 
					FROM unit_conversions c 
					WHERE unit_conversion_details.from_uom_id    = c.from_uom_id 
					AND  unit_conversion_details.to_uom_id       = c.to_uom_id 
					AND  unit_conversion_details.unit_of_measures_id = c.unit_of_measures_id
				);

	-- somehow inner queries return dup rows. fix that 
	UPDATE unit_conversion_details, (
 	SELECT u1.unit_of_measures_id, ucr.from_uom_id, ucr.to_uom_id, (u1.to_qty * u2.to_qty) / (u1.from_qty * u2.from_qty) as to_qty
 	FROM   unit_conversions u1, unit_conversions u2, (
  		SELECT	from_uom_id, to_uom_id 
  		FROM	unit_conversion_details 
  		WHERE	unit_of_measures_id = _uomid
  		AND NOT EXISTS (SELECT 1 
                FROM unit_conversions c 
                WHERE unit_conversion_details.from_uom_id    = c.from_uom_id 
                and  unit_conversion_details.to_uom_id       = c.to_uom_id 
                and  unit_conversion_details.unit_of_measures_id = c.unit_of_measures_id
                )
 	) ucr
 	WHERE u1.from_uom_id = ucr.from_uom_id
 	AND   u2.to_uom_id = ucr.to_uom_id
 	AND	  u1.to_uom_id = u2.from_uom_id
 	AND   u1.unit_of_measures_id = _uomid
 	AND   u2.unit_of_measures_id = _uomid) u1
	SET    unit_conversion_details.from_qty       = 1,
	      unit_conversion_details.to_qty          = u1.to_qty,
          unit_conversion_details.updated_flag    = 1,
          unit_conversion_details.last_updated    = now()
    WHERE unit_conversion_details.unit_of_measures_id = u1.unit_of_measures_id
    AND   unit_conversion_details.from_uom_id     = u1.from_uom_id
    AND   unit_conversion_details.to_uom_id       = u1.to_uom_id
    AND   unit_conversion_details.updated_flag    = 0;

    UPDATE unit_conversion_details ucr, unit_conversion_details u1, unit_conversion_details u2
    SET    ucr.from_qty        = 1,
           ucr.to_qty          = (u1.to_qty * u2.to_qty) / (u1.from_qty * u2.from_qty),
           ucr.updated_flag    = 1,
           ucr.last_updated    = now()
    WHERE  ucr.updated_flag    = 0
    AND    u1.updated_flag     = 1
    AND    u2.updated_flag     = 1
	AND    ucr.from_uom_id     = u1.from_uom_id
	AND    u1.to_uom_id        = u2.from_uom_id
	AND    u2.to_uom_id        = ucr.to_uom_id
	AND    u1.unit_of_measures_id  = _uomid
	AND    u2.unit_of_measures_id  = _uomid
	AND    ucr.unit_of_measures_id = _uomid;

	DELETE FROM unit_conversion_details WHERE unit_of_measures_id = _uomid AND updated_flag = 0;

	INSERT INTO unit_conversion_details (unit_of_measures_id, from_uom_id, from_qty, to_uom_id, to_qty, updated_flag, created, last_updated)
	SELECT unit_of_measures_id, to_uom_id, to_qty, from_uom_id, from_qty, updated_flag, NOW(), NOW()
	FROM   unit_conversion_details
	WHERE  unit_of_measures_id = _uomid;

	-- insert self unit if available
	IF _baseuomid IS NOT NULL THEN
		IF (SELECT NOT EXISTS (SELECT 1 
						FROM unit_conversion_details d 
						WHERE d.unit_of_measures_id = _uomid
						AND   d.from_uom_id = _baseuomid
						AND   d.to_uom_id = _baseuomid)) THEN

			INSERT INTO unit_conversion_details (unit_of_measures_id, from_uom_id, from_qty, to_uom_id, to_qty, updated_flag, created, last_updated)
			VALUES (_uomid, _baseuomid, 1, _baseuomid, 1, 1, NOW(), NOW());

		END IF;

		-- delete the row created previously to create data
		DELETE FROM unit_conversions 
		WHERE  unit_of_measures_id = _uomid 
		AND    from_uom_id         = _uomid
		AND    to_uom_id           = _baseuomid;

	END IF;

END;
// 
delimiter ;
