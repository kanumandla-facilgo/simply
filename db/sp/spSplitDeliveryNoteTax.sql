DROP PROCEDURE IF EXISTS spSplitDeliveryNoteTax;

DELIMITER //

CREATE PROCEDURE spSplitDeliveryNoteTax
          (
                 OUT errorcode          INT, 
                 OUT errormsg           VARCHAR(512),
                     _companyid         INT,
                     _delivery_note_id  INT
			)
    DETERMINISTIC

main: BEGIN

	DECLARE l_notfound              INT;
	DECLARE l_status_id             INT;
	DECLARE l_customer_state        VARCHAR(32);
	DECLARE l_company_state         VARCHAR(32);

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

	SELECT state
	INTO   l_company_state
	FROM   companies c, addresses a
	WHERE  c.id = _companyid
	AND    a.id = c.addresses_id;

	SELECT state
	INTO   l_customer_state
	FROM   companies c, addresses a, delivery_notes d
	WHERE  a.id = c.addresses_id
	AND    d.id = _delivery_note_id
	AND    c.id = d.customers_id;

	IF l_customer_state = l_company_state THEN

		UPDATE delivery_notes
		SET    tax_total_sgst    = ROUND(tax_total / 2, 2),
		       tax_total_igst    = 0,
		       tax_total_vat     = 0,
		       last_updated      = NOW()
		WHERE  delivery_notes.id = _delivery_note_id;

		UPDATE delivery_notes
		SET    tax_total_cgst    = tax_total - tax_total_sgst,
		       last_updated      = NOW()
		WHERE  delivery_notes.id = _delivery_note_id;

		UPDATE delivery_note_details
		SET    tax_total_sgst    = ROUND(tax_total / 2, 2),
		       tax_total_igst    = 0,
		       tax_total_vat     = 0,
		       last_updated      = NOW()
		WHERE  delivery_note_details.delivery_notes_id = _delivery_note_id;

		UPDATE delivery_note_details
		SET    tax_total_cgst    = tax_total - tax_total_sgst,
		       last_updated      = NOW()
		WHERE  delivery_note_details.delivery_notes_id = _delivery_note_id;

	ELSE

		UPDATE delivery_notes
		SET    tax_total_igst    = tax_total,
		       tax_total_cgst    = 0,
		       tax_total_sgst    = 0,
		       tax_total_vat     = 0,
		       last_updated      = NOW()
		WHERE  delivery_notes.id = _delivery_note_id;

		UPDATE delivery_note_details
		SET    tax_total_igst    = tax_total,
		       tax_total_cgst    = 0,
		       tax_total_sgst    = 0,
		       tax_total_vat     = 0,
		       last_updated      = NOW()
		WHERE  delivery_note_details.delivery_notes_id = _delivery_note_id;

	END IF;

END;
//

DELIMITER ;
