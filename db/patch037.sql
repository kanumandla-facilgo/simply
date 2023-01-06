insert into sysconfigurations values (10010, 'display:records_per_page', 'number of records to be displayed per page', '1,0', '0', 6001, 0, 1, 7, now(), now());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select 20, c.id, 10010, now(), now()
from companies c
where syscompanytypes_id = 4701;

update configurations set value = 10 where companies_id = 11409 and sysconfigurations_id = 10010;
