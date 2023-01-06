DROP PROCEDURE IF EXISTS spCancelGatePass;

DELIMITER //

CREATE PROCEDURE spCancelGatePass
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _companyid         INT,
                     _gate_pass_id  	INT,
                     _userid            INT,
                     _reason            VARCHAR(1024)
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound              INT;
	DECLARE l_status_id             INT;
    DECLARE l_gate_pass_count       INT;
	

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	UPDATE gate_passes
    SET    sysgatepassstatuses_id = 6201,
		   cancelled_by = _userid,
           cancel_reason = _reason,
	       last_updated = NOW()
    WHERE  id = _gate_pass_id
    AND    companies_id = _companyid;
    
	UPDATE packing_slips 
	SET    packing_slips.syspackingslipstatuses_id = 5200,
		   packing_slips.last_updated              = NOW() 
	WHERE  packing_slips.id                        IN  (SELECT packing_slips_id 
														FROM gate_pass_details gd 
                                                        INNER JOIN gate_passes g ON gd.gate_passes_id = g.id  
                                                        WHERE g.id = _gate_pass_id);
	
	UPDATE delivery_notes d
	INNER JOIN packing_slips p ON d.id = p.delivery_notes_id
	INNER JOIN gate_pass_details gd  ON p.id = gd.packing_slips_id
	INNER JOIN gate_passes g ON gd.gate_passes_id = g.id  
		SET    sysdeliverynotestatuses_id              = 5499,
			   gate_pass_info = NULL,
			   d.last_updated                          = NOW()
	WHERE  g.id = _gate_pass_id
    AND    d.companies_id = _companyid;

    
    IF (SELECT EXISTS (
			    SELECT 1
			    FROM delivery_notes d
			    INNER JOIN delivery_note_details dn ON d.id            = dn.delivery_notes_id
			    INNER JOIN gate_pass_details gd ON dn.packing_slips_id = gd.packing_slips_id
			    INNER JOIN gate_passes g ON gd.gate_passes_id          = g.id
				WHERE  g.id                                            = _gate_pass_id
				AND    d.companies_id                                  = _companyid
			    AND    g.sysgatepassstatuses_id                        = 6202
			)
		) THEN        
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
					FROM  gate_passes g 
					INNER JOIN gate_pass_details gd on g.id = gd.gate_passes_id 
					INNER JOIN delivery_note_details dn on dn.packing_slips_id = gd.packing_slips_id 
					WHERE g.id = _gate_pass_id  AND g.sysgatepassstatuses_id = 6202
				  ) q
				)  AS more_json group by dnid
			) AS yet_more_json) d ON dn.id = d.dnid
		SET dn.gate_pass_info = d.best_result;
	END IF;
END;
//

DELIMITER ;
