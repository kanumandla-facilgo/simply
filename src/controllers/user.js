var UserService       = require("../services/user");
var CompanyService    = require("../services/company");
var SessionService    = require("../services/session");
var Util              = require("../utils");
var User              = require("../bo/user");
var Role              = require("../bo/role");
var mysql             = require("../utils/mysql");
var Err               = require("../bo/err");
var Event     = require("../bo/event");

var login = function (loginname, password, companycode, isMobile, callback) {

	if (Util.isEmptyString(loginname) || Util.isEmptyString(password)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Login name and password are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		connection.beginTransaction(function () {

			UserService.authenticate(loginname, password, companycode, isMobile, connection, function (err, session) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (session == null) {
					var response = Util.setErrorResponse(-100, "User not found."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(session, "Session");
						return callback(err, response);

					});

				}

			});
		});
	});
}

var loginWithApiKeyAndSecret = function (apikey, apisecret, companycode, callback) {

	if (Util.isEmptyString(apikey) || Util.isEmptyString(apisecret)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "API key and secret are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		connection.beginTransaction(function () {

			UserService.authenticateByApiKeyAndSecret(apikey, apisecret, companycode, connection, function (err, session) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (session == null) {
					var response = Util.setErrorResponse(-100, "User not found."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(session, "Session");
						return callback(err, response);

					});

				}

			});
		});
	});
}

var changePassword = function (loginname, oldpassword, newpassword, companyid, session, callback) {

	if (session.user.login_name != loginname && companyid == session.company_id && session.permissionlist[Util.CONST_PERMISSION_UPDATE_PASSWORD] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(loginname) || Util.isEmptyString(oldpassword) || Util.isEmptyString(newpassword) || Util.isEmptyString(companyid) ) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Login name, password, old password are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {

			UserService.changePassword(loginname, oldpassword, newpassword, companyid, session, connection, function (err, successflag) {
		
				if (err || !successflag) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse("", "");
						return callback(err, response);

					});

				}

			});
		});
	});

}

var getDashboard = function (companyid, session, callback) {

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		UserService.getDashboard(companyid, session, connection, function (err, dashboard) {
	
			if (err) {
				mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					}
				);
			}
			else if (dashboard == null) {
				var response = Util.setErrorResponse(-100, "Dashboard not found."); //new Status();
				mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err, response);
					}
				);
			}
			else {

				mysql.commitTransaction(connection, function () {

					mysql.closeConnection(connection);

					var response = Util.setOKResponse(dashboard, "Dashboard");
					return callback(err, response);

				});

			}

		});
			
	});

};

var findById = function (id, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_USER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_USER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		UserService.findById(id, companyid, session, connection, function (err, user) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!user)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "User not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(user, "User"));
			}  

		});

    });
 
};

var findShareById = function (id, session, callback) {

	if (Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		UserService.findShareById(id, session, connection, function (err, share) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!share)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Share not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(share, "Share"));
			}  

		});

    });
 
};

var findShareByDocIDAndAccessCode = function (salt, document_id, callback) {

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		UserService.findShareByDocIDAndAccessCode(salt, document_id, connection, function (err, share) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (share == null)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Share not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(share, "Share"));
			}  

		});

    });
 
};


var deleteUser = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_USER_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "User ID is a required field.";
		return callback(err);

	}
        
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			UserService.deleteUser(id, companyid, session, connection, function (err, status) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (!status) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error deleting user."); //new Status();
							return callback(err, response);
						}
					);
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


var createShare = function (document_id, entity, document_type, expiry_days, session, callback) {

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback(err);

		connection.beginTransaction(function () {

			var xShare = {}
			xShare.documentid = document_id;
			xShare.entityid = entity.id;
			xShare.phone_number = entity.phone_number;
			xShare.name = entity.name;
			xShare.document_type = document_type;
			xShare.expiry_days = expiry_days;

			UserService.createShare(xShare, session, connection, function (err, share) {
				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err);
					});
				}
				else if (share === null) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Category can't be shared.");
						return callback(err, response);
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);					

						var event = new Event();
						event.user_id = session.user.id;
						event.document_id = share.id;
						Util.getEventManager().fireEvent(Util.EventTypeEnum.CustomerShare, event);
						
						return callback(err, share);
					});
				}
			});
		});
	});
}

var findPermissionsByRoleId = function (roleid, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_ROLE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_ROLE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(roleid) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Role ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		UserService.findPermissionsByRoleId(roleid, companyid, session, connection, function (err, permissionlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!permissionlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Permission not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(permissionlist, "Permission"));
			}  

		});

    });
 
}

var findAll = function (companyid, options, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_USER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_USER_UPDATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if ( Util.isEmptyString(companyid) ) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		UserService.findAll(companyid, options, session, connection, function (err, vxUserList) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!vxUserList) {
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-110, "User not found."); //new Status();
				return callback (err, response);
			}
			else {

				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(vxUserList, "User"));

			}

		});
	});

};

var findAllPermissions = function (companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_ROLE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_ROLE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if ( Util.isEmptyString(companyid) ) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		UserService.findAllPermissions(companyid, session, connection, function (err, permissionlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!permissionlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Permission not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(permissionlist, "Permission"));
			}  

		});

    });
 
};

var findByLoginName = function (companyid, loginname, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_USER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_USER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if ( Util.isEmptyString(loginname) || Util.isEmptyString(companyid) ) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "User login name is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {

		if (err) return callback (err);

		UserService.findByLoginName(loginname, session, connection, function (err, vxUser) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!vxUser)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "User not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(vxUser, "User"));
			}  
		});
	});

};

var create = function (companyid, firstname, middlename, lastname, loginname, password, usertypeid, phone, email, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_USER_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	//TODO: validation

	var xUser              = new User();
	xUser.first_name       = Util.getValue(firstname, "");
	xUser.last_name        = Util.getValue(lastname, "");
	xUser.middle_name      = Util.getValue(middlename, "");

	xUser.address          = Util.initObjectIfNotExist(xUser.address, "Address");

	xUser.address.address1 = "";
	xUser.address.email1   = Util.getValue(email, "");
	xUser.address.phone1   = Util.getValue(phone, "");
	xUser.company_id       = companyid;
	xUser.password         = Util.getValue(password, "");
	xUser.login_name       = Util.getValue(loginname, "");
	xUser.role_id          = Util.getValue(usertypeid, "");

	if ( Util.isEmptyString(companyid) || Util.isEmptyString(xUser.first_name) || Util.isEmptyString(xUser.last_name) || Util.isEmptyString(xUser.login_name) || Util.isEmptyString(xUser.password) || Util.isEmptyString(xUser.role_id) || Util.isEmptyString(xUser.address.email1) || Util.isEmptyString(xUser.address.phone1) ) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "User first name, last name, email, phone, role are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {

			UserService.create(xUser, null, session, connection, function (err, user) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (user === null) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setErrorResponse(-100, "User with email already exists."));
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(user, "User"));
					});
				}
			});
		});
	});
}

var update = function (companyid, id, firstname, middlename, lastname, usertypeid, statusid, addressid, phone, email, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_USER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	var xUser            = new User();
	xUser.id             = id;
	xUser.first_name     = Util.getValue(firstname, "");
	xUser.last_name      = Util.getValue(lastname, "");
	xUser.middle_name    = Util.getValue(middlename, "");

	xUser.address          = Util.initObjectIfNotExist(xUser.address, "Address");
	
	xUser.address.id     = addressid;
	xUser.address.email1 = Util.getValue(email, "");
	xUser.address.phone1 = Util.getValue(phone, "");
	xUser.company_id     = companyid;
	xUser.status_id      = Util.getValue(statusid, "");
	xUser.role_id        = Util.getValue(usertypeid, "");

	if ( Util.isEmptyString(id) || Util.isEmptyString(companyid) || Util.isEmptyString(xUser.first_name) || Util.isEmptyString(xUser.last_name) || Util.isEmptyString(xUser.role_id) || Util.isEmptyString(xUser.status_id) || Util.isEmptyString(xUser.address.email1) || Util.isEmptyString(xUser.address.phone1) ) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "User ID, first name, last name, email, phone, status, role are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			UserService.update(xUser, session, connection, function (err, user) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (user === null) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setErrorResponse(-100, "User with email already exists."));
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(user, "User"));
					});
				}
			});
		});
	});
}

var findRoleById = function (id, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_ROLE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_ROLE_UPDATE] != "1")
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
		err.message = "Role ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		UserService.findRoleById(id, companyid, session, connection, function (err, role) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!role)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Role not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(role, "Role"));
			}  

		});

    });
 
};

var findAllRoles = function (companyid, options, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_ROLE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_ROLE_UPDATE] != "1" && 
	    session.permissionlist[Util.CONST_PERMISSION_USER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_USER_UPDATE] != "1" 
	    )
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		UserService.findAllRoles(companyid, options, session, connection, function (err, vxRoleList) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!vxRoleList) {
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Role not found."); //new Status();
				return callback (err, response);
			}
			else {

				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(vxRoleList, "Role"));

			}

		});
	});

};


var deleteRoleById = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_ROLE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Role ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		connection.beginTransaction(function () {

			UserService.deleteRoleById(id, companyid, session, connection, function (err, status) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					});
				}
				else if (!status)
				{
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err, Util.setErrorResponse(-100, "Role can't be deleted."));
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

var createRole = function (companyid, name, description, sysroleid, xPermissionList, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_ROLE_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	var xRole           = new Role();
	xRole.name          = Util.getValue(name, "");
	xRole.description   = Util.getValue(description, "");
	xRole.sys_role_id   = (sysroleid ? sysroleid : 4003);
	xRole.company_id    = companyid;

	if (Util.isEmptyString(xRole.name) || Util.isEmptyString(xRole.company_id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Role name is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {

			UserService.createRole(xRole, xPermissionList, session, connection, function (err, role) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (role === null) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setErrorResponse(-100, "Role could not be created."));
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(role, "Role"));
					});
				}
			});
		});
	});
}

var updateRole = function (companyid, id, name, description, xPermissionList, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_ROLE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	var xRole           = new Role();
	xRole.id            = id;
	xRole.name          = Util.getValue(name, "");
	xRole.description   = Util.getValue(description, "");
	xRole.sys_role_id   = 4003;
	xRole.company_id    = companyid;


	if (Util.isEmptyString(xRole.id) || Util.isEmptyString(xRole.name) || Util.isEmptyString(xRole.company_id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Role ID, name are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			UserService.updateRole(xRole, xPermissionList, session, connection, function (err, role) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (role === null) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setErrorResponse(-100, "Role could not be updated."));
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(role, "Role"));
					});
				}
			});
		});
	});
}

/*
var createCustomer = function (companycode, firstname, middlename, lastname, loginname, password, usertypeid, phone, email, callback) {
	//TODO: validation

		
	var xUser           = new User();
	xUser.first_name    = firstname;
	xUser.last_name     = lastname;
	xUser.email         = email;
	xUser.gender        = gender;
//	xUser.company_id    = companyid;
	xUser.password      = password;
	xUser.user_type_id  = 203;

	UserService.create(xUser, companycode, function (err, user) {

		if (err) {
			return callback (err);
		}
		else if (user === null) {
			var response = Util.setErrorResponse(-100, "User with email already exists."); //new Status();
			return callback(err, response);
		}
		else {
			return callback(err, Util.setOKResponse(user, "User"));
		}
	});

}

var getUserByEmail = function (email, callback) {

      User.findOne({email:email}, function (err, user) {
      	if (err)
      		return callback(err);
		else if (!user)
			{
				var response = Util.setErrorResponse(-100, "User not found."); //new Status();
				return callback(err, response);
			} 
      	else
      		return callback(err, Util.setOKResponse(user, "User"));
      	});

}

var getUsersByCompanyAndType = function (companyid, usertypeid, callback) {
	User.find({companies_id:companyid, user_type_id:usertypeid}, function(err, users) {

		if (err)
			return callback(error);
		else
			return callback(err, Util.setOKResponse(users, "UserList"));
	});
}

var getUsersByCompanyCodeAndType = function (companyid, usertypeid, callback) {
	var company = new Company();
	Company.findOne({code:ccode}, function (err, company) {

		if (err)
			return callback(error);

		else if (company === null) {

			var response = Util.setErrorResponse(-100, "Company not found."); //new Status();
			return callback(err, response);
	
		}

		else {
		
			getUsersByCompanyAndType(company.companyid, usertypeid, function(err, users) {

				if (err)
					return callback(error);
				else
					return callback(err, Util.setOKResponse(users, "UserList"));
			});
		}
		
	});
	
}
*/
module.exports = {
	login                        : login,
	create                       : create,
	update                       : update,
	deleteUser 					 : deleteUser,
	changePassword               : changePassword,
	findAll                      : findAll,
	findById                     : findById,
	findByLoginName              : findByLoginName,
	findRoleById                 : findRoleById,
	findAllRoles                 : findAllRoles,
	deleteRoleById               : deleteRoleById,
	createRole                   : createRole,
	updateRole                   : updateRole,
	findPermissionsByRoleId      : findPermissionsByRoleId,
	findAllPermissions           : findAllPermissions,
	getDashboard                 : getDashboard,
	loginWithApiKeyAndSecret	 : loginWithApiKeyAndSecret,
	findShareById                : findShareById,
	createShare					 : createShare,
	findShareByDocIDAndAccessCode: findShareByDocIDAndAccessCode
}
/*
	createCustomer               : createCustomer,
	getUserByEmail               : getUserByEmail,
	getUsersByCompanyCodeAndType : getUsersByCompanyCodeAndType,
	getUsersByCompanyAndType     : getUsersByCompanyAndType,
*/