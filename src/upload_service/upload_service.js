var UploadService     = require("../services/upload");
var mysql             = require("../utils/mysql");

var updateStatus = function(id, statusid, notes, processed_time, session) {
	mysql.openConnection (function (err, connection) {		
		if (err) return callback (err);			
		connection.beginTransaction(function () {
    		UploadService.update_status(id, statusid, notes, processed_time, session, connection, function(err, res){

    			if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
				}					
    		});
    	});
	});
}

var updateRecord = function(id, records_processed, records_failed, session) {
	mysql.openConnection (function (err, connection) {		
		if (err) return callback (err);			
		connection.beginTransaction(function () {
    		UploadService.update(id, records_processed, records_failed, session, connection, function(err, response){
    			if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
				}					
    		});
    	});
	});
}

var createUploadError = function(uploadid, record_number, failure_reason, more, session) {
	let upload_err_detail = {};
	upload_err_detail.uploadid = uploadid;
	upload_err_detail.line_number = record_number;
	upload_err_detail.failure_reason = failure_reason;
	upload_err_detail.more = more;

	mysql.openConnection (function (err, connection) {		
		if (err) return callback (err);			
		connection.beginTransaction(function () {
    		UploadService.create_upload_error(upload_err_detail, session, connection, function(err, response){
    			if (err) {
    				console.error(err);
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
				}					
    		});
    	});
	});
}

module.exports = {

	createUploadError : createUploadError,
	updateRecord : updateRecord,
	updateStatus : updateStatus

};