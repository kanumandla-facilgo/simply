alter table notifications add parent_id int null after sysnotificationstatuses_id;


insert into sysnotificationtypes values(5806, 'Daily Bills Consolidation', 'Daily Bills Consolidation', NOW(), NOW());

insert into notifications (companies_id, entities_id, document_id, sysdocumenttypes_id, sysnotificationformats_id, sysnotificationstatuses_id, sysnotificationtypes_id, parent_id, destination, notes, created, last_updated)
SELECT companies_id, entities_id, document_id, sysdocumenttypes_id, sysnotificationformats_id, sysnotificationstatuses_id, sysnotificationtypes_id, id, destination, notes, created, last_updated FROM notifications;

