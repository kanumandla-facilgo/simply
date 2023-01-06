var config = {};

var env = process.env.NODE_ENV;

if (env == "uat")
	config = require("./config_uat");
else if (env == "sat") 
	config = require("./config_sat");
else if (env == "production")
	config = require("./config_production");
else
	config = require("./config_dev");


// config.web = {};
// config.local = {};

// config.web.hostname = 'localhost';
// config.web.port     = '8081';

// config.web.image_server_url  = "http://localhost:8081/";
// config.web.image_server_root = "upload/";

// config.local.image_server_root = "/public/upload/";
// config.local.image_server_folder_thumb = "";
// config.local.image_server_folder_orig = "orig/";
// config.local.image_server_folder_large = "large/";

// config.PDF_CONVERTER_WITH_PATH = 'wkhtmltopdf';

module.exports = config;
