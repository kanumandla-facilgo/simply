var ConfigService     = require("../services/configuration");
var Util              = require("../utils");
var Config            = require("../bo/configuration");
var Err               = require("../bo/err");
var mysql             = require("../utils/mysql");

var findById = function (id, companyid, callback) {

		/*TODO: implement whole method */
       ConfigService.findById(id, companyid, function (err, configuration) {

			if (err)
				return callback(err);

			if (!configuration)
			{
				var response = Util.setErrorResponse(-100, "Configuration not found."); //new Status();
				return callback(err, response);
			} 
			else {
				return callback(err, Util.setOKResponse(configuration, "Configuration"));
			}  
       });
 
}

var findAll = function (companyid, session, callback) {

		/*TODO: implement whole method */
	mysql.openConnection (function (err, connection) {
		connection.beginTransaction(function () {
	       ConfigService.findAll(companyid, 1, session, connection, function (err, configList) {

				if (err)
				{
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					});
				}

				if (!configList)
				{
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
					var response = Util.setErrorResponse(-100, "Configuration not found."); //new Status();
					return callback(err, response);
				} 
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
					var configHash = {};
					for (var i = 0; i < configList.length; i++)
						configHash[configList[i].name] = configList[i].value;
					return callback(err, Util.setOKResponse(configHash, "Configuration"));
				}  
	       });
	    });
    });
 
}

var findByCode = function (code, companyid, record_id, record_type_id, callback) {

		/*TODO: implement whole method */
       ConfigService.findByCode(code, companyid, record_id, record_type_id, function (err, configuration) {

			if (err)
				return callback(err);

			if (!configuration)
			{
				var response = Util.setErrorResponse(-100, "Configuration not found."); //new Status();
				return callback(err, response);
			} 
			else {
				return callback(err, Util.setOKResponse(configuration, "Configuration"));
			}  
       });
 
}


module.exports = {
	findById                     : findById,
	findByCode                   : findByCode,
	findAll						 : findAll
}
