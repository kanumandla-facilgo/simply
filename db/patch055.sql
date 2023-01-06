
ALTER TABLE customer_notifications
ADD COLUMN phone_number varchar(24) null AFTER customers_id;


ALTER TABLE customer_notifications
ADD COLUMN emails text null AFTER phone_number;


update customer_notifications n
inner join companies c on n.customers_id = c.id
inner join addresses a on c.addresses_id = a.id
set phone_number = a.phone1, emails = a.email1;

update customer_notifications 
set phone_number = null, emails = null
where active = 0;

update companies
set syssyncstatuses_id = 4100;

update syssubscriptiontemplatedetails
set value = 1
where syssubscriptiontemplates_id = 6300
and sysconfigurations_id = 15000;


update syssubscriptiontemplatedetails
set value = 0
where syssubscriptiontemplates_id = 6300
and sysconfigurations_id = 25352;

update sysconfigurations
set logo = 'upload/logo_simply.jpg'
where name = 'logo_url';

alter table pending_bills modify datetime NOT NULL;

UPDATE pending_bills b 
set b.next_reminder_date = (CASE WHEN DATEDIFF(b.due_date, DATE(NOW())) >= 2 THEN  DATE_ADD(b.due_date, INTERVAL -2 DAY) 
        WHEN DATEDIFF(b.due_date, DATE(NOW())) < 2  AND  DATEDIFF(b.due_date, DATE(NOW())) >= 0 THEN b.due_date
        WHEN DATEDIFF(DATE(NOW()), b.due_date) > 0 AND  DATEDIFF(DATE(NOW()), b.due_date) <= ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.1, 0) THEN DATE_ADD(b.due_date, INTERVAL ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.1, 0) DAY) 
        WHEN DATEDIFF(DATE(NOW()), b.due_date) > ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.1, 0) AND  DATEDIFF(DATE(NOW()), b.due_date) <= ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.2, 0) THEN DATE_ADD(b.due_date, INTERVAL ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.2, 0) DAY) 
        WHEN DATEDIFF(DATE(NOW()), b.due_date) > ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.2, 0) AND  DATEDIFF(DATE(NOW()), b.due_date) <= ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.3, 0) THEN DATE_ADD(b.due_date, INTERVAL ROUND(DATEDIFF(b.due_date, b.bill_date) * 0.3, 0) DAY) 
        ELSE NULL
	END)  
WHERE b.syspaymentstatuses_id in (5800, 5802); 

insert into syseventtypes values(1010, 'Thank you Email', NOW(), NOW());
INSERT INTO sysnotificationtypes VALUES (5805, 'Thankyou Email', 'Thank you Notification', NOW(), NOW());
