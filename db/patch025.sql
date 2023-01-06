
-- adding new permission for customer balance
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5003, 'Edit Order number', 'Allow editing order number if generated auto', '1,0', '1', '0', '1', '1', '0', '1', '0', 0, 1, 1, 1, 4300, now(), now()),
       (5466, 'Edit Packing Slip number', 'Allow editing packing slip # if generated auto', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now()),
       (5504, 'Edit Delivery Note number', 'Allow editing delivery note # if generated auto', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5003, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5466, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5504, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5003, 0, now(), now()
from   roles r
where  sysroles_id IN (4003, 4004, 4005);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5466, 0, now(), now()
from   roles r
where  sysroles_id IN (4003, 4004, 4005);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5504, 0, now(), now()
from   roles r
where  sysroles_id IN (4003, 4004, 4005);
