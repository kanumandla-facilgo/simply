var ReportService    = require("../services/report");
var Util             = require("../utils");
var Err              = require("../bo/err");
var mysql            = require("../utils/mysql");

var printReport = function (id, options, companyid, session, callback) {

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		ReportService.printReport(id, options, companyid, session, connection, function (err, stream) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!stream)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Report not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(null, stream); 
			}  

		});

    });

};

var getReport = function (id, options, companyid, session, callback) {

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		ReportService.getReport(id, options, companyid, session, connection, function (err, report) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!report)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Report not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(report, "REPORT"));
			}  

		});

    });

};

module.exports = {
	printReport: printReport,
	getReport  : getReport
}
