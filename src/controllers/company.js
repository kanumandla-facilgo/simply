var CompanyService    = require("../services/company");
var UserService    = require("../services/user");
var Util              = require("../utils");
var Company           = require("../bo/company");
var Customer          = require("../bo/customer");
var User              = require("../bo/user");
var Err               = require("../bo/err");
var mysql             = require("../utils/mysql");
let moment = require("moment-timezone");
var Event     = require("../bo/event");
var async = require('async');

var findById = function (id, callback) {

	if (Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {

		CompanyService.findById(id, connection, function (err, company) {
			if (err) {
				mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					}
				);
			}
			else if (company === null) {
				mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Error retrieving company."); //new Status();
						return callback(err, response);
					}
				);
			}
			else {

				mysql.commitTransaction(connection, function () {
					mysql.closeConnection(connection);

					return callback(err, Util.setOKResponse(company, "Company"));
				});
			}
		});
	});
 
};

var getAPICredentials = function(userID, callback) {

 	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.getAPICredentials(userID, connection, function (err, data) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (data === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error retrieving company API Credentials."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {
					
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, data);
					});
				}
			});
		});
	});
}

var create = function (xCompany, xAdminUser, callback) {

	// xCompany              =  Util.initObjectIfNotExist(xCompany, "Company");
	// xCompany.address      =  Util.initObjectIfNotExist(xCompany.address, "Address");
	// xAdminUser            =  Util.initObjectIfNotExist(xAdminUser, "User");

	xAdminUser.phone = xCompany.address.phone1;
	xAdminUser.email = xCompany.address.email1;

	if (Util.isEmptyString(xCompany.name) || Util.isEmptyString(xCompany.code) || Util.isEmptyString(xAdminUser.first_name) ||
		Util.isEmptyString(xAdminUser.last_name) || Util.isEmptyString(xAdminUser.login_name) || Util.isEmptyString(xAdminUser.password) ||
		Util.isEmptyString(xAdminUser.email) || Util.isEmptyString(xAdminUser.phone)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company name, code, user first name, last name, login name, password, email & phone are required fields.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.create(xCompany, xAdminUser, connection, function (err, company) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (company === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating company."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);

						var event = new Event();
						event.user_id = 1;
						event.document_id = company.id;
						Util.getEventManager().fireEvent(Util.LocalEventTypeEnum.CompanyCreate, event);

						return callback(err, Util.setOKResponse(company, "Company"));
					});
	/*
					var xUser           = new User();
					xUser.first_name    = firstname;
					xUser.last_name     = lastname;
					xUser.email         = email;
					xUser.company_id    = "" + company.id;  //converting to string
					xUser.password      = password;
					xUser.user_type_id  = 201;

					UserService.createCompanyAdmin(xUser, function (err, user) {
						if (err) {
							return callback (err);
						}
						else if (user === null) {
							var response = Util.setErrorResponse(-120, "Error creating company."); //new Status();
							return callback(err, response);
						}
						else
							return callback(err, Util.setOKResponse(company, "Company"));
		
					});
				}
	*/
		
				}
			});

		});
		
	});
	
};

var createCustomer = function (xCustomer, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}


	//TODO: validation
	xCustomer              =  Util.initObjectIfNotExist(xCustomer, "Customer");
	xCustomer.address      =  Util.initObjectIfNotExist(xCustomer.address, "Address");
	xCustomer.ship_address  = Util.initObjectIfNotExist(xCustomer.ship_address, "Address");
	xCustomer.bill_address  = Util.initObjectIfNotExist(xCustomer.bill_address, "Address");
	xCustomer.transporter   = Util.initObjectIfNotExist(xCustomer.transporter, "Transporter");
	xCustomer.payment_term  = Util.initObjectIfNotExist(xCustomer.payment_term, "PaymentTerm");
	xCustomer.sales_person  = Util.initObjectIfNotExist(xCustomer.sales_person, "SalesPerson");
	xCustomer.agent         = Util.initObjectIfNotExist(xCustomer.agent, "Agent");

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] != "1")
	{
		xCustomer.allowed_balance = 0;
		xCustomer.current_balance = 0;
		xCustomer.current_overdue = 0;
	}

	/*if (Util.isEmptyString(companyid) || Util.isEmptyString(xCustomer.name) ||
		Util.isEmptyString(xCustomer.payment_term.id) || Util.isEmptyString(xCustomer.transporter.id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Customer name, code, type, payment term, transporter are required fields.";
		return callback(err);

	}*/

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.createCustomer(xCustomer, companyid, session, connection, function (err, customer) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (customer === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating customer.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(customer, "Customer"));
					});
				}
			});

		});
		
	});
	
};

var updateCustomer = function (xCustomer, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	xCustomer               = Util.initObjectIfNotExist(xCustomer, "Customer");
	xCustomer.address       = Util.initObjectIfNotExist(xCustomer.address, "Address");
	xCustomer.ship_address  = Util.initObjectIfNotExist(xCustomer.ship_address, "Address");
	xCustomer.bill_address  = Util.initObjectIfNotExist(xCustomer.bill_address, "Address");
	xCustomer.transporter   = Util.initObjectIfNotExist(xCustomer.transporter, "Transporter");
	xCustomer.payment_term  = Util.initObjectIfNotExist(xCustomer.payment_term, "PaymentTerm");
	xCustomer.sales_person  = Util.initObjectIfNotExist(xCustomer.sales_person, "SalesPerson");
	xCustomer.agent         = Util.initObjectIfNotExist(xCustomer.agent, "Agent");

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] != "1")
	{
		xCustomer.allowed_balance = -1;
		xCustomer.current_balance = -1;
		xCustomer.current_overdue = -1;
		xCustomer.payment_term.id = -1;
	}

	/*if (Util.isEmptyString(companyid) || Util.isEmptyString(xCustomer.name) || Util.isEmptyString(xCustomer.code) || Util.isEmptyString(xCustomer.custom_type_id) ||
		Util.isEmptyString(xCustomer.payment_term.id) || Util.isEmptyString(xCustomer.transporter.id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Customer name, code, type, payment term, transporter are required fields.";
		return callback(err);

	}*/

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.updateCustomer(xCustomer, companyid, session, connection, function (err, customer) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (customer === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error updating customer.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(customer, "Customer"));
					});
				}
			});

		});
		
	});
	
};


var deleteCustomer = function (id, companyid, session, callback) {

    if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Customer ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.deleteCustomer(id, companyid, session, connection, function (err, status) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					});
				}
				else if (!status) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Error deleting customer."); //new Status();
						return callback(err, response);
					});
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(null, ""));
					});
				}
			});

		});
		
	});
	
};

// this method will update customer information partially (PATCH http request)
var updateCustomerData = function (companyid, customerid, options, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.updateCustomerData(companyid, customerid, options, session, connection, function (err, response) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (response === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating customer.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(response, "output"));
					});
				}
			});

		});
		
	});

};

var findAllCustomers = function (companyid, options, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		/*TODO: implement whole method */
		CompanyService.findAllCustomers(companyid, options, session, connection, function (err, vxCustomerList) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}

			else if (!vxCustomerList)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Customers not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(vxCustomerList, "Customer"));
			}  
		});
	});

};

var findCustomerById = function (id, companyid, session, callback) {

	if (Util.isEmptyString(companyid) || Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Customer ID & Company ID are required fields.";
		return callback(err);

	}
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CompanyService.findCustomerById(id, companyid, session, connection, function (err, vxCustomer) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}

			else if (!vxCustomer)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Customer not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(vxCustomer, "Customer"));
			}  
		});
	});

};

var findCustomersWithPendingDelivery = function (companyid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CompanyService.findCustomersWithPendingDelivery(companyid, session, connection, function (err, vxCustomerList) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}

			else if (!vxCustomerList)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Customer not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(vxCustomerList, "Customer"));
			}  
		});
	});

};

var createAgent = function (xAgent, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_AGENT_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	xAgent                 = Util.initObjectIfNotExist(xAgent, "Agent");
	xAgent.address         = Util.initObjectIfNotExist(xAgent.address, "Address");
	xAgent.sales_person    = Util.initObjectIfNotExist(xAgent.sales_person, "SalesPerson");

	if (Util.isEmptyString(companyid) || Util.isEmptyString(xAgent.name) || (Util.isEmptyString(xAgent.code)  && session.configurationlist[Util.CONST_CONFIG_COMPANY_AGENT_CODE_REQD] == "1")) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Agent name and code are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.createAgent(xAgent, companyid, session, connection, function (err, agent) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (agent === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating agent.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(agent, "Agent"));
					});
				}
			});

		});
		
	});
	
};

var deleteAgent = function (id, companyid, session, callback) {

    if (session.permissionlist[Util.CONST_PERMISSION_AGENT_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Agent ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.deleteAgent(id, companyid, session, connection, function (err, status) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					});
				}
				else if (!status) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Error deleting agent."); //new Status();
						return callback(err, response);
					});
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(null, ""));
					});
				}
			});

		});
		
	});
	
};

var uploadCustomer = function(entityid, list, session, callback) {

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
			async.eachSeries(list, function iterator(obj, incb) {

				lineNumber ++;
				let tempObject = {};
				tempObject.customer = {};
				tempObject.customer.code = ((obj['Code']==undefined || obj['Code']=='') ? '' : obj['Code']);
				tempObject.customer.name = ((obj['Name']==undefined || obj['Name']=='') ? '' : obj['Name']);
				tempObject.customer.invoicing_name = ((obj['Name']==undefined || obj['Name']=='') ? '' : obj['Name']);

				tempObject.customer.address = {};
				tempObject.customer.address.first_name = ((obj['Name']==undefined || obj['Name']=='') ? '' : obj['Name']);
				tempObject.customer.address.last_name = '';
				tempObject.customer.address.address1 = ((obj['Address1']==undefined || obj['Address1']=='') ? '' : obj['Address1']);
				tempObject.customer.address.address2 = ((obj['Address2']==undefined || obj['Address2']=='') ? '' : obj['Address2']);
				tempObject.customer.address.address3 = ((obj['Address3']==undefined || obj['Address3']=='') ? '' : obj['Address3']);
				tempObject.customer.address.city = ((obj['City']==undefined || obj['City']=='') ? '' : obj['City']);
				tempObject.customer.address.state = ((obj['State']==undefined || obj['State']=='') ? '' : obj['State']);
				tempObject.customer.address.zip = ((obj['PinCode']==undefined || obj['PinCode']=='') ? '' : obj['PinCode']);
				tempObject.customer.address.email1 = ((obj['Email']==undefined || obj['Email']=='') ? '' : obj['Email']);
				tempObject.customer.address.phone1 = ((obj['Phone']==undefined || obj['Phone']=='') ? '' : obj['Phone']);

				tempObject.customer.ship_address = tempObject.customer.address;
				tempObject.customer.bill_address = tempObject.customer.address;
				tempObject.customer.gst_registration_type = ((obj['GST Type']==undefined || obj['GST Type']=='') ? '' : obj['GST Type']);
				tempObject.customer.gst_number = ((obj['GST Number']==undefined || obj['GST Number']=='') ? '' : obj['GST Number']);
				tempObject.customer.agent = null;
				tempObject.customer.sales_person = null;

				if((obj['Agent Code'] != undefined && obj['Agent Code'] != ""))			
				{
					var agent_code = obj['Agent Code'].toUpperCase();
					let agent = vxAgentList.filter(x=>x.code == agent_code)[0];
					if(agent != undefined)
					{
						tempObject.customer.agent = agent;					
						tempObject.customer.sales_person = agent.sales_person;
					}
					
				}
				if((obj['AgentID'] != undefined && obj['AgentID'] != ""))			
				{
					var agentid = obj['AgentID'].toUpperCase();
					let agent = vxAgentList.filter(x=>x.id == agentid)[0];
					if(agent != undefined)
					{
						tempObject.customer.agent = agent;					
						tempObject.customer.sales_person = agent.sales_person;
					}
					
				}
				if(tempObject.customer.agent == null)
				{
					newCustomerList.push({"line_number": lineNumber,"customer_name": tempObject.customer.name, "customer_code": tempObject.customer.code, "status": "-1", "info": "{\"message\":\"Agent not found\"}"});
					incb(null);
				}
				else
				{
					if(tempObject.customer.code == '')
					{
						
						tempObject.customer = setDefaultValues(tempObject.customer);						
						CompanyService.createCustomer(tempObject.customer, entityid, session, connection, function (err, customer) {
							if(err)
								newCustomerList.push({"line_number": lineNumber,"customer_name": tempObject.customer.name, "customer_code": tempObject.customer.code, "status": "-1", "info": err});
							else
								newCustomerList.push({"line_number": lineNumber, "status": "0", "customer_name": tempObject.customer.name, "customer_code": tempObject.customer.code});
							incb(null);					
						});
					}
					else
					{
						CompanyService.findCustomerByCode(tempObject.customer.code, entityid, session, connection, function (err, existingCustomer) 
						{
							if(!existingCustomer)
							{
								tempObject.customer = setDefaultValues(tempObject.customer);
								CompanyService.createCustomer(tempObject.customer, entityid, session, connection, function (err, customer) {
									if(err)
										newCustomerList.push({"line_number": lineNumber,"customer_name": tempObject.customer.name, "customer_code": tempObject.customer.code, "status": "-1", "info": err});
									else
										newCustomerList.push({"line_number": lineNumber, "status": "0", "customer_name": tempObject.customer.name, "customer_code": tempObject.customer.code});
									incb(null);					
								});
							}
							else {
									let addressid = existingCustomer.address.id;							
									existingCustomer.address = tempObject.customer.address;
									existingCustomer.address.id = addressid;
									existingCustomer.agent = tempObject.customer.agent;
									existingCustomer.sales_person = tempObject.customer.sales_person;
									existingCustomer.gst_registration_type =  tempObject.customer.gst_registration_type;
									existingCustomer.gst_number = tempObject.customer.gst_number;
									existingCustomer.code = tempObject.customer.code;
									existingCustomer.name = tempObject.customer.name;

									CompanyService.updateCustomer(existingCustomer, entityid, session,connection, function(err, newCustomer){
										if(err)
											newCustomerList.push({"line_number": lineNumber, "customer_name": tempObject.customer.name, "customer_code": tempObject.customer.code, "status": "-1", "info": err});
										else
											newCustomerList.push({"line_number": lineNumber, "status": "0", "customer_name": tempObject.customer.name, "customer_code": tempObject.customer.code});
										incb(null);
									});
								
							}
						});
					}
				}
			}, function (err) {
				mysql.closeConnection(connection);
				return callback(err, newCustomerList);			
			});
		});
	});	
}

var setDefaultValues = function(customer){
	customer.transporter	 = {};
	customer.transporter.id = "";

	customer.payment_term = {};
	customer.payment_term.id = "";
	customer.sync_status_id = "";
	customer.allowed_balance	= "";
	customer.current_balance	= "";
	customer.current_overdue = "";
	customer.taxform_flag = "";

	customer.pan_number = "";
	customer.vat_number = "";
	customer.excise_number = "";
	customer.notes = "";	
	return customer;
}

var uploadAgent = function(entityid, list, session, callback){

	let newAgentList = [];
	let errorList = [];

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

					lineNumber ++;
					let tempObject = {};
					tempObject.agent = {};
					tempObject.agent.code = ((obj['Code']==undefined || obj['Code']=='') ? '' : obj['Code']);
					tempObject.agent.name = ((obj['Name']==undefined || obj['Name']=='') ? '' : obj['Name']);
					tempObject.agent.accounting_name = ((obj['Accounting Name']==undefined || obj['Accounting Name']=='') ? '' : obj['Accounting Name']);
					tempObject.commission_rate =  ((obj['Commission']==undefined || obj['Commission']=='') ? '' : obj['Commission']);
					tempObject.agent.address = {};
					tempObject.agent.address.first_name = ((obj['Name']==undefined || obj['Name']=='') ? '' : obj['Name']);
					tempObject.agent.address.last_name = '';
					tempObject.agent.address.address1 = ((obj['Address1']==undefined || obj['Address1']=='') ? '' : obj['Address1']);
					tempObject.agent.address.address2 = ((obj['Address2']==undefined || obj['Address2']=='') ? '' : obj['Address2']);
					tempObject.agent.address.address3 = ((obj['Address3']==undefined || obj['Address3']=='') ? '' : obj['Address3']);
					tempObject.agent.address.city = ((obj['City']==undefined || obj['City']=='') ? '' : obj['City']);
					tempObject.agent.address.state = ((obj['State']==undefined || obj['State']=='') ? '' : obj['State']);
					tempObject.agent.address.zip = ((obj['PinCode']==undefined || obj['PinCode']=='') ? '' : obj['PinCode']);
					tempObject.agent.address.email1 = ((obj['Email']==undefined || obj['Email']=='') ? '' : obj['Email']);
					tempObject.agent.address.phone1 = ((obj['Phone']==undefined || obj['Phone']=='') ? '' : obj['Phone']);

					tempObject.agent.sales_person = null;

					if((obj['Sales Person'] != undefined && obj['Sales Person'] != ""))			
					{
						var salesPerson = obj['Sales Person'].toUpperCase();
						let sp = vxUserlist.filter(x=>x.name == salesPerson)[0];
						if(sp != undefined)
						{
							tempObject.agent.sales_person = sp;
						}
						else
						{
							tempObject.agent.sales_person = vxUserlist.filter(x=>x.first_name == 'Default' && x.last_name == 'Salesperson')[0];
						}						
					}
					else
						tempObject.agent.sales_person = vxUserlist.filter(x=>x.first_name == 'Default' && x.last_name == 'Salesperson')[0];

					if(tempObject.agent.sales_person == null)
					{
						newAgentList.push({"line_number": lineNumber,"agent_name": tempObject.agent.name, "agent_code": tempObject.agent.code, "status": "-1", "info": "{\"message\":\"Sales Person not found\"}"});
						incb(null);
					}
					else
					{
						if(tempObject.agent.code == '')
						{

							CompanyService.createAgent(tempObject.agent, {}, entityid, session, connection, function (err, agent) {
								if(err)
									newAgentList.push({"line_number": lineNumber,"agent_name": tempObject.agent.name, "agent_code": tempObject.agent.code, "status": "-1", "info": err});
								else
									newAgentList.push({"line_number": lineNumber, "status": "0", "agent_name": tempObject.agent.name, "agent_code": tempObject.agent.code});
								incb(null);					
							});
						}
						else
						{
							let existingAgent = vxAgentList.filter(x=>x.code == tempObject.agent.code.toUpperCase())[0];
							if(existingAgent == undefined)
							{
								CompanyService.createAgent(tempObject.agent, {}, entityid, session, connection, function (err, agent) {
									if(err)
										newAgentList.push({"line_number": lineNumber,"agent_name": tempObject.agent.name, "agent_code": tempObject.agent.code, "status": "-1", "info": err});
									else
										newAgentList.push({"line_number": lineNumber, "status": "0", "agent_name": tempObject.agent.name, "agent_code": tempObject.agent.code});
									incb(null);					
								});
							}
							else {	
									let addressid = existingAgent.address.id;						
									existingAgent.address = tempObject.agent.address;
									existingAgent.address.id = addressid;
									existingAgent.sales_person = tempObject.agent.sales_person;
									existingAgent.code = tempObject.agent.code;
									existingAgent.name = tempObject.agent.name;
									existingAgent.accounting_name = tempObject.agent.accounting_name;
									existingAgent.commission_rate = tempObject.agent.commission_rate;

									CompanyService.updateAgent(existingAgent, entityid, session,connection, function(err, newAgent){
										if(err)
											newAgentList.push({"line_number": lineNumber, "agent_name": tempObject.agent.name, "agent_code": tempObject.agent.code, "status": "-1", "info": err});
										else
											newAgentList.push({"line_number": lineNumber, "status": "0", "agent_name": tempObject.agent.name, "agent_code": tempObject.agent.code});
										incb(null);
									});
								
							}
						}
					}
				}, function (err) {
					
					return callback(err, newAgentList);			
				});
			});
		});
	});	
}

var updateCustomerOverdue = function (companyid, customerid, overdue, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] != "1")
	{
		var err     = new Err();
		err.code    = "-15002";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.updateCustomerOverdue(companyid, customerid, overdue, session, connection, function (err, responseList) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (responseList === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating customer.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(responseList, "Status"));
					});
				}
			});

		});
		
	});
	
};

var updateCustomerBalance = function (balanceList, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] != "1")
	{
		var err     = new Err();
		err.code    = "-15002";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.updateCustomerBalance(balanceList, companyid, session, connection, function (err, responseList) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (responseList === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating customer.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(responseList, "Status"));
					});
				}
			});

		});
		
	});
	
};

var updateAgent = function (xAgent, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_AGENT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	xAgent                 = Util.initObjectIfNotExist(xAgent, "Agent");
	xAgent.address         = Util.initObjectIfNotExist(xAgent.address, "Address");
	xAgent.sales_person    = Util.initObjectIfNotExist(xAgent.sales_person, "SalesPerson");

	if (Util.isEmptyString(companyid) || Util.isEmptyString(xAgent.name) || Util.isEmptyString(xAgent.code)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Agent name and code are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			CompanyService.updateAgent(xAgent, companyid, session, connection, function (err, agent) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (agent === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating agent.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(agent, "Agent"));
					});
				}
			});

		});
		
	});
	
};

var findAllAgents = function (companyid, options, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_AGENT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_AGENT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/	console.log("You are in findAllAgents method in company controller",moment().format("MM-DD-YYYY hh:mm:ss SSS"))
	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}
	console.log("mssql open connection",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
	mysql.openConnection (function (err, connection) {

		if (err) return callback (err);

		/*TODO: implement whole method */
		console.log("ComapanyService is called",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
		CompanyService.findAllAgents(companyid, options, session, connection, function (err, vxAgentList) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}

			else if (!vxAgentList)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Agents not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				console.log("mysql connection is closed and vxAgentlist is sent",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
				return callback(err, Util.setOKResponse(vxAgentList, "Agent"));
			}  
		});
	});

};

var findAgentById = function (id, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_AGENT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_AGENT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID and Company ID are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		/*TODO: implement whole method */
		CompanyService.findAgentById(id, companyid, session, connection, function (err, vxAgent) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}

			else if (!vxAgent)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Agent not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(vxAgent, "Agent"));
			}  
		});
	});

};

var getCommissionByAgentId = function (id, companyid, callback) {

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID and Company ID are required fields.";
		return callback(err);

	}

	CompanyService.getCommissionByAgentId(id, companyid, function (err, commission) {

		if (err)
			return callback(err);

		if (!commission)
		{
			var response = Util.setErrorResponse(-100, "Commission not found."); //new Status();
			return callback(err, response);
		} 
		else {
			return callback(err, Util.setOKResponse(company, "Company"));
		}  
	});
 
};



module.exports = {

	findById              : findById,
	create                : create,

	findAllCustomers      : findAllCustomers,
	findCustomerById      : findCustomerById,
	createCustomer        : createCustomer,
	updateCustomer        : updateCustomer,
	updateCustomerBalance : updateCustomerBalance,
	updateCustomerOverdue : updateCustomerOverdue,
	updateCustomerData    : updateCustomerData,
	findAllAgents         : findAllAgents,
	findAgentById         : findAgentById,
	createAgent           : createAgent,
	updateAgent           : updateAgent,
	deleteAgent           : deleteAgent,
	getCommissionByAgentId:getCommissionByAgentId,
	uploadCustomer		  :uploadCustomer,
	uploadAgent			  :uploadAgent,
	getAPICredentials	  :getAPICredentials,
	deleteCustomer        : deleteCustomer,


};
