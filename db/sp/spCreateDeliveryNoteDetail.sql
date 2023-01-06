DROP PROCEDURE IF EXISTS spCreateDeliveryNoteDetail;

DELIMITER //

CREATE PROCEDURE spCreateDeliveryNoteDetail
			( 
				OUT errorcode            INT, 
			    OUT errormsg             VARCHAR(512),
			    OUT _id                  INT,
			        _companyid           INT,
			        _deliverynoteid      INT,
			        _packingslipid       INT,
				    _packingslipdetailid INT,
				    _subtotal            DECIMAL(10, 2),
				    _shiptotal           DECIMAL(8, 2),
				    _taxtotal            DECIMAL(8, 2),
				    _discounttotal       DECIMAL(10, 2)
			)
    DETERMINISTIC
main: BEGIN

	DECLARE  l_notfound         INT;
	DECLARE  l_orderid          INT;
	DECLARE  l_productid        INT;
	DECLARE  l_bucketid         INT;
	DECLARE  l_uomid            INT;
	DECLARE  l_uom2id           INT;
	DECLARE  l_sku              VARCHAR(32);
	DECLARE  l_name             VARCHAR(256);
	DECLARE  l_qtyorderedpacked DECIMAL(10, 4);
	DECLARE  l_qtyenteredpacked DECIMAL(10, 4);
	DECLARE  l_price            DECIMAL(8, 2);

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
 
	IF _packingslipid IS NOT NULL THEN
		IF (SELECT NOT EXISTS (SELECT 1 FROM packing_slips p WHERE p.companies_id = _companyid AND p.id = _packingslipid AND p.syspackingslipstatuses_id = 5199)) THEN
			SET errorcode  = -101;
			SET errormsg   = CONCAT('Packing slip ', _packingslipid, ' not found.');
			LEAVE main;
		END IF;
	END IF;

	IF (SELECT NOT EXISTS (SELECT 1 FROM delivery_notes d WHERE d.companies_id = _companyid AND d.id = _deliverynoteid AND (d.sysdeliverynotestatuses_id = 5499))) THEN
		SET errorcode  = -102;
		SET errormsg   = 'Delivery note not found.';
		LEAVE main;
	END IF;

	-- fetch other fields
	SELECT d.products_id, d.stock_buckets_id, p.sku, od.name, d.unit_of_measures_id, d.quantity_ordered_packed, d.entered_unit_of_measures_id, d.quantity_entered_packed, od.order_price
	INTO   l_productid, l_bucketid, l_sku, l_name, l_uomid, l_qtyorderedpacked, l_uom2id, l_qtyenteredpacked, l_price
	FROM   packing_slip_details d, order_details od, products p
	WHERE  d.id = _packingslipdetailid AND d.order_details_id = od.id AND d.products_id = p.id;

	INSERT INTO delivery_note_details
	(
		delivery_notes_id,
		packing_slips_id,
		packing_slip_details_id,
		products_id,
		stock_buckets_id,
		sku,
		name,
		unit_of_measures_id,
		quantity_ordered_packed,
		entered_unit_of_measures_id,
		quantity_entered_packed,
		price,
		sub_total,
		ship_total,
		tax_total,
		discount_total,
		created,
		last_updated
	)
	VALUES
	(
		_deliverynoteid,
		_packingslipid,
		_packingslipdetailid,
		l_productid,
		l_bucketid,
		l_sku,
		l_name,
		l_uomid,
		l_qtyorderedpacked,
		l_uom2id,
		l_qtyenteredpacked,
		l_price,
		_subtotal,
		_shiptotal,
		_taxtotal,
		_discounttotal,
		now(),
		now()
	);

	SELECT LAST_INSERT_ID() INTO _id;

	-- SELECT p.orders_id
	-- INTO   l_orderid
	-- FROM   packing_slips p
	-- WHERE  p.id = _packingslipid;
	
	-- -- update order ID string on delivery note
	-- UPDATE delivery_notes
	-- SET    orders_id_string = CASE WHEN delivery_notes.orders_id_string IS NULL THEN l_orderid ELSE CONCAT(delivery_notes.orders_id_string, ', ' , l_orderid) END
	-- WHERE  delivery_notes.id = _deliverynoteid
	-- AND    INSTR(CONCAT(', ', IFNULL(delivery_notes.orders_id_string, ' '), ','), CONCAT(', ', l_orderid, ',')) = 0;

	-- UPDATE delivery_notes
	-- INNER JOIN orders
	-- SET    po_string = CASE WHEN delivery_notes.po_string IS NULL THEN orders.customer_order_number ELSE CONCAT(delivery_notes.po_string, ', ' , orders.customer_order_number) END
	-- WHERE  delivery_notes.id = _deliverynoteid
	-- AND    orders.id         = l_orderid
	-- AND    INSTR(CONCAT(', ', IFNULL(delivery_notes.po_string, ' '), ','), CONCAT(', ', orders.customer_order_number, ',')) = 0;

	-- UPDATE delivery_notes
	-- INNER JOIN orders
	-- SET    order_number_string = CASE WHEN delivery_notes.order_number_string IS NULL THEN orders.order_number ELSE CONCAT(delivery_notes.order_number_string, ', ' , orders.order_number, '') END
	-- WHERE  delivery_notes.id = _deliverynoteid
	-- AND    orders.id         = l_orderid
	-- AND    INSTR(CONCAT(', ', IFNULL(delivery_notes.order_number_string, ' '), ','), CONCAT(', ', orders.order_number, ',')) = 0;

END;
//

DELIMITER ;