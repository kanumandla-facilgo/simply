var Session       	  = require("../bo/session");
var UploadService     = require("../services/upload");
var MasterService     = require("../services/master");
var ConfigurationService    = require("../services/configuration");
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
var Err               = require("../bo/err");
const fs = require('fs');

class CustomerUpload {

	constructor() {

	}

    upload(id) {
    	mysql.openConnection (function (err, connection) {
			var self = new CustomerUpload();
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
					let validHeaderList =  Util.getCustomerValidHeaderList();
					let excelReader = new ExcelReader();
					excelReader.parseFile(upload.filepath, validHeaderList, function(err, dataList) {
						
						fs.unlink(upload.filepath, function(err){
					        if(err) return console.error(err);
					    });  
					    
						if (err && err.length > 0)
							UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Error, JSON.stringify(err), null, session);						
						
						self.uploadCustomer(self, upload.id, upload.companyid, dataList, session, function(error, response) {
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
								UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Completed, "Customer File Uploaded Succesfully", hrend[0], session);
						});
					});
				}  
	    	});
	    });
    }

    createCustomer(customer, entityid, not_sms_mod, session) {
    	mysql.openConnection (function (err, connection) {		
			if (err) return callback (err);			
			connection.beginTransaction(function () {

				customer.notifications = [];

				let order_not = Map.initCustomerNotification();
				order_not.companyid = entityid;
				order_not.notification_type_id = Util.NotificationTypeEnum.Order;
				order_not.active = not_sms_mod;

				if(order_not.active == 1)
				{
					order_not.phone_number = customer.address.phone1;
					order_not.emails = customer.address.email1;
				}

				let payment_reminder_not = Map.initCustomerNotification();
				payment_reminder_not.companyid = entityid;
				payment_reminder_not.notification_type_id = Util.NotificationTypeEnum.PaymentReminder;
				payment_reminder_not.active = not_sms_mod;

				if(payment_reminder_not.active == 1)
				{
					payment_reminder_not.phone_number = customer.address.phone1;
					payment_reminder_not.emails = customer.address.email1;
				}
				
				customer.notifications.push(order_not);
				customer.notifications.push(payment_reminder_not);
	    		
    			if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
					});
					return callback(err, null);
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(null, customer);
					});
				}
	    	});
		});
    }

    updateCustomer(customer, entityid, session) {
    	mysql.openConnection (function (err, connection) {		
			if (err) return callback (err);			
			connection.beginTransaction(function () {
	    		CompanyService.updateCustomer(customer, entityid, session, connection, function(err, newAgent){
	    			if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, null);
					}
					else {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback(null, customer);
						});
					}					
	    		});
	    	});
		});
    }

    uploadCustomer(self, id, entityid, list, session, callback) {

		let records_processed = 0;
		let records_failed = 0;

		let newCustomerList = [];
		let errorList = [];

		let lineNumber = 1;
		mysql.openConnection (function (err, connection) {
			if (err) return callback (err);

			let options = {};
			options.salespersonid = null;
			options.statusid = 4600;
			options["sortby"]  = null;
			options["sortorder"] = null;

			CompanyService.findAllAgents(entityid, options, session, connection, function (err, vxAgentList) {
				
				MasterService.findAllCompanyTypes(entityid, {}, session, connection, function (err, vxCompanyTypeList) {
				MasterService.findAllTransporters(entityid, {}, session, connection, function (err, vxTransporterList) {
				MasterService.findAllPaymentTerms(entityid, {}, session, connection, function (err, vxPaymentTermList) {
				ConfigurationService.findBySysConfigName(Util.CONST_CONFIG_MODULE_NOTIFICATION_SMS, entityid, 1, session, connection, function(err, configuration) {

				async.eachSeries(list, function iterator(obj, incb) {

					var total = records_processed + records_failed;
					if(total % 100 == 0)
					{
						UploadUtil.updateRecord(id, records_processed, records_failed, session);
					}

					lineNumber ++;
					let tempObject = {};
					tempObject.customer = {};
					tempObject.customer.code = ((obj['Code']==undefined || obj['Code']=='') ? '' : obj['Code']);
					tempObject.customer.name = ((obj['Firm Name']==undefined || obj['Firm Name']=='') ? '' : obj['Firm Name']);
					tempObject.customer.invoicing_name = ((obj['Accounting Name']==undefined || obj['Accounting Name']=='') ? '' : obj['Accounting Name']);

					self.setAddress(tempObject, obj);
					self.setShippingAddress(tempObject, obj);
					self.setBillingAddress(tempObject, obj);

					tempObject.customer.gst_registration_type = ((obj['GST Type']==undefined || obj['GST Type']=='') ? '' : obj['GST Type']);
					tempObject.customer.gst_number = ((obj['GST Number']==undefined || obj['GST Number']=='') ? '' : obj['GST Number']);
					tempObject.customer.agent = null;
					tempObject.customer.sales_person = null;

					tempObject.customer.allowed_balance = ((obj['Credit Limit']==undefined || obj['Credit Limit']=='') ? 0 : obj['Credit Limit']);
					tempObject.customer.current_balance = ((obj['Current Balance']==undefined || obj['Current Balance']=='') ? 0 : obj['Current Balance']);
					tempObject.customer.current_overdue = ((obj['Current Overdue']==undefined || obj['Current Overdue']=='') ? 0 : obj['Current Overdue']);
					tempObject.customer.pan_number = ((obj['PAN Number']==undefined || obj['PAN Number']=='') ? '' : obj['PAN Number']);
					tempObject.customer.notes = ((obj['Notes']==undefined || obj['Notes']=='') ? '' : obj['Notes']);
					tempObject.customer.taxform_flag = 0;

					tempObject.customer.transporter = {};
					tempObject.customer.payment_term = {};	

					tempObject.customer.user = {};
					tempObject.customer.user.first_name = tempObject.customer.address.first_name;
					tempObject.customer.user.last_name = tempObject.customer.address.last_name;
					tempObject.customer.user.login_name = ((obj['Login Name']==undefined || obj['Login Name']=='') ? '' : obj['Login Name']);
					tempObject.customer.user.password = ((obj['Password']==undefined || obj['Password']=='') ? '' : obj['Password']);

					if((obj['Status'] != undefined && obj['Status'] != ""))	
					{
						var status = obj['Status'].toUpperCase();
						if(status.toUpperCase() == 'ACTIVE') tempObject.customer.status_id = 4600
						else  tempObject.customer.status_id = 4601;
					}
					else
						tempObject.customer.status_id = 4600;

					if((obj['Agent Code'] != undefined && obj['Agent Code'] != ""))			
					{
						var agent_code = obj['Agent Code'].toString().toUpperCase();
						let agent = vxAgentList.filter(x=>x.code == agent_code)[0];
						if(agent != undefined)
						{
							tempObject.customer.agent = agent;					
							tempObject.customer.sales_person = agent.sales_person;
						}
						
					}
					if(!vxCompanyTypeList)
					{
						UploadUtil.createUploadError(id, lineNumber, "No Rate Category found", JSON.stringify(tempObject.customer), session);
						records_failed ++;
						return incb(null);return;
					}
					else if((obj['Rate Category'] != undefined && obj['Rate Category'] != ""))			
					{
						var rate_category = obj['Rate Category'].toUpperCase();
						let customer_type = vxCompanyTypeList.filter(x=>x.name.toUpperCase() == rate_category)[0];
						if(customer_type != undefined)
						{
							tempObject.customer.custom_type_id = customer_type.id;		
						}
					}
					else {
						let customer_type = vxCompanyTypeList.filter(x=>x.is_default == 1)[0];
						if(customer_type != undefined)
							tempObject.customer.custom_type_id = customer_type.id;		
					}	

					if(vxTransporterList && (obj['Transporter'] != undefined && obj['Transporter'] != ""))			
					{
						var transporter = obj['Transporter'].toUpperCase();
						let t = vxTransporterList.filter(x=>x.name.toUpperCase() == transporter)[0];
						
						if(t != undefined)
						{		
							tempObject.customer.transporter.id = t.id;		
						}
					}

					if(vxPaymentTermList && (obj['Payment Term'] != undefined && obj['Payment Term'] != ""))			
					{
						var payment_term = obj['Payment Term'].toUpperCase();
						let p = vxPaymentTermList.filter(x=>x.code.toUpperCase() == payment_term)[0];
						
						if(p != undefined)
						{
							tempObject.customer.payment_term.id = p.id;		

						}
					}

					if((obj['Rate Category'] != undefined && obj['Rate Category'] != ""))			
					{
						var rate_category = obj['Rate Category'].toUpperCase();
						let customer_type = vxCompanyTypeList.filter(x=>x.name.toUpperCase() == rate_category)[0];
						if(customer_type != undefined)
						{
							tempObject.customer.custom_type_id = customer_type.id;		
						}
					}

					if(tempObject.customer.custom_type_id == null)
					{
						UploadUtil.createUploadError(id, lineNumber, "Rate Category not found", JSON.stringify(tempObject.customer), session);
						records_failed ++;
						return incb(null);
					}
					else if(tempObject.customer.agent == null)
					{
						UploadUtil.createUploadError(id, lineNumber, "Agent not found", JSON.stringify(tempObject.customer), session);
						records_failed ++;
						return incb(null);
					}
					else
					{	
							session.user.id = null;
							CompanyService.findCustomerByCode(tempObject.customer.code, entityid, session, connection, function (err, existingCustomer) 
							{
								if((tempObject.customer.code == undefined) || (tempObject.customer.code == ''))
									existingCustomer = undefined;
							
								if(!existingCustomer)
								{
									tempObject.customer = self.setDefaultValues(tempObject.customer);
									tempObject.customer.ship_address = self.checkAddressEmpty(tempObject.customer.ship_address) ? tempObject.customer.address : tempObject.customer.ship_address;
									tempObject.customer.bill_address = self.checkAddressEmpty(tempObject.customer.bill_address) ? tempObject.customer.address : tempObject.customer.bill_address;
									CompanyService.createCustomer(tempObject.customer, entityid, session, connection, function (err, customer) {
										if(err) {
											UploadUtil.createUploadError(id, lineNumber, err.message, JSON.stringify(err), session);
											records_failed++;
										}
										else
											records_processed++;
										return incb(null);					
									});
								}
								else {
										let addressid = existingCustomer.address.id;
										let ship_addressid = existingCustomer.ship_address.id;
										let bill_addressid = existingCustomer.bill_address.id;
										let id = existingCustomer.id;
										existingCustomer = tempObject.customer;							
										existingCustomer.id = id;
										existingCustomer.address.id = addressid;
										existingCustomer.bill_address.id = bill_addressid;
										existingCustomer.ship_address.id = ship_addressid;

										CompanyService.updateCustomer(existingCustomer, entityid, session,connection, function(err, newCustomer){
											if(err) {
												UploadUtil.createUploadError(id, lineNumber, err.message, JSON.stringify(err), session);
												records_failed++;
											}
											else
												records_processed++;
											return incb(null);
										});
									
								}
							});
						
					}
				}, function (err) {
					mysql.closeConnection(connection);
					UploadUtil.updateRecord(id, records_processed, records_failed, session);
					return callback(err, {"records_processed": records_processed, "records_failed": records_failed});				
				});
			});
			});
			});
			});
			});
		});	
	}

	setAddress = function(tempObject, obj) 
	{
		tempObject.customer.address = {};
		tempObject.customer.address.first_name = ((obj['First Name']==undefined || obj['First Name']=='') ? '' : obj['First Name']);
		tempObject.customer.address.last_name = ((obj['Last Name']==undefined || obj['Last Name']=='') ? '' : obj['Last Name']);
		tempObject.customer.address.address1 = ((obj['Address1']==undefined || obj['Address1']=='') ? '' : obj['Address1']);
		tempObject.customer.address.address2 = ((obj['Address2']==undefined || obj['Address2']=='') ? '' : obj['Address2']);
		tempObject.customer.address.address3 = ((obj['Address3']==undefined || obj['Address3']=='') ? '' : obj['Address3']);
		tempObject.customer.address.city = ((obj['City']==undefined || obj['City']=='') ? '' : obj['City']);
		tempObject.customer.address.state = ((obj['State']==undefined || obj['State']=='') ? '' : obj['State']);
		tempObject.customer.address.zip = ((obj['PinCode']==undefined || obj['PinCode']=='') ? '' : obj['PinCode']);
		tempObject.customer.address.email1 = ((obj['Email']==undefined || obj['Email']=='') ? '' : obj['Email']);
		tempObject.customer.address.phone1 = ((obj['Phone']==undefined || obj['Phone']=='') ? '' : obj['Phone']);
		tempObject.customer.address.phone2 = ((obj['Other Phone']==undefined || obj['Other Phone']=='') ? '' : obj['Other Phone']);
		return tempObject;
	}

	setShippingAddress = function(tempObject, obj) 
	{
		tempObject.customer.ship_address = {};
		tempObject.customer.ship_address.first_name = ((obj['Shipping First Name']==undefined || obj['Shipping First Name']=='') ? '' : obj['Shipping First Name']);
		tempObject.customer.ship_address.last_name = ((obj['Shipping Last Name']==undefined || obj['Shipping Last Name']=='') ? '' : obj['Shipping Last Name']);
		tempObject.customer.ship_address.address1 = ((obj['Shipping Address1']==undefined || obj['Shipping Address1']=='') ? '' : obj['Shipping Address1']);
		tempObject.customer.ship_address.address2 = ((obj['Shipping Address2']==undefined || obj['Shipping Address2']=='') ? '' : obj['Shipping Address2']);
		tempObject.customer.ship_address.address3 = ((obj['Shipping Address3']==undefined || obj['Shipping Address3']=='') ? '' : obj['Shipping Address3']);
		tempObject.customer.ship_address.city = ((obj['Shipping City']==undefined || obj['Shipping City']=='') ? '' : obj['Shipping City']);
		tempObject.customer.ship_address.state = ((obj['Shipping State']==undefined || obj['Shipping State']=='') ? '' : obj['Shipping State']);
		tempObject.customer.ship_address.zip = ((obj['Shipping PinCode']==undefined || obj['Shipping PinCode']=='') ? '' : obj['Shipping PinCode']);
		tempObject.customer.ship_address.email1 = ((obj['Shipping Email']==undefined || obj['Shipping Email']=='') ? '' : obj['Shipping Email']);
		tempObject.customer.ship_address.phone1 = ((obj['Shipping Phone']==undefined || obj['Shipping Phone']=='') ? '' : obj['Shipping Phone']);
		tempObject.customer.ship_address.phone2 = ((obj['Shipping Other Phone']==undefined || obj['Shipping Other Phone']=='') ? '' : obj['Shipping Other Phone']);
		return tempObject;
	}

	setBillingAddress = function(tempObject, obj) 
	{
		tempObject.customer.bill_address = {};
		tempObject.customer.bill_address.first_name = ((obj['Billing First Name']==undefined || obj['Billing First Name']=='') ? '' : obj['Billing First Name']);
		tempObject.customer.bill_address.last_name = '';
		tempObject.customer.bill_address.address1 = ((obj['Billing Address1']==undefined || obj['Billing Address1']=='') ? '' : obj['Billing Address1']);
		tempObject.customer.bill_address.address2 = ((obj['Billing Address2']==undefined || obj['Billing Address2']=='') ? '' : obj['Billing Address2']);
		tempObject.customer.bill_address.address3 = ((obj['Billing Address3']==undefined || obj['Billing Address3']=='') ? '' : obj['Billing Address3']);
		tempObject.customer.bill_address.city = ((obj['Billing City']==undefined || obj['Billing City']=='') ? '' : obj['Billing City']);
		tempObject.customer.bill_address.state = ((obj['Billing State']==undefined || obj['Billing State']=='') ? '' : obj['Billing State']);
		tempObject.customer.bill_address.zip = ((obj['Billing PinCode']==undefined || obj['Billing PinCode']=='') ? '' : obj['Billing PinCode']);
		tempObject.customer.bill_address.email1 = ((obj['Billing Email']==undefined || obj['Billing Email']=='') ? '' : obj['Billing Email']);
		tempObject.customer.bill_address.phone1 = ((obj['Billing Phone']==undefined || obj['Billing Phone']=='') ? '' : obj['Billing Phone']);
		tempObject.customer.bill_address.phone2 = ((obj['Billing Other Phone']==undefined || obj['Billing Other Phone']=='') ? '' : obj['Billing Other Phone']);
		return tempObject;
	}

	checkAddressEmpty = function(address)
	{
		if(address.address1!='' || address.address2!='' || address.address3!='' || address.city!='' || address.state!='' || address.zip!='')
			return false;
		return true;
	}

	setDefaultValues = function(customer){
		customer.transporter.id = customer.transporter.id ? customer.transporter.id : "";
		customer.payment_term.id = customer.payment_term.id ? customer.payment_term.id : "";
		customer.taxform_flag = "";
		customer.vat_number = "";
		customer.excise_number = "";
		return customer;
	}
};



module.exports = CustomerUpload;