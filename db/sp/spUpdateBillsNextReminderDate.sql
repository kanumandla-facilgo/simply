DROP PROCEDURE IF EXISTS spUpdateBillsNextReminderDate;

delimiter //

CREATE PROCEDURE spUpdateBillsNextReminderDate
            (
                OUT errorcode           INT, 
                OUT errormsg            VARCHAR(512),
                    _companyid          INT,
                    _customerid         INT,
                    _batch_number       VARCHAR(36),
                    _base_date          DATETIME,
                    _billid             INT
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

   
    UPDATE pending_bills b 
    LEFT JOIN pending_bills_stage pbs on b.bill_ref_number = pbs.bill_ref_number
    SET b.next_reminder_date = (CASE WHEN DATEDIFF(b.due_date, DATE(_base_date)) >= 2 THEN  DATE_ADD(b.due_date, INTERVAL -2 DAY) 
            WHEN DATEDIFF(b.due_date, DATE(_base_date)) < 2  AND  DATEDIFF(b.due_date, DATE(_base_date)) >= 0 THEN b.due_date
            WHEN DATEDIFF(DATE(_base_date), b.due_date) > 0 AND  DATEDIFF(DATE(_base_date), b.due_date) <= ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.1, 0) THEN DATE_ADD(b.due_date, INTERVAL ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.1, 0) DAY) 
            WHEN DATEDIFF(DATE(_base_date), b.due_date) > ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.1, 0) AND  DATEDIFF(DATE(_base_date), b.due_date) <= ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.2, 0) THEN DATE_ADD(b.due_date, INTERVAL ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.2, 0) DAY) 
            WHEN DATEDIFF(DATE(_base_date), b.due_date) > ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.2, 0) AND  DATEDIFF(DATE(_base_date), b.due_date) <= ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.3, 0) THEN DATE_ADD(b.due_date, INTERVAL ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.3, 0) DAY) 
            ELSE NULL
        END)
    WHERE b.companies_id = _companyid AND b.syspaymentstatuses_id in (5800, 5802)
    AND CASE WHEN _customerid IS NOT NULL THEN b.customers_id ELSE 1 END = CASE WHEN _customerid IS NOT NULL THEN _customerid ELSE 1 END 
    AND CASE WHEN _billid IS NOT NULL THEN b.id ELSE 1 END = CASE WHEN _billid IS NOT NULL THEN _billid ELSE 1 END 
    AND CASE WHEN _batch_number IS NOT NULL THEN pbs.batch_number ELSE 1 END = CASE WHEN _batch_number IS NOT NULL THEN _batch_number ELSE 1 END ;
   

END;
// 
delimiter ;
