insert into sysconfigurations values (11000, 'mail_server_name', 'Mail Server Name', 'gmail_st', 'gmail_st', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11001, 'mail_server_host', 'Mail Server host', 'gmail', 'gmail', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11002, 'mail_server_port', 'Mail Server port', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11003, 'mail_server_user', 'Mail Server username', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11004, 'mail_server_pass', 'Mail Server password', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11005, 'mail_server_is_secure', 'Mail Server secure', 'true', 'true', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (11006, 'mail_server_email_from', 'From Email Address', '', '', 6001, 0, 0, 7, now(), now());

insert into sysconfigurations values (30000, 'order_create_email_cc', 'Order create CC email', '', '', 6001, 0, 0, 7, now(), now());
insert into sysconfigurations values (30001, 'payment_reminder_email_cc', 'Payment reminder CC email', '', '', 6001, 0, 0, 7, now(), now());


-- insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
-- select s.default_value, c.id, s.id, now(), now()
-- from sysconfigurations s, companies c
-- where c.syscompanytypes_id = 4701
-- AND s.id >= 25000;

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('zoho', 10003, 11000, now(), now());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('smtp.zoho.com', 10003, 11001, now(), now());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('465', 10003, 11002, now(), now());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('admin@simplytextile.com', 10003, 11003, now(), now());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('IndiaIsBeautiful9!', 10003, 11004, now(), now());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('true', 10003, 11005, now(), now());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('Simply Admin <admin@simplytextile.com>', 10003, 11006, now(), now());

insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('rupesh.d.shah@gmail.com', 10003, 30000, now(), now());
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated) values ('rupesh.d.shah@gmail.com', 10003, 30001, now(), now());


