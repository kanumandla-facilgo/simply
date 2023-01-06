var OrderController  = require("../../controllers/order");
var ProductController  = require("../../controllers/product");
var SessionController  = require("../../controllers/session");
var UserController  = require("../../controllers/user");
var MasterController  = require("../../controllers/master");
var Util               = require("../../utils");
const config             = require("../../config/config");
var Url = require('url');
var Path = require('path');
var fs = require("fs");
var JSZip = require("jszip");
var http = require('http');
var request = require('request');	
var async           = require("async");					 
var Excel = require('exceljs');
let moment = require("moment-timezone");

module.exports = function attachHandlers (router) {

    router.get('/api/orders', listOrders);
    router.get('/api/orders/export', listOrders);
    router.get('/api/orders/:id', listOrders);
	router.get('/api/orders/:orderid/packingslips', listPackingslip);
	router.get('/api/orders/:id/productimages', listProductImages);
	router.get('/api/packingslips/export', listPackingslip);
	router.get('/api/packingslips/:id', listPackingslip);
	router.get('/api/packingslips/', listPackingslip);
	router.get('/api/deliverynotes/export', listDeliveryNotes);
	router.get('/api/deliverynotes/:id', listDeliveryNotes);
	router.get('/api/deliverynotes/', listDeliveryNotes);
	router.get('/api/gatepass/:id', listGatePass);
	
	router.post('/api/deliverynotes/ewaybills', getEwayBills);
	router.post('/api/gatepass', createGatePass);
	router.post('/api/gatepass/:id/cancel', cancelGatePass);

	router.post('/api/orders/:id/packingslips', createPackingSlip);
	router.post('/api/orders/:id/:action', actionize);
	router.post('/api/packingslips/:id/cancel', cancelPackingSlip);
	router.post('/api/deliverynotes', createDeliveryNote);
	router.post('/api/deliverynotes/:id/:action', actionizeDeliveryNote);
    router.post('/api/orders', createOrder);

	router.put('/api/deliverynotes', updateDeliveryNote);
	router.put('/api/gatepass/:id', updateGatePass);
};

function actionize(req, res, next){
	var sid = Util.readSID(req);
	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;
		var orderid 	= req.params.id;
		var user_role_id = response.data.session.user.role_id;
		var action 		= req.params.action;
		//session.user.sys_role_id

		var approval_callback = function(err, approval ){
				if (err)
					return next(err);
				return res.json(approval);
			};

		if(action == "approve")
			OrderController.updateStatus(companyid, orderid, response.data.session.user.id, 5101, "Approval UI", approval_callback);
		if(action == "reject")
			OrderController.updateStatus(companyid, orderid, response.data.session.user.id, 5103, "Reject from UI", approval_callback);
		if(action == "endorse")
			OrderController.updateStatus(companyid, orderid, response.data.session.user.id, 5102, "Endorse from UI", approval_callback);
		if(action == "prepare")
			OrderController.prepare(companyid, orderid, response.data.session.user.id, 5102, "Prepare from UI", approval_callback);
		if(action == "delivered")
			OrderController.updateStatus(companyid, orderid, response.data.session.user.id, 4202,"Delivered from UI", approval_callback);
		if(action == "cancel")
			OrderController.cancelOrder(companyid, orderid, response.data.session, approval_callback);

	});
}

function getEwayBills(req, res, next) {

	var sid = Util.readSID(req);
	SessionController.validate(sid, function (err, response) {
		if (err)
			return next(err);

		var companyid = response.data.session.company_id;

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var ids = (req.body ? req.body.toString().split(',') : []);
		var einvoice_info_header = []
		var einvoice_infos_list = []

		async.eachSeries(ids, function iterator(id, callback) {
			OrderController.findDeliveryNoteById(id, companyid, response.data.session, function(err, resDeliveryNote) {
				if (err)
					return next(err);

				var deliverynote = resDeliveryNote.data.deliverynote;
				deliverynote.einvoice_info = (deliverynote.einvoice_info ? deliverynote.einvoice_info : {});
				var gst_number = deliverynote.customer.company.configuration.filter(x=>x.name == "tax_gst_number")[0].value;
				var einvoice_info = {};
				einvoice_info.Version = config.einvoice_info_version;
				einvoice_info.TranDtls = {};
				einvoice_info.TranDtls.TaxSch = "GST";
				einvoice_info.TranDtls.SupTyp = "B2B";

				einvoice_info.DocDtls = {};
				einvoice_info.DocDtls.Typ = "INV";
				einvoice_info.DocDtls.No = deliverynote.invoice_number;
				einvoice_info.DocDtls.Dt = moment(deliverynote.note_date).format("DD/MM/YYYY");

				einvoice_info.SellerDtls = {};
				einvoice_info.SellerDtls.Gstin = gst_number;
				einvoice_info.SellerDtls.LglNm = deliverynote.customer.company.name;
				einvoice_info.SellerDtls.Addr1 = deliverynote.customer.company.ship_address.address1;
				einvoice_info.SellerDtls.Loc = deliverynote.customer.company.ship_address.city;
				einvoice_info.SellerDtls.Pin = parseInt(deliverynote.customer.company.ship_address.zip);
				einvoice_info.SellerDtls.Stcd = gst_number.substring(0,2);

				einvoice_info.BuyerDtls = {};
				einvoice_info.BuyerDtls.Gstin = deliverynote.customer.gst_number;
				einvoice_info.BuyerDtls.LglNm = deliverynote.customer.name;
				einvoice_info.BuyerDtls.Addr1 = deliverynote.ship_address.address1;
				einvoice_info.BuyerDtls.Loc = deliverynote.ship_address.city;
				einvoice_info.BuyerDtls.Pin = parseInt(deliverynote.ship_address.zip);
				einvoice_info.BuyerDtls.Stcd = deliverynote.customer.gst_number.substring(0,2);
				einvoice_info.BuyerDtls.Pos = deliverynote.customer.gst_number.substring(0,2);;
				
				einvoice_info.DispDtls = null;
				einvoice_info.ShipDtls = null;

				einvoice_info.ValDtls = {};
				einvoice_info.ValDtls.AssVal = Math.round(deliverynote.sub_total - deliverynote.discount_total + deliverynote.rounding_total, 2);
				einvoice_info.ValDtls.TotInvVal = Math.round(deliverynote.sub_total + deliverynote.tax_total + deliverynote.ship_total - deliverynote.discount_total + deliverynote.rounding_total, 2);
				einvoice_info.ValDtls.CgstVal = deliverynote.tax_total_cgst;
				einvoice_info.ValDtls.SgstVal = deliverynote.tax_total_sgst;
				einvoice_info.ValDtls.IgstVal = deliverynote.tax_total_igst;

				einvoice_info.ExpDtls = null;

				einvoice_info.EwbDtls ={};
				einvoice_info.EwbDtls.Distance = deliverynote.destination_distance;
				if(deliverynote.einvoice_info.is_generate === 0){
				einvoice_info.EwbDtls.TransId = (einvoice_info.transporterName == 'LOCAL') ? "" : deliverynote.transporter.external_code;
				einvoice_info.EwbDtls.TransName = (einvoice_info.transporterName == 'LOCAL') ? "" : deliverynote.transporter.name;
				einvoice_info.EwbDtls.TransMode =  deliverynote.einvoice_info.transport_mode;
				einvoice_info.EwbDtls.TransDocNo = deliverynote.lr_number ? deliverynote.lr_number : "0";
				einvoice_info.EwbDtls.TransDocDt = deliverynote.lr_date ? moment(deliverynote.lr_date).format("DD/MM/YYYY") : moment(deliverynote.note_date).format("DD/MM/YYYY");
				einvoice_info.EwbDtls.VehNo = deliverynote.einvoice_info.vehicle_number;
				einvoice_info.EwbDtls.VehType = deliverynote.einvoice_info.vehicle_type;
				}
				
				einvoice_info.PayDtls = null;
				einvoice_info.RefDtls = null;
				einvoice_info.AddlDocDtls = null;

				einvoice_info.ItemList = [];
				einvoice_info_header.push(einvoice_info);
				
				var CgstTot = 0;
				var SgstTot = 0;
				var IgstTot = 0;
				var productItemHash = {};
				var i = 1;
				async.eachSeries(deliverynote.packingsliplist, function iterator(p, pscb) {					
					async.eachSeries(p.lineitems, function iterator(lineitem, licb) {
						console.log(lineitem.name);
						var item  = {};
						item.SlNo = '' + i;

						if(!productItemHash[lineitem.name])
						{
							productItemHash[lineitem.name]	= item;
							item.productName = lineitem.name;
							item.IsServc = "N";
							item.productDesc = lineitem.order_detail.hsn.description;
							item.HsnCd = lineitem.order_detail.hsn.code;
							if(lineitem.uom_short_name == lineitem.entered_uom_short_name) {
								item.Qty = parseFloat(lineitem.packed_qty_qty);
								item.Unit = lineitem.entered_uom_short_name;
							}
							else {
								item.Qty = parseFloat(lineitem.packed_qty_quote);
								item.Unit = lineitem.uom_short_name;
							}
							item.AssAmt = Math.round(parseFloat(lineitem.sub_total)  - parseFloat(lineitem.discount_total), 2);
							if(deliverynote.tax_total_igst > 0) {
								item.IgstAmt = lineitem.order_detail.hsn.percent_igst/100;
								item.IgstAmt = parseFloat((item.IgstAmt * item.AssAmt).toFixed(1));
								IgstTot = IgstTot + item.IgstAmt;
								item.SgstAmt = 0;
								item.CgstAmt = 0;
							}
							else {
								item.SgstAmt = lineitem.order_detail.hsn.percent_sgst/100;
								item.SgstAmt = parseFloat((item.SgstAmt * item.AssAmt).toFixed(1));
								
								SgstTot = SgstTot + item.SgstAmt; 
								item.CgstAmt = lineitem.order_detail.hsn.percent_cgst/100;	
								item.CgstAmt = parseFloat((item.CgstAmt * item.AssAmt).toFixed(1));
								
								CgstTot = CgstTot + item.CgstAmt;
								item.IgstAmt = 0;
							}
							item.CessNonAdvol = 0;
							item.CessRate = 0;
							item.UnitPrice = Math.round(item.AssAmt/item.Qty,3);
							item.Discount = 0;

							item.TotAmt = Math.round(parseFloat(lineitem.sub_total)  - parseFloat(lineitem.discount_total), 2);
							item.TotItemVal = item.TotAmt + lineitem.tax_total;
							item.GstRt = 5;
							item.BchDtls = null;
							item.AttribDtls = null;
							lineitem.price
							einvoice_info.ItemList.push(item);
							i += 1;
							return licb(null);
						}
						else {
							item = productItemHash[lineitem.name];
							if(lineitem.uom_short_name == lineitem.entered_uom_short_name) 
								item.quantity = parseFloat(item.quantity) + parseFloat(lineitem.packed_qty_qty);
							else 
								item.quantity = parseFloat(item.quantity) + parseFloat(lineitem.packed_qty_quote);
							item.taxableAmount = item.taxableAmount + Math.round(parseFloat(lineitem.sub_total) - parseFloat(lineitem.discount_total), 2);
							//ewa_bill.ItemList.filter(x=>x.productName == lineitem.name)
							return licb(null);
						}	
					}, function(error) {
						return pscb(null);
					});					
				}, function(err) {		
					return callback(err);						
				});	
			});
		}, function(err) {
			res.setHeader('Content-Type', 'application/json');
			if(ids.length > 1)
				res.setHeader("Content-Disposition", "attachment; filename=" + moment().format("DDMMYYYY_") + "einvoice_info.json");
			else
				res.setHeader("Content-Disposition", "attachment; filename=" + ids[0] + ".json");
			return res.end(JSON.stringify(einvoice_info_header));
		});
	});
}

function listProductImages (req, res, next) {

		var sid = Util.readSID(req);
		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);

			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {
				OrderController.getProductsByOrderID(req.params.id, companyid, response.data.session, function(err, products) {
					if (err)
						return next(err);
					else
					{
						var zip = new JSZip();
						var isNoImage = true;

						products.forEach(product => {
							var head_url = product.image_url3;
							if(head_url != '')
							{
								isNoImage = false;
								var head_extn = Path.extname(Url.parse(head_url).pathname); 
								zip.file("product_" + product.sku + head_extn, request(head_url));						 
							}
							
							/*for(i=0; i < product.data.product.image_list.length; i++)
							{
								var url = product.data.product.image_list[i].url_orig;
								var extn = Path.extname(Url.parse(url).pathname); 
								zip.file("product_" + product.data.product.sku + "_" + i + extn, request(url));
							}*/
						});	
						if(!isNoImage)
						{	
							res.setHeader("content-disposition", "attachment; filename=order_" + req.params.id + "_images.zip");
							res.setHeader("content-type", "attachment; application/zip");
							zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
							   .pipe(res);		
						}
						else{
							return res.json(Util.setErrorResponse("-1", "No Product images found for this order."));
						}				
																		
					}
				});
			}
		});
}

function listOrders (req, res, next) {

		if((req.query.customer_code != null) ||(req.query.customer_code != undefined)){
			let customer_code = req.query.customer_code;
			let session = Util.getGlobalSession();
			OrderController.findById(req.params.id, 1, session.company_id, session, function(err, order) {
				
				if (err)
					return next(err);
				else{
					if(order.data.order.customer.address.phone1 == customer_code)
						return res.json(order)
					else
						return next(Util.setErrorResponse(-100, "Order not found."));
				}
			});
		}
		else {
			var sid = Util.readSID(req);

			SessionController.validate(sid, function (err, response) {

				if (err)
					return next(err);

				if (!(response.statuscode === 0 && response.data.session.company_id))
					return res.json(response);

				var companyid = response.data.session.company_id;

				if (req.params.id) {
					if (req.query.format == "PDF") {
						OrderController.printOrder(req.params.id, companyid, response.data.session, function(err, stream) {
								if (err)
									return next(err);
									
								res.setHeader('content-type', 'application/pdf');
								return stream.pipe(res);
						});
					}
					else {
						OrderController.findById(req.params.id, req.query.detail, companyid, response.data.session, function(err, order) {
								if (err)
									return next(err);
								return res.json(order);
						});
					}
				}
				else if((req.query.custom_filter_id != null) ||(req.query.custom_filter_id != undefined)) {

					MasterController.findCustomFilterByID(req.query.custom_filter_id, req.query.from_page, companyid, response.data.session, function(err, customFilter) {
						if(customFilter.statuscode == 0)
						{
							OrderController.findAll(companyid, JSON.parse(customFilter.data.customfilter.filters), req.query.currentpage, req.query.records_per_page, response.data.session, function(err, orders) {
								if (err)
									return next(err);
								var ordersdata = orders.data.orderlist;
								return res.json(orders);
							});
						}
						else
							res.json(customFilter);
					});
				}
				else {

					var options = {};
					options.agentid          = req.query.agentid;
					options.customerid       = req.query.customerid;
					options.statusid         = req.query.statusid;
					options.deliverystatusid = req.query.deliverystatusid;
					options.fromdate         = req.query.fromdate;
					options.todate           = req.query.todate;
					options.order_number     = req.query.order_number;
					options.productid        = req.query.productid;
					options.my_approval_only = req.query.my_approval_only;
					// options.sortby			 = "status";
					// options.sortorder		 = -1;
					options["sortby"]		= req.query.sort_by;
					options["sortorder"]	= req.query.sort_direction;

					OrderController.findAll(companyid, options, req.query.currentpage, req.query.records_per_page, response.data.session, function(err, orders) {
						if (err)
							return next(err);

						var ordersdata = orders.data.orderlist;
						if(req.query.format =="excel")
						{
							try
							{
								var workbook = new Excel.Workbook();
			        			var worksheet = workbook.addWorksheet('Orders');						
								
								worksheet.columns = [
									{header:'ID', key:'id', width:30},
								    {header:'Customer', key:'customer', width:30},
								    {header:'Status',key:'status', width:15},
								    {header:'Approver Type',key:'approver_type',width:30},
								    {header:'Delivery Status',key:'delivery_status',width:30},
								    {header:'Creator', key:'creator', width:30},
								    {header:'Created', key:'created', width:30},
								    {header:'Total', key:'total', width:30}
								];

								for (var i = 0; i < ordersdata.length; i++) {

									worksheet.addRow({ id: ordersdata[i].order_number, customer: ordersdata[i].customer_name, status: ordersdata[i].status_name,
															approver_type: ordersdata[i].pending_approval_rolename, delivery_status:ordersdata[i].delivery_status_name,
															creator: ordersdata[i].creator, created: ordersdata[i].created, 
															total: ordersdata[i].sub_total + ordersdata[i].ship_total + ordersdata[i].tax_total - ordersdata[i].discount_total
													});
								}

								res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
							    res.setHeader("Content-Disposition", "attachment; filename=" + "Orders.xlsx");
							    workbook.xlsx.write(res)
							        .then(function (data) {
							            res.end();
							        });
							}
							catch(err) {
							  console.error(err)
							}

						}
						else if(req.query.format == "pdf")
						{

						}
						else
							return res.json(orders);
					});
				}
			});
		}
}


function listPackingslip (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.orderid) {
				OrderController.findPackingslipsByOrderid(req.params.id, companyid, response.data.session, function(err, packingsliplist) {
						if (err)
							return next(err);
						return res.json(packingsliplist);
				});
			}
			else if (req.params.id) {
				if (req.query.format == "PDF") {
					OrderController.printPackingSlip(req.params.id, companyid, response.data.session, function(err, stream) {
							if (err)
								return next(err);
								
							res.setHeader('content-type', 'application/pdf');
							return stream.pipe(res);
					});
				}
				else if (req.query.detail == 1) {
					OrderController.getPackingSlipDetail(req.params.id, companyid, response.data.session, function(err, packingslip) {
							if (err)
								return next(err);
							return res.json(packingslip);
					});
				}
				else {
					OrderController.findPackingslipById(req.params.id, companyid, response.data.session, function(err, packingslip) {
							if (err)
								return next(err);
							return res.json(packingslip);
					});
				}
			}
			else {

				var options = {};
				options.agentid     = req.query.agentid;
				options.customerid  = req.query.customerid;
				options.statusid    = req.query.statusid;
				options.fromdate    = req.query.fromdate;
				options.todate      = req.query.todate;
				options.pagenumber  = req.query.currentpage;
				options.pagesize    = req.query.records_per_page;
				options.slip_number = req.query.slip_number;
				options.gate_pass_number = req.query.gate_pass_number;
				options.productid   = req.query.productid;
				
				//options.sortby      = "cname";
				//options.sortorder   = 1;
				options["sortby"]		= req.query.sort_by;
				options["sortorder"]	= req.query.sort_direction;

				OrderController.findAllPackingslips(companyid, options, response.data.session, function(err, packingsliplist) {
						if (err)
							return next(err);

						var packingslipsdata = packingsliplist.data.packingsliplist;
						if(req.query.format =="excel")
						{
							try
							{
								var workbook = new Excel.Workbook();
			        			var worksheet = workbook.addWorksheet('PackingSlips');						
								
								worksheet.columns = [
									{header:'ID', key:'id', width:30},
								    {header:'Date', key:'date', width:30},
								    {header:'Order#',key:'order_no', width:15},
								    {header:'Note#',key:'note',width:30},
								    {header:'Customer',key:'customer',width:30},
								    {header:'Status', key:'status', width:30},
								    {header:'Creator', key:'creator', width:30}
								];

								for (var i = 0; i < packingslipsdata.length; i++) {

									worksheet.addRow({ id: packingslipsdata[i].slip_number, date: packingslipsdata[i].packing_date, order_no: packingslipsdata[i].order.order_number,
															note: packingslipsdata[i].note_number, customer:packingslipsdata[i].customer_name,
															status: packingslipsdata[i].status_name, creator: packingslipsdata[i].user_name
													});
								}

								res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
							    res.setHeader("Content-Disposition", "attachment; filename=" + "PackingSlips.xlsx");
							    workbook.xlsx.write(res)
							        .then(function (data) {
							            res.end();
							        });
							}
							catch(err) {
							  console.error(err)
							}

						}
						else if(req.query.format == "pdf")
						{

						}
						else
							return res.json(packingsliplist);
				});
			}
		});
}


function listDeliveryNotes (req, res, next) {

		var sid = Util.readSID(req);
		if((sid==null) || (sid == ''))
		{
			sid = req.query.app_sid;
		}
		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {
				if (req.query.format == "PDF") {
					OrderController.printDeliveryNote(req.params.id, companyid, (isNaN(req.query.offset_lines) ? 0 : parseInt(req.query.offset_lines)), (isNaN(req.query.show_totals) ? 0 : parseInt(req.query.show_totals)), 
															response.data.session, function(err, stream) {
							if (err)
								return next(err);
								
							res.setHeader('content-type', 'application/pdf');
							return stream.pipe(res);
					});
				}
				else if(req.query.header == 1){
					OrderController.getDetailDeliveryNote(req.params.id, companyid, response.data.session, function(err, html) {
							if (err)
								return next(err);
							res.setHeader('content-type', 'text/html');
							return res.send(html);
					
					});
				}
				else {
					OrderController.findDeliveryNoteById(req.params.id, companyid, response.data.session, function(err, deliverynote) {
							if (err)
								return next(err);
							return res.json(deliverynote);
					});
				}
			}
			else {

				var options = {};
				options.agentid     = req.query.agentid;
				options.customerid  = req.query.customerid;
				options.statusid    = req.query.statusid;
				options.fromdate    = req.query.fromdate;
				options.todate      = req.query.todate;
				options.pagenumber  = req.query.currentpage;
				options.pagesize    = req.query.records_per_page;
				options.note_number = req.query.note_number;
				options.lr_number   = req.query.lr_number;
				options.gate_pass_number   = req.query.gate_pass_number;
				options.invoice_number = req.query.invoice_number;
				options.productid   = req.query.productid;
				options.sync_status_id   = req.query.sync_status_id;
				
				//options.sortby			 = "tname";
				//options.sortorder		 = -1;
				options["sortby"]		= req.query.sort_by;
				options["sortorder"]	= req.query.sort_direction;

				OrderController.findAllDeliveryNotes(companyid, options, response.data.session, function(err, deliverynotelist) {
						if (err)
							return next(err);
						var deliverynotesdata = deliverynotelist.data.deliverynotelist;
						if(req.query.format =="excel")
						{
							try
							{
								var workbook = new Excel.Workbook();
			        			var worksheet = workbook.addWorksheet('DeliveryNotes');						
								
								worksheet.columns = [
									{header:'Note#', key:'note_number', width:10},
								    {header:'Date', key:'date', width:10},
								    {header:'Customer',key:'customer', width:35},
								    {header:'Status',key:'status',width:15},
								    {header:'Transporter',key:'transporter',width:35},
								    {header:'LR Number', key:'lr_number', width:20},
								    {header:'Invoice Number', key:'invoice_number', width:15},
								    {header:'Creator', key:'creator', width:30},
								    {header:'Total', key:'total', width:10}
								];

								for (var i = 0; i < deliverynotesdata.length; i++) {

									worksheet.addRow({ note_number: deliverynotesdata[i].note_number, date: deliverynotesdata[i].note_date, 
															customer: deliverynotesdata[i].customer.name,
															status: deliverynotesdata[i].status_name,
															transporter: deliverynotesdata[i].transporter.name,
															lr_number: deliverynotesdata[i].lr_number, invoice_number: deliverynotesdata[i].invoice_number, 
															creator: deliverynotesdata[i].user.first_name + ' ' + deliverynotesdata[i].user.last_name,
															total: Util.round(deliverynotesdata[i].sub_total + deliverynotesdata[i].ship_total + deliverynotesdata[i].tax_total - deliverynotesdata[i].discount_total, 0)
													});
								}

								res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
							    res.setHeader("Content-Disposition", "attachment; filename=" + "DeliveryNotes.xlsx");
							    workbook.xlsx.write(res)
							        .then(function (data) {
							            res.end();
							        });
							}
							catch(err) {
							  console.error(err)
							}

						}
						else if(req.query.format == "pdf")
						{

						}
						else
							return res.json(deliverynotelist);
				});
			}
		});
}

function listGatePass (req, res, next) {

		var sid = Util.readSID(req);
		if((sid==null) || (sid == ''))
		{
			sid = req.query.app_sid;
		}
		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {

				if (req.query.format == "PDF") {
					OrderController.printGatePass(req.params.id, companyid, response.data.session, function(err, stream) {
							if (err)
								return next(err);
								
							res.setHeader('content-type', 'application/pdf');
							return stream.pipe(res);
					});
				}
				else
				{

					OrderController.findGatePassByID(req.params.id, companyid, response.data.session, function(err, gatepass) {
							if (err)
								return next(err);
							return res.json(gatepass);
					});
				}
			}
			
		});
}



function createOrder(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		var companyid = response.data.session.company_id;
		OrderController.create(companyid,
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

function createPackingSlip(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var companyid = response.data.session.company_id;

		OrderController.createPackingSlip(
			companyid,
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

function createGatePass(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var companyid = response.data.session.company_id;

		OrderController.createGatePass(
			companyid,
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

function cancelPackingSlip(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var companyid = response.data.session.company_id;

		OrderController.cancelPackingSlip(
			companyid,
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

function actionizeDeliveryNote(req, res, next) {

	var sid = Util.readSID(req);

	var action = req.params.action;
	var id = req.params.id;

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var companyid = response.data.session.company_id;
		
		if (action == "cancel") {
			OrderController.cancelDeliveryNote(
				companyid,
				id,
				response.data.session, 
				function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
			});
		}
		else {
			OrderController.completeDeliveryNote(
				companyid,
				id,
				response.data.session, 
				function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
			});
		}

    });

}


function cancelGatePass(req, res, next) {

	var sid = Util.readSID(req);

	var action = req.params.action;
	var id = req.params.id;

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var companyid = response.data.session.company_id;
		
		OrderController.cancelGatePass(
				companyid,
				id,				
				null,
				response.data.session, 
				function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
			});

    });

}

function createDeliveryNote(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		var companyid = response.data.session.company_id;
	
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var companyid = response.data.session.company_id;

		if(req.body.direct_invoice_flag == 1) {
			OrderController.createDirectInvoice(
				companyid,
				req.body,
				response.data.session, 
				function(err, response) {
					if (err)
						return next((Util.setErrorResponse(-100, err)));
					else
						return res.json(response);
	        });
		}
		else {
			OrderController.createDeliveryNote(
				companyid,
				req.body,
				response.data.session, 
				function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
	        });
		}
    });

}

function updateDeliveryNote(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		if(req.body.direct_invoice_flag == 1) {
			OrderController.updateDirectInvoice(
				companyid,
				req.body,
				response.data.session, 
				function(err, response) {
					if (err)
						return next((Util.setErrorResponse(-100, err)));
					else
						return res.json(response);
	        });
		}
		else {
			OrderController.updateDeliveryNote(
				companyid,
				req.body,
				response.data.session, 
				function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
	        });
		}

    });

}

function updateGatePass(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		OrderController.updateGatePass(
			companyid,
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

