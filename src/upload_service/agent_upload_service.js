var Session       	  = require("../bo/session");
var UploadService     = require("../services/upload");
var UploadUtil		  = require("./upload_service");
var mysql             = require("../utils/mysql");
const Util            = require("../utils");
const ExcelReader     = require("../utils/ExcelReader");
const async           = require("async");
var CompanyService    = require("../services/company");
var UserService       = require("../services/user");
var Company           = require("../bo/company");
var Customer          = require("../bo/customer");
var User              = require("../bo/user");
var Agent             = require("../bo/agent");
var Err               = require("../bo/err");
const fs = require('fs');

class AgentUpload {

	constructor() {
	}

    upload(id) {
    	mysql.openConnection (function (err, connection) {
			var self = new AgentUpload();
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
					let validHeaderList =  Util.getAgentValidHeaderList();
					let excelReader = new ExcelReader();
					excelReader.parseFile(upload.filepath, validHeaderList, function(err, dataList) {
						
						fs.unlink(upload.filepath, function(err){
					        if(err) return console.error(err);
					    });  

						if (err && err.length > 0)
							UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Error, JSON.stringify(err), null, session);						
						
						self.uploadAgent(self, upload.id, upload.companyid, dataList, session, function(error, response) {
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
								UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Completed, "Agent File Uploaded Succesfully", hrend[0], session);
						});
					});
				}  
	    	});
	    });
    }

    createAgent(agent, entityid, session, callback) {
    	mysql.openConnection (function (err, connection) {		
			if (err) return callback (err);			
			connection.beginTransaction(function () {
	    		CompanyService.createAgent(agent, entityid, session, connection, function (err, agent) {
	    			if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, null);
					}
					else {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback(null, agent);
						});
					}					
	    		});
	    	});
		});
    }

    updateAgent(agent, entityid, session, callback) {
    	mysql.openConnection (function (err, connection) {		
			if (err) return callback (err);			
			connection.beginTransaction(function () {
	    		CompanyService.updateAgent(agent, entityid, session, connection, function(err, newAgent){
	    			if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, null);
					}
					else {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback(null, agent);
						});
					}					
	    		});
	    	});
		});
    }

    uploadAgent(self, id, entityid, list, session, callback) {

		let records_processed = 0;
		let records_failed = 0;

		let lineNumber = 1;
		mysql.openConnection (function (err, connection) {
			if (err) return callback (err);

			let options = {};
			options.roleid = null;
			options.sysroleid = 4004;
			options.statusid = 4600;
			options["sortby"]  = null;
			options["sortorder"] = null;

			let agentOptions = {};
			agentOptions.salespersonid = null;
			agentOptions.statusid = 4600;
			agentOptions["sortby"]  = null;
			agentOptions["sortorder"] = null;

			UserService.findAll(entityid, options, session, connection, function (err, vxUserlist) {

				CompanyService.findAllAgents(entityid, agentOptions, session, connection, function (err, vxAgentList) {

					async.eachSeries(list, function iterator(obj, incb) {

						var total = records_processed + records_failed;
						if(total % 100 == 0)
						{
							UploadUtil.updateRecord(id, records_processed, records_failed, session);
						}

						lineNumber ++;
						let tempObject = new Agent();
						tempObject.agent = {};
						tempObject.agent.code = ((obj['Code']==undefined || obj['Code']=='') ? '' : obj['Code']);
						tempObject.agent.name = ((obj['Firm Name']==undefined || obj['Firm Name']=='') ? '' : obj['Firm Name']);
						tempObject.agent.accounting_name = ((obj['Accounting Name']==undefined || obj['Accounting Name']=='') ? '' : obj['Accounting Name']);
						tempObject.agent.commission_rate =  ((obj['Commission']==undefined || obj['Commission']=='') ? '' : obj['Commission']);
						tempObject.agent.address = {};
						tempObject.agent.address.first_name = ((obj['First Name']==undefined || obj['First Name']=='') ? '' : obj['First Name']);
						tempObject.agent.address.last_name = ((obj['Last Name']==undefined || obj['Last Name']=='') ? '' : obj['Last Name']);
						tempObject.agent.address.address1 = ((obj['Address1']==undefined || obj['Address1']=='') ? '' : obj['Address1']);
						tempObject.agent.address.address2 = ((obj['Address2']==undefined || obj['Address2']=='') ? '' : obj['Address2']);
						tempObject.agent.address.address3 = ((obj['Address3']==undefined || obj['Address3']=='') ? '' : obj['Address3']);
						tempObject.agent.address.city = ((obj['City']==undefined || obj['City']=='') ? '' : obj['City']);
						tempObject.agent.address.state = ((obj['State']==undefined || obj['State']=='') ? '' : obj['State']);
						tempObject.agent.address.zip = ((obj['PinCode']==undefined || obj['PinCode']=='') ? '' : obj['PinCode']);
						tempObject.agent.address.email1 = ((obj['Email']==undefined || obj['Email']=='') ? '' : obj['Email']);
						tempObject.agent.address.phone1 = ((obj['Phone']==undefined || obj['Phone']=='') ? '' : obj['Phone']);
						tempObject.agent.address.phone2 = ((obj['Other Phone']==undefined || obj['Other Phone']=='') ? '' : obj['Other Phone']);
						tempObject.agent.user = {};
						tempObject.agent.user.first_name = tempObject.agent.address.first_name;
						tempObject.agent.user.last_name = tempObject.agent.address.last_name;
						tempObject.agent.user.login_name = ((obj['Login Name']==undefined || obj['Login Name']=='') ? '' : obj['Login Name']);
						tempObject.agent.user.password = ((obj['Password']==undefined || obj['Password']=='') ? '' : obj['Password']);
						tempObject.agent.status = ((obj['Status']==undefined || obj['Status']=='') ? '' : obj['Status']);

						tempObject.agent.sales_person = null;

						if((obj['Status'] != undefined && obj['Status'] != ""))	
						{
							var status = obj['Status'].toUpperCase();
							if(status.toUpperCase() == 'ACTIVE') tempObject.agent.status_id = 4600
							else  tempObject.agent.status_id = 4601;
						}
						else
							tempObject.agent.status_id = 4600;

						if((obj['Sales Person Login Name'] != undefined && obj['Sales Person Login Name'] != ""))			
						{
							var salesPerson = obj['Sales Person Login Name'].toUpperCase();
							let sp = vxUserlist.filter(x=>x.login_name.toUpperCase() == salesPerson)[0];
							if(sp != undefined)
							{
								tempObject.agent.sales_person = sp;
							}
							else if(vxUserlist.length == 1)
							{
								tempObject.agent.sales_person = vxUserlist[0];
							}						
						}
						else if(vxUserlist.length == 1)
							tempObject.agent.sales_person = vxUserlist[0];

						if(tempObject.agent.sales_person == null)
						{
							UploadUtil.createUploadError(id, lineNumber, "Sales Person not found", JSON.stringify(tempObject.agent), session);
							records_failed++;
							return incb(null)
						}
						else
						{
							
							let existingAgent = vxAgentList.filter(x=>x.code.toUpperCase() == tempObject.agent.code.toUpperCase())[0];
							if((tempObject.agent.code == undefined) || (tempObject.agent.code == ''))
								existingAgent = undefined;
							
							if(existingAgent == undefined)
							{
								self.createAgent(tempObject.agent, entityid, session, function (err, agent) {
									if(err) {
										UploadUtil.createUploadError(id, lineNumber, err.message, JSON.stringify(err), session);
										records_failed++;
									}
									else
										records_processed++;
									return incb(null)					
								});
							}
							else 
							{	
								let addressid = existingAgent.address.id;						
								existingAgent.address = tempObject.agent.address;
								existingAgent.address.id = addressid;
								existingAgent.sales_person = tempObject.agent.sales_person;
								existingAgent.code = tempObject.agent.code;
								existingAgent.name = tempObject.agent.name;
								existingAgent.accounting_name = tempObject.agent.accounting_name;
								existingAgent.commission_rate = tempObject.agent.commission_rate;


								self.updateAgent(existingAgent, entityid, session, function(err, newAgent){
									if(err) {
										UploadUtil.createUploadError(id, lineNumber, err.message, JSON.stringify(err), session);
										records_failed++;
									}
									else
										records_processed++;
									return incb(null)
								});								
							}							
						}
					}, function (err) {

						mysql.closeConnection(connection);
						UploadUtil.updateRecord(id, records_processed, records_failed, session);
						return callback(err, {"records_processed": records_processed, "records_failed": records_failed});			
					});
				});
			});
		});	
	}
};

module.exports = AgentUpload;