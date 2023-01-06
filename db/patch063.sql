alter table categories add column `accounting_key` VARCHAR(512) NULL AFTER name ;

alter table products add column `accounting_key` VARCHAR(512) NULL AFTER name ;

insert into sysconfigurations values (30002, 'module_integration_product', 'Product Integration', '1,0', '0', 6001, 0, 1, 1, now(), now());

-- Now for current companies, add all values
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select s.default_value, c.id, s.id, now(), now()
from sysconfigurations s, companies c
where c.syscompanytypes_id = 4701
AND s.id = 30002;

update configurations 
set value = 1
where sysconfigurations_id = 30002
and companies_id = 10003;

update products 
set syssyncstatuses_id = 4100
where statuses_id = 4600;


