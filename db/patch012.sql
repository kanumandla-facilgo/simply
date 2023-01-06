ALTER TABLE `categories` 
ADD COLUMN `image_url_large` VARCHAR(256) NULL AFTER `image_url`;

ALTER TABLE `images` 
ADD COLUMN `url_large` VARCHAR(128) NULL AFTER `url`;

-- -- remove domain name stuff from image url
-- update products set image_url1 = replace(replace(replace(image_url1, 'https://www.simplytextile.com/upload/', ''), 'http://107.170.203.205:8081/upload/', ''), 'http://localhost:8081/upload/','');
-- update categories set image_url = replace(replace(replace(image_url, 'https://www.simplytextile.com/upload/', ''), 'http://107.170.203.205:8081/upload/', ''), 'http://localhost:8081/upload/','');
-- update images set url = replace(replace(replace(url, 'https://www.simplytextile.com/upload/', ''), 'http://107.170.203.205:8081/upload/', ''), 'http://localhost:8081/upload/','');	

-- -- set secondary url
update products set image_url2 = replace(image_url1, '/upload/', '/upload/large/') where image_url1 is not null and image_url1 <> '';
update categories set image_url_large = replace(image_url, '/upload/', '/upload/large/') where image_url is not null and image_url <> '';
update images set url_large = replace(url, '/upload/', '/upload/large/') where url is not null and url <> '';

UPDATE configurations SET value = '4.7' WHERE sysconfigurations_id = 7000 and companies_id = 1;