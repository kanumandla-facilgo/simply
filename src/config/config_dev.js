var config = {};

config.web = {};
config.local = {};

config.web.hostname = 'localhost';
config.web.port     = '8081';

config.web.image_server_url  = "http://localhost:8081/";
config.web.image_server_root = "upload/";

config.local.image_server_root = "/public/upload/";
config.local.image_server_folder_original = "original/";
config.local.image_server_folder_small = "small/";
config.local.image_server_folder_orig = "orig/";
config.local.image_server_folder_large = "large/";

config.PDF_CONVERTER_WITH_PATH = 'C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf';

config.db_host     = (process.env.ST_DB_HOST ? process.env.ST_DB_HOST : "localhost");
config.db_username = (process.env.ST_DB_USER ? process.env.ST_DB_USER : "root");
config.db_password = (process.env.ST_DB_PASS ? process.env.ST_DB_PASS : "password");
config.db_database = (process.env.ST_DB_NAME ? process.env.ST_DB_NAME : "textile_dev");

config.email_user = (process.env.ST_EMAIL_USER ? process.env.ST_EMAIL_USER : 'simply.to.business@gmail.com');
config.email_pass = (process.env.ST_EMAIL_PASS ? process.env.ST_EMAIL_PASS : 'Mumbai905!');

config.prospect_notification_email = "rupesh.d.shah@gmail.com, rupesh_d_shah@yahoo.com";
config.registration_notification_email = "rupesh.d.shah@gmail.com, rupesh_d_shah@yahoo.com";

config.eway_bill_version = "1.0.0219";


module.exports = config;
