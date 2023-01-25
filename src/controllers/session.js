var SessionService   = require("../services/session");
var Util             = require("../utils");
var Err              = require("../bo/err");
var mysql            = require("../utils/mysql");
let moment = require("moment-timezone");
var findById = function (id, callback) {

	SessionService.findById(id, function (err, session) {
		if (err)
			return callback(err);
		else if (session === null) {
			var response = Util.setErrorResponse(-100, "Session not found.");
			return callback(err, response);
		}
		else
			var response = Util.setOKResponse(session, "Session");
			return callback(err, response);
	});
}
		
var validate = function (id, callback) {
	console.log("mysql open connection in session controller",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			console.log("In mysql open connection session service is called",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
			SessionService.validate(id, 30*60, connection, function (err, session) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				

				if (session == null) {
					var response = Util.setErrorResponse(-100, "Session not found.");
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(session, "Session");
						return callback(err, response);

					});

				}

			});
		});
	});
}

var getSession = function (id, callback) {

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		SessionService.validate(id, 0, connection, function (err, session) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!session)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Session not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(session, "Session"));
			}  

		});

    });

}

var logout = function (id, callback) {

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		SessionService.logout(id, connection, function (err, session) {
			mysql.closeConnection(connection);

			if (err)
				return callback(err);
			else if (session === null) {
				var response = Util.setErrorResponse(-100, "Session not found.");
				return callback(err, response);
			}
			else {
				var response = Util.setOKResponse(session, "Session");
				return callback(err, response);
			}
		});

	});

}

var create = function (companyID, sessionID, callback) {

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		SessionService.create(companyID, sessionID, connection, function (err, session) {
			mysql.closeConnection(connection);

			if (err)
				return callback(err);
			else if (session === null) {
				var response = Util.setErrorResponse(-100, "Session not found.");
				return callback(err, response);
			}
			else {
				var response = Util.setOKResponse(session, "Session");
				return callback(err, response);
			}
		});

	});

}

module.exports = {
	findById   : findById,
	validate   : validate,
	logout     : logout,
	getSession : getSession,
	create 	   : create
}
