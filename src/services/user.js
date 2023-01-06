var Util           = require("../utils");
var Map            = require("../utils/map");
var Err            = require("../bo/err");
var CompanyService = require("./company");

var async          = require("async");
let moment         = require("moment-timezone");

var findById = function (id, companyid, session, connection, callback) {

	var cmd = "CALL spGetUser(@err,@msg, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

	connection.query(cmd, [
							companyid, id, null, null, null, null, session.user.id, null, null, null, -1
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0)
								return callback(null, Map.mapToBUser(rows[0][0]));
							else
								return callback(null, null);
						}
	);
	
};

var findPermissionsByRoleId = function (roleid, companyid, session, connection, callback) {

	var cmd = "SELECT p.id, rp.value, rp.roles_id, p.name, p.description, p.user_default_value, p.syspermissiongroups_id, rp.created, pg.name as group_name FROM role_permissions rp, syspermissions p, roles r, syspermissiongroups pg WHERE rp.roles_id = ? AND rp.roles_id = r.id AND r.companies_id = ? AND rp.syspermissions_id = p.id AND pg.id = p.syspermissiongroups_id";

	connection.query(cmd, [roleid, companyid], function (err, rows) {

		if (err) return callback(err);

		var vxPermissionlist = [];
	
		if (rows && rows[0]) {
			for (i=0; i < rows.length; i++) {
				vxPermissionlist.push(Map.mapToBPermission(rows[i]));
			}
		}

		return callback(null, vxPermissionlist);

	});
 
};

var findAllPermissions = function (companyid, session, connection, callback) {

	var cmd = "SELECT p.*, pg.name as group_name FROM syspermissions p, syspermissiongroups pg WHERE pg.id = p.syspermissiongroups_id";

	connection.query(cmd, [], function (err, rows) {

		if (err) return callback(err);

		var vxPermissionlist = [];

		if (rows && rows[0]) {
			for (i=0; i < rows.length; i++) {
				vxPermissionlist.push(Map.mapToBPermission(rows[i]));
			}
		}

		return callback(null, vxPermissionlist);

	});
 
};

var findAll = function (companyid, options, session, connection, callback) {

	var cmd = "CALL spGetUser(@err, @msg, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

	connection.query(cmd, [
							companyid, 
							null, 
							options.roleid, 
							options.sysroleid, 
							options.statusid, 
							null, 
							session.user.id, 
							null, 
							null,
							(options.sortby ? options.sortby : "name"),
							(options.sortorder ? options.sortorder : 1)
						], function (err, rows) {

							if (err) return callback (err);

							var vxUserlist = [];

							if (rows && rows[0]) {
								for (i=0; i < rows[0].length; i++) {
									vxUserlist.push(Map.mapToBUser(rows[0][i]));
								}
							}

							if (vxUserlist.length > 0)
								return callback(null, vxUserlist);
							else
								return callback(null, null);
						}
	);
/*
	connection.query("SELECT u.* FROM users u WHERE u.companies_id = ?", [
							companyid
						], function (err, rows) {

							if (err) return callback (err);

							var vxUserlist = [];

							for (i=0; i < rows.length; i++)
								vxUserlist.push(Map.mapToBUser(rows[i]));
								
							return callback(err, vxUserlist);

						}
	);
*/
};
/*
var findAllCustomers = function (companyid, session, connection, callback) {

    var err = -1;
    var msg = '';
	var id  = -1;

	var cmd = "CALL spGetCustomer(@err,@msg,?,?)";

	connection.query(cmd, [
							companyid, null
						], function (err, rows) {

							if (err) return callback (err);

							var vxCustomerList = [];

							if (rows && rows[0]) {
								for (i=0; i < rows[0].length; i++) {
									vxCustomerList.push(Map.Map.mapToBCustomer(rows[0][i], session));
								}
							}

							if (vxCustomerList.length > 0)
								return callback(null, vxCustomerList);
							else
								return callback(null, null);
						}
	);
 
};
*/
var findByLoginName = function (companyid, loginname, session, connection, callback) {

	var cmd = "CALL spGetUser(@err,@msg,?,?,?,?,?,?, ?, ?, ?, ?, ?)";

	connection.query(cmd, [
							null, null, null, null, null, loginname, session.user.id, null, null, null, 1
							], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0)
								return callback(null, Map.mapToBUser(rows[0][0]));
							else
								return callback(null, null);
						}
	);

};

var authenticate = function (loginname, password, companycode, sessionTypeId, connection, callback) {

    var err = -1;
    var msg = '';
	var id  = -1;

	var cmd = "CALL spLogin(@err,@msg,?,?,?,?,?,?, ?,?,?)";

	connection.query(cmd, [
							loginname, password, null, null, null, null, null, null, sessionTypeId
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, inner_rows) {

								if (inner_rows && inner_rows[0] && inner_rows[0].err == 0) {

									if (rows && rows[0] && rows[0].length > 0) {

										var vxSession = Map.mapToBSession(rows[0][0]);

										if (rows[1] && rows[1].length > 0) {

											var vxPermissionlist = {};
	
											for (i=0; i < rows[1].length; i++) {
												vxPermissionlist[rows[1][i].syspermissions_id] = rows[1][i].value;
											}
									
											vxSession.permissionlist = vxPermissionlist;
										}

										if (rows[2] && rows[2].length > 0) {

											var vxConfigurationlist = {};
	
											for (i=0; i < rows[2].length; i++) {
												vxConfigurationlist[rows[2][i].name] = rows[2][i].value;
											}
									
											vxSession.configurationlist = vxConfigurationlist;

										}
							
										return callback(null, vxSession);
									}
									else
										return callback(new Err("-101", "Unknown error!"), null);
								
								}
								else {

									var err = new Err();
									if (inner_rows && inner_rows[0]) {
										err.code    = inner_rows[0].err;
										err.message = inner_rows[0].msg;
									}
									else {
										err.code    = "-101";
										err.message = "Unknown Error";
									}
									return callback(err, false);

								}

							});
							
						}
	);
	
};

var authenticateByApiKeyAndSecret = function (apikey, apisecret, companycode, connection, callback) {

    var err = -1;
    var msg = '';
	var id  = -1;

	var cmd = "CALL spLogin(@err,@msg, ?,?,?,?,?,?, ?,?,?)";

	connection.query(cmd, [
							null, null, apikey, apisecret, null, null, null, null, 4102
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, inner_rows) {

								if (inner_rows && inner_rows[0] && inner_rows[0].err == 0) {

									if (rows && rows[0] && rows[0].length > 0) {
										return callback(null, Map.mapToBSession(rows[0][0]));
									}
									else
										return callback(new Err("-101", "Unknown error!"), null);
								
								}
								else {

									var err = new Err();
									if (inner_rows && inner_rows[0]) {
										err.code    = inner_rows[0].err;
										err.message = inner_rows[0].msg;
									}
									else {
										err.code    = "-101";
										err.message = "Unknown Error";
									}
									return callback(err, false);

								}

							});
							
						}
	);
	
};

var changePassword = function (loginname, oldpassword, newpassword, companyid, session, connection, callback) {

	var cmd = "CALL spUpdatePassword(@err,@msg,?,?,?,?);";

	connection.query(cmd, [
							companyid, loginname, oldpassword, newpassword
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
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
						}
	);

};

var getDashboard = function (companyid, session, connection, callback) {

    var err = -1;
    var msg = '';
	var id  = -1;

	var cmd = "CALL spGetDashboard(@err, @msg, ?,?,?)";

	connection.query(cmd, [
							companyid, session.user.id, moment().tz("UTC").format("YYYY-MM-DD")
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, inner_rows) {

								if (inner_rows && inner_rows[0] && inner_rows[0].err == 0) {

									if (rows && rows[0] && rows.length > 0) {
										var vxDashboard = Map.mapToBDashboard(rows);
										return callback(null, vxDashboard);
									}
									else
										return callback(new Err("-101", "Unknown error!"), null);
								
								}
								else {

									var err = new Err();
									if (inner_rows && inner_rows[0]) {
										err.code    = inner_rows[0].err;
										err.message = inner_rows[0].msg;
									}
									else {
										err.code    = "-101";
										err.message = "Unknown Error";
									}
									return callback(err, false);

								}

							});
							
						}
	);
	
};

var deleteUser = function (id, companyid, session, connection, callback) {

	const cmd = "CALL spDeleteUser(@err,@msg, ?, ?, ?)";

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

var create = function (xUser, companycode, session, connection, callback) {

	async.waterfall ( [
		function (callback) {
			if (companycode) {
				CompanyService.findByCode(companycode, connection, function (err, company) {
					if (err)
						return callback(err);
					else {
						return callback(null, company);
					}
				});
			}
			else
				return callback(null, null);
		}
	], function (err, company) {

		var companyid;
		if (company)
			companyid = company.id
		else
			companyid = xUser.company_id;

		//check login name uniqueness. If unique, save record
		findByLoginName(xUser.login_name, companyid, session, connection, function (err, user) {

			if (err) {
				return callback (err);
			}

			if (user === null) {

 				var cmd = "CALL spCreateUser(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?)";

				connection.query(cmd, [
										companyid, xUser.first_name.trim(), xUser.last_name.trim(), 
										xUser.middle_name, xUser.login_name.trim(), xUser.password,
										xUser.role_id, null,
										Util.getValue(xUser.address.address1, ""), Util.getValue(xUser.address.address2, ""), Util.getValue(xUser.address.address3, ""),
										Util.getValue(xUser.address.city, ""), Util.getValue(xUser.address.state, ""), Util.getValue(xUser.address.zip, ""),
										Util.getValue(xUser.address.phone1, ""), Util.getValue(xUser.address.email1, ""), null
										], function (err, rows) {

										if (err) return callback (err);

										connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
											if (rows && rows[0] && rows[0].err == 0) {
												xUser.id = rows[0].id;
												return callback(null, xUser);
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
												return callback(err);
											}
										});
									}
				);

			}
			else {
				return callback(err, null);
			}	
		});
	});

};

var update = function (xUser, session, connection, callback) {

	var cmd = "CALL spUpdateUser(@err, @msg, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?, ?)";

	connection.query(cmd, [
							xUser.company_id, xUser.id, xUser.first_name, xUser.last_name, 
							xUser.middle_name, xUser.role_id, xUser.status_id, xUser.address.id,
							Util.getValue(xUser.address.address1, ""), Util.getValue(xUser.address.address2, ""), Util.getValue(xUser.address.address3, ""),
							Util.getValue(xUser.address.city, ""), Util.getValue(xUser.address.state, ""), Util.getValue(xUser.address.zip, ""),
							Util.getValue(xUser.address.phone1, ""), Util.getValue(xUser.address.email1, ""), null, Util.getValue(xUser.password, "")
							], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
									xUser.id = rows[0].id;
									return callback(null, xUser);
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
									return callback(err);
								}
							});
						}
	);

};

var findRoleById = function (id, companyid, session, connection, callback) {

	connection.query("SELECT r.* FROM roles r WHERE r.companies_id = ? AND r.id = ?", [
							companyid, id
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows.length > 0)
								return callback(null, Map.mapToBRole(rows[0]));
							else
								return callback(null, null);

						}

	);
	
};

var findAllRoles = function (companyid, options, session, connection, callback) {

 	let sortBy = (options.sortby ? options.sortby : "name");
 	let sortDirection = (options.sortorder && options.sortorder == -1 ? "DESC" : "ASC");

 	if (sortBy == "name") sortBy = "r.name";
 	if (sortBy == "type") sortBy = "s.name";

 	let cmd = "SELECT r.*, s.name as role_name FROM roles r, sysroles s WHERE r.sysroles_id = s.id AND r.companies_id = ? ORDER BY " + sortBy + " " + sortDirection;

	connection.query(cmd, [
							companyid
						], function (err, rows) {

							if (err) return callback (err);

							var vxRolelist = [];

							if (rows) {
								for (i=0; i < rows.length; i++)
									vxRolelist.push(Map.mapToBRole(rows[i]));
							}
								
							return callback(err, vxRolelist);

						}
	);
};

var createRole = function (xRole, xPermissionlist, session, connection, callback) {

	var cmd;
	async.waterfall ([

		function (callback) {

			cmd = "INSERT INTO roles (name, description, companies_id, sysroles_id, created, last_updated) VALUES (?, ?, ?, ?, NOW(), NOW())";

			connection.query(cmd, [
									xRole.name, xRole.description, xRole.company_id, xRole.sys_role_id
									], function (err, row) {

										if (err) return callback (err, null);

										if (row && row.affectedRows == 1) {
											xRole.id = row.insertId;
											return callback(null, xRole);
										}
										else 
											return callback(new Err(-200, "Role create failed."), null);

								}
			);
		},
		
		function (xRole, callback) {
			if (xRole) {
			
				async.each (xPermissionlist, function (xPermission, callback) {

					cmd = "INSERT INTO role_permissions (value, roles_id, syspermissions_id, update_counter, created, last_updated) VALUES (?, ?, ?, 0, NOW(), NOW())";

					connection.query(cmd, [
											(!xPermission.value ? 0 : (xPermission.value == true ? 1 : 0)), xRole.id, xPermission.id
											], function (err, row) {

												if (err) return callback (err);

												if (row && row.affectedRows == 1) {
													return callback(null);
												}
												else 
													return callback(new Err(-200, "Role create failed."));

										}
					);

				}, function (err) {
					callback(err, xRole);
				});

			}
			else
				callback (null, null);
		}

	], function (err, xRole) {
		if (err) return callback (err);
		else 
			callback(null, xRole);
	});

};

var updateRole = function (xRole, xPermissionlist, session, connection, callback) {

	var cmd;

	async.waterfall ([

		function (callback) {

			cmd = "UPDATE roles SET name = ?, description = ?, last_updated = NOW() WHERE id = ? AND companies_id = ?";

			connection.query(cmd, [
									xRole.name, Util.getValue(xRole.description, ""), xRole.id, xRole.company_id
									], function (err, row) {

									if (err) return callback (err);

									if (row && row.affectedRows == 1) {
										return callback(null, xRole);
									}
									else 
										return callback(new Err(-200, "Role update failed."));

								}
			);

		},

		function (xRole, callback) {
			if (xRole) {

				async.each (xPermissionlist, function (xPermission, callback) {

					cmd = "UPDATE role_permissions SET value = ?, update_counter = update_counter + 1, last_updated = NOW() WHERE syspermissions_id = ? AND roles_id = ?";

					connection.query(cmd, [
											(!xPermission.value ? 0 : (xPermission.value == true || xPermission.value == '1' ? 1 : 0)), xPermission.id, xRole.id
											], function (err, row) {

												if (err) return callback (err);

												return callback(null);

										}
					);

				}, function (err) {
					callback(err, xRole);
				});

			}
			else
				callback (null, null);
		}
	], function (err, xRole) {

		if (err) return callback (err);
		else 
			callback(null, xRole);

	});

};

var deleteRoleById = function (id, companyid, session, connection, callback) {

	var cmd;

	async.waterfall ([

		// waterfall method needs first argument of null
		function (callback) {

			cmd = "SELECT 1 FROM users u WHERE u.roles_id = ?";

			connection.query(cmd, [id], function (err, rows) {

									if (err) return callback (null, err, false);

									if (rows && rows.length > 0) {
										var err = new Err();
										err.code    = -201;
										err.message = "User(s) exist for given role. Role can't be deleted.";
										return callback(null, err, false);
									}
									else 
										return callback(null, null, true);

								}
			);

		},

		function (err, successflag, callback) {

			if (err) return callback (null, err, false);

			if (successflag) {
				cmd = "SELECT 1 FROM roles r WHERE r.id = ? AND r.sysroles_id IN (3999, 4002, 4003, 4004, 4005,4030,4031) AND NOT EXISTS (SELECT 1 FROM roles r1 WHERE r1.companies_id = r.companies_id AND r1.sysroles_id = r.sysroles_id AND r1.id <> r.id)";

				connection.query(cmd, [id], function (err, rows) {

										if (err) return callback (null, err, false);

										if (rows && rows.length > 0) {
											var err = new Err();
											err.code    = -202;
											err.message = "You have to have at least one role for given type. Role can't be deleted.";
											return callback(null, err, false);
										}
										else 
											return callback(null, null, successflag);

									}
				);
			}
			else
				callback (null, err, successflag);

		},
		
		function (err, successflag, callback) {

			if (err) return callback (null, err, false);

			if (successflag) {

				cmd = "DELETE FROM role_permissions WHERE roles_id = ? AND EXISTS (SELECT 1 FROM roles r WHERE r.companies_id = ? AND role_permissions.roles_id = r.id)";

				connection.query(cmd, [
										id, companyid
										], function (err, row) {

										if (err) return callback (null, err, false);

										return callback(null, null, true);

									}
				);


			}
			else
				callback (null, null, false);
		},

		function (err, successflag, callback) {

			if (err) return callback (err, false);

			if (successflag) {

				cmd = "DELETE FROM roles WHERE id = ? AND companies_id = ?";

				connection.query(cmd, [
										id, companyid
										], function (err, row) {

										if (err) return callback (err, false);

										if (row && row.affectedRows == 1) {
											return callback(null, true);
										}
										else 
											return callback(new Err(-200, "Role delete failed."), false);

									}
				);


			}
			else
				callback (null, false);
		}
	], function (err, successflag) {

		if (err) return callback (err);
		else 
			callback(null, successflag);

	});		
};

var findShareById = function (id, session, connection, callback) {

	var cmd = "select s.id, document_id, sysdocumenttypes_id, companies_id, users_id, s.name, phone_number, expired_at, salt, access_code, c.parent_id as companyid " +
				"from customer_shares s " +
				"inner join companies c on c.id = s.companies_id " +
				"where s.id = ?";
	connection.query(cmd, [id], function (err, rows) {

			if (err) return callback (err);

			if (rows && rows && rows.length > 0)
			{
				var share = Map.mapToBShare(rows[0]);

				CompanyService.findById(share.company_id, connection, function (err, company) {
					
					if (err) callback (setError(err), null);
					
					share.company = company;
					callback(null, share);
				});
			}
			else
				return callback(null, null);
		}
	);
	
};

var findShareByDocIDAndAccessCode = function (salt, document_id, connection, callback) {

	var cmd = "CALL spGetShare(@errorcode, @errormsg, ?, ?)";
	connection.query(cmd, [salt, document_id], function (err, rows) {

		if (err) return callback (err, null);

		if (rows && rows[0] && rows[0].length > 0) {

			var share = Map.mapToBShare(rows[0][0]);
			cmd = "update customer_shares set last_accessed = NOW() where id = ?";
			
			connection.query(cmd, [share.id], function(err, rows) {
				CompanyService.findCustomerById(share.companies_id, 1, Util.getGlobalSession(), connection, function(err, customer){
					share.customer = customer;
					return callback(null, share);
				})	
			})
		}
		else
			return callback(null, null);
		
	});
	
};

var createShare =  function (xShare, session, connection, callback) {
	var cmd = "CALL spCreateCustomerShare(@err, @msg, @id, ?,?,?,?,?,?,?)";
	connection.query(cmd, [xShare.entityid, xShare.name, xShare.phone_number, xShare.documentid, xShare.document_type, session.user.id, xShare.expiry_days], function (err, row) {
		
		connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
			if (rows && rows[0] && rows[0].err === 0) {
				xShare.id = rows[0].id;
				callback(null, xShare);
			}
			else {
				err = new Err();
				err.code    = rows[0].err;
				err.message = rows[0].msg;
				callback(err, null);
			}
		});
	});

};


module.exports = {
	authenticate                 : authenticate,
	create                       : create,
	update                       : update,
	deleteUser 					 : deleteUser,
	changePassword               : changePassword,
	findById                     : findById,
	findAll                      : findAll,
//	findAllCustomers             : findAllCustomers,
	findRoleById                 : findRoleById,
	findAllRoles                 : findAllRoles,
	deleteRoleById               : deleteRoleById,
	createRole                   : createRole,
	updateRole                   : updateRole,
	findPermissionsByRoleId      : findPermissionsByRoleId,
	findAllPermissions           : findAllPermissions,
	getDashboard                 : getDashboard,
	authenticateByApiKeyAndSecret: authenticateByApiKeyAndSecret,
	findShareById                : findShareById,
	createShare  				 : createShare,
	findShareByDocIDAndAccessCode : findShareByDocIDAndAccessCode
};

//	createCompanyAdmin           : createCompanyAdmin,
//	getUserByEmail               : getUserByEmail,
//	getUsersByCompanyAndType     : getUsersByCompanyAndType,
