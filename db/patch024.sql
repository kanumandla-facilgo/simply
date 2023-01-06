insert into sysconfigurations values (20003, 'order_number_edit_allowed', 'Order # edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20013, 'packing_slip_number_edit_allowed', 'Packing Slip # edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());
insert into sysconfigurations values (20023, 'delivery_note_number_edit_allowed', 'Delivery note # edit allowed even if auto', '1,0', '1', 6001, 0, 1, 127, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
VALUES ('1', 10003, 20003, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
VALUES ('1', 10003, 20013, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
VALUES ('1', 10003, 20023, now(), now());

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT '0', c.id, 20003, now(), now()
FROM   companies c
WHERE  c.syscompanytypes_id = 4701 
AND    c.id <> 10003;

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT '0', c.id, 20013, now(), now()
FROM   companies c
WHERE  c.syscompanytypes_id = 4701 
AND    c.id <> 10003;

INSERT INTO configurations (value, companies_id, sysconfigurations_id, created, last_updated)
SELECT '0', c.id, 20023, now(), now()
FROM   companies c
WHERE  c.syscompanytypes_id = 4701 
AND    c.id <> 10003;