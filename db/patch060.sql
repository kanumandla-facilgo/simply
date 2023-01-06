-- delete product
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5652, 'Delete Product', 'Delete Product', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4303, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5652, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5652, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5652, 0, now(), now()
from roles r
where sysroles_id IN (4005);

-- delete agent
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5653, 'Delete Agent', 'Delete Agent', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4503, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5653, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5653, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5653, 0, now(), now()
from roles r
where sysroles_id IN (4005);

-- delete customer
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5654, 'Delete Customer', 'Delete Customer', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4503, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5654, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5654, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5654, 0, now(), now()
from roles r
where sysroles_id IN (4005);

-- delete transporter
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5655, 'Delete Transporter', 'Delete Transporter', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4503, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5655, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5655, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5655, 0, now(), now()
from roles r
where sysroles_id IN (4005);

-- delete payment term
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5656, 'Delete Payment Term', 'Delete Payment Term', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4503, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5656, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5656, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5656, 0, now(), now()
from roles r
where sysroles_id IN (4005);

-- delete customer types
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5657, 'Delete Rate Category', 'Delete Rate Category', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4503, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5657, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5657, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5657, 0, now(), now()
from roles r
where sysroles_id IN (4005);

-- delete price groups
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5658, 'Delete Price Group', 'Delete Price Group', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4503, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5658, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5658, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5658, 0, now(), now()
from roles r
where sysroles_id IN (4005);

-- delete unit of measures
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5659, 'Delete Unit of Measure', 'Delete Unit of Measure', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4503, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5659, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5659, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5659, 0, now(), now()
from roles r
where sysroles_id IN (4005);

-- delete user
insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, agentuser_default_value, customeradmin_default_value, customeruser_default_value, is_system, is_company, is_customer, is_agent, syspermissiongroups_id, created, last_updated)
values (5660, 'Delete User', 'Delete User', '1,0', '1', '0', '0', '0', '0', '0', '0', 0, 1, 0, 0, 4501, now(), now());

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 1, r.id, 5660, 0, now(), now()
from roles r
where sysroles_id IN (4002);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5660, 0, now(), now()
from roles r
where sysroles_id IN (4003, 4004);

insert into role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated)
select 0, r.id, 5660, 0, now(), now()
from roles r
where sysroles_id IN (4005);

