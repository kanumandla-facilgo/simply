DROP PROCEDURE IF EXISTS spCreateUpdateGatePassDetail;

DELIMITER //

CREATE PROCEDURE spCreateUpdateGatePassDetail
          (
                 OUT errorcode            INT, 
                 OUT errormsg             VARCHAR(512),
                 INOUT _id                INT,
                     _companyid           INT,
                     _gatepassid          INT,
                     _packingslipid       INT,
                     _tempocharges        DECIMAL(8, 2)
			)
    DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound    INT;
	DECLARE  l_orderid     INT;

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

	IF _id IS NULL THEN

		IF (SELECT NOT EXISTS (SELECT 1 FROM gate_passes g WHERE g.companies_id = _companyid AND g.id = _gatepassid AND g.sysgatepassstatuses_id = 6202)) THEN
			SET errorcode  = -102;
			SET errormsg   = 'Gate pass not found.';
			LEAVE main;
		END IF;

		IF (SELECT NOT EXISTS (SELECT 1 FROM packing_slips p WHERE p.companies_id = _companyid AND p.id = _packingslipid AND p.syspackingslipstatuses_id = 5200)) THEN
			SET errorcode  = -103;
			SET errormsg   = 'Packing slip not found.';
			LEAVE main;
		END IF;

		INSERT INTO gate_pass_details
		(
			gate_passes_id,
			packing_slips_id,
			tempo_charges,
			transport_charges,
			created,
			last_updated
		)
		VALUES
		(
			_gatepassid,
			_packingslipid,
			_tempocharges,
			0,
			now(),
			now()
		);

		SELECT LAST_INSERT_ID() INTO _id;        
       
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
					WHERE p.id = _packingslipid AND g.sysgatepassstatuses_id = 6202
                    ) q
				)  AS more_json group by dnid
			) AS yet_more_json) d ON dn.id = d.dnid
		SET dn.gate_pass_info = d.best_result;

		-- Set packing slip status to Dispatched
		UPDATE packing_slips
		SET    syspackingslipstatuses_id  = 5201,
			   last_updated               = NOW()
		WHERE  packing_slips.id           = _packingslipid
		AND    packing_slips.companies_id = _companyid;

		-- Set delivery note status to Dispatched (Pending LR) if all the packing slip are Dispatched
		UPDATE delivery_notes d
		INNER JOIN delivery_note_details dnd1 ON dnd1.delivery_notes_id = d.id 
		SET    d.sysdeliverynotestatuses_id   = 5500,
		       d.last_updated                 = NOW()
		WHERE  d.sysdeliverynotestatuses_id   = 5499
		AND    dnd1.packing_slips_id          = _packingslipid
		AND    NOT EXISTS (
							SELECT 1
							FROM   delivery_note_details dnd2, packing_slips p 
							WHERE  dnd2.delivery_notes_id = d.id 
							AND    dnd2.packing_slips_id = p.id 
							AND    p.syspackingslipstatuses_id <> 5201			
						  );

	ELSE

		UPDATE gate_pass_details
		SET    tempo_charges = _tempocharges,
			   last_updated     = NOW()
		WHERE  id = _id;

	END IF; 
END;
//

DELIMITER ;
            
