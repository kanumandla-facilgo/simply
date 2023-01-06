DROP PROCEDURE IF EXISTS spCreateUpdateGatePass;

DELIMITER //

CREATE PROCEDURE spCreateUpdateGatePass
             (
                 OUT errorcode         INT, 
                 OUT errormsg          VARCHAR(512),
                 INOUT _id             INT,
                     _companyid        INT,
				     _gate_pass_number VARCHAR(16), 
				     _gate_pass_date   DATETIME,
				     _userid	       INT,
				     _vehicle_number   VARCHAR(32),
				     _contact_name     VARCHAR(32),
				     _tempo_charges    DECIMAL(8,2),
				     _notes            VARCHAR(512)
			)

    DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound    INT;

	DECLARE l_is_auto_gate_pass_number VARCHAR(64);
	DECLARE l_is_gate_pass_number_edit_on VARCHAR(64);

	DECLARE l_gate_pass_number VARCHAR(16);

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
		ROLLBACK;
	END;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	IF _id IS NOT NULL THEN
		IF (SELECT NOT EXISTS (SELECT 1 FROM gate_passes g WHERE g.companies_id = _companyid AND g.id = _id)) THEN
			SET errorcode  = -104;
			SET errormsg   = 'Gate pass not found.';
			LEAVE main;
		END IF;
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM users u WHERE u.companies_id = _companyid AND u.id = _userid)) THEN
		SET errorcode  = -102;
		SET errormsg   = 'User not found.';
		LEAVE main;
	END IF;

	SELECT value
	INTO   l_is_auto_gate_pass_number
	FROM   configurations
	WHERE  sysconfigurations_id = 20040
	AND    companies_id         = _companyid;

	IF _id IS NULL THEN

		-- get the next gatepass number
		CALL spGetNextSequence(errorcode, errormsg, l_gate_pass_number, _companyid, 20040, 20043, 20041, _gate_pass_number);

		-- IF l_is_auto_gate_pass_number = '0' THEN

		-- 	IF _gate_pass_number IS NOT NULL AND _gate_pass_number != '' THEN

		-- 		SELECT value
		-- 		INTO   l_is_gate_pass_number_edit_on
		-- 		FROM   configurations
		-- 		WHERE  sysconfigurations_id = 20043
		-- 		AND    companies_id         = _companyid;

		-- 		IF l_is_gate_pass_number_edit_on = '1' THEN

		-- 			SET l_gate_pass_number = _gate_pass_number;

		-- 		END IF;

		-- 	END IF;

		-- 	IF l_gate_pass_number IS NULL THEN

		-- 		SELECT value
		-- 		INTO   l_gate_pass_number
		-- 		FROM   configurations
		-- 		WHERE  sysconfigurations_id = 20041
		-- 		AND    companies_id         = _companyid
		-- 		FOR    UPDATE;

		-- 		UPDATE configurations
		-- 		SET    value = l_gate_pass_number + 1
		-- 		WHERE  sysconfigurations_id = 20041
		-- 		AND    companies_id         = _companyid;

		-- 	END IF;

		-- ELSE

		-- 	SET l_gate_pass_number = _gate_pass_number;

		-- END IF;

		IF _gate_pass_date IS NULL THEN
			SET _gate_pass_date = NOW();
		END IF;

		INSERT INTO gate_passes
		(
			gate_pass_number,
			gate_pass_date,
			companies_id,
			vehicle_number,
			contact_name,
			sysgatepassstatuses_id,
			tempo_charges,
			transporter_charges,
			created_by,
			last_updated_by,
			notes,
			created,
			last_updated
		)
		VALUES
		(
			l_gate_pass_number,
			DATE(_gate_pass_date),
			_companyid,
			_vehicle_number,
			_contact_name,
			6202,
			_tempo_charges,
			0,
			_userid,
			_userid,
			_notes,
			now(),
			now()
		);

		SELECT LAST_INSERT_ID() INTO _id;

	ELSE

		UPDATE gate_passes
		SET    gate_pass_number = CASE WHEN _gate_pass_number IS NOT NULL AND l_is_auto_gate_pass_number = 0 THEN _gate_pass_number ELSE gate_pass_number END,
			   gate_pass_date   = CASE WHEN _gate_pass_date   IS NOT NULL THEN DATE(_gate_pass_date) ELSE DATE(gate_pass_date) END,
               tempo_charges = _tempo_charges,
			   notes            = _notes,
			   last_updated_by  = _userid,
			   last_updated     = NOW()
		WHERE  id = _id;

		UPDATE delivery_notes dn
		INNER JOIN (
			SELECT dnid, CONCAT('[', better_result, ']') AS best_result  FROM
			(
				SELECT dnid, GROUP_CONCAT('{', my_json, '}' SEPARATOR ',') AS better_result FROM
				(
				  SELECT dnid,
					CONCAT
					( 
					  '"gate_pass_number":', '"', gpno   , '"', ',' 
					  '"id":', '"', gpid, '"', ','
					  '"gate_pass_date":', '"', gpd, '"'
					) AS my_json
				  FROM ( 
					SELECT DISTINCT dn.delivery_notes_id as dnid, g.gate_pass_number as gpno, g.id as gpid, g.gate_pass_date as gpd
					FROM packing_slips p 
                    INNER JOIN delivery_note_details dn ON p.id = dn.packing_slips_id
					INNER JOIN gate_pass_details gd on dn.packing_slips_id = gd.packing_slips_id 
					INNER JOIN gate_passes g on g.id = gd.gate_passes_id 
					WHERE g.id = _id AND g.sysgatepassstatuses_id = 6202
                    ) q
				)  AS more_json group by dnid
			) AS yet_more_json) d ON dn.id = d.dnid
		SET dn.gate_pass_info = d.best_result;

	END IF;

END;
//

DELIMITER ;
