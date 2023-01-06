var Map            = require("../utils/map");
var Err            = require("../bo/err");
var Upload         = require("../bo/upload");
var UploadError    = require("../bo/upload_error");
var Util           = require("../utils");
var async          = require("async");

var create = function (companyid, upload, session, connection, callback) {

	cmd = "INSERT INTO uploads (companies_id, sysuploadtypes_id, users_id, syssyncstatuses_id, file_path, format, " + 
				"number_of_records, notes, created, last_updated) " +
					"VALUES (?, ?, ?, ?, ?, ?, ?,?, NOW(), NOW())";

	connection.query(cmd, [upload.companyid, upload.upload_type_id, upload.userid, upload.status_id, 
							upload.filepath, upload.format, upload.number_of_records, upload.notes], function (err, row) {

		if (err) callback(err);

		if (row && row.affectedRows == 1) {
			upload.id = row.insertId;
			return callback(null, upload);
		}
		else
			return callback(err, null);

	});
};

var update_status = function (id, statusid, notes, processed_time_seconds, session, connection, callback) {

	cmd = "update uploads set syssyncstatuses_id = ?, last_updated = NOW(), processed_time_seconds = ?, notes = ? where id = ? ";

	connection.query(cmd, [statusid, processed_time_seconds, notes, id], function (err, row) {

		if (err) callback(err);

		if (row && row.affectedRows == 1) {
			return callback(null, {"statuscode": 0, "id": id, "message":"Success" });
		}
		else
			return callback(err, null);

	});
};

var update = function (id, records_processed, records_failed, session, connection, callback) {

	cmd = "update uploads set records_processed = ?, records_failed = ?, last_updated = NOW() where id = ? ";

	connection.query(cmd, [records_processed, records_failed, id], function (err, row) {

		if (err) callback(err);

		if (row && row.affectedRows == 1) {
			return callback(null, {"statuscode": 0, "id": id, "message":"Success" });
		}
		else
			return callback(err, null);

	});
};

var create_upload_error = function (upload_error, session, connection, callback) {

	cmd = "INSERT INTO upload_error_details (uploads_id, line_number, failure_reason, more, created, last_updated) " +
					"VALUES (?, ?, ?, ?, NOW(), NOW())";

	connection.query(cmd, [upload_error.uploadid, upload_error.line_number, upload_error.failure_reason, upload_error.more], function (err, row) {

		if (err) callback(err);

		if (row && row.affectedRows == 1) {
			upload_error.id = row.insertId;
			return callback(null, upload_error);
		}
		else
			return callback(err, null);

	});
};

var findById = function(id, session, connection, callback) {

	connection.query("SELECT * FROM uploads WHERE id = ?", [
			id
		], function (err, rows) {

			if (err) return callback (err);
			
			if (rows && rows.length > 0)
			{
				let dRow = rows[0];
				return callback(null, mapToBUpload(dRow));
			}
			else
				return callback(null, null);
		}
	);
}

var getUploadDetailById = function(id, session, connection, callback) {

	findById(id, session, connection, function(err, response){
		let upload = response;
		if (err) return callback (err);
		connection.query("SELECT * FROM upload_error_details WHERE uploads_id = ?", [
			id
		], function (err, rows) {

			if (err) return callback (err);
			
			if (rows && rows.length > 0)
			{
				let dRow = rows[0];
				var uploadList = []
				for (i=0; i < rows.length; i++) {
					uploadList.push(mapToBUploadError(rows[i]));
				}
				upload.error_details = uploadList;
				return callback(null, upload);
			}
			else
				return callback(null, null);
		});
	})	
}

var findAll = function(companyid, session, connection, callback) {

	connection.query("SELECT u.*, s.name as upload_type_name, ss.name as status_name FROM uploads u inner join sysuploadtypes s on u.sysuploadtypes_id = s.id inner join syssyncstatuses ss on ss.id = u.syssyncstatuses_id" +
						"  WHERE companies_id = ? and date(u.created) >= CURDATE() - interval 7 day order by id desc limit 50", [
			companyid
		], function (err, rows) {

			if (err) return callback (err);
			
			if (rows && rows.length > 0)
			{
				var uploadList = [];
				if (rows) {
					for (i=0; i < rows.length; i++) {
						uploadList.push(mapToBUpload(rows[i]));
					}
				}
				return callback(null, uploadList);
			}
			else
				return callback(null, null);
		}
	);
}


function mapToBUpload(dRow) {

	var u = new Upload();
	u.id = dRow.id;
	u.upload_type = dRow.sysuploadtypes_id;
	u.status_id  = dRow.syssyncstatuses_id
	u.status_name = dRow.status_name;
	u.upload_type_name = dRow.upload_type_name;
    u.filepath = dRow.file_path;
	u.format = dRow.format;
    u.number_of_records = dRow.number_of_records;
    u.records_processed = dRow.records_processed;
    u.records_failed = dRow.records_failed;
    u.processed_time = dRow.processed_time_seconds;
    u.userid = dRow.users_id;
    u.companyid = dRow.companies_id;
    u.notes = dRow.notes;
	u.created = dRow.created;
	u.last_updated = dRow.last_updated;
	return u;
}

function mapToBUploadError(dRow) {

	var u = new UploadError();
	u.id = dRow.id;
	u.uploadid = dRow.uploads_id;
	u.line_number  = dRow.line_number;
    u.failure_reason = dRow.failure_reason;
	u.more = dRow.more;
	u.created = dRow.created;
	u.last_updated = dRow.last_updated;
	return u;
}

module.exports = {

	create : create,
	update : update,
	update_status : update_status,
	create_upload_error : create_upload_error,
	findById  : findById,
	findAll : findAll,
	getUploadDetailById : getUploadDetailById

}
