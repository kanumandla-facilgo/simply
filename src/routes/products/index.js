var ProductController  = require("../../controllers/product");
var SessionController  = require("../../controllers/session");
var Util               = require("../../utils");
var Url = require('url');
var Path = require('path');
var fs = require("fs");
var JSZip = require("jszip");
var http = require('http'),
    request = require('request');
const Excel = require('exceljs');

module.exports = function attachHandlers (router) {

    router.get('/api/products', listProducts);
	router.get('/api/products/search', listProducts);
    router.get('/api/products/:id', listProducts);
    router.get('/api/products/category/:categoryid', listProducts);
    router.get('/api/products/category/:categoryid/export', listProducts);
    router.get('/api/products/:id/images', getProductImages); 
 //   router.get('/api/pricelists/', listPricelist);
 //   router.get('/api/pricelists/:id', listPricelist);

    router.get('/api/pricegroups/', listPriceGroups);
    router.get('/api/pricegroups/:id', listPriceGroups);

    // post requests
    //name=My+Product&description=Great+Product&sku=A1&unit_price=31.99&category_id=6&uom=2
    router.post('/api/products', createProduct);
    router.post('/api/pricegroups', createPriceGroup);

	router.get('/api/stock/', listStock);
	router.get('/api/stock/export', listStock);
	router.get('/api/stock/:id', listStock);
	router.get('/api/stockjournal/', listStockJournal);
	router.get('/api/stockjournal/export', listStockJournal);
	router.get('/api/stockjournal/:id', listStockJournal);
	router.get('/api/stocksummary/', listStockSummary);

	router.post('/api/stock/:id', createStock);

    // put request to update
	//name=My+Product&description=Great+Product&sku=A1&unit_price=31.99&category_id=6&uom=1    
    router.put('/api/products/:id', updateProduct); 
    router.put('/api/pricegroups/:id', updatePriceGroup);

    router.put('/api/stockjournal/:id/syncstatus/:sync_status_id', updateStockJournalSyncStatus);
	router.put('/api/stockbucket/:id', updateStockBucket);

    // put request to update
    router.put('/api/products/:id/category/:categoryid', linkProduct); 

	// delete product
    router.delete('/api/products/:id', deleteProduct);
    router.delete('/api/pricegroups/:id', deletePriceGroup); 

    // unlink category
    router.delete('/api/products/:id/category/:categoryid', unlinkProduct); 

    // unlink family
    router.delete('/api/products/:id/family/:productid', unlinkProductFamily); 

    // delete stock bucket
    router.delete('/api/stockbucket/:id', deleteStockBucket);

};

function listProducts (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;
			var customerid = req.query.customerid || null;
			var pricegroupid = req.query.pricegroupid || null;

			if (req.params.id) {
				ProductController.findById(req.params.id, companyid, response.data.session).then(response => {
						return res.json(response);
				}).catch( function(error)
				{
					return next(err);
				});
			}
			else if (req.query.code) {
				ProductController.findByCode(req.query.code, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else if (req.params.categoryid) {

				var options = {};
				options.isEnabledOnly = req.query.active_only;
				options.deepSearchFlag = req.query.deep;
				options.isStockedOnly = req.query.hide_non_stocked_items || 0;
				options.showNewProductForXDays = req.query.show_new_product_for_x_days || 0;				

				ProductController.findByCategoryId(req.params.categoryid, companyid, options, customerid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						var productsdata = response.data.productlist;
						if(req.query.format =="excel")
						{
							try
							{
								var workbook = new Excel.Workbook();
			        			var worksheet = workbook.addWorksheet('Products');						
								
								worksheet.columns = [
									{header:'Code', key:'sku', width:30},
								    {header:'Name', key:'name', width:30},
								    {header:'Price',key:'unit_price', width:15},
								    {header:'Unit',key:'uom_name',width:30},
								    {header:'HSN',key:'hsn',width:30},
								    {header:'Status',key:'status',width:30},
								    {header:'Stock',key:'stock',width:30},
								    {header:'In Process',key:'in_process',width:30}
								];

								for (var i = 0; i < productsdata.length; i++) {
									worksheet.addRow({sku: productsdata[i].sku, name: productsdata[i].name, unit_price: productsdata[i].unit_price,
															uom_name: productsdata[i].uom_name, hsn: productsdata[i].hsn.code,
															status: productsdata[i].status_id == 4600 ? "Active": "Disabled", 
															stock: ((productsdata[i].stock_uom_quote.id != productsdata[i].stock_uom_qty.id) ? productsdata[i].quantity.stock_qty + " " + 
																		productsdata[i].stock_uom_qty.name + " /" : "") + " " + productsdata[i].quantity.stock_quote + " " + productsdata[i].uom_name,
															in_process: ((productsdata[i].stock_uom_quote.id != productsdata[i].stock_uom_qty.id) ? productsdata[i].quantity.stock_in_process_qty + " " + productsdata[i].stock_uom_qty.name + " /" : "")
																			+ " " + productsdata[i].quantity.stock_in_process_quote + " " + productsdata[i].uom_name
														});
								}
								
								res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
							    res.setHeader("Content-Disposition", "attachment; filename=" + "Products.xlsx");
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
							return res.json(response);
				});
			}
			else if (req.query.config_code) {
				ProductController.findByConfigCode(req.query.config_code, companyid, 1, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else {
				var searchText;
//				if (req.query.q) searchText = "%"+ req.query.q + "%";
//				if (req.query.term) searchText = req.query.term + "%"; //Jquery auto complete plugin sends term
				if (req.query.q) searchText = req.query.q;
				if (req.query.term) searchText = req.query.term; //Jquery auto complete plugin sends term

				var options = {};

				options.isEnabledOnly = req.query.enabled_only;
				options.isStockedOnly = req.query.hide_non_stocked_items || 0;
				options.showNewProductForXDays = req.query.show_new_product_for_x_days || 0;
				options.productid = req.query.product_id;
				options.sync_status_id = req.query.sync_status_id;
				
				ProductController.findAll(companyid, searchText, options, customerid, pricegroupid, response.data.session, function(err, categories) {
					if (err)
						return next(err);
					else
						return res.json(categories);
				});
			}
		});
}

function getProductImages(req, res, next) {

		var sid = Util.readSID(req);
		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;
			if (req.params.id) {
				ProductController.findById(req.params.id, companyid, response.data.session).then(response => {
					var img_url = response.data.product.image_url3;
					var img_extn = (Path.extname(Url.parse(img_url).pathname) || "").replace(".", ""); 
					if(response.data.product.image_list.length > 0)
					{
						res.setHeader("content-disposition", "attachment; filename=product_" + response.data.product.sku + ".zip");
						res.setHeader("content-type", "application/zip");						 
						var zip = new JSZip();
						zip.file("product_"+ response.data.product.sku + "." + img_extn, request(img_url));
						for(i=0; i < response.data.product.image_list.length; i++)
						{
							var url = response.data.product.image_list[i].url_orig;
							var extn = (Path.extname(Url.parse(url).pathname) || "").replace(".", ""); 
							zip.file("product_"+ response.data.product.sku + "_" + i + "." + extn, request(url));
						}
						 
						zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
						   .pipe(res);
					}
					else
					{
						res.setHeader("content-disposition", "attachment; filename=product_" + response.data.product.sku + "." + img_extn);
						res.setHeader("content-type", "image/" + img_extn);
    					request.get(img_url).pipe(res);
    				}
				}).catch(function(error){
					console.error(error);
					return next(error);
				});
			}
		});		
}

/*
function listPricelist (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.query.productid) {
				ProductController.findPriceListByProductId(req.query.productid, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else if (req.query.categoryid) {
				ProductController.findPriceListByGroupId(req.query.categoryid, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
		});

}
*/

function listStock (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {
				ProductController.findStockBucketById(req.params.id, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}
			else {
				ProductController.findAllStockBuckets(companyid, req.query.productid, req.query.is_system, req.query.enabled_only, req.query.search_text, response.data.session, function(err, response) {
						if (err)
							return next(err);

						var stockdata = response.data.stockbucketlist;
						if(req.query.format =="excel")
						{
							try
							{
								var workbook = new Excel.Workbook();
			        			var worksheet = workbook.addWorksheet('StockBuckets');						
								
								worksheet.columns = [
								    {header:'Code', key:'code', width:10},
								    {header:'Description',key:'description', width:40},
								    {header:'Status',key:'status',width:10},
								    {header:'Stock - Qty',key:'stock_qty',width:10},
								    {header:'Stock - Quote',key:'stock_quote',width:30},
								    {header:'Detail',key:'detail',width:50}
								];
								
								for (var i = 0; i < stockdata.length; i++) {
									worksheet.addRow({code: stockdata[i].code, description: stockdata[i].description + " " + ((stockdata[i].is_system == 1) ? '(System)' : ''),
															status: stockdata[i].status_id == "4600" ? "Active" : "Disabled", 
															stock_qty: stockdata[i].stock_qty + " " + stockdata[i].uom_qty.name,
															stock_quote: stockdata[i].stock_quote + " " + stockdata[i].uom_quote.name, 
															detail: stockdata[i].stock_quote_string
														});
								}
								
								res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
							    res.setHeader("Content-Disposition", "attachment; filename=" + "StockBuckets.xlsx");
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
							return res.json(response);
				});
			}
		});

}

function listStockSummary (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;
			var options = {};

			if (req.query.productid) options.productid = req.query.productid;
			if (req.query.categoryid) options.categoryid = req.query.categoryid;
			if (req.query.pricegroupid) options.pricegroupid = req.query.pricegroupid;
			if (req.query.detailflag) options.detailflag = req.query.detailflag;
			if (req.query.excludezeroflag) options.excludezeroflag = req.query.excludezeroflag;

			if (req.query.format == "PDF") {
				ProductController.printStockSummary(companyid, options, response.data.session, function(err, stream) {
						if (err)
							return next(err);
							
						res.setHeader('content-type', 'application/pdf');
						return stream.pipe(res);
				});
			}
			else {
				ProductController.findStockSummary(companyid, options, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});
			}

		});

}

function listStockJournal (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		if (req.params.id || req.query.productid || req.query.sync_status_id) {

			ProductController.findStockJournal(companyid, req.params.id, req.query.productid, req.query.sync_status_id, req.query.from, req.query.to, req.query.datetype, req.query.currentpage, req.query.recordsperpage, response.data.session, function(err, response) {
					if (err)
						return next(err);

					var stock_journal = response.data.stockjournal.stockjournallist;
					var balance = response.data.stockjournal.balance;
					
					if(req.query.format =="excel")
					{
						try
						{
							var workbook = new Excel.Workbook();
		        			var worksheet = workbook.addWorksheet('StockJournal');						
							
							worksheet.columns = [
								{header:'Date', key:'date', width:15},
							    {header:'Code', key:'code', width:10},
							    {header:'Description',key:'description', width:40},
							    {header:'Order#',key:'order_number',width:10},							    
							    {header:'Slip#',key:'slip',width:10},
							    {header:'Invoice#',key:'lr',width:10},
							    {header:'Qty-Quote',key:'qty_quote',width:30},
							    {header:'Qty-Entered',key:'qty_entered',width:30},
							    {header:'User',key:'user',width:30}
							];

							if(response.data.stockjournal)
							{
								worksheet.addRow({date: "Closing Balance", code: "", description: "",
												order_number: "", slip: "",  lr: "",
												qty_quote: balance.closing.uom_quote.stock_quote + " " + balance.closing.uom_quote.name,
												qty_entered: balance.closing.uom_qty.stock_qty + " " + balance.closing.uom_qty.name,
												user: ""
											});
								
								for (var i = 0; i < stock_journal.length; i++) {
									let description = (stock_journal[i].order_id == null) ? stock_journal[i].description : stock_journal[i].order_number;
									worksheet.addRow({date: stock_journal[i].transaction_date, code: stock_journal[i].stock_bucket_code, description: description,
															order_number: stock_journal[i].order_number, slip: stock_journal[i].packing_slip_number,  lr: stock_journal[i].invoice_number,
															qty_quote: stock_journal[i].stock_quote + " " + stock_journal[i].uom_quote.name, 
															qty_entered: stock_journal[i].stock_qty + " " + stock_journal[i].uom_qty.name,
															user: stock_journal[i].user.first_name + " " + stock_journal[i].user.last_name
														});
								}
								
								worksheet.addRow({date: "Opening Balance", code: "", description: "",
												order_number: "", slip: "",  lr: "",
												qty_quote: balance.opening.uom_quote.stock_quote + " " + balance.opening.uom_quote.name,
												qty_entered: balance.opening.uom_qty.stock_qty + " " + balance.opening.uom_qty.name,
												user: ""
											});
							}
							res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
						    res.setHeader("Content-Disposition", "attachment; filename=" + "StockJournal.xlsx");
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
						return res.json(response);
			});
		}
		else {
			return (Util.setErrorResponse(-501, "Please provide ID or Product ID."));
		}
	});

}

function exportStockJournal (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		if (req.params.id || req.query.productid) {

			ProductController.findStockJournal(companyid, req.params.id, req.query.productid, req.query.from, req.query.to, req.query.datetype, req.query.currentpage, req.query.recordsperpage, response.data.session, function(err, stock_journal) {
					if (err)
						return next(err);
					{
						var stock_journal = stock_journal.data.stockjournallist;
						if(req.query.format =="excel")
						{
							try
							{
								var workbook = new Excel.Workbook();
			        			var worksheet = workbook.addWorksheet('StockJournal');						
								
								worksheet.columns = [
									{header:'Date', key:'date', width:15},
								    {header:'Code', key:'code', width:10},
								    {header:'Description',key:'description', width:40},
								    {header:'OTN',key:'otn',width:10},
								    {header:'Slip#',key:'slip',width:10},
								    {header:'Qty-Quote',key:'qty_quote',width:30},
								    {header:'Qty-Entered',key:'qty_entered',width:30},
								    {header:'User',key:'user',width:30}
								];

								for (var i = 0; i < stock_journal.length; i++) {
									worksheet.addRow({date: stock_journal[i].transaction_date, code: stock_journal[i].stock_bucket_code, description: stock_journal[i].description,
															otn: stock_journal[i].order_id, slip: stock_journal[i].packing_slip_number,
															qty_quote: stock_journal[i].stock_quote + " " + stock_journal[i].uom_quote.name, 
															qty_entered: stock_journal[i].stock_qty + " " + stock_journal[i].uom_qty.name,
															user: stock_journal[i].user.first_name + " " + stock_journal[i].user.last_name
														});
								}
								
								res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
							    res.setHeader("Content-Disposition", "attachment; filename=" + "StockJournal.xlsx");
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
					}
			});
		}
		else {
			return (Util.setErrorResponse(-501, "Please provide ID or Product ID."));
		}
	});

}

function listPriceGroups (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		if (req.params.id) {
			ProductController.findPriceGroupById(req.params.id, companyid, response.data.session, function(err, response) {
					if (err)
						return next(err);

					return res.json(response);
			});
		}
		else {
			ProductController.findAllPriceGroups(companyid, req.query.sort_by, req.query.sort_direction, response.data.session, function(err, response) {
					if (err)
						return next(err);

					return res.json(response);
			});
		}
	});

}

function createProduct (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		ProductController.create(
			companyid,
			req.body.product,
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
/*
		ProductController.create(
			companyid,
        	req.body.name, 
			req.body.sku,
			req.body.sku_internal, 
			req.body.description, 
			req.body.unit_price,
			req.body.category_id,
			req.body.stock,
			req.body.onorder,
			req.body.reorder,
			req.body.packageqty,
			req.body.uom,
			req.body.is_hidden,
			req.body.width,
			req.body.length,
			req.body.height,
			req.body.weight,
			req.body.is_family_head,
			req.body.color,
			req.body.image_url1, 
			req.body.image_url2, 
			req.body.image_url3, 
			req.body.image_url4, 
			req.body.image_url5, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
       */ 
    });

}

function createStock (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		ProductController.createStock(
			companyid,
			req.body.stockjournal,
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
/*
		ProductController.create(
			companyid,
        	req.body.name, 
			req.body.sku,
			req.body.sku_internal, 
			req.body.description, 
			req.body.unit_price,
			req.body.category_id,
			req.body.stock,
			req.body.onorder,
			req.body.reorder,
			req.body.packageqty,
			req.body.uom,
			req.body.is_hidden,
			req.body.width,
			req.body.length,
			req.body.height,
			req.body.weight,
			req.body.is_family_head,
			req.body.color,
			req.body.image_url1, 
			req.body.image_url2, 
			req.body.image_url3, 
			req.body.image_url4, 
			req.body.image_url5, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
       */ 
    });

}

function updateStockJournalSyncStatus (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		ProductController.updateStockJournalSyncStatus(
			companyid,
			req.params.id,
			req.params.sync_status_id,
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

    });

}

function updateStockBucket (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		ProductController.updateStockBucket(
			companyid,
			req.params.id,
			req.body.stockjournal,
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

    });

}

function deleteStockBucket (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		ProductController.deleteStockBucket(
			companyid,
			req.params.id,
			req.body.stockjournal,
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

    });

}

function createPriceGroup (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		ProductController.createPriceGroup(
			companyid,
			req.body.pricegroup,
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

    });

}

function updatePriceGroup (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		ProductController.updatePriceGroup(
			companyid,
			req.body.pricegroup,
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

    });

}

function updateProduct (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;
/*
		ProductController.update(
			companyid, 
			req.params.id,
        	req.body.name, 
			req.body.sku,
			req.body.sku_internal, 
			req.body.description, 
			req.body.unit_price,
			req.body.stock,
			req.body.onorder,
			req.body.reorder,
			req.body.packageqty,
			req.body.uom,
			req.body.pricelevelid,
			req.body.pricegroup,
			req.body.is_hidden,
			req.body.status_id,
			req.body.width,
			req.body.length,
			req.body.height,
			req.body.weight,
			req.body.linkedwith, 
			req.body.color,
			req.body.image_url1, 
			req.body.image_url2, 
			req.body.image_url3, 
			req.body.image_url4, 
			req.body.image_url5,
			req.body.is_batched_inventory,
			req.body.is_taxable,
			req.body.taxslabid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
*/

		ProductController.update(
			companyid,
			req.body.product,
			req.body.product.linkwith, 
			response.data.session, 
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

    });

}


function deletePriceGroup (req, res, next) {

	// if leaf, check products available below.
	// if non leaf, check if categories are available below.
	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		ProductController.deletePriceGroupById(req.params.id, response.data.session.company_id, response.data.session, function(err, response) {
			if (err)
				res.send(err);
			else
				res.json(response);
		});

	});
}

function deleteProduct (req, res, next) {

	// if leaf, check products available below.
	// if non leaf, check if categories are available below.
	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		ProductController.deleteById(req.params.id, response.data.session.company_id, response.data.session, function(err, response) {
			if (err)
				res.send(err);
			else
				res.json(response);
		});

	});
}

function unlinkProduct (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		ProductController.delinkCategory(req.params.id, response.data.session.company_id, req.params.categoryid, response.data.session, function(err, response) {
			if (err)
				res.send(err);
			else
				res.json(response);
			});

	});
}

function unlinkProductFamily (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		ProductController.delinkProductFamily(req.params.id, response.data.session.company_id, req.params.productid, response.data.session, function(err, response) {
			if (err)
				res.send(err);
			else
				res.json(response);
			});

	});
}

function linkProduct (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		ProductController.linkCategory(req.params.id, response.data.session.company_id, req.params.categoryid, response.data.session, function(err, response) {
			if (err)
				res.send(err);
			else
				res.json(response);
			});

	});
}

/*
function listCompanies (req, res, next) {

        if (req.params.company_id) {
			Company.findOne({code:req.params.company_id}, function(err, company) {
            		if (err)
                		res.send(err);

            		return res.json(company);
         	});
		}

        Company.find(function(err, companies) {
            if (err)
                res.send(err);

            return res.json(companies);
        });

}

function updateCompany(req, res, next) {

        // use our company model to find the company we want
//      Company.findById(req.params.company_id, function(err, company) {
        Company.findOne({code:req.params.company_id}, function(err, company) {

            if (err)
                res.send(err);

            company.name = req.body.name;  // update the companys info

            // save the company
            company.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Company updated!' });
            });

        });
}
*/

/*
function deleteCompany (req, res, next) {

		Company.remove({
				code: req.params.company_id
			}, function(err, company) {
				if (err)
					res.send(err);

				res.json({ message: 'Successfully deleted' });
    	});
}
*/

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/api', router);

