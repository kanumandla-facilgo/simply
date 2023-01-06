update addresses
inner join companies on companies.addresses_id = addresses.id
set addresses.companies_id = companies.id
where companies.syscompanytypes_id = 4702;


update addresses
inner join companies on companies.bill_addresses_id = addresses.id
set addresses.companies_id = companies.id
where companies.syscompanytypes_id = 4702;


update addresses
inner join companies on companies.ship_addresses_id = addresses.id
set addresses.companies_id = companies.id
where companies.syscompanytypes_id = 4702;

