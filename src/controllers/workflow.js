var WorkflowService      = require("../services/workflow");
var Util              = require("../utils");
//var Order           = require("../bo/order");
var Err               = require("../bo/err");
var mysql             = require("../utils/mysql");



var findAll = function (companyid, isEnabledOnly, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_WORKFLOW_SETUP] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	if (!isEnabledOnly)
		isEnabledOnly = 0;
	else if (isEnabledOnly != "1")
		isEnabledOnly = 0;

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		WorkflowService.findAll(companyid, isEnabledOnly, session, connection, function (err, workflows) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!workflows)
			{
				workflows = [];
				mysql.closeConnection(connection);
				var response = Util.setOKResponse(workflows, "Workflow");
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(workflows, "Workflow"));
			}  

		});

    });

};

var create = function (companyid, workflow, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_WORKFLOW_SETUP] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			WorkflowService.create(companyid, workflow, session, connection, function (err, workflow) {
				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(workflow, "workflow");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};



module.exports = {
	findAll                  : findAll,
	create					 : create
	
};