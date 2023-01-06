DROP PROCEDURE IF EXISTS spCreateUpdateDirectInvoice;

DELIMITER //

CREATE PROCEDURE spCreateUpdateDirectInvoice
             (
                 OUT errorcode         INT, 
                 OUT errormsg          VARCHAR(512),
                 INOUT _id             INT,
                     _companyid        INT,
				     _customerid	   INT,
				     _userid	       INT,
				     _invoice_number   VARCHAR(32),
				     _sub_total        DECIMAL(12, 2),
				     _ship_total       DECIMAL(8, 2),
				     _tax_total        DECIMAL(8, 2),
				     _discount_total   DECIMAL(12, 2),
				     _rounding_total   DECIMAL(4, 2),
				     _notes            VARCHAR(128),
				     _taxform_flag     TINYINT,
				     _exportform_flag  TINYINT,
				     _eway_bill_number VARCHAR(32),
				     _eway_bill_date   DATETIME,
				     _syncstatusid     INT
			)

    DETERMINISTIC

main: BEGIN

	DECLARE  l_notfound    INT;

	DECLARE l_is_auto_delivery_note_number VARCHAR(64);
	DECLARE l_is_delivery_note_number_edit_on VARCHAR(64);

	DECLARE l_delivery_note_number VARCHAR(16);

	DECLARE _transporterid INT;
	DECLARE l_ship_address_id INT;

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
	SET l_notfound=1;

	SET l_notfound = 0;
	SET errorcode  = 0;
	SET errormsg   = 'Success';

	SELECT MIN(id)
	INTO   _transporterid
	FROM   transporters
	WHERE  companies_id = _companyid
	AND    is_system    = 1;
    
	IF _id IS NOT NULL THEN
		IF (SELECT NOT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.companies_id = _companyid AND d.id = _id AND d.customers_id = _customerid AND d.direct_invoice_flag = 1)) THEN
			SET errorcode  = -104;
			SET errormsg   = 'Delivery note not found.';
			LEAVE main;
		END IF;
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM users u WHERE u.companies_id = _companyid AND u.id = _userid)) THEN
		SET errorcode  = -102;
		SET errormsg   = 'User not found.';
		LEAVE main;
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM companies c WHERE c.parent_id = _companyid AND c.id = _customerid AND c.syscompanytypes_id = 4702 AND c.sysstatuses_id = 4600)) THEN
		SET errorcode  = -103;
		SET errormsg   = 'Customer not found.';
		LEAVE main;
	END IF;

	SELECT value
	INTO   l_is_auto_delivery_note_number
	FROM   configurations
	WHERE  sysconfigurations_id = 20020
	AND    companies_id         = _companyid;

	SELECT ship_addresses_id 
	INTO   l_ship_address_id 
	FROM   companies 
	WHERE  companies.id = _customerid;

	IF _id IS NULL THEN

		-- get the next note number
		CALL spGetNextSequence(errorcode, errormsg, l_delivery_note_number, _companyid, 20020, 20023, 20021, NULL);

		IF l_delivery_note_number IS NULL THEN
			SET errorcode  = -110;
			SET errormsg   = 'Note number not found.';
			LEAVE main;
		END IF;

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
			eway_bill_number,
			eway_bill_date,
			destination,
			direct_invoice_flag,
			ship_addresses_id,
			syssyncstatuses_id,
			last_updated_by,
			created,
			last_updated
		)
		VALUES
		(
			_companyid,
			l_delivery_note_number,
			DATE(now()),
			_customerid,
			_transporterid,
			5501,
			_userid,
			NULL,
			NULL,
			CASE WHEN _invoice_number IS NOT NULL AND _invoice_number <> '' THEN _invoice_number ELSE l_delivery_note_number END,
			_sub_total,
			_ship_total,
			_tax_total,
			_discount_total,
			_rounding_total,
			_notes,
			_taxform_flag,
			0,
			NULL,
			NULL,
			'N/A',
			1,
			l_ship_address_id,
			_syncstatusid,
			_userid,
			now(),
			now()
		);

		SELECT LAST_INSERT_ID() INTO _id;

	ELSE

		UPDATE delivery_notes
		SET    invoice_number      = CASE WHEN _invoice_number IS NOT NULL THEN _invoice_number ELSE invoice_number END,
			   ship_total          = _ship_total,
			   tax_total           = _tax_total,
			   discount_total      = _discount_total,
			   rounding_total      = _rounding_total,
			   notes               = _notes,
			   taxform_flag        = _taxform_flag,
			   exportform_flag     = _exportform_flag,
			   direct_invoice_flag = 1,
			   eway_bill_number    = _eway_bill_number,
			   eway_bill_date      = _eway_bill_date,
			   syssyncstatuses_id  = _syncstatusid,
			   last_updated_by     = _userid,
			   last_updated        = NOW()
		WHERE  id = _id;

		/*UPDATE delivery_notes
		SET    sysdeliverynotestatuses_id = CASE WHEN sysdeliverynotestatuses_id = 5502 THEN 5502 ELSE CASE WHEN lr_number IS NOT NULL THEN 5501 ELSE sysdeliverynotestatuses_id END END,
			   lr_date                    = CASE WHEN lr_number IS NOT NULL AND lr_date IS NULL THEN DATE(NOW()) ELSE lr_date END,
			   last_updated               = NOW()
		WHERE  delivery_notes.id          = _id;*/

	END IF;

END;
//

DELIMITER ;
