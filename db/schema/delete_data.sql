start transaction;

-- delete transactions
delete from delivery_note_details where delivery_notes_id in (select id from delivery_notes where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702));

delete from packing_slip_details where orders_id in (select id from orders where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702));

delete from stock_journal_details where stock_journal_id in (select id from stock_journal where packing_slips_id in (select id from packing_slips where orders_id in (select id from orders where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702))));

delete from stock_journal where packing_slips_id in (select id from packing_slips where orders_id in (select id from orders where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702)));

delete from packing_slips where orders_id in (select id from orders where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702));

delete from delivery_notes where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702);

update stock_buckets set sysstatuses_id = 4600 where sysstatuses_id <> 4600 and companies_id = 11409;

delete from order_details where orders_id in (select id from orders where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702));

delete from order_workflow_reasons where orders_id in (select id from orders where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702));

delete from order_workflow_routes where orders_id in (select id from orders where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702));

delete from orders where customers_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702);

update stock_buckets set sysstatuses_id = 4600 where sysstatuses_id <> 4600 and companies_id = 11409;

-- delete customers
drop table if exists t_address;

create temporary table t_address (id int);

insert into t_address
select addresses_id from users where companies_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702);

delete from sessions where users_id in (select id from users where companies_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702));

delete from users where companies_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702);
delete from role_permissions where roles_id in (select id from roles where companies_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702));
delete from roles where companies_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4702);

insert into t_address
select addresses_id from companies where parent_id = 11409 and syscompanytypes_id = 4702;

insert into t_address
select bill_addresses_id from companies where parent_id = 11409 and syscompanytypes_id = 4702;

insert into t_address
select ship_addresses_id from companies where parent_id = 11409 and syscompanytypes_id = 4702;

delete from companies where parent_id = 11409 and syscompanytypes_id = 4702;

-- delete agents
insert into t_address
select addresses_id from companies where parent_id = 11409 and syscompanytypes_id = 4703;

delete from sessions where users_id in (select id from users where companies_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4703));

delete from users where companies_id in (select id from companies where parent_id = 11409 and syscompanytypes_id = 4703);

delete from companies where parent_id = 11409 and syscompanytypes_id = 4703;

-- deleting address records
delete from addresses where id in (select id from t_address);

commit;

drop table t_address;
