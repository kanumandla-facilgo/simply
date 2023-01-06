const SessionController  = require("../../controllers/session");
const UploadController  = require("../../controllers/upload");
const Util               = require("../../utils");
const Upload            = require("../../bo/upload");
const config             = require("../../config/config");
const fs                 = require("fs");
const async              = require("async");
const ExcelReader        = require("../../utils/ExcelReader");
const formidable         = require("formidable");
const path = require("path");
var Excel = require('exceljs');

module.exports = function attachHandlers (router) {

	// get requests
    // post requests
    router.post('/api/uploads/agents', uploadAgents);
    router.post('/api/uploads/bills', uploadBills);
    router.post('/api/uploads/customers', uploadCustomers);
    router.post('/api/uploads/transporters', uploadTransporters);
    router.get('/api/uploads', findAllUploads);
    router.get('/api/uploads/:id', findAllUploads);
    router.get('/api/uploads/agents/templates', downloadAgentTemplate);
    router.get('/api/uploads/bills/templates', downloadBillTemplate);
    router.get('/api/uploads/customers/templates', downloadCustomerTemplate);
    router.get('/api/uploads/transporters/templates', downloadTransporterTemplate);

};

function findAllUploads(req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		let companyid = response.data.session.company_id;
		if(req.params.id)
		{
			UploadController.findById(req.params.id, req.query.detail, response.data.session, function(err, response) {
				if (err)
					return next(err);

				return res.json(response);
			});
		}
		else {
			UploadController.findAll(companyid, response.data.session, function(err, response) {
				if (err)
					return next(err);

				return res.json(response);
			});
		}
	});
}

function downloadAgentTemplate (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var workbook = new Excel.Workbook();
		var worksheet = workbook.addWorksheet('Agents');
		
		worksheet.columns = [
			{header:'Code', key:'code', width:30},
			{header:'Firm Name', key:'firm_name', width:30},
			{header:'Accounting Name', key:'acct_name', width:30},
			{header:'Address1', key:'addr1', width:30},
			{header:'Address2', key:'addr2', width:30},
		    {header:'City', key:'city', width:30},
		    {header:'State',key:'state', width:30},
		    {header:'PinCode',key:'pincode',width:30},
		    {header:'Email',key:'email',width:30},
		    {header:'Phone',key:'phone',width:30},
		    {header:'Commission',key:'commission',width:30},
		    {header:'Sales Person Login Name',key:'sp_login_name',width:30},
		    {header:'Login Name',key:'login_name',width:30},
		    {header:'Password',key:'password',width:30}
		];

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	    res.setHeader("Content-Disposition", "attachment; filename=" + "Agents.xlsx");
	    workbook.xlsx.write(res)
	        .then(function (data) {
	            res.end();
	        });
	});

}

function downloadBillTemplate (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var workbook = new Excel.Workbook();
		var worksheet = workbook.addWorksheet('Agents');
		
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

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	    res.setHeader("Content-Disposition", "attachment; filename=" + "Bills.xlsx");
	    workbook.xlsx.write(res)
	        .then(function (data) {
	            res.end();
	        });
	});

}

function downloadTransporterTemplate (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
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
			{header:'Other Phone', key:'other_phone', width:30}
		];
		
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	    res.setHeader("Content-Disposition", "attachment; filename=" + "Transporters.xlsx");
	    workbook.xlsx.write(res)
	        .then(function (data) {
	            res.end();
	        });
	});

}

function downloadCustomerTemplate (req, res, next) {

	var sid = Util.readSID(req);

	SessionController.validate(sid, function (err, response) {

		if (err)
			return next(err);

		if (!(response.statuscode === 0 && response.data.session.company_id))
			return res.json(response);
		
		var workbook = new Excel.Workbook();
		var worksheet = workbook.addWorksheet('Customers');
		
		worksheet.columns = [
			{header:'Code', key:'code', width:30},
			{header:'Firm Name', key:'name', width:30},
			{header:'Address1', key:'addr1', width:30},
			{header:'Address2', key:'addr1', width:30},
			{header:'Address3', key:'addr1', width:30},
		    {header:'City', key:'city', width:30},
		    {header:'State',key:'state', width:30},
		    {header:'PinCode',key:'pincode',width:30},
		    {header:'Email',key:'email',width:30},
		    {header:'Phone',key:'phone',width:30},
		    {header:'GST Type',key:'gst_type', width:30},
		    {header:'GST Number',key:'gst_number',width:30},
		    {header:'Rate Category',key:'customer_type',width:30},
		    {header:'Agent Code',key:'agent_code',width:30},
		    {header:'Transporter',key:'transporter',width:30},
		    {header:'Payment Term',key:'payment_term',width:30}
		];
		
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	    res.setHeader("Content-Disposition", "attachment; filename=" + "Customers.xlsx");
	    workbook.xlsx.write(res)
	        .then(function (data) {
	            res.end();
	        });
	});

}


function uploadAgents(req, res, next)
{

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
			let extension = path.extname(file.name);
			file.path = process.cwd() + (config.local.image_server_root || '/tmp') + "uploads/" + Util.randomString(16) + extension;
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
			let validHeaderList =  Util.getAgentValidHeaderList();

			let excelReader = new ExcelReader();
			excelReader.parseFile(file.path, validHeaderList, function(err, dataList) {
				if (err && err.length > 0)
				{
					let upload = new Upload();
					upload.userid = response.data.session.user.id;
					upload.companyid = companyid;
					upload.upload_type_id = Util.UploadTypeEnum.Agent;
					upload.number_of_records = 0;
					upload.status_id = Util.SyncStatusEnum.Error;
					upload.filepath =  file.path;
					upload.format = '';
					upload.notes = err;

					UploadController.save(companyid, upload, response.data.session, function (err, response) {
						if (err)
							return next(err);
						else{
							return res.json(response);					
						}
					});
				}
				else
				{
					let upload = new Upload();
					upload.userid = response.data.session.user.id;
					upload.companyid = companyid;
					upload.upload_type_id = Util.UploadTypeEnum.Agent;
					upload.number_of_records = dataList.length;
					upload.filepath = file.path;
					upload.format = path.extname(file.path);
					upload.status_id = Util.SyncStatusEnum.Pending;
					upload.notes = '';

					UploadController.save(companyid, upload, response.data.session, function (err, response) {
						if (err)
							return next(err);
						else{
							return res.json(response);					
						}
					});
				}
			});
		});
	});
}

function uploadBills(req, res, next)
{

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
			let extension = path.extname(file.name);
			file.path = process.cwd() + (config.local.image_server_root || '/tmp') + "uploads/" + Util.randomString(16) + extension;
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
			let validHeaderList =  Util.getBillValidHeaderList();

			let excelReader = new ExcelReader();
			excelReader.parseFile(file.path, validHeaderList, function(err, dataList) {
				if (err && err.length > 0)
				{
					let upload = new Upload();
					upload.userid = response.data.session.user.id;
					upload.companyid = companyid;
					upload.upload_type_id = Util.UploadTypeEnum.Bill;
					upload.number_of_records = 0;
					upload.status_id = Util.SyncStatusEnum.Error;
					upload.filepath =  file.path;
					upload.format = '';
					upload.notes = err;

					UploadController.save(companyid, upload, response.data.session, function (err, response) {
						if (err)
							return next(err);
						else{
							return res.json(response);					
						}
					});
				}
				else
				{
					let upload = new Upload();
					upload.userid = response.data.session.user.id;
					upload.companyid = companyid;
					upload.upload_type_id = Util.UploadTypeEnum.Bill;
					upload.number_of_records = dataList.length;
					upload.filepath = file.path;
					upload.format = path.extname(file.path);
					upload.status_id = Util.SyncStatusEnum.Pending;
					upload.notes = '';

					UploadController.save(companyid, upload, response.data.session, function (err, response) {
						if (err)
							return next(err);
						else{
							return res.json(response);					
						}
					});
				}
			});
		});
	});
}

function uploadTransporters(req, res, next)
{

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
			let extension = path.extname(file.name);
			file.path = process.cwd() + (config.local.image_server_root || '/tmp') + "uploads/" + Util.randomString(16) + extension;
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
			let validHeaderList =  Util.getTransporterValidHeaderList();

			let excelReader = new ExcelReader();
			excelReader.parseFile(file.path, validHeaderList, function(err, dataList) {
				if (err && err.length > 0)
				{
					let upload = new Upload();
					upload.userid = response.data.session.user.id;
					upload.companyid = companyid;
					upload.upload_type_id = Util.UploadTypeEnum.Transporter;
					upload.number_of_records = 0;
					upload.status_id = Util.SyncStatusEnum.Error;
					upload.filepath = file.path;
					upload.format = '';
					upload.notes = err;

					UploadController.save(companyid, upload, response.data.session, function (err, response) {
						if (err)
							return next(err);
						else{
							return res.json(response);					
						}
					});
				}
				else
				{
					let upload = new Upload();
					upload.userid = response.data.session.user.id;
					upload.companyid = companyid;
					upload.upload_type_id = Util.UploadTypeEnum.Transporter;
					upload.number_of_records = dataList.length;
					upload.filepath = file.path;
					upload.format = path.extname(file.path);
					upload.status_id = Util.SyncStatusEnum.Pending;
					upload.notes = '';

					UploadController.save(companyid, upload, response.data.session, function (err, response) {
						if (err)
							return next(err);
						else{
							return res.json(response);					
						}
					});
				}
			});
		});
	});
}

function uploadCustomers(req, res, next)
{

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
			let extension = path.extname(file.name);
			file.path = process.cwd() + (config.local.image_server_root || '/tmp') + "uploads/" + Util.randomString(16) + extension;
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
			let validHeaderList =  Util.getCustomerValidHeaderList();

			let excelReader = new ExcelReader();
			excelReader.parseFile(file.path, validHeaderList, function(err, dataList) {
				if (err && err.length > 0)
				{
					let upload = new Upload();
					upload.userid = response.data.session.user.id;
					upload.companyid = companyid;
					upload.upload_type_id = Util.UploadTypeEnum.Customer;
					upload.number_of_records = 0;
					upload.status_id = Util.SyncStatusEnum.Error;
					upload.filepath = file.path;
					upload.format = '';
					upload.notes = err;

					UploadController.save(companyid, upload, response.data.session, function (err, response) {
						if (err)
							return next(err);
						else{
							return res.json(response);					
						}
					});
				}
				else
				{
					let upload = new Upload();
					upload.userid = response.data.session.user.id;
					upload.companyid = companyid;
					upload.upload_type_id = Util.UploadTypeEnum.Customer;
					upload.number_of_records = dataList.length;
					upload.filepath = file.path;
					upload.format = path.extname(file.path);
					upload.status_id = Util.SyncStatusEnum.Pending;
					upload.notes = '';

					UploadController.save(companyid, upload, response.data.session, function (err, response) {
						if (err)
							return next(err);
						else{
							return res.json(response);					
						}
					});
				}
			});
		});
	});
}



