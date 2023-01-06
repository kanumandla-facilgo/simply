var Map       = require("../utils/map");
var Err       = require("../bo/err");
var Util      = require("../utils");
var async     = require("async");
var ConfigurationService  = require("./configuration");

var findById = function (id, connection, callback) {

	connection.query("SELECT c.*, c.id as companyid, " +
					"a.id, a.first_name, a.last_name, a.address1, a.address2, a.address3, a.city, a.state, a.pin, a.phone1, a.phone2, a.email1, a.email2, " +
					"s.id as ship_addressid, s.first_name as ship_first_name, s.last_name as ship_last_name, s.address1 as ship_address1, s.address2 as ship_address2, s.address3 as ship_address3, s.city as ship_city, s.state as ship_state, s.pin as ship_pin, s.phone1 as ship_phone1, s.phone2 as ship_phone2, s.email1 as ship_email1, s.email2 as ship_email2, " +
					"b.id as bill_addressid, b.first_name as bill_first_name, b.last_name as bill_last_name, b.address1 as bill_address1, b.address2 as bill_address2, b.address3 as bill_address3, b.city as bill_city, b.state as bill_state, b.pin as bill_pin, b.phone1 as bill_phone1, b.phone2 as bill_phone2, b.email1 as bill_email1, b.email2 as bill_email2 " +
					" FROM companies c, addresses a, addresses s, addresses b WHERE c.id = ? AND c.addresses_id = a.id AND c.bill_addresses_id = b.id AND c.ship_addresses_id = s.id", [
							id
						], function (err, rows) {

							if (err) return callback (err);
							
							if (rows && rows.length > 0)
								return callback(null, Map.mapToBCompany(rows[0]));
							else
								return callback(null, null);

						}
	);
	
};

var getAPICredentials = function(userID, connection, callback) {

	var cmd = "CALL spResetUserApiCredentials(@errorcode, @errormsg, @api_key, @api_secret, ?)";

	connection.query(cmd, [userID], function(err, rows) {

		if (err) return callback (err);

		connection.query("SELECT @err AS err, @msg AS msg, @api_key AS api_key, @api_secret AS api_secret", function (err, rows) {

			if (rows && rows[0]) {
				var data = {};
				data.api_key = rows[0].api_key;
				data.api_secret = rows[0].api_secret;
				return callback(null, data);
			}
			else {
				var err = new Err();
				err.code    = rows[0].err;
				err.message = rows[0].msg;
				return callback(err, null);
			}
		});
	});
}

var findByCode = function (code, connection, callback) {

	connection.query("SELECT c.*, a.* FROM companies c, addresses a WHERE c.code = ? AND c.addresses_id = a.id", [
							code
						], function (err, rows) {

							if (err) return callback (err);
							
							if (rows && rows.length > 0)
								return callback(null, Map.mapToBCompany(rows[0]));
							else
								return callback(null, null);

						}
	);
	
};

var create = function (xCompany, xAdminUser, connection, callback) {

	var cmd = "CALL spCreateCompany(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?)";

	connection.query(cmd, [
							xCompany.name, xCompany.code, 
							Util.getValue(xCompany.description, ""), xAdminUser.first_name, xAdminUser.last_name, Util.getValue(xCompany.address.address1, ""), Util.getValue(xCompany.address.address2, ""), '', 
							Util.getValue(xCompany.address.city, ""), Util.getValue(xCompany.address.state, ""), Util.getValue(xCompany.address.zip, ""), Util.getValue(xCompany.address.phone1, ""),
							Util.getValue(xCompany.address.email1, ""), Util.getValue(xCompany.address.phone2, ""), Util.getValue(xCompany.address.email2, ""), xAdminUser.first_name, xAdminUser.last_name, xAdminUser.login_name, 
							xAdminUser.password, Util.getValue(xAdminUser.phone, ""), Util.getValue(xAdminUser.email, ""), xCompany.template.id, (xCompany.notes ? Util.getValue(xCompany.notes, "") : "")
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
									xCompany.id = rows[0].id;
									return callback(null, xCompany);
								}
								else {
									var err = new Err();
									err.code    = rows[0].err;
									err.message = rows[0].msg;
									return callback(err, null);
								}
							});
						}
	);

};

var createCustomer = async function (xCustomer, companyid, session, connection, callback) {

	let cmd = "CALL spCreateCustomer(@err, @msg, @id, @code, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?)";
	let errors = [];

	let n = await getCustomerNotifications(companyid, xCustomer, session, connection);
	connection.query(cmd, [
							companyid, xCustomer.name, xCustomer.invoicing_name, xCustomer.code, xCustomer.custom_type_id,
							Util.getValue(xCustomer.tin, ""), Util.getValue(xCustomer.address.first_name, ""), Util.getValue(xCustomer.address.last_name, ""), Util.getValue(xCustomer.address.address1, ""), Util.getValue(xCustomer.address.address2, ""), Util.getValue(xCustomer.address.address3, ""), 
							Util.getValue(xCustomer.address.city, ""), Util.getValue(xCustomer.address.state, ""), Util.getValue(xCustomer.address.zip, ""), Util.getValue(xCustomer.address.phone1, ""),
							Util.getValue(xCustomer.address.email1, ""), Util.getValue(xCustomer.address.phone2, ""), Util.getValue(xCustomer.address.email2, ""), Util.getValue(xCustomer.bill_address.first_name, ""), Util.getValue(xCustomer.bill_address.last_name, ""), Util.getValue(xCustomer.bill_address.address1, ""), Util.getValue(xCustomer.bill_address.address2, ""), Util.getValue(xCustomer.bill_address.address3, ""), 
							Util.getValue(xCustomer.bill_address.city, ""), Util.getValue(xCustomer.bill_address.state, ""), Util.getValue(xCustomer.bill_address.zip, ""), Util.getValue(xCustomer.bill_address.phone1, ""),
							Util.getValue(xCustomer.bill_address.email1, ""), Util.getValue(xCustomer.bill_address.phone2, ""), Util.getValue(xCustomer.bill_address.email2, ""), Util.getValue(xCustomer.ship_address.name, ""), Util.getValue(xCustomer.ship_address.first_name, ""), Util.getValue(xCustomer.ship_address.last_name, ""), Util.getValue(xCustomer.ship_address.address1, ""), Util.getValue(xCustomer.ship_address.address2, ""), Util.getValue(xCustomer.ship_address.address3, ""), 
							Util.getValue(xCustomer.ship_address.city, ""), Util.getValue(xCustomer.ship_address.state, ""), Util.getValue(xCustomer.ship_address.zip, ""), Util.getValue(xCustomer.ship_address.phone1, ""), Util.getValue(xCustomer.ship_address.email1, ""), Util.getValue(xCustomer.ship_address.phone2, ""),
							Util.getValue(xCustomer.ship_address.email2, ""), (xCustomer.transporter.id === "" ? null : xCustomer.transporter.id), (xCustomer.payment_term.id === "" ? null : xCustomer.payment_term.id), (xCustomer.sales_person.id === "" ? null : xCustomer.sales_person.id), (xCustomer.agent.id === "" ? null : xCustomer.agent.id), (xCustomer.sync_status_id === "" ? null : xCustomer.sync_status_id), Util.getValue(xCustomer.allowed_balance || 0, 0), 
							Util.getValue(xCustomer.current_balance || 0, 0), Util.getValue(xCustomer.current_overdue || 0, 0), xCustomer.taxform_flag || 0, Util.getValue(xCustomer.gst_number, ""), Util.getValue(xCustomer.gst_registration_type, null), Util.getValue(xCustomer.pan_number, ""), Util.getValue(xCustomer.cst_number, ""), Util.getValue(xCustomer.vat_number, ""), Util.getValue(xCustomer.excise_number, ""),
							Util.getValue(xCustomer.notes, ""), Util.getValue(xCustomer.address.first_name, ""), Util.getValue(xCustomer.address.last_name, ""), 
							(xCustomer.user && xCustomer.user.login_name ? Util.getValue(xCustomer.user.login_name, null) : null), (xCustomer.user && xCustomer.user.password ? Util.getValue(xCustomer.user.password, null) : null)
						], function (err, rows) {

							if (err) return callback (err);
							let return_list = [];
							let out_item = {};
							let errors = [];

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id, @code AS code", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
									xCustomer.id = rows[0].id;
									xCustomer.code = rows[0].code;
									async.eachSeries(xCustomer.notifications, function iterator(item, callback) {
										sql = "INSERT into customer_notifications(companies_id, sysnotificationtypes_id, customers_id, phone_number, emails, active, created, last_updated) values (?,?,?,?,?,?,NOW(),NOW())";
										connection.query(sql, [companyid, item.notification_type_id, xCustomer.id, item.phone_number, item.emails, item.active], function (err, row) {
											if (err) {
//												out_item = {"statuscode": -100, "code": item.code, "message":err.message };
												errors.push(err);
												callback (err, null);
											}
											else {
												if (row && row.affectedRows >= 1) {
//													out_item = {"statuscode": 0, "code": item.code, "message":"Success" };
													callback(null, true);
												}
												else {
//													out_item = {"statuscode": -101, "code": item.code, "message":"Unable to update current balance" };
													callback(err, false); 
												}
											}
										});
									}, function (err) {
										if (errors.length > 0) {
											var err = errors[0];
											return callback(err, null);
										}

										var cmd = "CALL spGetCustomer(@err, @msg, @totalrecords, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?,?)";

										connection.query(cmd, [companyid, xCustomer.id, null, session.user.id, null, null, null, null, null, null, null, null, null, null, null, null, null, "_status", 1], function (err, rows) {

											if (err) return callback (err);
										
											if (rows && rows[0] && rows[0].length > 0) {
												var customer = Map.mapToBCustomer(rows[0][0], session);
												return callback(null, customer);
											}
										});
									});									
								}
								else {
									var err = new Err();
									err.code    = rows[0].err;
									err.message = rows[0].msg;
									return callback(err, null);
								}
							});
						}
	);
};

var deleteCustomer = function (id, companyid, session, connection, callback) {

	const cmd = "CALL spDeleteCustomer(@err, @msg, ?, ?, ?)";

	connection.query(cmd, [companyid, id, session.user.id], function (err, row) {

		if (err) return callback (err);

		connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
			if (rows[0].err == 0) {
				return callback(null, true);
			}
			else {
				var err = new Err();
				if (rows && rows[0]) {
					err.code    = rows[0].err;
					err.message = rows[0].msg;
				}
				else {
					err.code    = "-101";
					err.message = "Unknown Error";
				}
				return callback(err, false);
			}
		});

	});

};

var getCustomerNotifications = async function(companyid, xCustomer, session, connection) {
	if(xCustomer.notifications == undefined)
	{
		ConfigurationService.findBySysConfigName(Util.CONST_CONFIG_MODULE_NOTIFICATION_SMS, companyid, 1, session, connection, function(err, configuration) {
			xCustomer.notifications = [];
			let not_sms_mod = configuration.value;
			
			let order_not = Map.initCustomerNotification();
			order_not.companyid = companyid;
			order_not.notification_type_id = Util.NotificationTypeEnum.Order;
			order_not.active = not_sms_mod;

			let payment_reminder_not = Map.initCustomerNotification();
			payment_reminder_not.companyid = companyid;
			payment_reminder_not.notification_type_id = Util.NotificationTypeEnum.PaymentReminder;
			payment_reminder_not.active = not_sms_mod;

			xCustomer.notifications.push(order_not);
			xCustomer.notifications.push(payment_reminder_not);
		});
	}

}
	
var createTallyCustomerIntegration = function (data, session, connection, callback) {

};

var updateCustomerData = function (companyid, customerid, options, session, connection, callback) {

	str = "";
	data = []

	keyList = Object.keys(options);
	for (i =0; i < keyList.length; i++) {
		if (keyList[i].toLowerCase() == "sync_status_id") {
			str = str + ", syssyncstatuses_id = ?";
			data.push(options[keyList[i]]);
		}
	}

	str = str.replace(", ", "");

	if (data.length > 0) {

		data.push(companyid);
		data.push(customerid);

		sql = "UPDATE companies SET " + str + ", last_updated = NOW() WHERE parent_id = ? AND syscompanytypes_id = 4702 AND id = ?";
		connection.query(sql, data, function (err, row) {
			if (err) {
				return callback (err, null);
			}
			else {
				if (row && row.affectedRows == 1) {
					out_item = {"statuscode": 0, "id": customerid, "message":"Success" };
					return callback(null, out_item);
				}
				else {
					out_item = {"statuscode": -101, "id": customerid, "message":"Unable to update sync status" };
					return callback(null, out_item); 
				}
			}
		});	

	}
	else {
		var err = new Err();
		err.code    = -106;
		err.message = "No record to update.";
		return callback(err, null);
	}


};

var updateCustomerBalance = function (list, companyid, session, connection, callback) {

	var sql;
	var out_item;
	var return_list = [];
	var errors = [];

	async.eachSeries(list, function iterator(item, callback) {
		if (item.code) {
			sql = "UPDATE companies SET current_balance = ?, current_balance_sync_date = NOW(), last_updated = NOW() WHERE parent_id = ? AND syscompanytypes_id = 4702 AND code = ?";
			connection.query(sql, [item.balance, companyid, item.code], function (err, row) {
				if (err) {
					out_item = {"statuscode": -100, "code": item.code, "message":err.message };
					return_list.push(out_item);
					errors.push(err);
					callback (err, null);
				}
				else {
					if (row && row.affectedRows >= 1) {
						out_item = {"statuscode": 0, "code": item.code, "message":"Success" };
						return_list.push(out_item);
						callback(null, true);
					}
					else {
						out_item = {"statuscode": -101, "code": item.code, "message":"Unable to update current balance" };
						return_list.push(out_item);
						callback(err, false); 
					}
				}
			});
		}
		else
			callback(null, true);

	}, function (err) {
		if (errors.length > 0) {
			var err = errors[0];
			return callback(err, null);
		}
		return callback(err, return_list);
	});

};

var updateCustomerOverdue = function (companyid, customerid, overdue, session, connection, callback) {

	var sql;
	var out_item;
	var return_list = [];
	var errors = [];

	sql = "UPDATE companies SET current_overdue = current_overdue + ?, current_overdue_sync_date = NOW(), last_updated = NOW() WHERE parent_id = ? AND syscompanytypes_id = 4702 AND id = ?";
	connection.query(sql, [overdue, companyid, customerid], function (err, row) {
		if (err) return callback (err);

		if (row && row.affectedRows >= 1) {
			//xCustomer.id = rows[0].id;
			return callback(null, row);
		}
		else {
			return callback(err, null);
		}
	});		

};

var updateCustomer = function (xCustomer, companyid, session, connection, callback) {

	var out_item;
	var return_list = [];
	var errors = [];

	var cmd = "CALL spUpdateCustomer(@err, @msg, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?, ?,?,?,?)";

  	connection.query(cmd, [
							xCustomer.id, companyid, xCustomer.name, xCustomer.invoicing_name, xCustomer.code, xCustomer.custom_type_id,
							Util.getValue(xCustomer.tin, ""), xCustomer.address.id, Util.getValue(xCustomer.address.first_name, ""), Util.getValue(xCustomer.address.last_name, ""), Util.getValue(xCustomer.address.address1, ""), Util.getValue(xCustomer.address.address2, ""), Util.getValue(xCustomer.address.address3, ""), 
							Util.getValue(xCustomer.address.city, ""), Util.getValue(xCustomer.address.state, ""), Util.getValue(xCustomer.address.zip, ""), Util.getValue(xCustomer.address.phone1, ""),
							Util.getValue(xCustomer.address.email1, ""), Util.getValue(xCustomer.address.phone2, ""), Util.getValue(xCustomer.address.email2, ""), xCustomer.bill_address.id, Util.getValue(xCustomer.bill_address.first_name, ""), Util.getValue(xCustomer.bill_address.last_name, ""), Util.getValue(xCustomer.bill_address.address1, ""), Util.getValue(xCustomer.bill_address.address2, ""), Util.getValue(xCustomer.bill_address.address3, ""), 
							Util.getValue(xCustomer.bill_address.city, ""), Util.getValue(xCustomer.bill_address.state, ""), Util.getValue(xCustomer.bill_address.zip, ""), Util.getValue(xCustomer.bill_address.phone1, ""),
							Util.getValue(xCustomer.bill_address.email1, ""), Util.getValue(xCustomer.bill_address.phone2, ""), Util.getValue(xCustomer.bill_address.email2, ""), xCustomer.ship_address.id, Util.getValue(xCustomer.ship_address.name, ""), Util.getValue(xCustomer.ship_address.first_name, ""), Util.getValue(xCustomer.ship_address.last_name, ""), Util.getValue(xCustomer.ship_address.address1, ""), Util.getValue(xCustomer.ship_address.address2, ""), Util.getValue(xCustomer.ship_address.address3, ""), 
							Util.getValue(xCustomer.ship_address.city, ""), Util.getValue(xCustomer.ship_address.state, ""), Util.getValue(xCustomer.ship_address.zip, ""), Util.getValue(xCustomer.ship_address.phone1, ""), Util.getValue(xCustomer.ship_address.email1, ""), Util.getValue(xCustomer.ship_address.phone2, ""),
							Util.getValue(xCustomer.ship_address.email2, ""), xCustomer.status_id, (xCustomer.transporter.id === "" ? null : xCustomer.transporter.id), (xCustomer.payment_term.id === "" ? null : xCustomer.payment_term.id), xCustomer.sales_person.id, xCustomer.agent.id, xCustomer.sync_status_id, Util.getValue(xCustomer.allowed_balance, 0), Util.getValue(xCustomer.current_balance, 0), Util.getValue(xCustomer.current_overdue, 0),
							Util.getValue(xCustomer.taxform_flag, 0), Util.getValue(xCustomer.gst_number, ""), Util.getValue(xCustomer.gst_registration_type, null), Util.getValue(xCustomer.pan_number, ""), Util.getValue(xCustomer.cst_number, ""), Util.getValue(xCustomer.vat_number, ""), Util.getValue(xCustomer.excise_number, ""),
							Util.getValue(xCustomer.notes, ""),
							(xCustomer.user && xCustomer.user.id ? Util.getValue(xCustomer.user.id, null) : null), (xCustomer.user && xCustomer.user.login_name ? Util.getValue(xCustomer.user.login_name, null) : null), (xCustomer.user && xCustomer.user.login_name ? Util.getValue(xCustomer.user.password, "") : null)
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
									//xCustomer.id = rows[0].id;
									async.eachSeries(xCustomer.notifications, function iterator(item, callback) {
										sql = "UPDATE customer_notifications set active=?, phone_number=?, emails=?, last_updated=NOW() where customers_id=? and sysnotificationtypes_id=?";
										
										connection.query(sql, [item.active, item.phone_number, item.emails, xCustomer.id, item.notification_type_id], function (err, row) {
											if (err) {
												out_item = {"statuscode": -100, "code": item.code, "message":err.message };
												return_list.push(out_item);
												errors.push(err);
												callback (err, null);
											}
											else {
												if (row && row.affectedRows >= 1) {
													out_item = {"statuscode": 0, "code": item.code, "message":"Success" };
													return_list.push(out_item);
													callback(null, true);
												}
												else {
													out_item = {"statuscode": -101, "code": item.code, "message":"Unable to update customer notification" };
													return_list.push(out_item);
													callback(err, false); 
												}
											}
										});
									}, function (err) {
										if (errors.length > 0) {
											var err = errors[0];
											return callback(err, null);
										}
										return callback(null, xCustomer);
									});					
								}
								else {
									var err = new Err();
									err.code    = rows[0].err;
									err.message = rows[0].msg;
									return callback(err, null);
								}
							});
						}
	);
};

var findCustomerNotifications = function(id, session, connection, callback) {

	var cmd = "select * from customer_notifications where customers_id = ?";
	var notifications = [];

	connection.query(cmd, [id], function (err, rows) {

		if (err) return callback (err);

		if (rows) {
			for (i = 0; i < rows.length; i++) {
				notifications.push(Map.mapToBCustomerNotification(rows[i]));
			}
			return callback(null, notifications);
		}
		else
			return callback(null, notifications);

		
	});

}

var findCustomerById = function (id, companyid, session, connection, callback) {

	var cmd = "CALL spGetCustomer(@err, @msg, @totalrecords, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?,?)";

	connection.query(cmd, [companyid, id, null, session.user.id, null, null, null, null, null, null, null, null, null, null, null, null, null, "_status", 1], function (err, rows) {

							if (err) return callback (err);
						
							if (rows && rows[0] && rows[0].length > 0) {

								var customer = Map.mapToBCustomer(rows[0][0], session);

								findCustomerNotifications(customer.id, session, connection, function(err, notifications) {

									customer.notifications = notifications;

									findById(customer.company_id, connection, function (err, company) {

										ConfigurationService.findBySysConfigName(Util.CONST_CONFIG_TAX_GST_NUMBER, customer.company_id, 1, session, connection, function(err, configuration) {
											customer.company = company;
											customer.company.configuration = [configuration];
											
											if (!isAgentCommissionRateAccessible(session))
												return callback(null, customer);

											// find the bonus rate
											getBonusCommissionByAgentId(customer.agent.id, companyid, session, connection, function(err, rate) {
												customer.agent.more["commission_rate_bonus"] = rate;							
												return callback(null, customer);
											});
										});
									});

								});

							}
							else
								return callback(null, null);

						}
	);
	
};

var findCustomerByCode = function (code, companyid, session, connection, callback) {

	var cmd = "CALL spGetCustomer(@err, @msg, @totalrecords, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?,?)";

	connection.query(cmd, [companyid, null, code, session.user.id, null, null, null, null, null, null, null, null, null, null, null, null, null, "_status", 1], function (err, rows) {

							if (err) return callback (err);
						
							if (rows && rows[0] && rows[0].length > 0) {

								var customer = Map.mapToBCustomer(rows[0][0], session);

								if (!isAgentCommissionRateAccessible(session))
									return callback(null, customer);

								// find the bonus rate
								getBonusCommissionByAgentId(customer.agent.id, companyid, session, connection, function(err, rate) {
									customer.agent.more["commission_rate_bonus"] = rate;							
									return callback(null, customer);
								});

							}
							else
								return callback(null, null);

						}
	);
	
};

var findAllCustomers = function (companyid, options, session, connection, callback) {

	if (!options.enabled_only) options.enabled_only = 0;
	if (!options.page_number) options.page_number = 1;
	if (!options.page_size) options.page_size = null;
	if (!options.sortby) options.sortby = "code";
	if (!options.sortorder) options.sortorder = 1;

	var cmd = "CALL spGetCustomer(@err, @msg, @totalrecords, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?,?)";

	connection.query(cmd, 
					[	companyid, 
						null, 
						options.code, 
						session.user.id, 
						options.enabled_only, 
						options.agent_id, 
						options.sales_person_id, 
						options.search_text, 
						options.sync_status_id, 
						options.created_since_x_mins, 
						options.modified_since_x_mins, 
						options.customer_name, 
						options.city_name, 
						options.state_name, 
						options.status_id, 
						options.page_number, 
						options.page_size,
						options.sortby,
						options.sortorder
					], function (err, rows) {

			if (err) return callback (err);

			connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
				if (feedbackerr) return callback(feedbackerr);

				if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null))
				{
					customerList = [];
					if (rows && rows[0]) {
						async.eachSeries(rows[0], function iterator(item, callback) {
							let customer = Map.mapToBCustomer(item, session) 
							findCustomerNotifications(customer.id, session, connection, function(err, notifications) {
								customer.notifications = notifications;
								customer.totalrecords = feedbackrows[0].totalrecords;
								customerList.push(customer);
								callback();
							});
						}, function (err) {
							return callback(null, customerList);
						});	
					}					
				}
				else {
					var err = new Err();
					if (feedbackrows && feedbackrows[0] && feedbackrows[0].err != 0) {
						err.code    = feedbackrows[0].err;
						err.message = feedbackrows[0].msg;
					}
					else if (feedbackrows && feedbackrows[0]) {
						err.code    = "-105";
						err.message = "Customer not found.";
					}
					else {
						err.code    = "-101";
						err.message = "Unknown Error";
					}
					return callback(err);
				}
			});
	});

};

var findCustomersWithPendingDelivery = function (companyid, session, connection, callback) {

	var cmd = "CALL spGetCustomersWithPendingDelivery(@err, @msg, ?,?)";

	connection.query(cmd, [
								companyid,
								session.user.id
							  ], function (err, rows) {

									if (err) return callback (err);

									connection.query("SELECT @err AS err, @msg AS msg", function (err, feedbackrows) {
										if (feedbackrows && feedbackrows[0] && feedbackrows[0].err == 0) {
											var customerList = [];
											for(var i = 0; i <rows[0].length; i++)
											{
												customerList.push(Map.mapToBCustomer(rows[0][i], session));
											}
											return callback(null, customerList);
										}
										else {
											var err = new Err();
											if (rows && rows[0]) {
												err.code    = rows[0].err;
												err.message = rows[0].msg;
											}
											else {
												err.code    = "-101";
												err.message = "Unknown Error";
											}
											return callback(err, null);
										}
									});

								}
		);

};

var createAgent = function (xAgent, companyid, session, connection, callback) {

	if (!xAgent.user) xAgent.user = {};

	var cmd = "CALL spCreateAgent(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?)";
	connection.query(cmd, [
							companyid, xAgent.name, xAgent.code, xAgent.accounting_name,
							Util.getValue(xAgent.address.first_name, ""), Util.getValue(xAgent.address.last_name, ""), Util.getValue(xAgent.address.address1, ""), Util.getValue(xAgent.address.address2, ""), Util.getValue(xAgent.address.address3, ""), 
							Util.getValue(xAgent.address.city, ""), Util.getValue(xAgent.address.state, ""), Util.getValue(xAgent.address.zip, ""), Util.getValue(xAgent.address.phone1, ""),
							Util.getValue(xAgent.address.email1, ""), Util.getValue(xAgent.address.phone2, ""), Util.getValue(xAgent.address.email2, ""), xAgent.sales_person.id, Util.getValue(xAgent.commission_rate || 0, 0), 0,
							Util.getValue(xAgent.user.first_name || "", ""), Util.getValue(xAgent.user.last_name || "", ""), Util.getValue(xAgent.user.login_name || "", ""), Util.getValue(xAgent.user.password || "", "")
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
									xAgent.id = rows[0].id;
									return callback(null, xAgent);
								}
								else {
									var err = new Err();
									err.code    = rows[0].err;
									err.message = rows[0].msg;
									return callback(err, null);
								}
							});
						}
	);
};

var updateAgent = function (xAgent, companyid, session, connection, callback) {

	if (!xAgent.user) xAgent.user = {};

	var cmd = "CALL spUpdateAgent(@err, @msg, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?, ?,?,?)";
	
	connection.query(cmd, [
							xAgent.id, companyid, xAgent.name, xAgent.code, xAgent.accounting_name,
							xAgent.address.id, Util.getValue(xAgent.address.first_name, ""), Util.getValue(xAgent.address.last_name, ""), Util.getValue(xAgent.address.address1, ""), Util.getValue(xAgent.address.address2, ""), Util.getValue(xAgent.address.address3, ""), 
							Util.getValue(xAgent.address.city, ""), Util.getValue(xAgent.address.state, ""), Util.getValue(xAgent.address.zip, ""), Util.getValue(xAgent.address.phone1, ""),
							Util.getValue(xAgent.address.email1, ""), Util.getValue(xAgent.address.phone2, ""), Util.getValue(xAgent.address.email2, ""), xAgent.status_id, xAgent.sales_person.id, Util.getValue(xAgent.commission_rate || 0, 0), Util.getValue(xAgent.current_balance, 0),
							xAgent.user.id, Util.getValue(xAgent.user.login_name, null), Util.getValue(xAgent.user.password, null)
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
									return callback(null, xAgent);
								}
								else {
									var err = new Err();
									err.code    = rows[0].err;
									err.message = rows[0].msg;
									return callback(err, null);
								}
							});
						}
	);
};

var deleteAgent = function (id, companyid, session, connection, callback) {

	// CompanyService.findAgentById(id, companyid, session, connection, function (err, agent) {

	// 	if (err) return callback(err);
	// 	if (!agent) return callback(err, null);

	const cmd = "CALL spDeleteAgent(@err, @msg, ?, ?, ?)";

	connection.query(cmd, [companyid, id, session.user.id], function (err, row) {

		if (err) return callback (err);

		connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
			if (rows[0].err == 0) {
				return callback(null, true);
			}
			else {
				var err = new Err();
				if (rows && rows[0]) {
					err.code    = rows[0].err;
					err.message = rows[0].msg;
				}
				else {
					err.code    = "-101";
					err.message = "Unknown Error";
				}
				return callback(err, false);
			}
		});

	});

//	});

};

var findAgentById = function (id, companyid, session, connection, callback) {

	var cmd = "CALL spGetAgent(@err, @msg, ?,?,?,?,?,?,?,?)";

	connection.query(cmd, [companyid, id, null, null, session.user.id, null, "name", 1], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows.length > 0) {
								var agent = Map.mapToBAgent(rows[0][0], "", session);

								if (!isAgentCommissionRateAccessible(session))
									return callback(null, agent);

								// find the bonus rate
								getBonusCommissionByAgentId(agent.id, companyid, session, connection, function(err, rate) {
									agent.more["commission_rate_bonus"] = rate;							
									return callback(null, agent);
								});

							}
							else
								return callback(null, null);

						}
	);
	
};

var isAgentCommissionRateAccessible = function (session) {

	// if user is customer user, basic mapping is enough. Return the agent.
	var user = session.user;
	return (user.sys_role_id == 4002 || user.sys_role_id == 4003 || user.sys_role_id == 4004 || user.sys_role_id == 4005);

};

var findAllAgents = function (companyid, options, session, connection, callback) {

	var cmd = "CALL spGetAgent(@err, @msg, ?,?,?,?,?,?,?,?)";

	connection.query(cmd, [
							companyid, 
							null, 
							options.salespersonid, 
							options.statusid, 
							session.user.id,
							options.search_text,
							(options.sortby ? options.sortby : "code"),
							(options.sortorder ? options.sortorder : 1)
						], function (err, rows) {

							if (err) return callback (err);

							agentList = [];
							if (rows && rows[0]) {
								for (i = 0; i < rows[0].length; i++) {
									agentList.push(Map.mapToBAgent(rows[0][i], "", session));
								}
							}
							return callback(null, agentList);

						}
	);

};

var getBonusCommissionByAgentId = function (id, companyid, session, connection, callback) {

	cmd = "SELECT value FROM configurations WHERE sysconfigurations_id = 15002 AND companies_id = ?";

	connection.query (cmd, [companyid, id], function (err, rows) {

		if (err) return callback (err);

		if (rows && rows[0]) {
			dBonusRate = Util.round(rows[0].value, 2);
			return callback(err, dBonusRate);
		}
		return 0;
	});

};

var findById1 = function (id, callback) {

	Company.findOne({_id:id}, function (err, company) {
		if (err) {
			if (err.name === 'CastError')
				return callback(null, null);
			else
				return callback(err);
		}
		else if (company === null) {
			return callback(err, null);
		}
		else
			return callback(err, Map.mapToBCompany(company));
	});

};

var create1 = function (xCompany, xAdminUser, connection, callback) {

	var company = new Company();
	company.name = xCompany.name;
	company.code = xCompany.code;
	

	findByCode(company.code, function (err, xCompany) {
	
		if (err) return callback(err);
		
		if (xCompany) {
			return callback (new Err("-100", "Company already exists!"));
		}

		company.save(function (err, company) {
			if (err)
				return callback(err);
			else if (company === null) {
				return callback(err, null);
			}
			else
				return callback(err, Map.mapToBCompany(company));
		});

	});
};

var findByCode1 = function (code, connection, callback) {

/*
	Company.findOne({"code":code}, function (err, company) {
		if (err) {
			if (err.name === 'CastError')
				return callback(null, null);
			else
				return callback(err);
		}
		else if (company === null) {
			return callback(err, null);
		}
		else
			return callback(err, Map.mapToBCompany(company));
	});
*/
};


module.exports = {
	findById         : findById,
	findByCode       : findByCode,
	create           : create,
	createCustomer   : createCustomer,
	updateCustomer   : updateCustomer,
	updateCustomerData   : updateCustomerData,
	updateCustomerBalance :  updateCustomerBalance,
	updateCustomerOverdue : updateCustomerOverdue,
	findAllCustomers : findAllCustomers,
	findCustomerById : findCustomerById,
	createAgent      : createAgent,
	updateAgent      : updateAgent,
	findAllAgents    : findAllAgents,
	findAgentById    : findAgentById,
	findCustomersWithPendingDelivery : findCustomersWithPendingDelivery,
	findCustomerByCode : findCustomerByCode,
	getAPICredentials : getAPICredentials,
	deleteCustomer 		 : deleteCustomer,
	deleteAgent 		 : deleteAgent,	
};
