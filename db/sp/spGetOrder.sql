DROP PROCEDURE IF EXISTS spGetOrder;

delimiter //

CREATE PROCEDURE spGetOrder
            (
                OUT errorcode           INT, 
                OUT errormsg            VARCHAR(512),
                OUT _totalrecords       INT,
                    _companyid          INT,
                    _id                 INT,
                    _userid             INT,
                    _agentid            INT,
                    _customerid         INT,
                    _statusid           INT,
                    _deliverystatusid   INT,
                    _productid          INT,
                    _order_number       VARCHAR(64),
                    _datefrom           DATETIME,
                    _dateto             DATETIME,
                    _datetype           INT,
                    _myapprovalonly     INT,
                    _currentpage        INT,
                    _recordsperpage     INT,
                    _sortby             VARCHAR(32),
                    _sortorder          INT
            )
DETERMINISTIC
READS SQL DATA

main: BEGIN
    DECLARE offsetrecords  INT;
    DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET errorcode=200;

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
    

        SELECT SQL_CALC_FOUND_ROWS orders.*,
               sos.name AS 'order_status_name',
               action_roles_id AS `pending_approval_rolesid`,
               r.name AS 'pending_approval_rolename',
               CONCAT(u.first_name, ' ', u.last_name) AS 'creator',
               CONCAT(ap.first_name, ' ', ap.last_name) AS 'approver',
               cus.name AS 'customer_name',
               cn.active AS 'is_notification_on',
               pt.code as 'payment_term_name',
               ds.name as 'delivery_status_name' 
        FROM orders
        INNER JOIN sysorderstatuses sos ON sos.id = orders.sysorderstatuses_id
        INNER JOIN users u ON u.id= orders.orderusers_id
        INNER JOIN companies cus ON cus.id= orders.customers_id AND cus.syscompanytypes_id = 4702
        INNER JOIN customer_notifications cn ON cn.customers_id = cus.id AND cn.sysnotificationtypes_id = 5801
        INNER JOIN payment_terms pt ON pt.id = orders.payment_terms_id
        INNER JOIN sysdeliverystatuses ds ON ds.id = orders.sysdeliverystatuses_id
        LEFT JOIN users ap ON ap.id= orders.approverusers_id
        LEFT JOIN order_workflow_routes owr ON owr.orders_id = orders.id
        AND owr.sysworkflowstatuses_id = 5100
        AND orders.sysorderstatuses_id = 4203
        LEFT JOIN roles r ON r.id=owr.action_roles_id
        WHERE orders.companies_id = CASE WHEN _companyid = 1 THEN orders.companies_id ELSE _companyid END
        AND   CASE WHEN _id IS NOT NULL THEN orders.id ELSE 1 END = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END 
        AND   CASE WHEN _agentid IS NOT NULL THEN cus.agents_id ELSE 1 END = CASE WHEN _agentid IS NOT NULL THEN _agentid ELSE 1 END 
        AND   CASE WHEN _customerid IS NOT NULL THEN orders.customers_id ELSE 1 END = CASE WHEN _customerid IS NOT NULL THEN _customerid ELSE 1 END 
        AND   CASE WHEN _statusid IS NOT NULL THEN orders.sysorderstatuses_id ELSE 1 END = CASE WHEN _statusid IS NOT NULL THEN _statusid ELSE 1 END 
        AND   CASE WHEN _deliverystatusid IS NOT NULL THEN orders.sysdeliverystatuses_id ELSE 1 END = CASE WHEN _deliverystatusid IS NOT NULL THEN _deliverystatusid ELSE 1 END 
        AND   CASE WHEN _order_number IS NOT NULL THEN orders.order_number ELSE 1 END = CASE WHEN _order_number IS NOT NULL THEN _order_number ELSE 1 END 
        AND   CASE WHEN _productid IS NOT NULL THEN EXISTS (SELECT 1 FROM order_details d WHERE d.products_id = _productid AND d.orders_id = orders.id) ELSE 1 = 1 END 
        AND   CASE WHEN _myapprovalonly = 1 THEN EXISTS (SELECT 1 FROM order_workflow_routes r, users u where r.orders_id = orders.id AND u.id = _userid AND r.action_roles_id = u.roles_id) ELSE 1 = 1 END
        AND   CASE WHEN _datefrom IS NOT NULL THEN orders.created /*orders.order_date*/ ELSE 1 END
             >= CASE WHEN _datefrom IS NOT NULL THEN _datefrom ELSE 1 END
        AND   CASE WHEN _dateto IS NOT NULL THEN orders.created ELSE 1 END
             < CASE WHEN _dateto IS NOT NULL THEN DATE_ADD(_dateto, INTERVAL 1 DAY) ELSE 2 END
        AND   CASE WHEN _userid IS NOT NULL THEN cus.id ELSE -1 END IN 
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
                                                UNION ALL -- super admin for api
                                                SELECT c2.id
                                                FROM   companies c2
                                                WHERE  c2.syscompanytypes_id = 4702
                                                AND    EXISTS ( SELECT  1 
                                                                FROM    companies c1, users u
                                                                WHERE   c1.id                 = u.companies_id
                                                                AND     u.id                  = _userid
                                                                AND     u.companies_id        = _companyid
                                                                AND     u.sysroles_id         IN (4000)
                                                        )
                                                UNION ALL
                                                SELECT -1
                                        )
    ORDER BY
        CASE WHEN _sortby = "id" AND _sortorder = -1 THEN orders.id END DESC,
        CASE WHEN _sortby = "id" THEN orders.id END,
        CASE WHEN _sortby = "onumber" AND _sortorder = -1 THEN orders.order_number END DESC,
        CASE WHEN _sortby = "onumber" THEN orders.order_number END,
        CASE WHEN _sortby = "cname" AND _sortorder = -1 THEN cus.name END DESC,
        CASE WHEN _sortby = "cname" THEN cus.name END,
        CASE WHEN _sortby = "atype" AND _sortorder = -1 THEN r.name END DESC,
        CASE WHEN _sortby = "atype" THEN r.name END,
        CASE WHEN _sortby = "aname" AND _sortorder = -1 THEN CONCAT(ap.first_name, ' ', ap.last_name) END DESC,
        CASE WHEN _sortby = "aname" THEN CONCAT(ap.first_name, ' ', ap.last_name) END,
        CASE WHEN _sortby = "creator" AND _sortorder = -1 THEN CONCAT(u.first_name, ' ', u.last_name) END DESC,
        CASE WHEN _sortby = "creator" THEN CONCAT(u.first_name, ' ', u.last_name) END,
        CASE WHEN _sortby = "date" AND _sortorder = -1 THEN orders.created END DESC,
        CASE WHEN _sortby = "date" THEN orders.created END,
        CASE WHEN _sortby = "total" AND _sortorder = -1 THEN ( orders.sub_total + orders.ship_total + orders.tax_total - orders.discount_total ) END DESC,
        CASE WHEN _sortby = "total" THEN ( orders.sub_total + orders.ship_total + orders.tax_total - orders.discount_total ) END,
        CASE WHEN _sortby = "status" AND _sortorder = -1 THEN sos.name END DESC,
        CASE WHEN _sortby = "status" THEN sos.name END,
        CASE WHEN _sortby = "dstatus" AND _sortorder = -1 THEN ds.name END DESC,
        CASE WHEN _sortby = "dstatus" THEN ds.name END,
        CASE WHEN _sortby IS NULL THEN orders.id END DESC
    LIMIT offsetrecords, _recordsperpage;

    SELECT FOUND_ROWS() INTO _totalrecords;
    
END;
// 
delimiter ;
