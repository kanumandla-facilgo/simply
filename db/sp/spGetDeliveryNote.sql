DROP PROCEDURE IF EXISTS spGetDeliveryNote;

delimiter //

CREATE PROCEDURE spGetDeliveryNote
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
                    _productid          INT,
                    _note_number        VARCHAR(64),
                    _invoice_number     VARCHAR(32),
                    _lr_number          VARCHAR(32),
                    _gate_pass_number   VARCHAR(32),
                    _datefrom           DATETIME,
                    _dateto             DATETIME,
                    _datetype           INT,
                    _sync_status_id     INT,
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

    /*DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
         SET errorcode  = -300;
         SET errormsg   = 'Error';
         ROLLBACK;
     END;*/

    SET errorcode  = 0;
    SET errormsg   = 'Success';
    SET offsetrecords = (_currentpage -1 ) *_recordsperpage;
    
    SELECT SQL_CALC_FOUND_ROWS d.*,
               sds.name AS 'status_name',
               u.first_name AS 'user_first_name',
               u.last_name AS 'user_last_name',
               u.login_name AS 'user_login_name',
               cus.name AS 'customer_name',
               (select count(distinct packing_slips_id) from delivery_note_details where delivery_notes_id = d.id) as 'bale_count',
               t.name AS 'transporter_name', t.external_code as 'transporter_external_code'
    FROM delivery_notes d
    INNER JOIN sysdeliverynotestatuses sds ON sds.id = d.sysdeliverynotestatuses_id
    INNER JOIN users u ON u.id = d.users_id
    INNER JOIN companies cus ON cus.id= d.customers_id AND cus.syscompanytypes_id = 4702
    INNER JOIN transporters t ON d.transporters_id = t.id
    WHERE d.companies_id = CASE WHEN _companyid = 1 THEN d.companies_id ELSE _companyid END
    AND   CASE WHEN _id IS NOT NULL THEN d.id ELSE 1 END = CASE WHEN _id IS NOT NULL THEN _id ELSE 1 END 
    AND   CASE WHEN _agentid IS NOT NULL THEN cus.agents_id ELSE 1 END =  CASE WHEN _agentid IS NOT NULL THEN _agentid ELSE 1 END 
    AND   CASE WHEN _customerid IS NOT NULL THEN d.customers_id ELSE 1 END = CASE WHEN _customerid IS NOT NULL THEN _customerid ELSE 1 END 
    AND   CASE WHEN _statusid IS NOT NULL THEN d.sysdeliverynotestatuses_id ELSE 1 END = CASE WHEN _statusid IS NOT NULL THEN _statusid ELSE 1 END 
    AND   CASE WHEN _note_number IS NOT NULL THEN d.note_number ELSE 1 END = CASE WHEN _note_number IS NOT NULL THEN _note_number ELSE 1 END 
    AND   CASE WHEN _invoice_number IS NOT NULL THEN d.invoice_number ELSE 1 END = CASE WHEN _invoice_number IS NOT NULL THEN _invoice_number ELSE 1 END 
    AND   CASE WHEN _lr_number IS NOT NULL THEN d.lr_number ELSE 1 END = CASE WHEN _lr_number IS NOT NULL THEN _lr_number ELSE 1 END 
--    AND   CASE WHEN _productid IS NOT NULL THEN EXISTS (SELECT 1 FROM delivery_note_details d1, packing_slip_details p WHERE p.id = d1.packing_slip_details_id AND p.products_id = _productid AND d1.delivery_notes_id = d.id) ELSE 1 = 1 END 
    AND   CASE WHEN _productid IS NOT NULL THEN EXISTS (SELECT 1 FROM delivery_note_details d1 WHERE d1.products_id = _productid AND d1.delivery_notes_id = d.id) ELSE 1 = 1 END 
    AND   CASE WHEN _gate_pass_number IS NOT NULL THEN EXISTS (SELECT 1 FROM delivery_note_details d1, gate_passes g, gate_pass_details gd WHERE d1.delivery_notes_id = d.id AND d1.packing_slips_id = gd.packing_slips_id AND g.id = gd.gate_passes_id AND g.gate_pass_number = _gate_pass_number  AND d.companies_id = g.companies_id AND g.sysgatepassstatuses_id = 6202) ELSE 1 = 1 END 
    AND   CASE WHEN _datetype IS NOT NULL THEN 
          CASE WHEN _datetype = 1 THEN d.note_date ELSE d.created END
          ELSE
             1
          END
         >= CASE WHEN _datetype IS NOT NULL THEN _datefrom ELSE 1 END
    AND   CASE WHEN _datetype IS NOT NULL AND _dateto IS NOT NULL THEN 
            CASE WHEN _datetype = 1 THEN d.note_date ELSE d.created END
          ELSE
             1
          END
         < CASE WHEN _datetype IS NOT NULL AND _dateto IS NOT NULL THEN DATE_ADD(_dateto, INTERVAL 1 DAY) ELSE 2 END
    AND   CASE WHEN _sync_status_id IS NOT NULL THEN d.syssyncstatuses_id ELSE 1 END = CASE WHEN _sync_status_id IS NOT NULL THEN _sync_status_id ELSE 1 END 
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
        CASE WHEN _sortby = "id" AND _sortorder = -1 THEN d.id END DESC,
        CASE WHEN _sortby = "id" THEN d.id END,
        CASE WHEN _sortby = "nnumber" AND _sortorder = -1 THEN d.note_number END DESC,
        CASE WHEN _sortby = "nnumber" THEN d.note_number END,
        CASE WHEN _sortby = "cname" AND _sortorder = -1 THEN cus.name END DESC,
        CASE WHEN _sortby = "cname" THEN cus.name END,
        CASE WHEN _sortby = "date" AND _sortorder = -1 THEN d.note_date END DESC,
        CASE WHEN _sortby = "date" THEN d.note_date END,
        CASE WHEN _sortby = "tname" AND _sortorder = -1 THEN t.name END DESC,
        CASE WHEN _sortby = "tname" THEN t.name END,
        CASE WHEN _sortby = "lrnumber" AND _sortorder = -1 THEN d.lr_number END DESC,
        CASE WHEN _sortby = "lrnumber" THEN d.lr_number END,
        CASE WHEN _sortby = "invnumber" AND _sortorder = -1 THEN d.invoice_number END DESC,
        CASE WHEN _sortby = "invnumber" THEN d.invoice_number END,
        CASE WHEN _sortby = "status" AND _sortorder = -1 THEN sds.name END DESC,
        CASE WHEN _sortby = "status" THEN sds.name END,
        CASE WHEN _sortby = "creator" AND _sortorder = -1 THEN CONCAT(u.first_name, ' ', u.last_name) END DESC,
        CASE WHEN _sortby = "creator" THEN CONCAT(u.first_name, ' ', u.last_name) END,
        CASE WHEN _sortby = "total" AND _sortorder = -1 THEN ( d.sub_total + d.ship_total + d.tax_total - d.discount_total ) END DESC,
        CASE WHEN _sortby = "total" THEN ( d.sub_total + d.ship_total + d.tax_total - d.discount_total ) END,
        CASE WHEN _sortby IS NULL THEN d.id END DESC   
    LIMIT offsetrecords, _recordsperpage;
    
    SELECT FOUND_ROWS() INTO _totalrecords;
    
END;
// 
delimiter ;
