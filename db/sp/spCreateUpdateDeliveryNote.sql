DROP PROCEDURE IF EXISTS spCreateUpdateDeliveryNote;

DELIMITER //

CREATE PROCEDURE spCreateUpdateDeliveryNote
             (
                 OUT errorcode           INT, 
                 OUT errormsg            VARCHAR(512),
                 INOUT _id               INT,
                     _companyid          INT,
				     _customerid	     INT,
				     _note_number        VARCHAR(16), 
				     _note_date          DATETIME,
				     _userid	         INT,
				     _transporterid	     INT,
				     _lr_number          VARCHAR(32),
				     _lr_date            DATETIME,
				     _invoice_number     VARCHAR(32),
				     _sub_total          DECIMAL(12, 2),
				     _ship_total         DECIMAL(8, 2),
				     _tax_total          DECIMAL(8, 2),
				     _discount_total     DECIMAL(12, 2),
				     _rounding_total     DECIMAL(4, 2),
				     _notes              VARCHAR(128),
				     _taxform_flag       TINYINT,
				     _exportform_flag    TINYINT,
				     _proforma_invoice_flag TINYINT,
				     _material_out_invoice_flag TINYINT,
				     _destination        VARCHAR(32),
				     _ship_address_id    INT,
				     _ship_address_name  VARCHAR(128),
				     _ship_address_first_name VARCHAR(32),
				     _ship_address_last_name VARCHAR(32),
				     _ship_address_address1 VARCHAR(128),
				     _ship_address_address2 VARCHAR(128),
				     _ship_address_address3 VARCHAR(128),
				     _ship_address_city VARCHAR(32),
				     _ship_address_state VARCHAR(32),
				     _ship_address_zip VARCHAR(16),
				     _ship_address_phone1 VARCHAR(24),
				     _ship_address_phone2 VARCHAR(24),
				     _ship_address_email1 VARCHAR(128),
				     _ship_address_email2 VARCHAR(128),
				     _distance INT,
				     _syncstatusid        INT,
				     _sync_failure_reason	text,
				     _accounting_voucher_date datetime,
				     _einvoice_info JSON
			)

DETERMINISTIC
 
main: BEGIN

	DECLARE  l_notfound    INT;

	DECLARE l_is_auto_delivery_note_number VARCHAR(64);
	DECLARE l_is_delivery_note_number_edit_on VARCHAR(64);

	DECLARE l_delivery_note_number VARCHAR(16);

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
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
	SET l_notfound=1;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	IF _transporterid IS NOT NULL THEN
		IF (SELECT NOT EXISTS (SELECT 1 FROM transporters t WHERE t.companies_id = _companyid AND t.id = _transporterid)) THEN
			SET errorcode  = -101;
			SET errormsg   = 'Transporter not found.';
			LEAVE main;
		END IF;
	END IF;

	IF _id IS NOT NULL THEN
		IF (SELECT NOT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.companies_id = _companyid AND d.id = _id AND direct_invoice_flag = 0)) THEN
			SET errorcode  = -104;
			SET errormsg   = 'Delivery note not found.';
			LEAVE main;
		END IF;
        
        IF (SELECT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.companies_id = _companyid AND d.invoice_number = _invoice_number AND d.sysdeliverynotestatuses_id <> 5503 AND d.id <> _id)) THEN
			SET errorcode  = -105;
			SET errormsg   = 'Delivery note exists with same invoice number.';
			LEAVE main;
		END IF;
	END IF;
    
    IF _id IS NULL THEN        
        IF (SELECT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.companies_id = _companyid AND d.invoice_number = _invoice_number AND d.sysdeliverynotestatuses_id <> 5503)) THEN
			SET errorcode  = -105;
			SET errormsg   = 'Delivery note exists with same invoice number.';
			LEAVE main;
		END IF;
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM users u WHERE u.companies_id = _companyid AND u.id = _userid)) THEN
		SET errorcode  = -102;
		SET errormsg   = 'User not found.';
		LEAVE main;
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM companies c WHERE c.parent_id = _companyid AND c.id = _customerid AND c.syscompanytypes_id = 4702)) THEN
		SET errorcode  = -103;
		SET errormsg   = 'Customer not found.';
		LEAVE main;
	END IF;

	IF _ship_address_id IS NOT NULL THEN

		IF (SELECT NOT EXISTS (SELECT 1 FROM addresses a WHERE a.id = _ship_address_id AND a.companies_id = _customerid)) THEN
			SET errorcode  = -104;
			SET errormsg   = 'Invalid ship address.';
			LEAVE main;
		END IF;

	END IF;

	SELECT value
	INTO   l_is_auto_delivery_note_number
	FROM   configurations
	WHERE  sysconfigurations_id = 20020
	AND    companies_id         = _companyid;

	-- update and if shipping address is different than customer's address, update the address.
	IF (_id IS NOT NULL AND _ship_address_id IS NOT NULL AND (SELECT EXISTS (SELECT 1 FROM companies c, delivery_notes d WHERE d.id = _id AND d.sysdeliverynotestatuses_id IN (5499, 5500) AND c.id = d.customers_id AND c.ship_addresses_id <> _ship_address_id))) THEN

		CALL spUpdateAddress (errorcode, errormsg, _customerid, _ship_address_id, _ship_address_first_name, _ship_address_last_name, _ship_address_name, _ship_address_address1, _ship_address_address2, _ship_address_address3, _ship_address_city, _ship_address_state, _ship_address_zip, _ship_address_phone1, _ship_address_email1, _ship_address_phone2, _ship_address_email2);

		IF errorcode <> 0 THEN
			LEAVE main;
		END IF;

	END IF;

	-- if input _ship address is blank
	IF (_ship_address_id IS NULL) THEN

		-- if create delivery note, create address
		IF (_id IS NULL) THEN

			CALL spCreateAddress (errorcode, errormsg, _ship_address_id, _ship_address_first_name, _ship_address_last_name, _ship_address_name, _ship_address_address1, _ship_address_address2, _ship_address_address3, _ship_address_city, _ship_address_state, _ship_address_zip, _ship_address_phone1, _ship_address_email1, _ship_address_phone2, _ship_address_email2, _customerid);

		ELSE

			-- If delivery not in open status, update the address
			IF (SELECT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.id = _id AND d.sysdeliverynotestatuses_id IN (5499, 5500))) THEN
			
				-- update delivery note: if customer address is same as delivery note address, create new address.
				IF (SELECT EXISTS (SELECT 1 FROM companies c, delivery_notes d WHERE d.id = _id AND d.customers_id = c.id AND d.ship_addresses_id = c.ship_addresses_id)) THEN

					CALL spCreateAddress (errorcode, errormsg, _ship_address_id, _ship_address_first_name, _ship_address_last_name, _ship_address_name, _ship_address_address1, _ship_address_address2, _ship_address_address3, _ship_address_city, _ship_address_state, _ship_address_zip, _ship_address_phone1, _ship_address_email1, _ship_address_phone2, _ship_address_email2, _customerid);

				ELSE

					SELECT d.ship_addresses_id
					INTO   _ship_address_id
					FROM   delivery_notes d
					WHERE  d.id = _id;

					CALL spUpdateAddress (errorcode, errormsg, _customerid, _ship_address_id, _ship_address_first_name, _ship_address_last_name, _ship_address_name, _ship_address_address1, _ship_address_address2, _ship_address_address3, _ship_address_city, _ship_address_state, _ship_address_zip, _ship_address_phone1, _ship_address_email1, _ship_address_phone2, _ship_address_email2);

				END IF;

				IF errorcode <> 0 THEN
					LEAVE main;
				END IF;

			END IF;

		END IF;

	END IF;

	IF _id IS NULL THEN

		-- get the next note number
		CALL spGetNextSequence(errorcode, errormsg, l_delivery_note_number, _companyid, 20020, 20023, 20021, _note_number);

		INSERT INTO delivery_notes
		(
			companies_id,
			note_number,
			note_date,
			customers_id,
			transporters_id,
			sysdeliverynotestatuses_id,
			users_id,
			lr_number,
			lr_date,
			invoice_number,
			sub_total,
			ship_total,
			tax_total,
			discount_total,
			rounding_total,
			notes,
			taxform_flag,
			exportform_flag,
			proforma_invoice_flag,
			material_out_invoice_flag,
			destination,
			destination_distance,
			direct_invoice_flag,
			ship_addresses_id,
			syssyncstatuses_id,
			einvoice_info,
			last_updated_by,
			created,
			last_updated
		)
		VALUES
		(
			_companyid,
			l_delivery_note_number,
			DATE(_note_date),
			_customerid,
			_transporterid,
			5499,
			_userid,
			_lr_number,
			CASE WHEN lr_number IS NOT NULL AND lr_date IS NULL THEN DATE(NOW()) ELSE DATE(_lr_date) END,
			_invoice_number,
			_sub_total,
			_ship_total,
			_tax_total,
			_discount_total,
			_rounding_total,
			_notes,
			_taxform_flag,
			_exportform_flag,
			_proforma_invoice_flag,
			_material_out_invoice_flag,
			_destination,
			_distance,
			0,
			_ship_address_id,
			_syncstatusid,
			_einvoice_info,
			_userid,
			now(),
			now()
		);

		SELECT LAST_INSERT_ID() INTO _id;

	ELSE

		UPDATE delivery_notes
		SET    lr_number           = CASE WHEN _lr_number IS NOT NULL THEN _lr_number ELSE lr_number END,
			   lr_date             = CASE WHEN _lr_date   IS NOT NULL THEN DATE(_lr_date) ELSE DATE(lr_date) END,
			   transporters_id     = CASE WHEN _transporterid IS NOT NULL THEN _transporterid ELSE transporters_id END,
			   note_number         = CASE WHEN _note_number IS NOT NULL AND l_is_auto_delivery_note_number = 0 THEN _note_number ELSE note_number END,
			   note_date           = CASE WHEN _note_date   IS NOT NULL THEN DATE(_note_date) ELSE DATE(note_date) END,
			   accounting_voucher_date = CASE WHEN _accounting_voucher_date IS NOT NULL THEN DATE(_accounting_voucher_date) ELSE DATE(accounting_voucher_date) END,
			   invoice_number      = CASE WHEN _invoice_number IS NOT NULL THEN _invoice_number ELSE invoice_number END,
			   ship_total          = _ship_total,
			   tax_total           = _tax_total,
			   discount_total      = _discount_total,
			   rounding_total      = _rounding_total,
			   notes               = _notes,
			   taxform_flag        = _taxform_flag,
			   exportform_flag     = _exportform_flag,
			   proforma_invoice_flag = _proforma_invoice_flag,
			   material_out_invoice_flag = _material_out_invoice_flag,
			   destination         = _destination,
			   direct_invoice_flag = 0,
			   ship_addresses_id   = _ship_address_id,
			   destination_distance= _distance,
			   syssyncstatuses_id  = _syncstatusid,
			   sync_failure_reason = _sync_failure_reason,
               einvoice_info 	   = _einvoice_info,
			   last_updated_by     = _userid,
			   last_updated        = NOW()
		WHERE  id = _id;

		UPDATE delivery_notes
		SET    sysdeliverynotestatuses_id = CASE WHEN sysdeliverynotestatuses_id = 5502 THEN 5502 ELSE CASE WHEN lr_number IS NOT NULL THEN 5501 ELSE sysdeliverynotestatuses_id END END,
			   lr_date                    = CASE WHEN lr_number IS NOT NULL AND lr_date IS NULL THEN DATE(NOW()) ELSE lr_date END,
			   last_updated               = NOW()
		WHERE  delivery_notes.id          = _id;

	END IF;

END;
//

DELIMITER ;
