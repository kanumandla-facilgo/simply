DROP PROCEDURE IF EXISTS spCreateWorkflow;

delimiter //

CREATE  PROCEDURE `spCreateWorkflow`(
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
				_orders_id	 		INT,
				_workflowstatus_id	INT,
				_users_id			INT,
				_notes        VARCHAR(512)
               )
    DETERMINISTIC
main: BEGIN

	DECLARE  l_user_roles_id       	INT;
	DECLARE  l_action_roles_id		INT;
	DECLARE  l_variance_over		DECIMAL(8, 2);
	DECLARE  l_credit_days_over		INT;
	DECLARE  l_credit_over			INT;
	DECLARE  l_admin_usertypeid		INT;
	DECLARE  l_role_company_id      INT;
	DECLARE  l_role_sys_id          INT;

	DECLARE  l_workflow_routing_id  INT;

	DECLARE  l_wfreason_variance    INT;
	DECLARE  l_wfreason_creditdays  INT;
	DECLARE  l_wfreason_creditlimit INT;

	DECLARE  l_wf_reason_string     VARCHAR(64);

	DECLARE  l_workflowstatus_id	INT;	
	DECLARE  l_orderstatus_id		INT;
	DECLARE  l_companies_id			INT;
	DECLARE  l_customerid           INT;
	DECLARE  l_order_amount			DECIMAL(10, 2);
	DECLARE  l_subtotal             DECIMAL(10, 2);
	DECLARE  l_discounttotal        DECIMAL(8, 2);
	
 	DECLARE  CONST_WORKFLOW_STATUS_PENDING			INT;
	DECLARE  CONST_WORKFLOW_STATUS_APPROVED			INT;
	DECLARE  CONST_WORKFLOW_STATUS_REJECTED			INT;
	DECLARE  CONST_WORKFLOW_STATUS_ENDORSED			INT;
	DECLARE  CONST_WORKFLOW_STATUS_TIMEOUT			INT;
	DECLARE  CONST_WORKFLOW_STATUS_CANCELLED        INT;

 	DECLARE  CONST_ORDER_STATUS_PENDING				INT;
	DECLARE  CONST_ORDER_STATUS_APPROVED			INT;
	DECLARE  CONST_ORDER_STATUS_CANCELLED			INT;
	DECLARE  CONST_ORDER_STATUS_REJECTED			INT;

	DECLARE  CONST_COMPANY_ADMIN_ROLE_ID			INT;
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

	-- DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET errorcode=200;
	SET CONST_WORKFLOW_STATUS_PENDING 	= 5100;
	SET CONST_WORKFLOW_STATUS_APPROVED 	= 5101;
	SET CONST_WORKFLOW_STATUS_REJECTED 	= 5103;
	SET CONST_WORKFLOW_STATUS_ENDORSED 	= 5102;
	SET CONST_WORKFLOW_STATUS_TIMEOUT 	= 5104;
	SET CONST_WORKFLOW_STATUS_CANCELLED = 5105;

	SET CONST_ORDER_STATUS_PENDING 	= 4203;
	SET CONST_ORDER_STATUS_APPROVED = 4201;
	SET CONST_ORDER_STATUS_REJECTED = 4204;
	SET CONST_ORDER_STATUS_CANCELLED = 4205;
    
    SET CONST_COMPANY_ADMIN_ROLE_ID = 4002;

	SET errorcode  = 0;
	SET errormsg   = 'Success';

	SET l_workflowstatus_id = _workflowstatus_id;

	SET l_wfreason_variance    = 0;
	SET l_wfreason_creditdays  = 0;
	SET l_wfreason_creditlimit = 0;

	SELECT customers_id, sub_total, discount_total, sub_total+ship_total+tax_total-discount_total, sysorderstatuses_id ,companies_id, workflow_reason_string
	INTO   l_customerid, l_subtotal, l_discounttotal, l_order_amount, l_orderstatus_id,l_companies_id, l_wf_reason_string
	FROM   orders 
	WHERE  orders.id = _orders_id;

	SELECT u.roles_id, r.companies_id, r.sysroles_id
	INTO   l_user_roles_id, l_role_company_id, l_role_sys_id
	FROM   users u, roles r 
	WHERE  u.id = _users_id
	AND    u.roles_id = r.id;

	-- customer admin user company will be different. So find right company.
	IF l_role_company_id <> l_companies_id THEN

		SELECT r.id
		INTO   l_user_roles_id
		FROM   roles r, companies c
		WHERE  r.sysroles_id = l_role_sys_id
		AND    c.id          = l_role_company_id
		AND    c.parent_id   = r.companies_id;

	END IF;

	SELECT id 
	INTO   l_admin_usertypeid 
	FROM   roles 
	WHERE  companies_id = l_companies_id 
	AND    sysroles_id = CONST_COMPANY_ADMIN_ROLE_ID;

	SELECT to_roles_id, variance_over, credit_days_over, credit_over 
	INTO   l_action_roles_id, l_variance_over, l_credit_days_over, l_credit_over 
	FROM   workflow_hierarchies 
	WHERE  roles_id = l_user_roles_id;

    IF l_action_roles_id is null THEN 
		SET l_action_roles_id  = l_admin_usertypeid ;
	END IF;

-- 901 335 5184
-- dustin@homeratemortgage.com
-- 313 373 2932

	-- Validating for approval
	IF(_workflowstatus_id = CONST_WORKFLOW_STATUS_APPROVED) THEN

		IF l_user_roles_id <> l_admin_usertypeid THEN
			-- If the action is Approved then validate limits
			IF( l_credit_over >=0 AND (SELECT EXISTS (SELECT 1  FROM `companies` WHERE companies.id = l_customerid AND companies.parent_id = l_companies_id  AND ((current_balance + l_order_amount - allowed_balance ) * 100 /(CASE WHEN allowed_balance = 0 THEN 1 ELSE allowed_balance END))  >= l_credit_over))) then
				SET l_workflowstatus_id = CONST_WORKFLOW_STATUS_PENDING; -- Pending workflow
				SET l_wfreason_creditlimit = 1;
			END IF;

			IF( l_variance_over >= 0 and (SELECT EXISTS (SELECT 1  FROM `order_details` WHERE orders_id = _orders_id  AND abs((unit_price - order_price ) * 100 /(CASE WHEN unit_price = 0 THEN 1 ELSE unit_price END))  >= l_variance_over))) then
				SET l_workflowstatus_id = CONST_WORKFLOW_STATUS_PENDING; -- Pending workflow
				SET l_wfreason_variance = 1;
			END IF;

			-- let's make sure total discount is not over variance. We are only considering discount > 1 to ignore rounding adjustment in discount.
			IF l_variance_over >= 0 AND l_discounttotal > 1 AND (l_discounttotal/l_subtotal) * 100 >= l_variance_over THEN
				SET l_workflowstatus_id = CONST_WORKFLOW_STATUS_PENDING; -- Pending workflow
				SET l_wfreason_variance = 1;
			END IF;

			IF( l_credit_days_over >=0 and (SELECT EXISTS (SELECT 1 FROM pending_bills p, companies c, payment_terms t WHERE p.customers_id = l_customerid AND p.companies_id = l_companies_id AND  p.syspaymentstatuses_id in (5800, 5802) AND c.id = l_customerid AND c.parent_id = l_companies_id AND c.payment_terms_id = t.id AND (datediff(now(), p.due_date) / (CASE WHEN t.days = 0 THEN 1 ELSE t.days END)) *100 >= l_credit_days_over))) then
				SET l_workflowstatus_id = CONST_WORKFLOW_STATUS_PENDING; -- Pending workflow
				SET l_wfreason_creditdays = 1;
			END IF;			

/*			

			IF( l_credit_days_over >=0 and (SELECT EXISTS (SELECT 1  FROM orders o INNER JOIN payment_terms pt ON o.payment_terms_id = pt.id WHERE o.companies_id = l_companies_id  AND (sub_total + ship_total + tax_total - discount_total) > paid_total AND (datediff(now(), payment_due_date) / pt.days) *100 >= l_credit_days_over))) then
				SET l_workflowstatus_id = CONST_WORKFLOW_STATUS_PENDING; -- Pending workflow
				SET l_wfreason_creditdays = 1;
			END IF;			
*/
		END IF;
	END IF;

	-- If user is trying to approve but document is going to workflow then endorse it.
	IF (l_workflowstatus_id = CONST_WORKFLOW_STATUS_PENDING AND _workflowstatus_id = CONST_WORKFLOW_STATUS_APPROVED AND (SELECT EXISTS (SELECT 1 FROM order_workflow_routes WHERE orders_id = _orders_id AND sysworkflowstatuses_id = CONST_WORKFLOW_STATUS_PENDING ))) THEN
		SET _workflowstatus_id = CONST_WORKFLOW_STATUS_ENDORSED;
	ELSE
		SET _workflowstatus_id = l_workflowstatus_id ;
	END IF;

	IF _workflowstatus_id <> CONST_WORKFLOW_STATUS_PENDING THEN
		-- Approved-1, Rejected-3 ,  Endorsed-2, Timeout-4
		UPDATE order_workflow_routes SET  	sysworkflowstatuses_id = _workflowstatus_id,
											action_date = now(),
											action_users_id = _users_id,
											notes = _notes												
		WHERE order_workflow_routes.orders_id = _orders_id AND sysworkflowstatuses_id = CONST_WORKFLOW_STATUS_PENDING;
		IF _workflowstatus_id = CONST_WORKFLOW_STATUS_APPROVED THEN -- Approved
			SET l_wf_reason_string     = "";
			SET l_orderstatus_id = CONST_ORDER_STATUS_APPROVED;
		END IF;
		IF _workflowstatus_id = CONST_WORKFLOW_STATUS_REJECTED THEN -- canceled
			SET l_orderstatus_id = CONST_ORDER_STATUS_REJECTED;
		END IF;
		IF _workflowstatus_id = CONST_WORKFLOW_STATUS_CANCELLED THEN -- canceled
			SET l_orderstatus_id = CONST_ORDER_STATUS_CANCELLED;
		END IF;
	END IF;

	-- Pending Approval, endorsed, timeout
	IF(_workflowstatus_id = CONST_WORKFLOW_STATUS_PENDING or _workflowstatus_id = CONST_WORKFLOW_STATUS_ENDORSED or _workflowstatus_id = CONST_WORKFLOW_STATUS_TIMEOUT) THEN
		SET l_orderstatus_id = CONST_ORDER_STATUS_PENDING; -- pending workflow approval
		-- Hierarchy is available
		IF (l_action_roles_id = 0 or l_action_roles_id is null) THEN
			SET errorcode  = -110;
			SET errormsg   = 'Workflow hierarchy not available for Role.';
			LEAVE main;
		ELSE
			-- pending approval, endorsed, Timeout
			IF (SELECT NOT EXISTS (SELECT 1 FROM order_workflow_routes WHERE orders_id = _orders_id AND sysworkflowstatuses_id = CONST_WORKFLOW_STATUS_PENDING )) THEN
				INSERT INTO `order_workflow_routes` ( `orders_id`, `sysworkflowstatuses_id`, `arrival_roles_id`, `arrival_date`, `due_date`, `action_roles_id`, `action_users_id`, `action_sequence_number`, `notes`, `created`, `last_updated`) 
				VALUES ( _orders_id, CONST_WORKFLOW_STATUS_PENDING, l_user_roles_id, now(), now(), l_action_roles_id, null, 1, _notes, now(), now());

				SELECT LAST_INSERT_ID() INTO l_workflow_routing_id;

				SET l_wf_reason_string =  "";

				IF l_wfreason_creditdays =  1 THEN

					INSERT INTO `order_workflow_reasons` ( `description`, `orders_id`, `sysworkflowtypes_id`, `order_workflow_routes_id`, `created`, `last_updated`) 
					VALUES ('Due', _orders_id, 5001, l_workflow_routing_id, now(), now());

					SET l_wf_reason_string =  CONCAT(l_wf_reason_string, "Due, ");

				END IF;

				IF l_wfreason_creditlimit =  1 THEN

					INSERT INTO `order_workflow_reasons` ( `description`, `orders_id`, `sysworkflowtypes_id`, `order_workflow_routes_id`, `created`, `last_updated`) 
					VALUES ('Balance', _orders_id, 5002, l_workflow_routing_id, now(), now());

					SET l_wf_reason_string =  CONCAT(l_wf_reason_string, "Balance, ");

				END IF;

				IF l_wfreason_variance =  1 THEN

					INSERT INTO `order_workflow_reasons` ( `description`, `orders_id`, `sysworkflowtypes_id`, `order_workflow_routes_id`, `created`, `last_updated`) 
					VALUES ('Rate diff', _orders_id, 5000, l_workflow_routing_id, now(), now());

					SET l_wf_reason_string =  CONCAT(l_wf_reason_string, "Rate diff, ");

				END IF;

				IF l_wf_reason_string <> "" THEN  
					SET l_wf_reason_string =  CONCAT("", LEFT(l_wf_reason_string, LENGTH(l_wf_reason_string) - 2));
				END IF;

			END IF;
		END IF;
	END IF;

	-- if order is being rejected, release the quantity	
	IF _workflowstatus_id = CONST_WORKFLOW_STATUS_REJECTED OR _workflowstatus_id = CONST_WORKFLOW_STATUS_CANCELLED THEN
		CALL spReleaseProductInProcessQty (errorcode, errormsg, l_companies_id, _orders_id, NULL);
		IF (errorcode != 0) THEN
			LEAVE main;
		END IF;
	END IF;

	UPDATE orders 
	SET   sysorderstatuses_id     = l_orderstatus_id, 
	      approverusers_id        = CASE WHEN l_orderstatus_id = CONST_ORDER_STATUS_APPROVED OR l_orderstatus_id = CONST_ORDER_STATUS_REJECTED THEN _users_id ELSE approverusers_id END,
	      approval_date           = CASE WHEN l_orderstatus_id = CONST_ORDER_STATUS_APPROVED OR l_orderstatus_id = CONST_ORDER_STATUS_REJECTED THEN NOW() ELSE approval_date END,
	      cancelusers_id          = CASE WHEN l_orderstatus_id = CONST_ORDER_STATUS_CANCELLED THEN _users_id ELSE cancelusers_id END,
	      cancellation_date       = CASE WHEN l_orderstatus_id = CONST_ORDER_STATUS_CANCELLED THEN NOW() ELSE cancellation_date END,
	      sysdeliverystatuses_id  = CASE WHEN l_orderstatus_id = CONST_ORDER_STATUS_CANCELLED OR l_orderstatus_id = CONST_ORDER_STATUS_REJECTED THEN 5703 ELSE sysdeliverystatuses_id END,
	      workflow_reason_string  = l_wf_reason_string,
	      last_updated            = NOW() 	
    WHERE orders.id = _orders_id;

END;
// 
delimiter ;