var Util           = require("../utils");
var Map            = require("../utils/map");
var Err            = require("../bo/err");

// var findById = function (id, companyid, callback) {

// 	//TODO: validation of inputs
// 	Config.findOne({"_id":id.trim(), "companies_id":companyid}, function (err, configuration) {
// 		if (err) {
// 			if (err.name === 'CastError')
// 				return callback(null, null);
// 			else
// 				return callback(err);
// 		}
// 		else if (configuration === null) {
// 			return callback(err, null);
// 		}
// 		else {
// 			return callback(err, Map.mapToBConfiguration(configuration));
// 		}
// 	});

// };

var findById = function (id, companyid, internalflag, session, connection, callback) {

 	var cmd = "CALL spGetConfiguration(@err,@msg, ?, ?, ?, ?, ?, ?)";

	var para;
	para = [companyid, id, null, null, (internalflag == 1 ? 0 : session.user.id, null)];

	connection.query(cmd, para, function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0) {
								var configurationList = [];
								for (var i = 0; i < rows[0].length; i++) {
									configurationList.push(Map.mapToBConfiguration(rows[0][i]));
								}
								return callback(null, configurationList);
							}
							else
								return callback(null, null);
						}
	);

};

var findBySysConfigId = function (sysconfigid, companyid, internalflag, session, connection, callback) {

 	var cmd = "CALL spGetConfiguration(@err,@msg, ?, ?, ?, ?, ?, ?)";

	var para;
	para = [companyid, null, sysconfigid, null, (internalflag == 1 ? 0 : session.user.id), null];

	connection.query(cmd, para, function (err, rows) {

		if (err) return callback (err);

		if (rows && rows[0] && rows[0].length > 0) {
				return callback(null, Map.mapToBConfiguration(rows[0][0]));
		}
		else
			return callback(null, null);

	});

};

var findBySysConfigName = function (sysconfigname, companyid, internalflag, session, connection, callback) {

 	var cmd = "CALL spGetConfiguration(@err,@msg, ?, ?, ?, ?, ?, ?)";

	var para;
	para = [companyid, null, null, null, (internalflag == 1 ? 0 : session.user.id), sysconfigname];

	connection.query(cmd, para, function (err, rows) {

		if (err) return callback (err);

		if (rows && rows[0] && rows[0].length > 0) {
				return callback(null, Map.mapToBConfiguration(rows[0][0]));
		}
		else
			return callback(null, null);

	});

};


var findByCode = function (code, companyid, recordid, recordtypeid, callback) {

	Config.findOne({"code":code.trim(), "companies_id":companyid, "record_id":recordid + "", "record_type_id":recordtypeid}, function (err, configuration) {
		if (err) {
			if (err.name === 'CastError')
				return callback(null, null);
			else
				return callback(err);
		}
		else if (configuration === null) {
			return callback(err, null);
		}
		else {
			return callback(err, Map.mapToBConfiguration(configuration));
		}
	});

};

var findAll = function (companyid, internalflag, session, connection, callback) {

 	var cmd = "CALL spGetConfiguration(@err,@msg, ?, ?, ?, ?, ?, ?)";

	var para;

	para = [companyid, null, null, null, (internalflag == 1 ? 0 : session.user.id), null];

	connection.query(cmd, para, function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0) {
								var configurationList = [];
								for (var i = 0; i < rows[0].length; i++) {
									configurationList.push(Map.mapToBConfiguration(rows[0][i]));
								}
								return callback(null, configurationList);
							}
							else
								return callback(null, null);
						}
	);

};

module.exports = {
	findById                     : findById,
	findAll                      : findAll,
	findBySysConfigId            : findBySysConfigId,
	findBySysConfigName			 : findBySysConfigName,
	findByCode                   : findByCode
};
