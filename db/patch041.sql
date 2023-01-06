insert into sysconfigurations values (10011, 'new_product_days', 'Duration for tagging product as new', '1,0', '0', 6001, 0, 1, 7, now(), now());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select 7, c.id, 10011, now(), now()
from companies c
where syscompanytypes_id = 4701;


insert into sysconfigurations values (10012, 'new_category_days', 'Duration for tagging category as new', '1,0', '0', 6001, 0, 1, 7, now(), now());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select 90, c.id, 10012, now(), now()
from companies c
where syscompanytypes_id = 4701;
