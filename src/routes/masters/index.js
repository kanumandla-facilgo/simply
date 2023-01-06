var MasterController   = require("../../controllers/master");
var ProductController   = require("../../controllers/product");
var SessionController  = require("../../controllers/session");
var Util               = require("../../utils");
var Transporter        = require("../../bo/transporter");
const ExcelReader        = require("../../utils/ExcelReader");
const formidable         = require("formidable");
const config             = require("../../config/config");
const fs = require('fs')
const Excel = require('exceljs');

module.exports = function attachHandlers (router) {

    // get requests
    router.get('/api/transporters', listTransporters);
     router.get('/api/transporters/export', listTransporters);
    router.get('/api/transporters/:id', listTransporters);

    router.get('/api/companytypes', listCompanyTypes);
    router.get('/api/companytypes/:id', listCompanyTypes);

    router.get('/api/paymentterms', listPaymentTerms);
    router.get('/api/paymentterms/:id', listPaymentTerms);

    router.get('/api/taxslabs', listTaxSlabs);
    router.get('/api/taxslabs/:id', listTaxSlabs);
    router.get('/api/tax/',listTax);

    router.get('/api/hsn', listHsn);
    router.get('/api/hsn/:id', listHsn);

    router.get('/api/bills', listBill);
    router.get('/api/bills/:id', listBill);
    router.get('/api/bills/export', listBill);

    router.get('/api/notifications', listNotifications);
    router.get('/api/notifications/export', listNotifications);
    router.put('/api/notifications/:id', updateNotification);

    router.get('/api/unitofmeasures', listUnitOfMeasures);
    router.get('/api/unitofmeasures/:id', listUnitOfMeasures);

    router.get('/api/unitconversions/:id', listUnitConversions);

    router.get('/api/customfilters', listCustomFilters);
    router.get('/api/tempos', listTempos);

    router.post('/api/bills', createBill);

    router.post('/api/customerbills', createCustomerBills);

    router.put('/api/customerbills/:guid', updateCustomerBills);
    
    // post requests
	//code=SHARMA2&name=Sharma+Transport&address1=3090+Sharda+Tower&address2=Rakhial&city=Ahmedabad&state=Gujarat&zip=33333&phone=333333333&email=abc@bharat.com
    router.post('/api/transporters', createTransporter);

    router.post('/api/companytypes', createCompanyType);

	//code=SHARMA2&description=90+days&days=90
    router.post('/api/paymentterms', createPaymentTerm);

    router.post('/api/tempos', createTempo);

    router.post('/api/unitofmeasures', createUnitOfMeasure);

	router.post('/api/hsn', createHsn);

    // put request to update
	//code=SHARMA2&name=Sharma+Transport&status_id=4600&address1=3090+Sharda+Tower&address2=Rakhial&city=Ahmedabad&state=Gujarat&zip=33333&phone=333333333&email=abc@bharat.com

	router.put('/api/hsn/:id', updateHsn);

	router.put('/api/bills', updateBill);

    router.put('/api/transporters/:id', updateTransporter); 

    router.post('/api/transporters/0/upload', uploadTransporterFile);

	//code=SHARMA2&description=90+days&days=90&status_id=4600
	router.put('/api/tempos/:id', updateTempo); 

    router.put('/api/paymentterms/:id', updatePaymentTerm); 

    router.put('/api/companytypes/:id', updateCompanyType); 

    router.put('/api/unitofmeasures/:id', updateUnitOfMeasure); 

    router.put('/api/customfilters/:id', updateCustomFilter); 

    router.post('/api/customfilters', createCustomFilter);

    router.delete('/api/customfilters/:id', deleteCustomFilter); 

    router.delete('/api/unitofmeasures/:id', deleteUnitOfMeasure); 

    router.delete('/api/paymentterms/:id', deletePaymentTerm);

    router.delete('/api/customers/:id', deletePaymentTerm);

    router.delete('/api/companytypes/:id', deleteCompanyType);

    router.delete('/api/transporters/:id', deleteTransporter);

	router.delete('/api/hsn/:id', deleteHsn);    

};

function listHsn (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);

			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {
				MasterController.findHsnById(req.params.id, companyid, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
			else {
				MasterController.findAllHsn(companyid, req.query, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
		});
}

function listBill (req, res, next) {


		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {
				MasterController.findBillById(req.params.id, companyid, response.data.session, function(err, response) {

					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
			else {
				var options = {};
				options.id 			= req.query.id;
				options.customerid  = req.query.customerid;
				options.fromdate    = req.query.fromdate;
				options.todate      = req.query.todate;
				options.duedatefrom    = req.query.duedatefrom;
				options.duedateto      = req.query.duedateto;
				options.nextreminderfrom    = req.query.nextreminderfrom;
				options.nextreminderto      = req.query.nextreminderto;
				options.pagenumber  = req.query.page_number;
				options.pagesize    = req.query.page_size;
				options.bill_number = req.query.bill_number;
				options.bill_ref_number = req.query.bill_ref_number	;
				options.status_id = req.query.status_id;
				options.sortby		= req.query.sort_by;
				options.sortorder	= req.query.sort_direction;

				MasterController.findAllBills(companyid, options, response.data.session, function(err, billlist) {
						if (err)
							return next(err);
						var billsdata = billlist.data.billlist;
						if(req.query.format =="excel")
						{
							try
							{
								var workbook = new Excel.Workbook();
			        			var worksheet = workbook.addWorksheet('Bills');						
								
								worksheet.columns = [
									{header:'Customer Code', key:'customer_code', width:30},
									{header:'Customer Name', key:'customer_name', width:30},
									{header:'Phone Number', key:'phone', width:30},
									{header:'Email', key:'email', width:30},
									{header:'Bill Number', key:'bill_number', width:30},
									{header:'Bill Reference Number', key:'bill_ref_number', width:30},
									{header:'Bill Date', key:'bill_date', width:30},
									{header:'Bill Amount', key:'bill_amount', width:30},
									{header:'Balance Amount', key:'balance_amount', width:30},
									{header:'Due Date', key:'due_date', width:30},
								    {header:'Paid Amount Till Date', key:'paid_amount', width:30},
									{header:'Latest Paid Date', key:'paid_date', width:30},
								    {header:'Inactive', key:'inactive', width:30}
								];

								for (var i = 0; i < billsdata.length; i++) {
									worksheet.addRow({	customer_code: billsdata[i].customer.code, customer_name: billsdata[i].customer.name, 
														phone: billsdata[i].customer.address.phone1, email: billsdata[i].customer.address.email1,
														bill_number: billsdata[i].bill_number, bill_ref_number: billsdata[i].bill_ref_number, bill_date: billsdata[i].bill_date, bill_amount: billsdata[i].bill_amount,
														balance_amount: billsdata[i].balance_amount, due_date: billsdata[i].due_date, 
														paid_amount: billsdata[i].paid_amount, paid_date: billsdata[i].paid_date,
														inactive: (billsdata[i].statusid == Util.CONST_PAYMENT_STATUS_DELETE ? 1 : 0)

													});
								}
								
								res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
							    res.setHeader("Content-Disposition", "attachment; filename=" + "Bills.xlsx");
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
							return res.json(billlist);
				});
			}
		});
}

function listNotifications (req, res, next) {


		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			var options = {};
			options.customerid  = req.query.customerid;
			options.formatid  = req.query.formatid;
			options.typeid    = req.query.typeid;
			options.statusid  = req.query.statusid;
			options.pagenumber  = req.query.page_number;
			options.pagesize    = req.query.page_size;
			options.fromdate	= req.query.fromdate;
			options.todate		= req.query.todate;
			options.sortby		= req.query.sort_by;
			options.sortorder	= req.query.sort_direction;

			MasterController.findAllNotifications(companyid, options, response.data.session, function(err, notlist) {
					if (err)
						return next(err);
					var notsdata = notlist.data.notificationlist;
					if(req.query.format =="excel")
					{
						try
						{
							var workbook = new Excel.Workbook();
		        			var worksheet = workbook.addWorksheet('Notifications');						
							
							worksheet.columns = [
								{header:'Customer Name', key:'cname', width:30},
							    {header:'Type',key:'not_type', width:15},
							    {header:'Format',key:'not_format',width:30},
							    {header:'Reference',key:'not_ref',width:30},
							    {header:'Destination',key:'not_destination',width:30},
							    {header:'Created',key:'created',width:30}
							];

							for (var i = 0; i < notsdata.length; i++) {
								worksheet.addRow({cname: notsdata[i].customer.name
													, not_type: notsdata[i].type_name
													, not_format: notsdata[i].format_name
													, not_ref: notsdata[i].documentid
													, not_destination: notsdata[i].destination
													, created: notsdata[i].created});
							}
							
							res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
						    res.setHeader("Content-Disposition", "attachment; filename=" + "Notifications.xlsx");
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
						return res.json(notlist);
			});

		});

}


function listTaxSlabs (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);

			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {
				MasterController.findTaxSlabById(req.params.id, companyid, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
			else {
				MasterController.findAllTaxSlabs(companyid, req.query, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
		});
}

function listTax (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);

			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.query.productid) {
				MasterController.findTaxByProductId(companyid, req.query.productid, req.query, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
			else if (req.query.deliveryid) {
				MasterController.findTaxByDeliveryId(companyid, req.query.deliveryid, req.query, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
			else
				return res.json({});

		});
}

function listUnitOfMeasures (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);

			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.query.productid) {
				ProductController.findProductAllUOM(req.query.productid, companyid, customerid, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
			else if (req.params.id) {
				MasterController.findUnitOfMeasureById(req.params.id, companyid, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
			else {
				MasterController.findAllUnitOfMeasures(companyid, req.query, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
		});
}

function listUnitConversions (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);

			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.query.from & req.query.to) {
				MasterController.findUnitConversions(companyid, req.params.id, req.query.from, req.query.to, response.data.session, function(err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);
				});
			}
		});
}

function createBill (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

        //company.code = Util.randomString(32);
        // save the company and check for errors

        MasterController.createBill(
        	companyid, req.body.bill,
        	response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

	});

}

function updateBill (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

        //company.code = Util.randomString(32);
        // save the company and check for errors

        MasterController.updateBill(
        	companyid, req.body.bill,
        	response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

	});

}

function updateNotification (req, res, next) {
	
	var webhook = req.query.webhook;
	
	if(webhook == 1) {
		var id = req.query.id;
		var code = req.query.code;
		if( id == undefined || code == undefined)
		{
			return res.json(Util.setErrorResponse(-100, "Invalid URL"));
		}
		else {
			var encryptCode = Util.encryptWithMD5(id);
			if(code != encryptCode) {
				return res.json(Util.setErrorResponse(-100, "Invalid URL"));
			}
			else {
				MasterController.updateNotification(
			    	req.params.id, Util.mapPartnerNotificationStatus(req.body.status), function(err, response) {
						if (err)
							return next(err);
						else
							return res.json(response);
			    });
			}
		}
	}
}

function createCustomerBills (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

        //company.code = Util.randomString(32);
        // save the company and check for errors
        MasterController.createCustomerBills(
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

function updateCustomerBills (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

        //company.code = Util.randomString(32);
        // save the company and check for errors
        MasterController.updateCustomerBills(
        	companyid,
        	req.params.guid,
        	response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });

	});

}


function createUnitOfMeasure (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.createUnitOfMeasure(
			req.body.uom,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function updateUnitOfMeasure (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.updateUnitOfMeasure(
			req.body.uom,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function updateCustomFilter (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.updateCustomFilter(
			req.params.id,
			req.body.name,
			req.body.filters,
			req.body.show_in_dashboard,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}


function deleteUnitOfMeasure (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.deleteUnitOfMeasure(
			req.params.id,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function deleteCustomFilter (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.deleteCustomFilter(
			req.params.id,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function deleteTransporter(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.deleteTransporter(
			req.params.id,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function deleteCompanyType(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.deleteCompanyType(
			req.params.id,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function deletePaymentTerm(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.deletePaymentTerm(
			req.params.id,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function listTransporters (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {

				MasterController.findTransporterById(req.params.id, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});

			}

			else {

				let options = {};

				options["sortby"]		= req.query.sort_by;
				options["sortorder"]	= req.query.sort_direction;

				options["activeonly"]   = (req.query.activeonly == 1 || req.query.activeonly == '1' || req.query.activeonly == true || req.query.activeonly == 'true' ? 1 : 0);
				options["code"]         = (req.query.code ? req.query.code : "");

				MasterController.findAllTransporters(companyid, options, response.data.session, function(err, transporters) {
					if (err)
						return next(err);

					var transportersdata = transporters.data.transporterlist;
					if(req.query.format =="excel")
					{
						try
						{
							var workbook = new Excel.Workbook();
		        			var worksheet = workbook.addWorksheet('Transporters');						
							
							worksheet.columns = [

								{header:'Code', key:'code', width:30},
							    {header:'Name', key:'name', width:30},
							    {header:'First Name',key:'first_name', width:15},
							    {header:'Last Name',key:'last_name',width:30},
								{header:'Govt Code', key:'govt_code', width:30},
								{header:'Address1', key:'address1', width:30},
							    {header:'Address2',key:'address2', width:15},
							    {header:'Address3',key:'address3',width:30},
							    {header:'City', key:'city', width:30},
							    {header:'State', key:'state', width:30},
							    {header:'Email',key:'email', width:15},
							    {header:'Phone',key:'phone',width:30},
								{header:'Other Phone', key:'other_phone', width:30},
							    {header:'Status',key:'status', width:15}
							];

							for (var i = 0; i < transportersdata.length; i++) {
								worksheet.addRow({code: transportersdata[i].code, name: transportersdata[i].name, 
												  first_name: transportersdata[i].first_name, last_name: transportersdata[i].last_name, 
												  govt_code: transportersdata[i].external_code, address1: transportersdata[i].address.address1,
												  address2: transportersdata[i].address.address2, address3: transportersdata[i].address.address3,  
												  city: transportersdata[i].address.city, state: transportersdata[i].address.state,  
												  email: transportersdata[i].address.email1, phone: transportersdata[i].address.phone1,  
												  other_phone: transportersdata[i].address.phone2,  
												  status: transportersdata[i].status_id == "4600" ? "Active" : "Inactive"
												});
							}
							
							res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
						    res.setHeader("Content-Disposition", "attachment; filename=" + "Transporters.xlsx");
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
						return res.json(transporters);
				});
			}
		});
}


function createTransporter (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.createTransporter(
			req.body.code,
			req.body.external_code,
			req.body.name,
			req.body.first_name,
			req.body.last_name,
			req.body.address1,
			req.body.address2,
			req.body.address3,
			req.body.city,
			req.body.state,
			req.body.zip,
			req.body.phone1,
			req.body.email1,
			req.body.phone2,
			req.body.email2,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function updateTransporter (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.updateTransporter(
			req.params.id,
			req.body.code,
			req.body.external_code,
			req.body.name,
			req.body.status_id,
			req.body.first_name,
			req.body.last_name,
			req.body.address1,
			req.body.address2,
			req.body.address3,
			req.body.city,
			req.body.state,
			req.body.zip,
			req.body.phone1,
			req.body.email1,
			req.body.phone2,
			req.body.email2,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function listPaymentTerms (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {

				MasterController.findPaymentTermById(req.params.id, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});

			}

			else {

				activeonlyflag = (req.query.activeonly == 1 ? 1 : 0);

				let options = {};

				options["sortby"]		= req.query.sort_by;
				options["sortorder"]	= req.query.sort_direction;

				options["activeonly"]   = (req.query.activeonly == 1 || req.query.activeonly == '1' || req.query.activeonly == true || req.query.activeonly == 'true' ? 1 : 0);

				MasterController.findAllPaymentTerms(companyid, options, response.data.session, function(err, PaymentTerms) {
					if (err)
						return next(err);
					else
						return res.json(PaymentTerms);
				});
			}
		});
}



function listTempos (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			MasterController.findAllTempos(companyid, response.data.session, function(err, tempos) {
				if (err)
					return next(err);
				else
					return res.json(tempos);
			});
		});
}

function createPaymentTerm (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.createPaymentTerm(
			req.body.code,
			req.body.description,
			req.body.days,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function createTempo (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.createTempo(
			req.body.name,
			req.body.driver_name,
			req.body.vehicle_number,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function createHsn (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.createHsn(
			req.body,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function updatePaymentTerm (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.updatePaymentTerm(
			req.params.id,
			req.body.code,
			req.body.description,
			req.body.status_id,
			req.body.days,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function updateTempo (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.updateTempo(
			req.params.id,
			req.body.name,
			req.body.driver_name,
			req.body.vehicle_number,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function updateHsn (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		// update the ID from input parameters
		req.body.id = req.params.id;

		MasterController.updateHsn(
			req.body,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function deleteHsn (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		// update the ID from input parameters
		MasterController.deleteHsn(
			req.params.id,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function listCompanyTypes (req, res, next) {

		var sid = Util.readSID(req);

		SessionController.validate(sid, function (err, response) {

			if (err)
				return next(err);
			
			if (!(response.statuscode === 0 && response.data.session.company_id))
				return res.json(response);

			var companyid = response.data.session.company_id;

			if (req.params.id) {

				MasterController.findCompanyTypeById(req.params.id, companyid, response.data.session, function(err, response) {
						if (err)
							return next(err);

						return res.json(response);
				});

			}

			else {

				let options = {};

				options["sortby"]		= req.query.sort_by;
				options["sortorder"]	= req.query.sort_direction;

				MasterController.findAllCompanyTypes(companyid, options, response.data.session, function(err, companytypes) {
					if (err)
						return next(err);
					else
						return res.json(companytypes);
				});
			}
		});
}


function createCompanyType (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.createCompanyType(
			req.body.name,
			req.body.description,
			req.body.balance_limit,
			req.body.is_default,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function updateCompanyType (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.updateCompanyType(
			req.params.id,
			req.body.name,
			req.body.description,
			req.body.balance_limit,
			req.body.is_default,
			companyid,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}


function uploadTransporterFile(req, res, next) {
let sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) 
	{

		if (err)
			return next(err);
		
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		let companyid = response.data.session.company_id;
	
		var form = new formidable.IncomingForm();

		form.parse(req);

		// specify that we want to allow the user to upload multiple files in a single request
		form.multiples = true;

		form.on('error', function(err) {
			return next(err);
		});

		form.on('fileBegin', function (name, file){
			let path = require("path");
			let extension = path.extname(file.name);
			file.path = (config.ST_UPLOAD_LOCATION || '/tmp') + "/" + Util.randomString(16) + extension;
		});

		form.on('aborted', function(err) {
			try {
			  fs.unlinkSync(file.path)
			  //file removed
			} catch(err) {
			  console.error(err)
			}
			return next(err);
		});

		form.on('file', function(field, file) {

			let validHeaderList =  getTransporterValidHeaderList();

			let excelReader = new ExcelReader();
			excelReader.parseFile(file.path, validHeaderList, function(err, dataList) {
				if (err)
					return res.json(err);

				MasterController.uploadTransporter(companyid, dataList, response.data.session, function (err, response) {
					if (err)
						return next(err);
					else
						return res.json(response);					
				});
				try {
				  fs.unlinkSync(file.path)
				  //file removed
				} catch(err) {
				  console.error(err)
				}
			});
		});
	});
}

function getTransporterValidHeaderList() {

		let validHeaderList = [];
		validHeaderList.push({
			name: "Code", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Name", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Govt Code", type: "string", length: 232
		});

		validHeaderList.push({
			name: "Address1", type: "string", length: 128
		});

		validHeaderList.push({
			name: "City", type: "string", length: 128
		});

		validHeaderList.push({
			name: "State", type: "string", length: 32
		});

		validHeaderList.push({
			name: "PinCode", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Email", type: "string", length: 32
		});

		validHeaderList.push({
			name: "Phone", type: "string", length: 32
		});

		return validHeaderList;

	}

function createCustomFilter(req, res, next) {

		var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		MasterController.createCustomFilter(
			req.body.name,
			req.body.filters,
			req.body.is_user_defined,
			req.body.show_in_dashboard,
			req.body.document_type,
			response.data.session,
			function(err, response) {
				if (err)
					return next(err);
				else
					return res.json(response);
        });
    });

}

function listCustomFilters(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);
			
		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);

		var companyid = response.data.session.company_id;

		let options = {};
		options.document_type = req.query.document_type;
		options.show_in_dashboard = req.query.show_in_dashboard;

		MasterController.findAllCustomFilters(
			companyid,
			options,
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
