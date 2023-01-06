DROP PROCEDURE IF EXISTS spCreateOrder;

DELIMITER $$
CREATE  PROCEDURE `spCreateOrder`(
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                 INOUT id              INT,
                 OUT statusid       INT,
                 OUT deliverystatusid  INT,
				_customers_id 		INT,
				_companies_id		INT,
				_order_date			DATETIME,
				_sub_total			DECIMAL(12,2),
				_ship_total			DECIMAL(8,2),
				_tax_total			DECIMAL(8,2),
				_discount_total		DECIMAL(12,2),
				_sysorderstatuses_id INT,
				_orderusers_id		INT,
				_ship_addresses_id	INT,
				_bill_addresses_id	INT,
				_approverusers_id	INT,
				_syssyncstatus_id	INT,
				_order_number		VARCHAR(32),
				_customer_order_number VARCHAR(32),
				_payment_terms_id	INT,
				_salespersons_id	INT,
				_item_count			INT,
				_due_date			DATETIME,
				_transporters_id	INT,
				_notes				VARCHAR(512),
                _internal_notes				VARCHAR(512),
                _agent_notes				VARCHAR(512),
                _default_transporter_customer INT,
                _default_payment_term_customer INT
               )
    DETERMINISTIC
main: BEGIN

	DECLARE  l_order_status          INT;
	DECLARE  l_order_amount          DECIMAL(12, 2);
	DECLARE  l_current_order_amount  DECIMAL(12, 2);
	DECLARE  l_duedate               DATETIME;
	DECLARE  l_is_auto_order_number  VARCHAR(64);
	DECLARE  l_is_order_number_edit_on VARCHAR(64);
	DECLARE  l_order_number          VARCHAR(32);
	-- DECLARE  l_is_auto_round         INT;
	DECLARE  l_discount              DECIMAL(12, 2);
	DECLARE  l_commission            DECIMAL(8, 2);
	DECLARE  l_bonuscommission       DECIMAL(5, 2);
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
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);

     	SET errorcode  = -300;
--     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
	SET errorcode  = 0;
	SET errormsg   = 'Success';
	SET l_order_status = 4200;
	SET l_order_amount = _sub_total + _ship_total + _tax_total - _discount_total;

	-- validate ORDER Code
	IF _order_number IS NOT NULL THEN
		IF (SELECT EXISTS (SELECT 1 FROM orders WHERE companies_id = _companies_id AND orders.id <> @id and order_number = lower(_order_number))) THEN
			SET errorcode  = -101;
			SET errormsg   = 'Order with same order number already exists.';
			LEAVE main;
		END IF;
	END IF;

	-- validate customer supplier code
	IF _customer_order_number IS NOT NULL THEN
		IF (SELECT EXISTS (SELECT 1 FROM orders WHERE companies_id = _companies_id AND customers_id = _customers_id AND orders.id <> @id and customer_order_number = lower(_customer_order_number))) THEN
			SET errorcode  = -102;
			SET errormsg   = 'Order with same customer order number already exists.';
			LEAVE main;
		END IF;
	END IF;

	SELECT a.commission_rate
	INTO   l_commission
	FROM   companies c, companies a 
	WHERE  c.id = _customers_id
	AND    c.agents_id = a.id;

	SET l_commission = ROUND( (l_commission/100) * (_sub_total - _discount_total), 2);

	SELECT ROUND(IFNULL(value, 0), 2)
	INTO   l_bonuscommission
	FROM   configurations c, users u
	WHERE  c.companies_id         = _companies_id
	AND    c.sysconfigurations_id = 15002
	AND    u.id                   = _orderusers_id
	AND    u.sysroles_id          = 4005;

	IF l_bonuscommission > 0 THEN

		SET l_commission = l_commission + ROUND((l_commission * l_bonuscommission /100), 2);

	END IF;

	-- set current amount to 0
	SET l_current_order_amount = 0;

	-- Workflow Statuses 5100 Pen.App, 5101 Approved, 5102 Endorsed, 5103 Rejected, 5104 Timeout
	if (id > 0) then

			-- get current order amount to adjust current balance
			SELECT sub_total + ship_total + tax_total - discount_total
			INTO   l_current_order_amount
			FROM   orders
			WHERE  orders.id = id;

			update `orders`
	        set 
			
			-- `customers_id` 	=_customers_id ,
			-- `companies_id` 	=_companies_id,
			--  `order_date` 	= _order_date,
			`sub_total`		= CASE WHEN sysorderstatuses_id = 4201 OR sysorderstatuses_id = 4203 THEN _sub_total ELSE `sub_total` END,
			`ship_total`	= CASE WHEN sysorderstatuses_id = 4201 OR sysorderstatuses_id = 4203 THEN _ship_total ELSE `ship_total` END,
			`tax_total`		= CASE WHEN sysorderstatuses_id = 4201 OR sysorderstatuses_id = 4203 THEN _tax_total ELSE `tax_total` END,
			`discount_total`= CASE WHEN sysorderstatuses_id = 4201 OR sysorderstatuses_id = 4203 THEN _discount_total ELSE `discount_total` END,
			`item_count`    = CASE WHEN sysorderstatuses_id = 4201 OR sysorderstatuses_id = 4203 THEN _item_count ELSE `item_count` END,
			`commission_amount`= CASE WHEN sysorderstatuses_id = 4201 OR sysorderstatuses_id = 4203 THEN l_commission ELSE `commission_amount` END,
			-- `sysorderstatuses_id`=_sysorderstatuses_id,
			-- `orderusers_id`=_orderusers_id,
			-- `ship_addresses_id`=_ship_addresses_id,
			-- `bill_addresses_id`=_bill_addresses_id,
			-- `approverusers_id`=_approverusers_id,
			-- `syssyncstatus_id`=_syssyncstatus_id,
			`order_number`=_order_number,
			`customer_order_number` = _customer_order_number,
			`transporters_id` = _transporters_id,
			-- `payment_terms_id`=_payment_terms_id,
			-- `salespersons_id`=_salespersons_id,
			-- `item_count`=_item_count,
			-- `payment_due_date`= l_duedate, -- _due_date,
			`last_updated` =		NOW(),
			`notes`		= _notes,
            `internal_notes`		= _internal_notes,
            `agent_notes`		= _agent_notes
	        WHERE orders.`id` = id AND orders.customers_id = _customers_id AND orders.companies_id = _companies_id;
	else

		SELECT  DATE_ADD(_order_date, INTERVAL p.days DAY) 
		INTO    l_duedate
		FROM 	payment_terms p 
		WHERE	p.id = _payment_terms_id 
		AND		p.companies_id = _companies_id;

		-- get the next order number
		CALL spGetNextSequence(errorcode, errormsg, l_order_number, _companies_id, 20000, 20003, 20001, _order_number);

		-- SELECT value
		-- INTO   l_is_auto_order_number
		-- FROM   configurations
		-- WHERE  sysconfigurations_id = 20000
		-- AND    companies_id         = _companies_id;

		-- IF l_is_auto_order_number = '0' THEN

		-- 	IF _order_number IS NOT NULL AND _order_number != '' THEN

		-- 		SELECT value
		-- 		INTO   l_is_order_number_edit_on
		-- 		FROM   configurations
		-- 		WHERE  sysconfigurations_id = 20003
		-- 		AND    companies_id         = _companies_id;

		-- 		IF l_is_order_number_edit_on = '1' THEN

		-- 			SET l_order_number = _order_number;

		-- 		END IF;

		-- 	END IF;

		-- 	IF l_order_number IS NULL THEN

		-- 		SELECT value
		-- 		INTO   l_order_number
		-- 		FROM   configurations
		-- 		WHERE  sysconfigurations_id = 20001
		-- 		AND    companies_id         = _companies_id
		-- 		FOR    UPDATE;

		-- 		UPDATE configurations
		-- 		SET    value = l_order_number + 1
		-- 		WHERE  sysconfigurations_id = 20001
		-- 		AND    companies_id         = _companies_id;

		-- 	END IF;

		-- ELSE

		-- 	SET l_order_number = _order_number;

		-- END IF;

	/*
		SET l_discount = _sub_total + _ship_total + _tax_total - _discount_total;

		IF l_discount <> FLOOR(l_discount) THEN

			SELECT value
			INTO   l_is_auto_round
			FROM   configurations
			WHERE  sysconfigurations_id = 10007
			AND    companies_id         = _companies_id;

			IF l_is_auto_round = 1 THEN
				SET _discount_total = _discount_total + l_discount - FLOOR(l_discount);
			END IF;

		END IF;
	*/

		INSERT INTO `orders`
		(
		`customers_id`,
		`companies_id`,
		`order_date`,
		`sub_total`,
		`ship_total`,
		`tax_total`,
		`discount_total`,
		`sysorderstatuses_id`,
		`sysdeliverystatuses_id`,
		`orderusers_id`,
		`ship_addresses_id`,
		`bill_addresses_id`,
		`approverusers_id`,
		`syssyncstatus_id`,
		`order_number`,
		`customer_order_number`,
		`payment_terms_id`,
		`salespersons_id`,
		`item_count`,
		`commission_amount`,
		`payment_due_date`,
		`sysworkflowstatuses_id`,
		`created`,
		`last_updated`,
		`transporters_id`,
		`notes`,
        `internal_notes`,
        `agent_notes`
		)
		VALUES
		(
		_customers_id,
		_companies_id,
		_order_date,
		_sub_total,
		_ship_total,
		_tax_total,
		_discount_total,
		l_order_status,
		5700,
		_orderusers_id,
		_ship_addresses_id,
		_bill_addresses_id,
		_approverusers_id,
		_syssyncstatus_id,
		l_order_number,
		_customer_order_number,
		_payment_terms_id,
		_salespersons_id,
		_item_count,
		l_commission,
		l_duedate,
		5100, -- Pending workflow approval
		NOW(),
		NOW(),
		_transporters_id,
		_notes,
        _internal_notes,
        _agent_notes
		);
	-- 5101
		SELECT LAST_INSERT_ID() INTO id;
		
	--	CALL `spCreateWorkflow`( errorcode, errormsg, id, 5101,_orderusers_id ,'');
		

	END IF;

	-- updating customer balance
	UPDATE `companies` set pending_order_balance = pending_order_balance + ROUND(l_order_amount) - ROUND(l_current_order_amount) WHERE companies.id = _customers_id;

	-- return current status
	IF _default_transporter_customer = 1 THEN
		UPDATE `companies` set transporters_id =  _transporters_id 
		WHERE companies.id = _customers_id;
	End If;
    
    IF _default_payment_term_customer = 1 THEN
		UPDATE `companies` set payment_terms_id =  _payment_terms_id 
		WHERE companies.id = _customers_id;
	End If;
    
	SELECT sysorderstatuses_id, sysdeliverystatuses_id
	INTO   statusid, deliverystatusid
	FROM   orders 
	WHERE  orders.id = id;

END$$
DELIMITER ;
