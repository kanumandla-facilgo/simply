SET collation_connection = 'utf8_general_ci';

ALTER DATABASE textile CHARACTER SET utf8 COLLATE utf8_general_ci;

ALTER TABLE users CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;

ALTER TABLE products CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;


