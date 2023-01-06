var UserController     = require("../../controllers/user");
var SessionController  = require("../../controllers/session");
var Util               = require("../../utils");

var async     = require('async');

module.exports = function attachHandlers (router) {

    // get requests
    
    router.get('/api/users/:id', findById);

    router.get('/api/users', findAll);

    router.get('/api/dashboard', getDashboard);

    //router.get('/api/users/:login_name', UserController.getUserByEmail);


    // post requests
    router.post('/api/users', createUser);

	//login_name=maitri.admin&password=abc999	
    router.post('/api/users/me/login', login);

    router.post('/api/tokens', loginWithApiKeyAndSecret);

	// put requests
	//login_name=rupesh123&oldpassword=abc999&newpassword=abc9991	
	router.put('/api/users/me/changepassword', changePassword);

	// put requests
	//first_name=SarikaJI&last_name=Shah&middle_name=R&role_id=2&phone=27630323&email=rupesh.d.shah@gmail.com&address_id=10006&status_id=4600
	router.put('/api/users/:id', updateUser);

	router.delete('/api/users/:id', deleteUser);

	//Customer Shares API's
	router.get('/api/shares/:id', findShareById);


	router.post('/api/shares', createShare);

};

function login (req, res, next) {

	var domain = req.headers.host,
		subDomain = domain.split('.');

	if(subDomain.length > 1){
		subDomain = subDomain[0];
	}else{
		subDomain = "";
	}

	var authData = Util.getAuthData(req);
	var decode = Util.decode(authData);
	var loginData = decode.split(":");

	if(loginData == null || loginData == undefined)
		return next(new Error("Login data is empty"));

	UserController.login(loginData[0], loginData[1], subDomain/*req.body.company_code*/, req.body.session_type_id || 4100, function (err, response) {
		if (err)
			return next(err);
		else
			return res.json(response);
	});

}

function loginWithApiKeyAndSecret (req, res, next) {

	var domain = req.headers.host,
		subDomain = domain.split('.');

	if(subDomain.length > 1){
		subDomain = subDomain[0];
	}else{
		subDomain = "";
	}

	let authData = Util.getAuthData(req);
	let base64DecodedString = Util.decode(authData);
	let loginDataArr = base64DecodedString.split(":");

	if(loginDataArr == null || loginDataArr == undefined || !Array.isArray(loginDataArr) || loginDataArr.length != 2)
		return next(new Error("Invalid API credentials."));

	UserController.loginWithApiKeyAndSecret(loginDataArr[0], loginDataArr[1], subDomain/*req.body.company_code*/, function (err, response) {
		if (err)
			return next(err);
		else
			return res.json(response);
	});

}

function findById(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.findById(req.params.id, companyid, response.data.session, function(err, response) {
				if (err)
					return next(err);

				return res.json(response);
		});

	});

}

function getDashboard(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.getDashboard(companyid, response.data.session, function(err, response) {
				if (err)
					return next(err);

				return res.json(response);
		});

	});

}

function changePassword (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.changePassword(req.body.login_name, req.body.oldpassword, req.body.newpassword, companyid, response.data.session, function (err, response) {
			if (err)
				return next(err);
			else
				return res.json(response);
		});

	});

}

function findAll (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		var options = {};
		options.roleid       	= req.query.role_id;
		options.sysroleid       = req.query.sysrole_id;
		options.statusid 		= req.query.status_id;
		
		//options.sortby		 	= "status";
		//options.sortorder		= 1;
		options["sortby"]		= req.query.sort_by;
		options["sortorder"]	= req.query.sort_direction;

		UserController.findAll (companyid, options, response.data.session, function (err, response) {
			if (err)
				return next(err);
			else
				return res.json(response);
		});

	});

}

function createUser (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.create
		(
			companyid, 
			req.body.first_name, 
			req.body.middle_name,
			req.body.last_name, 
			req.body.login_name,
			req.body.password, 
			req.body.role_id,
			req.body.phone,
			req.body.email, 
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

function updateUser (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.update
		(
			companyid,
			req.params.id,
			req.body.first_name,
			req.body.middle_name,
			req.body.last_name, 
			req.body.role_id,
			req.body.status_id,
			req.body.address_id,
			req.body.phone,
			req.body.email,
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

function deleteUser (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		UserController.deleteUser(
			req.params.id,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function findShareById(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		UserController.findShareById(req.params.id, response.data.session, function(err, response) {
				if (err)
					return next(err);

				return res.json(response);
		});

	});

}

function createShare(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		UserController.createShare(req.body.documentid, req.body.entity, req.body.document_type, response.data.session, function (err, response) {
			if (err)
				return next(err);

			return res.json(response);
		});

	});

}



