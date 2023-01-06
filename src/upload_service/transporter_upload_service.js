var Session       	  = require("../bo/session");
var UploadService     = require("../services/upload");
var UploadUtil		  = require("./upload_service");
var mysql             = require("../utils/mysql");
const Util            = require("../utils");
const ExcelReader     = require("../utils/ExcelReader");
const async           = require("async");
var MasterService    = require("../services/master");
var UserService       = require("../services/user");
var Company           = require("../bo/company");
var Customer          = require("../bo/customer");
var User              = require("../bo/user");
var Err               = require("../bo/err");
const fs = require('fs');

class TransporterUpload {

	constructor() {

	}

    upload(id) {
    	mysql.openConnection (function (err, connection) {
			var self = new TransporterUpload();
			if (err) return callback (err);

	    	UploadService.findById(id, null, connection, function (err, upload) {
	    		var hrstart = process.hrtime();
	    		if (err) {
					mysql.closeConnection(connection);
				}

				if (!upload)
				{
					mysql.closeConnection(connection);
					console.error("File Upload not found." + id);
				} 
				else {
					mysql.closeConnection(connection);

					let session = new Session();
					session.user  = {};
					session.user.id = upload.userid;

					UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Processing, "", null, session);
					let validHeaderList =  Util.getTransporterValidHeaderList();
					let excelReader = new ExcelReader();
					excelReader.parseFile(upload.filepath, validHeaderList, function(err, dataList) {
						
						fs.unlink(upload.filepath, function(err){
					        if(err) return console.error(err);
					    });  
					    		
						if (err && err.length > 0)
							UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Error, JSON.stringify(err), null, session);					
						
						self.uploadTransporter(self, upload.id, upload.companyid, dataList, session, function(error, response) {
							var hrend = process.hrtime(hrstart);
							if(error) {
								UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Error, "Upload Failed due to Invalid Input File Format", hrend[0], session);
								console.error(error);
							}
							else if(response.records_failed > 0) {
								UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Error, "Upload Failed", hrend[0], session);
								console.error(error);								
							}
							else
								UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Completed, "Transporter File Uploaded Succesfully", hrend[0], session);
						});
					});
				}  
	    	});
	    });
    }

    createTransporter(transporter, entityid, session) {
    	mysql.openConnection (function (err, connection) {		
			if (err) return callback (err);			
			connection.beginTransaction(function () {
	    		MasterService.createTransporter(transporter, {}, entityid, session, connection, function (err, transporter) {
	    			if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, null);
					}
					else {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback(null, transporter);
						});
					}					
	    		});
	    	});
		});
    }

    updateTransporter(transporter, entityid, session) {
    	mysql.openConnection (function (err, connection) {		
			if (err) return callback (err);			
			connection.beginTransaction(function () {
	    		MasterService.updateTransporter(transporter, entityid, session, connection, function(err, newTransporter){
	    			if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, null);
					}
					else {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback(null, transporter);
						});
					}					
	    		});
	    	});
		});
    }

    uploadTransporter(self, id, entityid, list, session, callback) {

		let records_processed = 0;
		let records_failed = 0;

		let lineNumber = 1;
		let options = {};
		options.code = '';

		mysql.openConnection (function (err, connection) {
			if (err) return callback (err);
			MasterService.findAllTransporters(entityid, options, session, connection, function (err, vxTransporterList) {
				async.eachSeries(list, function iterator(obj, incb) {

					lineNumber ++;

					let tempObject = {};
					tempObject.transporter = {};
					tempObject.transporter.code = ((obj['Code']==undefined || obj['Code']=='') ? '' : obj['Code']);
					tempObject.transporter.name = ((obj['Name']==undefined || obj['Name']=='') ? '' : obj['Name']);
					tempObject.transporter.external_code = ((obj['Govt Code']==undefined || obj['Govt Code']=='') ? '' : obj['Govt Code']);

					tempObject.transporter.address = {};
					tempObject.transporter.address.first_name = ((obj['First Name']==undefined || obj['First Name']=='') ? '' : obj['First Name']);
					tempObject.transporter.address.last_name = ((obj['Last Name']==undefined || obj['Last Name']=='') ? '' : obj['Last Name']);
					tempObject.transporter.address.address1 = ((obj['Address1']==undefined || obj['Address1']=='') ? '' : obj['Address1']);
					tempObject.transporter.address.address2 = ((obj['Address1']==undefined || obj['Address1']=='') ? '' : obj['Address1']);
					tempObject.transporter.address.address3 = ((obj['Address1']==undefined || obj['Address1']=='') ? '' : obj['Address1']);
					tempObject.transporter.address.city = ((obj['City']==undefined || obj['City']=='') ? '' : obj['City']);
					tempObject.transporter.address.state = ((obj['State']==undefined || obj['State']=='') ? '' : obj['State']);
					tempObject.transporter.address.zip = ((obj['PinCode']==undefined || obj['PinCode']=='') ? '' : obj['PinCode']);
					tempObject.transporter.address.email1 = ((obj['Email']==undefined || obj['Email']=='') ? '' : obj['Email']);
					tempObject.transporter.address.phone1 = ((obj['Phone']==undefined || obj['Phone']=='') ? '' : obj['Phone']);
					tempObject.transporter.address.phone2 = ((obj['Other Phone']==undefined || obj['Other Phone']=='') ? '' : obj['Other Phone']);

					if((obj['Status'] != undefined && obj['Status'] != ""))	
					{
						var status = obj['Status'].toUpperCase();
						if(status.toUpperCase() == 'ACTIVE') tempObject.transporter.status_id = 4600
						else  tempObject.transporter.status_id = 4601;
					}
					else
						tempObject.transporter.status_id = 4600;
					
					
					let existingTransporter = vxTransporterList.filter(x=>x.code == tempObject.transporter.code.toUpperCase())[0];
					if((tempObject.transporter.code == undefined) || (tempObject.transporter.code == ''))
						existingTransporter = undefined;

					if(existingTransporter == undefined)
					{
						MasterService.createTransporter(tempObject.transporter, entityid, session, connection, function (err, transporter) {
							if(err) {
								UploadUtil.createUploadError(id, lineNumber, err.message, JSON.stringify(err), session);
								records_failed++;
							}
							else
								records_processed++;
							return incb(null)					
						});
					}
					else {	
							let addressid = existingTransporter.address.id;						
							existingTransporter.address = tempObject.transporter.address;
							existingTransporter.address.id = addressid;
							existingTransporter.govt_code = tempObject.transporter.external_code;
							existingTransporter.code = tempObject.transporter.code;
							existingTransporter.name = tempObject.transporter.name;
							existingTransporter.status_id = tempObject.transporter.status_id;

							MasterService.updateTransporter(existingTransporter, entityid, session,connection, function(err,  newTransporter){
							if(err) {
								UploadUtil.createUploadError(id, lineNumber, err.message, JSON.stringify(err), session);
								records_failed++;
							}
							else
								records_processed++;
								return incb(null)
							});
						
					}
							

				}, function (err) {

					mysql.closeConnection(connection);
					UploadUtil.updateRecord(id, records_processed, records_failed, session);
					return callback(err, {"records_processed": records_processed, "records_failed": records_failed});	
				});
			});
		});
	}
};

module.exports = TransporterUpload;