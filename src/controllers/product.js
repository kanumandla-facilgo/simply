var ProductService    = require("../services/product");
var Util              = require("../utils");
var Product           = require("../bo/product");
var Err               = require("../bo/err");
var mysql             = require("../utils/mysql");

var findProductAllUOM = function (productid, companyid, customerid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5002";
		err.message = "Product ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		ProductService.findProductAllUOM(companyid, productid, customerid, session, connection, function (err, uomlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!uomlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "UOM List not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(uomlist, "UOM"));
			}  
       });
    });
 
};

var findStockSummary = function (companyid, options, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5002";
		err.message = "Product ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		ProductService.findStockSummary(companyid, options, session, connection, function (err, stockbucketlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!stockbucketlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Stock not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(stockbucketlist, "StockBucket"));
			}  
       });
    });
 
};

var printStockSummary = function (companyid, options, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company is a required field.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		ProductService.printStockSummary(companyid, options, session, connection, function (err, stream) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!stream)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Stock not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(null, stream); 
			}

		});

    });

};

var findStockJournal = function (companyid, id, productid, sync_status_id, from, to, datetype, currentpagenumber, recordsperpage, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		ProductService.findStockJournal(companyid, id, productid, sync_status_id, from, to, datetype, currentpagenumber, recordsperpage, session, connection, function (err, stockjournallist, balance) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!stockjournallist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Stock Journal not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				let object = {};
				object["balance"] = balance;
				object["stockjournallist"] = stockjournallist;
				return callback(err, Util.setOKResponse(object, "StockJournal"));
			}
       });
    });
 
};

var findStockBucketById = function (id, companyid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5002";
		err.message = "ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		ProductService.findStockBucketById(id, companyid, session, connection, function (err, stockbucket) {
			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!stockbucket)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Stock Bucket not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(stockbucket, "StockBucket"));
			}  
       });

    });

};

var findAllStockBuckets = function (companyid, productid, issystem, activeonly, searchtext, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(productid)) {

		var err     = new Err();
		err.code    = "-5002";
		err.message = "Product ID (or) other ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		ProductService.findAllStockBuckets(companyid, productid, issystem, activeonly, searchtext, session, connection, function (err, stockbuckets) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!stockbuckets)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Stock Bucket not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(stockbuckets, "StockBucket"));
			}  
       });
    });
 
};

var findStockBucketById = function (id, companyid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5002";
		err.message = "ID is required field.";
		return callback(err);

	}
	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		ProductService.findStockBucketById(id, companyid, session, connection, function (err, stockbucket) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!stockbucket)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Stock bucket not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(stockbucket, "StockBucket"));
			}  
       });
    });
 
};

var findAllPriceGroups = function (companyid, sortby, sortdirection, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRICEGROUP_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRICEGROUP_UPDATE] != "1")
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

		ProductService.findAllPriceGroups(companyid, Util.CONST_PRICING_PRODUCT_PRICEGROUP, sortby, sortdirection, session, connection, function (err, pricegroups) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!pricegroups)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Price group not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(pricegroups, "PriceGroup"));
			}  
       });
    });
 
};

var findPriceGroupById = function (id, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRICEGROUP_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRICEGROUP_UPDATE] != "1")
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

		ProductService.findPriceGroupById(id, companyid, null, session, connection, function (err, pricegroup) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!pricegroup)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Price group not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(pricegroup, "PriceGroup"));
			}  

		});

    });
 
};

var findById = function (id, companyid, session) {

	return new Promise((resolve, reject) => {

		if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

				var err     = new Err();
				err.code    = "-5001";
				err.message = "ID is a required field.";
				return reject(err);
			}
			
			mysql.openConnection (function (err, connection) {
				
				if (err) return callback (err);

				ProductService.findById(id, companyid, session, connection, function (err, product) {

					if (err) {
						mysql.closeConnection(connection);
						return reject(err);
					}
					else if (!product)
					{
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Product not found."); //new Status();
						return reject(response);
					} 
					else {
						mysql.closeConnection(connection);
						resolve(Util.setOKResponse(product, "Product"));
					}  
				});
		    });
	});
};

var findByCode = function (code, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
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
		err.message = "SKU is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		ProductService.findByCode(code, companyid, 0, session, connection, function (err, product) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!product)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Product not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(product, "Product"));
			}  

		});

    });
    
};

var findByInternalCode = function (code, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
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
		err.message = "Internal SKU is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		ProductService.findByCode(code, companyid, 1, session, connection, function (err, product) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!product)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Product not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(product, "Product"));
			}  

		});

    });
    
};

var findByCategoryId = function (id, companyid, options, customerid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
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
		err.message = "Category ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		ProductService.findByCategoryId(id, companyid, options, customerid, session, connection, function (err, products) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!products)
			{
				products = [];
				mysql.closeConnection(connection);
				var response = Util.setOKResponse(products, "Product");
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(products, "Product"));
			}  

		});

    });
    
};

var findByConfigCode = function (configcode, companyid, isEnabledOnly, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(configcode) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Config code is a required field.";
		return callback(err);

	}

	if (!isEnabledOnly)
		isEnabledOnly = undefined;
	else if (isEnabledOnly != "1")
		isEnabledOnly = undefined;

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		ProductService.findByConfigCode(configcode, companyid, isEnabledOnly, session, connection, function (err, products) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!products)
			{
				products = [];
				mysql.closeConnection(connection);
				var response = Util.setOKResponse(products, "Product");
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(products, "Product"));
			}  

		});

    });

};

var findAll = function (companyid, searchText, options, customerid, pricegroupid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
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
/*
	if (!isEnabledOnly)
		isEnabledOnly = 0;
	else if (isEnabledOnly != "1")
		isEnabledOnly = 0;
*/
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		ProductService.findAll(companyid, searchText, options, customerid, pricegroupid, session, connection, function (err, products) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!products)
			{
				products = [];
				mysql.closeConnection(connection);
				var response = Util.setOKResponse(products, "Product");
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(products, "Product"));
			}  

		});

    });

};
/*
var create = function (companyid, name, sku, internalsku, description, unitprice, categoryid,
						stock, onorder, reorder, packageqty, uomid, ishidden,
						width, length, height, weight, isfamilyhead, color,
					  imageurl1, imageurl2, imageurl3, imageurl4, imageurl5, callback) {

	var xProduct        		= new Product();

	xProduct.company_id 		= companyid;
	xProduct.name       		= name;
	xProduct.sku        		= sku;
	xProduct.sku_internal       = internalsku;
	xProduct.description 		= description;
	xProduct.unit_price  		= unitprice;
	xProduct.category_id 		= categoryid;

	xProduct.quantity.stock     = stock;
	xProduct.quantity.onorder   = stock;
	xProduct.quantity.reorder   = stock;
	xProduct.quantity.packageqty= stock;

	xProduct.uom_id         	= uomid;
	xProduct.is_hidden          = ishidden;

	xProduct.dimension.width    = width;
	xProduct.dimension.height   = height;
	xProduct.dimension.length   = length;
	xProduct.dimension.weight   = weight;
	xProduct.is_family_head     = isfamilyhead;
	xProduct.color              = color;

	xProduct.image_url1  		= imageurl1;
	xProduct.image_url2  		= imageurl2;
	xProduct.image_url3  		= imageurl3;
	xProduct.image_url4  		= imageurl4;
	xProduct.image_url5  		= imageurl5;

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
	
			ProductService.create(xProduct, connection, function (err, product) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (product == null) {
					var response = Util.setErrorResponse(-100, "Product not found."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(product, "Product");
						return callback(err, response);

					});

				}

			});
		});
	});
				
}
*/

var createStock = function (companyid, xStockJournal, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied. You need Product create or update permission.";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
	
			ProductService.createStock(companyid, xStockJournal, session, connection, function (err, xStockJournal) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (xStockJournal == null) {
					var response = Util.setErrorResponse(-100, "Stock Journal not created."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(xStockJournal, "StockJournal");
						return callback(err, response);

					});

				}

			});
		});
	});

};


var updateStockJournalSyncStatus = function (companyid, id, sync_status_id, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied. You need Product create or update permission.";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
	
			ProductService.updateStockJournalSyncStatus(companyid, id, sync_status_id, session, connection, function (err, id) {

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

						var response = Util.setOKResponse(id, "Stock");
						return callback(err, response);

					});

				}

			});
		});
	});

};

var updateStockBucket = function (companyid, id, xStockJournal, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied. You need Product create or update permission.";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
	
			ProductService.updateStockBucket(companyid, id, xStockJournal, session, connection, function (err, xStockJournal) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (xStockJournal == null) {
					var response = Util.setErrorResponse(-100, "Stock Journal not created."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(xStockJournal, "StockJournal");
						return callback(err, response);

					});

				}

			});
		});
	});

};

var deleteStockBucket = function (companyid, id, xStockJournal, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied. You need Product create or update permission.";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {

			ProductService.deleteStockBucket(companyid, id, xStockJournal, session, connection, function (err, xStockJournal) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (xStockJournal == null) {
					var response = Util.setErrorResponse(-100, "Stock Journal not deleted."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(xStockJournal, "StockJournal");
						return callback(err, response);

					});

				}

			});
		});
	});

};

var createPriceGroup = function (companyid, xPriceGroup, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRICEGROUP_CREATE] != "1")
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

	if (!xPriceGroup.pricelistlist || !Util.isArray(xPriceGroup.pricelistlist))
		xPriceGroup.pricelistlist = [];
		
//	xPriceGroup.pricelistlist   = Util.initObjectIfNotExist(xPriceGroup.pricelistlist, "PriceList");

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
	
			ProductService.createPriceGroup(companyid, xPriceGroup, session, connection, function (err, xPriceGroup) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (xPriceGroup == null) {
					var response = Util.setErrorResponse(-100, "Price group not created."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(xPriceGroup, "PriceGroup");
						return callback(err, response);

					});

				}

			});
		});
	});

};

var updatePriceGroup = function (companyid, xPriceGroup, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRICEGROUP_UPDATE] != "1")
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

	if (!xPriceGroup.pricelistlist || !Util.isArray(xPriceGroup.pricelistlist))
		xPriceGroup.pricelistlist = [];
		
	mysql.openConnection (function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {

			ProductService.updatePriceGroup(companyid, xPriceGroup, session, connection, function (err, xPriceGroup) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (xPriceGroup == null) {
					var response = Util.setErrorResponse(-100, "Price group not created."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(xPriceGroup, "PriceGroup");
						return callback(err, response);

					});

				}

			});
		});
	});

};

var create = function (companyid, product, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	var xProduct        		= new Product();

	xProduct.company_id 		= companyid;

	xProduct.name       		= product.name;
	xProduct.sku        		= product.sku;
	xProduct.sku_internal       = product.sku_internal;
	xProduct.description 		= product.description;
	xProduct.unit_price  		= product.unit_price;
	xProduct.category_id 		= product.category_id;

	xProduct.quantity           = Util.initObjectIfNotExist(product.quantity, "Quantity");
	xProduct.dimension          = Util.initObjectIfNotExist(product.dimension, "Dimension");
	xProduct.pricegroup         = Util.initObjectIfNotExist(product.pricegroup, "PriceGroup");
	xProduct.hsn                = Util.initObjectIfNotExist(product.hsn, "Hsn");

	xProduct.quantity.stock     = (product.quantity && product.quantity.stock ? product.quantity.stock : 0);
	xProduct.quantity.onorder   = (product.quantity && product.quantity.onorder ? product.quantity.onorder : 0);
	xProduct.quantity.reorder   = (product.quantity && product.quantity.reorder ? product.quantity.reorder : 0);
	xProduct.quantity.packageqty= (product.quantity && product.quantity.packageqty ? product.quantity.packageqty : 0);

	xProduct.uom_id         	= product.uom_id;
	xProduct.is_hidden          = product.is_hidden;
	xProduct.is_hidden_no_stock = product.is_hidden_no_stock;

	xProduct.dimension.width    = (product.dimension && product.dimension.width  ? product.dimension.width  : 0);
	xProduct.dimension.height   = (product.dimension && product.dimension.height ? product.dimension.height : 0);
	xProduct.dimension.length   = (product.dimension && product.dimension.length ? product.dimension.length : 0);
	xProduct.dimension.weight   = (product.dimension && product.dimension.weight ? product.dimension.weight : 0);
	xProduct.is_family_head     = product.is_family_head;
	xProduct.color              = product.color;
	
	xProduct.product_type_id    = product.product_type_id;

	xProduct.image_url1  		= product.image_url1;
	xProduct.image_url2  		= product.image_url2;
	xProduct.image_url3  		= product.image_url3;
	xProduct.image_url4  		= product.image_url4;
	xProduct.image_url5  		= product.image_url5;
	xProduct.price_level_id     = product.price_level_id;
	
	xProduct.default_qty_uom    = product.default_qty_uom;
	xProduct.default_sell_qty   = product.default_sell_qty;
	xProduct.is_taxable         = 1; //product.is_taxable;
	xProduct.is_qty_uom_restricted = product.is_qty_uom_restricted;
	xProduct.is_quote_uom_restricted = product.is_quote_uom_restricted;
	
	xProduct.is_batched_inventory = product.is_batched_inventory;

	xProduct.image_list         = product.image_list;

	if (Util.isEmptyString(xProduct.name) || (Util.isEmptyString(xProduct.sku)  && session.configurationlist[Util.CONST_CONFIG_COMPANY_PRODUCT_CODE_REQD] == "1") || Util.isEmptyString(xProduct.category_id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Product SKU, name are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
	
			ProductService.create(xProduct, session, connection, function (err, product) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (product == null) {
					var response = Util.setErrorResponse(-100, "Product not found."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(product, "Product");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var update = function (companyid, product, linkedwith, session, callback) {
/*
var update = function (companyid, id, name, sku, internalsku, description, unitprice,
						stock, onorder, reorder, packageqty, uomid, pricelevelid, pricegroup, ishidden, statusid,
						width, length, height, weight, linkedwith, color,
					  imageurl1, imageurl2, imageurl3, imageurl4, imageurl5, isbatchedinventory, istaxable, taxslabid, session, callback) {
*/
	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	product.quantity           = Util.initObjectIfNotExist(product.quantity, "Quantity");
	product.dimension          = Util.initObjectIfNotExist(product.dimension, "Dimension");
	product.pricegroup         = Util.initObjectIfNotExist(product.pricegroup, "PriceGroup");
	product.hsn                = Util.initObjectIfNotExist(product.hsn, "Hsn");

	var xProduct               = product;
/*
	var xProduct        		= new Product();

	xProduct.id                 = id;
	xProduct.company_id 		= companyid;
	xProduct.name       		= name;
	xProduct.sku        		= sku;
	xProduct.sku_internal       = internalsku;
	xProduct.description 		= description;
	xProduct.unit_price  		= unitprice;

	xProduct.quantity           = Util.initObjectIfNotExist(xProduct.quantity, "Quantity");
	xProduct.dimension          = Util.initObjectIfNotExist(xProduct.dimension, "Dimension");
	xProduct.pricegroup         = Util.initObjectIfNotExist(pricegroup, "PriceGroup");
	
	xProduct.is_taxable         = istaxable;

	xProduct.quantity.stock     = stock;
	xProduct.quantity.onorder   = onorder;
	xProduct.quantity.reorder   = reorder;
	xProduct.quantity.packageqty= packageqty;

	xProduct.uom_id         	= uomid;
	xProduct.is_hidden          = ishidden;
	
	xProduct.status_id          = statusid;
	
	xProduct.dimension.width    = width;
	xProduct.dimension.height   = height;
	xProduct.dimension.length   = length;
	xProduct.dimension.weight   = weight;

	xProduct.color              = color;

	xProduct.image_url1  		= imageurl1;
	xProduct.image_url2  		= imageurl2;
	xProduct.image_url3  		= imageurl3;
	xProduct.image_url4  		= imageurl4;
	xProduct.image_url5  		= imageurl5;
	
	xProduct.is_batched_inventory = isbatchedinventory;

	xProduct.price_level_id     = pricelevelid;
*/
	
	if (Util.isEmptyString(xProduct.name) || Util.isEmptyString(xProduct.sku) || Util.isEmptyString(xProduct.sku_internal)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Product SKU, name are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {

		if (err) return callback (err);
	
		connection.beginTransaction(function () {
	
			ProductService.update(xProduct, linkedwith, session, connection, function (err, product) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (product == null) {
					var response = Util.setErrorResponse(-100, "Product not found."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(product, "Product");
						return callback(err, response);

					});

				}

			});
		});
	});	
};

var deletePriceGroupById = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRICEGROUP_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Price Group ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		connection.beginTransaction(function () {

			ProductService.deletePriceGroupById(id, companyid, session, connection, function (err, status) {

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
						return callback (err, Util.setErrorResponse(-100, "Price Group can't be deleted."));
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

var deleteById = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Product ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		connection.beginTransaction(function () {

			ProductService.deleteById(id, companyid, session, connection, function (err, status) {

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
						return callback (err, Util.setErrorResponse(-100, "Product can't be deleted."));
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
/*
var getByCompanyCode = function (code, session, callback) {

	//TODO: validation of code

	CompanyService.findByCode(code, function (err, company) {

		if (err)
			return callback(err);

		else if (company === null)
			return callback(err, company);
			
		else {

			findByCompanyId(company.companyid, session, function(err, products) {
	
				return callback(err, products);

			});
		
		}
			
	});
}
*/

var delinkProductFamily = function (masterid, companyid, productid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(masterid) || Util.isEmptyString(productid) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Product ID & Kit/Set ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		connection.beginTransaction(function () {

			ProductService.delinkProductFamily(masterid, companyid, productid, session, connection, function (err, status) {

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
						return callback (err, Util.setErrorResponse(-100, "Product not found."));
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

var delinkCategory = function (id, companyid, categoryid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Product ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		connection.beginTransaction(function () {

			ProductService.delinkCategory(id, companyid, categoryid, session, connection, function (err, status) {

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
						return callback (err, Util.setErrorResponse(-100, "Product not found."));
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

var linkCategory = function (id, companyid, categoryid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Product ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		connection.beginTransaction(function () {

			ProductService.linkCategory(id, companyid, categoryid, session, connection, function (err, status) {

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
						return callback (err, Util.setErrorResponse(-100, "Product not found."));
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
/*
var findPriceListByProductId = function (productid, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(productid) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Product ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);


		ProductService.findPriceListByProductId(productid, companyid, session, connection, function (err, pricelist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!pricelist)
			{
				mysql.closeConnection(connection);
				return callback (err, Util.setErrorResponse(-100, "Price List not found."));
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(pricelist, "PriceList"));
			}

		});

    });

};

var findPriceListByGroupId = function (groupid, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(groupid) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Product ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);


		ProductService.findPriceListByGroupId(groupid, companyid, session, connection, function (err, pricelist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!pricelist)
			{
				mysql.closeConnection(connection);
				return callback (err, Util.setErrorResponse(-100, "Price List not found."));
			}
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(pricelist, "PriceList"));
			}
		});

    });

};
*/
module.exports = {
	findByCategoryId         : findByCategoryId,
	findAll                  : findAll,
	findByCode               : findByCode,
	findById 				 : findById,
	findByConfigCode         : findByConfigCode,
	deleteById               : deleteById,
	deletePriceGroupById     : deletePriceGroupById,
	create                   : create,
	update                   : update,
	createPriceGroup         : createPriceGroup,
	updatePriceGroup         : updatePriceGroup,
	linkCategory             : linkCategory,
	delinkCategory           : delinkCategory,
	delinkProductFamily      : delinkProductFamily,
	findAllPriceGroups       : findAllPriceGroups,
	findPriceGroupById       : findPriceGroupById,
	findProductAllUOM        : findProductAllUOM,
	createStock              : createStock,
	findAllStockBuckets      : findAllStockBuckets,
	findStockBucketById      : findStockBucketById,
	findStockJournal         : findStockJournal,
	findStockSummary         : findStockSummary,
	printStockSummary        : printStockSummary,
	updateStockBucket        : updateStockBucket,
	updateStockJournalSyncStatus	 : updateStockJournalSyncStatus
};

//	findPriceListByGroupId   : findPriceListByGroupId,
//	findPriceListByProductId : findPriceListByProductId,
