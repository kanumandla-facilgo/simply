var CategoryController  = require("../../controllers/category");
var UserController  = require("../../controllers/user");
var SessionController   = require("../../controllers/session");
var Util                = require("../../utils");
var async     = require('async');

module.exports = function attachHandlers (router) {

    // get requests
    router.get('/api/categories', listCategories);
    router.get('/api/categories/:id', listCategories);
    
    // post requests
    //name=TOWEL3&code=TOWEL3&parent_id=4
    router.post('/api/categories', createCategory);
    router.post('/api/categories/:id/share', shareCategory);
   
    // put request to update
    //name=TOWEL3&code=TOWEL3&parent_id=4
    router.put('/api/categories/:id', updateCategory); 

    router.delete('/api/categories/:id', deleteCategory); 
    router.delete('/api/categories', deleteCategory); 

};

function listCategories (req, res, next) {

		var sid = Util.readSID(req);
		console.log(sid);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {
				CategoryController.findById(req.params.id, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else if (req.query.code) {
				CategoryController.findByCode(req.query.code, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else if (req.query.root && req.query.root == 1) {
				var withProductsFlag = req.query.productsonly ? req.query.productsonly :0;
				var enabled_flag = req.query.enabled_only ? req.query.enabled_only :0;
				var sortby = "name";
				var sortorder = "ASC";
				
				CategoryController.getRootCategories(companyid, withProductsFlag, enabled_flag, sortby, sortorder, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else if (req.query.lineage) {
				let enabled_flag = req.query.enabled_only ? req.query.enabled_only :0;
				let products_only = req.query.productsonly ? req.query.productsonly : 0;
				CategoryController.findByLineage(req.query.lineage, companyid, enabled_only, products_only, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else if (req.query.product_id) {
				CategoryController.findByProductId(req.query.product_id, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else if (req.query.parent_id) {
				const pid = req.query.parent_id;
				if (pid) {
					const withProductsFlag = req.query.productsonly ? req.query.productsonly :0;
					const enabled_only = req.query.enabled_only ? req.query.enabled_only :0;
					const withStockFlag = req.query.with_stock_flag ? req.query.with_stock_flag :0;
					CategoryController.findByParentId(pid, companyid, enabled_only, withProductsFlag, withStockFlag, response.data.session, function(err, response) {
						if (err)
							return next(err);
						else
							return res.json(response);
					});
				}
			}
			else if (req.query.parent_code) {

				var pcode = req.query.parent_code;
				if (pcode) {
					CategoryController.getCategoryChildrenByParentCode(pcode, companyid, null, response.data.session, function(err, response) {
						if (err)
							return next(err);
						else
							return res.json(response);
					});		
		
				}

			}
			else {
				var sortby = (req.query.sortby ? req.query.sortby : "name");
				var sortorder = (req.query.sortorder ? req.query.sortorder :"ASC");

				CategoryController.findAll(companyid, sortby, sortorder, response.data.session, function(err, categories) {
					if (err)
						return next(err);
					else
						return res.json(categories);
				});
			}
		});
}

function updateCategory(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
			
		
		CategoryController.update (req.params.id, req.body.name, req.body.accounting_key, req.body.parent_id, response.data.session.company_id, req.body.is_enabled, req.body.is_hidden, req.body.image_url, response.data.session, function (err, response) {
			if (err)
				return next(err);
			else
				return res.json(response);
		});

	});

}

function createCategory (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		CategoryController.create (req.body.code, req.body.name, req.body.parent_id, response.data.session.company_id, req.body.is_hidden, req.body.image_url, response.data.session, function (err, response) {
			if (err)
				return next(err);
			else
				return res.json(response);
		});
		
	});

}

function shareCategory (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		share_list = [];
		async.eachSeries(req.body.entities, function iterator(entity, callback) {

			UserController.createShare(req.params.id, entity, Util.DocumentTypeEnum.Category, 21, response.data.session, function (err, response) {
				if (err)
					callback(err)
				else
				{
					share_list.push(response);
					callback(null)
				}
			});

		}, function(err){
			if (err) {
				return next(err);
			}
			else {
				return res.json(Util.setOKResponse(share_list, "Share"));
			}
		});			
	});

}

function deleteCategory (req, res, next) {

	// if leaf, check products available below.
	// if non leaf, check if categories are available below.
	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		if (req.params.id) {
			CategoryController.deleteById(req.params.id, response.data.session.company_id, response.data.session, function(err, response) {
				if (err)
					res.send(err);
				else
					res.json(response);
				});
		}
		else if (req.body.code) {
			CategoryController.deleteByCode(req.body.code, response.data.session.company_id, response.data.session, function(err, response) {
				if (err)
					res.send(err);
				else
					res.json(response);
				});
		}

	});
}


