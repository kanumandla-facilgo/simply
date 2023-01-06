insert into sysconfigurations values (25001, 'module_approval_rate_diff', 'approval module rate diff', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25002, 'module_approval_payment_due', 'approval module payment due', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25003, 'module_approval_credit_limit', 'approval module credit limit', '1,0', '0', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25050, 'module_payment_term', 'If business has 30/60/90 day payment term', '1,0', '0', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25100, 'module_multiple_rates', 'if one product has multiple rates', '1,0', '0', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25151, 'module_integration_customer', 'Customer Integration', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25152, 'module_integration_payment', 'Payment Integration', '1,0', '0', 6001, 0, 1, 1, now(), now());


insert into sysconfigurations values (25201, 'module_notification_sms', 'SMS Notification', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25202, 'module_notification_email', 'Email Notification', '1,0', '1', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25251, 'module_catalog_share', 'Catalog Share', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25252, 'module_transporter', 'Module Transporter', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25253, 'module_agent', 'Module Agent', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25254, 'module_agent_login', 'Module Agent Login', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25255, 'module_salesman', 'Module Agent Login', '1,0', '0', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25301, 'module_packing_slip', 'Module Packing Slip', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25302, 'module_delivery_note', 'Module Delivery Note', '1,0', '1', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25303, 'module_gate_pass', 'Module Gate Pass', '1,0', '1', 6001, 0, 1, 1, now(), now());

insert into sysconfigurations values (25351, 'module_product_kit', 'Module Kit', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25352, 'module_product_bundle', 'Module Bundle', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25353, 'module_product_product_head', 'Module Product Head', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25354, 'module_product_multiple_unit', 'Module Product multiple Unit', '1,0', '0', 6001, 0, 1, 1, now(), now());
insert into sysconfigurations values (25355, 'module_product_unit_restriction', 'Product Unit Restrictions', '1,0', '0', 6001, 0, 1, 1, now(), now());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select c.default_value, c1.id, c.id, now(), now()
from companies c1, sysconfigurations c
where c1.syscompanytypes_id = 4701
AND c.id > 25000;

update configurations set value = 1 where companies_id = 10003 and sysconfigurations_id > 25000;

update sysproducthsn_details set amount_max = 999.99 where amount_max = 1000;
update sysproducthsn_details set amount_min = 1000 where amount_min = 1000.01;
