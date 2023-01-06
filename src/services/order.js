var Map             = require("../utils/map");
var Err             = require("../bo/err");
var Util            = require("../utils");
var CompanyService  = require("./company");
var ProductService  = require("./product");
var UserService     = require("./user");
var MasterService   = require("./master");
var ConfigService   = require("./configuration");
var Config          = require("../config/config");
let moment          = require("moment-timezone");

var async           = require("async");
//var dateFormat 		= require('dateformat');
exports.findById = function (id, companyid, session, connection, cb) {
	var data ={};
	async.parallel([
		//Load Order
		function(callback){

			var cmd = "CALL spGetOrder(@err, @msg, @totalrecords, ?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?)";
			connection.query(cmd, [
									companyid, 
									id,
									session.user.id, 
									null,
									null,
									null, 
									null, 
									null, 
									null, 
									null,
									null,
									null, 
									null,
									null,
									1,
									1,
									null, 
									1
									], function (err, rows) {
										if (err) return callback (err);

										connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
											if (feedbackerr) return callback(feedbackerr);

											if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null) && feedbackrows[0].totalrecords > 0)
											{
												data.order = rows[0][0];
												return callback();
											}
											else {
												var err = new Err();
												if (feedbackrows && feedbackrows[0] && feedbackrows[0].err != 0) {
													err.code    = feedbackrows[0].err;
													err.message = feedbackrows[0].msg;
												}
												else if (feedbackrows && feedbackrows[0]) {
													err.code    = "-105";
													err.message = "Order not found.";
												}
												else {
													err.code    = "-101";
													err.message = "Unknown Error";
												}
												return callback(err);
											}

										});
									});

/*

			var cmd = "SELECT orders.*,(SELECT action_roles_id FROM order_workflow_routes owr WHERE owr.orders_id = orders.id AND owr.sysworkflowstatuses_id = 5100 AND orders.sysorderstatuses_id = 4203 ) as 'pending_approval_rolesid' FROM orders WHERE companies_id = ? and id = ?";
			connection.query(cmd, [
									companyid, id
								], function (err, rows) {
									if (err) return callback (err);
									data.order = rows[0];
									return callback();
								}
			);
*/
		},
		//Load OrderDetail
		function(callback){
//			var cmd = "SELECT OD.*,u.id as 'uom_id', u.name as 'uom_name', u.short_name as uom_short_name, entered_unit.name as 'entered_uom_name', entered_unit.short_name as entered_uom_short_name, p.sku, p.is_batched_inventory FROM order_details OD INNER JOIN unit_of_measures u ON OD.unit_of_measures_id = u.id INNER JOIN unit_of_measures entered_unit ON OD.entered_unit_of_measures_id = entered_unit.id INNER JOIN products p ON p.id = OD.products_id WHERE orders_id = ?";
			var cmd = "SELECT od.*,u.id as 'uom_id', u.name as 'uom_name', u.short_name as uom_short_name, entered_unit.name as 'entered_uom_name', entered_unit.short_name as entered_uom_short_name, p.sku, p.is_batched_inventory, p.image_url1, p.image_url2, p.image_url3, su.name as 'stock_uom_name', su.short_name as stock_uom_short_name, sau.name as 'stock_alt_uom_name', sau.short_name as stock_alt_uom_short_name, t.id as hsn_id, t.name as hsn_name, t.code as hsn_code, t.short_code as hsn_short_code, t.description as hsn_description, hd.tax_percent_gst, hd.tax_percent_cess, hd.tax_percent_igst, hd.tax_percent_cgst, hd.tax_percent_sgst FROM order_details od INNER JOIN unit_of_measures u ON od.unit_of_measures_id = u.id INNER JOIN unit_of_measures entered_unit ON od.entered_unit_of_measures_id = entered_unit.id INNER JOIN products p ON p.id = od.products_id INNER JOIN unit_of_measures su ON od.stock_unit_of_measures_id = su.id  INNER JOIN unit_of_measures sau ON od.stock_alt_unit_of_measures_id = sau.id INNER JOIN sysproducthsn t ON p.sysproducthsn_id = t.id INNER JOIN sysproducthsn_details hd ON t.id = hd.sysproducthsn_id WHERE orders_id = ? AND od.order_price BETWEEN hd.amount_min AND IFNULL(hd.amount_max, od.order_price) AND NOW() BETWEEN hd.activation_start_date AND IFNULL(hd.activation_end_date, DATE_ADD(NOW(), INTERVAL 10 MINUTE)) ";
			connection.query(cmd, [
									id
								], function (err, rows) {
									if (err) return callback(err);
									data.lineitems = rows;
									return callback();
								}
			);
		},

		//Load PackingDetails
		function(callback){
		 
			var cmd = "SELECT  ps.*, s.name as status_name FROM packing_slips ps, syspackingslipstatuses s WHERE ps.orders_id = ? AND s.id = ps.syspackingslipstatuses_id";
			connection.query(cmd, [
									id
								], function (err, rows) {
									if (err) return callback(err);
									data.packingslips = rows;
									return callback();
								}
			);
		}
	],

	//Error
	function(err){

	 	if (err) return cb(err); //If an error occured, we let express/connect handle it by calling the "next" 

	 	var bOrder;
	 	if (data.order)
			bOrder = Map.mapToBOrder(data.order); 

		for(var i=0; i < data.lineitems.length; i++)
		{
			bOrder.lineitems.push( Map.mapToBOrderDetail(data.lineitems[i]));
		}

		for(var i=0; i < data.packingslips.length; i++)
		{
			bOrder.packing_slips.push(Map.mapToBPackingSlip(data.packingslips[i]));
		}

		return cb(err, bOrder);

	});

};

exports.findAll = function (companyid, options, currentpage, recordsperpage, session, connection, callback) {


	// let momentDate = momentInput.tz(options.fromdate);
	// console.log(moment().format());

	// console.log(momentDate.format(), momentDate.utc().format(), moment.tz.guess(), moment.tz(options.fromdate, moment.tz.guess()).format());

	// let fromdate = (options.fromdate ? new Date(options.fromdate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);
	// let todate   = (options.todate   ? new Date(options.todate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	let fromdate, todate;

	if (options.fromdate) {
		fromdate = moment(options.fromdate).tz("UTC").format("YYYY-MM-DD");
	}

	if (options.todate) {
		todate = moment(options.todate).tz("UTC").format("YYYY-MM-DD");
	}

	let cmd = "CALL spGetOrder(@err, @msg, @totalrecords, ?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?)";
	
	let data = [
							companyid, 
							null,
							session.user.id, 
							(options.agentid ? options.agentid : null), 
							(options.customerid ? options.customerid : null), 
							(options.statusid ? options.statusid : null), 
							(options.deliverystatusid ? options.deliverystatusid : null), 
							(options.productid ? options.productid : null),
							(options.order_number ? options.order_number : null),
							fromdate, 
							todate, 
							(options.fromdate || options.todate ? 1 : null),
							(options.my_approval_only ? 1 : 0),
							currentpage, 
							recordsperpage,
							(options.sortby ? options.sortby : "id"),
							(options.sortorder ? options.sortorder : -1)
							];

	connection.query(cmd, data, function (err, rows) {
								if (err) return callback (err);
								var bOrder = [];
								connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
									if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
									{
										for(var i = 0; i <rows[0].length; i++)
										{
											bOrder.push(Map.mapToBOrder(rows[0][i])); 
											bOrder[i].totalrecords = feedbackrows[0].totalrecords;
										}
									
										return callback(null, bOrder);
									
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
								
								
							}
					);

};

exports.create = function (companyid, xOrder, session, connection, callback) {
	
	var	_customers_id 	= xOrder.customer.id  ,
		_companies_id	= companyid ,
		_order_date		= xOrder.order_date,//dateFormat(xOrder.date,'mm-dd-yyyy');//'2016-1-1',//xOrder.date ,
		_sub_total		= 0 ,
		_ship_total		= xOrder.ship_total,
		_tax_total		= xOrder.tax_total ,
		_discount_total	= xOrder.discount_total ,
		_sysorderstatuses_id= 4200 ,
		_orderusers_id		= session.user.id ,
		_ship_addresses_id	= xOrder.customer.ship_address.id ,//cusomer adfress
		_bill_addresses_id	= xOrder.customer.bill_address.id ,
		_approverusers_id	= null , //self
		_syssyncstatus_id	= 4100 , 
		_order_number		= xOrder.order_number ,
		_customer_order_number = xOrder.customer_order_number,
		_payment_terms_id	= xOrder.payment_terms_id , //come from UI
		_salespersons_id	= xOrder.customer.sales_person.id ,// customer's salesperson
		_item_count			= xOrder.lineitems.length, //number of lineitems,
		_transporters_id	= xOrder.transporters_id,
		_notes				= xOrder.notes,
		_internal_notes 	= xOrder.internal_notes,
		_agent_notes		= xOrder.agent_notes;
		_default_transporter_customer = xOrder.is_default_transporter;
		_default_payment_term_customer = xOrder.is_default_payment_term;

	var orderid 			= xOrder.id || 0;
	var obj_order_date = new Date(_order_date);
//	_order_date =  obj_order_date.getFullYear() +'-' + obj_order_date.getMonth() + '-' + obj_order_date.getDate();
	_order_date = (obj_order_date ? new Date(obj_order_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);
	var _due_date			= _order_date;

	var remaining_tax = _tax_total;
	var remaining_ship = _ship_total;
	var remaining_disc = _discount_total;

	var taxable_line_count = 0;
	var isAutoTaxCalculation = (session.configurationlist[Util.CONST_CONFIG_TAX_AUTO_CALCULATION] || 0);

	for(var i=0;i< xOrder.lineitems.length;i++)
	{

		var lineitem = xOrder.lineitems[i];
		_sub_total 		=  _sub_total + (parseFloat(lineitem.order_quantity) * parseFloat(lineitem.order_price));
		_sub_total 		= _sub_total; 

		if(lineitem.id == undefined )
		{
			lineitem.id =0;
		}

		if ((lineitem.is_taxable && lineitem.is_taxable == 1 && isAutoTaxCalculation == 1) || isAutoTaxCalculation == 0) taxable_line_count++;

	}
	var cmd = "SET @id = "+ orderid +"; CALL spCreateOrder(@err, @msg, @id, @statusid, @deliverystatusid, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
	connection.query(cmd, [
							_customers_id,
							_companies_id,
							_order_date,
							_sub_total,
							_ship_total,
							_tax_total,
							_discount_total,
							_sysorderstatuses_id,
							_orderusers_id,
							_ship_addresses_id,
							_bill_addresses_id,
							_approverusers_id,
							_syssyncstatus_id,
							_order_number,
							_customer_order_number,
							_payment_terms_id,
							_salespersons_id,
							_item_count,
							_due_date,
							_transporters_id,
							_notes,
							_internal_notes,
							_agent_notes,
							_default_transporter_customer,
							_default_payment_term_customer
							], function (err, rows) {

							if (err) return callback (err);

							connection.query("SELECT @err AS err, @msg AS msg, @id AS id, @statusid as statusid, @deliverystatusid as deliverystatusid", function (err, rows) {

								if (err) return callback(err);


								if (rows && rows[0] && (rows[0].err == 0 || rows[0].err == null)) 
								{
									xOrder.id = rows[0].id; //new Buffer(rows[0].id).toString();// .toString('utf-8');
									// if new order is being created OR order is being modified with pending deliery, update rows as well.
//									if ( orderid == 0 || (xOrder.id == orderid && rows[0].deliverystatusid == Util.CONST_STATUS_DELIVERY_PENDING)) //xOrder.price_level_id + "" === Util.CONST_PRICING_PRODUCT_VARIABLE + "" 
									if ( orderid == 0 || (xOrder.id == orderid && (rows[0].statusid == Util.CONST_STATUS_ORDER_IN_PACKING || rows[0].statusid == Util.CONST_STATUS_ORDER_PENDING_APPROVAL))) //xOrder.price_level_id + "" === Util.CONST_PRICING_PRODUCT_VARIABLE + "" 
									{ 
										var id = null;
										var count = 0;

										var errors = [];
										var hAllOrderDetails = {};

										connection.query("SELECT id, quantity_ordered_packed, quantity_entered_packed FROM order_details WHERE orders_id = ?", [
												orderid
											], function (err, rowsOrderDetails) {

											if (err) return callback(err);

											if (rowsOrderDetails) 
											{
												for (var i=0; i < rowsOrderDetails.length; i++) {
													if (!(rowsOrderDetails[i].quantity_ordered_packed > 0 || rowsOrderDetails[i].quantity_entered_packed > 0 ))
														hAllOrderDetails[rowsOrderDetails[i].id] = rowsOrderDetails[i].id;
												}

												async.eachSeries(xOrder.lineitems, function iterator(lineitem, callback) {

													// delete the item from hash
													if (lineitem.id in hAllOrderDetails)
														delete hAllOrderDetails[lineitem.id];

													count ++;

													lineitem.extension 	= Util.round(lineitem.order_quantity * lineitem.order_price, 4);
													lineitem.discount 	= Util.round((_discount_total / _sub_total) * lineitem.extension, 4) || 0;
													lineitem.shipping 	= Util.round((_ship_total / _sub_total) * lineitem.extension, 4) || 0;

													remaining_ship = Util.round(remaining_ship - lineitem.shipping, 4);
													if (count == xOrder.lineitems.length) {
														lineitem.shipping = Util.round(lineitem.shipping + remaining_ship, 4);
														remaining_ship = 0; //ideally not needed. Just kept to be consistent with tax
													}

													if (isAutoTaxCalculation == 0) {
														lineitem.tax = lineitem.tax; //keep the same tax entered by user.
														taxable_line_count--;
													}
													else if (lineitem.is_taxable && lineitem.is_taxable == 1) {
		//												lineitem.tax 	= ((_tax_total / _sub_total) * lineitem.extension) || 0;
														lineitem.tax 	= Util.round(( (xOrder.customer.taxform_flag && xOrder.customer.taxform_flag == 1 ? lineitem.hsn.percent_gst : lineitem.hsn.percent_gst) * (lineitem.extension - lineitem.discount)/100), 4) || 0;
														lineitem.tax 	= Util.round(parseFloat(lineitem.tax) + ((lineitem.hsn.percent_cess * lineitem.tax)/100), 4) || 0;
														taxable_line_count--;
													}
													else
														lineitem.tax    = 0;

													remaining_tax = Util.round(remaining_tax - lineitem.tax, 4);

													if (taxable_line_count == 0 || count == xOrder.lineitems.length) {
														lineitem.tax = Util.round(lineitem.tax + remaining_tax, 4);
														remaining_tax = 0; //made it 0 so next iteration doesn't get value
													}

													remaining_disc = remaining_disc - lineitem.discount;
													if (count == xOrder.lineitems.length) {
														lineitem.discount = Util.round(lineitem.discount + remaining_disc, 4);
														remaining_disc = 0; //ideally not needed. Just kept to be consistent with tax
													}

													lineitem.uom_id 		= (lineitem.uom_id ? lineitem.uom_id : lineitem.unit_of_measures_id);

													var cmd = "SET @id = "+ (lineitem.id ? lineitem.id : null) +";CALL spCreateOrderDetail(@err, @msg, @id, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

													connection.query(cmd, [
																			xOrder.id,
																			lineitem.products_id,
																			lineitem.name,
																			lineitem.order_quantity,
																			lineitem.unit_price,
																			lineitem.order_price,
																			lineitem.tax || 0,
																			lineitem.shipping || 0,
																			lineitem.discount ||0,
																			lineitem.extension || 0,
																			lineitem.uom_id,
																			lineitem.notes,
																			lineitem.entered_unit_of_measures_id,
																			lineitem.entered_quantity
																		  ], function (err, rows) {
																				if (err){ 
																					errors.push(err);
																					return callback (errors[0]);
																				}
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
																						errors.push(err);
																					}
																					return callback(err, null);
																				});

																			}/*, function(err) {
																					//all async done
																					return callback(null, xOrder);
																			}*/
													);

												}, function (err) {

														if (errors.length > 0) return callback(errors[0], null);

														async.eachSeries(Object.keys(hAllOrderDetails), function iterator(orderdetailid, callback) {
															cmd = "CALL spDeleteOrderDetail(@err, @msg, ?, ?, ?, ?)";

															connection.query(cmd, [companyid, orderid, orderdetailid, session.user.id], function (err, rows) {

																if (err) return callback (err);

																connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {

																	if (rows && rows[0] && (rows[0].err == 0 || rows[0].err == null)) 
																		callback(err, true);
																	else {
																		var err = new Err();
																		if (rows && rows[0]) {
																			err.code    = rows[0].err;
																			err.message = rows[0].msg;
																		}
																		else {
																			err.code    = "-105";
																			err.message = "Unknown Error";
																		}
																		callback(err, false);
																	}
																});

															});

														}, function (err) {

															if (err) return callback(err);

															var cmd = "CALL spCreateWorkflow(@err, @msg, ?, ?, ?, ?)";
															connection.query(cmd, [xOrder.id, 5101, session.user.id, ''], function (err, rows) {

																if (err) return callback (err);

																connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {

																	if (rows && rows[0] && (rows[0].err == 0 || rows[0].err == null)) 
																	{
																		callback(null, xOrder);
																	}
																	else {
																		var err = new Err();
																		if (rows && rows[0]) {
																			err.code    = rows[0].err;
																			err.message = rows[0].msg;
																			callback (err, null);
																		}
																		else 
																			callback (err, null);
																	}
																});
															
															});
													});
												});

											}
										});

									
									}
									else
										return callback(null, xOrder);

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

exports.updateStatus = function(companyid, orderid,  userid, action_status,  notes, connection, callback){

	var cmd;
	orderid = parseInt(orderid);

	if (action_status == 4202) {
		cmd = "CALL spMarkOrderDelivered(@err, @msg, ?,?)";
		connection.query(cmd, [
								companyid, orderid
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
/*
		cmd = "UPDATE order_details SET is_complete = 1, last_updated = NOW() WHERE orders_id = ? AND is_complete = 0";
		connection.query(cmd, [orderid], function (err, row) {

			if (err) return callback (err);
			
			if (row && row.affectedRows > 0) {
				cmd = "UPDATE orders SET sysorderstatuses_id = ?, last_updated = NOW() WHERE id = ? AND companies_id = ?";
				connection.query(cmd, [action_status, orderid, companyid], function (err, row) {

					if (err) return callback (err);

					if (row && row.affectedRows == 1) {
						return callback(null, true);
					}
					else {
						return callback(new Err(-200, "Update failed."));
					}

				});
			}
			else 
				return callback(new Err(-200, "Update failed."));
		
		});*/
	}
	else {
		cmd = "CALL spCreateWorkflow(@err, @msg,?, ?, ?, ?)";
		connection.query(cmd, [
								orderid,
								action_status,
								userid,
								notes,
								], function (err, rows) {
 
									if (err) return callback (err);
									callback(null, rows);

								}
						);
	}
};

exports.cancelOrder = function (companyid, orderid, session, connection, callback) {

	var cmd = "CALL spCancelOrder(@err, @msg, ?,?,?)";
	connection.query(cmd, [
							companyid, 
							orderid,
							session.user.id
							], function (err, rows) {
								if (err) return callback (err);
								connection.query("SELECT @err AS err, @msg AS msg", function (feedbackerr, feedbackrows) {
									if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
									{
										return callback(null, true);
									}
									else {
										var err = new Err();
										err.code    = feedbackrows[0].err;
										err.message = feedbackrows[0].msg;
										return callback(err, false);
									}
								});
							}
					);

};

exports.findPackingslipsByOrderid = function (id, companyid, session, connection, cb) {

	var data ={};

	async.parallel([

		//Load Order
		function(callback){

			var cmd = "SELECT orders.*,(SELECT action_roles_id FROM order_workflow_routes owr WHERE owr.orders_id = orders.id AND owr.sysworkflowstatuses_id = 5100 AND orders.sysorderstatuses_id = 4203 ) as 'pending_approval_rolesid' FROM orders WHERE companies_id = ? and id = ?";
			connection.query(cmd, [
									companyid, id
								], function (err, rows) {
									if (err) return callback (err);
									data.order = rows[0];
									return callback();
								}
			);
		},

		//Load OrderDetail
		function(callback){

//			var cmd = "SELECT OD.*,u.id as 'uom_id', u.name as 'uom_name', u.short_name as uom_short_name, entered_unit.name as 'entered_uom_name', entered_unit.short_name as entered_uom_short_name, quantity_entered_packed, quantity_ordered_packed, p.sku, p.is_batched_inventory FROM order_details OD INNER JOIN unit_of_measures u ON OD.unit_of_measures_id = u.id INNER JOIN unit_of_measures entered_unit ON OD.entered_unit_of_measures_id = entered_unit.id INNER JOIN products p ON p.id = OD.products_id WHERE orders_id = ?";
			var cmd = "SELECT od.*,u.id as 'uom_id', u.name as 'uom_name', u.short_name as uom_short_name, entered_unit.name as 'entered_uom_name', entered_unit.short_name as entered_uom_short_name, quantity_entered_packed, quantity_ordered_packed, p.sku, p.is_batched_inventory, su.name as 'stock_uom_name', su.short_name as stock_uom_short_name, sau.name as 'stock_alt_uom_name', sau.short_name as stock_alt_uom_short_name, t.id as hsn_id, t.name as hsn_name, t.code as hsn_code, t.short_code as hsn_short_code, t.description as hsn_description, hd.tax_percent_gst, hd.tax_percent_cess, hd.tax_percent_sgst, hd.tax_percent_igst, hd.tax_percent_cgst FROM order_details od INNER JOIN unit_of_measures u ON od.unit_of_measures_id = u.id INNER JOIN unit_of_measures entered_unit ON od.entered_unit_of_measures_id = entered_unit.id INNER JOIN products p ON p.id = od.products_id INNER JOIN unit_of_measures su ON su.id = od.stock_unit_of_measures_id INNER JOIN unit_of_measures sau ON sau.id = od.stock_alt_unit_of_measures_id INNER JOIN sysproducthsn t ON t.id = t.sysproducthsn_id INNER JOIN sysproducthsn_details hd ON t.id = hd.sysproducthsn_id WHERE orders_id = ? AND od.order_price BETWEEN hd.amount_min AND IFNULL(hd.amount_max, od.order_price) AND NOW() BETWEEN hd.activation_start_date AND IFNULL(hd.activation_end_date, DATE_ADD(NOW(), INTERVAL 10 MINUTE)) ";
			connection.query(cmd, [
									id
								], function (err, rows) {
									if (err) return callback(err);
									data.lineitems = rows;
									return callback();
								}
			);
		},
		
		//Load PackingDetails
		function(callback){
		 
			var cmd = "SELECT  ps.packing_slip_number, ps.packing_date, ps.syspackingslipstatuses_id,ps.companies_id,ps.orders_id, ps.users_id, ps.invoices_id, ps.net_weight, ps.gross_weight, psd.*, s.code as stock_bucket_code, u.id as 'uom_id', u.name as 'uom_name', u.short_name as uom_short_name, entered_unit.id as 'entered_uom_id', entered_unit.name as 'entered_uom_name', entered_unit.short_name as entered_uom_short_name FROM packing_slip_details psd INNER JOIN stock_buckets s ON s.id = psd.stock_buckets_id INNER JOIN unit_of_measures u ON psd.unit_of_measures_id = u.id INNER JOIN unit_of_measures entered_unit ON psd.entered_unit_of_measures_id = entered_unit.id INNER JOIN packing_slips ps ON ps.id = psd.packing_slips_id WHERE psd.orders_id = ?";
			connection.query(cmd, [
									id
								], function (err, rows) {
									if (err) return callback(err);
									data.packingslip_lineitems = rows;
									return callback();
								}
			);
		}
	],

	//Error
	function(err){

	 	if (err) return cb(err); //If an error occured, we let express/connect handle it by calling the "next" 

		var bOrder = Map.mapToBOrder(data.order); 
		var lineitem_packingslipdetail = {};

		for(var i=0;i<data.lineitems.length;i++)
		{
			var obj = Map.mapToBOrderDetail(data.lineitems[i]);
			lineitem_packingslipdetail[obj.id] = obj;
			bOrder.lineitems.push(obj);
		}

		for(var i=0;i<data.packingslip_lineitems.length;i++)
		{
			var obj = Map.mapToBPackingSlipDetail(data.packingslip_lineitems[i]);
			lineitemobj = lineitem_packingslipdetail[obj.order_detail_id];
			lineitemobj.packingslip_lineitems.push(obj);
			//bOrder.packingslip_lineitems.push( obj);
		}

		cb(err, bOrder);		

	});

};

exports.findPackingslipById = function (id, companyid, session, connection, cb) {

	var data ={};

	async.parallel([

		//Load Order
		function(callback){

			var cmd = "SELECT orders.*,(SELECT action_roles_id FROM order_workflow_routes owr WHERE owr.orders_id = orders.id AND owr.sysworkflowstatuses_id = 5100 AND orders.sysorderstatuses_id = 4203 ) as 'pending_approval_rolesid' FROM orders INNER JOIN packing_slips s ON orders.id = s.orders_id WHERE s.companies_id = ? and s.id = ? ";
			connection.query(cmd, [
									companyid, id
								], function (err, rows) {
									if (err) return callback (err);
									data.order = rows[0];
									return callback();
								}
			);
		},

		//Load PackingDetails
		function(callback){
		 
			var cmd = "SELECT  ps.*, s.name as status_name, g.id as gate_pass_id, g.gate_pass_number " +
					  "FROM packing_slips ps INNER JOIN syspackingslipstatuses s ON ps.syspackingslipstatuses_id = s.id " +
					  "LEFT JOIN gate_pass_details gd on gd.packing_slips_id = ps.id " +
					  "LEFT JOIN gate_passes g on g.id = gd.gate_passes_id " +
					  "WHERE ps.id = ?";
			connection.query(cmd, [
									id
								], function (err, rows) {
									if (err) return callback(err);
									data.packingslip = rows[0];
									return callback();
								}
			);
		},

		//Load PackingDetails
		function(callback){
		 
			var cmd = "SELECT  psd.*, p.sku, p.name, p.is_batched_inventory, s.code as stock_bucket_code, u.id as  'uom_id', u.name as 'uom_name', u.short_name as uom_short_name, entered_unit.id as 'entered_unit_of_measures_id', entered_unit.name as 'entered_uom_name', entered_unit.short_name as entered_uom_short_name FROM packing_slip_details psd INNER JOIN stock_buckets s ON s.id = psd.stock_buckets_id INNER JOIN unit_of_measures u ON psd.unit_of_measures_id = u.id INNER JOIN unit_of_measures entered_unit ON psd.entered_unit_of_measures_id = entered_unit.id INNER JOIN products p ON p.id = psd.products_id WHERE psd.packing_slips_id = ?";
			connection.query(cmd, [
									id
								], function (err, rows) {
									if (err) return callback(err);
									data.packingslip_lineitems = rows;
									return callback();
								}
			);
		},

		//Load OrderDetail
		function(callback){
//			var cmd = "SELECT OD.*,u.id as 'uom_id', u.name as 'uom_name', u.short_name as uom_short_name, entered_unit.name as 'entered_uom_name', entered_unit.short_name as entered_uom_short_name, p.sku, p.is_batched_inventory FROM order_details OD INNER JOIN unit_of_measures u ON OD.unit_of_measures_id = u.id INNER JOIN unit_of_measures entered_unit ON OD.entered_unit_of_measures_id = entered_unit.id INNER JOIN products p ON p.id = OD.products_id WHERE orders_id = ?";
			var cmd = "SELECT od.*,u.id as 'uom_id', u.name as 'uom_name', u.short_name as uom_short_name, entered_unit.name as 'entered_uom_name', entered_unit.short_name as entered_uom_short_name, p.sku, p.is_batched_inventory, su.name as 'stock_uom_name', su.short_name as stock_uom_short_name, sau.name as 'stock_alt_uom_name', sau.short_name as stock_alt_uom_short_name, t.id as hsn_id, t.name as hsn_name, t.code as hsn_code, t.short_code as hsn_short_code, t.description as hsn_description, hd.tax_percent_gst, hd.tax_percent_cess, hd.tax_percent_sgst, hd.tax_percent_cgst, hd.tax_percent_igst FROM order_details od INNER JOIN unit_of_measures u ON od.unit_of_measures_id = u.id INNER JOIN unit_of_measures entered_unit ON od.entered_unit_of_measures_id = entered_unit.id INNER JOIN products p ON p.id = od.products_id INNER JOIN unit_of_measures su ON od.stock_unit_of_measures_id = su.id  INNER JOIN unit_of_measures sau ON od.stock_alt_unit_of_measures_id = sau.id INNER JOIN sysproducthsn t ON p.sysproducthsn_id = t.id INNER JOIN sysproducthsn_details hd ON hd.sysproducthsn_id = t.id INNER JOIN packing_slip_details psd ON psd.order_details_id = od.id WHERE psd.packing_slips_id = ? AND od.order_price BETWEEN hd.amount_min AND IFNULL(hd.amount_max, od.order_price) AND NOW() BETWEEN hd.activation_start_date AND IFNULL(hd.activation_end_date, DATE_ADD(NOW(), INTERVAL 10 MINUTE)) ";
			connection.query(cmd, [
									id
								], function (err, rows) {
									if (err) return callback(err);
									data.lineitems = rows;
									return callback();
								}
			);
		}
	],

	//Error
	function(err){

	 	if (err) return cb(err); //If an error occured, we let express/connect handle it by calling the "next" 

	 	if (!data.packingslip) return cb (new Error("Packing slip not found."));

		var bPackingSlip = Map.mapToBPackingSlip(data.packingslip);
		bPackingSlip.order = Map.mapToBOrder(data.order); ;

		var hOrderDetail = {};
		for (var i = 0; i < data.lineitems.length; i++) {
			var obj = Map.mapToBOrderDetail(data.lineitems[i]);
			hOrderDetail[data.lineitems[i].id] = obj;
		}
		
		for(var i=0; i < data.packingslip_lineitems.length; i++)
		{
			var obj = Map.mapToBPackingSlipDetail(data.packingslip_lineitems[i]);

			if (data.packingslip_lineitems[i].order_details_id in hOrderDetail)
				obj.order_detail = hOrderDetail[data.packingslip_lineitems[i].order_details_id];

			bPackingSlip.lineitems.push(obj);
		}
		cb(err, bPackingSlip);

	});

};

exports.findAllPackingslips = function (companyid, options, session, connection, callback) {

	var fromdate = (options.fromdate ? new Date(options.fromdate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);
	var todate   = (options.todate   ? new Date(options.todate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	var cmd = "CALL spGetPackingslip(@err, @msg, @totalrecords, ?,?,?,?,?,?,?, ?,?,?,?,?,?,?, ?,?,?)";
	connection.query(cmd, [
								companyid,
								(options.id ? options.id : null),
								session.user.id,
								(options.agentid ? options.agentid : null), 
								(options.customerid ? options.customerid : null),
								(options.statusid ? options.statusid : null),
								(options.deliverynoteid ? options.deliverynoteid : null),
								(options.productid ? options.productid : null),
								(options.slip_number ? options.slip_number : null),
								(options.gate_pass_number ? options.gate_pass_number : null),
								fromdate,
								todate,
								(options.fromdate && options.todate ? 1 : null),
								(options.pagenumber ? options.pagenumber : 1),
								(options.pagesize ? options.pagesize : 20),
								(options.sortby ? options.sortby : "id"),
								(options.sortorder ? options.sortorder : -1)
						  ], function (err, rows) {

									if (err) return callback (err);

									var packingsliplist = [];

									connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
										if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
										{
											for(var i = 0; i <rows[0].length; i++)
											{
												packingsliplist.push(Map.mapToBPackingSlip(rows[0][i]));
												packingsliplist[i].totalrecords = feedbackrows[0].totalrecords;
											}
									
											return callback(null, packingsliplist);
									
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
											
// 		 
// 	var cmd = "SELECT  ps.packing_slip_number, ps.packing_date, ps.syspackingslipstatuses_id,ps.companies_id,ps.orders_id, ps.users_id, ps.invoices_id, ps.weight FROM packing_slips ps WHERE ps.companies_id = ?";
// 	connection.query(cmd, [
// 							companyid
// 						], function (err, rows) {
// 
// 							if (err) return callback(err);
// 							for (var i = 0; i < rows.length; i++) {
// 								packingsliplist.push(Map.mapToBPackingSlip(rows[i]));
// 							}
// 							return callback(err, packingsliplist);
// 						}
// 	);


};

exports.createPackingSlip = function (companyid, xPackingSlip, session, connection, callback) {

	xPackingSlip.packing_date = (xPackingSlip.packing_date ? new Date(xPackingSlip.packing_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	// saving order line items in a hash
	var order_lineitems = {};
	for (i = 0; i < xPackingSlip.order.lineitems.length; i++) {
		order_lineitems[xPackingSlip.order.lineitems[i].id] = xPackingSlip.order.lineitems[i];		
	}

	var cmd = "CALL spCreatePackingSlip(@err, @msg, @id, ?,?,?,?,?,?, ?)";

	connection.query(cmd, [
								xPackingSlip.order.id,
								xPackingSlip.slip_number,
								companyid,
								session.user.id,
								xPackingSlip.packing_date,
								xPackingSlip.net_weight,
								xPackingSlip.gross_weight
							  ], function (err, rows) {

									if (err) return callback (err);

									connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
										if (rows && rows[0] && rows[0].err == 0) {
											xPackingSlip.id = rows[0].id;

											var errors = [];
											async.eachSeries(xPackingSlip.lineitems, function iterator(lineitem, callback) {
												var cmd = "CALL spCreatePackingSlipDetail(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?)";

												order_lineitem = order_lineitems[lineitem.order_detail_id];

												var data = [
																xPackingSlip.id,
																lineitem.order_detail_id,
																(lineitem.stock_bucket_id === "" ? null : lineitem.stock_bucket_id),
																(lineitem.packed_qty_quote === "" ? null : lineitem.packed_qty_quote),
																order_lineitem.stock_alt_unit_of_measures_id,
																lineitem.packed_qty_qty,
																order_lineitem.stock_unit_of_measures_id,
																lineitem.piece_count,
																lineitem.notes
															];

												connection.query(cmd, data, function (err, rows) {
																			if (err) {
																				errors.push(err);
																				return callback (err);
																			}
																			connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
																				if (rows && rows[0] && rows[0].err == 0) {
																					id = rows[0].id;

																					exports.findById(xPackingSlip.order.id, companyid, session, connection, function (err, order) {	
																						xPackingSlip.order = order;																				
																						return callback(null, null);
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
																					errors.push(err);
																					return callback(err, null);
																				}
																			});

																		}
												);
											}, function (err) {
												if (errors.length > 0)
													return callback(errors[0]);
												else
													return callback(null, xPackingSlip);
											});

											//return callback(null, xPackingSlip);
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
											return callback(err, null);
										}
									});

								}
		);

};

exports.cancelPackingSlip = function (companyid, xPackingSlip, session, connection, callback) {

	var cmd = "CALL spCancelPackingslip(@err, @msg, ?,?,?)";

	connection.query(cmd, [
								companyid,
								xPackingSlip.id,
								session.user.id
							  ], function (err, rows) {

									if (err) return callback (err);

									connection.query("SELECT @err AS err, @msg AS msg", function (err, rows) {
										if (rows && rows[0] && rows[0].err == 0) {
											xPackingSlip.status_id = Util.CONST_STATUS_PACKING_SLIP_CANCELLED;
											return callback(null, xPackingSlip);
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
											return callback(err, null);
										}
									});

								}
		);

};

exports.cancelDeliveryNote = function (companyid, id, session, connection, callback) {

	var cmd = "CALL spCancelDeliveryNote(@err, @msg, ?,?,?)";

	connection.query(cmd, [
								companyid,
								id,
								session.user.id
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

exports.cancelGatePass = function (companyid, id, reason, session, connection, callback) {

	var cmd = "CALL spCancelGatePass(@err, @msg, ?,?,?,?)";

	connection.query(cmd, [
								companyid,
								id,
								session.user.id,
								reason
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

exports.completeDeliveryNote = function (companyid, id, session, connection, callback) {

	var cmd = "CALL spCompleteDeliveryNote(@err, @msg, ?,?,?)";

	connection.query(cmd, [
								companyid,
								id,
								session.user.id
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

const distributeShipping = function (xDeliveryNote, sub_total) {

	var remainingTotal = xDeliveryNote.ship_total;

	for (var i = 0; i < xDeliveryNote.packingsliplist.length; i++) {

		for (var j = 0; j < xDeliveryNote.packingsliplist[i].lineitems.length; j++) {
			var newShipTotal = Util.round((xDeliveryNote.packingsliplist[i].lineitems[j].sub_total / sub_total) * xDeliveryNote.ship_total, 4);
			xDeliveryNote.packingsliplist[i].lineitems[j].ship_total = newShipTotal;
			remainingTotal = Util.round(remainingTotal - newShipTotal, 4);
		}

		// if it is last line item, assign the balance
		if (i == xDeliveryNote.packingsliplist.length - 1 && remainingTotal != 0)
			xDeliveryNote.packingsliplist[i].lineitems[xDeliveryNote.packingsliplist[i].lineitems.length - 1].ship_total = Util.round(xDeliveryNote.packingsliplist[i].lineitems[xDeliveryNote.packingsliplist[i].lineitems.length - 1].ship_total, 4) + remainingTotal;
	}

};

exports.saveGatePass = function (companyid, xGatePass, session, connection, callback) {

	var packing_slips = {};


	if (xGatePass.gate_pass_date != "")
		xGatePass.gate_pass_date = (xGatePass.gate_pass_date ? new Date(xGatePass.gate_pass_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);
	var cmd = "";
	if(xGatePass.id > 0)
		cmd = "SET @id = "+ xGatePass.id +"; CALL spCreateUpdateGatePass(@err, @msg, @id, ?,?,?,?,?,?,?,?)";
	else
		cmd = "SET @id = null; CALL spCreateUpdateGatePass(@err, @msg, @id, ?,?,?,?,?,?,?,?)";

	connection.query(cmd, [
								companyid,
								xGatePass.gate_pass_number,
								xGatePass.gate_pass_date,
								session.user.id,
								xGatePass.vehicle_number,
								xGatePass.contact_name,
								xGatePass.charges,
								xGatePass.notes
							  ], function (err, rows) {

									if (err) return callback (err);

									connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
										if (rows && rows[0] && rows[0].err == 0) {
											xGatePass.id = rows[0].id;
											var errors = [];
											async.eachSeries(xGatePass.gate_pass_details, function iterator(gate_pass_detail, callback) {

												if(gate_pass_detail.id > 0)
													cmd = "SET @id = "+ gate_pass_detail.id +"; CALL spCreateUpdateGatePassDetail(@err, @msg, @id, ?,?,?,?)";
												else
													cmd = "SET @id = null; CALL spCreateUpdateGatePassDetail(@err, @msg, @id, ?,?,?,?)";
												var data = [
																companyid,
																xGatePass.id,
																gate_pass_detail.packing_slip_id,
																gate_pass_detail.tempo_charges
															];

												connection.query(cmd, data, function (err, rows) {
													
														if (err) {
															errors.push(err);
															return callback (err);
														}

														connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {

															if (rows && rows[0] && rows[0].err == 0) {

																id = rows[0].id;
																return callback(null);
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

																errors.push(err);
																return callback(err);
															}
														});

													}
												);
											}, function (err) {

												if (errors.length > 0)
													return callback(errors[0]);
												else
													return callback(null, xGatePass);
											});

											//return callback(null, xPackingSlip);
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
											return callback(err, null);
										}
									});

								}
		);

};

const setSyncStatus = function(xDeliveryNote, session) {

	if (!xDeliveryNote.sync_status_id)
		xDeliveryNote.sync_status_id = "";

	if (session.configurationlist[Util.CONST_CONFIG_MODULE_INTEGRATION_INVOICE] == 0) 
		xDeliveryNote.sync_status_id = Util.SyncStatusEnum.DoNotSync;
	else if (xDeliveryNote.sync_status_id == "") {
		xDeliveryNote.sync_status_id = Util.SyncStatusEnum.Pending;
	}

}

exports.createDeliveryNote = async function(companyid, xDeliveryNote, session, connection, callback) {

	xDeliveryNote.note_date = (xDeliveryNote.note_date ? new Date(xDeliveryNote.note_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	if (xDeliveryNote.lr_date != "")
		xDeliveryNote.lr_date = (xDeliveryNote.lr_date ? new Date(xDeliveryNote.lr_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	if (xDeliveryNote.einvoice_info.bill_date != "")
		xDeliveryNote.einvoice_info.bill_date = (xDeliveryNote.einvoice_info.bill_date ? new Date(xDeliveryNote.einvoice_info.bill_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	//eway bill to json
	if(xDeliveryNote.einvoice_info)
		xDeliveryNote.einvoice_info = JSON.stringify(xDeliveryNote.einvoice_info);

	var ship_total = 0;
	var tax_total = 0;
	var sub_total = 0;
	var discount_total = 0;
	for (let i = 0; i < xDeliveryNote.packingsliplist.length; i++) {
		for (let j = 0; j < xDeliveryNote.packingsliplist[i].lineitems.length; j++) {
			ship_total = ship_total + xDeliveryNote.packingsliplist[i].lineitems[j].ship_total;
			tax_total = tax_total + xDeliveryNote.packingsliplist[i].lineitems[j].tax_total;
			sub_total = sub_total + xDeliveryNote.packingsliplist[i].lineitems[j].sub_total;
			discount_total = discount_total + xDeliveryNote.packingsliplist[i].lineitems[j].discount_total;
		}
	}
	tax_total = Util.round_even(tax_total);
	var grandtotal = sub_total + (xDeliveryNote.ship_total || 0) + tax_total - discount_total;
	var rounding_total = Util.round(grandtotal, 0) - grandtotal;

	// header ship total is entered by user. If header total is not matching with line item, then re-distribute the total
	if (ship_total != xDeliveryNote.ship_total) {
		distributeShipping(xDeliveryNote, sub_total);
	}

	// if new ship address is entered, assign null
	if ( xDeliveryNote.ship_address.id == '' ) xDeliveryNote.ship_address.id = null;

	// if sync status is empty, set 
	setSyncStatus(xDeliveryNote, session);

	let cmd = "SET @id = null; CALL spCreateUpdateDeliveryNote(@err, @msg, @id, ?,?,?,?, ?,?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?)";

	connection.query(cmd, [
								companyid,
								xDeliveryNote.customer.id,
								xDeliveryNote.note_number,
								xDeliveryNote.note_date,
								session.user.id,
								xDeliveryNote.transporter.id,
								(xDeliveryNote.lr_number != "" ? xDeliveryNote.lr_number : null),
								(xDeliveryNote.lr_date != "" ? xDeliveryNote.lr_date : null),
								(xDeliveryNote.invoice_number != "" ? xDeliveryNote.invoice_number : null),
								sub_total,
								xDeliveryNote.ship_total,
								tax_total,
								discount_total,
								rounding_total,
								xDeliveryNote.notes,
								xDeliveryNote.taxform_flag || 0,
								xDeliveryNote.exportform_flag || 0,
								xDeliveryNote.proforma_invoice_flag || 0,
								xDeliveryNote.material_out_invoice_flag || 0,
								xDeliveryNote.destination,
								xDeliveryNote.ship_address.id,
								xDeliveryNote.ship_address.name,
								xDeliveryNote.ship_address.first_name,
								xDeliveryNote.ship_address.last_name,
								xDeliveryNote.ship_address.address1,
								xDeliveryNote.ship_address.address2,
								xDeliveryNote.ship_address.address3,
								xDeliveryNote.ship_address.city,
								xDeliveryNote.ship_address.state,
								xDeliveryNote.ship_address.zip,
								xDeliveryNote.ship_address.phone1,
								xDeliveryNote.ship_address.phone2,
								xDeliveryNote.ship_address.email1,
								xDeliveryNote.ship_address.email2,
								xDeliveryNote.destination_distance,
								xDeliveryNote.sync_status_id,
								null, null,
								xDeliveryNote.einvoice_info
							  ], function (err, rows) {

									if (err) return callback (err);

									connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {

										if (rows && rows[0] && rows[0].err == 0) {
											xDeliveryNote.id = rows[0].id;

											var errors = [];
											async.eachSeries(xDeliveryNote.packingsliplist, function iterator(packingslip, callback) {

												async.eachSeries(packingslip.lineitems, function iterator(lineitem, callback) {

													cmd = "CALL spCreateDeliveryNoteDetail(@err, @msg, @id, ?,?,?,?,?,?, ?,?)";

													connection.query(cmd, [
																			companyid,
																			xDeliveryNote.id,
																			packingslip.id,
																			lineitem.id,
																			lineitem.sub_total,
																			lineitem.ship_total,
																			lineitem.tax_total,
																			lineitem.discount_total
																		  ], function (err, rows) {

																				if (err) {
																					errors.push(err); 
																					return callback (err);
																				}
																				connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
																					if (rows && rows[0] && rows[0].err == 0) {
																						id = rows[0].id;
																						return callback(err, xDeliveryNote);
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
																						errors.push(err);
																						return callback(err, null);
																					}
																				});

																			}
													);
												}, function (err) {

													if (errors.length > 0) {

														callback (errors[0]);
													}
													else {

														connection.query ("CALL spSplitDeliveryNoteTax(@err, @msg, ?, ?)", [companyid, xDeliveryNote.id], function (err, output) {					
															if (err) {
																errors.push(err);
																return callback (err);
															}

															cmd = "";
															cmd = cmd + " UPDATE packing_slips ";
															cmd = cmd + " SET    packing_slips.net_weight   =  CASE WHEN ? IS NOT NULL THEN  ? ELSE net_weight END, ";
															cmd = cmd + "        packing_slips.gross_weight =  CASE WHEN ? IS NOT NULL THEN  ? ELSE gross_weight END, ";
															cmd = cmd + " 	     packing_slips.syspackingslipstatuses_id =  " + Util.CONST_STATUS_PACKING_SLIP_PENDING_DISPATCH + ", ";
															cmd = cmd + " 	     packing_slips.delivery_notes_id         =  ?, ";
															cmd = cmd + " 		 packing_slips.last_updated              =  NOW() "; 
															cmd = cmd + " WHERE  packing_slips.id                        =  ?";
			
															connection.query (cmd, [packingslip.net_weight, packingslip.net_weight, packingslip.gross_weight, packingslip.gross_weight, xDeliveryNote.id, packingslip.id], function (err, rows) {
																if (err) {
																	errors.push(err);
																	return callback (err);
																}
																return callback(err, xDeliveryNote);
															});

														});
						
													}

												});

											}, function (err) {
												if (errors.length > 0) {
													callback (errors[0]);
												}
												else {
													connection.query("CALL spUpdateDeliveryNoteOrderMetadata(@err, @msg, ?, ?)", [companyid, xDeliveryNote.id], function (err, output) {
														return callback(err, xDeliveryNote);
													});
												}
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
											return callback(err, null);
										}
									});

								}
		);


};

exports.createDeliveryNote_Good = async function(companyid, xDeliveryNote, session, connection, callback) {

	try {

		xDeliveryNote.note_date = (xDeliveryNote.note_date ? new Date(xDeliveryNote.note_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		if (xDeliveryNote.lr_date != "")
			xDeliveryNote.lr_date = (xDeliveryNote.lr_date ? new Date(xDeliveryNote.lr_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		if (xDeliveryNote.einvoice_info.bill_date != "")
			xDeliveryNote.einvoice_info.bill_date = (xDeliveryNote.einvoice_info.bill_date ? new Date(xDeliveryNote.einvoice_info.bill_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		var ship_total = 0;
		var tax_total = 0;
		var sub_total = 0;
		var discount_total = 0;
		for (let i = 0; i < xDeliveryNote.packingsliplist.length; i++) {
			for (let j = 0; j < xDeliveryNote.packingsliplist[i].lineitems.length; j++) {
				ship_total = ship_total + xDeliveryNote.packingsliplist[i].lineitems[j].ship_total;
				tax_total = tax_total + xDeliveryNote.packingsliplist[i].lineitems[j].tax_total;
				sub_total = sub_total + xDeliveryNote.packingsliplist[i].lineitems[j].sub_total;
				discount_total = discount_total + xDeliveryNote.packingsliplist[i].lineitems[j].discount_total;
			}
		}

		let grandtotal = sub_total + (xDeliveryNote.ship_total || 0) + tax_total - discount_total;
		let rounding_total = Util.round(grandtotal, 0) - grandtotal;

		// header ship total is entered by user. If header total is not matching with line item, then re-distribute the total
		if (ship_total != xDeliveryNote.ship_total) {
			distributeShipping(xDeliveryNote, sub_total);
		}

		// if new ship address is entered, assign null
		if ( xDeliveryNote.ship_address.id == '' ) xDeliveryNote.ship_address.id = null;

		let cmd = "SET @id = null; CALL spCreateUpdateDeliveryNote(@err, @msg, @id, ?,?,?,?, ?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?)";

		let rows = await connection.promise().query(cmd, [
									companyid,
									xDeliveryNote.customer.id,
									xDeliveryNote.note_number,
									xDeliveryNote.note_date,
									session.user.id,
									xDeliveryNote.transporter.id,
									(xDeliveryNote.lr_number != "" ? xDeliveryNote.lr_number : null),
									(xDeliveryNote.lr_date != "" ? xDeliveryNote.lr_date : null),
									(xDeliveryNote.invoice_number != "" ? xDeliveryNote.invoice_number : null),
									sub_total,
									xDeliveryNote.ship_total,
									tax_total,
									discount_total,
									rounding_total,
									xDeliveryNote.notes,
									xDeliveryNote.taxform_flag || 0,
									xDeliveryNote.exportform_flag || 0,
									xDeliveryNote.proforma_invoice_flag || 0,
									xDeliveryNote.destination,
									xDeliveryNote.ship_address.id,
									xDeliveryNote.ship_address.name,
									xDeliveryNote.ship_address.first_name,
									xDeliveryNote.ship_address.last_name,
									xDeliveryNote.ship_address.address1,
									xDeliveryNote.ship_address.address2,
									xDeliveryNote.ship_address.address3,
									xDeliveryNote.ship_address.city,
									xDeliveryNote.ship_address.state,
									xDeliveryNote.ship_address.zip,
									xDeliveryNote.ship_address.phone1,
									xDeliveryNote.ship_address.phone2,
									xDeliveryNote.ship_address.email1,
									xDeliveryNote.ship_address.email2									
								  ]);

		rows = await connection.promise().query("SELECT @err AS err, @msg AS msg, @id AS id");
		if (rows && rows[0] && rows[0][0] && rows[0][0].err == 0) {
			xDeliveryNote.id = rows[0][0].id;
		}
		else {
			throw new Error(rows[0][0].msg);
		}

		for (const packingslip of xDeliveryNote.packingsliplist) {

			for (const lineitem of packingslip.lineitems) {

				let result = await connection.promise().query("CALL spCreateDeliveryNoteDetail(@err, @msg, @id, ?,?,?,?,?,?, ?,?)", [
										companyid,
										xDeliveryNote.id,
										packingslip.id,
										lineitem.id,
										lineitem.sub_total,
										lineitem.ship_total,
										lineitem.tax_total,
										lineitem.discount_total
									  ]);

				let rows = await connection.promise().query("SELECT @err AS err, @msg AS msg, @id AS id");

				if (rows && rows[0] && rows[0][0] && rows[0][0].err == 0) {
					let id = rows[0][0].id;
				} else {
					throw new Error(rows[0][0].msg);
				}

			}

			let output = await connection.promise().query("CALL spSplitDeliveryNoteTax(@err, @msg, ?, ?)", [companyid, xDeliveryNote.id]);

			let rows = await connection.promise().query("SELECT @err AS err, @msg AS msg");

			if (rows && rows[0] && rows[0][0] && rows[0][0].err != 0)
				throw new Error(rows[0][0].msg);

			// update packing slip header info
			let cmd = "";
			cmd = cmd + " UPDATE packing_slips ";
			cmd = cmd + " SET    packing_slips.net_weight   =  CASE WHEN ? IS NOT NULL THEN  ? ELSE net_weight END, ";
			cmd = cmd + "        packing_slips.gross_weight =  CASE WHEN ? IS NOT NULL THEN  ? ELSE gross_weight END, ";
			cmd = cmd + " 	     packing_slips.syspackingslipstatuses_id =  " + Util.CONST_STATUS_PACKING_SLIP_PENDING_DISPATCH + ", ";
			cmd = cmd + " 	     packing_slips.delivery_notes_id         =  ?, ";
			cmd = cmd + " 		 packing_slips.last_updated              =  NOW() "; 
			cmd = cmd + " WHERE  packing_slips.id                        =  ?";
			await connection.promise().query (cmd, [packingslip.net_weight, packingslip.net_weight, packingslip.gross_weight, packingslip.gross_weight, xDeliveryNote.id, packingslip.id]);

		}

		// update delivery note meta data such as order number, po number
		await updateDeliveryNoteOrderMetaData(xDeliveryNote.id, connection);

		// return
		return callback(null, xDeliveryNote);

	} catch (err) {
		return callback(err, null);
	}

};


exports.createDirectInvoice = async function(companyid, xDeliveryNote, session, connection, callback) {

	try {
		
		xDeliveryNote.note_date = (xDeliveryNote.note_date ? new Date(xDeliveryNote.note_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		if (xDeliveryNote.lr_date != "")
			xDeliveryNote.lr_date = (xDeliveryNote.lr_date ? new Date(xDeliveryNote.lr_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		if (xDeliveryNote.einvoice_info.bill_date != "")
			xDeliveryNote.einvoice_info.bill_date = (xDeliveryNote.einvoice_info.bill_date ? new Date(xDeliveryNote.einvoice_info.bill_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		var ship_total = 0;
		var tax_total = 0;
		var sub_total = 0;
		var discount_total = 0;

		for (let i = 0; i < xDeliveryNote.lineitems.length; i++) {
			ship_total = ship_total + xDeliveryNote.lineitems[i].ship_total;
			tax_total = tax_total + xDeliveryNote.lineitems[i].tax_total;
			sub_total = sub_total + xDeliveryNote.lineitems[i].sub_total;
			discount_total = discount_total + xDeliveryNote.lineitems[i].discount_total;
		}

		let grandtotal = sub_total + (xDeliveryNote.ship_total || 0) + tax_total - discount_total;
		let rounding_total = Util.round(grandtotal, 0) - grandtotal;

		//set sync status
		setSyncStatus(xDeliveryNote, session);

		let cmd = "SET @id = null; CALL spCreateUpdateDirectInvoice(@err, @msg, @id, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		await connection.query(cmd, [
							companyid,
							xDeliveryNote.customer.id,
							session.user.id,
							xDeliveryNote.invoice_number,
							sub_total,
							xDeliveryNote.ship_total,
							tax_total,
							discount_total,
							rounding_total,
							xDeliveryNote.notes || "",
							xDeliveryNote.taxform_flag || 0,
							xDeliveryNote.exportform_flag || 0,
							xDeliveryNote.einvoice_info.bill_number || null,
							xDeliveryNote.einvoice_info.bill_date || null,
							xDeliveryNote.sync_status_id
						  ], function(err, dRows) {

								connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function(err, rows) {
									if (rows && rows[0] && rows[0].err == 0) {
										xDeliveryNote.id = rows[0].id;
										async.eachSeries(xDeliveryNote.lineitems, function iterator(lineitem, incb) {

											let result = connection.query("CALL spCreateDirectInvoiceDetail(@err, @msg, @id, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
														xDeliveryNote.id,
														lineitem.productid,
														lineitem.entered_quantity,
														lineitem.order_price,
														lineitem.sub_total,
														lineitem.tax_total,
														lineitem.ship_total,
														lineitem.discount_total,
														lineitem.uom_id,
														lineitem.notes,
														lineitem.entered_uom_id,
														lineitem.entered_quantity,
														null,
														session.user.id
													  ], function(err, dnRows) {
													  	if(err) {
													  		incb(err);
													  	}
													  	
													  	connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function(err, dnrows1) {
														if (dnrows1 && dnrows1[0] && dnrows1[0] && dnrows1[0].err == 0) {
															let id = dnrows1[0].id;
															incb(null);
														} else {
															incb(dnrows1[0].msg);
														}
													});
												});
										}, function(err) {

											if(err)
												return callback(err, null);

											return callback(null, xDeliveryNote);
										});
									}
									else {
										throw new Error(rows[0].msg);
									}
								});
						});

	} catch (err) {
		return callback(err, null);
	}

}

exports.updateDirectInvoice = async function(companyid, xDeliveryNote, session, connection, callback) {

	try {
		
		xDeliveryNote.note_date = (xDeliveryNote.note_date ? new Date(xDeliveryNote.note_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		if (xDeliveryNote.lr_date != "")
			xDeliveryNote.lr_date = (xDeliveryNote.lr_date ? new Date(xDeliveryNote.lr_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		if (xDeliveryNote.einvoice_info.bill_date != "")
			xDeliveryNote.einvoice_info.bill_date = (xDeliveryNote.einvoice_info.bill_date ? new Date(xDeliveryNote.einvoice_info.bill_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

		var ship_total = 0;
		var tax_total = 0;
		var sub_total = 0;
		var discount_total = 0;

		for (let i = 0; i < xDeliveryNote.lineitems.length; i++) {
			ship_total = ship_total + xDeliveryNote.lineitems[i].ship_total;
			tax_total = tax_total + xDeliveryNote.lineitems[i].tax_total;
			sub_total = sub_total + xDeliveryNote.lineitems[i].sub_total;
			discount_total = discount_total + xDeliveryNote.lineitems[i].discount_total;
		}

		let grandtotal = sub_total + (xDeliveryNote.ship_total || 0) + tax_total - discount_total;
		let rounding_total = Util.round(grandtotal, 0) - grandtotal;

		// set sync status
		setSyncStatus(xDeliveryNote, session);

		let cmd = "SET @id = " + xDeliveryNote.id + "; CALL spCreateUpdateDirectInvoice(@err, @msg, @id, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

		await connection.query(cmd, [
							companyid,
							xDeliveryNote.customer.id,
							session.user.id,
							xDeliveryNote.invoice_number,
							sub_total,
							xDeliveryNote.ship_total,
							tax_total,
							discount_total,
							rounding_total,
							xDeliveryNote.notes || "",
							xDeliveryNote.taxform_flag || 0,
							xDeliveryNote.exportform_flag || 0,
							xDeliveryNote.einvoice_info.bill_number || null,
							xDeliveryNote.einvoice_info.bill_date || null,
							xDeliveryNote.sync_status_id
						  ], function(err, dRows) {

								connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function(err, rows) {

									if (rows && rows[0] && rows[0].err == 0) {

										async.eachSeries(xDeliveryNote.lineitems, function iterator(lineitem, incb) {

											if(lineitem.id > 0) {
												connection.query("CALL spDeleteDirectInvoiceDetail(@err, @msg, ?, ?, ?, ?, ?)", [xDeliveryNote.id, lineitem.id, companyid, session.user.id, 1], function(dErr, dRows) {

													if(dErr) {
												  		callback(dErr);
												  	}
												  	
												  	connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function(err, drows1) {

														if (drows1 && drows1[0] && drows1[0] && drows1[0].err == 0) {
															connection.query("CALL spCreateDirectInvoiceDetail(@err, @msg, @id, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
																xDeliveryNote.id,
																lineitem.productid,
																lineitem.entered_quantity,
																lineitem.order_price,
																lineitem.sub_total,
																lineitem.tax_total,
																lineitem.ship_total,
																lineitem.discount_total,
																lineitem.uom_id,
																lineitem.notes,
																lineitem.entered_uom_id,
																lineitem.entered_quantity,
																null,
																session.user.id
															  ], function(err, dnRows) {

															  	if(err) {
															  		incb(err);
															  	}
															  	
															  	connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function(err, dnrows1) {

																	if (dnrows1 && dnrows1[0] && dnrows1[0] && dnrows1[0].err == 0) {
																		let id = dnrows1[0].id;
																		incb(null);
																	} else {
																		incb(dnrows1[0].msg);
																	}
																});
															});
														} else {
															incb(drows1[0].msg);
														}
													});												
												});
											}
											else {
												connection.query("CALL spCreateDirectInvoiceDetail(@err, @msg, @id, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
													xDeliveryNote.id,
													lineitem.productid,
													lineitem.entered_quantity,
													lineitem.order_price,
													lineitem.sub_total,
													lineitem.tax_total,
													lineitem.ship_total,
													lineitem.discount_total,
													lineitem.uom_id,
													lineitem.notes,
													lineitem.entered_uom_id,
													lineitem.entered_quantity,
													null,
													session.user.id
												  ], function(err, dnRows) {

												  	if(err) {
												  		incb(err);
												  	}
												  	
												  	connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function(err, dnrows1) {

														if (dnrows1 && dnrows1[0] && dnrows1[0] && dnrows1[0].err == 0) {
															let id = dnrows1[0].id;
															incb(null);
														} else {
															incb(dnrows1[0].msg);
														}
													});
												});
											}
										}, function(err) {
											if(err)
												return callback(err, null);

											return callback(null, xDeliveryNote);
										});
									}
									else {
										throw new Error(rows[0].msg);
									}
								});
								
						});

	} catch (err) {
		return callback(err, null);
	}

}

const updateDeliveryNoteOrderMetaData1 = async function(id, connection, callback) {

	let cmd = "";
	cmd = cmd + "UPDATE delivery_notes ";
	cmd = cmd + "INNER JOIN (SELECT GROUP_CONCAT(DISTINCT packing_slips.orders_id SEPARATOR ', ') as str FROM delivery_notes d1, delivery_note_details, packing_slips WHERE packing_slips.id = delivery_note_details.packing_slips_id AND d1.id = ? AND d1.id = delivery_note_details.delivery_notes_id ) data ";
	cmd = cmd + "SET    orders_id_string = data.str ";
	cmd = cmd + "WHERE  delivery_notes.id = ?";
	await connection.promise().query (cmd, [id, id]);

	cmd = "";
	cmd = cmd + "UPDATE delivery_notes ";
	cmd = cmd + "INNER JOIN (SELECT GROUP_CONCAT(DISTINCT orders.customer_order_number SEPARATOR ', ') as str FROM delivery_notes d1, delivery_note_details, packing_slips, orders WHERE packing_slips.id = delivery_note_details.packing_slips_id AND d1.id = ? AND d1.id = delivery_note_details.delivery_notes_id AND packing_slips.orders_id = orders.id) data ";
	cmd = cmd + "SET   po_string = data.str ";
	cmd = cmd + "WHERE  delivery_notes.id = ? ";
	await connection.promise().query (cmd, [id, id]);

	cmd = "";
	cmd = cmd + "UPDATE delivery_notes ";
	cmd = cmd + "INNER JOIN (SELECT GROUP_CONCAT(DISTINCT orders.order_number SEPARATOR ', ') as str FROM delivery_notes d1, delivery_note_details, packing_slips, orders WHERE packing_slips.id = delivery_note_details.packing_slips_id AND d1.id = ? AND d1.id = delivery_note_details.delivery_notes_id AND packing_slips.orders_id = orders.id) data ";
	cmd = cmd + "SET   order_number_string = data.str ";
	cmd = cmd + "WHERE  delivery_notes.id = ? ";
	await connection.promise().query (cmd, [id, id]);

	if (callback) 
		return callback(null, null);

	return;

};

exports.updateDeliveryNote = function(companyid, xDeliveryNote, session, connection, callback) {

	xDeliveryNote.note_date = (xDeliveryNote.note_date ? new Date(xDeliveryNote.note_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);
	xDeliveryNote.accounting_voucher_date = (xDeliveryNote.accounting_voucher_date ? new Date(xDeliveryNote.accounting_voucher_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	if (xDeliveryNote.lr_date != "")
		xDeliveryNote.lr_date = (xDeliveryNote.lr_date ? new Date(xDeliveryNote.lr_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	if (xDeliveryNote.einvoice_info && xDeliveryNote.einvoice_info.bill_date != "")
		xDeliveryNote.einvoice_info.bill_date = (xDeliveryNote.einvoice_info.bill_date ? new Date(xDeliveryNote.einvoice_info.bill_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	var ship_total = 0;
	var tax_total = 0;
	var sub_total = 0;
	var discount_total = 0;
	for (var i = 0; i < xDeliveryNote.packingsliplist.length; i++) {
		for (var j = 0; j < xDeliveryNote.packingsliplist[i].lineitems.length; j++) {
			ship_total = ship_total + xDeliveryNote.packingsliplist[i].lineitems[j].ship_total;
			tax_total = tax_total + xDeliveryNote.packingsliplist[i].lineitems[j].tax_total;
			sub_total = sub_total + xDeliveryNote.packingsliplist[i].lineitems[j].sub_total;
			discount_total = discount_total + xDeliveryNote.packingsliplist[i].lineitems[j].discount_total;
		}
	}

	var grandtotal = sub_total + (xDeliveryNote.ship_total || 0) + tax_total - discount_total;
	var rounding_total = Util.round(grandtotal, 0) - grandtotal;

	// header ship total is entered by user. If header total is not matching with line item, then re-distribute the total
	if (ship_total != xDeliveryNote.ship_total) {
		distributeShipping(xDeliveryNote, sub_total);
	}

	// if new ship address is entered, assign null
	if ( xDeliveryNote.ship_address.id == '' ) xDeliveryNote.ship_address.id = null;

	//eway bill to json
	if(xDeliveryNote.einvoice_info)
		xDeliveryNote.einvoice_info = JSON.stringify(xDeliveryNote.einvoice_info);

	// set sync status
	setSyncStatus(xDeliveryNote, session);

	var cmd = "SET @id = "+ xDeliveryNote.id +"; CALL spCreateUpdateDeliveryNote(@err, @msg, @id, ?,?,?,?, ?,?,?,?,?,?,?, ?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?)";

	connection.query(cmd, [
								companyid,
								xDeliveryNote.customer.id,
								xDeliveryNote.note_number,
								xDeliveryNote.note_date,
								session.user.id,
								xDeliveryNote.transporter.id,
								(xDeliveryNote.lr_number != "" ? xDeliveryNote.lr_number : null),
								(xDeliveryNote.lr_date != "" ? xDeliveryNote.lr_date : null),
								(xDeliveryNote.invoice_number != "" ? xDeliveryNote.invoice_number : null),
								sub_total,
								xDeliveryNote.ship_total,
								tax_total,
								discount_total,
								rounding_total,
								xDeliveryNote.notes,
								xDeliveryNote.taxform_flag || 0,
								xDeliveryNote.exportform_flag || 0,
								xDeliveryNote.proforma_invoice_flag || 0,
								xDeliveryNote.material_out_invoice_flag || 0,
								xDeliveryNote.destination,
								xDeliveryNote.ship_address.id,
								xDeliveryNote.ship_address.name,
								xDeliveryNote.ship_address.first_name,
								xDeliveryNote.ship_address.last_name,
								xDeliveryNote.ship_address.address1,
								xDeliveryNote.ship_address.address2,
								xDeliveryNote.ship_address.address3,
								xDeliveryNote.ship_address.city,
								xDeliveryNote.ship_address.state,
								xDeliveryNote.ship_address.zip,
								xDeliveryNote.ship_address.phone1,
								xDeliveryNote.ship_address.phone2,
								xDeliveryNote.ship_address.email1,
								xDeliveryNote.ship_address.email2,
								xDeliveryNote.destination_distance,
								xDeliveryNote.sync_status_id,
								xDeliveryNote.sync_failure_reason,
								(xDeliveryNote.accounting_voucher_date != "" ? xDeliveryNote.accounting_voucher_date : null),
								xDeliveryNote.einvoice_info
							  ], function (err, rows) {

									if (err) return callback (err);

									connection.query("SELECT @err AS err, @msg AS msg, @id AS id", function (err, rows) {
										if (rows && rows[0] && rows[0].err == 0) {
											xDeliveryNote.id = rows[0].id;

											var errors = [];
											async.eachSeries(xDeliveryNote.packingsliplist, function iterator(packingslip, callback) {

												async.eachSeries(packingslip.lineitems, function iterator(lineitem, callback) {

													var cmd = "UPDATE delivery_note_details SET ship_total = ?, tax_total = ?, discount_total = ?, last_updated = NOW() WHERE packing_slip_details_id = ? AND delivery_notes_id = ?";
													connection.query(cmd, [
																			lineitem.ship_total,
																			lineitem.tax_total,
																			lineitem.discount_total,
																			lineitem.id,
																			xDeliveryNote.id
																		  ], function (err, rows) {

																		  		if (err) {
																		  			errors.push(err);
																		  			return callback (err);
																		  		}

																				if (rows.affectedRows == 1)
																					return callback (err, xDeliveryNote);
																				else {
																					var err = new Err();
																					err.code = "-901";
																					err.message = "Unspecified error!";
																			  		errors.push(err);
																					return callback(err, null);
																				}
																	});

												}, function (err) {

													if (errors.length > 0) {
														return callback (errors[0]);
													}

													connection.query ("CALL spSplitDeliveryNoteTax(@err, @msg, ?,?)", [companyid, xDeliveryNote.id], function (err, rows) {
														if (err) {
															errors.push(err);
															return callback (err);
														}

														cmd = "";
														cmd = cmd + " UPDATE packing_slips ";
														cmd = cmd + " SET    packing_slips.net_weight    =  CASE WHEN ? IS NOT NULL THEN  ? ELSE net_weight END, ";
														cmd = cmd + "        packing_slips.gross_weight  =  CASE WHEN ? IS NOT NULL THEN  ? ELSE gross_weight END, ";
														cmd = cmd + " 		 packing_slips.last_updated  =  NOW() "; 
														cmd = cmd + " WHERE  packing_slips.id            =  ?";
		
														connection.query (cmd, [packingslip.net_weight, packingslip.net_weight, packingslip.gross_weight, packingslip.gross_weight, packingslip.id], function (err, rows) {
													  		if (err) {
													  			errors.push(err);
													  			return callback (err);
													  		}
															return callback(err, xDeliveryNote);
														});

													});

												});

											}, function (err) {
												if (errors.length > 0) {
													return callback (errors[0]);
												} else
													return callback(err, xDeliveryNote);
											});		

//											return callback(err, xDeliveryNote);
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
											return callback(err, null);
										}
									});

								}
		);

};

exports.findDeliveryNoteById = function (id, companyid, session, connection, callback) {

	var cmd = "CALL spGetDeliveryNote(@err, @msg, @totalrecords, ?,?,?,?,?,?,?, ?,?,?,?,?,?,?, ?,?,?,?,?)";

	connection.query(cmd, [
								companyid,
								id,
								session.user.id,
								null,
								null,
								null,
								null,
								null,
								null,
								null,
								null,
								null,
								null,
								null,
								null,
								1,
								1,
								null,
								-1
							  ], function (err, rows) {

									if (err) return callback (err);

									connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
										if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null) && feedbackrows[0].totalrecords > 0) 
										{
											var deliverynote = Map.mapToBDeliveryNote(rows[0][0]);

											MasterService.findAddressById (deliverynote.ship_address.id, deliverynote.customer.id, session, connection, (err, address) => {

												if (err) return callback (err, null);

												if (address == null) return callback(new Error("Customer address not found."), null);

												address.id = deliverynote.ship_address.id;
												deliverynote.ship_address = address;

												CompanyService.findCustomerById(deliverynote.customer.id, companyid, session, connection, function (err, customer) {
													if (err) return callback (setError(err), null);
													deliverynote.customer = customer;

													if (customer.taxform_flag == 1) deliverynote.tax_type_id = 1;
													if (deliverynote.direct_invoice_flag == 0) {
														cmd = "SELECT d.* FROM delivery_note_details d WHERE d.delivery_notes_id = ?";

														connection.query(cmd, [id], function (err, rows) {
															var lPackingSlipDeliveryNoteDetailHash = {};
															var hPackingSlipDetail_TaxShip = {};
															if (rows && rows.length) {
																for (var i = 0; i < rows.length; i++) {
																	if (!rows[i].packing_slips_id) rows[i].packing_slips_id = 0;
																	if (rows[i].packing_slips_id in lPackingSlipDeliveryNoteDetailHash) {
																		lDeliveryNoteDetail = lPackingSlipDeliveryNoteDetailHash[rows[i].packing_slips_id];
																		lDeliveryNoteDetail.push(rows[i]);
																	}
																	else {
																		var lDeliveryNoteDetail = [];
																		lDeliveryNoteDetail.push(rows[i]);
																		lPackingSlipDeliveryNoteDetailHash[rows[i].packing_slips_id] = lDeliveryNoteDetail;
																	}
																	hPackingSlipDetail_TaxShip[rows[i].packing_slip_details_id] = {"sub_total":rows[i].sub_total, "ship_total":rows[i].ship_total, "tax_total":rows[i].tax_total, "discount_total":rows[i].discount_total};
																}
															}

															async.eachSeries(Object.keys(lPackingSlipDeliveryNoteDetailHash), function iterator(packingslipid, callback) {
																exports.getPackingSlipDetail(packingslipid, companyid, session, connection, function (err, packingslip) {
																	if (err) return callback (err);
																	for (var i = 0; i < packingslip.lineitems.length; i++) {
																		packingslip.lineitems[i].sub_total = hPackingSlipDetail_TaxShip[packingslip.lineitems[i].id].sub_total;
																		packingslip.lineitems[i].tax_total = hPackingSlipDetail_TaxShip[packingslip.lineitems[i].id].tax_total;
																		packingslip.lineitems[i].discount_total = hPackingSlipDetail_TaxShip[packingslip.lineitems[i].id].discount_total;
																		packingslip.lineitems[i].ship_total = hPackingSlipDetail_TaxShip[packingslip.lineitems[i].id].ship_total;
																	}
																	deliverynote.packingsliplist.push(packingslip);
																	callback(err, deliverynote);
																});
															}, function (err) {
																return callback(err, deliverynote);
															});
														});
													}
													else {
														cmd = "SELECT d.*, p.sysproducthsn_id as hsn_id, u.name as uom_name, u.short_name as uom_short_name, u.id as uom_id, eu.short_name as entered_uom_name, eu.name as entered_uom_short_name, eu.id as entered_uom_id " +
																" FROM delivery_note_details d " +
																" INNER JOIN products p ON p.id = d.products_id " + 
																" INNER JOIN unit_of_measures u ON u.id = d.unit_of_measures_id " + 
																" INNER JOIN unit_of_measures eu ON eu.id = d.entered_unit_of_measures_id " + 
																" WHERE d.delivery_notes_id = ?";

														connection.query(cmd, [
															id
															], function (err, rows) {
																 
															var lDeliveryNoteDetail = [];
															for (var i = 0; i < rows.length; i++) {
																lDeliveryNoteDetail.push(Map.maptoBDeliveryNoteDetail(rows[i]));
															}
															deliverynote.lineitems = lDeliveryNoteDetail;
																	callback(err, deliverynote);
																
														});
													}
												});

											});


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

exports.findGatePassByID = function (id, companyid, session, connection, cb) {

	var data ={};

	async.parallel([

		//Load GatePass Header
		function(callback){

			var cmd = "select g.* from gate_passes g where id = ? and companies_id = ?";
			connection.query(cmd, [
									id, companyid
								], function (err, rows) {
									if (err) return callback (err);
									data.gate_pass = rows[0];
									return callback();
								}
			);
		},

		//Load GatePassDetails
		function(callback){
		 
			var cmd = "SELECT  p.*, gd.* " +
					  "FROM gate_passes g " +
					  "INNER JOIN gate_pass_details gd on gd.gate_passes_id = g.id " +
					  "INNER JOIN packing_slips p on gd.packing_slips_id = p.id " +
					  "WHERE g.id = ?";

			connection.query(cmd, [id], function (err, rows) {
				if (err) return callback (err);

				if (rows && rows.length)
				{
					data.gate_pass_details = [];
					async.map(rows, (row, inCb) => {
						data.gate_pass_details.push(Map.mapToBGatePassDetail(row));
						inCb(null, true);

					}, function(err, results) {
					    // results is an array of products however we will use prodList as that will be sure because 
					    return callback(null, data.gate_pass_details);
					});
				}
			});
		}
	],

	//Error
	function(err){

	 	if (err) return cb(err); //If an error occured, we let express/connect handle it by calling the "next" 

	 	if (!data.gate_pass) return cb (new Error("Gate Pass not found."));
		var bGatePass = Map.mapToBGatePass(data.gate_pass);
		bGatePass.gate_pass_details = data.gate_pass_details;
		cb(err, bGatePass);
	});
											
};

exports.findAllDeliveryNotes = function (companyid, options, session, connection, callback) {

	var fromdate = (options.fromdate ? new Date(options.fromdate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);
	var todate   = (options.todate   ? new Date(options.todate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	var cmd = "CALL spGetDeliveryNote(@err, @msg, @totalrecords, ?,?,?,?,?,?,?, ?,?,?,?,?,?,?, ?,?,?,?,?)";

	connection.query(cmd, [
								companyid,
								(options.id ? options.id : null),
								session.user.id,
								(options.agentid ? options.agentid : null), 
								(options.customerid ? options.customerid : null),
								(options.statusid ? options.statusid : null),
								(options.productid ? options.productid : null),
								(options.note_number ? options.note_number : null),
								(options.invoice_number ? options.invoice_number : null),
								(options.lr_number ? options.lr_number : null),
								(options.gate_pass_number ? options.gate_pass_number : null),
								fromdate,
								todate,
								(options.fromdate && options.todate ? 1 : null),
								(options.sync_status_id ? options.sync_status_id : null),
								(options.pagenumber ? options.pagenumber : 1),
								(options.pagesize ? options.pagesize : 20),
								(options.sortby ? options.sortby : null),
								(options.sortorder ? options.sortorder : -1)
							  ], function (err, rows) {

									if (err) return callback (err);

									var deliverynotelist = [];

									connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
										if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
										{
											for(var i = 0; i <rows[0].length; i++)
											{
												deliverynotelist.push(Map.mapToBDeliveryNote(rows[0][i]));
												deliverynotelist[i].totalrecords = feedbackrows[0].totalrecords;
											}
									
											return callback(null, deliverynotelist);
									
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

exports.getDetailedOrder = function (orderid, companyid, session, connection, callback) {

	exports.findById(orderid, companyid, session, connection, function (err, order) {
		if (err) return callback (setError(err), null);

		order.sub_total = order.sub_total.toFixed(2);
		order.tax_total = order.tax_total.toFixed(2);
		order.discount_total = (order.discount_total * -1).toFixed(2);
		order.grand_total = order.grand_total.toFixed(2);

		order.order_date = (order.order_date ? new Date(order.order_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "");
		order.order_date = order.order_date.substring(0, 10);

		for (var i=0; i < order.lineitems.length; i++) {
			order.lineitems[i].order_price = order.lineitems[i].order_price.toFixed(2);
			order.lineitems[i].discount = order.lineitems[i].discount.toFixed(2);
			order.lineitems[i].tax = order.lineitems[i].tax.toFixed(2);
			order.lineitems[i].shipping = order.lineitems[i].shipping.toFixed(2);
			order.lineitems[i].extension = order.lineitems[i].extension.toFixed(2);
		}

		async.parallel([
			//Load Order
			function(callback){

				CompanyService.findCustomerById(order.customer.id, companyid, session, connection, function (err, customer) {
					if (err) callback (setError(err), null);
					order.customer = customer;
					CompanyService.findAgentById(order.customer.agent.id, companyid, session, connection, function (err, agent) {
						if (err) callback (setError(err), null);
						order.customer.agent = agent;
						callback(null, null);
					});
				});
			
			},

			function (callback) {

				UserService.findById(order.orderusers_id, companyid, session, connection, function (err, user) {
					if (err) callback (setError(err), null);
					order.order_by = user;
					callback(null, null);
				});

			},

			function (callback) {

				MasterService.findTransporterById(order.transporters_id, companyid, session, connection, function (err, transporter) {
					if (err) callback (setError(err), null);
					order.transporter = transporter;
					callback(null, null);
				});

			},

			function (callback) {

				CompanyService.findById(order.companies_id, connection, function (err, company) {
					if (err) callback (setError(err), null);
					order.company = company;
					callback(null, null);
				});

			},

			function (callback) {

					var configHash = {};
					ConfigService.findAll(order.companies_id, 1, session, connection, function (err, configList) {

						if (err) return callback (setError(err), null);

						for (var i = 0; i < configList.length; i++)
							configHash[configList[i].name] = configList[i].value;

						order.configuration = configHash;

						callback(null, null);
					});

			}], function (err, results) {

				if (err) return callback (err, null);
				return callback(null, order);
			});

	});

};

exports.printOrder = function (orderid, companyid, session, connection, callback) {

	exports.getDetailedOrder(orderid, companyid, session, connection, function (err, order) {
		if (err) return callback (setError(err), null);

		var wkhtmltopdf = require('wkhtmltopdf');

		var nunjucks = require('nunjucks');
		var env = nunjucks.configure();

		env.addFilter('fixed', function(num, length) {
		    return  num.toFixed(2 || length);
		});

		var renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/order.html", order);

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
//						wkhtmltopdf(str, { output: 'out2.pdf', 'pageSize':pageSize,'disableSmartShrinking':true, 'dpi':dpi});
	//	wkhtmltopdf('<h1>Test</h1><p>Hello world</p>').pipe(res);
//		wkhtmltopdf(renderedHtml, { 'pageSize':pageSize,'disableSmartShrinking':false,  'headerSpacing':20, 'headerHtml':headerHtmlURL, 'marginTop':'50mm', 'dpi':dpi, 'footerCenter':'Powered by SimplyTextile - Contact: 9502816370'}, function (err, stream){
                wkhtmltopdf(renderedHtml, { 'pageSize':pageSize,'disableSmartShrinking':false, 'dpi':dpi, 'footerCenter':'Powered by SimplyApp.in - Contact: 9502816370'}, function (err, stream){
			return callback (err, stream);
		});

	});

};

exports.getPackingSlipDetail = function (id, companyid, session, connection, callback) {

	exports.findPackingslipById (id, companyid, session, connection, function (err, packingslip) {

			if (err) return callback(err);

			packingslip.packing_date = (packingslip.packing_date ? new Date(packingslip.packing_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "");
			packingslip.packing_date = packingslip.packing_date.substring(0, 10);

			var packing_slip_detail_list = [];
			var unitWiseHash = {};

			MasterService.findAddressById(packingslip.order.ship_addresses_id, packingslip.order.customer.id, session, connection, function (err, address) {
				if (err) return callback(err);
				if (!packingslip.more) packingslip.more = {};
				packingslip.more.ship_address = address;
			});

			MasterService.findTransporterById(packingslip.order.transporters_id, companyid, session, connection, function (err, transporter) {

				if (err) return callback (setError(err), null);

				packingslip.order.transporter = transporter;

				async.eachSeries(packingslip.lineitems, function iterator(row, callback) {
			
					row.packed_qty_quote = row.packed_qty_quote.toFixed(2);
					row.packed_qty_qty   = row.packed_qty_qty.toFixed(2);
					
					//get the uom from order
					var uom_id = row.order_detail.unit_of_measures_id;
					var uom_short_name = row.order_detail.uom_short_name;
					
					bQuoteQty = (row.order_detail.unit_of_measures_id == row.unit_of_measures_id);

//					if (row.uom_short_name in unitWiseHash) {
					if (uom_short_name in unitWiseHash) {
						obj = unitWiseHash[uom_short_name];
						qty = obj.qty + (bQuoteQty ? eval(row.packed_qty_quote) : eval(row.packed_qty_qty));
						pcs = obj.pcs + eval(row.piece_count);
					}
					else {
						qty = (bQuoteQty ? eval(row.packed_qty_quote) : eval(row.packed_qty_qty));
						pcs = row.piece_count;
						unitWiseHash[uom_short_name] = {};
						unitWiseHash[uom_short_name]["unitname"] = uom_short_name;
//						unitWiseHash[uom_short_name]["pcs"] = 0;
						unitWiseHash[uom_short_name]["pcs_with_zero_qty"] = 0;
					}

					unitWiseHash[uom_short_name].qty = parseFloat(qty);
					unitWiseHash[uom_short_name].pcs = parseFloat(pcs);

					if (row.is_batched_inventory == 1) {

						ProductService.findStockBucketById(row.stock_bucket_id, companyid, session, connection, function (err, bucket) {
							if (err) return callback (err, null);

							for (var i=0; i < bucket.stock_bucket_detail.length; i++) {
								if (bucket.stock_bucket_detail[i].qty == 0) {
									unitWiseHash[row.uom_short_name].pcs_with_zero_qty++;
								}
//								unitWiseHash[row.uom_short_name].pcs++;
								bucket.stock_bucket_detail[i].qty = bucket.stock_bucket_detail[i].qty.toFixed(2);
							}

							row.bucket = bucket;

							return callback(err, row);
						});

					}
					else
						return callback(err, row);
					}, function (err) {

						if (err) return callback(err, null);

						var unit_list = [];
						Object.keys(unitWiseHash).forEach(function (key) {
							unitWiseHash[key].qty = unitWiseHash[key].qty.toFixed(2);
							unit_list.push(unitWiseHash[key]);
						});

						packingslip.unit_list = unit_list;

						return callback (err, packingslip);

				});
			});

	});
};

exports.getGatePassDetailByID = function (id, companyid, session, connection, cb) {

	exports.findGatePassByID (id, companyid, session, connection, function (err, gatepass) {

			if (err) return cb(err);
			gatepass.gate_pass_date = (gatepass.gate_pass_date ? new Date(gatepass.gate_pass_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "");
			gatepass.gate_pass_date = gatepass.gate_pass_date.substring(0, 10);
			var invoiceHash = {};
			var idx = 0;
			async.eachSeries(gatepass.gate_pass_details, function iterator(gd, callback) {
				exports.findDeliveryNoteById(gd.delivery_notes_id, companyid, session, connection, function(err, delivery_note){

					//get the transporter details from delivery note
					var transporter_id = delivery_note.transporter.id;
					var invoice_number = delivery_note.invoice_number;
					var key = transporter_id + "_" + invoice_number;
					if (key in invoiceHash) {

						invoiceHash[key].qty += 1;
						invoiceHash[key].gross_weight += (gd.gross_weight == null ? 0 : gd.gross_weight);
						invoiceHash[key].freight += (gd.tempo_charges == null ? 0 : gd.tempo_charges);
					}
					else
					{
						invoiceHash[key] = {};
						invoiceHash[key].sequence = ++idx;
						invoiceHash[key].invoice_number = delivery_note.invoice_number;
						invoiceHash[key].transporter_name = delivery_note.transporter.name;
						invoiceHash[key].destination = delivery_note.destination;
						invoiceHash[key].qty = 1;
						invoiceHash[key].gross_weight = (gd.gross_weight == null ? 0 : gd.gross_weight);
						invoiceHash[key].freight = (gd.tempo_charges == null ? 0 : gd.tempo_charges);
					}
					return callback(err);
				});

			}, function (err) {

				if (err) return callback(err, null);

				var total_qty = 0;
				var total_gw = 0;
				var total_freight = 0;
				gatepass.lineitems = [];
				Object.keys(invoiceHash).forEach(function (key) {
					invoiceHash[key].qty = invoiceHash[key].qty.toFixed(2);
					invoiceHash[key].gross_weight = invoiceHash[key].gross_weight.toFixed(2);
					total_qty += parseInt(invoiceHash[key].qty);
					total_gw += parseInt(invoiceHash[key].gross_weight);
					total_freight += invoiceHash[key].freight;
					gatepass.lineitems.push(invoiceHash[key]);
				});

				gatepass.summary = {};
				gatepass.summary.total_qty = total_qty;
				gatepass.summary.total_gw = total_gw;
				gatepass.summary.total_freight = total_freight;
				return cb(err, gatepass);
		});
	});
};


exports.printPackingSlip = function (id, companyid, session, connection, callback) {

	exports.getPackingSlipDetail(id, companyid, session, connection, function (err, packingslip) {

			if (err) return callback(err);

			var wkhtmltopdf = require('wkhtmltopdf');

			var nunjucks = require('nunjucks');
			var env = nunjucks.configure();

			env.addFilter('fixed', function(num, length) {
			    return  num.toFixed(2 || length);
			});

			var renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/packing_slip.html", packingslip);

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

			wkhtmltopdf(renderedHtml, { 'pageSize':pageSize,'disableSmartShrinking':false, 'dpi':dpi, 'footerCenter':'Powered by SimplyApp.in - Contact: 9502816370'}, function (err, stream){
				return callback (err, stream);
			});

	});

};

exports.printGatePass = function (id, companyid, session, connection, callback) {

	exports.getGatePassDetailByID(id, companyid, session, connection, function (err, gatepass) {

			if (err) return callback(err);

			var wkhtmltopdf = require('wkhtmltopdf');

			var nunjucks = require('nunjucks');
			var env = nunjucks.configure();

			env.addFilter('fixed', function(num, length) {
			    return  num.toFixed(2 || length);
			});

			var renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/gate_pass.html", gatepass);
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

			wkhtmltopdf(renderedHtml, { 'pageSize':pageSize,'disableSmartShrinking':false, 'dpi':dpi, 'footerCenter':'Powered by SimplyApp.in - Contact: 9502816370'}, function (err, stream){
				return callback (err, stream);
			});

	});

};
const qrcode = require('qrcode');

exports.getDetailedDeliveryNote = function (id, companyid, session, connection, callback) {
	getDetailedDeliveryNote(id, companyid, session, connection, function (err, deliverynote) {

			if (err) return callback(err);

			var dateFormat  = require("dateformat");

			deliverynote.note_date_string = dateFormat(new Date(deliverynote.note_date), "dd-mmm-yyyy");
			deliverynote.lr_date_string = deliverynote.lr_date && deliverynote.lr_date != '' ? dateFormat(new Date(deliverynote.lr_date), "dd-mmm-yyyy") : '';
			deliverynote.einvoice_info.bill_date_string = deliverynote.einvoice_info.bill_date && deliverynote.einvoice_info.bill_date != '' ? dateFormat(new Date(deliverynote.einvoice_info.bill_date), "dd-mmm-yyyy") : '';
			deliverynote.extension_in_words = Util.convertNumberToWordsForIndia(deliverynote.extension);
			qr_promise = deliverynote.einvoice_info.qr_string ? qrcode.toDataURL(deliverynote.einvoice_info.qr_string) : Promise.resolve();
			qr_promise.then(function(qr_code_img) {
				if(!qr_code_img) qr_code_img = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
				deliverynote.qr_code = qr_code_img;
				var nunjucks = require('nunjucks');
				var env = nunjucks.configure();

				env.addFilter('fixed', function(num, length) {
					return  num.toFixed(2 || length);
				});
				deliverynote.configuration.logo_url = Config.web.image_server_url + deliverynote.configuration.logo_url;
				deliverynote.configuration.logo_url = "http://localhost:8081/upload/mbtowel.jpg"
				var renderedHtml;

				if(deliverynote.direct_invoice_flag == 1)
					renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/directInvoiceHeader.html", deliverynote);
				else
					renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/deliveryNoteHeader.html", deliverynote);

				return callback(err, renderedHtml);
			})
	});
};

var getDetailedDeliveryNote = function (id, companyid, session, connection, callback) {

	exports.findDeliveryNoteById(id, companyid, session, connection, function (err, deliverynote) {

		if (err) return callback (setError(err), null);

		if (deliverynote.lr_date != "") {
			deliverynote.lr_date = (deliverynote.lr_date ? new Date(deliverynote.lr_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "");
			deliverynote.lr_date = deliverynote.lr_date.substring(0, 10);
		}

		if (deliverynote.note_date != "") {
			deliverynote.note_date = (deliverynote.note_date ? new Date(deliverynote.note_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "");
			deliverynote.note_date = deliverynote.note_date.substring(0, 10);
		}

		if (deliverynote.einvoice_info.bill_date != "") {
			deliverynote.einvoice_info.bill_date = (deliverynote.einvoice_info.bill_date ? new Date(deliverynote.einvoice_info.bill_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "");
			deliverynote.einvoice_info.bill_date = deliverynote.einvoice_info.bill_date.substring(0, 10);
		}
		
		deliverynote.sub_total = deliverynote.sub_total.toFixed(2);
		deliverynote.ship_total = deliverynote.ship_total.toFixed(2);
		deliverynote.discount_total = deliverynote.discount_total.toFixed(2);
		deliverynote.rounding_total = deliverynote.rounding_total.toFixed(2);
		deliverynote.tax_total = deliverynote.tax_total.toFixed(2);
		deliverynote.tax_total_igst = deliverynote.tax_total_igst.toFixed(2);
		deliverynote.tax_total_cgst = deliverynote.tax_total_cgst.toFixed(2);
		deliverynote.tax_total_sgst = deliverynote.tax_total_sgst.toFixed(2);
		deliverynote.tax_total_vat = deliverynote.tax_total_vat.toFixed(2);
		
		deliverynote.extension = (parseFloat(deliverynote.sub_total) + parseFloat(deliverynote.tax_total) + parseFloat(deliverynote.ship_total) - parseFloat(deliverynote.discount_total) + parseFloat(deliverynote.rounding_total)).toFixed(2);

		async.parallel([
			function (callback) {

				CompanyService.findCustomerById(deliverynote.customer.id, companyid, session, connection, function (err, customer) {
					if (err) return callback (setError(err), null);
					deliverynote.customer = customer;
					callback(null, null);
				});

			},
			function (callback) {

				CompanyService.findById(companyid, connection, function (err, company) {
					if (err) callback (setError(err), null);
					deliverynote.company = company;
					callback(null, null);
				});

			},

			function (callback) {

					var configHash = {};
					ConfigService.findAll(companyid, 1, session, connection, function (err, configList) {

						if (err) return callback (setError(err), null);

						for (var i = 0; i < configList.length; i++)
								configHash[configList[i].name] = configList[i].value;

						deliverynote.configuration = configHash;

						callback(null, null);
					});

			},
			function (callback) {
				var xPackingSlipHash = {};
				var xOrderHash = {};
				var unitHash = {};

				async.eachSeries(deliverynote.packingsliplist, function iterator(packingslip, callback) {
						exports.getPackingSlipDetail(packingslip.id, companyid, session, connection, function (err, x) {

							if (err) return callback (err, null);
							xPackingSlipHash[packingslip.id] = x;
							
							if (!(x.order.id in xOrderHash)) {
								exports.findById(x.order.id, companyid, session, connection, function (err, order) {
									x.order = order;
									xOrderHash[x.order.id] = order;
									return callback (err, x);				
								});
							}
							else {
									x.order = xOrderHash[x.order.id];
									return callback (err, x);				
							}
						});

					}, function (err) {

						if (err) return callback(err, null);

						var idx = 0;

						// As packing slip assignment will overwrite sub total, ship total and tax total in line items.
						// Save first and reassign back.
						var hDeliveryNoteDetail = {};
						for (var i = 0; i < deliverynote.packingsliplist.length; i++) {
							for (var j = 0; j < deliverynote.packingsliplist[i].lineitems.length; j++) {
								var obj =  {"sub_total": deliverynote.packingsliplist[i].lineitems[j].sub_total, "tax_total" : deliverynote.packingsliplist[i].lineitems[j].tax_total, "ship_total":  deliverynote.packingsliplist[i].lineitems[j].ship_total, "discount_total": deliverynote.packingsliplist[i].lineitems[j].discount_total };
								hDeliveryNoteDetail[deliverynote.packingsliplist[i].lineitems[j].id] = obj;
								// save qty by unit
								if (deliverynote.packingsliplist[i].lineitems[j].uom_short_name in unitHash) {
									unitHash[deliverynote.packingsliplist[i].lineitems[j].uom_short_name] = parseFloat(unitHash[deliverynote.packingsliplist[i].lineitems[j].uom_short_name]) + parseFloat(deliverynote.packingsliplist[i].lineitems[j].packed_qty_quote);
								} else {
									unitHash[deliverynote.packingsliplist[i].lineitems[j].uom_short_name] = parseFloat(deliverynote.packingsliplist[i].lineitems[j].packed_qty_quote);
								}
							}
						}
						// save qty by unit from hash to list
						deliverynote.unit_list = [];
						for (key in unitHash) {
							var obj = {"qty":unitHash[key].toFixed(2), "unitname":key};
							deliverynote.unit_list.push(obj);
						}
						// In order to find order price, scan the order line items and set the attribute order price
						for (var i = 0; i < deliverynote.packingsliplist.length; i++) {
							deliverynote.packingsliplist[i] = xPackingSlipHash[deliverynote.packingsliplist[i].id];
							for (var j = 0; j < deliverynote.packingsliplist[i].lineitems.length; j++) {
								for (var k = 0; k < deliverynote.packingsliplist[i].order.lineitems.length; k++) {
									if (deliverynote.packingsliplist[i].lineitems[j].order_detail_id == deliverynote.packingsliplist[i].order.lineitems[k].id) {
										deliverynote.packingsliplist[i].lineitems[j].order_price = deliverynote.packingsliplist[i].order.lineitems[k].order_price.toFixed(2);
										deliverynote.packingsliplist[i].lineitems[j].extension = (deliverynote.packingsliplist[i].order.lineitems[k].order_price * deliverynote.packingsliplist[i].lineitems[j].packed_qty_quote).toFixed(2);
										deliverynote.packingsliplist[i].lineitems[j].tax_total = hDeliveryNoteDetail[deliverynote.packingsliplist[i].lineitems[j].id].tax_total.toFixed(2);
										deliverynote.packingsliplist[i].lineitems[j].discount_total = hDeliveryNoteDetail[deliverynote.packingsliplist[i].lineitems[j].id].discount_total.toFixed(2);
										deliverynote.packingsliplist[i].lineitems[j].ship_total = hDeliveryNoteDetail[deliverynote.packingsliplist[i].lineitems[j].id].ship_total.toFixed(2);
										deliverynote.packingsliplist[i].lineitems[j].sequence = ++idx;
									}
								}
							}
						}
					    //if the product are same in tax invoice , we can grouped it in single line by adding amount, tax and quantity of than
				        for (i = 0; i < deliverynote.packingsliplist.length; i++) {
							var lineitemsUpdated = [];
							for(var j=0; j < deliverynote.packingsliplist[i].lineitems.length; j++) {
								var x = deliverynote.packingsliplist[i].lineitems[j];								
								const index = lineitemsUpdated.findIndex(
												b => b.order_detail.hsn.short_code === 
														x.order_detail.hsn.short_code 
															&& b.is_batched_inventory === 1)
								if(index > -1) {									
									lineitemsUpdated[index].bucket.stock_quote += x.bucket.stock_quote;
									lineitemsUpdated[index].sub_total += x.sub_total;
									lineitemsUpdated[index].bucket.stock_qty += x.bucket.stock_qty;
									lineitemsUpdated[index].tax_total = parseFloat(lineitemsUpdated[index].tax_total) + parseFloat(x.tax_total);
									lineitemsUpdated[index].extension = lineitemsUpdated[index].sub_total.toFixed(2);
									lineitemsUpdated[index].packed_qty_quote = lineitemsUpdated[index].bucket.stock_quote.toFixed(2);
									lineitemsUpdated[index].packed_qty_qty = lineitemsUpdated[index].bucket.stock_qty.toFixed(2);
									lineitemsUpdated[index]._tax_total = lineitemsUpdated[index].tax_total;
									lineitemsUpdated[index].is_batched_inventory = 0;
								} else {
									lineitemsUpdated.push(x);
								}
							}						
							deliverynote.packingsliplist[i].lineitems = lineitemsUpdated
						}   
						return callback (err, deliverynote);
					}
				);
			}
		], function (err, results) {

			if (err) return callback (err, null);
			return callback (err, deliverynote);
		});

	});

};

exports.printDeliveryNote = function (id, companyid, offsetLines, showTotals, session, connection, callback) {
				
	getDetailedDeliveryNote(id, companyid, session, connection, function (err, deliverynote) {

			if (err) return callback(err);

			var wkhtmltopdf = require('wkhtmltopdf');
			var dateFormat  = require("dateformat");

			deliverynote.show_totals = showTotals;
			deliverynote.note_date_string = dateFormat(new Date(deliverynote.note_date), "dd-mmm-yyyy");
			deliverynote.lr_date_string = deliverynote.lr_date && deliverynote.lr_date != '' ? dateFormat(new Date(deliverynote.lr_date), "dd-mmm-yyyy") : '';
			deliverynote.einvoice_info.bill_date_string = deliverynote.einvoice_info.bill_date && deliverynote.einvoice_info.bill_date != '' ? dateFormat(new Date(deliverynote.einvoice_info.bill_date), "dd-mmm-yyyy") : '';
			deliverynote.extension_in_words = Util.convertNumberToWordsForIndia(deliverynote.extension);
			deliverynote.offset_lines = offsetLines;

			var nunjucks = require('nunjucks');
			var env = nunjucks.configure();

			env.addFilter('fixed', function(num, length) {
			    return  num.toFixed(2 || length);
			});

			var renderedHtml;

			if(deliverynote.direct_invoice_flag == 1) {
				renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/directInvoice.html", deliverynote);
				marginTop = 55;
			}
			else {
				renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/deliverynote.html", deliverynote);
				marginTop = 105;
			}

			//var renderedHtml1 =  nunjucks.render(process.cwd() + "/src/print_templates/deliverynote_header.html", deliverynote);

			wkhtmltopdf.command = Config.PDF_CONVERTER_WITH_PATH;

			var pageSize = 'A4';
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

			// var pdf = require('html-pdf');
			// var options = { format: 'A4' };
			// pdf.create(renderedHtml, options).toStream(function(err, stream){
			// 	return callback (err, stream);
			//   // stream.pipe(fs.createWriteStream('./foo.pdf'));
			// });

			var headerHtmlURL = Config.web.image_server_url + 'api/deliverynotes/'+ id +'?app_sid='+session.id+'&header=1';
			wkhtmltopdf(renderedHtml, { 'pageSize':pageSize,'disableSmartShrinking':false, 'dpi':dpi, 'headerHtml' : headerHtmlURL, 'marginTop' : marginTop, 'footerCenter':'Powered by SimplyApp.in - Contact: 9502816370'}, function (err, stream){
				return callback (err, stream);
			});

	});

};

exports.getProductsByOrderID = function (id, companyid, session, connection, callback) {

	let cmd = "SELECT od.products_id FROM order_details od WHERE orders_id = ?";
	connection.query(cmd, [id], function (err, rows) {
		if (err) return callback (err);

		if (rows && rows.length)
		{
			let prodIDHash = {};
			let prodList = [];

			async.map(rows, (row, inCb) => {
				if (!(row.products_id in prodIDHash))
				{
					ProductService.findById(row.products_id, companyid, session, connection, function (err, product) {
						prodIDHash[row.products_id] = 1;
						prodList.push(product);
						inCb(null, product);
					});
				} else {
					inCb(null, true);
				}

			}, function(err, results) {
			    // results is an array of products however we will use prodList as that will be sure because 
			    return callback(null, prodList);
			});

// The following code works as well. It's just serial vs above code is parallel. 
// var start = new Date()
// var simulateTime = 1000;

// 			let prodList = [];
// 			async.eachSeries(rows, function iterator(row, inCb) {
// 				if (!(row.products_id in prodIDHash))
// 				{
// 					ProductService.findById(row.products_id, companyid, session, connection, function (err, product) {
// 						prodList.push(product);
// 						prodIDHash[row.products_id] = 1;
// 						inCb(null, true);
// 					});
// 				} else {
// 					inCb(null, true);
// 				}
// 			}, 
// 			function(err) 
// 			{
// 				var end = new Date() - start
//   console.log('Execution time: %dms', end);
// 				return callback(null, prodList);
// 			});
			
		}
		else {
			let err = new Err();
			err.code    = "-105";
			err.message = "Order not found.";
			return callback(err);
		}
	});			
};

exports.printOrder1 = function (orderid, companyid, session, connection, callback) {
	exports.findById(orderid, companyid, session, connection, function (err, order) {
		if (err) return callback (setError(err), null);
		CompanyService.findCustomerById(order.customer.id, companyid, session, connection, function (err, customer) {
			if (err) return callback (setError(err), null);
			order.customer = customer;

			order.order_date = (order.order_date ? new Date(order.order_date).toISOString().replace(/T/, ' ').replace(/\..+/, '') : "");
			order.order_date = order.order_date.substring(0, 10);

			UserService.findById(order.orderusers_id, companyid, session, connection, function (err, user) {
				if (err) return callback (setError(err), null);
				order.order_by = user;
				
				MasterService.findTransporterById(order.transporters_id, companyid, session, connection, function (err, transporter) {
					if (err) return callback (setError(err), null);
					order.transporter = transporter;

					var ejs         = require('ejs');
					var wkhtmltopdf = require('wkhtmltopdf');

					wkhtmltopdf.command = 'wkhtmltopdf';

					ejs.renderFile(process.cwd() + "/src/print_templates/order.ejs", order, {}, function(err, str){
						if (err) return callback (setError(err), null);
						
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
//						wkhtmltopdf(str, { output: 'out2.pdf', 'pageSize':pageSize,'disableSmartShrinking':true, 'dpi':dpi});
					//	wkhtmltopdf('<h1>Test</h1><p>Hello world</p>').pipe(res);

						wkhtmltopdf(str, { 'pageSize':pageSize,'disableSmartShrinking':true, 'dpi':dpi, 'footerCenter':'Powered by SimplyApp.in - Contact: 9502816370'}, function (err, stream){
							return callback (err, stream);
						});

					});
				})
	
			})
		});
	});
};

var setError = function(err, msg) {
	var err = new Err();
	err.code    = err;
	err.message = msg;
	return err;
};

/*
exports.createPackingSlipDetail = function (companyid, xPackingSlipDetail, session, connection, callback) {
	
	var	_customers_id 	= xOrder.customers_id  ,
		_companies_id	= companyid ,
		_sysstatuses_id	= 5200 ,
		_users_id		= session.user.id ,
		orderid 		= xOrder.id || 0;
		
	async.eachSeries(xOrder.lineitems, function iterator(lineitem, callback) {
		
		async.eachSeries(lineitem.packingslips, function iterator(packingslip, callback) {
		
			packingslip.id 				= packingslip.id || 0;
			var packingslipdetail_id 	= packingslip.id || 0;
			packingslip.invoices_id 	= null;
			var packing_date 			= new Date(packingslip.packing_date);
			packing_date 				=  packing_date.getFullYear() +'-' + (packing_date.getMonth()+1) + '-' + packing_date.getDate();

			var cmd = "SET @id = "+ packingslip.id +";CALL spCreatePackingslip(@err, @msg, @id, ?,?,?,?,?,?, ?,?,?,?,?,?, ?)";
		
			connection.query(cmd, [
									lineitem.orders_id,
									packingslip.orderdetails_id,
									lineitem.products_id,
									_sysstatuses_id,
									_companies_id,
									_users_id,
									packingslip.invoices_id,
									packingslip.stock_code,
									packingslip.quantity,
									packingslip.packing_slip_number,
									packing_date,
									packingslip.bale_number,
									packingslip.weight
								  ], function (err, rows) {
										if (err) return callback (err);
									
										return callback(null,rows);

									}
			);

		}, function (err) {
			console.log("inner",err);
			callback (err, null);
		
		});
				
}, function (err) {
	console.log("oiter",err);
	callback (err, null);
		
		});
	
};
*/
