var WorkflowController = require("../../controllers/workflow");
var SessionController  = require("../../controllers/session");
var Util               = require("../../utils");

module.exports = function attachHandlers (router) {

    router.get('/api/workflow', listview);
	router.post('/api/workflow', createWorkflow);
};


function listview (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			WorkflowController.findAll(companyid, req.query.enabled_only, response.data.session, function(err, categories) {
				if (err)
					return next(err);
				else
					return res.json(categories);
			});
		});
}


function createWorkflow(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		var companyid = response.data.session.company_id;
		WorkflowController.create(companyid,
			req.body,
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/api', router);

