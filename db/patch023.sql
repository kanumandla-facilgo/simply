ALTER TABLE `transporters` 
ADD COLUMN `external_code` VARCHAR(32) NULL AFTER `code`;

insert into syssyncstatuses values (4103, 'Do Not Sync', 'Do not sync', now(), now());
