DROP PROCEDURE IF EXISTS spGetPackingslip;

delimiter //

CREATE PROCEDURE spGetPackingslip
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
                    _deliverynoteid     INT,
                    _productid          INT,
                    _slip_number        VARCHAR(64),
                    _gate_pass_number   VARCHAR(32),
                    _datefrom           DATETIME,
                    _dateto             DATETIME,
                    _datetype           INT,
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
    SET errorcode  = 0;
    SET errormsg   = 'Success';
    SET offsetrecords = (_currentpage -1 ) *_recordsperpage;

    SELECT SQL_CALC_FOUND_ROWS p.*,
               sps.name AS 'status_name',
               o.customers_id,
               CONCAT(u.first_name, ' ', u.last_name) AS 'creator',
               cus.name AS 'customer_name',
               o.order_number as 'order_number',
               dn.note_number as 'note_number',
               g.gate_pass_number as 'gate_pass_number',
               g.id as "gate_pass_id",
               g.sysgatepassstatuses_id as "gate_pass_status"
    FROM packing_slips p
    INNER JOIN syspackingslipstatuses sps ON sps.id = p.syspackingslipstatuses_id
    INNER JOIN users u ON u.id= p.users_id
    INNER JOIN orders o ON o.id = p.orders_id
    INNER JOIN companies cus ON cus.id= o.customers_id AND cus.syscompanytypes_id = 4702
    LEFT JOIN delivery_notes dn ON p.delivery_notes_id = dn.id
    LEFT JOIN (select g.gate_pass_number, g.sysgatepassstatuses_id, g.id, gd.packing_slips_id from gate_pass_details gd INNER JOIN gate_passes g on g.id = gd.gate_passes_id AND g.sysgatepassstatuses_id = 6202) g on p.id = g.packing_slips_id
    WHERE p.companies_id = CASE WHEN _companyid = 1 THEN p.companies_id ELSE _companyid END
    AND   CASE WHEN _id IS NOT NULL THEN p.id ELSE 1 END = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END 
    AND   CASE WHEN _agentid IS NOT NULL THEN cus.agents_id ELSE 1 END = CASE WHEN _agentid IS NOT NULL THEN _agentid ELSE 1 END 
    AND   CASE WHEN _customerid IS NOT NULL THEN o.customers_id ELSE 1 END = CASE WHEN _customerid IS NOT NULL THEN _customerid ELSE 1 END 
    AND   CASE WHEN _statusid IS NOT NULL THEN p.syspackingslipstatuses_id ELSE 1 END = CASE WHEN _statusid IS NOT NULL THEN _statusid ELSE 1 END 
    AND   CASE WHEN _slip_number IS NOT NULL THEN p.packing_slip_number ELSE 1 END = CASE WHEN _slip_number IS NOT NULL THEN _slip_number ELSE 1 END 
    AND   CASE WHEN _productid IS NOT NULL THEN EXISTS (SELECT 1 FROM packing_slip_details d WHERE d.products_id = _productid AND d.packing_slips_id = p.id) ELSE 1 = 1 END 
    AND   CASE WHEN _gate_pass_number IS NOT NULL THEN  g.gate_pass_number ELSE 1 END = CASE WHEN _gate_pass_number IS NOT NULL THEN _gate_pass_number ELSE 1 END 
    AND   CASE WHEN _datetype IS NOT NULL THEN 
          CASE WHEN _datetype = 1 THEN p.packing_date ELSE p.created END
          ELSE
             1
          END
         >= CASE WHEN _datetype IS NOT NULL THEN _datefrom ELSE 1 END
    AND   CASE WHEN _datetype IS NOT NULL AND _dateto IS NOT NULL THEN 
          CASE WHEN _datetype = 1 THEN p.packing_date ELSE p.created END
          ELSE
             1
          END
         < CASE WHEN _datetype IS NOT NULL AND _dateto IS NOT NULL THEN DATE_ADD(_dateto, INTERVAL 1 DAY) ELSE 2 END
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
        CASE WHEN _sortby = "id" AND _sortorder = -1 THEN p.id END DESC,
        CASE WHEN _sortby = "id" THEN p.id END,
        CASE WHEN _sortby = "slipnumber" AND _sortorder = -1 THEN p.packing_slip_number END DESC,
        CASE WHEN _sortby = "slipnumber" THEN p.packing_slip_number END,
        CASE WHEN _sortby = "date" AND _sortorder = -1 THEN p.packing_date END DESC,
        CASE WHEN _sortby = "date" THEN p.packing_date END,
        CASE WHEN _sortby = "onumber" AND _sortorder = -1 THEN o.order_number END DESC,
        CASE WHEN _sortby = "onumber" THEN o.order_number END,
        CASE WHEN _sortby = "nnumber" AND _sortorder = -1 THEN dn.note_number END DESC,
        CASE WHEN _sortby = "nnumber" THEN dn.note_number END,
        CASE WHEN _sortby = "cname" AND _sortorder = -1 THEN cus.name END DESC,
        CASE WHEN _sortby = "cname" THEN cus.name END,
        CASE WHEN _sortby = "gpassno" AND _sortorder = -1 THEN g.gate_pass_number END DESC,
        CASE WHEN _sortby = "gpassno" THEN g.gate_pass_number END,
        CASE WHEN _sortby = "status" AND _sortorder = -1 THEN sps.name END DESC,
        CASE WHEN _sortby = "status" THEN sps.name END,
        CASE WHEN _sortby = "creator" AND _sortorder = -1 THEN CONCAT(u.first_name, ' ', u.last_name) END DESC,
        CASE WHEN _sortby = "creator" THEN CONCAT(u.first_name, ' ', u.last_name) END,
        CASE WHEN _sortby IS NULL THEN p.id END DESC
    LIMIT offsetrecords, _recordsperpage;
    
    SELECT FOUND_ROWS() INTO _totalrecords;
    
END;
// 
delimiter ;
