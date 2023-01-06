UPDATE price_groups pg SET unit_price = (SELECT max(unit_price) FROM price_lists l WHERE l.price_groups_id = pg.id)
WHERE EXISTS (SELECT 1 FROM price_lists l WHERE l.price_groups_id = pg.id);

-- update product unit price
UPDATE products p SET unit_price = (SELECT unit_price FROM price_groups g WHERE p.price_groups_id = g.id) 
WHERE p.price_groups_id IS NOT NULL;

-- update stock journal entry type
UPDATE stock_journal j
INNER JOIN orders o ON j.orders_id = o.id 
SET description = CONCAT('Order #: ', o.order_number, ' OTN: ', o.id)
WHERE j.sysjournalentrytype_id = 5401;

UPDATE stock_journal j
INNER JOIN orders o ON j.orders_id = o.id 
SET description = CONCAT('Order Cancellation #: ', o.order_number, ' OTN: ', o.id)
WHERE j.sysjournalentrytype_id = 5402;
