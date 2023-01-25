var Map       = require("../utils/map");
var Util             = require("../utils");
let moment = require("moment-timezone");
/*
var createSession = function (user, callback) {

		var s = new Session();

		s.first_name   = user.first_name;
		s.last_name    = user.last_name;
		s.user_type_id = user.user_type_id;
		s.companies_id = user.company_id;
		s.email        = user.email;
		s.users_id     = user.id;
		s.expiration   = new Date() + 30*60000;
 
		s.save(function (err) {
			if (err)
				return callback(err);
			else
			{
				return callback(err, Map.mapToBSession(s));
			}
		});

};
*/

var validate = function(id, timeout, connection, callback) {
     console.log("validate function in session service is called",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
	var cmd = "CALL spGetSession(@err,@msg,?, ?)";
	console.log("ID and timeount :" + id + " Timeout :" + timeout);
	connection.query(cmd, [
							id, timeout
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0) {

								var vxSession = Map.mapToBSession(rows[0][0]);

								if (rows[1] && rows[1].length > 0) {

									var vxPermissionlist = {};
	
									for (i=0; i < rows[1].length; i++) {
										vxPermissionlist[rows[1][i].syspermissions_id] = rows[1][i].value;
										//vxPermissionlist.push(Map.mapToBPermission(rows[1][i]));
									}
									
									vxSession.permissionlist = vxPermissionlist;

								}

								if (rows[2] && rows[2].length > 0) {

									var vxConfigurationlist = {};

									for (i=0; i < rows[2].length; i++) {
										vxConfigurationlist[rows[2][i].name] = rows[2][i].value;
									}
							
									vxSession.configurationlist = vxConfigurationlist;

								}

								console.log("validate function in session service returns a value",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
								return callback(null, vxSession);
							}
							else
								return callback(null, null);
						}
	);
	/*
	Session.findOne({_id:id}, function (err, session)  {
		if (err)  {
			if (err.name === 'CastError')
				return callback(null, null);
			else
				return callback(err);
		}
		else if (session === null) {
			return callback(err, null);
		}
		else {
			session.expiration = new Date() + 30*60*1000; //60 sec * 1000 ms is constant for a minute
			session.save (function (err) {
				if (err)
					return callback(err);
				else
				{
					return callback(err, Map.mapToBSession(session));
				}
			});
		}
	});
	*/
};

var logout = function(id, connection, callback) {

    var err = -1;
    var msg = '';
	var id  = -1;

	var cmd = "CALL spLogOUT(@err, @msg, ?)";

	connection.query(cmd, [
							id
						], function (err, row) {

		if (err) return callback(err);
		
		if (row)
			callback(null, row.message);
		else
			callback(null, '');

	});
	
};

var findById = function (id, callback) {

	var cmd = "CALL spGetSession(@err,@msg,?, ?)";

	connection.query(cmd, [
							id, -1
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0)
								return callback(null, Map.mapToBSession(rows[0][0]));
							else
								return callback(null, null);
						}
	);

	/*
	Session.findOne({_id:id}, function (err, session) {
		if (err) {
			if (err.name === 'CastError')
				return callback(null, null);
			else
				return callback(err);
		}
		else if (session === null) {
			return callback(err, null);
		}
		else
			return callback(err, Map.mapToBSession(session));
	});
	*/
};

var create = function (companyid, sessionid, connection, callback) {

	var cmd = "CALL spCreateOneTimeSession(@err, @msg, ?, ?, ?, ?, ?)";
	connection.query(cmd, [
							companyid, null, null, sessionid, Util.SessionTypesEnum.OneTime
						], function (err, rows) {
							if (err) return callback(err, null);

							if (rows && rows[0] && rows[0].length > 0)
								return callback(null, Map.mapToBSession(rows[0][0]));
							else
								return callback(null, null);
						}
	);
};

module.exports = {
//	createSession   : createSession,
	findById        : findById,
	validate        : validate,
	logout          : logout,
	create  		: create
};
