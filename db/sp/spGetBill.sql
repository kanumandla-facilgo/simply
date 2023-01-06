DROP PROCEDURE IF EXISTS spGetBill;

delimiter //

CREATE PROCEDURE spGetBill
            (
                OUT errorcode           INT, 
                OUT errormsg            VARCHAR(512),
                OUT _totalrecords       INT,
                    _companyid          INT,
                    _id                 INT,
                    _userid             INT,
                    _customerid         INT,
                    _statusid           INT,
                    _bill_number        VARCHAR(64),
                    _bill_ref_number    VARCHAR(64),
                    _status_id          INT,
                    _billdatefrom       DATETIME,
                    _billdateto         DATETIME,
                    _duedatefrom        DATETIME,
                    _duedateto          DATETIME,
                    _nextreminderfrom   DATETIME,
                    _nextreminderto     DATETIME,
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

    SELECT SQL_CALC_FOUND_ROWS p.*, sp.name as status_name, cus.id AS 'customer_id',
            cus.name AS 'customer_name', cus.code AS 'customer_code',
            ad.phone1 AS 'customer_phone', ad.email1 AS 'customer_email'
    FROM pending_bills p
    INNER JOIN companies cus ON cus.id = p.customers_id AND cus.syscompanytypes_id = 4702
    INNER JOIN addresses ad on cus.addresses_id = ad.id
    INNER JOIN syspaymentstatuses sp ON p.syspaymentstatuses_id = sp.id
    WHERE p.companies_id = CASE WHEN _companyid = 1 THEN p.companies_id ELSE _companyid END
    AND   CASE WHEN _id IS NOT NULL THEN p.id ELSE 1 END = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END 
    AND   CASE WHEN _customerid IS NOT NULL THEN p.customers_id ELSE 1 END = CASE WHEN _customerid IS NOT NULL THEN _customerid ELSE 1 END 
    AND   CASE WHEN _bill_number IS NOT NULL THEN p.bill_number = _bill_number ELSE 1 = 1 END
    AND   CASE WHEN _bill_ref_number IS NOT NULL THEN p.bill_ref_number = _bill_ref_number ELSE 1 = 1 END
    AND   CASE WHEN _status_id IS NOT NULL THEN p.syspaymentstatuses_id = _status_id ELSE 1 = 1 END
    AND   CASE WHEN _duedatefrom IS NOT NULL THEN p.due_date  ELSE 1 END
         >= CASE WHEN _duedatefrom IS NOT NULL THEN _duedatefrom ELSE 1 END
    AND   CASE WHEN _duedateto IS NOT NULL THEN p.due_date ELSE 1 END 
         < CASE WHEN _duedateto IS NOT NULL THEN DATE_ADD(_duedateto, INTERVAL 1 DAY) ELSE 2 END
    AND   CASE WHEN _billdatefrom IS NOT NULL THEN p.bill_date  ELSE 1 END
         >= CASE WHEN _billdatefrom IS NOT NULL THEN _billdatefrom ELSE 1 END
    AND   CASE WHEN _billdateto IS NOT NULL THEN p.bill_date ELSE 1 END 
         < CASE WHEN _billdateto IS NOT NULL THEN DATE_ADD(_billdateto, INTERVAL 1 DAY) ELSE 2 END
    AND   CASE WHEN _nextreminderfrom IS NOT NULL THEN p.next_reminder_date  ELSE 1 END
         >= CASE WHEN _nextreminderfrom IS NOT NULL THEN _nextreminderfrom ELSE 1 END
    AND   CASE WHEN _nextreminderto IS NOT NULL THEN p.next_reminder_date ELSE 1 END 
         < CASE WHEN _nextreminderto IS NOT NULL THEN DATE_ADD(_nextreminderto, INTERVAL 1 DAY) ELSE 2 END
    AND   CASE WHEN _statusid IS NOT NULL THEN p.syspaymentstatuses_id ELSE 1 END = CASE WHEN _statusid IS NOT NULL THEN _statusid ELSE 1 END 
    AND  cus.id IN 
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
         CASE WHEN _sortby = "bill_number" AND _sortorder = -1 THEN p.bill_number END DESC,
         CASE WHEN _sortby = "bill_number" THEN p.bill_number END,
         CASE WHEN _sortby = "bill_date" AND _sortorder = -1 THEN p.bill_date END DESC,
         CASE WHEN _sortby = "bill_date" THEN p.bill_date END,
         CASE WHEN _sortby = "due_date" AND _sortorder = -1 THEN p.due_date END DESC,
         CASE WHEN _sortby = "due_date" THEN p.due_date END,
         CASE WHEN _sortby = "next_reminder_date" AND _sortorder = -1 THEN p.next_reminder_date END DESC,
         CASE WHEN _sortby = "next_reminder_date" THEN p.next_reminder_date END,
         CASE WHEN _sortby = "bill_ref_number" AND _sortorder = -1 THEN p.bill_ref_number END DESC,
         CASE WHEN _sortby = "bill_ref_number" THEN p.bill_ref_number END,
         CASE WHEN _sortby = "cname" AND _sortorder = -1 THEN cus.name END DESC,
         CASE WHEN _sortby = "cname" THEN cus.name END,
         CASE WHEN _sortby = "amount" AND _sortorder = -1 THEN p.balance_amount END DESC,
         CASE WHEN _sortby = "amount" THEN p.balance_amount END,
         CASE WHEN _sortby IS NULL THEN p.id END DESC
    LIMIT offsetrecords, _recordsperpage;
    
    SELECT FOUND_ROWS() INTO _totalrecords;
    
END;
// 
delimiter ;
