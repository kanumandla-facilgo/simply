DROP PROCEDURE IF EXISTS spGetDashboard;

delimiter //

CREATE PROCEDURE spGetDashboard
               (
                 OUT errorcode		       INT, 
                 OUT errormsg		       VARCHAR(512),
                     _companyid		       INT,
                     _userid               INT,
                     _date                 DATE
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

    DECLARE  l_roleid             INT;
    DECLARE  l_sysroleid          INT;
    DECLARE  l_companyid          INT;
    DECLARE  l_subscriptiontypeid INT;

    DECLARE _myapprovalcount      INT;
    DECLARE _totalapprovalcount   INT;
    DECLARE _myapprovalvalue      INT;
    DECLARE _totalapprovalvalue   INT;
    DECLARE _pendingdeliverycount INT;
    DECLARE _pendingdeliveryvalue INT;
    DECLARE _orderlast7dayscount  INT;
    DECLARE _orderlast7daysvalue  INT;
    DECLARE _orderlast30dayscount INT;
    DECLARE _orderlast30daysvalue INT;
    DECLARE _orderlast90dayscount INT;
    DECLARE _orderlast90daysvalue INT;

    DECLARE _orderinpackinglast90dayscount  INT;
    DECLARE _orderinpackinglast90daysvalue  INT;
    DECLARE _orderinpackinglast30dayscount  INT;
    DECLARE _orderinpackinglast30daysvalue  INT;
    DECLARE _orderinpackinglast7dayscount   INT;
    DECLARE _orderinpackinglast7daysvalue   INT;
    DECLARE _orderinpackinglast3dayscount   INT;
    DECLARE _orderinpackinglast3daysvalue   INT;

    DECLARE _pendingdeliverylast90dayscount INT;
    DECLARE _pendingdeliverylast90daysvalue INT;
    DECLARE _pendingdeliverylast30dayscount INT;
    DECLARE _pendingdeliverylast30daysvalue INT;
    DECLARE _pendingdeliverylast7dayscount  INT;
    DECLARE _pendingdeliverylast7daysvalue  INT;

    DECLARE _totalpendinginvoicecount       INT;
    DECLARE _totalpendinginvoicevalue       INT;
    DECLARE _totalpendingdispatchcount      INT;
    DECLARE _totalpendingdispatchvalue      INT;
    -- DECLARE _totaldispatchedcount           INT;
    -- DECLARE _totaldispatchedvalue           INT;

    DECLARE _pendingdeliverydispatchcount   INT;
    DECLARE _pendingdeliverydispatchvalue   INT;
    DECLARE _totalpendinglrcount            INT;
    DECLARE _totalpendinglrvalue            INT;

    -- DECLARE _no_order_90_days   INT;

    DECLARE _total_agents       INT;
    DECLARE _number_agent_login_90_days INT;
    DECLARE _total_customers    INT;
    DECLARE _number_customer_login_90_days INT;

    -- DECLARE _variance_count     INT;
    -- DECLARE _days_count         INT;
    -- DECLARE _limit_count        INT;
    DECLARE _total_order_count  INT;
    DECLARE _total_workflow_count INT;
    DECLARE _perc_of_workflow     INT;
    DECLARE _totalordersubtotal   INT;
    DECLARE _totalworkflowsubtotal INT;

	DECLARE _pending_bills_amount_last0 INT;
	DECLARE _pending_bills_count_last0  INT;
	DECLARE _pending_bills_amount_last7 INT;
	DECLARE _pending_bills_count_last7  INT;
	DECLARE _pending_bills_amount_last30 INT;
	DECLARE _pending_bills_count_last30 INT;
	DECLARE _pending_bills_amount_next0 INT;
	DECLARE _pending_bills_count_next0  INT;
	DECLARE _pending_bills_amount_next7 INT;
	DECLARE _pending_bills_count_next7  INT;
	DECLARE _pending_bills_amount_next30 INT;
	DECLARE _pending_bills_count_next30 INT;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET errorcode=200;

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
/* TODO: 

1. Agent usage # of orders vs total orders created
2. Customer usage # of orders vs total orders created

*/
 
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

 	SET _total_agents = -1;
 	SET _number_agent_login_90_days = -1;
 	SET _total_customers = -1;
 	SET _number_customer_login_90_days = -1;

 	-- SET _variance_count = -1;
 	-- SET _days_count = -1;
 	-- SET _limit_count = -1;
 
 	SELECT sysroles_id, roles_id
 	INTO   l_sysroleid, l_roleid
 	FROM   users u
 	WHERE  u.id = _userid;

 	IF _date IS NULL THEN
 		SET _date = NOW();
 	END IF;

 	SELECT IFNULL(syssubscriptiontemplates_id, 6300)
 	INTO   l_subscriptiontypeid
 	FROM   companies
 	WHERE  companies.id = _companyid;
 
 	-- orders in packing and pending workflow approval (pending orders)
 	SELECT SUM(total_approval_count) AS total_approval_count, ROUND(SUM(total_approval_value)) AS total_approval_value, 
           SUM(my_approval_count) AS my_approval_count, ROUND(SUM(my_approval_value)) AS my_approval_value, 
           SUM(pending_delivery_count) AS pending_delivery_count, ROUND(SUM(pending_delivery_value)) AS pending_delivery_value
 	INTO   _totalapprovalcount, _totalapprovalvalue, _myapprovalcount, _myapprovalvalue, _pendingdeliverycount, _pendingdeliveryvalue
 	FROM (
		SELECT  CASE WHEN o.sysorderstatuses_id = 4203 THEN 1 ELSE 0 END AS total_approval_count, 
			    CASE WHEN o.sysorderstatuses_id = 4203 THEN sub_total + ship_total + tax_total ELSE 0 END AS total_approval_value,
			    CASE WHEN o.sysorderstatuses_id = 4203 AND r.action_roles_id = l_roleid THEN 1 ELSE 0 END AS my_approval_count, 
			    CASE WHEN o.sysorderstatuses_id = 4203 AND r.action_roles_id = l_roleid THEN sub_total + ship_total + tax_total ELSE 0 END AS my_approval_value, 
			    CASE WHEN o.sysorderstatuses_id = 4201 THEN 1 ELSE 0 END AS pending_delivery_count, 
			    CASE WHEN o.sysorderstatuses_id = 4201 THEN sub_total + ship_total + tax_total ELSE 0 END AS pending_delivery_value
		FROM    companies c 
		        INNER JOIN orders o ON o.customers_id = c.id 
		        LEFT OUTER JOIN order_workflow_routes r ON o.id = r.orders_id AND r.sysworkflowstatuses_id = 5100
		WHERE   o.companies_id           = _companyid
		AND     l_subscriptiontypeid     IN (6300)
		AND     EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
		AND     o.sysorderstatuses_id    IN (4201, 4203) -- in packing and pending workflow approval
		AND     CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT -1
											 )
		) a;		

 	-- packing slips
 	SELECT SUM(total_pending_invoice_count) AS total_pending_invoice_count, ROUND(SUM(total_pending_invoice_value)) AS total_pending_invoice_value, 
           SUM(total_pending_dispatch_count) AS total_pending_dispatch_count, ROUND(SUM(total_pending_dispatch_value)) AS total_pending_dispatch_value
           -- SUM(total_dispatched_count) AS total_dispatched_count, ROUND(SUM(total_dispatched_value)) AS total_dispatched_value
 	INTO   _totalpendinginvoicecount, _totalpendinginvoicevalue, _totalpendingdispatchcount, _totalpendingdispatchvalue
 	-- , _totaldispatchedcount, _totaldispatchedvalue
 	FROM (
		SELECT  CASE WHEN o.syspackingslipstatuses_id = 5199 THEN 1 ELSE 0 END AS total_pending_invoice_count, 
			    CASE WHEN o.syspackingslipstatuses_id = 5199 THEN o.sub_total + o.ship_total + o.tax_total ELSE 0 END AS total_pending_invoice_value,
			    CASE WHEN o.syspackingslipstatuses_id = 5200 THEN 1 ELSE 0 END AS total_pending_dispatch_count, 
			    CASE WHEN o.syspackingslipstatuses_id = 5200 THEN o.sub_total + o.ship_total + o.tax_total ELSE 0 END AS total_pending_dispatch_value
			    -- CASE WHEN o.syspackingslipstatuses_id = 5201 THEN 1 ELSE 0 END AS total_dispatched_count, 
			    -- CASE WHEN o.syspackingslipstatuses_id = 5201 THEN o.sub_total + o.ship_total + o.tax_total ELSE 0 END AS total_dispatched_value
		FROM    companies c
		        INNER JOIN orders o1 ON o1.customers_id = c.id AND o1.companies_id = _companyid 
		        INNER JOIN packing_slips o ON o.orders_id = o1.id AND o.companies_id = _companyid
		WHERE   o.companies_id               = _companyid
		AND     l_subscriptiontypeid         IN (6300)
		AND     EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_PACKING_SLIPS'))
		AND     o.syspackingslipstatuses_id  IN (5199, 5200)
		AND     CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT -1
											 )
		) a;

 	-- delivery notes
 	SELECT SUM(total_pending_dispatch_count) AS total_pending_dispatch_count, ROUND(SUM(total_pending_dispatch_value)) AS total_pending_dispatch_value, 
           SUM(total_pending_lr_count) AS total_pending_lr_count, ROUND(SUM(total_pending_lr_value)) AS total_pending_lr_value
 	INTO   _pendingdeliverydispatchcount, _pendingdeliverydispatchvalue, _totalpendinglrcount, _totalpendinglrvalue
 	FROM (
		SELECT  CASE WHEN d.sysdeliverynotestatuses_id = 5499 THEN 1 ELSE 0 END AS total_pending_dispatch_count, 
			    CASE WHEN d.sysdeliverynotestatuses_id = 5499 THEN d.sub_total + d.ship_total + d.tax_total - d.discount_total ELSE 0 END AS total_pending_dispatch_value,
			    CASE WHEN d.sysdeliverynotestatuses_id = 5500 THEN 1 ELSE 0 END AS total_pending_lr_count, 
			    CASE WHEN d.sysdeliverynotestatuses_id = 5500 THEN d.sub_total + d.ship_total + d.tax_total - d.discount_total ELSE 0 END AS total_pending_lr_value
		FROM    companies c 
		        INNER JOIN delivery_notes d ON d.customers_id = c.id 
		WHERE   d.companies_id                = _companyid
		AND     l_subscriptiontypeid          IN (6300)
		AND     EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_DELIVERY_NOTES'))
		AND     d.sysdeliverynotestatuses_id  IN (5499, 5500)
		AND     CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT -1
											 )
		) a;		

 	-- orders in packing status by age
  	SELECT SUM(orderinpackinglast90dayscount) AS orderinpackinglast90dayscount, ROUND(SUM(orderinpackinglast90daysvalue)) AS orderinpackinglast90daysvalue, 
           SUM(orderinpackinglast30dayscount) AS orderinpackinglast30dayscount, ROUND(SUM(orderinpackinglast30daysvalue)) AS orderinpackinglast30daysvalue, 
           SUM(orderinpackinglast7dayscount)  AS orderinpackinglast7dayscount, ROUND(SUM(orderinpackinglast7daysvalue)) AS orderinpackinglast7daysvalue,
           SUM(orderinpackinglast3dayscount) AS orderinpackinglast3dayscount, ROUND(SUM(orderinpackinglast3daysvalue)) AS orderinpackinglast3daysvalue
 	INTO   _orderinpackinglast90dayscount, _orderinpackinglast90daysvalue, _orderinpackinglast30dayscount, _orderinpackinglast30daysvalue, _orderinpackinglast7dayscount, _orderinpackinglast7daysvalue, _orderinpackinglast3dayscount, _orderinpackinglast3daysvalue
 	FROM (
		SELECT  CASE WHEN DATEDIFF(_date, o.created) > 30 THEN 1 ELSE 0 END AS orderinpackinglast90dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) > 30 THEN sub_total + ship_total + tax_total ELSE 0 END AS orderinpackinglast90daysvalue,
			    CASE WHEN DATEDIFF(_date, o.created) > 7 AND DATEDIFF(_date, o.created) <= 30  THEN 1 ELSE 0 END AS orderinpackinglast30dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) > 7 AND DATEDIFF(_date, o.created) <= 30 THEN sub_total + ship_total + tax_total ELSE 0 END AS orderinpackinglast30daysvalue, 
			    CASE WHEN DATEDIFF(_date, o.created) > 3 AND DATEDIFF(_date, o.created) <= 7  THEN 1 ELSE 0 END AS orderinpackinglast7dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) > 3 AND DATEDIFF(_date, o.created) <= 7 THEN sub_total + ship_total + tax_total ELSE 0 END AS orderinpackinglast7daysvalue, 
			    CASE WHEN DATEDIFF(_date, o.created) <=3 THEN 1 ELSE 0 END AS orderinpackinglast3dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) <=3 THEN sub_total + ship_total + tax_total ELSE 0 END AS orderinpackinglast3daysvalue
		FROM    companies c 
		        INNER JOIN orders o ON o.customers_id = c.id 
		WHERE   o.companies_id           = _companyid
		AND     l_subscriptiontypeid     IN (6300)
		AND     EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
		AND     o.sysorderstatuses_id    IN (4201) -- in packing
		AND     CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
	                                                UNION ALL
	                                                SELECT c2.id
	                                                FROM   companies c1, users u, companies c2
	                                                WHERE  c1.syscompanytypes_id = 4702
	                                                AND    u.id                  = _userid
	                                                AND    u.sysroles_id         IN (4030, 4031)
	                                                AND    u.companies_id        = c2.id
	                                                AND    c2.parent_id          = _companyid
	                                                AND    c1.id                 = u.companies_id
													UNION ALL
													SELECT -1
											 )
		) a;

 	-- orders delivered
 	SELECT SUM(orderlast90dayscount) AS orderlast90dayscount, ROUND(SUM(orderlast90daysvalue)) AS orderlast90daysvalue, 
           SUM(orderlast30dayscount) AS orderlast30dayscount, ROUND(SUM(orderlast30daysvalue)) AS orderlast30daysvalue, 
           SUM(orderlast7dayscount)  AS orderlast7dayscount, ROUND(SUM(orderlast7daysvalue)) AS orderlast7daysvalue
 	INTO   _orderlast90dayscount, _orderlast90daysvalue, _orderlast30dayscount, _orderlast30daysvalue, _orderlast7dayscount, _orderlast7daysvalue
 	FROM (
		SELECT  CASE WHEN DATEDIFF(_date, o.created) > 30 THEN 1 ELSE 0 END AS orderlast90dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) > 30 THEN sub_total + ship_total + tax_total ELSE 0 END AS orderlast90daysvalue,
			    CASE WHEN DATEDIFF(_date, o.created) > 7 AND DATEDIFF(_date, o.created) <= 30  THEN 1 ELSE 0 END AS orderlast30dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) > 7 AND DATEDIFF(_date, o.created) <= 30 THEN sub_total + ship_total + tax_total ELSE 0 END AS orderlast30daysvalue, 
			    CASE WHEN DATEDIFF(_date, o.created) <=7 THEN 1 ELSE 0 END AS orderlast7dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) <=7 THEN sub_total + ship_total + tax_total ELSE 0 END AS orderlast7daysvalue
		FROM    companies c 
		        INNER JOIN orders o ON o.customers_id = c.id 
		WHERE   o.companies_id           = _companyid
		AND     l_subscriptiontypeid     IN (6300)
		AND     EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
		AND     o.sysorderstatuses_id    IN (4202) -- delivered
		AND     CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
	                                                UNION ALL
	                                                SELECT c2.id
	                                                FROM   companies c1, users u, companies c2
	                                                WHERE  c1.syscompanytypes_id = 4702
	                                                AND    u.id                  = _userid
	                                                AND    u.sysroles_id         IN (4030, 4031)
	                                                AND    u.companies_id        = c2.id
	                                                AND    c2.parent_id          = _companyid
	                                                AND    c1.id                 = u.companies_id
													UNION ALL
													SELECT -1
											 )
		) a;

 	-- orders completed and partially delivered
 	SELECT SUM(pendingdeliverylast90dayscount) AS pendingdeliverylast90dayscount, ROUND(SUM(pendingdeliverylast90daysvalue)) AS pendingdeliverylast90daysvalue, 
           SUM(pendingdeliverylast30dayscount) AS pendingdeliverylast30dayscount, ROUND(SUM(pendingdeliverylast30daysvalue)) AS pendingdeliverylast30daysvalue, 
           SUM(pendingdeliverylast7dayscount)  AS pendingdeliverylast7dayscount, ROUND(SUM(pendingdeliverylast7daysvalue)) AS pendingdeliverylast7daysvalue
 	INTO   _pendingdeliverylast90dayscount, _pendingdeliverylast90daysvalue, _pendingdeliverylast30dayscount, _pendingdeliverylast30daysvalue, _pendingdeliverylast7dayscount, _pendingdeliverylast7daysvalue
 	FROM (
		SELECT  CASE WHEN DATEDIFF(_date, o.created) > 30 THEN 1 ELSE 0 END AS pendingdeliverylast90dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) > 30 THEN sub_total + ship_total + tax_total ELSE 0 END AS pendingdeliverylast90daysvalue,
			    CASE WHEN DATEDIFF(_date, o.created) > 7 AND DATEDIFF(_date, o.created) <= 30  THEN 1 ELSE 0 END AS pendingdeliverylast30dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) > 7 AND DATEDIFF(_date, o.created) <= 30 THEN sub_total + ship_total + tax_total ELSE 0 END AS pendingdeliverylast30daysvalue, 
			    CASE WHEN DATEDIFF(_date, o.created) <=7 THEN 1 ELSE 0 END AS pendingdeliverylast7dayscount, 
			    CASE WHEN DATEDIFF(_date, o.created) <=7 THEN sub_total + ship_total + tax_total ELSE 0 END AS pendingdeliverylast7daysvalue
		FROM    companies c 
		        INNER JOIN orders o ON o.customers_id = c.id 
		WHERE   o.companies_id           = _companyid
		AND     o.sysorderstatuses_id    IN (4202) -- delivered
		AND     EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
		AND     l_subscriptiontypeid     IN (6300)
		AND     o.sysdeliverystatuses_id IN (5701) -- partially delivered
		AND     CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
	                                                UNION ALL
	                                                SELECT c2.id
	                                                FROM   companies c1, users u, companies c2
	                                                WHERE  c1.syscompanytypes_id = 4702
	                                                AND    u.id                  = _userid
	                                                AND    u.sysroles_id         IN (4030, 4031)
	                                                AND    u.companies_id        = c2.id
	                                                AND    c2.parent_id          = _companyid
	                                                AND    c1.id                 = u.companies_id
													UNION ALL
													SELECT -1
											 )
		) a;

 	-- -- customers with no orders in last 90 days
	-- SELECT c.name, c.id
	-- FROM companies c 
	-- WHERE c.syscompanytypes_id = 4702
	-- AND c.sysstatuses_id = 4600
	-- AND c.parent_id = _companyid
	-- AND NOT EXISTS (SELECT 1 FROM orders o where o.customers_id = c.id AND o.created > DATE_ADD(_date, INTERVAL -90 DAY));

	-- SELECT COUNT(1) as 'count_no_order_last_90_days'
	-- INTO _no_order_90_days
	-- FROM companies c 
	-- WHERE c.syscompanytypes_id = 4702
	-- AND c.sysstatuses_id = 4600
	-- AND c.parent_id = _companyid
	-- AND NOT EXISTS (SELECT 1 FROM orders o where o.customers_id = c.id AND o.created > DATE_ADD(_date, INTERVAL -90 DAY))
	-- AND CASE WHEN _userid IS NOT NULL THEN c.id ELSE -1 END IN 
	-- 									(
	-- 											SELECT c1.id
	-- 											FROM   companies c1, users u
	-- 											WHERE  c1.syscompanytypes_id = 4702
	-- 											AND    c1.salesperson_id     = _userid
	-- 											AND    u.id                  = _userid
	-- 											AND    u.sysroles_id         = 4004
	-- 											AND    u.companies_id        = _companyid
	-- 											AND    c1.parent_id          = _companyid
	-- 											UNION ALL
	-- 											SELECT c1.id
	-- 											FROM   companies c1, users u, companies a
	-- 											WHERE  c1.syscompanytypes_id = 4702
	-- 											AND    c1.agents_id          = a.id
	-- 											AND    u.id                  = _userid
	-- 											AND    u.sysroles_id         = 4005
	-- 											AND    u.companies_id        = a.id
	-- 											AND    c1.parent_id          = _companyid
	-- 											UNION ALL
	-- 											SELECT c1.id
	-- 											FROM   companies c1, users u
	-- 											WHERE  c1.syscompanytypes_id = 4702
	-- 											AND    u.id                  = _userid
	-- 											AND    u.sysroles_id         IN (4002,4003)
	-- 											AND    u.companies_id        = _companyid
	-- 											AND    c1.parent_id          = _companyid
 --                                                UNION ALL
 --                                                SELECT c2.id
 --                                                FROM   companies c1, users u, companies c2
 --                                                WHERE  c1.syscompanytypes_id = 4702
 --                                                AND    u.id                  = _userid
 --                                                AND    u.sysroles_id         IN (4030, 4031)
 --                                                AND    u.companies_id        = c2.id
 --                                                AND    c2.parent_id          = _companyid
 --                                                AND    c1.id                 = u.companies_id
	-- 											UNION ALL
	-- 											SELECT -1
	-- 									 );

	IF l_sysroleid = 4002 AND l_subscriptiontypeid  IN (6300) THEN
		-- ------------------------
		-- usage statistics
		-- ------------------------

--		IF l_sysroleid = 4002 THEN

			-- number of agents logging into system
			SELECT total_agents, number_agent_login_last_90_days
			INTO _total_agents, _number_agent_login_90_days
			FROM (
				SELECT COUNT(1) as 'total_agents'
				FROM companies c1
				WHERE c1.parent_id        = _companyid
				AND l_subscriptiontypeid  IN (6300)
				AND c1.sysstatuses_id     = 4600
				AND c1.syscompanytypes_id = 4703
			) a,
			(
				SELECT COUNT(DISTINCT c.id) as 'number_agent_login_last_90_days'
				FROM   sessions s, companies c, users u
				WHERE  s.users_id = u.id
				AND    u.sysroles_id = 4005 
				AND    u.companies_id = c.id
				AND    c.parent_id = _companyid 
				AND    l_subscriptiontypeid IN (6300)
				AND    c.syscompanytypes_id = 4703 
				AND    c.sysstatuses_id = 4600
				AND    s.created > DATE_ADD(_date, INTERVAL -90 DAY) 
			)b;

			-- number of customers logging into system
			SELECT total_customers, number_customer_login_last_90_days
			INTO _total_customers, _number_customer_login_90_days
			FROM (
				SELECT COUNT(1) as 'total_customers'
				FROM companies 
				WHERE parent_id = _companyid
				AND sysstatuses_id = 4600
				AND syscompanytypes_id = 4702
			) a,
			(
				SELECT COUNT(DISTINCT c.id) as 'number_customer_login_last_90_days'
				FROM   sessions s, companies c, users u
				WHERE  s.users_id = u.id
				AND    u.sysroles_id IN (4030, 4031) 
				AND    u.companies_id = c.id
				AND    c.parent_id = _companyid
				AND    l_subscriptiontypeid  IN (6300)
				AND    c.syscompanytypes_id = 4702 
				AND    c.sysstatuses_id = 4600
				AND    s.created > DATE_ADD(_date, INTERVAL -90 DAY) 
			)b;

--		END IF;

		-- primary reasons for workflow
		-- SELECT	SUM(CASE WHEN sysworkflowtypes_id = 5000 THEN 1 ELSE 0 END) AS variance, 
		-- 		SUM(CASE WHEN sysworkflowtypes_id = 5001 THEN 1 ELSE 0 END) AS payment,
		-- 		SUM(CASE WHEN sysworkflowtypes_id = 5002 THEN 1 ELSE 0 END) AS credit
		-- INTO _variance_count, _days_count, _limit_count
		-- FROM  order_workflow_reasons
		-- WHERE orders_id IN (SELECT id FROM orders WHERE companies_id = _companyid)
		-- AND   created > DATE_ADD(_date, INTERVAL -90 DAY);

		-- -- number of sales man logging into system
		-- SELECT total_salesman, number_salesman_login_last_90_days
		-- FROM (
		-- 	SELECT COUNT(1) as 'total_salesman'
		-- 	FROM users u 
		-- 	WHERE companies_id = _companyid
		-- 	AND statuses_id = 4600
		-- 	AND sysroles_id = 4004
		-- ) a,
		-- (
		-- 	SELECT COUNT(DISTINCT u.id) as 'number_salesman_login_last_90_days'
		-- 	FROM   sessions s, users u 
		-- 	WHERE  s.users_id = u.id
		-- 	AND    u.sysroles_id = 4004 
		-- 	AND    u.companies_id = _companyid 
		-- 	AND    u.statuses_id = 4600 
		-- 	AND    s.created > DATE_ADD(_date, INTERVAL -90 DAY) 
		-- )b;

		-- salesman wise count and total
		-- SELECT CONCAT(u.first_name, ' ' , u.last_name) as 'salesname', u.id, d.cnt, d.total
		-- FROM users u INNER JOIN (
		-- 	SELECT c2.salesperson_id, COUNT(1) AS cnt, SUM(o.sub_total) AS total
		-- 	FROM   orders o INNER JOIN companies c1, companies c2
		-- 	WHERE  o.sysorderstatuses_id = 4202
		-- 	AND    o.companies_id        = _companyid
		-- 	AND    o.companies_id        = c1.id
		-- 	AND    o.customers_id        = c2.id
		-- 	GROUP BY c2.salesperson_id
		-- 	ORDER BY 3 DESC
		-- 	) d ON d.salesperson_id = u.id
		-- LIMIT 10;

		-- -- agent wise count and total
		-- SELECT CONCAT(u.first_name, ' ' , u.last_name) as 'agent', u.id, d.cnt, d.total
		-- FROM users u INNER JOIN (
		-- 	SELECT c2.salesperson_id, COUNT(1) AS cnt, SUM(o.sub_total) AS total
		-- 	FROM   orders o INNER JOIN companies c1, companies c2
		-- 	WHERE  o.sysorderstatuses_id = 4202
		-- 	AND    o.companies_id        = _companyid
		-- 	AND    o.companies_id        = c1.id
		-- 	AND    o.customers_id        = c2.id
		-- 	GROUP BY c2.salesperson_id
		-- 	ORDER BY 3 ASC
		-- 	) d ON d.salesperson_id = u.id
		-- LIMIT 10;

		-- new customers in last 7 days
		-- SELECT name FROM companies WHERE parent_id = _companyid AND syscompanytypes_id = 4702 AND created > DATE_ADD(_date, interval -7 day);

	END IF;

	-- pending bills information
	SELECT ROUND(SUM(CASE WHEN due_date < _date THEN balance_amount ELSE 0 END)) AS pending_bills_amount_last0, SUM(CASE WHEN due_date < _date THEN 1 ELSE 0 END) AS pending_bills_count_last0,
		   ROUND(SUM(CASE WHEN due_date < DATE_ADD(_date, interval -7 DAY) THEN balance_amount ELSE 0 END)) AS pending_bills_amount_last7, SUM(CASE WHEN due_date < DATE_ADD(_date, interval -7 DAY) THEN 1 ELSE 0 END)  AS pending_bills_count_last7,
		   ROUND(SUM(CASE WHEN due_date < DATE_ADD(_date, interval -30 DAY) THEN balance_amount ELSE 0 END)) AS pending_bills_amount_last30, SUM(CASE WHEN due_date < DATE_ADD(_date, interval -30 DAY) THEN 1 ELSE 0 END)  AS pending_bills_count_last30,

		   ROUND(SUM(CASE WHEN due_date > _date THEN balance_amount ELSE 0 END)) AS pending_bills_amount_next0, SUM(CASE WHEN due_date > _date THEN 1 ELSE 0 END) AS pending_bills_count_next0,
		   ROUND(SUM(CASE WHEN due_date > _date AND due_date < DATE_ADD(_date, interval 7 DAY) THEN balance_amount ELSE 0 END)) AS pending_bills_amount_next7, SUM(CASE WHEN due_date > _date AND due_date < DATE_ADD(_date, interval 7 DAY) THEN 1 ELSE 0 END)  AS pending_bills_count_next7,
		   ROUND(SUM(CASE WHEN due_date > _date AND due_date < DATE_ADD(_date, interval 30 DAY) THEN balance_amount ELSE 0 END)) AS pending_bills_amount_next30, SUM(CASE WHEN due_date > _date AND due_date < DATE_ADD(_date, interval 30 DAY) THEN 1 ELSE 0 END) AS pending_bills_count_next30
	INTO _pending_bills_amount_last0, _pending_bills_count_last0,
	     _pending_bills_amount_last7, _pending_bills_count_last7,
	     _pending_bills_amount_last30, _pending_bills_count_last30,
	     _pending_bills_amount_next0, _pending_bills_count_next0,
	     _pending_bills_amount_next7, _pending_bills_count_next7,
	     _pending_bills_amount_next30, _pending_bills_count_next30
	FROM   pending_bills
	WHERE  companies_id = _companyid
	AND    EXISTS (SELECT 1 FROM role_permissions WHERE roles_id = l_roleid AND syspermissions_id = 5650 AND value = '1')
	AND    EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_OUTSTANDING'))
	AND    CASE WHEN _userid IS NOT NULL THEN customers_id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
	                                                UNION ALL
	                                                SELECT c2.id
	                                                FROM   companies c1, users u, companies c2
	                                                WHERE  c1.syscompanytypes_id = 4702
	                                                AND    u.id                  = _userid
	                                                AND    u.sysroles_id         IN (4030, 4031)
	                                                AND    u.companies_id        = c2.id
	                                                AND    c2.parent_id          = _companyid
	                                                AND    c1.id                 = u.companies_id
													UNION ALL
													SELECT -1
											 );
	-- % of workflow orders
	SELECT a.totalorders as ordercount, b.workfloworders as workflowcount, a.total_order_sub_total, b.total_wofklow_sub_total, CASE WHEN a.totalorders > 0 THEN ROUND((b.workfloworders/a.totalorders)*100) ELSE 0 END as 'perc_workflow_orders'
	INTO _total_order_count, _total_workflow_count, _totalordersubtotal, _totalworkflowsubtotal, _perc_of_workflow
	FROM
	(
		SELECT COUNT(1) AS totalorders, SUM(o.sub_total) AS total_order_sub_total
		FROM   orders o
		WHERE  o.companies_id = _companyid
		AND    EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
		AND    l_subscriptiontypeid  IN (6300)
		AND    CASE WHEN _userid IS NOT NULL THEN o.customers_id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT -1
											 )	
	) a,
	(
		SELECT COUNT(1) as workfloworders, SUM(o.sub_total) AS total_wofklow_sub_total
		FROM   orders o
		WHERE  o.companies_id = _companyid
		AND    l_subscriptiontypeid  IN (6300)
		AND    EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
		AND    EXISTS (SELECT 1 FROM order_workflow_reasons r WHERE r.orders_id = o.id)
		AND    CASE WHEN _userid IS NOT NULL THEN o.customers_id ELSE -1 END IN 
											(
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.salesperson_id     = _userid
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4004
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u, companies a
													WHERE  c1.syscompanytypes_id = 4702
													AND    c1.agents_id          = a.id
													AND    u.id                  = _userid
													AND    u.sysroles_id         = 4005
													AND    u.companies_id        = a.id
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT c1.id
													FROM   companies c1, users u
													WHERE  c1.syscompanytypes_id = 4702
													AND    u.id                  = _userid
													AND    u.sysroles_id         IN (4002,4003)
													AND    u.companies_id        = _companyid
													AND    c1.parent_id          = _companyid
													UNION ALL
													SELECT -1
											 )	) b;


	-- Now return meta data information
	-- 1 ==> normal result set, 2 => bar graph 3 => donut 4 => summary info
	SELECT 0 AS controltype, "Meta data" as description
	-- UNION ALL
	-- SELECT 1 AS controltype, "Receivables - Already Due (Highest)" as description
	-- UNION ALL
	-- SELECT 1 AS controltype, "Receivables - Due in 7 days (Highest)" as description
	-- UNION ALL
	-- SELECT 1 AS controltype, "Order Total By Customer (Highest)" as description
	-- UNION ALL
	-- SELECT 1 AS controltype, "Order Total By Customer (Lowest)" as description
	-- UNION ALL
	-- SELECT 1 AS controltype, "Order Total By Agent (Highest)" as description
	-- UNION ALL
	-- SELECT 1 AS controltype, "Order Total By Agent (Lowest)" as description
	UNION ALL
	SELECT 2 AS controltype, "Orders by month" as description
	UNION ALL
	SELECT 3 AS controltype, "Order Information" as description
	UNION ALL
	SELECT 4 AS controltype, "Quick Stats" as description;

 -- 	-- pending bills due by customer order by total (highest)
	-- SELECT c.name As Name, d.cnt As 'Count', FORMAT(d.total, 0, 'ta_in') AS Amount, c.id
	-- FROM companies c INNER JOIN (
	-- 	SELECT p.customers_id, COUNT(1) AS cnt, SUM(p.balance_amount) AS total
	-- 	FROM   pending_bills p
	-- 	WHERE  p.due_date < _date
	-- 	AND    p.companies_id        = _companyid
	-- 	AND     CASE WHEN _userid IS NOT NULL THEN p.customers_id ELSE -1 END IN 
	-- 										(
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.salesperson_id     = _userid
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4004
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u, companies a
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.agents_id          = a.id
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4005
	-- 												AND    u.companies_id        = a.id
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         IN (4002,4003)
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	--                                                 UNION ALL
	--                                                 SELECT c2.id
	--                                                 FROM   companies c1, users u, companies c2
	--                                                 WHERE  c1.syscompanytypes_id = 4702
	--                                                 AND    u.id                  = _userid
	--                                                 AND    u.sysroles_id         IN (4030, 4031)
	--                                                 AND    u.companies_id        = c2.id
	--                                                 AND    c2.parent_id          = _companyid
	--                                                 AND    c1.id                 = u.companies_id
	-- 												UNION ALL
	-- 												SELECT -1
	-- 										 )
	-- 	GROUP BY p.customers_id
	-- 	ORDER BY 3 DESC
	-- 	) d ON d.customers_id = c.id
	-- LIMIT 10;

 	-- pending bills due by customer order by total (highest)
	-- SELECT c.name As Name, d.cnt As 'Count', FORMAT(d.total, 0, 'ta_in') AS Amount, c.id
	-- FROM companies c INNER JOIN (
	-- 	SELECT p.customers_id, COUNT(1) AS cnt, SUM(p.balance_amount) AS total
	-- 	FROM   pending_bills p
	-- 	WHERE  p.due_date > _date AND p.due_date < DATE_ADD(_date, INTERVAL 7 DAY)
	-- 	AND    p.companies_id        = _companyid
	-- 	AND     CASE WHEN _userid IS NOT NULL THEN p.customers_id ELSE -1 END IN 
	-- 										(
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.salesperson_id     = _userid
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4004
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u, companies a
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.agents_id          = a.id
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4005
	-- 												AND    u.companies_id        = a.id
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         IN (4002,4003)
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	--                                                 UNION ALL
	--                                                 SELECT c2.id
	--                                                 FROM   companies c1, users u, companies c2
	--                                                 WHERE  c1.syscompanytypes_id = 4702
	--                                                 AND    u.id                  = _userid
	--                                                 AND    u.sysroles_id         IN (4030, 4031)
	--                                                 AND    u.companies_id        = c2.id
	--                                                 AND    c2.parent_id          = _companyid
	--                                                 AND    c1.id                 = u.companies_id
	-- 												UNION ALL
	-- 												SELECT -1
	-- 										 )
	-- 	GROUP BY p.customers_id
	-- 	ORDER BY 3 DESC
	-- 	) d ON d.customers_id = c.id
	-- LIMIT 10;

 -- 	-- orders delivered by customer order by total (highest)
	-- SELECT c.name As Name, d.cnt As 'Count', FORMAT(d.total, 0, 'ta_in') AS Amount, c.id
	-- FROM companies c INNER JOIN (
	-- 	SELECT o.customers_id, COUNT(1) AS cnt, SUM(o.sub_total) AS total
	-- 	FROM   orders o INNER JOIN companies c1, companies c2
	-- 	WHERE  o.sysorderstatuses_id = 4202
	-- 	AND    o.companies_id        = _companyid
	-- 	AND    o.companies_id        = c1.id
	-- 	AND    o.customers_id        = c2.id
	-- 	AND    c2.created > CASE WHEN DATEDIFF(_date, c1.created) > 90 THEN DATE_ADD(_date, INTERVAL -90 DAY) ELSE c1.created END
	-- 	AND     CASE WHEN _userid IS NOT NULL THEN c2.id ELSE -1 END IN 
	-- 										(
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.salesperson_id     = _userid
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4004
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u, companies a
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.agents_id          = a.id
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4005
	-- 												AND    u.companies_id        = a.id
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         IN (4002,4003)
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	--                                                 UNION ALL
	--                                                 SELECT c2.id
	--                                                 FROM   companies c1, users u, companies c2
	--                                                 WHERE  c1.syscompanytypes_id = 4702
	--                                                 AND    u.id                  = _userid
	--                                                 AND    u.sysroles_id         IN (4030, 4031)
	--                                                 AND    u.companies_id        = c2.id
	--                                                 AND    c2.parent_id          = _companyid
	--                                                 AND    c1.id                 = u.companies_id
	-- 												UNION ALL
	-- 												SELECT -1
	-- 										 )
	-- 	GROUP BY o.customers_id
	-- 	ORDER BY 3 DESC
	-- 	) d ON d.customers_id = c.id
	-- LIMIT 10;

 -- 	-- orders delivered by customer order by total (lowest)
	-- SELECT c.name As Name, d.cnt As 'Count', FORMAT(d.total, 0, 'ta_in') AS Amount, c.id
	-- FROM companies c INNER JOIN (
	-- 	SELECT o.customers_id, COUNT(1) AS cnt, SUM(o.sub_total) AS total
	-- 	FROM   orders o INNER JOIN companies c1, companies c2
	-- 	WHERE  o.sysorderstatuses_id = 4202
	-- 	AND    o.companies_id        = _companyid
	-- 	AND    o.companies_id        = c1.id
	-- 	AND    o.customers_id        = c2.id
	-- 	AND    c2.created > CASE WHEN DATEDIFF(_date, c1.created) > 90 THEN DATE_ADD(_date, INTERVAL -90 DAY) ELSE c1.created END
	-- 	AND     CASE WHEN _userid IS NOT NULL THEN c2.id ELSE -1 END IN 
	-- 										(
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.salesperson_id     = _userid
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4004
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u, companies a
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.agents_id          = a.id
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4005
	-- 												AND    u.companies_id        = a.id
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         IN (4002,4003)
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	--                                                 UNION ALL
	--                                                 SELECT c2.id
	--                                                 FROM   companies c1, users u, companies c2
	--                                                 WHERE  c1.syscompanytypes_id = 4702
	--                                                 AND    u.id                  = _userid
	--                                                 AND    u.sysroles_id         IN (4030, 4031)
	--                                                 AND    u.companies_id        = c2.id
	--                                                 AND    c2.parent_id          = _companyid
	--                                                 AND    c1.id                 = u.companies_id
	-- 												UNION ALL
	-- 												SELECT -1
	-- 										 )
	-- 	GROUP BY customers_id
	-- 	ORDER BY 3 ASC
	-- 	) d ON d.customers_id = c.id
	-- LIMIT 10;

 -- 	-- orders delivered by agent order by total (highest)
	-- SELECT c.name As Name, d.cnt As 'Count', FORMAT(d.total, 0, 'ta_in') AS Amount, c.id
	-- FROM companies c INNER JOIN (
	-- 	SELECT c2.agents_id, COUNT(1) AS cnt, SUM(o.sub_total) AS total
	-- 	FROM   orders o INNER JOIN companies c1, companies c2
	-- 	WHERE  o.sysorderstatuses_id = 4202
	-- 	AND    o.companies_id        = _companyid
	-- 	AND    o.companies_id        = c1.id
	-- 	AND    o.customers_id        = c2.id
	-- 	AND    c2.created > CASE WHEN DATEDIFF(_date, c1.created) > 90 THEN DATE_ADD(_date, INTERVAL -90 DAY) ELSE c1.created END
	-- 	AND     CASE WHEN _userid IS NOT NULL THEN c2.id ELSE -1 END IN 
	-- 										(
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.salesperson_id     = _userid
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4004
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u, companies a
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.agents_id          = a.id
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4005
	-- 												AND    u.companies_id        = a.id
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         IN (4002,4003)
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	--                                                 UNION ALL
	--                                                 SELECT c2.id
	--                                                 FROM   companies c1, users u, companies c2
	--                                                 WHERE  c1.syscompanytypes_id = 4702
	--                                                 AND    u.id                  = _userid
	--                                                 AND    u.sysroles_id         IN (4030, 4031)
	--                                                 AND    u.companies_id        = c2.id
	--                                                 AND    c2.parent_id          = _companyid
	--                                                 AND    c1.id                 = u.companies_id
	-- 												UNION ALL
	-- 												SELECT -1
	-- 										 )
	-- 	GROUP BY c2.agents_id
	-- 	ORDER BY 3 DESC
	-- 	) d ON d.agents_id = c.id
	-- LIMIT 10;

 -- 	-- orders delivered by agent order by total (lowest)
	-- SELECT c.name As Name, d.cnt As 'Count', FORMAT(d.total, 0, 'ta_in') AS Amount, c.id
	-- FROM companies c INNER JOIN (
	-- 	SELECT c2.agents_id, COUNT(1) AS cnt, SUM(o.sub_total) AS total
	-- 	FROM   orders o INNER JOIN companies c1, companies c2, companies cA
	-- 	WHERE  o.sysorderstatuses_id = 4202
	-- 	AND    o.companies_id        = _companyid
	-- 	AND    o.companies_id        = c1.id
	-- 	AND    o.customers_id        = c2.id
	-- 	AND    c2.agents_id          = cA.id
	-- 	AND    cA.created > CASE WHEN DATEDIFF(_date, c1.created) > 90 THEN DATE_ADD(_date, INTERVAL -90 DAY) ELSE c1.created END
	-- 	AND     CASE WHEN _userid IS NOT NULL THEN c2.id ELSE -1 END IN 
	-- 										(
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.salesperson_id     = _userid
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4004
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u, companies a
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    c1.agents_id          = a.id
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         = 4005
	-- 												AND    u.companies_id        = a.id
	-- 												AND    c1.parent_id          = _companyid
	-- 												UNION ALL
	-- 												SELECT c1.id
	-- 												FROM   companies c1, users u
	-- 												WHERE  c1.syscompanytypes_id = 4702
	-- 												AND    u.id                  = _userid
	-- 												AND    u.sysroles_id         IN (4002,4003)
	-- 												AND    u.companies_id        = _companyid
	-- 												AND    c1.parent_id          = _companyid
	--                                                 UNION ALL
	--                                                 SELECT c2.id
	--                                                 FROM   companies c1, users u, companies c2
	--                                                 WHERE  c1.syscompanytypes_id = 4702
	--                                                 AND    u.id                  = _userid
	--                                                 AND    u.sysroles_id         IN (4030, 4031)
	--                                                 AND    u.companies_id        = c2.id
	--                                                 AND    c2.parent_id          = _companyid
	--                                                 AND    c1.id                 = u.companies_id
	-- 												UNION ALL
	-- 												SELECT -1
	-- 										 )
	-- 	GROUP BY c2.agents_id
	-- 	ORDER BY 3 ASC
	-- 	) d ON d.agents_id = c.id
	-- LIMIT 10;

	-- monthly order sub total
	SELECT DATE_FORMAT(orders.created, "%Y-%m") AS 'X', FORMAT(SUM(sub_total), 0, 'ta_in') as 'Y', COUNT(1) as 'Z', 'Month' AS 'X-NAME', 'Rs.' AS 'Y-NAME'
	FROM   orders
	WHERE  companies_id = _companyid
	AND    l_subscriptiontypeid IN (6300)
	AND    l_sysroleid IN (4002, 4003, 4004, 4005, 4030) -- admin, salesman, agent, customer
	AND    sysorderstatuses_id IN (4201, 4202, 4203)
	AND    EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
	AND    orders.created > DATE_ADD(_date, INTERVAL -24 MONTH)
	AND CASE WHEN _userid IS NOT NULL THEN orders.customers_id ELSE -1 END IN 
										(
												SELECT c1.id
												FROM   companies c1, users u
												WHERE  c1.syscompanytypes_id = 4702
												AND    c1.salesperson_id     = _userid
												AND    u.id                  = _userid
												AND    u.sysroles_id         = 4004
												AND    u.companies_id        = _companyid
												AND    c1.parent_id          = _companyid
												UNION ALL
												SELECT c1.id
												FROM   companies c1, users u, companies a
												WHERE  c1.syscompanytypes_id = 4702
												AND    c1.agents_id          = a.id
												AND    u.id                  = _userid
												AND    u.sysroles_id         = 4005
												AND    u.companies_id        = a.id
												AND    c1.parent_id          = _companyid
												UNION ALL
												SELECT c1.id
												FROM   companies c1, users u
												WHERE  c1.syscompanytypes_id = 4702
												AND    u.id                  = _userid
												AND    u.sysroles_id         IN (4002,4003)
												AND    u.companies_id        = _companyid
												AND    c1.parent_id          = _companyid
                                                UNION ALL
                                                SELECT c2.id
                                                FROM   companies c1, users u, companies c2
                                                WHERE  c1.syscompanytypes_id = 4702
                                                AND    u.id                  = _userid
                                                AND    u.sysroles_id         IN (4030, 4031)
                                                AND    u.companies_id        = c2.id
                                                AND    c2.parent_id          = _companyid
                                                AND    c1.id                 = u.companies_id
												UNION ALL
												SELECT -1
										 )
	GROUP BY DATE_FORMAT(created, "%Y-%m")
	ORDER BY 1;

	SELECT 1 AS linetype, 1 as sectionid, 'Pending Orders' AS description, _totalapprovalcount + _pendingdeliverycount as linecount, 0 AS linevalue, '' as color, 'linecount' as 'source'
	UNION
	SELECT 0, 1 as sectionid, 'My approval', _myapprovalcount, FORMAT(_myapprovalvalue, 0, 'ta_in'), '#E6EE9C', 'linecount' FROM dual WHERE _myapprovalcount > 0
	UNION
	SELECT 0, 1 as sectionid, 'All Approval', _totalapprovalcount, FORMAT(_totalapprovalvalue, 0, 'ta_in'), '#CDDC39', 'linecount' FROM dual WHERE _totalapprovalcount > 0
	UNION
	SELECT 0, 1 as sectionid, 'In Packing', _pendingdeliverycount, FORMAT(_pendingdeliveryvalue, 0, 'ta_in'), '#9E9D24', 'linecount' FROM dual WHERE _pendingdeliverycount > 0
	-- UNION
	-- SELECT 1 AS linetype, 2 as sectionid, 'Order Summary' AS description, _orderlast90dayscount + _orderlast30dayscount + _orderlast7dayscount as linecount, 0 AS linevalue, '' as color, 'linecount' as 'source'
	UNION
	SELECT 0, 2 as sectionid, 'Since 7 days', _orderlast7dayscount, FORMAT(_orderlast7daysvalue, 0, 'ta_in'), '#90CAF9', 'linecount' as 'source' FROM dual WHERE _orderlast7dayscount > 0
	UNION
	SELECT 0, 2 as sectionid, '7+ to 30 days', _orderlast30dayscount, FORMAT(_orderlast30daysvalue, 0, 'ta_in'), '#2196F3', 'linecount' as 'source' FROM dual WHERE _orderlast30dayscount > 0
	UNION
	SELECT 0, 2 as sectionid, '30+ days', _orderlast90dayscount, FORMAT(_orderlast90daysvalue, 0, 'ta_in'), '#0D47A1', 'linecount' as 'source' FROM dual WHERE _orderlast90dayscount > 0
	UNION
	SELECT 1 AS linetype, 3 as sectionid, 'Orders In Packing since' AS description, IFNULL(_orderinpackinglast3dayscount, 0) + IFNULL(_orderinpackinglast7dayscount, 0) + IFNULL(_orderinpackinglast30dayscount, 0) + IFNULL(_orderinpackinglast90dayscount, 0) as linecount, 0 AS linevalue, '' as color, 'linecount' as 'source'
	UNION
	SELECT 0, 3 as sectionid, '3 days', _orderinpackinglast3dayscount, FORMAT(IFNULL(_orderinpackinglast3daysvalue, 0), 0, 'ta_in'), '#b2dfdb' , 'linecount' as 'source'FROM dual WHERE _orderinpackinglast3dayscount > 0
	UNION
	SELECT 0, 3 as sectionid, '3+ to 7 days', _orderinpackinglast7dayscount, FORMAT(IFNULL(_orderinpackinglast7daysvalue, 0), 0, 'ta_in'), '#4DB6AC', 'linecount' as 'source' FROM dual WHERE _orderinpackinglast7dayscount > 0
	UNION
	SELECT 0, 3 as sectionid, '7+ to 30 days', _orderinpackinglast30dayscount, FORMAT(IFNULL(_orderinpackinglast30daysvalue, 0), 0, 'ta_in'), '#00897B', 'linecount' as 'source' FROM dual WHERE _orderinpackinglast30dayscount > 0
	UNION
	SELECT 0, 3 as sectionid, '30+ days', _orderinpackinglast90dayscount, FORMAT(IFNULL(_orderinpackinglast90daysvalue, 0), 0, 'ta_in'), '#004D40', 'linecount' as 'source' FROM dual WHERE _orderinpackinglast90dayscount > 0
	UNION
	-- SELECT 1 AS linetype, 4 as sectionid, 'Completed but Partial Delivery since' AS description, _pendingdeliverylast7dayscount + _pendingdeliverylast30dayscount + _pendingdeliverylast90dayscount as linecount, 0 AS linevalue, '' as color, 'linecount' as 'source'
	-- UNION
	-- SELECT 0, 4 as sectionid, '7 days', _pendingdeliverylast7dayscount, FORMAT(_pendingdeliverylast7daysvalue, 0, 'ta_in'), '#FFCC80', 'linecount' as 'source' FROM dual WHERE _pendingdeliverylast7dayscount > 0
	-- UNION
	-- SELECT 0, 4 as sectionid, '7+ to 30 days', _pendingdeliverylast30dayscount, FORMAT(_pendingdeliverylast30daysvalue, 0, 'ta_in'), '#FFA726', 'linecount' as 'source' FROM dual WHERE _pendingdeliverylast30dayscount > 0
	-- UNION
	-- SELECT 0, 4 as sectionid, '30+ days', _pendingdeliverylast90dayscount, FORMAT(_pendingdeliverylast90daysvalue, 0, 'ta_in'), '#EF6C00', 'linecount' as 'source' FROM dual WHERE _pendingdeliverylast90dayscount > 0
	-- UNION
	-- SELECT 1 AS linetype, 5 as sectionid, 'Orders In Workflow' AS description, CONCAT(ROUND(_total_workflow_count * 100 / _total_order_count), '%')  as linecount, 0 AS linevalue, '' as color, 'linecount' as 'source'
	-- UNION
	-- SELECT 0, 5 as sectionid, 'Order count', _total_order_count, FORMAT(_totalordersubtotal, 0, 'ta_in'), '#4E342E', 'linecount' as 'source' FROM dual WHERE _total_order_count > 0
	-- UNION
	-- SELECT 0, 5 as sectionid, 'Order in workflow', _total_workflow_count, FORMAT(_totalworkflowsubtotal, 0, 'ta_in'), '#8D6E63', 'linecount' as 'source' FROM dual WHERE _total_workflow_count > 0
	-- UNION
	SELECT 1 AS linetype, 6 as sectionid, 'Outstanding - Due' AS description, _pending_bills_count_last0 as linecount, 0 AS linevalue, '' as color, 'linevalue' as 'source'
	UNION
	SELECT 0, 6 as sectionid, 'Over 7 days', FORMAT(_pending_bills_count_last7, 0, 'ta_in'), FORMAT(_pending_bills_amount_last7, 0, 'ta_in'), '#C8E6C9', 'linevalue' as 'source' FROM dual WHERE _pending_bills_count_last7 > 0
	UNION
	SELECT 0, 6 as sectionid, 'Over 30 days', FORMAT(_pending_bills_count_last30, 0, 'ta_in'), FORMAT(_pending_bills_amount_last30, 0, 'ta_in'), '#66BB6A', 'linevalue' as 'source' FROM dual WHERE _pending_bills_count_last30 > 0
	UNION
	SELECT 0, 6 as sectionid, 'Total Due', FORMAT(_pending_bills_count_last0, 0, 'ta_in'), FORMAT(_pending_bills_amount_last0, 0, 'ta_in'), '#2E7D32', 'linevalue' as 'source' FROM dual WHERE _pending_bills_count_last0 > 0
	UNION
	SELECT 1 AS linetype, 7 as sectionid, 'Outstanding - Coming Due' AS description, _pending_bills_count_next0 as linecount, 0 AS linevalue, '' as color, 'linevalue' as 'source'
	UNION
	SELECT 0, 7 as sectionid, 'In 7 days', _pending_bills_count_next7, FORMAT(_pending_bills_amount_next7, 0, 'ta_in'), '#37474F', 'linevalue' as 'source' FROM dual WHERE _pending_bills_count_next7 > 0
	UNION
	SELECT 0, 7 as sectionid, 'In 30 days', _pending_bills_count_next30, FORMAT(_pending_bills_amount_next30, 0, 'ta_in'), '#78909C', 'linevalue' as 'source' FROM dual WHERE _pending_bills_count_next30 > 0
	UNION
	SELECT 0, 7 as sectionid, 'Total', _pending_bills_count_next0, FORMAT(_pending_bills_amount_next0, 0, 'ta_in'), '#CFD8DC', 'linevalue' as 'source' FROM dual WHERE _pending_bills_count_next0
	UNION
	SELECT 1 AS linetype, 8 as sectionid, 'Packing Slips - Pending' AS description, _totalpendinginvoicecount + _totalpendingdispatchcount as linecount, _totalpendinginvoicevalue + _totalpendingdispatchvalue AS linevalue, '' as color, 'linevalue' as 'source'
	UNION
	SELECT 0, 8 as sectionid, 'Pending Invoice', _totalpendinginvoicecount, FORMAT(_totalpendinginvoicevalue, 0, 'ta_in'), '#FFCC80', 'linevalue' as 'source' FROM dual WHERE _totalpendinginvoicecount > 0
	UNION
	SELECT 0, 8 as sectionid, 'Pending Dispatch', _totalpendingdispatchcount, FORMAT(_totalpendingdispatchvalue, 0, 'ta_in'), '#FFA726', 'linevalue' as 'source' FROM dual WHERE _totalpendingdispatchcount > 0
	UNION
	SELECT 1 AS linetype, 9 as sectionid, 'Delivery Notes - Pending' AS description, _totalpendinglrcount + _pendingdeliverydispatchcount as linecount, _totalpendinglrvalue + _pendingdeliverydispatchvalue AS linevalue, '' as color, 'linevalue' as 'source'
	UNION
	SELECT 0, 9 as sectionid, 'Pending LR', _totalpendinglrcount, FORMAT(_totalpendinglrvalue, 0, 'ta_in'), '#4E342E', 'linevalue' as 'source' FROM dual WHERE _totalpendinglrcount > 0
	UNION
	SELECT 0, 9 as sectionid, 'Pending Dispatch', _pendingdeliverydispatchcount, FORMAT(_pendingdeliverydispatchvalue, 0, 'ta_in'), '#8D6E63', 'linevalue' as 'source' FROM dual WHERE _pendingdeliverydispatchcount > 0;

	-- tabs
	SELECT 5 as linetype, 'Outstanding - Total' as description, CONCAT(FORMAT(ROUND(_pending_bills_amount_last0/1000), 0, 'ta_in'), 'k') as value, '#FC3B3B' as color FROM DUAL WHERE EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_OUTSTANDING')) AND EXISTS (SELECT 1 FROM role_permissions WHERE roles_id = l_roleid AND syspermissions_id = 5650 AND value = '1')
	UNION
	SELECT 5 as linetype, 'Outstanding - 30+ Days' as description, CONCAT(FORMAT(ROUND(_pending_bills_amount_last30/1000), 0, 'ta_in'), 'k') as value, '#FC3B3B' as color FROM DUAL WHERE EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_OUTSTANDING')) AND EXISTS (SELECT 1 FROM role_permissions WHERE roles_id = l_roleid AND syspermissions_id = 5650 AND value = '1')
	UNION
	SELECT 5 as linetype, 'Outstanding - 7 Days' as description, CONCAT(FORMAT(ROUND(_pending_bills_amount_next7/1000), 0, 'ta_in'), 'k') as value, '#8D6E63' as color FROM DUAL WHERE EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_OUTSTANDING')) AND EXISTS (SELECT 1 FROM role_permissions WHERE roles_id = l_roleid AND syspermissions_id = 5650 AND value = '1')
	UNION
	SELECT 5 as linetype, 'Orders in Packing' as description, FORMAT(IFNULL(_pendingdeliverycount, 0), 0, 'ta_in') as value, '#8D6E63' as color FROM DUAL WHERE EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
	UNION
	SELECT 5 as linetype, 'Active Agents' as description, _total_agents as value, '#00695C' as color FROM DUAL WHERE _total_agents > -1 AND EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_AGENTS'))
	UNION
	SELECT 5 as linetype, 'Active Customers' as description,  _total_customers as value, '#00695C' as color FROM DUAL WHERE _total_customers > -1 
	UNION
	SELECT 5 as linetype, '% of workflow' as description,  _perc_of_workflow as value, CASE WHEN _perc_of_workflow > 20 THEN '#00695C' WHEN _perc_of_workflow > 80 THEN '#FC3B3B' ELSE '#FC993B' END as color FROM DUAL WHERE _perc_of_workflow > -1 AND l_sysroleid <> 4002 AND EXISTS (SELECT 1 FROM configurations conf WHERE companies_id = _companyid AND value = '1' AND sysconfigurations_id = (SELECT id FROM sysconfigurations WHERE name = 'MODULE_ORDERS'))
	UNION
	-- SELECT 5 as linetype, 'Workflow - Variance' as description, _variance_count as value, '#FC993B' as color FROM DUAL WHERE _variance_count > -1
	-- UNION
	-- SELECT 5 as linetype, 'Workflow - Credit Days' as description, _days_count as value, '#FC993B' as color FROM DUAL WHERE _days_count > -1
	-- UNION
	-- SELECT 5 as linetype, 'Workflow - Credit Limit' as description, _limit_count as value, '#FC993B' as color FROM DUAL WHERE _limit_count > -1
	-- UNION
	-- SELECT 5 as linetype, 'Customers with no order 90 days' as description,  _no_order_90_days as value, '#FC3B3B' as color FROM DUAL WHERE _no_order_90_days > -1
	-- UNION
	SELECT 5 as linetype, 'Agent Login in 90 days' as description,  _number_agent_login_90_days as value, '#FC993B' as color FROM DUAL WHERE _number_agent_login_90_days > -1
	UNION
	SELECT 5 as linetype, 'Customer Login in 90 days' as description, _number_customer_login_90_days as value, '#FC993B' as color FROM DUAL WHERE _number_customer_login_90_days > -1;
 
	-- TOP 5 Products - In terms of value (last 30 days)

	-- New products last 7 days

	-- Last 5 delivery notes updated

	-- Earned commission (today, last 7 days, last 30 days, last 90 days) (agent only)

	-- Profit (cost vs sale difference) ONLY for 4002 - Owner - (sale - cost - commission)

	-- Top 20 most profitable items (owner only)

	-- Top 20 lowest profitable items (owner only)

	-- Transport wise - pending bale count (internal users only)

END;
// 
delimiter ;
