insert into syseventtypes values(1008, 'Welcome Email', NOW(), NOW());
INSERT INTO sysnotificationtypes VALUES (5804, 'Welcome Email', 'Welcome Email Notification', NOW(), NOW());

INSERT INTO sysdocumenttypes VALUES (1005, 'Bill', NOW(), NOW());
INSERT INTO sysdocumenttypes VALUES (1006, 'Company', NOW(), NOW());

update notifications 
set sysdocumenttypes_id = 1005
where sysdocumenttypes_id = 1003;

alter table pending_bills modify paid_amount Decimal(10,2) NOT NULL;
alter table pending_bills modify paid_amount Decimal(10,2);

update syssubscriptiontemplatedetails
set value = 0
where syssubscriptiontemplates_id = 6302
and sysconfigurations_id = 20030