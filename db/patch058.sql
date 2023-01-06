
update syssubscriptiontemplatedetails
set value = 0
where sysconfigurations_id in (20030);

update configurations set value=0 where sysconfigurations_id = 20030 and companies_id = 13463;