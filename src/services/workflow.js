var Map             = require("../utils/map");
var Err             = require("../bo/err");
var Util            = require("../utils");

var async           = require("async");


exports.findAll = function (companyid, isEnabledOnly, session, connection, callback) {

	var data ={};
	async.parallel([
		//Load Workflow Hierarchy
		function(callback){
			var cmd = "SELECT wh.*, from_r.id as 'roles_id',from_r.name as roles_name,to_r.name as to_roles_name FROM workflow_hierarchies wh RIGHT JOIN roles from_r ON  wh.roles_id = from_r.id LEFT JOIN roles to_r ON wh.to_roles_id = to_r.id    WHERE from_r.companies_id = ? AND from_r.sysroles_id<>4002";
			
			connection.query(cmd, [
									companyid
								], function (err, rows) {
									if (err) return callback (err);
									data.workflow = rows;
									return callback();
								}
			);
		},
		//Load Roles
		function(callback){
			var cmd = "SELECT r.* FROM roles r  WHERE companies_id = ?";
			connection.query(cmd, [
									companyid
								], function (err, rows) {
									if (err) return callback(err);
									data.roles = rows;
									return callback();
								}
			);
		}
	],
	//Error
	function(err){
	 	if (err) return callback(err); //If an error occured, we let express/connect handle it by calling the "next" 
		var merge_data = {'workflow_hierarchy':data.workflow,'roles': data.roles};
		callback(err, merge_data);		
		//cb(err, Map.mapToBOrder(data.order, data.lineitems));		

	});
};

exports.create = function (companyid, workflow, session, connection, outcallback) {

	
		async.eachSeries(workflow, function iterator(workflow_item, incallback) {
			var to_roles_id ;
			if(workflow_item.reportTo != undefined)
			{
				to_roles_id = workflow_item.reportTo.id; 
			}
			else if(workflow_item.id == null)
			{
				return incallback();
			}
		
		
			 var cmd = "SET @id = "+ workflow_item.id +";CALL spCreateWorkflowHierarchy(@err, @msg, @id, ?,?,?,?,?,?)";

			connection.query(cmd, [
									companyid,
									workflow_item.roles_id,
									workflow_item.variance_over,
									workflow_item.credit_days_over,
									workflow_item.credit_over,
									to_roles_id
								  ], function (err, rows) {

										connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
											if (rows && rows[0] && rows[0].err == 0) {
												id = rows[0].id;
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
											}
										});
										return incallback(err);

									}
			);
			

		}, function done(err) {
				return outcallback(err,workflow);
		
		});
		

				
};
