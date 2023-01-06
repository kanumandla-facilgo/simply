var Map            = require("../utils/map");
var Err            = require("../bo/err");
var ProductService = require("./product");
var Util           = require("../utils");
var async          = require("async");

exports.findById = function (id, companyid, session, connection, callback) {

	var cmd =  "SELECT * FROM categories c WHERE c.id = ? AND companies_id = ?";
	
	if(companyid == 1 && session.sessiontype == Util.SessionTypesEnum.API)
		cmd =  "SELECT * FROM categories c WHERE c.id = ?";

	connection.query(cmd, [
							id, companyid
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows.length > 0)
								return callback(null, Map.mapToBCategory(rows[0]));
							else
								return callback(null, null);
						}
	);
};

exports.findByCode = function (code, companyid, session, connection, callback) {

	var cmd = "SELECT * FROM categories c WHERE c.code = ? AND companies_id = ?";

	connection.query(cmd, [
							code.toLowerCase(), companyid
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows.length > 0)
								return callback(null, Map.mapToBCategory(rows[0]));
							else
								return callback(null, null);
						}
	);

};

exports.findAll = function (companyid, sortby, sortorder, session, connection, callback) {

	// we don't need ROOT category. We need custom categories
	var cmd = "SELECT * FROM categories WHERE companies_id = ? and is_root = 0 ORDER BY " + sortby + " " + sortorder;

	connection.query(cmd, [
							companyid
						], function (err, rows) {

							if (err) return callback (err);

							var categoryList = [];
							if (rows) {
								for (i=0; i < rows.length; i++) {
									categoryList.push (Map.mapToBCategory(rows[i]));
								}
							}
							return callback(null, categoryList);
						}
	);

};

exports.getRootCategories = function (companyid, withProductsFlag, activeOnly, sortby, sortorder, session, connection, callback) {

	var sql_products_only = "AND ( 0 < (select count(*) from products p inner join categories c on p.categories_id = c.id where concat(c.lineage,c.id,'|') like concat(categories.lineage,categories.id,'|','%') " + (activeOnly == 1 ? " AND p.statuses_id = 4600 " : "") + "))";

	var cmd = "SELECT * FROM categories WHERE companies_id = ? AND parent_id = (SELECT id FROM categories WHERE companies_id = ? AND is_root = 1) ";

	if (activeOnly == 1) 
		cmd = cmd + " AND is_hidden = 0 ";

	if( withProductsFlag)
		cmd = cmd + sql_products_only;

	if(sortby == "")
		cmd = cmd + " ORDER BY is_hidden, name";
	else
		cmd = cmd + " ORDER BY " + sortby;

	if(sortorder != "")
		cmd = cmd + " " + sortorder;

	connection.query(cmd, [
							companyid, companyid
						], function (err, rows) {

							if (err) return callback (err);

							var categoryList = [];
							if (rows) {
								for (i=0; i < rows.length; i++) {
									categoryList.push (Map.mapToBCategory(rows[i]));
								}
							}
							return callback(null, categoryList);
						}
	);

};

exports.findByParentId = function (id, companyid, activeOnly, withProductsFlag, withStockFlag, session, connection,  callback) {

	activeOnly = activeOnly || -1;

	var cmd2 = '';

	var sql_products_only = "AND ( 0 < (select count(*) from products p inner join categories c on p.categories_id = c.id where concat(c.lineage,c.id,'|') like concat(categories.lineage,categories.id,'|','%')  " + (activeOnly == 1 ? " AND p.statuses_id = 4600 " : "") + " ))";

	var cmd = "SELECT * FROM categories WHERE companies_id = ? AND parent_id = ? ";

	if (activeOnly == 1)
		cmd2 = ' AND is_hidden = 0 ';

	if( withProductsFlag)
		cmd = cmd + sql_products_only;

	if (cmd2 != '')
		cmd = cmd + cmd2;

	cmd = cmd + " ORDER BY is_hidden, name";

	connection.query(cmd, [
							companyid, id
						], function (err, rows) {

							if (err) return callback (err);

							var categoryList = [];
							if (rows) {
								for (i=0; i < rows.length; i++) {
									categoryList.push (Map.mapToBCategory(rows[i]));
								}
							}
							return callback(null, categoryList);
						}
	);

};

exports.findByLineage = function (lineage, companyid, enabled_only, products_only, session, connection, callback) {

	let cmd;
	let parameterList;

	if (lineage != "" && lineage != "*") {
		cmd = "SELECT * FROM categories c WHERE c.companies_id = ? AND c.lineage LIKE CONCAT('%|', ?, '|%') ";
		parameterList = [
							companyid, lineage
						];
	}
	else {
		cmd = "SELECT c.* FROM categories c, categories p WHERE c.companies_id = ? AND c.companies_id = p.companies_id AND p.is_root = 1 AND c.lineage LIKE CONCAT('%|', p.id, '|%') ";
		parameterList = [
					companyid
				];

	} 

	if (enabled_only == 1)
		cmd = cmd + " AND c.is_hidden = 0 ";

	if (products_only = 1) 
		cmd = cmd + " AND c.children_count > 0 ";

	cmd = cmd + "ORDER BY length(c.lineage) - length(replace(c.lineage, '|', ''))";

	connection.query(cmd, parameterList, function (err, rows) {

							if (err) return callback (err);

							var categoryList = [];
							if (rows) {
								for (i=0; i < rows.length; i++) {
									categoryList.push (Map.mapToBCategory(rows[i]));
								}
							}
							return callback(null, categoryList);
						}
	);

};

exports.findByProductId = function (productid, companyid, session, connection, callback) {

	var cmd = "SELECT c.* FROM product_categories pc, categories c WHERE pc.products_id = ? AND pc.categories_id = c.id AND EXISTS (SELECT 1 FROM products p WHERE p.id = pc.products_id AND p.companies_id = ?) ORDER BY c.is_hidden, c.name";

	connection.query(cmd, [
							productid, companyid
						], function (err, rows) {

							if (err) return callback (err);

							var categoryList = [];
							if (rows) {
								for (i=0; i < rows.length; i++) {
									categoryList.push (Map.mapToBCategory(rows[i]));
								}
							}
							return callback(null, categoryList);
						}
	);

};

exports.incrementChild = function (id, companyid, leafUpdateFlag, connection, callback) {

	var str = " ";
	if (leafUpdateFlag)
		str = ", is_leaf = 0 ";
		
	connection.query("UPDATE categories SET children_count = children_count + 1, last_updated = NOW()" + str + "WHERE id = ?", 
						[
							id
						], function (err, row) {

							if (err) return callback (err);
							
							if (row && row.affectedRows == 1) {
								return callback(null, true);
							}
							else 
								return callback(new Err(-200, "Increment failed."));

						}
	);

};


exports.decrementChild = function (id, leafUpdateFlag, callback) {
	var str = " ";
	if (leafUpdateFlag)
		str = ", is_leaf = 0 ";
		
	connection.query("UPDATE categories SET children_count = children_count - 1, last_updated = NOW()" + str + "WHERE id = ?", 
						[
							id
						], function (err, row) {

							if (err) return callback (err);
							
							if (row && row.affectedRows == 1) {
								return callback(null, true);
							}
							else 
								return callback(new Err(-200, "Increment failed."));

						}
	);

};

exports.update = function (vxCategory, session, connection, callback) {

	var name  = vxCategory.name;
	var pcode = vxCategory.parent_id;
	var ccode = vxCategory.company_id;

	if (!vxCategory.id || !name || !ccode || !pcode) {
		var err = new Err();
		err.code    = "-250";
		err.message = "Invalid input data.";
		return callback(err);
	}

	var companyid = vxCategory.company_id;

	var cmd = "CALL spUpdateCategory(@err,@msg,?,?,?,?,?,?,?,?)";
	connection.query(cmd, [
							companyid, vxCategory.id, vxCategory.code, vxCategory.name, vxCategory.accounting_key, vxCategory.parent_id, vxCategory.image_url, vxCategory.is_hidden
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
								if (rows && rows[0] && rows[0].err === 0) {
									return callback(null, vxCategory);
								}
								else {
									err = new Err();
									err.code    = rows[0].err;
									err.message = rows[0].msg;
									return callback(err, null);
								}
							});
						}
	);

};

exports.create =  function (vxCategory, session, connection, callback) {

	var code  = (vxCategory.code || "").toLowerCase();
	var name  = vxCategory.name;
	var pcode = vxCategory.parent_id;
	var ccode = vxCategory.company_id;

	var pcid;  // parent category id
	var parentcat = null;
	
	if (pcode === "" || !pcode)
		pcode = -1;
       	 
	var companyid = vxCategory.company_id;

	var cmd = "CALL spCreateCategory(@err,@msg,@id,?,?,?,?,?,?)";

	connection.query(cmd, [
							companyid, code, name, pcode, Util.getValue(vxCategory.image_url, ""), vxCategory.is_hidden
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
								if (rows && rows[0] && rows[0].err === 0) {
									vxCategory.id = rows[0].id;
									return callback(null, vxCategory);
								}
								else {
									err = new Err();
									err.code    = rows[0].err;
									err.message = rows[0].msg;
									return callback(err, null);
								}
							});
						}
	);

};

exports.deleteById = function (id, companyid, session, connection, callback) {

	var cmd = "CALL spDeleteCategory(@err,@msg,?,?)";

	connection.query(cmd, 
						[
							companyid, id
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
								if (rows && rows[0] && rows[0].err === 0) {
									return callback(null, true);
								}
								else {
									err = new Err();
									err.code    = rows[0].err;
									err.message = rows[0].msg;
									return callback(err, null);
								}
							});
						}
	);

};

/*
module.exports = {
 findById              : exports.findById,
 findByCode            : exports.findByCode,
 findAll               : exports.findAll,
 findByLineage         : exports.findByLineage,
 create                : exports.create,
 update                : exports.update,
 deleteById            : exports.deleteById,
 findByParentId        : exports.findByParentId
}
*/
