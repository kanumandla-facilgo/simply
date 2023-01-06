DROP PROCEDURE IF EXISTS spPreprocessBill;

delimiter //

CREATE PROCEDURE spPreprocessBill
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _days           INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE l_notfound                  INT;
    DECLARE _paid_invoice_count         INT;
    DECLARE _paid_invoice_amount        INT;
    DECLARE _paid_late_invoice_count    INT;
    DECLARE _paid_late_invoice_amount   INT;
    DECLARE _paid_late_invoice_days_avg INT;
    DECLARE _paid_no_overdue            INT;
    DECLARE _paid_less_overdue          INT;
    DECLARE _paid_medium_overdue        INT;
    DECLARE _paid_high_overdue          INT;

    DECLARE _unpaid_invoice_count       INT;
    DECLARE _unpaid_invoice_amount      INT;
    DECLARE _unpaid_late_invoice_count  INT;
    DECLARE _unpaid_late_invoice_amount INT;
    DECLARE _unpaid_invoice_days_avg    INT;
    DECLARE _unpaid_invoice_days_std    DECIMAL(10, 4);

 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;
 

    -- number of paid invoices prior to this invoice
    SELECT b.id,  CASE WHEN DATE(b.approx_paid_date) <= DATE(b.due_date) THEN 1 ELSE 0 END AS paid_no_overdue /* 20 */,
                  CASE WHEN b.approx_paid_date > b.due_date AND DATEDIFF(b.due_date, b.bill_date) / DATEDIFF(b.approx_paid_date, b.due_date) <= 10 THEN 1 ELSE 0 END AS paid_less_overdue /* 21 */,
                  CASE WHEN b.approx_paid_date > b.due_date AND DATEDIFF(b.due_date, b.bill_date) / DATEDIFF(b.approx_paid_date, b.due_date) > 10 AND DATEDIFF(b.due_date, b.bill_date) / DATEDIFF(b.approx_paid_date, b.due_date) <= 20 THEN 1 ELSE 0 END AS paid_medium_overdue /* 22 */,
                  CASE WHEN b.approx_paid_date > b.due_date AND DATEDIFF(b.due_date, b.bill_date) / DATEDIFF(b.approx_paid_date, b.due_date) > 20 THEN 1 ELSE 0 END AS paid_high_overdue /* 23 */,
                  data.paid_invoice_count /* 3 */,
                  data.paid_bill_amount /* 6 */
    FROM pending_bills b, (
        SELECT b.id as id, COUNT(b1.id) AS paid_invoice_count, IFNULL(ROUND(SUM(b1.bill_amount), 0), 0) AS paid_bill_amount
        FROM   pending_bills b LEFT JOIN pending_bills b1 ON b1.id < b.id AND b1.companies_id = b.companies_id AND b.customers_id = b1.customers_id
        WHERE  b.sysstatuses_id = 4600
        AND    b.created > DATE_ADD(NOW(), INTERVAL _days * -1 DAY)
        GROUP BY b.id ) data
    WHERE b.id = data.id;

    -- number of late paid invoices prior to this invoice
    SELECT b.id, COUNT(b1.id) AS paid_late_invoice_count /* 4 */, IFNULL(ROUND(SUM(b1.bill_amount), 0), 0) AS paid_late_bill_amount /* 7 */, IFNULL(AVG(DATEDIFF(b1.approx_paid_date, b1.due_date)), 0) AS paid_late_invoice_days_avg /* 9 */
    FROM   pending_bills b LEFT JOIN pending_bills b1 ON b1.id < b.id AND b1.companies_id = b.companies_id AND b.customers_id = b1.customers_id AND b1.approx_paid_date > b1.due_date
    WHERE  b.sysstatuses_id = 4600
    GROUP BY b.id;


    -- number of unpaid invoices prior to this invoice
    SELECT b.id,  CASE WHEN DATE(NOW()) <= DATE(b.due_date) THEN 1 ELSE 0 END AS unpaid_no_overdue /* 20 */,
                  CASE WHEN DATE(NOW()) > b.due_date AND DATEDIFF(b.due_date, b.bill_date) / DATEDIFF(DATE(NOW()), b.due_date) <= 10 THEN 1 ELSE 0 END AS unpaid_less_overdue /* 21 */,
                  CASE WHEN DATE(NOW()) > b.due_date AND DATEDIFF(b.due_date, b.bill_date) / DATEDIFF(DATE(NOW()), b.due_date) > 10 AND DATEDIFF(b.due_date, b.bill_date) / DATEDIFF(DATE(NOW()), b.due_date) <= 20 THEN 1 ELSE 0 END AS unpaid_medium_overdue /* 22 */,
                  CASE WHEN DATE(NOW()) > b.due_date AND DATEDIFF(b.due_date, b.bill_date) / DATEDIFF(DATE(NOW()), b.due_date) > 20 THEN 1 ELSE 0 END AS unpaid_high_overdue /* 23 */,
                  data.unpaid_invoice_count /* 10 */,
                  data.unpaid_invoice_amount /* 13 */
    FROM pending_bills b, (
        SELECT b.id, COUNT(b1.id) AS unpaid_invoice_count, IFNULL(ROUND(SUM(b1.bill_amount), 0), 0) AS unpaid_invoice_amount 
        FROM   pending_bills b LEFT JOIN pending_bills b1 ON b1.id < b.id AND b1.companies_id = b.companies_id AND b.customers_id = b1.customers_id
        WHERE  b.sysstatuses_id = 4600
        GROUP BY b.id) data
    WHERE b.id = data.id;


    -- number of late unpaid invoices prior to this invoice
    SELECT b.id, COUNT(b1.id) AS unpaid_late_invoice_count /* 11 */, IFNULL(ROUND(SUM(b1.bill_amount), 0), 0) AS unpaid_late_invoice_amount /* 14 */,
                                IFNULL(AVG(DATEDIFF(NOW(), b1.due_date)), 0) AS unpaid_late_invoice_days_avg /* 16 */,
                                IFNULL(STD(DATEDIFF(NOW(), b1.due_date)), 0) AS unpaid_late_invoice_days_std /* 17 */,
                                IFNULL(STD(b1.bill_amount), 0) AS unpaid_late_invoice_amount_std /* 18 */
    FROM   pending_bills b LEFT JOIN pending_bills b1 ON b1.id < b.id AND b1.companies_id = b.companies_id AND b.customers_id = b1.customers_id AND b1.due_date < DATE(NOW())
    WHERE  b.sysstatuses_id = 4600
    GROUP BY b.id;


END;
//

DELIMITER ;