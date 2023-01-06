DROP PROCEDURE IF EXISTS spProcessBills;

delimiter //

CREATE PROCEDURE spProcessBills
            (
                OUT errorcode           INT, 
                OUT errormsg            VARCHAR(512),
                    _companyid          INT,
                    _customerid         INT,
                    _batch_number       VARCHAR(36)
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

    -- Update pending bills data
    UPDATE pending_bills b
    INNER JOIN pending_bills_stage bs ON b.bill_ref_number = bs.bill_ref_number AND b.companies_id = bs.companies_id AND bs.customers_id = b.customers_id
    SET b.bill_ref_number = bs.bill_ref_number, b.bill_date = bs.bill_date, b.due_date = bs.due_date, b.bill_amount = bs.bill_amount, b.balance_amount = bs.balance_amount,  b.paid_amount = (bs.bill_amount - bs.balance_amount), b.syspaymentstatuses_id = 5800,  b.last_updated = NOW()
    WHERE bs.companies_id = _companyid AND bs.batch_number = _batch_number AND bs.customers_id = _customerid;

    -- Insert new pending bills into table
    INSERT INTO pending_bills(bill_number, bill_ref_number, companies_id, customers_id, bill_date, due_date, bill_amount, balance_amount, paid_amount, approx_paid_date, syspaymentstatuses_id, next_reminder_date, created, last_updated)  
    SELECT pbs.bill_number, pbs.bill_ref_number, pbs.companies_id, pbs.customers_id, pbs.bill_date, pbs.due_date, pbs.bill_amount, pbs.balance_amount, 0, null, 5800, null, NOW(), NOW()
    FROM pending_bills_stage pbs
    WHERE companies_id = _companyid AND batch_number = _batch_number AND customers_id = _customerid
    AND NOT EXISTS (SELECT 1 FROM pending_bills pb WHERE pb.bill_ref_number = pbs.bill_ref_number AND companies_id = pbs.companies_id AND customers_id = pbs.customers_id) ;

    -- Select bills
    SELECT b.* FROM pending_bills b 
    WHERE NOT EXISTS (SELECT 1 FROM pending_bills_stage pbs WHERE pbs.bill_ref_number = b.bill_ref_number AND pbs.batch_number = _batch_number AND b.companies_id = pbs.companies_id AND pbs.companies_id = _companyid AND pbs.customers_id = _customerid)
    AND companies_id = _companyid AND customers_id = _customerid AND b.syspaymentstatuses_id = 5800;
      
    -- Mark pending bills as paid
    UPDATE pending_bills b
    SET b.balance_amount = 0, b.paid_amount = b.bill_amount, b.approx_paid_date = DATE(NOW()), next_reminder_date = null, syspaymentstatuses_id = 5801, b.last_updated = NOW()
    WHERE NOT EXISTS (SELECT 1 FROM pending_bills_stage pbs WHERE pbs.bill_ref_number = b.bill_ref_number AND pbs.batch_number = _batch_number AND b.companies_id = pbs.companies_id AND pbs.companies_id = _companyid AND pbs.customers_id = _customerid)
    AND companies_id = _companyid AND customers_id = _customerid;

    -- Mark pending bills as partially paid
    UPDATE pending_bills
    SET syspaymentstatuses_id = 5802
    WHERE (bill_amount - balance_amount - paid_amount) > 0 AND companies_id = _companyid AND customers_id = _customerid;
   
    -- update next reminder date
    CALL spUpdateBillsNextReminderDate (errorcode, errormsg, _companyid, _customerid, _batch_number, NOW(), null);
    
    IF (errorcode != 0) THEN
        SET errorcode = -200;
        SET errormsg = 'Error updating next reminder date';
        LEAVE main;
    END IF;

END;
// 
delimiter ;
