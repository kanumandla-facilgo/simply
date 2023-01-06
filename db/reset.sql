drop database textile;

create database textile;

use textile;

source schema/schema.sql;

source schema/post.sql;

source sp/sp.sql;

source schema/seed.sql;

call spCreateCompany (@err, @msg, @id, 'MechTech Industries', 'MECHTECH', 'MechTech Industries', 'Milan', 'Shah', 'B-52 Pariseema Complex', 'C.G. Road', 'Ellisbridge', 'Ahmedabad', 'Gujarat', '380006', '+91 7926409525', 'info@mechtech.co.in', null, null, 'Milan', 'Shah', 'milanshah.mt', 'milan', '+91 8849223234', 'info@mechtech.co.in');

call spCreateCompany (@err, @msg, @id, 'Rupesh Org', 'RORG41', 'Rupesh Organization', '10 Tagore Park', 'Ambawadi', '', 'Ahmedabad', 'Gujarat', '380015', '079-26730323', 'rupesh.d.shah@gmail.com', 'Rupesh', 'Shah', 'rupesh123', 'abc999', '79-26730324', 'rupesh.d.shah@gmail3.com');

call spCreateCompany (@err, @msg, @id, 'Maxson Prints', 'MAXSON', 'Maxson Prints', 'Mukesh', 'Bafna', '45, Mazanine', 'New Cloth Market', 'Raipur', 'Ahmedabad', 'Gujarat', '380002', '+91 79-22149116', 'maxson_prints@yahoo.in', null, null, 'Mukesh', 'Bafna', 'mukeshshah.mxs', 'Ahmedabad', '+91 9427525073', 'maxson_prints@yahoo.in');

call spCreateCompany (@err, @msg, @id, 'Anjani Mens and Kids wear', 'ANJANI', 'Anjani Mens and Kids wear', 'Deepika', 'Rachuri', '17-1-445', 'Shankeshwar Bazaar', 'Dilsukhnagar', 'Hyderabad', 'Telanana', '500060', '+91 7207656010', 'info@simplytextile.com', null, null, 'Deepika', 'Racuri', 'deepika.anj', 'Hyderabad', '+91 8106315555', 'info@simplytextile.com');

call spCreateCompany (@err, @msg, @id, 'Miki Mens and Kids wear', 'MIKI5', 'Anjani Mens and Kids wear', 'Jinal', 'Joshi', '17-1-445', 'Shankeshwar Bazaar', 'Dilsukhnagar', 'Hyderabad', 'Telanana', '500060', '+91 7207656010', 'info@simplytextile.com', null, null, 'Deepika', 'Racuri', 'jinal.mk', 'Hyderabad', '+91 8106315555', 'info@simplytextile.com');

call spCreateTransporter (@err, @msg, @id, 10001, 'Vraj Transporter', 'VRAJ', 'abc road', null, null, 'Ahmedabad', 'GUJARAT', '380007', '7911122333', 'a@abc.com');

call spCreateCompanyType (@err, @msg, @id, 10001, 'North', 'Customers from North', 1, 10000, 4702);

call spCreateUser (@err, @msg, @id, 10001, 'Sales', 'Guy A', null, 'salesman.rup', 'abc999', 4, null,   'abc road', null, null, 'Ahmedabad', 'GUJARAT', '380007', '7911122333', 'a@abc.com',  2);

call spCreateAgent(@err, @msg, @id, 10001, 'Agent 1', 'AGENT1', 'AGENT1', 'abc road', null, null, 'Ahmedabad', 'GUJARAT', '380007', '7911122333', 'a@abc.com', 3, 0, 'agent', 'guy', 'agent1.rup', 'abc999');

call spCreateCategory (@err, @msg, @id, 10001, 'BED', 'BED', 1, null, 0);

call spCreateCategory (@err, @msg, @id, 10001, 'SHEETING', 'SHEETING', 1, null, 0);

call spCreateCategory (@err, @msg, @id, 10001, 'BATH', 'BATH', 1, null, 0);

call spCreateCategory (@err, @msg, @id, 10001, 'TOWEL1', 'TOWEL1', 4, null, 0);

call spCreateCategory (@err, @msg, @id, 10001, 'TOWEL2', 'TOWEL2', 4, null, 0);

call spCreateCategory (@err, @msg, @categoryid, 10001, 'FLORA', 'Flora', 3, null, 0);
/*
INSERT INTO unit_of_measures (name, description, base_id, conversion_factor, display_flag, companies_id, master_id, created, last_updated)
values ('Than', 'Than', NULL, 1, 1, 10001, NULL, NOW(), NOW());

SET @uom_id = LAST_INSERT_ID();
*/
/*
call spCreatePriceGroup (@err, @msg, @pricegroupid, 10001, 'Flora', 'Flora', 4802);

INSERT INTO price_lists (companies_id, price_groups_id, company_types_id, unit_of_measures_id, unit_price, last_updated_by, created, last_updated)
SELECT 10001, @pricegroupid, c.id, u.id, 39+c.id - 10000, 2, now(), now()
from company_types c, unit_of_measures u
WHERE c.companies_id = 10001
AND u.companies_id = 10001 AND u.name = 'Meter';

call spCreateProduct (@err, @msg, @id, 10001, '3010507', '3010507', 'Flora 3010507', 'Flora 3010507', 
                     1, 39.00, 0, 0, 0, 0, @categoryid,  5008, 4802, @pricegroupid, 0, 0, 0, 0, 'Blue, Black', 
                     4901, 0, 0, null, null, null, null, null);
*/
-- call spCreateProduct (@err, @msg, @id, 10001, '2030508', '2030508', 'Flora 2030508', 'Flora 2030508', 1, 38.00, 0, 0, 0, 0, 7, 5005, 4800, null, 0, 0, 0, 0, 'gray', 4901, 0, 0, null, null, null, null, null);

call spCreateCompany (@err, @msg, @id, 'MBT Org', 'MBT', 'MB Towel', '10 Tagore Park', 'Ambawadi', '', 'Ahmedabad', 'Gujarat', '380015', '079-26730323', 'rupesh.d.shah@gmail.com', 'Ritesh', 'Shah', 'riteshshah.mbt', 'abc999', '79-26730324', 'rupesh.d.shah@gmail3.com');

call spCreateTransporter (@err, @msg, @id, 10003, 'Taj Transporter', 'TAJ', 'abc road', null, null, 'Ahmedabad', 'GUJARAT', '380007', '7911122333', 'a@abc.com');

-- call spCreateCompanyType (@err, @msg, @id, 10003, 'North', 'Customers from North', 1, 10000, 4702);

-- call spCreateUser (@err, @msg, @id, 10003, 'Sales', 'Guy A', null, 'salesman.mbt', 'abc999', 11, null,   'abc road', null, null, 'Ahmedabad', 'GUJARAT', '380007', '7911122333', 'a@abc.com',  5);

-- call spCreateAgent(@err, @msg, @id, 10003, 'Agent 1', 'AGENT1', 'AGENT1', 'abc road', null, null, 'Ahmedabad', 'GUJARAT', '380007', '7911122333', 'a@abc.com', 6, 0, 'agent', 'guy', 'agent1.mbt', 'abc999');

call spCreateCategory (@err, @msg, @id, 10003, 'BED', 'BED', 8, null, 0);

call spCreateCategory (@err, @msg, @id, 10003, 'SHEETING', 'SHEETING', 8, null, 0);

call spCreateCategory (@err, @msg, @id, 10003, 'BATH', 'BATH', 8, null, 0);

-- call spCreateCategory (@err, @msg, @id, 10003, 'TOWEL1', 'TOWEL TYPE 1', 11, null, 0);

-- call spCreateCategory (@err, @msg, @id, 10003, 'TOWEL2', 'TOWEL TYPE 2', 11, null, 0);

-- call spCreateCategory (@err, @msg, @categoryid, 10003, 'FLORA', 'Flora', 10, null, 0);
/*
INSERT INTO unit_of_measures (name, description, base_id, conversion_factor, display_flag, companies_id, master_id, created, last_updated)
values ('Than', 'Than', NULL, 1, 1, 10003, NULL, NOW(), NOW());

SET @uom_id = LAST_INSERT_ID();
*/
/*
call spCreatePriceGroup (@err, @msg, @pricegroupid, 10003, 'Flora', 'Flora', 4802);

INSERT INTO price_lists (companies_id, price_groups_id, company_types_id, unit_of_measures_id, unit_price, last_updated_by, created, last_updated)
SELECT 10003, @pricegroupid, c.id, u.id, 39+c.id - 10000, 2, now(), now()
from company_types c, unit_of_measures u
WHERE c.companies_id = 10003
AND u.companies_id = 10003 AND u.name = 'Meter';

call spCreateProduct (@err, @msg, @id, 10003, '3010507', '3010507', 'Flora 3010507', 'Flora 3010507', 
                     1, 39.00, 0, 0, 0, 0, @categoryid,  5016, 4802, @pricegroupid, 0, 0, 0, 0, 'Blue, Black', 
                     4901, 0, 0, null, null, null, null, null);


insert into syspermissions (id, name, description, possible_values, admin_default_value, user_default_value, sales_default_value, agent_default_value, is_system, syspermissiongroups_id, created, last_updated)
values (5450, 'Workflow Setup', 'Workflow Setup', '1,0', '1', '0', '0', '0', 0, 4303, now(), now());

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.admin_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id in  (10001, 10003)
	AND    r.sysroles_id  = 4002              -- admin role
	AND    p.is_system    = false
	AND    p.id           = 5450;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.user_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id in  (10001, 10003)
	AND    r.sysroles_id  = 4003              -- other role
	AND    p.is_system    = false	
	AND    p.id           = 5450;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.sales_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id in  (10001, 10003)
	AND    r.sysroles_id  = 4004              -- sales person role
	AND    p.is_system    = false
	AND    p.id           = 5450;

	INSERT INTO role_permissions (value, roles_id, syspermissions_id, created, last_updated)
	SELECT p.agent_default_value, r.id, p.id, now(), now()
	FROM   roles r, syspermissions p
	WHERE  r.companies_id in  (10001, 10003)
	AND    r.sysroles_id  = 4005              -- agent role
	AND    p.is_system    = false
	AND    p.id           = 5450;

*/