CREATE INDEX `fk_products_created1_idx` ON `products` (`created` ASC);

insert into sysconfigurations values (10007, 'product_new_show_x_days', 'Show new Product for X days', '', 15, 6001, 0, 1, 127, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT c.default_value, e.id, c.id, now(), now()
FROM   sysconfigurations c, companies e
WHERE  c.sysconfigurationtypes_id = 6001
AND    c.id = 10007
AND    e.syscompanytypes_id = 4701;
