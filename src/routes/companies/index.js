const CompanyController = require("../../controllers/company");
const SessionController = require("../../controllers/session");
const Util = require("../../utils");
const Company = require("../../bo/company");
const User = require("../../bo/user");
const ExcelReader = require("../../utils/ExcelReader");
const formidable = require("formidable");
const config = require("../../config/config");
let moment = require("moment-timezone");
var Excel = require("exceljs");
const fs = require("fs");
var JSZip = require("jszip");

module.exports = function attachHandlers(router) {
  router.get("/api/customers", findAllCustomers);
  router.get("/api/customers/export", findAllCustomers);
  router.get("/api/customers/:id", findCustomerById);
  router.get("/api/agents", findAllAgents);
  router.get("/api/agents/export", findAllAgents);
  router.get("/api/agents/:id", findAgentById);
  router.get("/api/companies/tallysetup/download", downloadSetup);

  // get requests
  //router.get('/api/companies', listCompanies);
  router.get("/api/companies/:company_id", listCompanies);

  // post requests
  //name=Maitri+Shah&code=MAITRI&description=new+company&address1=30+ABC+Dr&address2=ABC&city=Pleasanton&state=GUJARAT&zip=380015&phone=079-26730323&email=rupesh.d.shah@gmail.com&first_name=Maitri&last_name=Shah&login_name=maitri.admin&password=abc999
  router.post("/api/companies", createCompany);
  router.post("/api/customers", createCustomer);
  router.post("/api/customers/0/upload", uploadCustomerFile);
  router.post("/api/customerbalance", updateCustomerBalance);
  router.post("/api/agents", createAgent);

  router.post("/api/agents/0/upload", uploadAgentFile);

  router.put("/api/customers/:id", updateCustomer);
  router.put("/api/agents/:id", updateAgent);

  router.patch("/api/customers/:id", updateCustomerData);

  router.delete("/api/customers/:id", deleteCustomer);
  router.delete("/api/agents/:id", deleteAgent);

  // put request to update
  //router.put('/api/companies/:company_id', updateCompany);

  //router.delete('/api/companies/:company_id', deleteCompany);
};

function createCompany(req, res, next) {
  req.body.company.code = Util.randomString(8);

  CompanyController.create(req.body.company, req.body.user, function (err, response) {
    if (err) return next(err);
    else {
      Util.email(
        '"Simply Textile" <admin@simplytextile.com>',
        config.registration_notification_email,
        "SimplyTextile Company Registration",
        "<b>" + req.body.company.name + "</b><br/>" + req.body.user.first_name + " " + req.body.user.last_name + "<br/>" + req.body.user.email + "<br/>Phone:" + req.body.user.phone,
        function (err, info) {}
      );

      return res.json(response);
    }
  });

  //return res.send(201);
}

function downloadSetup(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    CompanyController.getAPICredentials(response.data.session.user.id, function (err, credentials) {
      if (err) return next(err);
      else {
        try {
          var companyname = req.query.companyname;
          var contents = "";
          contents = 'SIMPLY_URL = "https://simplyapp.in"\r\n';
          contents += 'SIMPLY_LOGIN_NAME = "' + credentials.api_key + '"\r\n';
          contents += 'SIMPLY_PASSWORD = "' + credentials.api_secret + '"\r\n';
          contents += 'TALLY_URL = "http://localhost:9000"\r\n';
          contents += 'TALLY_COMPANY_NAME = "' + companyname + '"\r\n';
          contents += 'LOG_FOLDER = "D:\\workspace\\st_ui\\api\\log"\r\n';
          contents += "TIMEOUT = 10";

          res.setHeader("content-disposition", "attachment; filename=tallysetup.zip");
          res.setHeader("content-type", "application/zip");
          var zip = new JSZip();
          zip.file("config.py", contents);

          var job_file_path = process.cwd() + "/api/syncPendingBillsTallyFirst.py";
          fs.readFile(job_file_path, function (err, data) {
            zip.file("syncPendingBills.py", data);
            zip.generateNodeStream({ type: "nodebuffer", streamFiles: true }).pipe(res);
          });
        } catch (err) {
          return next(err);
        }
      }
    });
  });
}

function findAllCustomers(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    if (req.query.pending_delivery == "1") {
      CompanyController.findCustomersWithPendingDelivery(companyid, response.data.session, function (err, response) {
        if (err) return next(err);
        else return res.json(response);
      });
    } else {
      var options = {};
      options["code"] = req.query.code;
      options["agent_id"] = req.query.agent_id;
      options["enabled_only"] = req.query.enabled_only;
      options["status_id"] = req.query.statusid;
      options["sales_person_id"] = req.query.sales_person_id;
      options["search_text"] = req.query.search_text;
      options["created_since_x_mins"] = req.query.created_since_x_mins;
      options["modified_since_x_mins"] = req.query.modified_since_x_mins;
      options["sync_status_id"] = req.query.sync_status_id;

      options["customer_name"] = req.query.customer_name;
      options["city_name"] = req.query.city_name;
      options["state_name"] = req.query.state_name;

      options["page_number"] = req.query.page_number;
      options["page_size"] = req.query.page_size;

      options["sortby"] = req.query.sort_by;
      options["sortorder"] = req.query.sort_direction;

      CompanyController.findAllCustomers(companyid, options, response.data.session, function (err, response) {
        if (err) return next(err);
        else if (req.query.format == "excel") {
          var customersData = response.data.customerlist;
          try {
            var workbook = new Excel.Workbook();
            var worksheet = workbook.addWorksheet("Customers");

            worksheet.columns = [
              { header: "Code", key: "code", width: 30 },
              { header: "Firm Name", key: "firm_name", width: 30 },
              { header: "First Name", key: "first_name", width: 15 },
              { header: "Last Name", key: "last_name", width: 30 },
              { header: "Accounting Name", key: "accounting_name", width: 30 },
              { header: "Address1", key: "address1", width: 30 },
              { header: "Address2", key: "address2", width: 15 },
              { header: "Address3", key: "address3", width: 30 },
              { header: "City", key: "city", width: 30 },
              { header: "State", key: "state", width: 30 },
              { header: "email", key: "email", width: 15 },
              { header: "Phone", key: "phone", width: 30 },
              { header: "Other Phone", key: "other_phone", width: 30 },

              { header: "Shipping Address1", key: "ship_address1", width: 30 },
              { header: "Shipping Address2", key: "ship_address2", width: 15 },
              { header: "Shipping Address3", key: "ship_address3", width: 30 },
              { header: "Shipping City", key: "ship_city", width: 30 },
              { header: "Shipping State", key: "ship_state", width: 30 },
              { header: "Shipping email", key: "ship_email", width: 15 },
              { header: "Shipping Phone", key: "ship_phone", width: 30 },
              { header: "Shipping Other Phone", key: "ship_other_phone", width: 30 },

              { header: "Billing Address1", key: "bill_address1", width: 30 },
              { header: "Billing Address2", key: "bill_address2", width: 15 },
              { header: "Billing Address3", key: "bill_address3", width: 30 },
              { header: "Billing City", key: "bill_city", width: 30 },
              { header: "Billing State", key: "bill_state", width: 30 },
              { header: "Billing email", key: "bill_email", width: 15 },
              { header: "Billing Phone", key: "bill_phone", width: 30 },
              { header: "Billing Other Phone", key: "bill_other_phone", width: 30 },

              { header: "Rate Category", key: "rate_category", width: 15 },
              { header: "Agent", key: "agent", width: 30 },
              { header: "Agent Code", key: "agent_code", width: 30 },
              { header: "Payment Term", key: "payment_term", width: 30 },
              { header: "Transporter", key: "transporter", width: 30 },
              { header: "GST Type", key: "gst_type", width: 30 },
              { header: "GST Number", key: "gst_number", width: 30 },
              { header: "Credit Limit", key: "credit_limit", width: 30 },
              { header: "Current Balance", key: "current_balance", width: 15 },
              { header: "Current Overdue", key: "current_overdue", width: 15 },
              { header: "PAN Number", key: "pan_number", width: 30 },
              { header: "Notes", key: "notes", width: 30 },
              { header: "Login Name", key: "login_name", width: 30 },
              { header: "Password", key: "password", width: 30 },
              { header: "Status", key: "status", width: 30 },
            ];

            for (var i = 0; i < customersData.length; i++) {
              worksheet.addRow({
                code: customersData[i].code,
                firm_name: customersData[i].name,
                first_name: customersData[i].address.first_name,
                last_name: customersData[i].address.last_name,
                accounting_name: customersData[i].invoicing_name,

                address1: customersData[i].address.address1,
                address2: customersData[i].address.address2,
                address3: customersData[i].address.address3,
                city: customersData[i].address.city,
                state: customersData[i].address.state,
                phone: customersData[i].address.phone1,
                email: customersData[i].address.email1,
                other_phone: customersData[i].address.phone2,

                ship_address1: customersData[i].ship_address.address1,
                ship_address2: customersData[i].ship_address.address2,
                ship_address3: customersData[i].ship_address.address3,
                ship_city: customersData[i].ship_address.city,
                ship_state: customersData[i].ship_address.state,
                ship_phone: customersData[i].ship_address.phone1,
                ship_email: customersData[i].ship_address.email1,
                ship_other_phone: customersData[i].ship_address.phone2,

                bill_address1: customersData[i].bill_address.address1,
                bill_address2: customersData[i].bill_address.address2,
                bill_address3: customersData[i].bill_address.address3,
                bill_city: customersData[i].bill_address.city,
                bill_state: customersData[i].bill_address.state,
                bill_phone: customersData[i].bill_address.phone1,
                bill_email: customersData[i].bill_address.email1,
                bill_other_phone: customersData[i].bill_address.phone2,

                rate_category: customersData[i].custom_type_name,
                agent: customersData[i].agent.name,
                agent_code: customersData[i].agent.code,
                payment_term: customersData[i].payment_term.description,
                transporter: customersData[i].transporter.name,
                gst_type: customersData[i].gst_registration_type,
                gst_number: customersData[i].gst_number,
                credit_limit: customersData[i].allowed_balance,
                current_balance: customersData[i].current_balance,
                current_overdue: customersData[i].current_overdue,
                pan_number: customersData[i].pan_number,
                notes: customersData[i].notes,
                login_name: customersData[i].user.login_name,
                password: customersData[i].user.password,
                status: customersData[i].status_id == "4600" ? "Active" : "Disabled",
              });
            }

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=" + "Customers.xlsx");
            workbook.xlsx.write(res).then(function (data) {
              res.end();
            });
          } catch (err) {
            console.error(err);
          }
        } else if (req.query.format == "pdf") {
        } else return res.json(response);
      });
    }
  });
}

function findCustomerById(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    CompanyController.findCustomerById(req.params.id, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function createCustomer(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    //company.code = Util.randomString(32);
    // save the company and check for errors
    CompanyController.createCustomer(req.body.customer, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function updateCustomer(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    //company.code = Util.randomString(32);
    // save the company and check for errors
    CompanyController.updateCustomer(req.body.customer, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function deleteCustomer(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    CompanyController.deleteCustomer(req.params.id, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function updateCustomerBalance(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    //company.code = Util.randomString(32);
    // save the company and check for errors
    CompanyController.updateCustomerBalance(req.body, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function updateCustomerData(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    // save the company and check for errors
    CompanyController.updateCustomerData(companyid, req.params.id, req.body, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });

    //      //company.code = Util.randomString(32);
    //      // save the company and check for errors
    //      CompanyController.updateCustomer(
    //      	req.body.customer,
    //      	companyid,
    //      	response.data.session,
    // function(err, response) {
    // 	if (err)
    // 		return next(err);
    // 	else
    // 		return res.json(response);
    //      });
  });
}

function findAllAgents(req, res, next) {
  var sid = Util.readSID(req);
  console.log("This is backend",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
  console.log("Hi");
  console.log("starting timer....");

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    var options = {};
    options.salespersonid = req.query.salesperson_id;
    options.statusid = req.query.status_id;
    options["search_text"] = req.query.search_text;
    options["sortby"] = req.query.sort_by;
    options["sortorder"] = req.query.sort_direction;

    CompanyController.findAllAgents(companyid, options, response.data.session, function (err, response) {
      if (err) return next(err);
      else if (req.query.format == "excel") {
        var agentsData = response.data.agentlist;
        var workbook = new Excel.Workbook();
        var worksheet = workbook.addWorksheet("Agents");

        worksheet.columns = [
          { header: "Code", key: "code", width: 30 },
          { header: "Firm Name", key: "firm_name", width: 30 },
          { header: "First Name", key: "first_name", width: 15 },
          { header: "Last Name", key: "last_name", width: 30 },
          { header: "Accounting Name", key: "accounting_name", width: 30 },
          { header: "Address1", key: "address1", width: 30 },
          { header: "Address2", key: "address2", width: 15 },
          { header: "Address3", key: "address3", width: 30 },
          { header: "City", key: "city", width: 30 },
          { header: "State", key: "state", width: 30 },
          { header: "email", key: "email", width: 15 },
          { header: "Phone", key: "phone", width: 30 },
          { header: "Other Phone", key: "other_phone", width: 30 },
          { header: "Commission", key: "commission", width: 15 },
          { header: "Sales Person Name", key: "sp_name", width: 30 },
          { header: "Sales Person Login Name", key: "sp_login_name", width: 30 },
          { header: "Login Name", key: "login_name", width: 30 },
          { header: "Password", key: "password", width: 30 },
          { header: "Status", key: "status", width: 30 },
        ];

        for (var i = 0; i < agentsData.length; i++) {
          worksheet.addRow({
            code: agentsData[i].code,
            firm_name: agentsData[i].name,
            first_name: agentsData[i].address.first_name,
            last_name: agentsData[i].address.last_name,
            accounting_name: agentsData[i].accounting_name,
            address1: agentsData[i].address.address1,
            address2: agentsData[i].address.address2,
            address3: agentsData[i].address.address3,
            city: agentsData[i].address.city,
            state: agentsData[i].address.state,
            email: agentsData[i].address.email1,
            phone: agentsData[i].address.phone1,
            other_phone: agentsData[i].address.phone2,
            commission: agentsData[i].commission,
            sp_name: agentsData[i].sales_person.first_name + " " + agentsData[i].sales_person.last_name,
            sp_login_name: agentsData[i].sales_person.login_name,
            login_name: agentsData[i].user.login_name,
            password: "",
            status: agentsData[i].status_id == 4600 ? "Active" : "Inactive",
          });
        }

        // console.log(moment());
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=" + "Agents.xlsx");
        workbook.xlsx.write(res).then(function (data) {
          res.end();
        });
	} else if (req.query.format == "pdf") {
	} else {
		console.log("json data is sent to UI",moment().format("MM-DD-YYYY hh:mm:ss SSS"));
		return res.json(response);
	}
    });
  });
}

function exportAgents(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    var options = {};
    options.salespersonid = req.query.salesperson_id;
    options.statusid = req.query.status_id;

    options["sortby"] = req.query.sort_by;
    options["sortorder"] = req.query.sort_direction;

    CompanyController.findAllAgents(companyid, options, response.data.session, function (err, response) {
      if (err) return next(err);
      else {
        var agentsData = response.data.agentlist;
        if (req.query.format == "excel") {
          var workbook = new Excel.Workbook();
          var worksheet = workbook.addWorksheet("Agents");

          worksheet.columns = [
            { header: "Name", key: "name", width: 30 },
            { header: "City", key: "city", width: 30 },
            { header: "Phone", key: "phone", width: 15 },
            { header: "Email", key: "email", width: 30 },
            { header: "SalesPerson", key: "sales_person", width: 30 },
          ];

          for (var i = 0; i < agentsData.length; i++) {
            worksheet.addRow({
              name: agentsData[i].name,
              city: agentsData[i].address.city,
              phone: agentsData[i].address.phone1,
              email: agentsData[i].address.email1,
              sales_person: agentsData[i].sales_person.first_name + " " + agentsData[i].sales_person.last_name,
            });
          }

          res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          res.setHeader("Content-Disposition", "attachment; filename=" + "Agents.xlsx");
          workbook.xlsx.write(res).then(function (data) {
            res.end();
          });
        } else if (req.query.format == "pdf") {
        }
      }
    });
  });
}

function findAgentById(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    CompanyController.findAgentById(req.params.id, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function createAgent(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    //company.code = Util.randomString(32);
    // save the company and check for errors
    CompanyController.createAgent(req.body.agent, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function updateAgent(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    //company.code = Util.randomString(32);
    // save the company and check for errors
    CompanyController.updateAgent(req.body.agent, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function deleteAgent(req, res, next) {
  var sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    var companyid = response.data.session.company_id;

    CompanyController.deleteAgent(req.params.id, companyid, response.data.session, function (err, response) {
      if (err) return next(err);
      else return res.json(response);
    });
  });
}

function uploadAgentFile(req, res, next) {
  let sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    let companyid = response.data.session.company_id;

    var form = new formidable.IncomingForm();

    form.parse(req);

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    form.on("error", function (err) {
      return next(err);
    });

    form.on("fileBegin", function (name, file) {
      let path = require("path");
      let extension = path.extname(file.name);
      file.path = (config.ST_UPLOAD_LOCATION || "/tmp") + "/" + Util.randomString(16) + extension;
    });

    form.on("aborted", function (err) {
      try {
        fs.unlinkSync(file.path);
        //file removed
      } catch (err) {
        console.error(err);
      }
      return next(err);
    });

    form.on("file", function (field, file) {
      let validHeaderList = getAgentValidHeaderList();

      let excelReader = new ExcelReader();
      excelReader.parseFile(file.path, validHeaderList, function (err, dataList) {
        if (err) return res.json(err);

        CompanyController.uploadAgent(companyid, dataList, response.data.session, function (err, response) {
          if (err) return next(err);
          else return res.json(response);
        });
        try {
          fs.unlinkSync(file.path);
          //file removed
        } catch (err) {
          console.error(err);
        }
      });
    });
  });
}

function uploadCustomerFile(req, res, next) {
  let sid = Util.readSID(req);

  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    let companyid = response.data.session.company_id;

    var form = new formidable.IncomingForm();

    form.parse(req);

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    form.on("error", function (err) {
      return next(err);
    });

    form.on("fileBegin", function (name, file) {
      let path = require("path");
      let extension = path.extname(file.name);
      file.path = (config.ST_UPLOAD_LOCATION || "/tmp") + "/" + Util.randomString(16) + extension;
    });

    form.on("aborted", function (err) {
      try {
        fs.unlinkSync(file.path);
        //file removed
      } catch (err) {
        console.error(err);
      }
      return next(err);
    });

    form.on("file", function (field, file) {
      let validHeaderList = getCustomerValidHeaderList();

      let excelReader = new ExcelReader();
      excelReader.parseFile(file.path, validHeaderList, function (err, dataList) {
        if (err) return res.json(err);

        CompanyController.uploadCustomer(companyid, dataList, response.data.session, function (err, response) {
          if (err) return next(err);
          else return res.json(response);
        });
        try {
          fs.unlinkSync(file.path);
          //file removed
        } catch (err) {
          console.error(err);
        }
      });
    });
  });
}

function getAgentValidHeaderList() {
  let validHeaderList = [];
  validHeaderList.push({
    name: "Code",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Name",
    type: "string",
    length: 232,
  });

  validHeaderList.push({
    name: "Accounting Name",
    type: "string",
    length: 232,
  });

  validHeaderList.push({
    name: "Address1",
    type: "string",
    length: 128,
  });

  validHeaderList.push({
    name: "Address2",
    type: "string",
    length: 128,
  });

  validHeaderList.push({
    name: "Address3",
    type: "string",
    length: 128,
  });

  validHeaderList.push({
    name: "City",
    type: "string",
    length: 128,
  });

  validHeaderList.push({
    name: "State",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "PinCode",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Email",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Phone",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Commission",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Sales Person",
    type: "string",
    length: 32,
  });

  return validHeaderList;
}

function getCustomerValidHeaderList() {
  let validHeaderList = [];
  validHeaderList.push({
    name: "Code",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Name",
    type: "string",
    length: 232,
  });

  validHeaderList.push({
    name: "Address1",
    type: "string",
    length: 128,
  });

  validHeaderList.push({
    name: "Address2",
    type: "string",
    length: 128,
  });

  validHeaderList.push({
    name: "Address3",
    type: "string",
    length: 128,
  });

  validHeaderList.push({
    name: "City",
    type: "string",
    length: 128,
  });

  validHeaderList.push({
    name: "State",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "PinCode",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Email",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Phone",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "GST Type",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "GST Number",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Customer Type",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "Agent Code",
    type: "string",
    length: 32,
  });

  validHeaderList.push({
    name: "AgentID",
    type: "string",
    length: 32,
  });

  return validHeaderList;
}

function listCompanies(req, res, next) {
  var sid = Util.readSID(req);
  SessionController.validate(sid, function (err, response) {
    if (err) return next(err);

    if (!(response.statuscode === 0 && response.data.session.company_id)) return res.json(response);

    if (response.data.session.sessiontype != Util.SessionTypesEnum.API && response.data.session.company_id != 1) return res.json(Util.setErrorResponse(-100, "Invalid Access"));

    if (req.params.company_id) {
      CompanyController.findById(req.params.company_id, function (err, company) {
        if (err) res.send(err);

        return res.json(company);
      });
    }
  });
}
/*
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
