DROP PROCEDURE IF EXISTS spUpdateDeliveryNoteOrderMetadata;

DELIMITER //

CREATE  PROCEDURE spUpdateDeliveryNoteOrderMetadata(
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                    _companyid       INT,
				    _deliverynoteid	 INT
               )
    DETERMINISTIC

main: BEGIN


	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
		ROLLBACK;
	END;
/*
   	DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
    END;
*/
	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	UPDATE delivery_notes
	INNER JOIN (SELECT GROUP_CONCAT(DISTINCT packing_slips.orders_id SEPARATOR ', ') as str FROM delivery_notes d1, delivery_note_details, packing_slips WHERE packing_slips.id = delivery_note_details.packing_slips_id AND d1.id = _deliverynoteid AND d1.id = delivery_note_details.delivery_notes_id ) data
	SET    orders_id_string = data.str
	WHERE  delivery_notes.id = _deliverynoteid
	AND    companies_id = _companyid;

	UPDATE delivery_notes
	INNER JOIN (SELECT GROUP_CONCAT(DISTINCT orders.customer_order_number SEPARATOR ', ') as str FROM delivery_notes d1, delivery_note_details, packing_slips, orders WHERE packing_slips.id = delivery_note_details.packing_slips_id AND d1.id = _deliverynoteid AND d1.id = delivery_note_details.delivery_notes_id AND packing_slips.orders_id = orders.id) data
	SET   po_string = data.str
	WHERE  delivery_notes.id = _deliverynoteid
	AND    companies_id = _companyid;

	UPDATE delivery_notes
	INNER JOIN (SELECT GROUP_CONCAT(DISTINCT orders.order_number SEPARATOR ', ') as str FROM delivery_notes d1, delivery_note_details, packing_slips, orders WHERE packing_slips.id = delivery_note_details.packing_slips_id AND d1.id = _deliverynoteid AND d1.id = delivery_note_details.delivery_notes_id AND packing_slips.orders_id = orders.id) data
	SET   order_number_string = data.str
	WHERE  delivery_notes.id = _deliverynoteid
	AND    companies_id = _companyid;

END;
//

DELIMITER ;
