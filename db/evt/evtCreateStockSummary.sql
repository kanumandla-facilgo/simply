SET GLOBAL EVENT_SCHEDULER = ON;

DROP EVENT IF EXISTS evtCreateStockSummary;

DELIMITER //

CREATE EVENT evtCreateStockSummary
ON SCHEDULE EVERY '1' MONTH
STARTS '2021-04-01 00:00:00'
DO 
BEGIN

	INSERT INTO stock_history (products_id, transaction_date, unit_of_measures_id, stock_alt_unit_of_measures_id, stock_quote, stock_qty, created, last_updated)
	SELECT p.id, NOW(), p.stock_unit_of_measures_id, p.stock_alt_unit_of_measures_id, p.stock_quote, p.stock_qty, NOW(), NOW() 
	FROM products p
	WHERE (p.stock_quote <> 0 OR p.stock_qty <> 0);

END;
//

DELIMITER ;
