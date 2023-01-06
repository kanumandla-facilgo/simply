const CategoryService    = require("../services/category");
const Category           = require("../bo/category");
const Util               = require("../utils");
const Err                = require("../bo/err");
const async              = require("async");
const mysql             = require("../utils/mysql");
var Event     = require("../bo/event");

var findAll            = function (companyid, sortby, sortorder, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CATEGORY_UPDATE] != "1")
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
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CategoryService.findAll(companyid, sortby, sortorder, session, connection, function (err, categories) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!categories)
			{
				mysql.closeConnection(connection);
				categories = [];
				var response = Util.setOKResponse(categories, "Category");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(categories, "Category"));
			}  

		});

    });

}

var findByCode = function (code, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CATEGORY_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(code) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Category code and Company ID are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CategoryService.findByCode(code, companyid, session, connection, function (err, category) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!category)
			{
				mysql.closeConnection(connection);
				return callback (err, Util.setErrorResponse(-100, "Category not found."));
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(category, "Category"));
			}  

		});

    });

}

var findById = function (id, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CATEGORY_UPDATE] != "1")
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
		err.message = "Category ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CategoryService.findById(id, companyid, session, connection, function (err, category) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!category)
			{
				mysql.closeConnection(connection);
				return callback (err, Util.setErrorResponse(-100, "Category not found."));
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(category, "Category"));
			}  

		});

    });

}

var findByLineage    = function (lineage, companyid, enabled_only, products_only, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CATEGORY_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(lineage)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Lineage is required field.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CategoryService.findByLineage(lineage, companyid, enabled_only, products_only, session, connection, function (err, categories) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!categories)
			{
				mysql.closeConnection(connection);
				categories = [];
				var response = Util.setOKResponse(categories, "Category");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(categories, "Category"));
			}  

		});

    });

}


var findByProductId    = function (productid, companyid, session, callback) {

	//TODO: check right permissions
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CategoryService.findByProductId(productid, companyid, session, connection, function (err, categories) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!categories)
			{
				mysql.closeConnection(connection);
				categories = [];
				var response = Util.setOKResponse(categories, "Category");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(categories, "Category"));
			}  

		});

    });

}

var getRootCategories = function (companyid, withProductsFlag, enabled_flag, sortby, sortorder, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CATEGORY_UPDATE] != "1")
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
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CategoryService.getRootCategories(companyid, withProductsFlag, enabled_flag, sortby, sortorder, session, connection, function(err, categories) {
			mysql.closeConnection(connection);

			if (err) {
				return callback(err);
			}
			else if (categories === null) {
				categories = [];
				var response = Util.setOKResponse(categories, "Category");
				return callback(err, response);
			}
			else  {
				var response = Util.setOKResponse(categories, "Category");
				return callback(err, response);
			}
		});
    });



}
/*
var getCategoryChildrenByParentCode = function (pcode, companyid, activeOnly, callback) {

	if (!pcode) {
		var response = Util.setErrorResponse(-101, "Parent category code is not provided.");
		return callback(err, response);
	}

	async.waterfall ([

		function (callback) {
		
			getCategoryByCode(pcode, companyid, function(err, category) {
				if (!category) {
					var response = Util.setErrorResponse(-100, "Parent category code doesn't exist.");
					return callback(err, response);
				}
				else
					callback(null, category.id);
			});
		},

		function (pid, callback) {
		
			CategoryService.getChildrenByParentId(pid, companyid, activeOnly, function(err, categories) {
				if (err)
					callback(err);
				else if (categories === null) {
					categories = [];
					var response = Util.setOKResponse(categories, "Category");
					callback(err, response);
				}
				else  {
					var response = Util.setOKResponse(categories, "Category");
					callback(null, response);
				}
			});

		}
	], function (err, result) {
		return callback(err, result);
	});
}
*/
var findByParentId = function (pid, companyid, activeOnly, withProductsFlag, withStockFlag, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CATEGORY_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(pid) || Util.isEmptyString(companyid) ) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Parent ID & Company ID are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		CategoryService.findByParentId(pid, companyid, activeOnly, withProductsFlag, withStockFlag, session, connection, function(err, categories) {
			mysql.closeConnection(connection);
			if (err) {
				return callback(err);
			}
			else if (categories === null) {
				categories = [];
				var response = Util.setOKResponse(categories, "Category");
				return callback(err, response);
			}
			else  {
				var response = Util.setOKResponse(categories, "Category");
				return callback(err, response);
			}
		});
			
	});
}

var update = function (id, name, accounting_key, parentid, companyid, isenabled, ishidden, imageurl, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(name) || Util.isEmptyString(isenabled) ||
	    Util.isEmptyString(ishidden)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Category ID, name are required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback(err);

		CategoryService.findById(id, companyid, session, connection, function (err, category) {

			if (err || !category) {
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Category doesn't exist.");
				return callback(err, response);
			}

			category.name       = Util.getValue(name, "");
			if(accounting_key)
				category.accounting_key = accounting_key;
			category.parent_id  = parentid;
			category.is_enabled = isenabled;
			category.image_url  = Util.getValue(imageurl, "");
			category.is_hidden  = (ishidden ? ishidden : false);

			connection.beginTransaction(function () {

				CategoryService.update(category, session, connection, function (err, category) {
					if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback(err);
						});
					}
					else if (category === null) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Category is not updated.");
							return callback(err, response);
						});
					}
					else {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setOKResponse(category, "Category");
							return callback(err, response);
						});
					}
				});
				
			});
	
		});
	
	});

}

var create = function (code, name, parentid, companyid, ishidden, imageurl, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if ( (Util.isEmptyString(code) && session.configurationlist[Util.CONST_CONFIG_COMPANY_CATEGORY_CODE_REQD] == "1") || Util.isEmptyString(name) ||
	    Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Category code, name are required field.";
		return callback(err);

	}

	var category = new Category();

	category.name       = name;
	category.parent_id  = parentid;
	category.is_enabled = 1;
	category.code       = code;
	category.company_id = companyid;
	category.image_url  = Util.getValue(imageurl, "");
	category.is_hidden  = (ishidden ? ishidden : false);

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback(err);

		connection.beginTransaction(function () {

			CategoryService.create(category, session, connection, function (err, category) {
				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err);
					});
				}
				else if (category === null) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Category can't be created.");
						return callback(err, response);
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setOKResponse(category, "Category");
						return callback(err, response);
					});
				}
			});
		});
	});
}

var deleteById = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CATEGORY_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Category ID and Company ID are required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback(err);

		connection.beginTransaction(function () {

			CategoryService.deleteById (id, companyid, session, connection, function (err, status) {
				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err);
					});
				}
				else if (status === null) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Category can't be deleted.");
						return callback(err, response);
					});
				}
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setOKResponse(null, "");
						return callback(err, response);
					});
				}
			});
		});
	});
}
/*
var deleteByCode = function (code, companyid, callback) {
	CategoryService.deleteByCode (code, companyid, function (err, status) {
		if (err)
			return callback(err);
		else if (status === null) {
			var response = Util.setErrorResponse(-100, "Category can't be deleted.");
			return callback(err, response);
		}
		else {
			var response = Util.setOKResponse(null, "");
			return callback(err, response);
		}
	});
}
*/
module.exports = {

	findAll                         : findAll,
	findById                        : findById,
	findByLineage                   : findByLineage,
	findByCode                      : findByCode,
	findByParentId                  : findByParentId,
	findByProductId                 : findByProductId,
	getRootCategories               : getRootCategories,
	update                          : update,
	create                          : create,
	deleteById                      : deleteById,

}
//	getCategoryChildrenByParentCode : getCategoryChildrenByParentCode,
//	deleteByCode                    : deleteByCode
