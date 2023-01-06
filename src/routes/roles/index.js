var UserController     = require("../../controllers/user");
var SessionController  = require("../../controllers/session");
var Util               = require("../../utils");

var async              = require('async');

module.exports = function attachHandlers (router) {

    // get requests
   router.get('/api/roles/:id', findById);

    router.get('/api/roles', findAll);

    router.get('/api/roles/:id/permissions', findPermissionsByRoleId);

    router.get('/api/permissions', findAllPermissions);

    // post requests
    router.post('/api/roles', create);

	// put requests
	//first_name=SarikaJI&last_name=Shah&middle_name=R&role_id=2&phone=27630323&email=rupesh.d.shah@gmail.com&address_id=10006&status_id=4600
	router.put('/api/roles/:id', update);

	// delete requests
	router.delete('/api/roles/:id', deleteById);

};

function findById(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;
	
		UserController.findRoleById(req.params.id, companyid, response.data.session, function(err, response) {
				if (err)
					return next(err);

				return res.json(response);
		});

	});

}

function findAll (req, res, next) {

	let sid = Util.readSID(req);

	let options = {};

	options["sortby"]		= req.query.sort_by;
	options["sortorder"]	= req.query.sort_direction;

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;
	
		UserController.findAllRoles (companyid, options, response.data.session, function (err, response) {
			if (err)
				return next(err);
			else
				return res.json(response);
		});

	});

}

function findAllPermissions (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;
	
		UserController.findAllPermissions (companyid, response.data.session, function (err, response) {
			if (err)
				return next(err);
			else
				return res.json(response);
		});

	});

}

function findPermissionsByRoleId(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.findPermissionsByRoleId(req.params.id, companyid, response.data.session, function(err, response) {
				if (err)
					return next(err);

				return res.json(response);
		});

	});

}

function create (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.createRole
		(
			companyid, 
			req.body.name, 
			req.body.description,
			req.body.sysroleid,
			req.body.permissionlist,
			response.data.session,
			function (err, response)
			 {
				if (err)
					return next(err);

				else 
					return res.json(response);
			}
		);
	});

}

function createPermission (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.createPermission
		(
			companyid,
			req.body.name, 
			req.body.description,
			response.data.session,
			function (err, response)
			 {
				if (err)
					return next(err);

				else 
					return res.json(response);
			}
		);
	});

}

function update (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.updateRole
		(
			companyid,
			req.params.id,
			req.body.name,
			req.body.description,
			req.body.permissionlist,
			response.data.session,
			function (err, response)
			 {
				if (err)
					return next(err);

				else 
					return res.json(response);
			}
		);

	});

}

function deleteById(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.deleteRoleById(req.params.id, companyid, response.data.session, function(err, response) {
				if (err)
					return next(err);

				return res.json(response);
		});

	});

}
