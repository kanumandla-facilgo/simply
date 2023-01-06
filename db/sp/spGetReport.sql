DROP PROCEDURE IF EXISTS spGetReport;

delimiter //

CREATE PROCEDURE spGetReport
               (
                 OUT errorcode		INT, 
                 OUT errormsg		VARCHAR(512),
                 OUT _totalrecords	INT,
                     _companyid		INT,
                     _reportid      INT,
                     _userid        INT,
                     _statusid      INT,
                     _datefrom      DATETIME,
                     _dateto        DATETIME,
                     _customerid    INT,
                     _option1       INT,
					 _currentpage   INT,
					 _recordsperpage INT
               )
DETERMINISTIC
READS SQL DATA

main: BEGIN

	DECLARE offsetrecords  INT;
	DECLARE l_notfound     INT;
	DECLARE l_new_product_days INT;

	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET l_notfound=1;

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

	SET errorcode  = 0;
	SET errormsg   = 'Success';
	SET offsetrecords = (_currentpage -1 ) *_recordsperpage;

	IF _reportid = 1 THEN

		SELECT 'id' as 'id', 'name' as 'name', 'sku' as 'sku', 'stock_in_process_quote' as 'stock_quote', 'stock_in_process_qty' as 'stock_qty';

		SELECT 1 as col1, 2 as col2, 2 as col3, 3 as col4, 3 as col5; /* 1 => int, 2 => char, 3 => float, 4 => date */

		SELECT SQL_CALC_FOUND_ROWS products.id, products.name, products.sku, products.stock_in_process_quote as 'stock_quote', products.stock_in_process_qty as 'stock_qty'
		FROM   products
		WHERE  products.companies_id = _companyid
		AND    (products.stock_in_process_quote != 0 OR products.stock_in_process_qty != 0)
		ORDER BY products.name;
--		ORDER BY p.name LIMIT offsetrecords, _recordsperpage;

	ELSEIF _reportid = 2 THEN

		SELECT 'company' as 'company', 'first_name' as 'first_name', 'last_name' as 'last_name', 'login_name' as 'login_name';

		SELECT 2 as col1, 2 as col2, 2 as col3, 2 as col4; /* 1 => int, 2 => char, 3 => float, 4 => date */

		SELECT SQL_CALC_FOUND_ROWS DISTINCT c.name as 'company', u.first_name, u.last_name, u.login_name 
		FROM users u, companies c, sessions s, companies c2
		WHERE s.users_id = u.id 
		AND u.companies_id = c.id
		AND c.parent_id = c2.id
		AND CASE WHEN u.sysroles_id = 4002 OR u.sysroles_id = 4003 OR u.sysroles_id = 4004 THEN u.companies_id = _companyid ELSE c2.id = _companyid END
		AND s.created > DATE_ADD(now(), INTERVAL _option1 * -1 DAY)
		ORDER BY 1;

	ELSEIF _reportid = 3 THEN -- customer last updated

		-- SELECT 'code' as 'code', 'customer_name' as 'customer_name', 'balance_sync_on' as 'balance_sync_on', 'overdue_sync_on' as 'overdue_sync_on', 'created_on' as 'created_on', 'last_updated_on' as 'last_updated_on';

		-- SELECT 2 as col1, 2 as col2, 4 as col3, 4 as col4, 4 as col5, 4 as col6; /* 1 => int, 2 => char, 3 => float, 4 => date */

		-- SELECT SQL_CALC_FOUND_ROWS DISTINCT c.code as 'code', c.name as 'customer_name', DATE_FORMAT(c.current_balance_sync_date, '%Y-%m-%d') as 'balance_sync_on', DATE_FORMAT(c.current_overdue_sync_date, '%Y-%m-%d') as 'overdue_sync_on', DATE_FORMAT(c.created, '%Y-%m-%d') as 'created_on', DATE_FORMAT(c.last_updated, '%Y-%m-%d') as 'last_updated_on'
		-- FROM companies c
		-- WHERE c.parent_id = _companyid
		-- AND  c.syscompanytypes_id = 4702
		-- AND  c.last_updated > DATE_ADD(now(), INTERVAL _option1 * -1 DAY)
		-- ORDER BY 2;

		SELECT 'name' as 'name', 'earliest_date' as 'earliest_date', 'latest_date' as 'latest_date', 'count' as 'count', 'balance' as 'balance';

		SELECT 2 as col1, 4 as col2, 4 as col3, 1 as col4, 3 as col5; /* 1 => int, 2 => char, 3 => float, 4 => date */

		SELECT SQL_CALC_FOUND_ROWS DISTINCT c.name as 'name', DATE_FORMAT(b.min_due_date, '%Y-%m-%d') as 'earliest_date', DATE_FORMAT(b.max_due_date, '%Y-%m-%d') as 'latest_date', b.cnt as 'count', b.amount as 'balance'
		FROM (
			SELECT c.agents_id, min(due_date) as min_due_date, max(due_date) as max_due_date, count(1) as cnt, round(sum(balance_amount),0) as amount
			FROM pending_bills b, companies c
			WHERE b.companies_id = _companyid
			AND b.customers_id =  c.id
			AND b.due_date < now()
			GROUP BY c.agents_id
			) b, companies c
		WHERE b.agents_id = c.id ORDER BY 5 desc;

	ELSEIF _reportid = 4 THEN -- pending sync

		SELECT 'code' as 'code', 'customer_name' as 'customer_name', 'balance_sync_on' as 'balance_sync_on', 'overdue_sync_on' as 'overdue_sync_on', 'created_on' as 'created_on', 'last_updated_on' as 'last_updated_on';

		SELECT 2 as col1, 2 as col2, 4 as col3, 4 as col4, 4 as col5, 4 as col6; /* 1 => int, 2 => char, 3 => float, 4 => date */

		SELECT SQL_CALC_FOUND_ROWS DISTINCT c.code as 'code', c.name as 'customer_name', DATE_FORMAT(c.current_balance_sync_date, '%Y-%m-%d') as 'balance_sync_on', DATE_FORMAT(c.current_overdue_sync_date, '%Y-%m-%d') as 'overdue_sync_on', DATE_FORMAT(c.created, '%Y-%m-%d') as 'created_on', DATE_FORMAT(c.last_updated, '%Y-%m-%d') as 'last_updated_on'
		FROM companies c
		WHERE c.parent_id = _companyid
		AND  c.syscompanytypes_id = 4702
		AND  c.syssyncstatuses_id = 4100
		ORDER BY 2;

	ELSEIF _reportid = 5 THEN -- Inventory Report

		SET group_concat_max_len=15000;

		SELECT 'name' as 'name', 'sku_list' as 'sku_list';

		SELECT 2 as col1, 2 as col2; /* 1 => int, 2 => char, 3 => float, 4 => date */

		SELECT value
		INTO   l_new_product_days
		FROM   sysconfigurations sc, configurations c
		WHERE  sc.name = 'product_new_show_x_days'
		AND    sc.id = c.sysconfigurations_id
		AND    c.companies_id = _companyid;

		IF l_new_product_days IS NULL THEN
			SET l_new_product_days = 0;
		END IF;

		-- good one
		SELECT SQL_CALC_FOUND_ROWS d.name as name, d.sku_list
		FROM (
			SELECT ch.name AS category_name, c.name AS name, GROUP_CONCAT(p.sku ORDER BY p.sku SEPARATOR ', ') AS sku_list 
			FROM categories r, categories ch, categories c, product_categories pc, products p
			WHERE r.is_root = 1
			AND   r.companies_id = _companyid
			AND   ch.parent_id = r.id
			AND   c.parent_id = ch.id
			AND   p.statuses_id = 4600
--			AND   (p.stock_qty - p.stock_in_process_qty > 0 OR p.created > DATE_ADD(now(), interval l_new_product_days * -1 day)) 
			AND   (p.is_hidden_no_stock = 0 OR (p.stock_quote - p.stock_in_process_quote > 0 AND p.stock_qty - p.stock_in_process_qty > 0) OR p.created > DATE_ADD(now(), interval l_new_product_days * -1 day))
			AND   pc.categories_id = c.id
			AND   pc.products_id = p.id
			GROUP BY ch.name, c.name
			UNION
			SELECT ch.name AS category_name, c.name AS name, GROUP_CONCAT(p.sku ORDER BY p.sku SEPARATOR ', ') AS sku_list 
			FROM categories r, categories ch, categories c, product_categories pc, products p
			WHERE r.is_root = 1
			AND   r.companies_id = _companyid
			AND   ch.parent_id = r.id
			AND   c.lineage LIKE CONCAT(ch.lineage, '%', '|', c.parent_id, '|%')
			AND   p.statuses_id = 4600
--			AND   (p.stock_qty - p.stock_in_process_qty > 0 OR p.created > DATE_ADD(now(), interval l_new_product_days * -1 day)) 
			AND   (p.is_hidden_no_stock = 0 OR (p.stock_quote - p.stock_in_process_quote > 0 AND p.stock_qty - p.stock_in_process_qty > 0) OR p.created > DATE_ADD(now(), interval l_new_product_days * -1 day))
			AND   pc.categories_id = c.id
			AND   pc.products_id = p.id
			GROUP BY ch.name, c.name
			ORDER BY 1, 2
		) d;

	ELSE

		SELECT * FROM sysstatuses WHERE 1 = 2;

	END IF;

	SELECT FOUND_ROWS() INTO _totalrecords;

END;
// 
delimiter ;
