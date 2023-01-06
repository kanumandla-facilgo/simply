insert into sysconfigurations values (25067, 'module_customer_address', 'Module Customer Address', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (25068, 'module_customer_firm', 'Module Customer working with Firm', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select c.default_value, c1.id, c.id, now(), now()
from companies c1, sysconfigurations c
where c1.syscompanytypes_id = 4701
AND c.id IN (25067, 25068);

UPDATE configurations SET value = '0' WHERE sysconfigurations_id IN (25067, 25068, 20030) AND companies_id = 13308;
