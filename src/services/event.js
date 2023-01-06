const Map            = require("../utils/map");
const Err            = require("../bo/err");
const Util           = require("../utils");

exports.insertActivity = function (event, connection) {

	return new Promise(
		function (resolve, reject) {

			let cmd = "INSERT INTO activities (sessions_id, route_type, route, created, last_updated) VALUES (?, ?, ?, NOW(), NOW())";
			connection.query(cmd, [event.sessionid, event.route_type, event.route], function (err, rows) {

				if (err) return reject(err);

				if (rows.affectedRows == 0) {
					let err = new Err();
					err.code    = rows[0].err;
					err.message = "Unable to create event record.";
					return reject(err);
				}

				let insertId = rows.insertId;
				let more = JSON.stringify(event.more);
				if(more && more != '' && more != "{}")
				{
					cmd = "INSERT INTO activity_details (activities_id, information, created, last_updated) VALUES (?, ?, NOW(), NOW())";
					connection.query(cmd, [insertId, more], function (err1, rows1) {
						if (err1) {
							return reject(err1);
						}
						else
							return resolve(insertId);
					});
				}
				else 
					return resolve(insertId);

			});

		}
	);

};


exports.insert = function (event, connection) {

	return new Promise(
		function (resolve, reject) {
			let pCancelEvents = exports.cancelOldEvents(event.document_id, event.type_id, connection);
			pCancelEvents.then(function (flag) {
 
				let cmd = "INSERT INTO events (users_id, document_id, syseventtypes_id, syssyncstatuses_id, created, last_updated) VALUES (?, ?, ?, ?, NOW(), NOW())";
				connection.query(cmd, [event.user_id, event.document_id, event.type_id, Util.SyncStatusEnum.Pending], function (err, rows) {
					
					if (err) return reject(err);

					if (rows.affectedRows == 0) {
						let err = new Err();
						err.code    = rows[0].err;
						err.message = "Unable to create event record.";
						return reject(err);
					}

					return resolve(rows.insertId);

				});
	
			}).catch (function (err) {
				reject(err);
			});


		}
	);

};

exports.cancelOldEvents = function (documentid, typeid, connection) {

	return new Promise(
		function (resolve, reject) {

			let cmd = "UPDATE events SET syssyncstatuses_id = ?, last_updated = NOW() WHERE document_id = ? AND syseventtypes_id = ? AND syssyncstatuses_id = ?";
			connection.query(cmd, [Util.SyncStatusEnum.Cancelled, documentid, typeid, Util.SyncStatusEnum.Pending], function (err, rows) {

				if (err) return reject(err);

				return resolve(true);

			});

		}
	);

};


