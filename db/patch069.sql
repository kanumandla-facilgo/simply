ALTER TABLE `delivery_notes` 
ADD COLUMN `eway_bill_info` JSON NULL AFTER `gate_pass_info`;

update delivery_notes
set eway_bill_info =  JSON_OBJECT('bill_number', Case when eway_bill_number is not null then eway_bill_number else '' end, 'bill_date', Case when eway_bill_date is not null then eway_bill_date else '' end, 'transport_mode','1', 'vehicle_type', 'R', 'transaction_type', '1', 'vehicle_number', '');

insert into sysconfigurations values (25154, 'module_integration_eway_bill', 'Eway Bill', '1,0', '0', 6001, 0, 1, 127, now(), now());

-- Now for current companies, add all values
insert into configurations (value, companies_id, sysconfigurations_id, created, last_updated)
select s.default_value, c.id, s.id, now(), now()
from sysconfigurations s, companies c
where c.syscompanytypes_id = 4701
AND s.id = 25154;

update configurations
set value = 1
where sysconfigurations_id = 25154 and companies_id=10003;