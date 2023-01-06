var Map       = require("../utils/map");
var Err       = require("../bo/err");
var Util      = require("../utils");
let moment          = require("moment-timezone");
var async     = require("async");
var CompanyService  = require("./company");

var findAddressById = function (id, companyid, session, connection, callback) {

	connection.query("SELECT a.* FROM addresses a WHERE a.companies_id = ? AND a.id = ?", [
							companyid, id
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows.length > 0) {
								return callback (err, Map.mapToBAddress(rows[0]));
							}
							else {
								err = new Err();
								if (rows && rows[0]) {
									err.code    = rows[0].err;
									err.message = rows[0].msg;
								}
								else {
									err.code    = "-101";
									err.message = "Unknown Error";
								}
								return callback(err, null);
							}

						}
	);
};

var findUnitConversions = function (companyid, baseuomid, fromid, toid, session, connection, callback) {

//	var query = "SELECT c.* FROM unit_conversion_details c WHERE c.unit_of_measures_id = ? AND c.from_uom_id = ? AND c.to_uom_id = ?";
	var query = "SELECT c.*, f.name as from_uom_name, f.short_name as from_uom_short_name, t.name as to_uom_name, t.short_name as to_uom_short_name FROM unit_conversion_details c INNER JOIN unit_of_measures f ON f.id = c.from_uom_id INNER JOIN unit_of_measures t ON t.id = c.to_uom_id WHERE c.unit_of_measures_id = ? AND c.from_uom_id = ? AND c.to_uom_id = ?";

	connection.query(query, [
							baseuomid, fromid, toid
						], function (err, rows) {

							if (err) return callback (err);

							if (rows.length > 0) {
								return callback (err, Map.mapToBUOMConversion(rows[0]));
							}
							else
								return callback(null, null);

						}
	);

};

var findAllUnitOfMeasures = function (companyid, options, session, connection, callback) {

	var query = "SELECT u.* FROM unit_of_measures u WHERE u.companies_id = ?";
	
	if (options && options.activeonly == 1) {
		query = query + " AND display_flag = 1";
	}

	connection.query(query, [
							companyid
						], function (err, rows) {

							if (err) return callback (err);

							var uomList = [];
	
							if (rows) {
								for (i = 0; i < rows.length; i++) {
									uomList.push (Map.mapToBUnitOfMeasure(rows[i]));
								}
							}

							return callback(null, uomList);

						}
	);

};

var findUnitOfMeasureById = function (id, companyid, session, connection, callback) {

	connection.query("SELECT u.* FROM unit_of_measures u WHERE u.companies_id = ? AND u.id = ?", [
							companyid, id
						], function (err, rows) {

							if (err) return callback (err);

							var uomList = [];
	
							if (rows && rows.length > 0) {
								var uom = Map.mapToBUnitOfMeasure(rows[0]);
								uom.conversion_list = [];

								var query = "SELECT c.*, f.name as from_uom_name, f.short_name as from_uom_short_name, t.name as to_uom_name, t.short_name as to_uom_short_name, f.end_uom_id FROM unit_conversions c INNER JOIN unit_of_measures f ON f.id = c.from_uom_id INNER JOIN unit_of_measures t ON t.id = c.to_uom_id WHERE c.unit_of_measures_id = ?";
//								connection.query("SELECT * FROM unit_conversions c WHERE unit_of_measures_id = ?", [
								connection.query(query, [
								rows[0].id], 
									function (err, rows) {

										if (err) return callback (err);
									
										if (rows) {
											for (i=0; i < rows.length; i++) {
												uom.conversion_list.push(Map.mapToBUOMConversion(rows[i]));
											}
											return callback (err, uom);
										}
										else
											return callback(null, null);

									}
								);
							}
							else
								return callback(null, null);

						}
	);
};

var createUnitOfMeasure = function (uom, companyid, session, connection, callback) {

	cmd = "INSERT INTO unit_of_measures (name, description, short_name, base_id, conversion_factor, display_flag, is_system, companies_id, master_id, created, last_updated) VALUES (?, ?, ?, null, 1, 1, 0, ?, null, NOW(), NOW())";
	connection.query(cmd, [uom.name, uom.description, uom.short_name, companyid], function (err, row) {

		if (err) callback(err);

		if (row && row.affectedRows == 1) {
			uom.id = row.insertId;

			if (uom.conversion_list && uom.conversion_list.length > 0) {
				createUpdateUOMConversionList(uom.id, uom.conversion_list, uom.id, companyid, session, connection, function (err, xUOMConversionList) {
					if (err) return callback(err, null);
					return callback(null, uom);
				});
			}
			else
				return callback(null, uom);

		}
		else
			return callback(err, null);

	});


};

var updateUnitOfMeasure = function (uom, companyid, session, connection, callback) {

//TODO: if uom is being set as display_flag = 0, make sure this unit is not being used anywhere.
//	var cmd = "UPDATE unit_of_measures SET name = ?, description = ?, last_updated = NOW() WHERE id = ? AND companies_id = ? AND NOT EXISTS (SELECT 1 FROM unit_of_measures m1 WHERE m1.companies_id = ? AND m1.id <> ? AND m1.name = ?)";
	var cmd = "UPDATE unit_of_measures SET name = ?, description = ?, short_name = ?, display_flag = ?, last_updated = NOW() WHERE id = ? AND companies_id = ?";
	connection.query(cmd, [uom.name, uom.description, uom.short_name, uom.display_flag, uom.id, companyid], function (err, row) {

		if (err) callback(err);

		if (row && row.affectedRows == 1) {
		
			cmd = "CALL spDeleteUnitConversion(@err, @msg, ?,?)";

			connection.query(cmd, [companyid, uom.id], function (err, row) {

				if (err) return callback(err);

				connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
					if (rows[0].err == 0) {
						createUpdateUOMConversionList(uom.id, uom.conversion_list, uom.id, companyid, session, connection, function (err, xUOMConversionList) {
							if (err) return callback(err, null);
							return callback(null, uom);
						});
					}
					else {
						err = new Err();
						if (rows && rows[0]) {
							err.code    = rows[0].err;
							err.message = rows[0].msg;
						}
						else {
							err.code    = "-101";
							err.message = "Unknown Error";
						}
						return callback(err, null);
					}
				});
			});
		}
		else
			return callback(err, null);
	});
};

var createUpdateUOMConversionList = function (uomid, xUOMConversionList, defaultuomid, companyid, session, connection, callback) {

	if (xUOMConversionList.length == 0)
		return callback(null, true);

	//initialize first one as base UOM
	xUOMConversionList[0].from_uom.id = uomid;
	
	//initialize from UOM from previous to UOM
	for (i=1; i < xUOMConversionList.length; i++) 
		xUOMConversionList[i].from_uom.id = xUOMConversionList[i-1].to_uom.id;

	async.eachSeries(xUOMConversionList, function iterator(xUOMConversion, callback) {

		var cmd = "CALL spAssignUnitConversion(@err, @msg, ?,?,?,?,?,?, ?,?,?)";

		connection.query(cmd, [
								companyid, uomid, null, /*(Util.isEmptyString(xUOMConversion.product_id) ? null: xUOMConversion.product_id),*/ xUOMConversion.from_uom.id,
								1 /*xUOMConversion.from_qty*/, xUOMConversion.to_uom.id, xUOMConversion.to_qty, xUOMConversion.is_batched_inventory, session.user.id
								], function (err, rows) {

								if (err) return callback (err);

								connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
									if (rows[0].err == 0) {
										return callback(null, true);
									}
									else {
										err = new Err();
										if (rows && rows[0]) {
											err.code    = rows[0].err;
											err.message = rows[0].msg;
										}
										else {
											err.code    = "-101";
											err.message = "Unknown Error";
										}
										return callback(err, false);
									}
								});
							}
		);

	}, function (err) {

		if (err) return callback(err, false);

 		var sql = "UPDATE unit_of_measures SET end_uom_id = ? WHERE id = ?";
 		connection.query(sql, [xUOMConversionList[xUOMConversionList.length - 1].to_uom.id, uomid], function (err, row) {
 
 			if (err) callback(err);
 
 			if (row && row.affectedRows == 1) {

				cmd = "CALL spCreateUpdateUOMConversionDetail(@err, @msg, ?, ?)"; 
				connection.query(cmd, [
										uomid, xUOMConversionList[0].from_uom.id
									], function (err, rows) {
					if (err) return callback (err);

					connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
						if (rows && rows[0] && rows[0].err === 0)
							return callback(null, true);
						else {
							err         = new Err();
							err.code    = rows[0].err;
							err.message = rows[0].msg;
							return callback (err);
						}
					});
				});

 			}
 			else
 				return callback(err, false);

 		});

	});

};

var findAllHsn = function (companyid, options, session, connection, callback) {

	var query = "SELECT t.* FROM sysproducthsn t WHERE t.id > 0 ORDER BY t.name";
	
	connection.query(query, [
							companyid
						], function (err, rows) {

							if (err) return callback (err);

							var hsnlist = [];
	
							if (rows) {
								for (i = 0; i < rows.length; i++) {
									hsnlist.push (Map.mapToBHsn(rows[i]));
								}
							}

							return callback(null, hsnlist);

						}
	);

};

var findHsnById = function (id, companyid, session, connection, callback) {

	connection.query("SELECT t.* FROM sysproducthsn t WHERE t.id = ?", [
							id
						], function (err, rows) {

							if (err) return callback (err);
							
							if (rows && rows.length > 0) {
								const hsn = Map.mapToBHsn(rows[0]);
								connection.query("SELECT * FROM sysproducthsn_details WHERE sysproducthsn_id = ?", [id], function (err, rows) {
									if (err) return callback(err);
									const hsn_details = [];
									for (let j = 0; j < rows.length; j++) {
										const detail = {
											"id": rows[j].id,
											"amount_min": rows[j].amount_min,
											"amount_max": rows[j].amount_max,
											"percent_gst": rows[j].tax_percent_gst,
											"percent_cgst": rows[j].tax_percent_cgst,
											"percent_igst": rows[j].tax_percent_igst,
											"percent_sgst": rows[j].tax_percent_sgst,
											"percent_cess": rows[j].tax_percent_cess,
											"start_date": rows[j].activation_start_date,
											"end_date": rows[j].activation_end_date
										};
										hsn_details.push(detail);
									}
									hsn.details = hsn_details;
									return callback(null, hsn);
								});
							}
							else
								return callback(null, null);

						}
	);
	
};

var createHsn = async function (hsn, session, connection, callback) {

	try {

		hsn.details.sort((obj1, obj2) => {return obj1.amount_min - obj2.amount_min});

		for (let i = 0; i < hsn.details.length; i++) {
			if (hsn.details[i].percent_gst != hsn.details[i].percent_sgst * 2 || hsn.details[i].percent_gst != hsn.details[i].percent_cgst * 2) {
				return callback(new Error("Invalid sgst or cgst."), null);
			}
			if (hsn.details[i].percent_gst != hsn.details[i].percent_igst) {
				return callback(new Error("Invalid igst."), null);
			}
			if (i > 0) {
				if (hsn.details[i - 1].amount_max + 0.01 != hsn.details[i].amount_min) {
					return callback(new Error("Invalid max amount."), null);
				}
			}
		}

		// overwrite amount max
		hsn.details[hsn.details.length - 1].amount_max = null;

		// check if code already exists
		connection.query("SELECT COUNT(1) AS cnt FROM sysproducthsn WHERE code = ?", [hsn.code], async (err, rows) => {

			if (rows[0].cnt > 0) {
				return callback(new Error("Code already exists."), null);
			}

			connection.query("SELECT MAX(id) + 1 AS cnt FROM sysproducthsn", [], async (err, rows) => {

				hsn.id = rows[0].cnt;

				await connection.query("INSERT INTO sysproducthsn VALUES (?, ?, ?, ?, ?, NOW(), NOW())", [hsn.id, hsn.code, hsn.name, hsn.description, hsn.short_code]);

				for (const detail of hsn.details) {

					await connection.query("INSERT INTO sysproducthsn_details (sysproducthsn_id, amount_min, amount_max, tax_percent_gst, tax_percent_cgst, tax_percent_igst, tax_percent_sgst, tax_percent_cess, activation_start_date, activation_end_date, created, last_updated) VALUES (?,?,?,?,?,?, ?,?, DATE(NOW()), NULL, NOW(), NOW())", 
						[hsn.id, detail.amount_min, detail.amount_max || null, detail.percent_gst, detail.percent_cgst, detail.percent_igst, detail.percent_sgst, detail.percent_cess]);
				}

				callback(null, hsn);

			});

		});

	} catch(err) {
		return callback(err, null);
	}
	
};

var updateHsn = async function (hsn, session, connection, callback) {

	try {

		hsn.details.sort((obj1, obj2) => {return obj1.amount_min - obj2.amount_min});

		for (let i = 0; i < hsn.details.length; i++) {
			if (hsn.details[i].percent_gst != hsn.details[i].percent_sgst * 2 || hsn.details[i].percent_gst != hsn.details[i].percent_cgst * 2) {
				return callback(new Error("Invalid sgst or cgst."), null);
			}
			if (hsn.details[i].percent_gst != hsn.details[i].percent_igst) {
				return callback(new Error("Invalid igst."), null);
			}
			if (i > 0) {
				if (hsn.details[i - 1].amount_max + 0.01 != hsn.details[i].amount_min) {
					return callback(new Error("Invalid max amount."), null);
				}
			}
		}

		// overwrite amount max
		hsn.details[hsn.details.length - 1].amount_max = null;

		// check if code already exists
		connection.query("SELECT COUNT(1) AS cnt FROM sysproducthsn WHERE id = ?", [hsn.id], async (err, rows) => {

			if (rows[0].cnt == 0) {
				return callback(new Error("Code does not exist."));
			}

			// check if code already exists
			connection.query("SELECT COUNT(1) AS cnt FROM sysproducthsn WHERE code = ? AND id <> ?", [hsn.code, hsn.id], async (err, rows) => {

				if (rows[0].cnt > 0) {
					return callback(new Error("Code already exists."));
				}

				await connection.query("UPDATE sysproducthsn SET code = ?, name = ?, description = ?, short_code = ?, last_updated = NOW() WHERE id = ?", [hsn.code, hsn.name, hsn.description, hsn.short_code, hsn.id]);

				await connection.query("DELETE FROM sysproducthsn_details WHERE sysproducthsn_id = ?", [hsn.id]);

				for (const detail of hsn.details) {

					await connection.query("INSERT INTO sysproducthsn_details (sysproducthsn_id, amount_min, amount_max, tax_percent_gst, tax_percent_cgst, tax_percent_igst, tax_percent_sgst, tax_percent_cess, activation_start_date, activation_end_date, created, last_updated) VALUES (?,?,?,?,?,?, ?,?, DATE(NOW()), NULL, NOW(), NOW())", 
						[hsn.id, detail.amount_min, detail.amount_max || null, detail.percent_gst, detail.percent_cgst, detail.percent_igst, detail.percent_sgst, detail.percent_cess]);


				}

				callback(null, hsn);

			});

		});

	} catch(err) {
		return callback(err, null);
	}
	
};

var deleteHsn = function (id, session, connection, callback) {

	connection.query("SELECT COUNT(1) AS cnt FROM products WHERE sysproducthsn_id = ?", [id], (err, rows) => {

		if (err) return callback(err, false);

		if (rows[0].cnt > 0) {
			return callback(new Error("Products exist for HSN. Cannot delete HSN."), false);
		}

		connection.query("DELETE FROM sysproducthsn_details WHERE sysproducthsn_id = ?", [id], (err, result) => {

			if (err) return callback(err, false);

			connection.query("DELETE FROM sysproducthsn WHERE id = ?", [id], (err, result) => {

				if (err) return callback(err, false);

				callback(null, true);

			});

		});

	});


	
};

// var findAllTaxSlabs = function (companyid, options, session, connection, callback) {

// 	var query = "SELECT t.* FROM tax_slabs t WHERE t.companies_id = ?";
	
// 	connection.query(query, [
// 							companyid
// 						], function (err, rows) {

// 							if (err) return callback (err);

// 							var taxSlabList = [];
	
// 							if (rows) {
// 								for (i = 0; i < rows.length; i++) {
// 									taxSlabList.push (Map.mapToBTaxSlab(rows[i]));
// 								}
// 							}

// 							return callback(null, taxSlabList);

// 						}
// 	);

// };

// var findTaxSlabById = function (id, companyid, session, connection, callback) {

// 	connection.query("SELECT t.* FROM tax_slabs t WHERE t.id = ? AND t.companies_id = ?", [
// 							id, companyid
// 						], function (err, rows) {

// 							if (err) return callback (err);
							
// 							if (rows && rows.length > 0)
// 								return callback(null, Map.mapToBTaxSlab(rows[0]));
// 							else
// 								return callback(null, null);

// 						}
// 	);
	
// };

var findTaxByProductId = function (companyid, productid, options, session, connection, callback) {

	var cform = options.cform;
	var hform = options.hform;
	var extension = options.extension;
	var id = options.id || "";

	// hform means export. If export, no tax
	if (hform && hform == 1) {
		var objTax = {"id":id, "productid":productid, "tax": 0};
		return callback(null, objTax); 
	}

	else {
		
		extension = (extension == null || isNaN(extension) ? 1 : extension);
		
		if (productid) {
			connection.query ("SELECT t.*, hd.tax_percent_gst, hd.tax_percent_cess FROM sysproducthsn t, products p, sysproducthsn_details hd WHERE p.id = ? AND p.sysproducthsn_id = t.id AND t.id = hd.sysproducthsn_id AND p.unit_price BETWEEN hd.amount_min AND IFNULL(hd.amount_max, 1000000000) AND NOW() BETWEEN hd.activation_start_date AND IFNULL(hd.activation_end_date, DATE_ADD(NOW(), INTERVAL 10 MINUTE))", [productid], function (err, rows) {
				if (err) return callback (err);

				if (rows && rows.length == 1) {
					//var tax = Util.round( (cform && cform == 1 ? rows[0].alt_percent * extension/100 : rows[0].percent * extension/100), 2);
					var tax = Util.round(rows[0].tax_percent_gst * extension/100, 2);
					tax = tax + Util.round(rows[0].tax_percent_cess * tax/100, 2)
					var objTax = {"id":id, "productid":productid, "tax": tax};

					return callback(err, objTax); 
				}
				else
					return callback (err, 0);
			});
		} 
	}

};

var findTaxByDeliveryId = function (companyid, deliveryid, options, session, connection, callback) {

	if (!options) options = {};

	var cform = options.cform || 0;
	var hform = options.hform || 0;

	connection.query ("SELECT d.id, d.packing_slip_details_id, CASE WHEN ? = 1 THEN 0 ELSE round( (d.sub_total - d.discount_total) * t.tax_percent_gst/100, 2) + round(round( (d.sub_total - d.discount_total) * t.tax_percent_gst/100, 2) * tax_percent_cess, 2) END as tax FROM delivery_note_details d, packing_slip_details s, order_details od, products p, sysproducthsn t, sysproducthsn_details hd WHERE d.delivery_notes_id = ? AND d.packing_slip_details_id = s.id AND s.order_details_id = od.id AND s.products_id = p.id AND p.sysproducthsn_id = t.id AND t.id = hd.sysproducthsn_id AND od.order_price BETWEEN hd.amount_min AND IFNULL(hd.amount_max, od.order_price) AND NOW() BETWEEN hd.activation_start_date AND IFNULL(hd.activation_end_date, DATE_ADD(NOW(), INTERVAL 1 MINUTE))", [hform, deliveryid], function (err, rows) {
		if (err) return callback (err);
		var taxList = [];
		if (rows && rows.length) {
			for (i = 0; i < rows.length; i++) {
				var objTax = {"id":rows[i].packing_slip_details_id, "delivery_detail_id":rows[i].id, "tax": rows[i].tax};
				taxList.push(objTax);
			}
		}
		return callback(err, taxList); 
	});
};

var findTransporterById = function (id, companyid, session, connection, callback) {

	connection.query("SELECT a.id as addressid, a.*, t.* FROM transporters t, addresses a WHERE t.id = ? AND t.companies_id = ? AND t.addresses_id = a.id", [
							id, companyid
						], function (err, rows) {

							if (err) return callback (err);
							
							if (rows && rows.length > 0)
								return callback(null, Map.mapToBTransporter(rows[0]));
							else
								return callback(null, null);

						}
	);
	
};

var findAllTransporters = function (companyid, options, session, connection, callback) {

	let cmd = "SELECT a.id as addressid, a.*, t.* FROM transporters t, addresses a WHERE t.companies_id = ? AND t.addresses_id = a.id";

	if (options["activeonly"])
		cmd = cmd + " AND t.sysstatuses_id = 4600 ";

	if (options["code"] != undefined && options["code"] != "")
		cmd = cmd + " AND t.code = " + options["code"];

 	let sortBy = (options.sortby ? options.sortby : "name");
 	let sortDirection = (options.sortorder && options.sortorder == -1 ? "DESC" : "ASC");

 	if (sortBy == "code") sortBy = "t.code";
 	if (sortBy == "name") sortBy = "t.name";
 	if (sortBy == "city") sortBy = "a.city";
 	if (sortBy == "status") sortBy = "t.sysstatuses_id";

	cmd = cmd + " ORDER BY " + sortBy + " " + sortDirection;

	connection.query(cmd, [
							companyid
						], function (err, rows) {

							if (err) return callback (err);
					
							var transporterList = [];
		
							if (rows) {
								for (i = 0; i < rows.length; i++) {
									transporterList.push (Map.mapToBTransporter(rows[i]));
								}
							}

							return callback(null, transporterList);

						}
	);

};

var createTransporter = function (xTransporter, companyid, session, connection, callback) {

	let cmd = "";
	let para = [];
	if (xTransporter.code.trim() != "" || session.configurationlist[Util.CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD] == "1") {
		cmd = "SELECT 1 FROM transporters t WHERE t.companies_id = ? AND t.code = ?";
		para = [companyid, xTransporter.code];
	}
	else {
		cmd = "SELECT 1 from dual WHERE 1 = 0"; //WHERE 1 = 0";
		xTransporter.code = null;
	}

	connection.query(cmd, para, function (err, rows) {

		if (err) return callback (err);
		
		if (rows) {
			if (rows.length > 0) {
				var err     = new Err();
				err.code    = -101;
				err.message = 'Transporter with same code already exists!';
				return callback(err);
			}
		}
		else {
			var err     = new Err();
			err.code    = -201;
			err.message = 'Unknown error!';
			return callback(err);
		}

		cmd = "CALL spGetNextSequence(@err, @msg, @code, ?, 20050, 20053, 20051, ?)"
		connection.query(cmd, [companyid, xTransporter.code],  (err, rows) => {
			if (err) return callback (err);
			connection.query("SELECT @err AS err, @msg AS msg, @code AS code", function (err, rows) {

					if (err) return callback (err);

					if (rows && rows[0] && rows[0].err == 0) {
						xTransporter.code = rows[0].code;

					cmd = "CALL spCreateAddress(@err,@msg, @id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

					connection.query(cmd, [
											Util.getValue(xTransporter.address.first_name, ""), Util.getValue(xTransporter.address.last_name, ""), null, Util.getValue(xTransporter.address.address1, ""), Util.getValue(xTransporter.address.address2, ""), Util.getValue(xTransporter.address.address3, ""), 
											Util.getValue(xTransporter.address.city, ""), Util.getValue(xTransporter.address.state, ""), Util.getValue(xTransporter.address.zip, ""),
											Util.getValue(xTransporter.address.phone1, ""), Util.getValue(xTransporter.address.email1, ""), Util.getValue(xTransporter.address.phone2, ""), Util.getValue(xTransporter.address.email2, ""), companyid
										], function (err, rows) {

											if (err) return callback (err);

											connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
												if (rows && rows[0] && rows[0].err == 0) {
													xTransporter.address.id = rows[0].id;

													cmd = "INSERT INTO transporters (code, external_code, name, companies_id, addresses_id, sysstatuses_id, created, last_updated) VALUES (UPPER(?), ?, ?, ?, ?, 4600, NOW(), NOW())";
													connection.query(cmd, [xTransporter.code, xTransporter.external_code, xTransporter.name, companyid, rows[0].id], function (err, row) {

														if (err) callback(err);

														if (row && row.affectedRows == 1) {
															xTransporter.id = parseInt(row.insertId);
															return callback(null, xTransporter);
														}
														else
															return callback(err, null);
								
													});
							
												}
												else {
													var err; 
													if (rows && rows[0]) {
														err = new Err();
														err.code    = rows[0].err;
														err.message = rows[0].msg;
													}
													else {
														err = new Err();
														err.code    = "-101";
														err.message = "Unknown Error";
													}
													return callback(err);
												}
											});
										}

					);
				
					}
					else {
						var err; 
						if (rows && rows[0]) {
							err = new Err();
							err.code    = rows[0].err;
							err.message = rows[0].msg;
						}
						else {
							err = new Err();
							err.code    = "-101";
							err.message = "Unknown Error";
						}
						return callback(err);
					}
			});
		});

	});

};

var updateTransporter = function (xTransporter, companyid, session, connection, callback) {

	findTransporterById (xTransporter.id, companyid, session, connection, function (err, transporter) {

		if (err) return callback(err);
		if (!transporter) return callback(err, null);

		var cmd = "SELECT 1 FROM transporters t WHERE t.companies_id = ? AND UPPER(t.code) = UPPER(?) AND t.id <> ?";
		connection.query(cmd, [
							companyid, xTransporter.code, xTransporter.id
						], function (err, rows) {

							if (err) return callback (err);

							if (rows) {
								if (rows.length > 0) {
									var err     = new Err();
									err.code    = -101;
									err.message = 'Transporter with same code already exists!';
									return callback(err);
								}
							}
							else {
								var err     = new Err();
								err.code    = -201;
								err.message = 'Unknown error!';
								return callback(err);
							}

							cmd = "CALL spUpdateAddress(@err,@msg, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

							connection.query(cmd, [
													companyid, transporter.address.id, Util.getValue(xTransporter.address.first_name, ""), Util.getValue(xTransporter.address.last_name, ""), null, Util.getValue(xTransporter.address.address1, ""), 
													Util.getValue(xTransporter.address.address2, ""), Util.getValue(xTransporter.address.address3, ""), Util.getValue(xTransporter.address.city, ""), 
													Util.getValue(xTransporter.address.state, ""), Util.getValue(xTransporter.address.zip, ""), Util.getValue(xTransporter.address.phone1, ""), 
													Util.getValue(xTransporter.address.email1, ""), Util.getValue(xTransporter.address.phone2, ""), Util.getValue(xTransporter.address.email2, ""), companyid
												], function (err, rows) {

													if (err) return callback (err);

													connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
														if (rows && rows[0] && rows[0].err == 0) {
															xTransporter.address.id = rows[0].id;
															cmd = "UPDATE transporters SET code = UPPER(?), external_code = ?, name = ?, sysstatuses_id = ?, last_updated = NOW() WHERE id = ? AND companies_id = ?";
															connection.query(cmd, [xTransporter.code, xTransporter.external_code, xTransporter.name, xTransporter.status_id, xTransporter.id, companyid], function (err, row) {

																if (err) callback(err);

																if (row && row.affectedRows == 1) {
																	return callback(null, xTransporter);
																}
																else
																	return callback(err, null);
										
															});
									
														}
														else {
															var err; 
															if (rows && rows[0]) {
																err = new Err();
																err.code    = rows[0].err;
																err.message = rows[0].msg;
															}
															else {
																err = new Err();
																err.code    = "-101";
																err.message = "Unknown Error";
															}
															return callback(err);
														}
													});
												}

							);
						});

					});


};

var findPaymentTermById = function (id, companyid, session, connection, callback) {

	connection.query("SELECT t.* FROM payment_terms t WHERE t.id = ? AND t.companies_id = ?", [
							id, companyid
						], function (err, rows) {

							if (err) return callback (err);
							
							if (rows && rows.length > 0)
								return callback(null, Map.mapToBPaymentTerm(rows[0]));
							else
								return callback(null, null);

						}
	);
	
};

var findAllPaymentTerms = function (companyid, options, session, connection, callback) {

	let cmd = "SELECT t.* FROM payment_terms t WHERE t.companies_id = ? ";

 	let sortBy = (options.sortby ? options.sortby : "description");
 	let sortDirection = (options.sortorder && options.sortorder == -1 ? "DESC" : "ASC");

 	if (sortBy == "code") sortBy = "code";
 	if (sortBy == "description") sortBy = "description";
 	if (sortBy == "days") sortBy = "days";
 	if (sortBy == "status") sortBy = "sysstatuses_id";

	if (options["activeonly"])
		cmd = cmd + " AND t.sysstatuses_id = 4600 ";

	cmd = cmd + " ORDER BY " + sortBy + " " + sortDirection;

	connection.query(cmd, [
							companyid
						], function (err, rows) {

							if (err) return callback (err);
					
							var PaymentTermList = [];
		
							if (rows) {
								for (i = 0; i < rows.length; i++) {
									PaymentTermList.push (Map.mapToBPaymentTerm(rows[i]));
								}
							}

							return callback(null, PaymentTermList);

						}
	);

};

var findAllTempos = function (companyid, session, connection, callback) {

	let cmd = "SELECT t.* FROM tempos t WHERE t.companies_id = ? order by last_updated desc ";

	connection.query(cmd, [
							companyid
						], function (err, rows) {

							if (err) return callback (err);
					
							var tempoList = [];
		
							if (rows) {
								for (i = 0; i < rows.length; i++) {
									tempoList.push (Map.mapToBTempo(rows[i]));
								}
							}

							return callback(null, tempoList);

						}
	);

};

var findAllNotifications = function (companyid, options, session, connection, callback) {

	let fromdate, todate;

	if (options.fromdate) {
		fromdate = moment(options.fromdate).tz("UTC").format("YYYY-MM-DD");
	}

	if (options.todate) {
		todate = moment(options.todate).tz("UTC").format("YYYY-MM-DD");
	}

	let cmd = "CALL spGetNotification(@err, @msg, @totalrecords, ?,?,?,?,?,?,?,?,?,?,?,?)";
	connection.query(cmd, [
								companyid,
								session.user.id,
								(options.customerid ? options.customerid : null),
								(options.formatid ? options.formatid : null),
								(options.typeid ? options.typeid : null),
								(options.statusid ? options.statusid : null),
								fromdate,
								todate,
								(options.pagenumber ? options.pagenumber : 1),
								(options.pagesize ? options.pagesize : 20),
								(options.sortby ? options.sortby : "id"),
								(options.sortorder ? options.sortorder : -1)
						  ], function (err, rows) {

									if (err) return callback (err);

									let notlist = [];

									connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
										if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
										{
											for (let i = 0; i <rows[0].length; i++)
											{
												notlist.push(Map.mapToBNotification(rows[0][i]));
												notlist[i].totalrecords = feedbackrows[0].totalrecords;
											}
									
											return callback(null, notlist);
									
										}
										else {
											var err = new Err();
											if (feedbackrows && feedbackrows[0]) {
												err.code    = feedbackrows[0].err;
												err.message = feedbackrows[0].msg;
											}
											else {
												err.code    = "-101";
												err.message = "Unknown Error";
											}
											return callback(err);
										}

									});
	});


};

var findBillById = function (billid, companyid, session, connection, callback) {
	let cmd = "CALL spGetBill(@err, @msg, @totalrecords, ?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?, ?,?)";
	
	connection.query(cmd, [
		companyid, billid, session.user.id, null, null, null, null, null, null, null, null, null, null, null, 1, 10, "id", 1
	], function (err, rows) {

			if (err) return callback (err);

			connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
				if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null) && rows[0].length > 0) 
				{
					let bill = Map.mapToBBill(rows[0][0]);
					return callback(null, bill);
			
				}
				else {
					var err = new Err();
					if (feedbackrows && feedbackrows[0]) {
						err.code    = feedbackrows[0].err;
						err.message = feedbackrows[0].msg;
					}
					else {
						err.code    = "-101";
						err.message = "Unknown Error";
					}
					return callback(err);
				}

			});
	});
}

var findAllBills = function (companyid, options, session, connection, callback) {

	let fromdate, todate;

	if (options.fromdate) {
		fromdate = moment(options.fromdate).tz("UTC").format("YYYY-MM-DD");
	}

	if (options.todate) {
		todate = moment(options.todate).tz("UTC").format("YYYY-MM-DD");
	}

	let duedatefrom, duedateto;

	if (options.duedatefrom) {
		duedatefrom = moment(options.duedatefrom).tz("UTC").format("YYYY-MM-DD");
	}

	if (options.duedateto) {
		duedateto = moment(options.duedateto).tz("UTC").format("YYYY-MM-DD");
	}

	let nextreminderfrom, nextreminderto;

	if (options.nextreminderfrom) {
		nextreminderfrom = moment(options.nextreminderfrom).tz("UTC").format("YYYY-MM-DD");
	}

	if (options.nextreminderto) {
		nextreminderto = moment(options.nextreminderto).tz("UTC").format("YYYY-MM-DD");
	}

	let cmd = "CALL spGetBill(@err, @msg, @totalrecords, ?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?, ?,?)";
	connection.query(cmd, [
								companyid,
								(options.id ? options.id : null),
								session.user.id,
								(options.customerid ? options.customerid : null),
								(options.statusid ? options.statusid : null),
								(options.bill_number ? options.bill_number : null),
								(options.bill_ref_number ? options.bill_ref_number : null),
								(options.status_id ? options.status_id : null),
								fromdate,
								todate,
								duedatefrom,
								duedateto,
								nextreminderfrom,
								nextreminderto,
								(options.pagenumber ? options.pagenumber : 1),
								(options.pagesize ? options.pagesize : 20),
								(options.sortby ? options.sortby : "id"),
								(options.sortorder ? options.sortorder : -1)
						  ], function (err, rows) {

									if (err) return callback (err);

									let billlist = [];

									connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
										if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
										{
											for (let i = 0; i <rows[0].length; i++)
											{
												billlist.push(Map.mapToBBill(rows[0][i]));
												billlist[i].totalrecords = feedbackrows[0].totalrecords;
											}
									
											return callback(null, billlist);
									
										}
										else {
											var err = new Err();
											if (feedbackrows && feedbackrows[0]) {
												err.code    = feedbackrows[0].err;
												err.message = feedbackrows[0].msg;
											}
											else {
												err.code    = "-101";
												err.message = "Unknown Error";
											}
											return callback(err);
										}

									});
	});


};


var updateNotification = function(id, statusid, connection, callback) {

	const sql = "UPDATE notifications SET sysnotificationstatuses_id = ?, last_updated = NOW() WHERE id = ?";
	connection.query(sql, [statusid, id], function (err, row) {
		if (err) {
			callback (err, null);
		}
		else {
			if (row && row.affectedRows == 1) {
				callback(null, true);
			}
			else {
				callback(err, false); 
			}
		}
	});
 }        


var updateCustomerBills = function (companyid, guid, session, connection, callback) {    

	let sql = "UPDATE pending_bills b  SET b.balance_amount = 0, b.paid_amount = b.bill_amount, b.approx_paid_date = DATE(NOW()), syspaymentstatuses_id = 5801, b.last_updated = NOW() " +
    		"WHERE NOT EXISTS (SELECT 1 FROM pending_bills_stage pbs WHERE pbs.bill_ref_number = b.bill_ref_number AND pbs.batch_number = ? AND b.companies_id = pbs.companies_id AND b.customers_id = pbs.customers_id) " +
    		"AND b.companies_id = ? AND b.syspaymentstatuses_id = 5800";

	connection.query(sql, [guid, companyid], function (err, row) {
		if (err) {
			callback (err, null);
		}
		else {
			sql = "UPDATE companies SET current_overdue = 0, current_overdue_sync_date = NOW(), last_updated = NOW() WHERE syscompanytypes_id = 4702 AND parent_id = ? AND sysstatuses_id = 4600" +
				" AND NOT EXISTS (SELECT 1 FROM pending_bills_stage pbs WHERE pbs.companies_id = ? AND pbs.customers_id = companies.id AND pbs.batch_number = ?)";

			connection.query(sql, [companyid, companyid, guid], function (err, row) {
				if (err) {
					callback (err, null);
				}
				else
					callback(null, true);
			});
		}
	});			
}

var createCustomerBills = function (companyid, customerbills, session, connection, callback) {

	var sql;
	var out_item;
	var return_list = [];
	var errors = [];
	var guid;
    var balance = 0;
    var customerid;
	
	customerid = customerbills.id;
	code       = customerbills.code;
	name       = customerbills.name;
	guid 	   = customerbills.guid;
	bills      = customerbills.billlist;
	CompanyService.findCustomerByCode(code, companyid, session, connection, function(err_c, customer) {

		customerid = (customerid ? customerid : customer.id);

		balance = 0;
		return_bill_list = [];
		out_item = {"statuscode": 0, "code": code, "name":name, "bill_list": return_bill_list, "message":"Success"};
		return_list.push(out_item);
		
		async.eachSeries(bills, function iterator(bill, icb) {

			dBillDate = new Date(bill.bill_date);
			dDueDate = new Date(bill.due_date);
			dToday = new Date();

			balance_amount = Util.round(bill.balance_amount, 2);
			bill_amount = Util.round(bill.bill_amount, 2);

			if (dToday.getTime() >= dDueDate.getTime())
				balance = balance + bill_amount;

			sql = "INSERT INTO pending_bills_stage (batch_number, companies_id, customers_id, bill_number, bill_ref_number, bill_amount, balance_amount, bill_date, due_date, created, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
			connection.query(sql, [guid, companyid, customerid, (bill.bill_number || "").trim(), (bill.bill_ref_number || "").trim(), bill_amount, balance_amount, dBillDate, dDueDate], function (err, row) {

				if (err) {
					out_bill_item = {"statuscode": -100, "bill_number": bill.bill_number, "message":err.message };
					return_bill_list.push(out_bill_item);
					errors.push(err);
					icb (err, null);
				}
				else {
					if (row && row.affectedRows == 1) {
						out_bill_item = {"statuscode": 0, "bill_number": bill.bill_number, "message":"Success" };
						return_bill_list.push(out_bill_item);
						icb(null, true);
					}
					else {
						out_bill_item = {"statuscode": -101, "bill_number": bill.bill_number, "message": "Unable to insert the bill" };
						return_bill_list.push(out_bill_item);
						icb(err, false); 
					}
				}
			});


		}, function (err) {

			if (err) {
				errors.push(err);
				return callback (err, null);
			}
			else {

			sql = "CALL spProcessBills(@err, @msg, ?, ?, ?)";
			connection.query(sql, [companyid, customerid, guid], function (err, row) {
				if (err) {
					errors.push(err);
					return callback (err, null);
				}
				else {
					connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
						if (rows && rows[0] && rows[0].err == 0) {
							
							sql = "UPDATE companies SET current_overdue = ?, current_overdue_sync_date = NOW(), last_updated = NOW() WHERE id = ? AND parent_id = ?";
							connection.query(sql, [balance, customerid, companyid], function (err, row) {
								if (err) {
									errors.push(err);
									return callback (err, null);
								}
								else {
									if (row && row.affectedRows == 1) {
										return callback(null, return_list);
									}
									else {
										return callback(err, null); 
									}
								}
							});

						}
						else {
							console.error(err);
							return callback(err, null); 
						}
					})
				}
			});
		}
			
		});				
	});
	
};

var createBill = function (companyid, bill, session, connection, callback) {

	var sql;
	var out_item;
	var return_list = [];
	var errors = [];

	if(bill.due_date == null || bill.due_date == "") {
		var myDate = new Date();
		myDate.setDate(myDate.getDate() + Util.CONST_DEFAULT_PAYMENT_TERM);
		bill.due_date = myDate;
	}

	dBillDate = new Date(bill.bill_date);
	dDueDate = new Date(bill.due_date);
	if(bill.paid_date != null || bill.paid_date != undefined)
		dPaidDate = new Date(bill.paid_date);
	else
		dPaidDate = null;

	var base_date = moment().tz("UTC").format("YYYY-MM-DD");

	sql = "INSERT INTO pending_bills (companies_id, customers_id, syspaymentstatuses_id, bill_number, bill_ref_number, bill_amount, balance_amount, paid_amount, approx_paid_date, bill_date, due_date, created, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
	connection.query(sql, [companyid, bill.customer.id, bill.status_id, (bill.bill_number), (bill.bill_ref_number), bill.bill_amount, bill.balance_amount, bill.paid_amount, dPaidDate, dBillDate, dDueDate], function (err, row) {
		if (err) {
			callback (err, null);
		}
		else {
			if (row && row.affectedRows == 1) {
				bill.id = row.insertId;
				sql = "CALL spUpdateBillsNextReminderDate (@err, @msg, ?, ?, null, ?, ?);";
				connection.query(sql, [companyid, bill.customer.id, base_date, bill.id], function (err, row) {
					if (err) {
						callback (err, null);
					}
					else 
						callback(null, true);
				});
			}
			else {
				callback(err, false); 
			}
		}
	});

};

var updateBill = function (companyid, bill, session, connection, callback) {

	var sql;
	var out_item;
	var return_list = [];
	var errors = [];

	if(bill.due_date == null || bill.due_date == "") {
		var myDate = new Date();
		myDate.setDate(myDate.getDate() + 90);
		bill.due_date = myDate;
	}

	dBillDate = new Date(bill.bill_date);
	dDueDate = new Date(bill.due_date);

	if(bill.paid_date != null || bill.paid_date != undefined)
		dPaidDate = new Date(bill.paid_date);
	else
		dPaidDate = null;

	var base_date = moment().tz("UTC").format("YYYY-MM-DD");

	sql = "Update pending_bills set customers_id = ?, syspaymentstatuses_id = ?, bill_amount = ?, balance_amount = ?, paid_amount = ?, bill_date = ?, due_date = ?, approx_paid_date = ?, last_updated = NOW() where id = ?";
	connection.query(sql, [bill.customer.id, bill.status_id, bill.bill_amount, bill.balance_amount, bill.paid_amount, dBillDate, dDueDate, dPaidDate, (bill.id)], function (err, row) {
		if (err) {
			callback (err, null);
		}
		else {
			if (row && row.affectedRows == 1) {
				sql = "CALL spUpdateBillsNextReminderDate (@err, @msg, ?, ?, null, ?, ?);";
				connection.query(sql, [companyid, bill.customer.id, base_date, bill.id], function (err1, row1) {
					if (err1) {
						callback (err1, null);
					}
					else 
						callback(null, true);
				});
			}
			else {
				callback(err, false); 
			}
		}
	});

};



// var createCustomerBills1 = function (companyid, billlist, session, connection, callback) {

// 	var sql;
// 	var out_item;
// 	var return_list = [];
// 	var errors = [];

// 	async.eachSeries(billlist, function iterator(item, callback) {
// 		customerid = item.id;
// 		code       = item.code;
// 		name       = item.name;
// 		bills      = item.billlist;
// 		if (customerid) {
// 			sql = "UPDATE pending_bills SET sysstatuses_id = 4601, approx_paid_date = NOW(), last_updated = NOW() WHERE companies_id = ? AND customers_id = ? AND sysstatuses_id = 4600";
// 			connection.query(sql, [companyid, customerid], function (err, row) {
// 				if (err) {
// 					out_item = {"statuscode": -100, "code":code, "name":name, "bill_list":[], "message":err.message};
// 					return_list.push(out_item);
// 					errors.push(err);
// 					callback (err, null);
// 				}
// 				else {

// 					balance = 0;
// 					return_bill_list = [];
// 					out_item = {"statuscode": 0, "code": code, "name":name, "bill_list": return_bill_list, "message":"Success"};
// 					return_list.push(out_item);

// 					async.eachSeries(bills, function iterator(bill, callback) {

// 						dBillDate = new Date(bill.bill_date);
// 						dDueDate = new Date(bill.due_date);
// 						dToday = new Date();

// 						bill_amount = Util.round(bill.balance_amount, 2);

// 						if (dToday.getTime() >= dDueDate.getTime())
// 							balance = balance + bill_amount;

// 						sql = "UPDATE pending_bills SET sysstatuses_id = 4600, approx_paid_date = NULL, last_updated = NOW() WHERE companies_id = ? AND customers_id = ? AND bill_number = ? AND bill_ref_number = ? AND balance_amount = ? ";
// 						connection.query(sql, [companyid, customerid, (bill.bill_number || "").trim(), (bill.bill_ref_number || "").trim(), bill_amount], function (err, row) {
// 							if (err) {
// 								out_bill_item = {"statuscode": -100, "bill_number": bill.bill_number, "message":err.message };
// 								return_bill_list.push(out_bill_item);
// 								errors.push(err);
// 								callback (err, null);
// 							}
// 							else {
// 								if (row && row.affectedRows == 1) {
// 									out_bill_item = {"statuscode": 0, "bill_number": bill.bill_number, "message":"Success" };
// 									return_bill_list.push(out_bill_item);
// 									callback(null, true);
// 								}
// 								else {

// 									sql = "INSERT INTO pending_bills (companies_id, customers_id, bill_number, bill_ref_number, balance_amount, bill_date, due_date, approx_paid_date, sysstatuses_id, created, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 4600, NOW(), NOW())";
// 									connection.query(sql, [companyid, customerid, (bill.bill_number || "").trim(), (bill.bill_ref_number || "").trim(), bill_amount, bill.bill_date, bill.due_date, companyid, customerid, (bill.bill_number || "").trim(), (bill.bill_ref_number || "").trim(), bill_amount], function (err, row) {
// 										if (err) {
// 											out_bill_item = {"statuscode": -100, "bill_number": bill.bill_number, "message":err.message };
// 											return_bill_list.push(out_bill_item);
// 											errors.push(err);
// 											callback (err, null);
// 										} else {
// 											out_bill_item = {"statuscode": 0, "bill_number": bill.bill_number, "message":"Success" };
// 											return_bill_list.push(out_bill_item);
// 											callback(null, true);											
// 										}
// 									});
// 								}
// 							}
// 						});
// 					}, function (err) {
// 						sql = "UPDATE companies SET current_overdue = ?, current_overdue_sync_date = NOW(), last_updated = NOW() WHERE id = ? AND parent_id = ?";
// 						connection.query(sql, [balance, customerid, companyid], function (err, row) {
// 							if (err) {
// 								errors.push(err);
// 								callback (err, null);
// 							}
// 							else {
// 								if (row && row.affectedRows == 1) {
// 									callback(null, true);
// 								}
// 								else {
// 									callback(err, false); 
// 								}
// 							}
// 						});

// 					});
// 				}
// 			});
// 		}
// 		else
// 			callback(null, true);

// 	}, function (err) {
// 		if (errors.length > 0) {
// 			var err = errors[0];
// 			return callback(err, null);
// 		}
// 		return callback(err, return_list);
// 	});

// };

var createPaymentTerm = function (xPaymentTerm, companyid, session, connection, callback) {

	var cmd = "SELECT 1 FROM payment_terms WHERE companies_id = ? AND code = UPPER(?)";
	connection.query(cmd, [companyid, xPaymentTerm.code], function (err, rows) {

		if (err) callback(err);
		
		if (rows && rows.length > 0) {
			err         = new Err();
			err.code    = "-201";
			err.message = "Payment term with code already exists!";
			return callback(err)
		}

		cmd = "INSERT INTO payment_terms (code, description, companies_id, days, sysstatuses_id, created, last_updated) VALUES (?, ?, ?, ?, 4600, NOW(), NOW())";
		connection.query(cmd, [xPaymentTerm.code.toUpperCase(), xPaymentTerm.description, companyid, xPaymentTerm.days], function (err, row) {

			if (err) callback(err);

			if (row && row.affectedRows == 1) {
				xPaymentTerm.id = row.insertId;
				xPaymentTerm.status_id = 4600;
				return callback(null, xPaymentTerm);
			}
			else
				return callback(err, null);

		});
	
	});
	

};


var createTempo = function (xTempo, companyid, session, connection, callback) {

	var cmd = "INSERT INTO tempos (companies_id, company_name, driver_name, vehicle_number, created_by, created, last_updated) VALUES (?, ?, ?, ?,?, NOW(), NOW())";
	connection.query(cmd, [companyid, xTempo.company_name, xTempo.driver_name, xTempo.vehicle_number, session.user.id], function (err, row) {

		if (err) callback(err);

		if (row && row.affectedRows == 1) {
			xTempo.id = row.insertId;
			return callback(null, xTempo);
		}
		else
			return callback(err, null);

	});
};

var updatePaymentTerm = function (xPaymentTerm, companyid, session, connection, callback) {

	var cmd = "SELECT 1 FROM payment_terms WHERE companies_id = ? AND code = UPPER(?) AND id <> ?";
	connection.query(cmd, [companyid, xPaymentTerm.code, xPaymentTerm.id], function (err, rows) {

		if (err) callback(err);
		
		if (rows && rows.length > 0) {
			err         = new Err();
			err.code    = "-201";
			err.message = "Payment term with code already exists!";
			return callback(err)
		}
		
		cmd = "UPDATE payment_terms SET code = ?, description = ?, sysstatuses_id = ?, days = ?, last_updated = NOW() WHERE id = ? AND companies_id = ?";
		connection.query(cmd, [xPaymentTerm.code.toUpperCase(), xPaymentTerm.description, xPaymentTerm.status_id, xPaymentTerm.days, xPaymentTerm.id, companyid], function (err, row) {

			if (err) callback(err);

			return callback(null, xPaymentTerm);
	
		});

	});
};

var updateTempo = function (xTempo, companyid, session, connection, callback) {

	var cmd = "SELECT 1 FROM tempos WHERE companies_id = ? AND id <> ?";
	cmd = "UPDATE tempos SET name = ?, driver_name = ?, vehicle_number = ?, last_updated = NOW() WHERE id = ? AND companies_id = ?";
	connection.query(cmd, [xTempo.company_name, xTempo.driver_name, xTempo.vehicle_number, xTempo.id, companyid], function (err, row) {

		if (err) callback(err);

		return callback(null, xTempo);

	});
};

var findCompanyTypeById = function (id, companyid, session, connection, callback) {

	connection.query("SELECT t.* FROM company_types t WHERE t.id = ? AND t.companies_id = ?", [
							id, companyid
						], function (err, rows) {

							if (err) return callback (err);
							
							if (rows && rows.length > 0)
								return callback(null, Map.mapToBCompanyType(rows[0]));
							else
								return callback(null, null);

						}
	);
	
};

var findAllCompanyTypes = function (companyid, options, session, connection, callback) {

	let cmd = "SELECT t.* FROM company_types t WHERE t.companies_id = ?";;

 	let sortBy = (options.sortby ? options.sortby : "name");
 	let sortDirection = (options.sortorder && options.sortorder == -1 ? "DESC" : "ASC");

 	if (sortBy == "name") sortBy = "name";
 	if (sortBy == "description") sortBy = "description";
 	if (sortBy == "default") sortBy = "is_default";

	cmd = cmd + " ORDER BY " + sortBy + " " + sortDirection;

	connection.query(cmd, [
							companyid
						], function (err, rows) {

							if (err) return callback (err);
					
							var companyTypeList = [];
		
							if (rows) {
								for (i = 0; i < rows.length; i++) {
									companyTypeList.push (Map.mapToBCompanyType(rows[i]));
								}
							}

							return callback(null, companyTypeList);

						}
	);

};

var createCompanyType = function (xCompanyType, companyid, session, connection, callback) {

	if (!xCompanyType.is_default)
		xCompanyType.is_default = 0;

	if (xCompanyType.is_default == false)
		xCompanyType.is_default = 0;

	if (xCompanyType.is_default == true)
		xCompanyType.is_default = 1;

	cmd = "CALL spCreateCompanyType(@err,@msg, @id, ?,?,?,?,?,?)";
 	connection.query(cmd, [
							companyid, Util.getValue(xCompanyType.name, ""), Util.getValue(xCompanyType.description, ""), 
							Util.getValue(xCompanyType.is_default, 0), xCompanyType.balance_limit || 0, 4702
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
									xCompanyType.id = rows[0].id;
									return callback(null, xCompanyType);
								}
								else
									return callback(err, null);
							});
						});
};

var updateCompanyType = function (xCompanyType, companyid, session, connection, callback) {

	findCompanyTypeById (xCompanyType.id, companyid, session, connection, function (err, companyType) {

		if (err) return callback(err);
		if (!companyType) return callback(err, null);

		cmd = "UPDATE company_types SET name = ?, description = ?, balance_limit = ?, is_default = ?, last_updated = NOW() WHERE id = ? AND companies_id = ?";
		connection.query(cmd, [xCompanyType.name, xCompanyType.description, xCompanyType.balance_limit, xCompanyType.is_default, xCompanyType.id, companyid], function (err, row) {

			if (err) callback(err);
			
			if (xCompanyType.is_default == true || xCompanyType.is_default == 1) {

				cmd = "UPDATE company_types SET is_default = 0, last_updated = NOW() WHERE id <> ? AND companies_id = ? AND is_default = 1";
				connection.query(cmd, [xCompanyType.id, companyid], function (err, row) {

					if (err) callback(err);
					else
						return callback(null, xCompanyType);
					
				});
			
			}
			else
				return callback(null, xCompanyType);
	
		});

	});

};

var createCustomFilter = function (xCustomFilter, session, connection, callback) {

	cmd = "CALL spCreateCustomFilter(@err,@msg, @id, ?,?,?,?,?,?,?)";
 	connection.query(cmd, [
							session.company_id, session.user.id, xCustomFilter.name, xCustomFilter.filters, xCustomFilter.document_type,
							xCustomFilter.is_user_defined, xCustomFilter.show_in_dashboard
						], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
								
								if (rows && rows[0] && rows[0].err == 0) {
									xCustomFilter.id = rows[0].id;
									return callback(null, xCustomFilter);
								}
								else
								{
									return callback(err, null);
								}
							});
						});
};

var updateCustomFilter = function (xCustomFilter, companyid, session, connection, callback) {

	findCustomFilterByID(xCustomFilter.id, companyid, session, connection, function (err, customFilter) {

		if (err) return callback(err);
		if (!customFilter) return callback(err, null);
		
		let cmd = "UPDATE custom_filters SET name = ?, filters = ?, show_in_dashboard = ?, last_updated = NOW() WHERE id = ? AND companies_id = ?";
		connection.query(cmd, [xCustomFilter.name, xCustomFilter.filters, xCustomFilter.show_in_dashboard, xCustomFilter.id, companyid], function (err, row) {

			if (err) callback(err);

			return callback(null, xCustomFilter);
	
		});

	});

};

var deleteCustomFilter = function (id, companyid, session, connection, callback) {

	findCustomFilterByID(id, companyid, session, connection, function (err, customFilter) {

		if (err) return callback(err);
		if (!customFilter) return callback(err, null);

		cmd = "UPDATE custom_filters SET active = 0, last_updated = NOW() WHERE id = ? AND companies_id = ?";
		connection.query(cmd, [id, companyid], function (err, row) {

			if (err) callback(err);

			return callback(null, customFilter);
	
		});

	});

};

var deleteTransporter = function (id, companyid, session, connection, callback) {

	// findTransporterById(id, companyid, session, connection, function (err, transporter) {

	// 	if (err) return callback(err);
	// 	if (!transporter) return callback(err, null);

	const cmd = "CALL spDeleteTransporter(@err, @msg, ?, ?, ?)";

	connection.query(cmd, [companyid, id, session.user.id], function (err, row) {

		if (err) return callback (err);

		connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
			if (rows[0].err == 0) {
				return callback(null, true);
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
				return callback(err, false);
			}
		});

	});

//	});

};

var deletePaymentTerm = function (id, companyid, session, connection, callback) {

	// findPaymentTermById(id, companyid, session, connection, function (err, paymentterm) {

	// 	if (err) return callback(err);
	// 	if (!paymentterm) return callback(err, null);

	const cmd = "CALL spDeletePaymentTerm(@err, @msg, ?, ?, ?)";

	connection.query(cmd, [companyid, id, session.user.id], function (err, row) {

		if (err) return callback (err);

		connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
			if (rows[0].err == 0) {
				return callback(null, true);
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
				return callback(err, false);
			}
		});

	});

	// });

};

var deleteCompanyType = function (id, companyid, session, connection, callback) {

	// findCompanyTypeById(id, companyid, session, connection, function (err, companytype) {

	// 	if (err) return callback(err);
	// 	if (!companytype) return callback(err, null);

	const cmd = "CALL spDeleteCompanyType(@err, @msg, ?, ?, ?)";

	connection.query(cmd, [companyid, id, session.user.id], function (err, row) {

		if (err) return callback (err);

		connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
			if (rows[0].err == 0) {
				return callback(null, true);
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
				return callback(err, false);
			}
		});

	});

	// });

};

var deleteUnitOfMeasure = function (id, companyid, session, connection, callback) {

	// CompanyService.findUnitOfMeasureById(id, companyid, session, connection, function (err, uom) {

	// 	if (err) return callback(err);
	// 	if (!uom) return callback(err, null);

	const cmd = "CALL spDeleteUnitOfMeasure(@err, @msg, ?, ?, ?)";

	connection.query(cmd, [companyid, id, session.user.id], function (err, row) {

		if (err) return callback (err);

		connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
			if (rows[0].err == 0) {
				return callback(null, true);
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
				return callback(err, false);
			}
		});

	});

//	});

};

var findAllCustomFilters = function (companyid, options, session, connection, callback) {

	let cmd = "CALL spGetCustomFilter(@err, @msg, @totalrecords, ?,?,?,?,?)";
	connection.query(cmd, [
			companyid,
			(options.id ? options.id : null),
			session.user.id,
			(options.document_type ? options.document_type : null),
			(options.show_in_dashboard ? options.show_in_dashboard : null)
	  ], function (err, rows) {

				if (err) return callback (err);

				let customFilterList = [];

				connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
					if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
					{
						for (let i = 0; i <rows[0].length; i++)
						{
							customFilterList.push(Map.mapToBCustomFilter(rows[0][i]));
							customFilterList[i].totalrecords = feedbackrows[0].totalrecords;
						}
				
						return callback(null, customFilterList);
				
					}
					else {
						var err = new Err();
						if (feedbackrows && feedbackrows[0]) {
							err.code    = feedbackrows[0].err;
							err.message = feedbackrows[0].msg;
						}
						else {
							err.code    = "-101";
							err.message = "Unknown Error";
						}
						return callback(err);
					}

				});
	});
};

var findCustomFilterByID = function (id, companyid, session, connection, callback) {

	let cmd = "CALL spGetCustomFilter(@err, @msg, @totalrecords, ?,?,?,?,?)";
	connection.query(cmd, [
			companyid,
			id,
			session.user.id,
			null,
			null
	  ], function (err, rows) {

				if (err) return callback (err);

				connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
					if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
					{
						customFilter = Map.mapToBCustomFilter(rows[0][0]);
				
						return callback(null, customFilter);
				
					}
					else {
						var err = new Err();
						if (feedbackrows && feedbackrows[0]) {
							err.code    = feedbackrows[0].err;
							err.message = feedbackrows[0].msg;
						}
						else {
							err.code    = "-101";
							err.message = "Unknown Error";
						}
						return callback(err);
					}

				});
	});
};

var updateCustomFilterCounter = function(id, accessed_from, session, connection, callback){
	let cmd = "update custom_filters set usage_counter = usage_counter + 1, last_accessed = NOW(), accessed_from = ? where id = ?"
		connection.query(cmd, [accessed_from, id], function (err, rows1) {
			if(err) return callback(err);
			return callback(null);
	});
}

module.exports = {

	findTransporterById  : findTransporterById,
	findAllTransporters  : findAllTransporters,
	createTransporter    : createTransporter,
	updateTransporter    : updateTransporter,

	findCompanyTypeById  : findCompanyTypeById,
	findAllCompanyTypes  : findAllCompanyTypes,
	createCompanyType    : createCompanyType,
	updateCompanyType    : updateCompanyType,

	findPaymentTermById  : findPaymentTermById,
	findAllPaymentTerms  : findAllPaymentTerms,
	createPaymentTerm    : createPaymentTerm,
	updatePaymentTerm    : updatePaymentTerm,
	
	findAllUnitOfMeasures:findAllUnitOfMeasures,
	findUnitOfMeasureById:findUnitOfMeasureById,
	createUnitOfMeasure  : createUnitOfMeasure,
	updateUnitOfMeasure  : updateUnitOfMeasure,
	findUnitConversions  : findUnitConversions,

	findTaxByProductId   : findTaxByProductId,
	findTaxByDeliveryId  : findTaxByDeliveryId,
	
	// findAllTaxSlabs      : findAllTaxSlabs,
	// findTaxSlabById      : findTaxSlabById,
	findAddressById      : findAddressById,

	findAllHsn           : findAllHsn,
	findHsnById          : findHsnById,
	createHsn            : createHsn,
	updateHsn            : updateHsn,
	deleteHsn            : deleteHsn,

	findAllBills         : findAllBills,
	findBillById 		 : findBillById,
	findAllNotifications : findAllNotifications,
	createBill 			 : createBill,
	updateBill			 : updateBill,
	updateNotification   : updateNotification,
	createCustomerBills  : createCustomerBills,	
	updateCustomerBills  : updateCustomerBills,	
	findAllCustomFilters : findAllCustomFilters,
	createCustomFilter 	 : createCustomFilter,
	updateCustomFilter 	 : updateCustomFilter,
	findCustomFilterByID : findCustomFilterByID,
	updateCustomFilterCounter : updateCustomFilterCounter,
	deleteCustomFilter 	 : deleteCustomFilter,

	findAllTempos	     : findAllTempos,
	createTempo			 : createTempo,
	updateTempo 		 : updateTempo,

	deleteCompanyType 	 : deleteCompanyType,
	deleteTransporter 	 : deleteTransporter,
	deletePaymentTerm 	 : deletePaymentTerm,
	deleteUnitOfMeasure  : deleteUnitOfMeasure

};

