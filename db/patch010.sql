UPDATE configurations SET value = '4.6.5' WHERE sysconfigurations_id = 7000 and companies_id = 1;

insert into sysconfigurations values (15001, 'tax_error_match_taxable_lineitems', 'If auto_tax_calc is 0 and this config is 1, error will be thrown if no line item is taxable and tax is entered at header.', '1,0', '0', 6001, 0, 1, 127, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT c.default_value, i.id, c.id, now(), now()
FROM   sysconfigurations c, companies i
WHERE  c.sysconfigurationtypes_id = 6001
AND    i.syscompanytypes_id = 4701
AND    c.id                 = 15001;

ALTER TABLE `companies` 
ADD COLUMN `commission_rate` DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER `agents_id`;

insert into sysconfigurations values (15002, 'agent_bonus_commission', 'Agent bonus commission', '1,0', '0', 6001, 0, 1, 7, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT c.default_value, i.id, c.id, now(), now()
FROM   sysconfigurations c, companies i
WHERE  c.sysconfigurationtypes_id = 6001
AND    i.syscompanytypes_id       = 4701
AND    c.id                       = 15002;

ALTER TABLE `orders` 
ADD COLUMN `commission_amount` DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER `item_count`;
