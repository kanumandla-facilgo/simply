-- delete product
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5506, 'Edit Delivery Note Date', 'Allow editing delivery note date', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5506, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5506, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004, 4005);
