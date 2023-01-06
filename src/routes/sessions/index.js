const SessionController  = require("../../controllers/session");
const UserController  = require("../../controllers/user");
const CompanyController  = require("../../controllers/company");
const ReportController   = require("../../controllers/report");
const Util               = require("../../utils");
const Config             = require("../../config/config");
var Event                = require("../../bo/event");
const fs                 = require("fs");
const async              = require("async");
const formidable         = require("formidable");

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminMozjpeg = require('imagemin-mozjpeg');
const Promise = require('bluebird');

module.exports = function attachHandlers (router) {

	// get requests
    router.get('/api/sessions/:id', listSessions);
    router.get('/api/reports/:id', runReport);

    // post requests
    router.post('/api/sessions', create);
    router.post('/api/sessions/me/logout', logout);
    router.post('/api/sessions/images', uploadImage);
    router.post('/api/sessions/email', email);
    


};

function runReport(req, res, next) {
	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		var options = [];
		for (var key in req.query) {
  			if (req.query.hasOwnProperty(key)) {
  				options[key] = req.query[key];
  			}
  		}

		if (req.query.format == "PDF") {
			ReportController.printReport(req.params.id, options, companyid, response.data.session, function(err, stream) {
					if (err)
						return next(err);
						
					res.setHeader('content-type', 'application/pdf');
					return stream.pipe(res);
			});
		}
		else {

			ReportController.getReport(req.params.id, options, companyid, response.data.session, function(err, report) {
					if (err)
						return next(err);
					return res.json(report);
			});
		}
	});
}

function listSessions (req, res, next) {

		SessionController.getSession(req.params.id, function (err, response) {

			if (err)
				return next(err);

			return res.json(response);

		});
}

function logout (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.logout(sid, function (err, response) {

			if (err)
				return next(err);
/*			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);
*/				
			return res.json(response);

		});
}

function email (req, res, next) {

	Util.email(
	    '"Simply Textile" <admin@simplytextile.com>',
	    Config.prospect_notification_email || 'rupesh.d.shah@gmail.com, rupesh_d_shah@yahoo.com',
	    'SimplyTextile Prospect',
	    '<b>' + req.body.name + "</b><br/>" + req.body.email + "<br/>" + req.body.message + "<br/>Phone: " + req.body.phone,
	    function (err, info) {
		    if (err) 
		    	return next(error);

		    //console.log('Message %s sent: %s', info.messageId, info.response);
		    return res.json({"data":"success"});
	    }
	);

}

function create(req, res, next) {

	if((req.body.access_code == undefined) || (req.body.access_code == '') || (req.body.document_id == undefined) || (req.body.document_id == ''))
		return res.json(Util.setErrorResponse(-100, "Access Code and other parameters are missing"));

	UserController.findShareByDocIDAndAccessCode(req.body.access_code, req.body.document_id, function (err, share) {

		if (err)
			return next(err);
		else
		{
			if(share.statuscode == 0)
			{				
				var shareDetail = share.data.share;
				if(shareDetail.customer.address.phone1 == req.body.phone_number)
				{

					SessionController.create(shareDetail.customer.id, req.body.sessionid, function(err, response){
						if(err)
							return next(err);
						else
							return res.json(response);
					})
				}
				else
					return res.json(Util.setErrorResponse(-100, "Invalid Phone Number"));	
			}
			else
				return res.json(Util.setErrorResponse(-100,  "No access to this url"));

			
		}

	});
}


function uploadImage(req, res, next) {

	var rootpath = process.cwd() + Config.local.image_server_root; //till /upload
	var rand_str = Util.randomString(16) 
	var filename = rand_str + ".jpg";
	var pngFilename = rand_str + ".png";

	var filenameWithPath =  rootpath + Config.local.image_server_folder_small + filename;
	var filenameWithPathOrig =  rootpath + Config.local.image_server_folder_orig + filename;
	var filenameWithPathOriginal =  rootpath + Config.local.image_server_folder_original + pngFilename;
	var filenameWithPathLarge =  rootpath + Config.local.image_server_folder_large + filename;

	var form = new formidable.IncomingForm();

	form.parse(req);
	
	form.on('error', function(err) {
		return next(err);
	});

	form.on('fileBegin', function (name, file){
		file.path = filenameWithPathOriginal;
	});

	form.on('aborted', function(err) {
		try {
		  fs.unlinkSync(file.path)
		  //file removed
		} catch(err) {
		  console.error(err);
		}
		return next(err);
	});

	form.on('file', function(field, file) {

		var event = new Event();
		event.document_id = rand_str;
		Util.getEventManager().fireEvent(Util.LocalEventTypeEnum.ProductImageUpload, event);

		return res.json({"url" : Config.web.image_server_url + Config.web.image_server_root + Config.local.image_server_folder_small + filename, 
					"url_large": Config.web.image_server_url + Config.web.image_server_root + Config.local.image_server_folder_large + filename,
					"url_orig": Config.web.image_server_url + Config.web.image_server_root + Config.local.image_server_folder_orig + filename});
	
	});

	

 	/*var data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
 	var buf = new Buffer(data, 'base64');
 
	fs.writeFile(filenameWithPathOriginal, buf, function (err) {
		if (err)
			return next(err);
		var event = new Event();
		event.document_id = rand_str;
		Util.getEventManager().fireEvent(Util.LocalEventTypeEnum.ProductImageUpload, event);
	});

	return res.json({"url" : Config.web.image_server_url + Config.web.image_server_root + Config.local.image_server_folder_small + filename, 
					"url_large": Config.web.image_server_url + Config.web.image_server_root + Config.local.image_server_folder_large + filename,
					"url_orig": Config.web.image_server_url + Config.web.image_server_root + Config.local.image_server_folder_orig + filename});
	

 	/*var data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
 	var buf = new Buffer(data, 'base64');
 
	fs.writeFile(filenameWithPathOriginal, buf, function (err) {
		if (err)
			console.error(err);
		else {	
			var event = new Event();
			event.document_id = rand_str;
			Util.getEventManager().fireEvent(Util.LocalEventTypeEnum.ProductImageUpload, event);			
		}
	});*/
}

function uploadImage_sharp(req, res, next) {

	var rootpath = process.cwd() + Config.local.image_server_root; //till /upload
	var filename = Util.randomString(16) + ".png";

	var filenameWithPath =  rootpath + Config.local.image_server_folder_thumb + filename;
	var filenameWithPathOrig =  rootpath + Config.local.image_server_folder_orig + filename;
	var filenameWithPathLarge =  rootpath + Config.local.image_server_folder_large + filename;

 	var data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
 	var buf = new Buffer(data, 'base64');

	fs.writeFile(filenameWithPathOrig, buf, function (err) {
		if (err)
			return next(err);

		var sharp = require("sharp");

		async.parallel ([
			function (callback) {

				sharp(filenameWithPathOrig)
		  			.resize(240, 240)
		  			.toFile(filenameWithPath, function(err) {

  						if (err) return next(err);

  						return callback(err, null);
  					});
			},

			function (callback) {

				sharp(filenameWithPathOrig, {'density':72})
  					.resize(600, 400)
		  			.toFile(filenameWithPathLarge, function(err) {
		  				if (err) return callback(err);
		  				return callback(err, null);
		  			});
			}

		], function (err, results) {
			if (err) return next(err);
			return res.json({"url" : Config.web.image_server_url + Config.web.image_server_root + Config.local.image_server_folder_thumb + filename, "url_large": Config.web.image_server_url + Config.web.image_server_root + Config.local.image_server_folder_large + filename});
		});

/*
		sharp(filenameWithPathOrig)
  			.resize(240, 240)
  			.max()
  			.toFile(filenameWithPath, function(err) {

  				if (err) return next(err);

		  		// density (dpi) is 72 by default
				sharp(filenameWithPathOrig, {'density':72})
  					.resize(600, 400)
		  			.max()
		  			.toFile(filenameWithPathLarge, function(err) {
		  				if (err) return next(err);
						return res.json({"url" : filename, "url_large": filename});
				});

//				return res.json({"url" : Config.web.image_server_url + filenameWithPath, "url_large": Config.web.image_server_url + filenameWithPathLarge});
			});
*/
	});
}


