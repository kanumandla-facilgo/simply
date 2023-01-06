var UploadService     = require("../services/upload");
var Util              = require("../utils");
var Err               = require("../bo/err");
var Event     = require("../bo/event");
var mysql             = require("../utils/mysql");
var async = require('async');

var save = function (companyid, xUpload, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		UploadService.create(companyid, xUpload, session, connection, function (err, upload) {

			if (err) {
				console.error(err);
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!upload)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "File Upload not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);

				var event = new Event();
				event.user_id = session.user.id;
				event.document_id = upload.id;

				if(xUpload.upload_type_id == Util.UploadTypeEnum.Agent)
					Util.getEventManager().fireEvent(Util.EventTypeEnum.AgentUpload, event);
				else if(xUpload.upload_type_id == Util.UploadTypeEnum.Customer)
					Util.getEventManager().fireEvent(Util.EventTypeEnum.CustomerUpload, event);
				if(xUpload.upload_type_id == Util.UploadTypeEnum.Transporter)
					Util.getEventManager().fireEvent(Util.EventTypeEnum.TransporterUpload, event);
				if(xUpload.upload_type_id == Util.UploadTypeEnum.Bill)
					Util.getEventManager().fireEvent(Util.EventTypeEnum.BillUpload, event);
				
				return callback(err, Util.setOKResponse(upload, "Upload"));
			}  
		});

	});
 
};

var findAll = function (companyid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		UploadService.findAll(companyid, session, connection, function (err, uploads) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!uploads)
			{
				mysql.closeConnection(connection);
				uploads = [];
				var response = Util.setOKResponse(uploads, "Upload");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(uploads, "Upload"));
			}  

		});

    });

}

var findById = function (uploadid, detail, session, callback) {

	if(detail != 1)
	{
		mysql.openConnection (function (err, connection) {
			
			if (err) return callback (err);

			UploadService.findById(uploadid, session, connection, function (err, uploads) {

				if (err) {
					mysql.closeConnection(connection);
					return callback (err);
				}
				else if (!uploads)
				{
					mysql.closeConnection(connection);
					uploads = [];
					var response = Util.setOKResponse(uploads, "Upload");
					return callback(err, response);
				} 
				else {
					mysql.closeConnection(connection);
					return callback(err, Util.setOKResponse(uploads, "Upload"));
				}  
			});
	    });
	}
	else {

		mysql.openConnection (function (err, connection) {
			
			if (err) return callback (err);

			UploadService.getUploadDetailById(uploadid, session, connection, function (err, uploads) {

				if (err) {
					mysql.closeConnection(connection);
					return callback (err);
				}
				else if (!uploads)
				{
					mysql.closeConnection(connection);
					uploads = [];
					var response = Util.setOKResponse(uploads, "Upload");
					return callback(err, response);
				} 
				else {
					mysql.closeConnection(connection);
					return callback(err, Util.setOKResponse(uploads, "Upload"));
				}  
			});
	    });

	}

}


module.exports = {

	save : save,
	findAll : findAll,
	findById : findById

};


