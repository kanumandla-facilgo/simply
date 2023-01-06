var Map             = require("../utils/map");
var ConfigService   = require("./configuration");
var Config          = require("../config/config");

var getReportHeader = function (id) {

	var reportList = {};

	var report;
	report = {"id": 1, "title": "Stock In Process", "subtitle" : "Stock In Process"};
	reportList["1"] = report;

	report = {"id": 2, "title": "Usage Report", "subtitle" : "Usage Report"};
	reportList["2"] = report;

	report = {"id": 3, "title": "Agent Pending Balance", "subtitle" : "Agent Pending Balance"};
	reportList["3"] = report;

	report = {"id": 4, "title": "Customers Pending Sync", "subtitle" : "Customers Pending Sync"};
	reportList["4"] = report;

	report = {"id": 4, "title": "Inventory List", "subtitle" : "Inventory List"};
	reportList["5"] = report;

	return reportList[id];

};

var mapDataRow = function (headerRow, dataRow) {

	var object = {};
	for (var key in headerRow) {
	  if (headerRow.hasOwnProperty(key)) {
	  	object[key] = dataRow[key];
	  	// object[key] = {};
	  	// object[key]["title"] = dataRow[key];
	  	// object[key]["type"] = headerDataTypeRow[i];

	  }
	}

	return object;

};

var mapHeaderRow = function (headerRow, headerDataTypeRow) {

	var columnList = [];
	var i = 0;
	for (var key in headerRow) {

		i++;
		if (headerRow.hasOwnProperty(key)) {
			var object = {};
	  		object["name"] = key; //headerRow[key];
	  		object["align"] = headerDataTypeRow["col" + i];
	  		columnList.push(object);

	  		// object[key]["name"] = headerRow[key];
	  		// object[key]["align"] = headerDataTypeRow["col" + i];
	  	// object[key] = {};
	  	// object[key]["title"] = dataRow[key];
	  	// object[key]["type"] = headerDataTypeRow[i];

	 	}
	}

	return columnList;

};

var getReport = function (reportid, options, companyid, session, connection, callback) {

	var fromdate = (options.fromdate ? new Date(options.fromdate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);
	var todate   = (options.todate   ? new Date(options.todate).toISOString().replace(/T/, ' ').replace(/\..+/, '') : null);

	var cmd = "CALL spGetReport(@err, @msg, @totalrecords, ?,?,?,?,?,?, ?, ?,?,?)";

	connection.query(cmd, [
								companyid,
								reportid,
								session.user.id,
								(options.statusid ? options.statusid : null),
								fromdate,
								todate,
								(options.customerid ? options.customerid : null),
								(options.option1 ? options.option1 : null),
								(options.pagenumber ? options.pagenumber : 1),
								(options.pagesize ? options.pagesize : 20)
							  ], function (err, rows) {

									if (err) return callback (err);

									connection.query("SELECT @err AS err, @msg AS msg, @totalrecords AS totalrecords", function (feedbackerr, feedbackrows) {
										if (feedbackrows && feedbackrows[0] && (feedbackrows[0].err == 0 || feedbackrows[0].err == null)) 
										{

											var headerRow = rows[0][0];

											var headerDataTypeRow = rows[1][0];

											var report = getReportHeader(reportid);

											report["column_header_list"] = mapHeaderRow(headerRow, headerDataTypeRow);

											// report["title"] = "Stock Report";
											// report["subtitle"] = "My Stock Report";
											//report["column_header_list"] = headerRow;

											report["id"] = reportid;
											var rowlist = [];

											for(var i = 0; i <rows[2].length; i++)
											{
												rowlist.push(mapDataRow(headerRow, rows[2][i]));
											}
											report["data"] = rowlist;
											report["totalrecords"] = feedbackrows[0].totalrecords;
											return callback(null, report);

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

var printReport = function (reportid, options, companyid, session, connection, callback) {

	getReport(reportid, options, companyid, session, connection, function (err, report) {
		if (err) return callback (setError(err), null);

		var wkhtmltopdf = require('wkhtmltopdf');

		var nunjucks = require('nunjucks');
		var renderedHtml =  nunjucks.render(process.cwd() + "/src/print_templates/report.html", report);

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

	//	wkhtmltopdf(str,{ output: 'out2.pdf', 'header-left':'Rupesh Shah', 'header-html':'http://www.google.com'});
//						wkhtmltopdf(str, { output: 'out2.pdf', 'pageSize':pageSize,'disableSmartShrinking':true, 'dpi':dpi});
	//	wkhtmltopdf('<h1>Test</h1><p>Hello world</p>').pipe(res);
		wkhtmltopdf(renderedHtml, { 'pageSize':pageSize,'disableSmartShrinking':false, 'dpi':dpi}, function (err, stream){
			return callback (err, stream);
		});

	});

};

var setError = function(err, msg) {
	var err = new Err();
	err.code    = err;
	err.message = msg;
	return err;
};

module.exports = {
	printReport     : printReport,
	getReport       : getReport
};
