var CategoryService = require("../services/category");
var Map             = require("../utils/map");
var Err             = require("../bo/err");
var Util            = require("../utils");
var Config          = require("../config/config");

var async           = require("async");

exports.findById = function (id, companyid, session, connection, callback) {

	var cmd = "CALL spGetProduct(@err,@msg, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

	connection.query(cmd, [
							companyid, id, null, null, null, 0, 0, 0, 0, null, null, null, null
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0) {

								var xProduct = Map.mapToBProduct(rows[0][0]);

								async.parallel([
									function (callback) {

										if ( (xProduct.price_level_id + "" === (Util.CONST_PRICING_PRODUCT_VARIABLE + "") || xProduct.price_level_id + "" === (Util.CONST_PRICING_PRODUCT_FLAT + "")) && !Util.isEmptyString(xProduct.pricegroup.id)) {
											exports.findPriceGroupById (xProduct.pricegroup.id, companyid, xProduct.price_level_id, session, connection, function (err, xPriceGroup) {
												if (err) 
													return callback(err, null);
												else {
													xProduct.pricegroup = xPriceGroup;
													return callback(err, null);
												} 
											});
										} 
										else
											return callback(null, null);
									
									},
									function (callback) {
										exports.findProductAllUOM (companyid, xProduct.id, null, session, connection, function(err, uomlist) {
											if (err) return callback(err, null);
											xProduct.uomlist = uomlist;
											return callback(err, null);
										});	
									},
									function (callback) {
										cmd = "SELECT * FROM images WHERE companies_id = ? AND document_id = ? AND document_type_char = 'P'";
										var imageList = [];
										connection.query(cmd, [companyid, id], function (err, rows) {

																if (err) return callback (err);

																if (rows && rows.length > 0) {

																	for (i = 0; i < rows.length; i++) {
																		imageList.push(Map.mapToBImage(rows[i]));
																	}

																	xProduct.image_list = imageList;
																	callback(null, null);

																}
																else
																	return callback(null, null);
															}
										);
									},
									function (callback) {
									
										if (xProduct.family_size > 0) {
											var familymemberList = [];

											if (xProduct.product_type_id == 4900)  {
												cmd = "SELECT p.*, g.name as price_groups_name, m.name as uom_name, m.short_name as uom_short_name, t.id as hsn_id, t.name as hsn_name, t.code as hsn_code, t.short_code as hsn_short_code, t.description as hsn_description FROM products p INNER JOIN sysproducthsn t ON t.id = p.sysproducthsn_id INNER JOIN unit_of_measures m ON p.unit_of_measures_id = m.id INNER JOIN product_families pf ON p.id = pf.products_id LEFT OUTER JOIN price_groups g ON p.price_groups_id = g.id ";
												cmd = cmd + " WHERE p.companies_id = ? AND pf.master_id = ?"
											}
											else if (xProduct.product_type_id == 4901) {
												cmd = "SELECT p.*, g.name as price_groups_name, m.name as uom_name, m.short_name as uom_short_name, t.id as hsn_id, t.name as hsn_name, t.code as hsn_code, t.short_code as hsn_short_code, t.description as hsn_description FROM products p INNER JOIN sysproducthsn t ON t.id = p.sysproducthsn_id INNER JOIN unit_of_measures m ON p.unit_of_measures_id = m.id INNER JOIN product_families pf ON p.id = pf.master_id LEFT OUTER JOIN price_groups g ON p.price_groups_id = g.id ";
												cmd = cmd + " WHERE p.companies_id = ? AND pf.products_id = ?"
											}
											else
												return callback(null, null);

											connection.query(cmd, [companyid, id], function (err, rows) {

																	if (err) return callback (err);

																	if (rows && rows.length > 0) {

																		for (i = 0; i < rows.length; i++) {
																			familymemberList.push(Map.mapToBProduct(rows[i]));
																		}

																		xProduct.familymemberlist = familymemberList;
																		callback(null, null);

																	}
																	else
																		return callback(null, null);
																}
											);
										}
										else
											return callback(null, null);

									}
									
								], function (err, results) {
									return callback(err, xProduct);
								});
								/*								
								if (xProduct.price_level_id + "" === (Util.CONST_PRICING_PRODUCT_VARIABLE + "") && !Util.isEmptyString(xProduct.pricegroup.id)) {
									exports.findPriceGroupById (xProduct.pricegroup.id, companyid, Util.CONST_PRICING_PRODUCT_VARIABLE, session, connection, function (err, xPriceGroup) {
										if (err) 
											return callback(err, null);
										else {
											xProduct.pricegroup = xPriceGroup;
											return callback(err, xProduct);
										} 
									});
								} 
								else
									return callback(null, xProduct);
								*/
							}
							else
								return callback(null, null);
						}
	);

};

exports.findByCode = function (code, companyid, internalFlag, session, connection, callback) {

 	var cmd = "CALL spGetProduct(@err,@msg, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

	var para;
	if (internalFlag == 1) {
		para = [companyid, null, null, null, code, 0, 0, 0, 0, null, null, null, null];
	}
	else {
		para = [companyid, null, null, code, null, 0, 0, 0, 0, null, null, null, null];
	}

	connection.query(cmd, para, function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0)
								return callback(null, Map.mapToBProduct(rows[0][0]));
							else
								return callback(null, null);
						}
	);

};

exports.findByCategoryId = function (categoryid, companyid, options, customerid, session, connection, callback) {

	var cmd;
	var parameterList;

	var deepSearchFlag = options.deepSearchFlag || 0;
	var isEnabledOnly = options.isEnabledOnly || 0;
	var isStockedOnly = options.isStockedOnly || 0;
	var showNewProductForXDays = options.showNewProductForXDays || 0;
	var sync_status_id = (options.sync_status_id === "" ? null : options.sync_status_id);

	if (deepSearchFlag == 1) {
		var cmd = "CALL spGetProduct(@err,@msg, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)";
		parameterList = [companyid, null, categoryid, null, null, 1, isEnabledOnly, isStockedOnly, showNewProductForXDays, null, customerid, null, sync_status_id];
	}
	else {
		var cmd = "CALL spGetProduct(@err,@msg, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)";
		parameterList = [companyid, null, categoryid, null, null, 0, isEnabledOnly, isStockedOnly, showNewProductForXDays, null, customerid, null, sync_status_id];
	}

	connection.query(cmd, parameterList, function (err, rows) {

							if (err) return callback (err);

							var productList = [];
							if (rows && rows[0]) {
								for (i=0; i < rows[0].length; i++) {
									productList.push (Map.mapToBProduct(rows[0][i]));
								}


								//find all sellable UOM
								async.each(productList, function (product, incb) {
									if ((product.price_level_id + "" === (Util.CONST_PRICING_PRODUCT_VARIABLE + "") || product.price_level_id + "" === (Util.CONST_PRICING_PRODUCT_FLAT + "")) && !Util.isEmptyString(product.pricegroup.id)) {
										exports.findPriceGroupById (product.pricegroup.id, companyid, product.price_level_id, session, connection, function (err, xPriceGroup) {
											if (err) 
												incb(err, null);
											else {
												product.pricegroup = xPriceGroup;
											} 
										});
									} 

									exports.findProductAllUOM (companyid, product.id, customerid, session, connection, function(err, uomlist) {
										if (err) return incb(err);
										product.uomlist = uomlist;
										incb (err, product);
									});	

								}, function (err) {
									// all done
									return callback(null, productList);
								}); 
							}
							else						
								return callback(null, productList);
						}
	);

};

exports.findAll = function (companyid, searchText, options, customerid, pricegroupid, session, connection, callback) {

	var isEnabledOnly = options.isEnabledOnly || 0;
	var isStockedOnly = options.isStockedOnly || 0;
	var productid     = options.productid     || undefined;
	var showNewProductForXDays = options.showNewProductForXDays || 0;
	var sync_status_id = (options.sync_status_id === "" ? null : options.sync_status_id);

	var cmd = "CALL spGetProduct(@err,@msg, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)";

	connection.query(cmd, [
							companyid, productid, null, null, null, 0, isEnabledOnly, isStockedOnly, showNewProductForXDays, searchText, customerid, pricegroupid, sync_status_id
						], function (err, rows) {

							if (err) return callback (err);

							var productList = [];
							if (rows && rows[0]) { 
								for (i=0; i < rows[0].length; i++) {
									productList.push (Map.mapToBProduct(rows[0][i]));
								}
								//find all sellable UOM
								
								async.each(productList, function (product, incb) {
								
									exports.findProductAllUOM (companyid, product.id, customerid, session, connection, function(err, uomlist) {
										if (err) return incb(err);
										product.uomlist = uomlist;
										incb ();
									});	

								}, function (err) {
									// all done
									return callback(null, productList);
								}); 								
							}
							//return callback(null, productList);
						}
	);
};

exports.create = function (xProduct, session, connection, callback) {

	var sku         = xProduct.sku;
	var name        = xProduct.name;
	var categoryid  = xProduct.category_id;
	var companyid   = xProduct.company_id;
	var unitprice   = xProduct.unit_price;

	if ( (!sku  && session.configurationlist[Util.CONST_CONFIG_COMPANY_PRODUCT_CODE_REQD] == "1") || !name || !categoryid || !companyid || !unitprice) {
		var err = new Err();
		err.code    = "-250";
		err.message = "Invalid input data.";
		return callback(err);
	}

	if (xProduct.prive_level_id === Util.CONST_PRICING_PRODUCT_PRICEGROUP && !xProducet.pricegroup && xProduct.pricegroup.id === "") {
		var err = new Err();
		err.code    = "-251";
		err.message = "If product pricing is at group level, pricing group must be available.";
		return callback(err);
	}

	if (!xProduct.quantity.packageqty) xProduct.quantity.packageqty = 1;
	if (!xProduct.quantity.stock) xProduct.quantity.stock = 0;
	if (!xProduct.quantity.reorder) xProduct.quantity.reorder = 0;
	if (!xProduct.quantity.onorder) xProduct.quantity.onorder = 0;

	if (!xProduct.sku_internal) xProduct.sku_internal = (sku && sku != '' ? sku : null);

	if (xProduct.is_hidden == undefined) xProduct.is_hidden = 0;
	if (xProduct.is_hidden_no_stock == undefined) xProduct.is_hidden_no_stock = 0;

	if (!xProduct.is_taxable) xProduct.is_taxable = 1;

	if (!xProduct.is_family_head) xProduct.is_family_head = 0;

	if (!xProduct.is_batched_inventory) xProduct.is_batched_inventory = 0;

	if (!xProduct.dimension.weight) xProduct.dimension.weight = null;
	if (!xProduct.dimension.height) xProduct.dimension.height = null;
	if (!xProduct.dimension.length) xProduct.dimension.length = null;
	if (!xProduct.dimension.width) xProduct.dimension.width = null;

	if (!xProduct.default_sell_qty) xProduct.default_sell_qty = null;

	xProduct.product_type_id = xProduct.product_type_id || 4901;

	if (!xProduct.hsn) xProduct.hsn = {"id": 0};

	//if (!xProduct.color) xProduct.color = '';

	var cmd = "CALL spCreateProduct(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?)";

	connection.query(cmd, [
							companyid, xProduct.sku, xProduct.sku_internal, xProduct.name,
							xProduct.description, xProduct.quantity.packageqty, xProduct.unit_price, xProduct.quantity.stock,
							xProduct.quantity.onorder, xProduct.quantity.reorder, 0, xProduct.category_id,
							xProduct.uom_id, xProduct.price_level_id, (xProduct.pricegroup && xProduct.pricegroup.id === "" || xProduct.pricegroup.id === - 1 ? null : (xProduct.pricegroup ? xProduct.pricegroup.id : null)), xProduct.dimension.width, 
							xProduct.dimension.length, xProduct.dimension.height, xProduct.dimension.weight, Util.getValue(xProduct.color, ""), 
							xProduct.product_type_id, xProduct.is_family_head, xProduct.is_hidden, xProduct.is_hidden_no_stock, xProduct.is_taxable, 
							xProduct.default_qty_uom.id, xProduct.is_quote_uom_restricted, xProduct.is_qty_uom_restricted, xProduct.is_batched_inventory, xProduct.default_sell_qty, xProduct.hsn.id, Util.getValue(xProduct.image_url1, ""), 
							Util.getValue(xProduct.image_url2, ""), Util.getValue(xProduct.image_url3, ""), Util.getValue(xProduct.image_url4, ""), Util.getValue(xProduct.image_url5, ""), session.user.id
							], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {

								if (rows && rows[0] && rows[0].err == 0) {
									xProduct.id = rows[0].id;

									// if flat pricing, clear out price list just to be sure
									if (xProduct.price_level_id + "" === Util.CONST_PRICING_PRODUCT_FLAT + "") 
										xProduct.pricegroup.pricelistlist = [];

									if ( (xProduct.price_level_id + "" === Util.CONST_PRICING_PRODUCT_FLAT + "" || xProduct.price_level_id + "" === Util.CONST_PRICING_PRODUCT_VARIABLE + "")) {
										exports.findById(xProduct.id, companyid, session, connection, function (err, xProductFetched) {
										
											if (err) return callback(err);
										
											xProduct.pricegroup.id = xProductFetched.pricegroup.id;

											async.parallel([/*
												function (callback) {

													for (i = 0; i < xProduct.pricegroup.uomconversionlist.length; i++) {
														xProduct.pricegroup.uomconversionlist[i].group_id = xProductFetched.pricegroup.id;
													}
													exports.createUpdateUOMConversionList(xProduct.pricegroup.id, xProduct.pricegroup.uomconversionlist, xProduct.uom_id, companyid, session, connection, function (err, xUOMConversionList) {
														if (err) return callback(err, null);
														return callback(null, xProduct);
													});
												},*/
												function (callback) {
													async.eachSeries(xProduct.image_list, function iterator(xImage, callback){
														cmd = "INSERT INTO images (companies_id, document_id, document_type_char, url, url_large, description, created, last_updated) VALUES (?, ?, 'P', ?, ?, ?, now(), now())";
														connection.query(cmd, [
																				companyid, xProduct.id, xImage.url, xImage.url_large, xImage.description
																			  ], function (err, row) {
																					if (err) return callback (err);

																					if (row && row.affectedRows == 1) {
																						xImage.id = row.insertId;
																					}
																					else {
																						err = new Err();
																						err.code    = "-9999";
																						err.message = "Unable to insert image";
																					}
																					return callback(err, null);

																		});

														
													}, function (err) {
														callback(err, xProduct);
													});

												},
												function (callback) {
													async.eachSeries(xProduct.pricegroup.pricelistlist, function iterator(xPrice, callback) {

																				cmd = "CALL spAssignPrice(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?)"; 
																				var id = null;
																				connection.query(cmd, [
																										companyid, xProduct.pricegroup.id, "PRODUCT GROUP", "PRODUCT GROUP", xProduct.id, xPrice.customer_type_id,
																										xPrice.unit_price, xProduct.uom_id, /*xPrice.uom_id,*/ session.user.id
																									  ], function (err, rows) {
																											if (err) return callback (err);

																											connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
																												if (rows && rows[0] && rows[0].err == 0) {
																													id = rows[0].id;
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
																												}
																												return callback(err, null);
																											});

																										}
																				);

																			}, function (err) {
																				callback(err, xProduct);
																			});	
												}], function (err, results) {
													callback(err, xProduct);
												});
																	
										
										});
									}
									else
										return callback (err, xProduct);
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
									return callback(err);
								}
							});
						}
	);
				
};
/*
									else if (xProduct.price_level_id + "" === Util.CONST_PRICING_PRODUCT_VARIABLE + "") { 

										var id = null;

										async.eachSeries(xProduct.pricegroup.pricelistlist, function iterator(xPrice, callback) {

											cmd = "CALL spAssignPrice(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?)"; 
											connection.query(cmd, [
																	companyid, id, "PRODUCT GROUP", "PRODUCT GROUP", xProduct.id, xPrice.customer_type_id,
																	xPrice.unit_price, xPrice.uom_id, session.user.id
																  ], function (err, rows) {
																		if (err) return callback (err);

																		connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
																			if (rows && rows[0] && rows[0].err == 0) {
																				id = rows[0].id;
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
																			}
																			return callback(err, null);
																		});

																	}
											);

										}, function (err) {
											exports.findById(xProduct.id, companyid, session, connection, function (err, xProductFetched) {
										
												if (err) return callback(err);

												for (i = 0; i < xProduct.pricegroup.uomconversionlist.length; i++) {
													xProduct.pricegroup.uomconversionlist[i].group_id = xProductFetched.pricegroup.id;
												}
												exports.createUpdateUOMConversionList(xProduct.pricegroup.id, xProduct.pricegroup.uomconversionlist, xProduct.uom_id, companyid, session, connection, function (err, xUOMConversionList) {
													if (err) return callback(err, null);
													return callback(null, xProduct);
												});
										
											});
//											callback(err, xProduct);
										});
									}
									else
										return callback(null, xProduct);

								}
*/
exports.update = function (xProduct, linkedwith, session, connection, callback) {

//	var sku         = xProduct.sku;
	var name        = xProduct.name;
	var companyid   = xProduct.company_id;
	var unitprice   = xProduct.unit_price;

	if (!name || !companyid || !unitprice) {
		var err = new Err();
		err.code    = "-250";
		err.message = "Invalid input data.";
		return callback(err);
	}

	if (!xProduct.quantity.packageqty && isNaN(xProduct.quantity.packageqty)) xProduct.quantity.packageqty = 1;
	if (!xProduct.quantity.stock && isNaN(xProduct.quantity.stock)) xProduct.quantity.stock = -1;
	if (!xProduct.quantity.reorder && isNaN(xProduct.quantity.reorder)) xProduct.quantity.reorder = -1;
	if (!xProduct.quantity.onorder && isNaN(xProduct.quantity.onorder)) xProduct.quantity.onorder = -1;

	if (!xProduct.sku_internal) xProduct.sku_internal = sku;

	if (!xProduct.is_hidden && isNaN(xProduct.is_hidden)) xProduct.is_hidden = 0;
	if (!xProduct.is_hidden_no_stock && isNaN(xProduct.is_hidden_no_stock)) xProduct.is_hidden_no_stock = 1;

	if (!xProduct.dimension.weight) xProduct.dimension.weight = "";
	if (!xProduct.dimension.height) xProduct.dimension.height = "";
	if (!xProduct.dimension.length) xProduct.dimension.length = "";
	if (!xProduct.dimension.width) xProduct.dimension.width = "";

	if (!xProduct.color) xProduct.color = 'N/A';

	if (!xProduct.status_id) xProduct.status_id = 4600;

  	var cmd = "CALL spUpdateProduct(@err, @msg, ?,?,?,?,?,?,?, ?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?)";

	connection.query(cmd, [
							companyid, xProduct.id, xProduct.sku, xProduct.sku_internal, xProduct.name, xProduct.accounting_key,
							xProduct.description, xProduct.quantity.packageqty, xProduct.unit_price, xProduct.quantity.stock, 
							xProduct.quantity.onorder, xProduct.quantity.reorder, 0, xProduct.status_id, xProduct.sync_status_id,
							xProduct.uom_id, xProduct.default_qty_uom.id, xProduct.is_quote_uom_restricted, xProduct.is_qty_uom_restricted, xProduct.price_level_id, (xProduct.pricegroup.id == "" ? null : xProduct.pricegroup.id), (!xProduct.dimension.width || xProduct.dimension.width == "" ? null : xProduct.dimension.width), (!xProduct.dimension.length || xProduct.dimension.length == "" ? null : xProduct.dimension.length) , 
							(!xProduct.dimension.height || xProduct.dimension.height == "" ? null : xProduct.dimension.height),
							(!xProduct.dimension.weight || xProduct.dimension.weight == "" ? null : xProduct.dimension.weight), xProduct.color, xProduct.is_hidden, xProduct.is_hidden_no_stock, linkedwith,
							xProduct.image_url1, xProduct.image_url2, xProduct.image_url3, xProduct.image_url4, xProduct.image_url5, xProduct.is_batched_inventory, xProduct.is_taxable, xProduct.default_sell_qty, xProduct.hsn.id, session.user.id
							], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {

										async.parallel([

											function (callback) {
												//save images
												cmd = "DELETE FROM images WHERE companies_id = ? AND document_id = ? AND document_type_char = 'P' ";

												connection.query(cmd, [companyid, xProduct.id], function (err, rows) {
													if (err) return callback(err, null);
													async.eachSeries(xProduct.image_list, function iterator(xImage, callback){
														cmd = "INSERT INTO images (companies_id, document_id, document_type_char, url, url_large, description, created, last_updated) VALUES (?, ?, 'P', ?, ?, ?, now(), now())";
														connection.query(cmd, [
																				companyid, xProduct.id, xImage.url, xImage.url_large, xImage.description
																			  ], function (err, row) {
																					if (err) return callback (err);

																					if (row && row.affectedRows == 1) {
																						xImage.id = row.insertId;
																					}
																					else {
																						err = new Err();
																						err.code    = "-9999";
																						err.message = "Unable to insert image";
																					}
																					return callback(err, null);

																		});

														
													}, function (err) {
														callback(err, xProduct);
													});
												});

											},

											function (callback) {

												if (xProduct.price_level_id + "" === Util.CONST_PRICING_PRODUCT_VARIABLE + "") { 

													var id = xProduct.pricegroup.id;

													async.eachSeries(xProduct.pricegroup.pricelistlist, function iterator(xPrice, callback) {

														cmd = "CALL spAssignPrice(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?)"; 

														connection.query(cmd, [
																				companyid, id, "PRODUCT GROUP", "PRODUCT GROUP", xProduct.id, xPrice.customer_type_id,
																				xPrice.unit_price, xProduct.uom_id, session.user.id
																			  ], function (err, rows) {
																					if (err) return callback (err);

																					connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
																						if (rows && rows[0] && rows[0].err == 0) {
																							id = rows[0].id;
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
																						}
																						return callback(err, null);
																					});

																				}/*, function(err) {
																						//all async done
																						return callback(null, xProduct);
																				}*/
														);

													}, function (err) {
															callback(err, xProduct);
													});
												} else {
													callback(err, xProduct);
												}
											}

										], function (err, results) {
												callback(err, xProduct);
										});

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
									return callback(err);
								}
							});
						}
	);
	
};

exports.linkCategory = function (id, companyid, categoryid, session, connection, callback) {

	var cmd = "CALL spAssignProductCategoryMap(@err, @msg, ?,?,?,?)";

	connection.query(cmd, [
							companyid, id, categoryid, null
							], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
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
						}
	);

};

exports.linkProduct = function (id, companyid, masterid, session, connection, callback) {

	var cmd = "CALL spAssignProductFamilyMap(@err, @msg, ?,?,?,?)";

	connection.query(cmd, [
							companyid, id, masterid, null
							], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
								if (rows && rows[0] && rows[0].err == 0) {
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
						}
	);

};

exports.delinkProductFamily = function (masterid, companyid, productid, session, connection, callback) {

	var cmd = "CALL spDeleteProductFamilyMap(@err, @msg, ?,?,?)";

	connection.query(cmd, [
							companyid, masterid, productid
							], function (err, rows) {

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
						}
	);

};


exports.delinkCategory = function (id, companyid, categoryid, session, connection, callback) {

	var cmd = "CALL spDeleteProductCategoryMap(@err, @msg, ?,?,?,?, 0)";

	connection.query(cmd, [
							companyid, id, categoryid, null
							], function (err, rows) {

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
						}
	);

};

exports.delinkProduct = function (id, companyid, masterid, session, connection, callback) {

	var cmd = "CALL spDeleteProductFamilyMap(@err, @msg, ?,?,?,?)";

	connection.query(cmd, [
							companyid, id, masterid, null
							], function (err, rows) {

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
						}
	);

};

exports.deletePriceGroupById = function (id, companyid, session, connection, callback) {

	const cmd = "CALL spDeletePriceGroup(@err,@msg, ?, ?, ?)";

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

};

exports.deleteById = function (id, companyid, session, connection, callback) {

	const cmd = "CALL spDeleteProduct(@err,@msg, ?, ?, ?)";

	connection.query(cmd,[companyid, id, session.user.id], function (err, row) {

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

};
/*
exports.findPriceListByProductId = function (productid, companyid, session, connection, callback) {

	var cmd = "SELECT l.*, c.name as company_type_name, p.name FROM price_lists l, products p, company_types c WHERE l.products_id = ? AND l.companies_id = ? AND l.products_id = p.id AND l.sysstatuses_id = 4600 AND l.company_types_id = c.id";

	connection.query(cmd, [
							productid, companyid
						], function (err, rows) {

							if (err) return callback (err);

							var priceListList = [];
							if (rows && rows.length > 0) { 
								for (i=0; i < rows.length; i++) {
									priceListList.push (Map.mapToBPriceList(rows[i]));
								}
							}
							return callback(null, priceListList);
						}
	);
};
*/

exports.findStockSummary = function (companyid, options, session, connection, callback) {

	var productid = (options.productid ? options.productid : null);
	var categoryid = (options.categoryid ? options.categoryid : null);
	var pricegroupid = (options.pricegroupid ? options.pricegroupid : null);
	var detailflag  = (options.detailflag ? options.detailflag : 0);
	var excludezeroflag  = (options.excludezeroflag ? options.excludezeroflag : 0);

	var cmd = "CALL spGetStock(@err,@msg, ?, ?, ?, ?, ?, ?, ?)";

	connection.query(cmd, [
							companyid, productid, categoryid, pricegroupid, detailflag, excludezeroflag, session.user.id
						], function (err, rows) {

							if (err) return callback (err);

							var stockbucketlist = [];

							connection.query("SELECT @err AS err, @msg AS msg", function (feedbackerr, feedbackrows) {

								if (feedbackerr) {
									return callback(feedbackerr, null);
								}

								if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) {

									for (var i = 0; i < rows[0].length; i++) {
										var bucket = Map.mapToBStockBucket(rows[0][i]);
										bucket.more = {};
										bucket.more.stock_in_process_qty = rows[0][i].stock_in_process_qty;
										bucket.more.stock_in_process_quote = rows[0][i].stock_in_process_quote;
										if (detailflag == 1) {
											bucket.more.product_name = rows[0][i].product_name;
											bucket.more.is_batched_inventory = rows[0][i].is_batched_inventory;
										}
										stockbucketlist.push(bucket);
									}

									// name of category/product/price group
									if (rows[1] && rows[1].length > 0)
										options.title = rows[1][0].name

									return callback(err, stockbucketlist);
								}
								else {
									err = new Err();
									err.code    = feedbackrows[0].err;
									err.message = feedbackrows[0].msg;
									return callback(err, null);
								}
							});
					});

};

exports.printStockSummary = function (companyid, options, session, connection, callback) {

	exports.findStockSummary(companyid, options, session, connection, function (err, stockbucketlist) {

		if (err) return callback (setError(err), null);

		var obj = {};
		obj.title = options.title;
		var htmlname;

		if (options.detailflag == 1) {
			// convert stock bucket to product list
			var productlist = [];
			var product = undefined;
			var productid = -1;
			var stockqty = 0;
			var stockquote = 0;
			for (i = 0; i < stockbucketlist.length; i++) {
				if (stockbucketlist[i].product_id != productid) {

					// asssigning previous product's total before overwriting values
					if (product) {
						product.quantity.stock_qty = stockqty;
						product.quantity.stock_quote = stockquote;
					}

					stockqty = stockbucketlist[i].stock_qty;
					stockquote = stockbucketlist[i].stock_quote;

					product = {	
								"id":stockbucketlist[i].product_id, 
								"name":stockbucketlist[i].more.product_name, 
								"stock_in_process_qty":stockbucketlist[i].more.stock_in_process_qty,
								"stock_in_process_quote":stockbucketlist[i].more.stock_in_process_quote,
								"uom_quote":stockbucketlist[i].uom_quote.short_name,
								"uom_qty":stockbucketlist[i].uom_qty.short_name,
								"is_batched_inventory":stockbucketlist[i].more.is_batched_inventory,
								"bucketlist":[],
								"quantity":{}
								};

					productlist.push(product);
					productid = stockbucketlist[i].product_id;
				}
				else {
					stockqty = stockqty + stockbucketlist[i].stock_qty;
					stockquote = stockquote + stockbucketlist[i].stock_quote;
				}

				if (product.is_batched_inventory == 1) {
					// use minimized version of bucket
					var bucket = Util.initObjectIfNotExist(undefined, "StockBucket");
					bucket.code = stockbucketlist[i].code;
					bucket.stock_quote_string = stockbucketlist[i].stock_quote_string;
					bucket.stock_quote = stockbucketlist[i].stock_quote;
					bucket.stock_qty = stockbucketlist[i].stock_qty;
					bucket.more = stockbucketlist[i].more;
					bucket.uom_quote.id = stockbucketlist[i].uom_quote.id;
					bucket.uom_quote.name = stockbucketlist[i].uom_quote.name;
					bucket.uom_quote.short_name = stockbucketlist[i].uom_quote.short_name;
					bucket.uom_qty.id = stockbucketlist[i].uom_qty.id;
					bucket.uom_qty.name = stockbucketlist[i].uom_qty.name;
					bucket.uom_qty.short_name = stockbucketlist[i].uom_qty.short_name;
					product.bucketlist.push(bucket);

//					product.bucketlist.push(stockbucketlist[i]);
				}

	//			if (i > 192) break;
			}

			// asssigning previous product's total before overwriting values
			if (product) {
				product.quantity.stock_qty = stockqty;
				product.quantity.stock_quote = stockquote;
			}

			obj.productlist = productlist;
			htmlname = "stock_detail.html";

		}
		else {
			obj.stockbucketlist = stockbucketlist;
			htmlname = "stock_summary.html";
		}

		var wkhtmltopdf = require('wkhtmltopdf');

		var nunjucks = require('nunjucks');
		var renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/" + htmlname, obj);

		wkhtmltopdf.command = Config.PDF_CONVERTER_WITH_PATH;

		var pageSize = 'A5';
		var dpi = 0;

		if (pageSize == 'A4') {
			dpi = 260;
		}
		else if (pageSize == 'A2') {
			dpi = 520;
		}
		else if (pageSize == 'A5') {
			dpi = 170;
		}

	//	wkhtmltopdf(str,{ output: 'out2.pdf', 'header-left':'Rupesh Shah', 'header-html':'http://www.google.com'});
	//	wkhtmltopdf(renderedHtml, { output: 'out2.pdf', 'pageSize':pageSize,'disableSmartShrinking':true, 'dpi':dpi});
	//	wkhtmltopdf('<h1>Test</h1><p>Hello world</p>').pipe(res);
		wkhtmltopdf(renderedHtml, {'pageSize':pageSize, 'disableSmartShrinking':true, 'dpi':dpi, 'marginBottom':20}, function (err, stream){
			return callback (err, stream);
		});

	});
};

exports.findStockJournal = function(companyid, id, productid, sync_status_id, from, to, datetype, currentpage, recordsperpage, session, connection, callback) {

	if (!id) id = null;

	//slice removes time portion if any
	from = (from ? new Date(from).toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 10) : null);
	to   = (to ? new Date(to).toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 10) : null);

	if (!datetype) datetype = null;
	if (from && to && !datetype) datetype = 1;
	if (!currentpage) currentpage = 1;
	if (!recordsperpage) recordsperpage = 50000;
	
	var err;	
	if ((!id && !productid && !sync_status_id)) {
		err = new Err();
		err.code    = "-101";
		err.message = "Invalid input. Can't search stock journal.";
		return callback(err, null);
	}
	
	var cmd = "CALL spGetStockJournal(@err,@msg, @totalrecords, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

	connection.query(cmd, [
							companyid, id, productid, sync_status_id, from, to, datetype, currentpage, recordsperpage
						], function (err, rows) {

							if (err) return callback (err);

							var stockJournalList = [];

							connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
								if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
								{

									let stock_quote = 0;
									let stock_qty = 0;
									for(let i = 0; i <rows[0].length; i++)
									{
										stock_quote = stock_quote + rows[0][i]["quantity_ordered"];
										stock_qty = stock_qty + rows[0][i]["quantity_entered"];
										stockJournalList.push(Map.mapToBStockJournal(rows[0][i])); 
										stockJournalList[i].totalrecords = feedbackrows[0].totalrecords;
									}

									let balance = {
													"opening": {"uom_qty": {"uom_id": 0, "stock_qty": 0, "name": ""}, "uom_quote":{"uom_id": 0, "stock_quote": 0, "name": ""}},
													"closing": {"uom_qty": {"uom_id": 0, "stock_qty": 0, "name": ""}, "uom_quote":{"uom_id": 0, "stock_quote": 0, "name": ""}}
												  };

									if (rows[1] && rows[1].length > 0) {

										balance["opening"]["uom_quote"]["stock_quote"] = Number.parseFloat(rows[1][0]["quantity_ordered"]).toFixed(2);;
										balance["opening"]["uom_quote"]["uom_id"] = (rows[0][0] ? rows[0][0]["stock_uom_quote"] : "");
										balance["opening"]["uom_quote"]["name"] =  (rows[0][0] ? rows[0][0]["stock_uom_quote_name"] : "");
										balance["opening"]["uom_quote"]["short_name"] =  (rows[0][0] ? rows[0][0]["stock_uom_quote_short_name"] : "");

										balance["opening"]["uom_qty"]["stock_qty"] = Number.parseFloat(rows[1][0]["quantity_entered"]).toFixed(2);;
										balance["opening"]["uom_qty"]["uom_id"] =  (rows[0][0] ? rows[0][0]["stock_uom_qty"] : "");
										balance["opening"]["uom_qty"]["name"] =  (rows[0][0] ? rows[0][0]["stock_uom_qty_name"] : "");
										balance["opening"]["uom_qty"]["short_name"] =  (rows[0][0] ? rows[0][0]["stock_uom_qty_short_name"] : "");

										stock_quote = stock_quote + rows[1][0]["quantity_ordered"];
										stock_qty = stock_qty + rows[1][0]["quantity_entered"];
										stock_quote = Number.parseFloat(stock_quote).toFixed(2);
										stock_qty = Number.parseFloat(stock_qty).toFixed(2);

										balance["closing"]["uom_quote"]["stock_quote"] = stock_quote;
										balance["closing"]["uom_quote"]["uom_id"] =  (rows[0][0] ? rows[0][0]["stock_uom_quote"] : "");
										balance["closing"]["uom_quote"]["name"] =  (rows[0][0] ? rows[0][0]["stock_uom_quote_name"] : "");
										balance["closing"]["uom_quote"]["short_name"] =  (rows[0][0] ? rows[0][0]["stock_uom_quote_short_name"] : "");

										balance["closing"]["uom_qty"]["stock_qty"] = stock_qty;
										balance["closing"]["uom_qty"]["uom_id"] =  (rows[0][0] ? rows[0][0]["stock_uom_qty"] : "");
										balance["closing"]["uom_qty"]["name"] =  (rows[0][0] ? rows[0][0]["stock_uom_qty_name"] : "");
										balance["closing"]["uom_qty"]["short_name"] =  (rows[0][0] ? rows[0][0]["stock_uom_qty_short_name"] : "");


									}

									return callback(null, stockJournalList, balance);
								
								}
								else {
									err = new Err();
									err.code    = feedbackrows[0].err;
									err.message = feedbackrows[0].msg;
									return callback(err, null);
								}
							});
/*	
	
							if (rows && rows[0]) { 
								for (i=0; i < rows[0].length; i++) {
console.log("mapping");
									stockJournalList.push (Map.mapToBStockJournal(rows[0][i]));
								}
							}
console.log("here");
							return callback(null, stockJournalList);
*/
						}
	);

};

exports.findAllStockBuckets = function (companyid, productid, issystem, activeonly, searchtext, session, connection, callback) {

	if (!issystem) issystem = null;
	if (!activeonly) activeonly = 0;
	var cmd = "CALL spGetStockBucket(@err,@msg, ?, ?, ?, ?, ?, ?)";

	connection.query(cmd, [
							companyid, null, productid, issystem, activeonly, searchtext
						], function (err, rows) {

							if (err) return callback (err);

							var bucketList = [];
							if (rows && rows[0]) { 
								for (i=0; i < rows[0].length; i++) {
									bucketList.push (Map.mapToBStockBucket(rows[0][i]));
								}
							}
							return callback(null, bucketList);
						}
	);
};

exports.findStockBucketById = function (id, companyid, session, connection, callback) {

	var cmd = "CALL spGetStockBucket(@err,@msg, ?, ?, ?, ?, ?, ?)";

	connection.query(cmd, [
							companyid, id, null, null, 0, null
						], function (err, rows) {

							if (err) return callback (err);

							if (rows && rows[0] && rows[0].length > 0) { 
								var vxBucket = Map.mapToBStockBucket(rows[0][0]);

								cmd = "CALL spGetStockBucketDetail (@err, @msg, ?)";
								connection.query (cmd, [id], function (err, rows) {

									if (err) return callback (err, null);

									if (rows && rows[0]) {
									
										var text = "";

										for (i = 0; i < rows[0].length; i++) {
											if (vxBucket.uom_qty.id != rows[0][i].unit_of_measures_id && vxBucket.uom_quote.id != rows[0][i].unit_of_measures_id) {
												vxBucket.stock_bucket_detail.push(Map.mapToBStockBucketDetail(rows[0][i]));
						//						text = text + (text != "" ? " + " +  rows[0][i].quantity : rows[0][i].quantity);
											}
										}
						//				vxBucket.stock_qty_string = text;
										return callback(err, vxBucket);
									}

								});
							}
							else
								return callback(null, null);
						}
	);
};

var findPriceListByGroupId = function (groupid, companyid, session, connection, callback) {

	var cmd = "SELECT l.*, c.name as company_type_name, g.name as group_name FROM price_lists l INNER JOIN price_groups g ON g.id = l.price_groups_id LEFT JOIN company_types c ON l.company_types_id = c.id WHERE l.price_groups_id = ? AND l.companies_id = ?";

	connection.query(cmd, [
							groupid, companyid
						], function (err, rows) {

							if (err) return callback (err);

							var priceListList = [];
							if (rows && rows.length > 0) { 
								for (i=0; i < rows.length; i++) {
									priceListList.push (Map.mapToBPriceList(rows[i]));
								}
							}
							return callback(null, priceListList);
						}
	);
};

var findUOMConversionListByUOMId = function (uomid, companyid, session, connection, callback) {

	var cmd = "SELECT c.*, f.name as from_uom_name, f.short_name as from_uom_short_name, t.name as to_uom_name, t.short_name as to_uom_short_name FROM unit_conversions c INNER JOIN unit_of_measures f ON f.id = c.from_uom_id INNER JOIN unit_of_measures t ON t.id = c.to_uom_id WHERE c.unit_of_measures_id = ?";

	connection.query(cmd, [
							uomid
						], function (err, rows) {

							if (err) return callback (err);

							var uomConversionList = [];
							if (rows && rows.length > 0) { 
								for (i=0; i < rows.length; i++) {
									uomConversionList.push (Map.mapToBUOMConversion(rows[i]));
								}
							}
							return callback(null, uomConversionList);
						}
	);
};

exports.findPriceGroupById = function (id, companyid, pricegrouptypeid, session, connection, callback) {

	
	var cmd;
	var paralist = [];
	
	if (Util.isEmptyString(pricegrouptypeid)) {
	 	cmd = "SELECT g.* FROM price_groups g WHERE g.id = ? AND g.companies_id = ?";
	 	paralist.push(id);
	 	paralist.push(companyid);
	 }
	 else {
	 	cmd = "SELECT g.* FROM price_groups g WHERE g.id = ? AND g.companies_id = ? AND syspricelevels_id = ?";
	 	paralist.push(id);
	 	paralist.push(companyid);
	 	paralist.push(pricegrouptypeid);
	 }

	connection.query(cmd, paralist, function (err, rows) {

							if (err) return callback (err);
							if (rows && rows.length > 0) {
								var priceGroup = Map.mapToBPriceGroup(rows[0]);

								async.parallel([
									function (callback) {

										findPriceListByGroupId(id, companyid, session, connection, function(err, priceListList) {
											if (priceListList != null) {
												priceGroup.pricelistlist = priceListList;
											}
											return callback(null, priceGroup);
										});
									
									}/* moved uom thing away from price group,
									
									function (callback) {

										findUOMConversionListByUOMId(id, companyid, session, connection, function(err, uomConversionList) {
											if (uomConversionList != null) {
												priceGroup.uomconversionlist = uomConversionList;
											}
											return callback(null, priceGroup);
										});

									}*/
									
								], function (err, results) {

									return callback(err, priceGroup);
								});
								
/*
								findPriceListByGroupId(id, companyid, session, connection, function(err, priceListList) {
									if (priceListList != null) {
										priceGroup.pricelistlist = priceListList;
									}
									return callback(null, priceGroup);
								});
*/
							}
							else
								return callback(null, null);
						}
	);
};

exports.findAllPriceGroups = function (companyid, pricegrouptypeid, sortby, sortorder, session, connection, callback) {

	let cmd;
	let paralist = [companyid];
	if (Util.isEmptyString(pricegrouptypeid)) 
		cmd = "SELECT g.*,u.name as uom_name FROM price_groups g inner join unit_of_measures u on g.unit_of_measures_id = u.id  WHERE g.companies_id = ? "; //ORDER BY g.name";
	else {
		cmd = "SELECT g.*,u.name as uom_name FROM price_groups g inner join unit_of_measures u on g.unit_of_measures_id = u.id WHERE g.companies_id = ? AND syspricelevels_id = ? "; //ORDER BY g.name";
		paralist.push(pricegrouptypeid);
	}

 	let sortBy = (sortby ? sortby : "g.name");
 	let sortDirection = (sortorder && sortorder == -1 ? "DESC" : "ASC");

 	if (sortBy == "name") sortBy = "g.name";
 	if (sortBy == "description") sortBy = "g.description";
 	if (sortBy == "uom_name") sortBy = "u.name";
 	if (sortBy == "price") sortBy = "g.unit_price";

	cmd = cmd + " ORDER BY " + sortBy + " " + sortDirection;

	connection.query(cmd, paralist, function (err, rows) {

							if (err) return callback (err);

							var priceGroupList = [];
							if (rows && rows.length > 0) { 
								for (i=0; i < rows.length; i++) {
									priceGroupList.push (Map.mapToBPriceGroup(rows[i]));
								}
							}
							return callback(null, priceGroupList);
						}
	);
};

exports.createPriceList = function (xPriceList, companyid, session, connection, callback) {

	async.eachSeries(xPriceList, function iterator(xPrice, callback) {

		//TODO: validate more fields
		if (Util.isEmptyString(xPrice.uom_id) || xPrice.uom_id == -1) {

			var err = new Err();
			err.code    = "-301";
			err.message = "UOM not found.";
			return callback(err);

		}

		var cmd = "INSERT INTO price_lists (companies_id, price_groups_id, products_id, company_types_id, unit_of_measures_id, qty_from, qty_to, unit_price, last_updated_by, created, last_updated) ";
		cmd = cmd + " VALUES (?, ?, ?, ?, ?, 0, 10000, ?, ?, NOW(), NOW())";
							
		connection.query(cmd, [
								companyid, xPrice.group_id, (xPrice.product_id === "" ? null : xPrice.product_id), (xPrice.customer_type_id === "" ? null : xPrice.customer_type_id), xPrice.uom_id, xPrice.unit_price, session.user.id
							], function (err, row) {
						
								if (row && row.affectedRows == 1) {
									xPrice.id = row.insertId;
									return callback(null, xPriceList);
								}
								else
									return callback(err, null);

		});

	}, function (err) {
		callback(err);
	});

};

exports.updatePriceList = function (xPriceList, companyid, session, connection, callback) {

	lInsertNeeded = [];

	async.eachSeries(xPriceList, function(xPrice, callback) {
		var cmd = "UPDATE price_lists SET  unit_of_measures_id = ?, unit_price = ?, last_updated_by = ? WHERE price_groups_id = ? AND company_types_id = ? AND companies_id = ?";
		connection.query(cmd, [
								xPrice.uom_id, xPrice.unit_price, session.user.id, xPrice.group_id, xPrice.customer_type_id, companyid
							], function (err, row) {
					
								if (row && row.affectedRows == 1) {
									return callback(null, xPriceList);
								}
								else {
									lInsertNeeded.push(xPrice);
									return callback(null, xPrice);
								}

		});

	}, function (err) {
		if (lInsertNeeded.length > 0) {
			exports.createPriceList(lInsertNeeded, companyid, session, connection, function(err, xPriceList) {
				if (err)
					return callback(err, null);
				else
					callback(err, xPriceList);
			});	
		}
		else
			return callback(null, xPriceList);

	});


};

exports.createStock = function (companyid, xStockJournal, session, connection, callback) {

	var bucketid = null;

	if (xStockJournal.product_id === "") {
		err = new Err();
		err.code    = "-101";
		err.message = "Product id must exist.";
		return callback(err, null);
	}

	if (xStockJournal.order_id === "") {
		xStockJournal.order_id = null;
	}

	if (xStockJournal.packing_slip_id === "") {
		xStockJournal.packing_slip_id = null;
	}

	xStockJournal.user_id = session.user.id;

	xStockJournal.transaction_date = (xStockJournal.transaction_date ? new Date(xStockJournal.transaction_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	if (xStockJournal.transaction_date != null && xStockJournal.transaction_date != "" && new Date(xStockJournal.transaction_date) > new Date()) {
		err = new Err();
		err.code    = "-102";
		err.message = "Invalid transaction date.";
		return callback(err, null);
	}

	let cmd = "CALL spCreateStock(@err, @msg, @id, @bucketid, ?,?,?,?,?,?,?, ?,?,?,?)";

	connection.query(cmd, [
						companyid, xStockJournal.product_id, xStockJournal.transaction_date || null, xStockJournal.description, xStockJournal.cost_price || 0, xStockJournal.stock_qty, 
						xStockJournal.stock_quote, xStockJournal.order_id, xStockJournal.packing_slip_id, xStockJournal.user_id, xStockJournal.stock_bucket_code], function (err, rows) {
				
							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id, @bucketid as bucketid", function (err, rows) {
								if (rows && rows[0] && rows[0].err === 0) {
									xStockJournal.id = rows[0].id;
									bucketid         = rows[0].bucketid;
									
									if (bucketid == null || bucketid == undefined)
										callback(null, xStockJournal);

									else {
								
										//check if batch (pieces) are available. If yes, insert

										var text = "";	// text to store individual pieces in one string
										
										async.eachSeries(xStockJournal.batch_list, function iterator(xBatch, callback) {

											cmd = "INSERT INTO stock_bucket_details (stock_buckets_id, description, quantity, unit_of_measures_id, sequence_number, piece_count, created, last_updated) VALUES (?, ?, ?, ?, ?, ?, now(), now())";

											var id = null;
											connection.query(cmd, [
																	bucketid, xBatch.description, xBatch.qty, xBatch.uom.id, xBatch.index, xBatch.piece_count
																  ], function (err, row) {
																		if (err) return callback (err);

																		if (row && row.affectedRows == 1) {
																			xBatch.id = row.insertId;
																			
//																			var xText = (xBatch.piece_count > 1 ? xBatch.qty + " (" + xBatch.piece_count + ")" : xBatch.qty);
																			var xText = (xBatch.piece_count > 1 ? xBatch.qty + " (*)" + xBatch.piece_count + ")" : xBatch.qty);
																			text = text + (text != "" ? " + " +  xText : xText);

																			cmd = "INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, unit_of_measures_id, quantity, created, last_updated) VALUES (?, ?, ?, ?, ?, now(), now())";
																			connection.query(cmd, [
																									xStockJournal.id, bucketid, xBatch.id, xBatch.uom.id, xBatch.qty
																								  ], function (err, row) {

																										if (err) return callback (err);

																										if (row && row.affectedRows == 1) {
																											return callback(null, xStockJournal);
																										}
																										else {
																											err = new Err();
																											err.code    = "-101";
																											err.message = "Unknown Error";
																											return callback(err, null);
																										}
																			});
																		}
																		else
																			return callback(err, null);


																	}
											);

										}, function (err) {

											if (text != "") {
												cmd = "UPDATE stock_buckets SET stock_quote_string = ? WHERE id = ?";
												connection.query(cmd, [
																		text, bucketid
																	  ], function (err, row) {
																			if (err) return callback (err);

																			if (row && row.affectedRows == 1) {
																				callback(err, xStockJournal);
																			}
																		});
											}
											else
													callback(err, xStockJournal);


										});	
																												
									}
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
	


};


exports.updateStockJournalSyncStatus = function (companyid, id, sync_status_id, session, connection, callback) {

	connection.query("UPDATE stock_journal set syssyncstatuses_id=?, last_updated = NOW() where id=?", [sync_status_id, id], function (err, row) {

		if (err) callback(err);

		if (row && row.affectedRows == 1) {
			return callback(null, id);
		}
		else
			return callback(err, null);
	});
};

exports.updateStockBucket = function (companyid, id, xStockJournal, session, connection, callback) {


//16227
	if (xStockJournal.product_id === "") {
		err = new Err();
		err.code    = "-101";
		err.message = "Product id must exist.";
		return callback(err, null);
	}

	if (xStockJournal.order_id === "") {
		xStockJournal.order_id = null;
	}

	if (xStockJournal.packing_slip_id === "") {
		xStockJournal.packing_slip_id = null;
	}

	xStockJournal.user_id = session.user.id;

	var cmd = "CALL spAdjustStockBucket(@err, @msg, @id, @bucketid, ?,?,?,?,?,?,?, ?,?,?,?)";

	connection.query(cmd, [
						xStockJournal.stock_bucket_code, companyid, xStockJournal.product_id, null, xStockJournal.description, xStockJournal.cost_price, xStockJournal.stock_qty, 
						xStockJournal.stock_quote, xStockJournal.order_id, xStockJournal.packing_slip_id, xStockJournal.user_id], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id, @bucketid as bucketid", function (err, rows) {
								if (rows && rows[0] && rows[0].err === 0) {
									xStockJournal.id = rows[0].id;
									bucketid         = rows[0].bucketid;
									
									if (bucketid == null || bucketid == undefined)
										callback(null, xStockJournal);

									else {
								
										//check if batch (pieces) are available. If yes, insert

										var text = "";	// text to store individual pieces in one string
										
										async.eachSeries(xStockJournal.batch_list, function iterator(xBatch, callback) {

											cmd = "UPDATE stock_bucket_details SET description = ?, quantity = quantity + ?, piece_count = ?, last_updated = NOW() WHERE id = ?"; //stock_buckets_id = ? AND unit_of_measures_id = ? AND sequence_number = ? ";

											var id = null;
											connection.query(cmd, [
																	xBatch.description,  xBatch.qty, xBatch.piece_count, xBatch.id
																  ], function (err, row) {
																		if (err) return callback (err);


																		if (row && row.affectedRows == 1) {
																			
																			cmd = "INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, unit_of_measures_id, quantity, created, last_updated) VALUES (?, ?, ?, ?, ?, now(), now())";
																			connection.query(cmd, [
																									xStockJournal.id, bucketid, xBatch.id, xBatch.uom.id, xBatch.qty
																								  ], function (err, row) {

																										if (err) return callback (err);

																										if (row && row.affectedRows == 1) {

																											cmd = "SELECT quantity, piece_count FROM stock_bucket_details WHERE id = ?";
																											connection.query (cmd, [xBatch.id], function (err, rows)
																											{
																												if (err) return callback (err);

																												if (rows && rows.length > 0) {
//																													var xText = (rows[0].piece_count > 1 ? rows[0].quantity + " (" + rows[0].piece_count + ")" : rows[0].quantity);
																													var xText = (rows[0].piece_count > 1 ? rows[0].quantity + " (*)" : rows[0].quantity);
																													text = text + (text != "" ? " + " +  xText : xText);
																												}

																												return callback(null, xStockJournal);
																											});
																										}
																										else {
																											err = new Err();
																											err.code    = "-101";
																											err.message = "Unknown Error";
																											return callback(err, null);
																										}
																			});
																		}
																		else
																			return callback(err, null);


																	}
											);

										}, function (err) {
											if (text != "") {
												cmd = "UPDATE stock_buckets SET stock_quote_string = ? WHERE id = ?";
												connection.query(cmd, [
																		text, bucketid
																	  ], function (err, row) {
																			if (err) return callback (err);

																			if (row && row.affectedRows == 1) {
																				callback(err, xStockJournal);
																			}
																		});
											}
											else
													callback(err, xStockJournal);
										});	
																													
									}
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
	


};

exports.deleteStockBucket = function (companyid, id, xStockJournal, session, connection, callback) {

	var bucketid = null;

	if (xStockJournal.product_id === "") {
		err = new Err();
		err.code    = "-101";
		err.message = "Product id must exist.";
		return callback(err, null);
	}

	if (xStockJournal.order_id === "") {
		xStockJournal.order_id = null;
	}

	if (xStockJournal.packing_slip_id === "") {
		xStockJournal.packing_slip_id = null;
	}

	xStockJournal.user_id = session.user.id;

	var cmd = "CALL spAdjustStockBucket(@err, @msg, @id, @bucketid, ?,?,?,?,?,?,?, ?,?,?,?)";

	connection.query(cmd, [
						xStockJournal.stock_bucket_code, companyid, xStockJournal.product_id, null, xStockJournal.description, xStockJournal.cost_price, xStockJournal.stock_qty, 
						xStockJournal.stock_quote, xStockJournal.order_id, xStockJournal.packing_slip_id, xStockJournal.user_id], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id, @bucketid as bucketid", function (err, rows) {
								if (rows && rows[0] && rows[0].err === 0) {
									xStockJournal.id = rows[0].id;
									bucketid         = rows[0].bucketid;
									
									if (bucketid == null || bucketid == undefined)
										callback(null, xStockJournal);

									else {
								
										//check if batch (pieces) are available. If yes, insert

										var text = "";	// text to store individual pieces in one string
										
										async.eachSeries(xStockJournal.batch_list, function iterator(xBatch, callback) {

											cmd = "UPDATE stock_bucket_details SET description = ?, quantity = quantity + ?, piece_count = ?, last_updated = NOW() WHERE id = ?"; //stock_buckets_id = ? AND unit_of_measures_id = ? AND sequence_number = ? ";

											var id = null;
											connection.query(cmd, [
																	xBatch.id
																  ], function (err, row) {
																		if (err) return callback (err);


																		if (row && row.affectedRows == 1) {
																			
																			cmd = "INSERT INTO stock_journal_details (stock_journal_id, stock_buckets_id, stock_bucket_details_id, unit_of_measures_id, quantity, created, last_updated) VALUES (?, ?, ?, ?, ?, now(), now())";
																			connection.query(cmd, [
																									xStockJournal.id, bucketid, xBatch.id, xBatch.uom.id, xBatch.qty
																								  ], function (err, row) {

																										if (err) return callback (err);

																										if (row && row.affectedRows == 1) {

																											cmd = "SELECT quantity, piece_count FROM stock_bucket_details WHERE id = ?";
																											connection.query (cmd, [xBatch.id], function (err, rows)
																											{
																												if (err) return callback (err);

																												if (rows && rows.length > 0) {
//																													var xText = (rows[0].piece_count > 1 ? rows[0].quantity + " (" + rows[0].piece_count + ")" : rows[0].quantity);
																													var xText = (rows[0].piece_count > 1 ? rows[0].quantity + " (*)" : rows[0].quantity);
																													text = text + (text != "" ? " + " +  xText : xText);
																												}

																												return callback(null, xStockJournal);
																											});
																										}
																										else {
																											err = new Err();
																											err.code    = "-101";
																											err.message = "Unknown Error";
																											return callback(err, null);
																										}
																			});
																		}
																		else
																			return callback(err, null);


																	}
											);

										}, function (err) {
											if (text != "") {
												cmd = "UPDATE stock_buckets SET stock_quote_string = ?, sysstatuses_id = 4602 WHERE id = ?";
												connection.query(cmd, [
																		text, bucketid
																	  ], function (err, row) {
																			if (err) return callback (err);

																			if (row && row.affectedRows == 1) {
																				callback(err, xStockJournal);
																			}
																		});
											}
											else
													callback(err, xStockJournal);
										});	

									}
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

};

exports.createPriceGroup = function (companyid, xPriceGroup, session, connection, callback) {

	if (xPriceGroup.pricelistlist.length > 0) {

		var maxPrice = 0;
		for (i = 0; i < xPriceGroup.pricelistlist.length; i++) {
			if (xPriceGroup.pricelistlist[i].unit_price > maxPrice) maxPrice = xPriceGroup.pricelistlist[i].unit_price;
		}

		var cmd = "CALL spCreatePriceGroup(@err,@msg, @id, ?, ?, ?, ?, ?, ?)";

		connection.query(cmd, [
								companyid, xPriceGroup.name, xPriceGroup.description, Util.CONST_PRICING_PRODUCT_PRICEGROUP, maxPrice, xPriceGroup.uom_id
							], function (err, rows) {

								if (err) return callback (err);

								connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
									if (rows && rows[0] && rows[0].err === 0) {
										xPriceGroup.id = rows[0].id;
										for (i = 0; i < xPriceGroup.pricelistlist.length; i++) {
											xPriceGroup.pricelistlist[i].group_id = xPriceGroup.id;
											if (!xPriceGroup.pricelistlist[i].uom_id || xPriceGroup.pricelistlist[i].uom_id == "") xPriceGroup.pricelistlist[i].uom_id = xPriceGroup.uom_id;
										}
										exports.createPriceList(xPriceGroup.pricelistlist, companyid, session, connection, function(err, xPriceList) {
											if (err) return callback(err, null);
											return callback (err, xPriceGroup);
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
/*

								if (rows && rows[0] && rows[0].length > 0)
	
								if (row && row.affectedRows == 1) {
									xPriceGroup.id = row.insertId;
									for (i = 0; i < xPriceGroup.pricelist.length; i++) {
										xPriceGroup.pricelist[i].group_id = xPriceGroup.id;
									}
									exports.createPriceList(xPriceGroup.pricelist, companyid, session, connection, function(err, xPriceList) {
										if (err) return callback(err, null);
										return callback(null, xPriceGroup);
									});
								}
								else
									return callback(err, null); */

		});
	}
	else {

		var err = new Err();
		err.code    = "-100";
		err.message = "Price list is empty.";
		return callback(err, null);

	}
};

exports.createPriceGroup_old = function (companyid, xPriceGroup, session, connection, callback) {

	if (xPriceGroup.pricelistlist.length > 0) {

		var cmd = "CALL spCreatePriceGroup(@err,@msg, @id, ?, ?, ?, ?, ?, ?)";

		connection.query(cmd, [
								companyid, xPriceGroup.name, xPriceGroup.description, Util.CONST_PRICING_PRODUCT_PRICEGROUP, xPriceGroup.unit_price, xPriceGroup.uom_id
							], function (err, rows) {

								if (err) return callback (err);

								connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
									if (rows && rows[0] && rows[0].err === 0) {
										xPriceGroup.id = rows[0].id;
										for (i = 0; i < xPriceGroup.pricelistlist.length; i++) {
											xPriceGroup.pricelistlist[i].group_id = xPriceGroup.id;
										}
										for (i = 0; i < xPriceGroup.uomconversionlist.length; i++) {
											xPriceGroup.uomconversionlist[i].group_id = xPriceGroup.id;
										}
										exports.createPriceList(xPriceGroup.pricelistlist, companyid, session, connection, function(err, xPriceList) {
											if (err) return callback(err, null);
											exports.createUpdateUOMConversionList(xPriceGroup.id, xPriceGroup.uomconversionlist, null, companyid, session, connection, function (err, xUOMConversionList) {
												if (err) return callback(err, null);
												return callback (err, xPriceGroup);
											});
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
/*

								if (rows && rows[0] && rows[0].length > 0)
	
								if (row && row.affectedRows == 1) {
									xPriceGroup.id = row.insertId;
									for (i = 0; i < xPriceGroup.pricelist.length; i++) {
										xPriceGroup.pricelist[i].group_id = xPriceGroup.id;
									}
									exports.createPriceList(xPriceGroup.pricelist, companyid, session, connection, function(err, xPriceList) {
										if (err) return callback(err, null);
										return callback(null, xPriceGroup);
									});
								}
								else
									return callback(err, null); */

		});
	}
	else {

		var err = new Err();
		err.code    = "-100";
		err.message = "Price list is empty.";
		return callback(err, null);

	}
};

var updateAllProductPriceWithPriceGroup = function (pricegroupid, connection, callback) {

	var cmd = "UPDATE products INNER JOIN price_groups pg ON pg.id = products.price_groups_id SET products.unit_price = pg.unit_price, products.stock_unit_of_measures_id = pg.unit_of_measures_id, products.unit_of_measures_id = pg.unit_of_measures_id, products.last_updated = NOW() WHERE pg.id = ?";
	connection.query(cmd, [
							pricegroupid
						], function (err, row) {
								if (err)
									callback (err, null);
								else
									callback(err, 1);

	});

};

exports.updatePriceGroup = function (companyid, xPriceGroup, session, connection, callback) {

	var maxPrice = 0;
	for (i = 0; i < xPriceGroup.pricelistlist.length; i++) {
		if (xPriceGroup.pricelistlist[i].unit_price > maxPrice) maxPrice = xPriceGroup.pricelistlist[i].unit_price;
		xPriceGroup.pricelistlist[i].uom_id = xPriceGroup.uom_id;
	}

	if (xPriceGroup.pricelistlist.length > 0) {
	
		var cmd = "UPDATE price_groups SET name = ?, description = ?, unit_price = ?, unit_of_measures_id = ? , last_updated = NOW() WHERE id = ? AND companies_id = ?";
		connection.query(cmd, [
								xPriceGroup.name, xPriceGroup.description, maxPrice, xPriceGroup.uom_id, xPriceGroup.id, companyid
							], function (err, row) {

								if (row && row.affectedRows == 1) {
									for (i = 0; i < xPriceGroup.pricelistlist.length; i++) {
										xPriceGroup.pricelistlist[i].group_id = xPriceGroup.id;
									}

									exports.updatePriceList(xPriceGroup.pricelistlist, companyid, session, connection, function(err, xPriceList) {
										if (err) return callback(err, null);
										updateAllProductPriceWithPriceGroup(xPriceGroup.id, connection, function(err, flag) {
											if (err) return callback(err, null);
											return callback(null, xPriceGroup);
										});
									});

								}
								else
									return callback(err, null);

		});
	}
	else {

		var err = new Err();
		err.code    = "-100";
		err.message = "Price list is empty.";
		return callback(err, null);

	}
};

exports.findProductAllUOM = function (companyid, productid, customerid, session, connection, callback) {
	/* TODO: Add companyID here */ 
//	var cmd = "SELECT u.* FROM unit_of_measures u, products p WHERE p.id = ? AND p.unit_of_measures_id = u.id UNION SELECT u.* FROM unit_of_measures u, products p WHERE p.id = ? AND p.default_qty_uom_id = u.id UNION SELECT u.* FROM unit_of_measures u WHERE u.id IN (SELECT from_uom_id FROM unit_conversions c WHERE c.unit_of_measures_id IN (SELECT unit_of_measures_id FROM products p WHERE p.id = ? UNION SELECT default_qty_uom_id FROM products p WHERE p.id = ? )) UNION SELECT u.* FROM unit_of_measures u WHERE u.id IN (SELECT to_uom_id FROM unit_conversions c WHERE c.unit_of_measures_id IN (SELECT unit_of_measures_id FROM products p WHERE p.id = ? UNION SELECT default_qty_uom_id FROM products p WHERE p.id = ? ))";
	var cmd = "SELECT u.* FROM unit_of_measures u, products p WHERE p.id = ? AND p.default_qty_uom_id = u.id UNION SELECT u1.* FROM unit_of_measures u, products p, unit_of_measures u1 WHERE p.id = ? AND p.default_qty_uom_id = u.id AND u1.id = u.end_uom_id AND u.end_uom_id IS NOT NULL";
	connection.query(cmd, [
							productid, productid, productid, productid, productid, productid
						], function (err, rows) {

							if (err) return callback (err);

							var uomList = [];
							if (rows && rows.length > 0) { 
									/*
									for (i=0; i < rows.length; i++) {
										uomList.push (Map.mapToBUnitOfMeasure(rows[i]));
									}
									*/

									async.each(rows, function (row, incb) {

										var uomobj = Map.mapToBUnitOfMeasure(row);
										uomList.push (uomobj);

										// if (customerid) {
											findProductPriceByCustomerAndUOMId (companyid, productid, customerid, row.id, connection, function(err, pricerows) {

												if (err) return incb(err);

												if (pricerows && pricerows[0])
													uomobj.unit_price = pricerows[0].unit_price;

												incb (err, null);
											});	
										// }
										// else
										// 	incb(err, null);

									}, function (err) {
										// all done
										return callback(null, uomList);
									}); 

							}
							else
								return callback(null, uomList);

	});

};

exports.findProductAllUOM_ORIG = function (companyid, productid, customerid, session, connection, callback) {
	/* TODO: Add companyID here */ 
	var cmd = "SELECT u.* FROM unit_of_measures u, products p WHERE p.id = ? AND p.unit_of_measures_id = u.id UNION SELECT u.* FROM unit_of_measures u, products p WHERE p.id = ? AND p.default_qty_uom_id = u.id UNION SELECT u.* FROM unit_of_measures u WHERE u.id IN (SELECT from_uom_id FROM unit_conversions c WHERE c.unit_of_measures_id IN (SELECT unit_of_measures_id FROM products p WHERE p.id = ? UNION SELECT default_qty_uom_id FROM products p WHERE p.id = ? )) UNION SELECT u.* FROM unit_of_measures u WHERE u.id IN (SELECT to_uom_id FROM unit_conversions c WHERE c.unit_of_measures_id IN (SELECT unit_of_measures_id FROM products p WHERE p.id = ? UNION SELECT default_qty_uom_id FROM products p WHERE p.id = ? ))";

	connection.query(cmd, [
							productid, productid, productid, productid, productid, productid
						], function (err, rows) {

							if (err) return callback (err);

							var uomList = [];
							if (rows && rows.length > 0) { 
									/*
									for (i=0; i < rows.length; i++) {
										uomList.push (Map.mapToBUnitOfMeasure(rows[i]));
									}
									*/

									async.each(rows, function (row, incb) {

										var uomobj = Map.mapToBUnitOfMeasure(row);
										uomList.push (uomobj);

										if (customerid) {
											findProductPriceByCustomerAndUOMId (companyid, productid, customerid, row.id, connection, function(err, pricerows) {

												if (err) return incb(err);

												if (pricerows && pricerows[0])
													uomobj.unit_price = pricerows[0].unit_price;

												incb (err, null);
											});	
										}
										else
											incb(err, null);

									}, function (err) {
										// all done
										return callback(null, uomList);
									}); 

							}
							else
								return callback(null, uomList);

	});

};

var findProductPriceByCustomerAndUOMId = function (companyid, productid, customerid, uomid, connection, callback) {

	var cmd = "";

	cmd = cmd + " SELECT p.unit_price as unit_price";
	cmd = cmd + " FROM products p";
	cmd = cmd + " WHERE p.id = ? ";
	cmd = cmd + " AND p.syspricelevels_id = 4800";
	cmd = cmd + " AND p.unit_of_measures_id = ? ";
	cmd = cmd + " AND p.companies_id = ? ";
	cmd = cmd + " UNION ";
	cmd = cmd + " SELECT (p.unit_price * d.from_qty)/d.to_qty as unit_price" ;
	cmd = cmd + " FROM products p, unit_conversion_details d"
	cmd = cmd + " WHERE p.id = ? "
	cmd = cmd + " AND p.syspricelevels_id = 4800 "
	cmd = cmd + " AND p.unit_of_measures_id = d.from_uom_id "
	cmd = cmd + " AND d.unit_of_measures_id = p.default_qty_uom_id "
	cmd = cmd + " AND d.to_uom_id = ? ";
	cmd = cmd + " AND p.companies_id = ? ";

	if (customerid) {
	    cmd = cmd + " UNION ";
	    cmd = cmd + " SELECT l.unit_price as unit_price";
	    cmd = cmd + " FROM products p, companies c, price_lists l";
	    cmd = cmd + " WHERE c.id = ?";  
	    cmd = cmd + " AND l.price_groups_id = p.price_groups_id ";
	    cmd = cmd + " AND l.company_types_id = c.companytypes_id ";
	    cmd = cmd + " AND p.syspricelevels_id IN (4802, 4801) ";
	    cmd = cmd + " AND p.id = ?"; 
	    cmd = cmd + " AND l.companies_id = ?";
	    cmd = cmd + " AND l.unit_of_measures_id = ?";
	    cmd = cmd + " UNION ";
		cmd = cmd + " SELECT (l.unit_price * d.from_qty)/d.to_qty as unit_price  ";
		cmd = cmd + " FROM products p, price_lists l, companies c, unit_conversion_details d  ";
		cmd = cmd + " WHERE c.id = ? "; 
		cmd = cmd + " AND p.syspricelevels_id IN (4802, 4801) ";
		cmd = cmd + " AND p.id = ? ";
		cmd = cmd + " AND l.price_groups_id = p.price_groups_id ";
		cmd = cmd + " AND l.company_types_id = c.companytypes_id ";
		cmd = cmd + " AND l.unit_of_measures_id = d.from_uom_id ";
		cmd = cmd + " AND d.unit_of_measures_id = p.default_qty_uom_id ";
		cmd = cmd + " AND l.companies_id = ? ";
		cmd = cmd + " AND d.to_uom_id    = ? ";
	}
	else {
	    cmd = cmd + " UNION ";
	    cmd = cmd + " SELECT p.unit_price as unit_price";
	    cmd = cmd + " FROM products p";
	    cmd = cmd + " WHERE p.id = ?"; 
	    cmd = cmd + " AND p.companies_id = ?";
	    cmd = cmd + " AND p.unit_of_measures_id = ?";
	    cmd = cmd + " UNION ";
		cmd = cmd + " SELECT (p.unit_price * d.from_qty)/d.to_qty as unit_price  ";
		cmd = cmd + " FROM products p, companies c, unit_conversion_details d  ";
		cmd = cmd + " WHERE p.syspricelevels_id IN (4802, 4801) ";
		cmd = cmd + " AND p.id = ? ";
		cmd = cmd + " AND p.unit_of_measures_id = d.from_uom_id ";
		cmd = cmd + " AND d.unit_of_measures_id = p.default_qty_uom_id ";
		cmd = cmd + " AND p.companies_id = ? ";
		cmd = cmd + " AND d.to_uom_id    = ? ";
	}

	var parameterList;

	if (customerid) {
		parameterList = [
							productid, uomid, companyid, productid, uomid, companyid,   customerid, productid, companyid, uomid, customerid, productid, companyid, uomid
						];
	}
	else {
		parameterList = [
							productid, uomid, companyid, productid, uomid, companyid, productid, companyid, uomid, productid, companyid, uomid
						];
	}

	connection.query(cmd, parameterList, function (err, rows) {

							if (err) return callback (err);
							return callback(err, rows);
						});
 
 	/*
	select * from products p, companies c, price_lists l, unit_conversion_details d  
	where c.id = ? 
	AND p.syspricelevels_id IN (4802, 4801) 
	and p.id = ?
	AND l.price_groups_id = p.price_groups_id
	AND l.companies_id = ?
	AND l.company_types_id = c.companytypes_id
	AND l.unit_of_measures_id = d.from_uom_id
	AND d.price_groups_id = p.price_groups_id
	AND d.to_uom_id      = ?

	select * 
	from products p JOIN price_lists l ON l.price_groups_id = p.price_groups_id 
	                JOIN companies c ON l.company_types_id = c.companytypes_id
	                LEFT JOIN unit_conversion_details d ON l.unit_of_measures_id = d.from_uom_id AND d.price_groups_id = p.price_groups_id
	where c.company_types_id = 10003 

	select CASE WHEN d.id IS NULL THEN p.unit_price ELSE (l.unit_price * d.from_qty)/d.to_qty END as unit_price  
	from products p JOIN price_lists l ON l.price_groups_id = p.price_groups_id 
	                JOIN companies c ON l.company_types_id = c.companytypes_id
	                LEFT JOIN unit_conversion_details d ON l.unit_of_measures_id = d.from_uom_id AND d.price_groups_id = p.price_groups_id
	where c.id = 10005 
	AND p.syspricelevels_id IN (4802, 4801) 
	cmd = cmd + " 	AND p.unit_of_measures_id = d.from_uom_id ";
	and p.id = 3
	AND l.companies_id = 10001
	AND d.to_uom_id      = 5005


	*/
	// add same from, to uom rows as well in unit_conversion_details
	// add unit_conversions as well for flat & variable

};
