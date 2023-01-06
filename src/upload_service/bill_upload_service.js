var Event     = require("../bo/event");
let moment          = require("moment-timezone");
var Session       	  = require("../bo/session");
var UploadService     = require("../services/upload");
var UploadUtil		  = require("./upload_service");
var mysql             = require("../utils/mysql");
const Util            = require("../utils");
const Map            = require("../utils/map");
const ExcelReader     = require("../utils/ExcelReader");
const async           = require("async");
var MasterService    = require("../services/master");
var CompanyService    = require("../services/company");
var ConfigurationService    = require("../services/configuration");
var UserService       = require("../services/user");
var Company           = require("../bo/company");
var Customer          = require("../bo/customer");
var User              = require("../bo/user");
var Bill             = require("../bo/bill");
var Err               = require("../bo/err");
const fs = require('fs');

class BillUpload {

	constructor() {
	}

    upload(id) {
    	mysql.openConnection (function (err, connection) {
			var self = new BillUpload();
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
					let validHeaderList =  Util.getBillValidHeaderList();
					let excelReader = new ExcelReader();
					excelReader.parseFile(upload.filepath, validHeaderList, function(err, dataList) {
						
						fs.unlink(upload.filepath, function(err){
					        if(err) return console.error(err);
					    });  

						if (err && err.length > 0)
							UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Error, JSON.stringify(err), null, session);						
						
						self.uploadBill(self, upload.id, upload.companyid, dataList, session, function(error, response) {
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
								UploadUtil.updateStatus(upload.id, Util.SyncStatusEnum.Completed, "Bill File Uploaded Succesfully", hrend[0], session);
						});
					});
				}  
	    	});
	    });
    }

    createBill(bill, entityid, session, callback) {
    	
    	mysql.openConnection (function (err, connection) {		
			if (err) return callback (err);			
			connection.beginTransaction(function () {
	    		MasterService.createBill (entityid, bill, session, connection, function (err, nbill) {
	    			if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, null);
					}
					else {
						mysql.commitTransaction(connection, function () {

							var event = new Event();
							event.user_id = session.user.id;
							event.customerid = bill.customer.id;
							event.overdue = bill.bill_amount;
							event.companyid = entityid;
							
							Util.getEventManager().fireEvent(Util.LocalEventTypeEnum.CreateBill, event);
							
							return callback(null, bill);
						});
					}					
	    		});
	    	});
		});
    }

    updateBill(bill, existingBill, updateOverdue, entityid, session, callback) {
    	mysql.openConnection (function (err, connection) {		
			if (err) return callback (err);			
			connection.beginTransaction(function () {
	    		MasterService.updateBill (entityid, bill, session, connection, function (err, resbill) {
	    			if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, null);
					}
					else {
						mysql.commitTransaction(connection, function () {
							if(updateOverdue) {
								//let overdue = bill.bill_amount - bill.paid_amount - existingBill.amount + existingBill.paid_amount;
								var event = new Event();
								event.user_id = session.user.id;
								event.document_id = existingBill.id;
								event.customerid = existingBill.customer.id;
								event.overdue = bill.paid_amount * -1;
								event.companyid = entityid;
								Util.getEventManager().fireEvent(Util.LocalEventTypeEnum.UpdateBill, event);
							}
							mysql.closeConnection(connection);
							return callback(null, bill);
						});
					}					
	    		});
	    	});
		});
    }

    createCustomer(name, phone, email, entityid, not_sms_mod, session, callback) {

    	return new Promise((resolve, reject) => {
	    	mysql.openConnection (function (err, connection) {		
				if (err) return reject(err);			
				connection.beginTransaction(function () {
					let customer = Map.initCustomer();
					customer.code = null;
					customer.name = name;
					customer.invoicing_name = name;
					customer.address = Map.initAddress();
					customer.address.phone1 = phone;
					customer.address.email1 = email;
					customer.custom_type_id = 4702;

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

		    		CompanyService.createCustomer(customer, entityid, session, connection, function (err, customer) {
		    			if (err) {
							mysql.rollbackTransaction(connection, function () {
								mysql.closeConnection(connection);
							});
							return reject(err);
						}
						else {
							mysql.commitTransaction(connection, function () {

								mysql.closeConnection(connection);
								return resolve(customer);
							});
						}					
		    		});
								
		    	});
			});
	    });
    }
   
    uploadBill(self, id, entityid, list, session, callback) {

		let records_processed = 0;
		let records_failed = 0;

		let lineNumber = 1;
		mysql.openConnection (function (err, connection) {
			if (err) return callback (err);

			let custOptions = {};
			custOptions.enabled_only = 0;
			custOptions.page_number = 1;
			custOptions.page_size = 999999999;
			custOptions.sortby = "code";
			custOptions.sortorder = 1;			

			ConfigurationService.findBySysConfigName(Util.CONST_CONFIG_MODULE_NOTIFICATION_SMS, entityid, 1, session, connection, function(err, configuration) {
			CompanyService.findAllCustomers(entityid, custOptions, session, connection, function (err, vxCustList) {

				async.eachSeries(list, function iterator(obj, incb) {

					var total = records_processed + records_failed;
					if(total % 100 == 0)
					{
						UploadUtil.updateRecord(id, records_processed, records_failed, session);
					}

					lineNumber ++;
					let tempObject = new Bill();
					tempObject.bill = {};
					tempObject.bill.customer_code = ((obj['Customer Code']==undefined || obj['Customer Code']=='') ? '' : obj['Customer Code']);
					tempObject.bill.customer_name = ((obj['Customer Name']==undefined || obj['Customer Name']=='') ? '' : obj['Customer Name']);
					tempObject.bill.customer_phone = ((obj['Phone Number']==undefined || obj['Phone Number']=='') ? '' : obj['Phone Number']);
					tempObject.bill.customer_email = ((obj['Email']==undefined || obj['Email']=='') ? '' : obj['Email']);
					tempObject.bill.bill_number = ((obj['Bill Number']==undefined || obj['Bill Number']=='') ? '' : obj['Bill Number']);
					tempObject.bill.bill_ref_number = ((obj['Bill Reference Number']==undefined || obj['Bill Reference Number']=='') ? '' : obj['Bill Reference Number']);
					tempObject.bill.bill_date =  ((obj['Bill Date']==undefined || obj['Bill Date']=='') ? null : obj['Bill Date']);
					tempObject.bill.bill_amount = ((obj['Bill Amount']==undefined || obj['Bill Amount']=='') ? 0: obj['Bill Amount']);
					tempObject.bill.balance_amount = ((obj['Balance Amount']==undefined || obj['Balance Amount']=='') ? 0: obj['Balance Amount']);
					tempObject.bill.due_date = ((obj['Due Date']==undefined || obj['Due Date']=='') ? null : obj['Due Date']);
					tempObject.bill.paid_amount = ((obj['Paid Amount Till Date']==undefined || obj['Paid Amount Till Date']=='') ? 0 : obj['Paid Amount Till Date']);
					tempObject.bill.paid_date = ((obj['Latest Paid Date']==undefined || obj['Latest Paid Date']=='') ? null : obj['Latest Paid Date']);					

					if((obj['Inactive'] != undefined && obj['Inactive'] != ""))	
					{
						var status = obj['Inactive'];
						if(status == '1') 
							tempObject.bill.status_id = Util.CONST_PAYMENT_STATUS_DELETE;
						else  
							tempObject.bill.status_id = Util.CONST_PAYMENT_STATUS_ACTIVE;
					}
					else
						tempObject.bill.status_id = Util.CONST_PAYMENT_STATUS_ACTIVE;
					
					let existingCustomer = vxCustList.filter(x=>x.code.toUpperCase() == tempObject.bill.customer_code.toString().trim().toUpperCase())[0];
					
					let bOptions = {};
					bOptions.bill_ref_number = tempObject.bill.bill_ref_number;

					MasterService.findAllBills(entityid, bOptions, session, connection, async function (err, existingBillList)
					{
						if(existingCustomer == undefined)
						{
							tempObject.bill.customer = existingCustomer;
							//create customer
							if((tempObject.bill.customer_phone == undefined || tempObject.bill.customer_phone == ""))	
							{
								await UploadUtil.createUploadError(id, lineNumber, "Customer Phone Number can't be empty", null, session);
								records_failed++;
								return incb();
							}

							if((tempObject.bill.customer_name == undefined || tempObject.bill.customer_name == ""))	
							{
								await UploadUtil.createUploadError(id, lineNumber, "Customer Name can't be empty", null, session);
								records_failed++;
								return incb();
							}

							try
							{
								let newCustomer = await self.createCustomer(tempObject.bill.customer_name, tempObject.bill.customer_phone, tempObject.bill.customer_email, entityid, configuration.value, session);
								tempObject.bill.customer = newCustomer;
							}
							catch(error) {
								await UploadUtil.createUploadError(id, lineNumber, error.message, JSON.stringify(error), session);
								records_failed++;
								return incb();
							}
						}

						if(tempObject.bill.paid_amount >= 0 && tempObject.bill.paid_date == null) {
							tempObject.bill.paid_date = new Date();
						}

						let existingBill = existingBillList.length > 0 ? existingBillList[0] : undefined;

						if(existingBill == undefined)
						{
							if(tempObject.bill.status_id != Util.CONST_PAYMENT_STATUS_DELETE)
							{
								if(tempObject.bill.paid_amount >= tempObject.bill.bill_amount)
									tempObject.bill.status_id = Util.CONST_PAYMENT_STATUS_PAID;
								else if((tempObject.bill.paid_amount > 0) && (tempObject.bill.paid_amount < tempObject.bill.bill_amount))
									tempObject.bill.status_id = Util.CONST_PAYMENT_STATUS_PARTIALLY_PAID;
								else
									tempObject.bill.status_id =  Util.CONST_PAYMENT_STATUS_ACTIVE;
							}
							
							self.createBill(tempObject.bill, entityid, session, function(err, newBill){
								if(err) {
									UploadUtil.createUploadError(id, lineNumber, err.message, JSON.stringify(err), session);
									records_failed++;
								}
								else
									records_processed++;
								return incb();
							});	
						}
						else {
							let updateOverdue = false;
							existingBill.customer = tempObject.bill.customer;
							if(tempObject.bill.status_id != Util.CONST_PAYMENT_STATUS_DELETE)
							{
								updateOverdue = true;
								if(tempObject.bill.paid_amount >= tempObject.bill.bill_amount)
									tempObject.bill.status_id = Util.CONST_PAYMENT_STATUS_PAID;
								else if((tempObject.bill.paid_amount > 0) && (tempObject.bill.paid_amount <  tempObject.bill.bill_amount))
									tempObject.bill.status_id =  Util.CONST_PAYMENT_STATUS_PARTIALLY_PAID;
								else
									tempObject.bill.status_id =  Util.CONST_PAYMENT_STATUS_ACTIVE;
							}
							
							self.updateBill(tempObject.bill, existingBill, updateOverdue, entityid, session, function(err, newBill){
								if(err) {
									UploadUtil.createUploadError(id, lineNumber, err.message, JSON.stringify(err), session);
									records_failed++;
								}
								else
									records_processed++;
								return incb();
							});	
						}	
					});						
						
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

module.exports = BillUpload;