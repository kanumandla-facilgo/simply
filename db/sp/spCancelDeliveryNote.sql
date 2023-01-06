DROP PROCEDURE IF EXISTS spCancelDeliveryNote;

DELIMITER //

CREATE PROCEDURE spCancelDeliveryNote
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _companyid         INT,
                     _delivery_note_id  INT,
                     _userid            INT
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound               INT;
	DECLARE l_status_id              INT;
--	DECLARE l_sync_status_id         INT;
--	DECLARE l_invoice_integration_on INT;
    DECLARE l_gate_pass_count        INT;
	
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

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET l_notfound=1;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	SELECT sysdeliverynotestatuses_id
	INTO   l_status_id
	FROM   delivery_notes d
	WHERE  d.id           = _delivery_note_id
	AND    d.companies_id = _companyid;

    -- if delivery note not found, error out.
	IF (l_notfound = 1) THEN
		SET errorcode  = -110;
		SET errormsg   = 'Delivery note not found.';
		LEAVE main;
	END IF;

	-- Check if note is in open status. Status should not be different than open.
	IF (l_status_id <> 5499 AND l_status_id <> 5500 AND l_status_id <> 5501) THEN
		SET errorcode  = -112;
		SET errormsg   = 'Delivery note cannot be cancelled.';
		LEAVE main;
	END IF;

	-- check if active gate pass exists
	IF (SELECT EXISTS (
			    SELECT 1
			    FROM delivery_notes d
			    INNER JOIN delivery_note_details dn ON d.id            = dn.delivery_notes_id
			    INNER JOIN gate_pass_details gd ON dn.packing_slips_id = gd.packing_slips_id
			    INNER JOIN gate_passes g ON gd.gate_passes_id          = g.id
				WHERE  d.id                                            = _delivery_note_id
				AND    d.companies_id                                  = _companyid
			    AND    g.sysgatepassstatuses_id                        = 6202
			)
		) THEN

		SET errorcode  = -113;
		SET errormsg   = 'There is a gate pass created for this delivery note, please cancel the gate pass first.';
		LEAVE main;

	END IF;
/*
	SELECT value
	INTO   l_invoice_integration_on
	FROM   configurations c, sysconfigurations s 
	WHERE  s.name = 'module_integration_invoice' 
	AND    s.id = c.sysconfigurations_id 
	AND    c.companies_id = _companyid;
*/
	UPDATE packing_slips 
	SET    packing_slips.syspackingslipstatuses_id = 5199,
	       packing_slips.delivery_notes_id         = null,
		   packing_slips.last_updated              = NOW() 
	WHERE  packing_slips.id                        IN  (SELECT packing_slips_id FROM delivery_note_details d WHERE d.delivery_notes_id = _delivery_note_id);
	
	UPDATE delivery_notes
	SET    sysdeliverynotestatuses_id              = 5503,
	       syssyncstatuses_id                      =  CASE WHEN syssyncstatuses_id = 4103 THEN syssyncstatuses_id ELSE 4100 END,
	       cancelusers_id                          = _userid,
	       last_updated                            = NOW()
	WHERE  delivery_notes.id                       = _delivery_note_id;

END;
//

DELIMITER ;
