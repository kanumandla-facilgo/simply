DROP PROCEDURE IF EXISTS spCompleteDeliveryNote;

DELIMITER //

CREATE PROCEDURE spCompleteDeliveryNote
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _companyid         INT,
                     _delivery_note_id  INT,
                     _userid            INT
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound              INT;
	DECLARE l_status_id             INT;
	
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

	IF (SELECT EXISTS (SELECT 1 FROM packing_slips WHERE id IN (SELECT packing_slips_id FROM delivery_note_details WHERE delivery_notes_id = _delivery_note_id) AND gross_weight <= 0)) THEN
		SET errorcode  = -105;
		SET errormsg   = 'Gross weight must be entered.';
		LEAVE main;
	END IF;

	UPDATE delivery_notes 
	SET    sysdeliverynotestatuses_id = 5502, 
		   last_updated_by = _userid, 
		   last_updated = NOW() 
	WHERE  id = _delivery_note_id 
	AND    companies_id = _companyid
	AND    sysdeliverynotestatuses_id = 5501;

	IF ROW_COUNT() = 1 THEN

		UPDATE packing_slips 
		SET    syspackingslipstatuses_id = 5202, 
		       last_updated = NOW() 
		WHERE  id IN (SELECT packing_slips_id FROM delivery_note_details WHERE delivery_notes_id = _delivery_note_id);

		-- when order is in 4202 (Delivered/Completed) status, all packing slip creation will be done.
		-- when all packing slip are in dispatch
		UPDATE orders
		SET    sysdeliverystatuses_id = 5702, 
		       last_updated           = NOW() 
		WHERE  sysorderstatuses_id    = 4202 
		AND    id IN (SELECT orders_id FROM packing_slips WHERE id IN (SELECT packing_slips_id FROM delivery_note_details WHERE delivery_notes_id = _delivery_note_id))
		AND    EXISTS (SELECT 1 FROM packing_slips p WHERE p.orders_id = orders.id AND p.syspackingslipstatuses_id = 5202)
		AND    NOT EXISTS (
				SELECT 1
				FROM   packing_slips p 
				WHERE  p.orders_id         = orders.id 
				AND    p.syspackingslipstatuses_id IN (5200, 5201)
				);

	ELSE

		SET errorcode  = -102;
		SET errormsg   = 'Delivery note not found.';
		LEAVE main;

	END IF;

END;
//

DELIMITER ;
