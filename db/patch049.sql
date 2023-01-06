
insert into sysconfigurations values (20050, 'transporter_code_required', 'Company Transporter code Required', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20051, 'transporter_code_next_value', 'Company Next Transporter code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20052, 'transporter_code_format', 'Company Transporter code format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20053, 'transporter_code_edit_allowed', 'Transporter code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20060, 'agent_code_required', 'Company Agent code Required', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20061, 'agent_code_next_value', 'Company Next Agent code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20062, 'agent_code_format', 'Company Agent code format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20063, 'agent_code_edit_allowed', 'Agent code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20070, 'category_code_required', 'Company Category code Required', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20071, 'category_code_next_value', 'Company Next Category code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20072, 'category_code_format', 'Company Category code format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20073, 'category_code_edit_allowed', 'Category code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into sysconfigurations values (20080, 'product_code_required', 'Company Product code Required', '1,0', '0', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20081, 'product_code_next_value', 'Company Next Product code', '', '1001', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20082, 'product_code_format', 'Company Product code format', '%d,%Y%M%D%d', '%d', 6001, 0, 1, 7, now(), now());
insert into sysconfigurations values (20083, 'product_code_edit_allowed', 'Product code edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select c.default_value, c1.id, c.id, now(), now()
from companies c1, sysconfigurations c
where c1.syscompanytypes_id = 4701
AND c.id IN (20050, 20051, 20052, 20053, 20060, 20061, 20062, 20063, 20070, 20071, 20072, 20073, 20080, 20081, 20082, 20083);

