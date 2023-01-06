var SessionController  = require("../../controllers/session");
var ConfigController   = require("../../controllers/configuration");
var Util               = require("../../utils");

module.exports = function attachHandlers (router) {

    // get requests
    router.get('/api/configurations/', listConfigurations);
    router.get('/api/configurations/:code', listConfigurations);

};

function listConfigurations (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.code) {
				ConfigController.findByCode(req.params.code, companyid, function (err, response) {

					if (err)
						return next(err);

					return res.json(response);
			
				});
			}
			else {
				ConfigController.findAll(companyid, response.data.session, function (err, response) {

					if (err)
						return next(err);

					return res.json(response);
			
				});
			} 

		});

}


