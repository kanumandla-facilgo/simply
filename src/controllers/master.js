var MasterService     = require("../services/master");
var Util              = require("../utils");
var Transporter       = require("../bo/transporter");
var Address           = require("../bo/address");
var PaymentTerm       = require("../bo/payment_term");
var Tempo             = require("../bo/tempo");
var CompanyType       = require("../bo/company_type");
var Bill           = require("../bo/bill");
var CustomFilter       = require("../bo/custom_filter");
var Err               = require("../bo/err");
var mysql             = require("../utils/mysql");
var async = require('async');
var Event     = require("../bo/event");

var findTransporterById = function (id, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_TRANSPORTER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_TRANSPORTER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Transporter ID and Company ID are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findTransporterById(id, companyid, session, connection, function (err, transporter) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!transporter)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Transporter not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(transporter, "Transporter"));
			}  
		});

	});
 
};

var findHsnById = function (id, companyid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findHsnById(id, companyid, session, connection, function (err, hsn) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!hsn)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "HSN not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(hsn, "hsn"));
			}  
		});

	});
 
};

var findAllHsn = function (companyid, options, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllHsn(companyid, options, session, connection, function (err, hsnlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!hsnlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "HSN not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(hsnlist, "hsn"));
			}  
       });
    });
 
};

var createHsn = function (hsn, companyid, session, callback) {

	if (session.user.sys_role_id != 4000) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Invalid logged in user.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		connection.beginTransaction( () => {

			MasterService.createHsn(hsn, session, connection, function (err, hsn) {

				if (err) {
					mysql.closeConnection(connection);
					return callback(err);
				}

				if (!hsn)
				{
					mysql.closeConnection(connection);
					let response = Util.setErrorResponse(-100, "HSN not found.");
					return callback(err, response);
				} 
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(hsn, "hsn"));
					});
				}  
	       });

		});

    });

};

var updateHsn = function (hsn, companyid, session, callback) {

	if (session.user.sys_role_id != 4000) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Invalid logged in user.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		connection.beginTransaction( () => {

			MasterService.updateHsn(hsn, session, connection, function (err, hsn) {

				if (err) {
					mysql.closeConnection(connection);
					return callback(err);
				}

				if (!hsn)
				{
					mysql.closeConnection(connection);
					var response = Util.setErrorResponse(-100, "HSN not found.");
					return callback(err, response);
				} 
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(hsn, "hsn"));
					});
				}  
	       });

		});

    });

};

var deleteHsn = function (id, companyid, session, callback) {

	if (session.user.sys_role_id != 4000) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Invalid logged in user.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		connection.beginTransaction( () => {

			MasterService.deleteHsn(id, session, connection, function (err, flag) {

				if (err) {
					mysql.closeConnection(connection);
					return callback(err);
				}

				if (!flag)
				{
					mysql.closeConnection(connection);
					var response = Util.setErrorResponse(-100, "HSN not found.");
					return callback(err, response);
				} 
				else {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(flag, "success"));
					});
				}  
	       });

		});

    });

};

var findAllBills = function (companyid, options, session, callback) {
	
	if (session.permissionlist[Util.CONST_PERMISSION_BILL_VIEW] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllBills(companyid, options, session, connection, function (err, billlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!billlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Bill not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(billlist, "Bill"));
			}  
       });
    });

};

var findBillById = function (billid, companyid, session, callback) {
	
	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findBillById(billid, companyid, session, connection, function (err, bill) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!bill)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Bill not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(bill, "bill"));
			}  
       });
    });

};

var findAllNotifications = function (companyid, options, session, callback) {
	
	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllNotifications(companyid, options, session, connection, function (err, notlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!notlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Notifications not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(notlist, "Notification"));
			}  
       });
    });

};

var createCustomerBills = function (companyid, billList, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] != "1")
	{
		var err     = new Err();
		err.code    = "-15002";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.createCustomerBills(companyid, billList, session, connection, function (err, responseList) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (responseList === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating customer.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						for(let j = 0;j < responseList.length; j++) {
							let paidList = responseList[0].bill_list.filter(x => x.status == Util.CONST_PAYMENT_STATUS_PAID);							
							for (let i = 0; i < paidList.length; i++)
							{
								var event = new Event();
								event.user_id = session.user.id;
								event.document_id = paidList[0].id;
								Util.getEventManager().fireEvent(Util.EventTypeEnum.PaymentThankYou, event);
							}	
						}
						return callback(err, Util.setOKResponse(responseList, "Status"));
					});
				}
			});

		});
		
	});
	
};

var updateCustomerBills = function (companyid, guid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] != "1")
	{
		var err     = new Err();
		err.code    = "-15002";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.updateCustomerBills(companyid, guid, session, connection, function (err, responseList) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (responseList === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating customer.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(responseList, "Status"));
					});
				}
			});

		});
		
	});
	
};

var createBill = function (companyid, bill, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] != "1")
	{
		var err     = new Err();
		err.code    = "-15002";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.createBill(companyid, bill, session, connection, function (err, responseList) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (responseList === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating bill.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(bill, "Bill"));
					});
				}
			});

		});
		
	});
	
};

var updateBill = function (companyid, bill, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] != "1")
	{
		var err     = new Err();
		err.code    = "-15002";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.updateBill(companyid, bill, session, connection, function (err, responseList) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (responseList === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error updating bill.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);

						if(bill.old_status_id) {
							if(bill.old_status_id != Util.CONST_PAYMENT_STATUS_PAID && bill.status_id == Util.CONST_PAYMENT_STATUS_PAID)
							{
								var event = new Event();
								event.user_id = session.user.id;
								event.document_id = bill.id;
								Util.getEventManager().fireEvent(Util.EventTypeEnum.PaymentThankYou, event);
							}
						}
						return callback(err, Util.setOKResponse(bill, "Bill"));
					});
				}
			});

		});
		
	});
	
};

var updateNotification = function (id, status_id, callback) {

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.updateNotification(id, status_id, connection, function (err, responseList) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (responseList === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error updating notification.");
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(id, "Notification"));
					});
				}
			});
		});
		
	});
	
};

var findTaxSlabById = function (id, companyid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findTaxSlabById(id, companyid, session, connection, function (err, taxSlab) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!taxSlab)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Tax slab not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(taxSlab, "taxslab"));
			}  
		});

	});
 
};

var findAllTaxSlabs = function (companyid, options, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllTaxSlabs(companyid, options, session, connection, function (err, taxslablist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!taxslablist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Tax slab not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(taxslablist, "taxslab"));
			}  
       });
    });
 
};

var findTaxByProductId = function (companyid, productid, options, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(productid)) {

		var err     = new Err();
		err.code    = "-5002";
		err.message = "Product ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findTaxByProductId(companyid, productid, options, session, connection, function (err, tax) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!tax)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Tax not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(tax, "tax"));
			}  
       });
    });
 
};

var findTaxByDeliveryId = function (companyid, deliveryid, options, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(deliveryid)) {

		var err     = new Err();
		err.code    = "-5002";
		err.message = "Delivery ID is required field.";
		return callback(err);

	}
	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findTaxByDeliveryId(companyid, deliveryid, options, session, connection, function (err, taxlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!taxlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-101, "Tax not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(taxlist, "tax"));
			}  
       });
    });
 
};

var findUnitOfMeasureById = function (id, companyid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	if (Util.isEmptyString(id)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findUnitOfMeasureById(id, companyid, session, connection, function (err, uom) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!uom)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Unit of measure not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(uom, "UOM"));
			}  
		});

	});
 
};

var findAllUnitOfMeasures = function (companyid, options, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllUnitOfMeasures(companyid, options, session, connection, function (err, uomlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!uomlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Unit of measures not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(uomlist, "UOM"));
			}  
       });
    });
 
};

var createUnitOfMeasure = function (uom, companyid, session, callback) {
	
	if (session.permissionlist[Util.CONST_PERMISSION_UNIT_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
	
	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.createUnitOfMeasure(uom, companyid, session, connection, function (err, uom) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!uom)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Unit of measures not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(uom, "UOM"));
			}  
       });
    });
 
};


var updateUnitOfMeasure = function (uom, companyid, session, callback) {
	
	if (session.permissionlist[Util.CONST_PERMISSION_UNIT_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.updateUnitOfMeasure(uom, companyid, session, connection, function (err, uom) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!uom)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Unit of measures not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(uom, "UOM"));
			}  
       });
    });
 
};

var findUnitConversions = function(companyid, baseid, fromid, toid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findUnitConversions(companyid, baseid, fromid, toid, session, connection, function (err, conversionlist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!conversionlist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Unit conversions not found.");
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(conversionlist, "UOMConversion"));
			}  
       });
    });

};

var findAllTransporters = function (companyid, options, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_TRANSPORTER_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_TRANSPORTER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllTransporters(companyid, options, session, connection, function (err, transporters) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!transporters)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Transporter not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(transporters, "Transporter"));
			}  
       });
    });
 
};


var uploadTransporter = function(entityid, list, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_TRANSPORTER_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	let newTransporterList = [];
	let errorList = [];
	let lineNumber = 1;
	let options = {};
	options.code = '';

	mysql.openConnection (function (err, connection) {
		if (err) return callback (err);
		MasterService.findAllTransporters(entityid, options, session, connection, function (err, vxTransporterList) {
			async.eachSeries(list, function iterator(obj, incb) {

				lineNumber ++;

				let tempObject = {};
				tempObject.transporter = {};
				tempObject.transporter.code = ((obj['Code']==undefined || obj['Code']=='') ? '' : obj['Code']);
				tempObject.transporter.name = ((obj['Name']==undefined || obj['Name']=='') ? '' : obj['Name']);
				tempObject.transporter.external_code = ((obj['Accounting Name']==undefined || obj['Accounting Name']=='') ? '' : obj['Accounting Name']);
				
				tempObject.transporter.address = {};
				tempObject.transporter.address.first_name = ((obj['Name']==undefined || obj['Name']=='') ? '' : obj['Name']);
				tempObject.transporter.address.last_name = '';
				tempObject.transporter.address.address1 = ((obj['Address1']==undefined || obj['Address1']=='') ? '' : obj['Address1']);
				tempObject.transporter.address.city = ((obj['City']==undefined || obj['City']=='') ? '' : obj['City']);
				tempObject.transporter.address.state = ((obj['State']==undefined || obj['State']=='') ? '' : obj['State']);
				tempObject.transporter.address.zip = ((obj['PinCode']==undefined || obj['PinCode']=='') ? '' : obj['PinCode']);
				tempObject.transporter.address.email1 = ((obj['Email']==undefined || obj['Email']=='') ? '' : obj['Email']);
				tempObject.transporter.address.phone1 = ((obj['Phone']==undefined || obj['Phone']=='') ? '' : obj['Phone']);

				
				if(tempObject.transporter.code.trim() == '' && session.configurationlist[Util.CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD] == "1")
				{
					newCustomerList.push({"line_number": lineNumber, "transporter_name": tempObject.transporter.name, "transporter_code": tempObject.transporter.code, "status": "-1", "info": "{\"message\":\"Transporter code cannot be empty\"}"});
					incb(null);
				}
				else
				{
					let existingTransporter = vxTransporterList.filter(x=>x.code == tempObject.transporter.code.toUpperCase())[0];
					if(existingTransporter == undefined)
					{
						MasterService.createTransporter(tempObject.transporter, entityid, session, connection, function (err, transporter) {
							if(err)
								newTransporterList.push({"line_number": lineNumber,"transporter_name": tempObject.transporter.name, "transporter_code": tempObject.transporter.code, "status": "-1", "info": err});
							else
								newTransporterList.push({"line_number": lineNumber, "status": "0", "transporter_name": tempObject.transporter.name, "transporter_code": tempObject.transporter.code});
							incb(null);					
						});
					}
					else {	
							let addressid = existingTransporter.address.id;						
							existingTransporter.address = tempObject.transporter.address;
							existingTransporter.address.id = addressid;
							existingTransporter.govt_code = tempObject.transporter.external_code;
							existingTransporter.code = tempObject.transporter.code;
							existingTransporter.name = tempObject.transporter.name;

							MasterService.updateTransporter(existingTransporter, entityid, session,connection, function(err,  newTransporter){
							if(err)
								newTransporterList.push({"line_number": lineNumber,"transporter_name": tempObject.transporter.name, "transporter_code": tempObject.transporter.code, "status": "-1", "info": err});
							else
								newTransporterList.push({"line_number": lineNumber, "status": "0", "transporter_name": tempObject.transporter.name, "transporter_code": tempObject.transporter.code});
								incb(null);
							});
						
					}
				}		

			}, function (err) {

				if (err) return callback(err);
				if (errorList.length > 0) {
					let err = errorList;
					return callback(err, []);
				}
				return callback(err, newTransporterList);
			});
		});
	});
}

var createTransporter = function (code, external_code, name, first_name, last_name, address1, address2, address3, city, state, zip, phone1, email1, phone2, email2, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_TRANSPORTER_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	//TODO: validation

	var xTransporter        = new Transporter();

	xTransporter.name        = Util.getValue(name, "");
	xTransporter.code        = Util.getValue(code, ""); 
	xTransporter.external_code = Util.getValue(external_code, "");
	
	var address = new Address();

	address.first_name = Util.getValue(first_name, "");
	address.last_name = Util.getValue(last_name, "");
	address.address1 = Util.getValue(address1, "");
	address.address2 = Util.getValue(address2, "");
	address.address3 = Util.getValue(address3, "");
	address.city     = Util.getValue(city, "");
	address.state    = Util.getValue(state, "");
	address.zip      = Util.getValue(zip, "");
	address.phone1   = Util.getValue(phone1, "");
	address.email1   = Util.getValue(email1, "");
	address.phone2   = Util.getValue(phone2, "");
	address.email2   = Util.getValue(email2, "");

	xTransporter.address = address;

	if ( ( Util.isEmptyString(xTransporter.code) && session.configurationlist[Util.CONST_CONFIG_COMPANY_TRANSPORTER_CODE_REQD] == "1") || Util.isEmptyString(xTransporter.name) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Transporter code and name are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.createTransporter(xTransporter, companyid, session, connection, function (err, transporter) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (transporter === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating transporter."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(transporter, "Transporter"));
					});
				}
			});

		});
		
	});
	
};


var updateTransporter = function (id, code, external_code, name, statusid, first_name, last_name, address1, address2, address3, city, state, zip, phone1, email1, phone2, email2, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_TRANSPORTER_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	//TODO: validation

	var xTransporter        = new Transporter();

	xTransporter.name        = Util.getValue(name, "");
	xTransporter.code        = Util.getValue(code, ""); 
	xTransporter.external_code = Util.getValue(external_code, "");
	xTransporter.id          = id;
	xTransporter.status_id   = Util.getValue(statusid, -1);

	var address = new Address();

	address.first_name = Util.getValue(first_name, "");
	address.last_name = Util.getValue(last_name, "");
	address.address1 = Util.getValue(address1, "");
	address.address2 = Util.getValue(address2, "");
	address.address3 = Util.getValue(address3, "");
	address.city     = Util.getValue(city, "");
	address.state    = Util.getValue(state, "");
	address.zip      = Util.getValue(zip, "");
	address.phone1   = Util.getValue(phone1, "");
	address.email1   = Util.getValue(email1, "");
	address.phone2   = Util.getValue(phone2, "");
	address.email2   = Util.getValue(email2, "");

	xTransporter.address = address;
     
	if (Util.isEmptyString(xTransporter.code) || Util.isEmptyString(xTransporter.name) || Util.isEmptyString(companyid) || xTransporter.status_id == -1) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Transporter code, name and status are required fields.";
		return callback(err);

	}
   
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.updateTransporter(xTransporter, companyid, session, connection, function (err, transporter) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (transporter === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating transporter."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(transporter, "Transporter"));
					});
				}
			});

		});
		
	});
	
};

var findPaymentTermById = function (id, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PAYMENTTERM_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PAYMENTTERM_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Payment ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findPaymentTermById(id, companyid, session, connection, function (err, paymentTerm) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!paymentTerm)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "PaymentTerm not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(paymentTerm, "PaymentTerm"));
			}  
		});

	});
 
};

var findAllPaymentTerms = function (companyid, options, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PAYMENTTERM_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PAYMENTTERM_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllPaymentTerms(companyid, options, session, connection, function (err, paymentTerms) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!paymentTerms)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "PaymentTerm not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(paymentTerms, "PaymentTerm"));
			}  
       });
    });
 
};



var findAllTempos = function (companyid, session, callback) {

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllTempos(companyid, session, connection, function (err, tempos) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!tempos)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Tempo not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(tempos, "Tempo"));
			}  
       });
    });
 
};

var createPaymentTerm = function (code, description, days, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PAYMENTTERM_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	var xPaymentTerm           = new PaymentTerm();

	xPaymentTerm.description   = Util.getValue(description, "");
	xPaymentTerm.code          = Util.getValue(code, ""); 
	xPaymentTerm.days          = Util.getValue(days, 0); 

	if (Util.isEmptyString(xPaymentTerm.code) || Util.isEmptyString(xPaymentTerm.description) || Util.isEmptyString(companyid) || xPaymentTerm.days < 0) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Payment term code, description and days are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.createPaymentTerm(xPaymentTerm, companyid, session, connection, function (err, PaymentTerm) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (PaymentTerm === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating PaymentTerm."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(PaymentTerm, "PaymentTerm"));
					});
				}
			});

		});
		
	});
	
};


var createTempo = function (company_name, driver_name, vehicle_number, companyid, session, callback) {

	var xTempo  = new Tempo();

	xTempo.company_name = Util.getValue(company_name, "");
	xTempo.driver_name = Util.getValue(driver_name, ""); 
	xTempo.vehicle_number = Util.getValue(vehicle_number, 0); 

	if (Util.isEmptyString(xTempo.company_name) || Util.isEmptyString(xTempo.driver_name) || Util.isEmptyString(xTempo.vehicle_number)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company name, driver name, vehicle number are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.createTempo(xTempo, companyid, session, connection, function (err, tempo) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (PaymentTerm === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating Tempo."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(tempo, "Tempo"));
					});
				}
			});

		});
		
	});
	
};


var updatePaymentTerm = function (id, code, description, statusid, days, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PAYMENTTERM_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	var xPaymentTerm          = new PaymentTerm();

	xPaymentTerm.description  = Util.getValue(description, "");
	xPaymentTerm.code         = Util.getValue(code, ""); 
	xPaymentTerm.id           = id;
	xPaymentTerm.status_id    = Util.getValue(statusid, -1);
	xPaymentTerm.days         = Util.getValue(days, 0); 

	if (Util.isEmptyString(xPaymentTerm.code) || Util.isEmptyString(xPaymentTerm.id) || Util.isEmptyString(xPaymentTerm.description) || Util.isEmptyString(companyid) || xPaymentTerm.days == 0 || xPaymentTerm.status_id == -1) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Payment term code, description and days are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.updatePaymentTerm(xPaymentTerm, companyid, session, connection, function (err, paymentTerm) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (paymentTerm === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating Payment Term."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(paymentTerm, "PaymentTerm"));
					});
				}
			});

		});
		
	});
	
};

var updateTempo = function (id, company_name, driver_name, vehicle_number, companyid, session, callback) {

	var xTempo  = new Tempo();
	xTempo.id = id;
	xTempo.company_name = Util.getValue(company_name, "");
	xTempo.driver_name = Util.getValue(driver_name, ""); 
	xTempo.vehicle_number = Util.getValue(vehicle_number, 0); 

	if (Util.isEmptyString(xTempo.company_name) || Util.isEmptyString(xTempo.driver_name) || Util.isEmptyString(xTempo.vehicle_number)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company name, driver name, vehicle number are required fields.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.updateTempo(xTempo, companyid, session, connection, function (err, tempo) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (tempo === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating Tempo."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(tempo, "Tempo"));
					});
				}
			});

		});
		
	});
	
};

var findCompanyTypeById = function (id, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMERTYPE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CUSTOMERTYPE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company type ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findCompanyTypeById(id, companyid, session, connection, function (err, companyType) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!companyType)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Company type not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(companyType, "CompanyType"));
			}  
		});

	});
 
};

var findAllCompanyTypes = function (companyid, options, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMERTYPE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_CUSTOMERTYPE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}
*/
	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
	
		if (err) return callback (err);

		MasterService.findAllCompanyTypes(companyid, options, session, connection, function (err, companyTypes) {

			if (err) {
				mysql.closeConnection(connection);
				return callback(err);
			}

			if (!companyTypes)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Customer types not found."); //new Status();
				return callback(err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(companyTypes, "CompanyType"));
			}  
       });
    });
 
};

var createCompanyType = function (name, description, balance, isdefault, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMERTYPE_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	//TODO: validation

	var xCompanyType          = new CompanyType();

	xCompanyType.description    = Util.getValue(description, "");
	xCompanyType.name           = Util.getValue(name, ""); 
	xCompanyType.balance_limit  = Util.getValue(balance, 0);
	xCompanyType.is_default     = Util.getValue(isdefault, 0);
	xCompanyType.company_id     = companyid;

	if (Util.isEmptyString(xCompanyType.name) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Name is a required field.";
		return callback(err);

	}
  
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.createCompanyType(xCompanyType, companyid, session, connection, function (err, companyType) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (companyType === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating Company Type."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(companyType, "CompanyType"));
					});
				}
			});

		});
		
	});
	
};

var createCustomFilter = function (name, value, is_user_defined, show_in_dashboard, document_type, session, callback) {

	var xCustomFilter = new CustomFilter();

	xCustomFilter.filters = Util.getValue(value, "");
	xCustomFilter.name = Util.getValue(name, ""); 
	xCustomFilter.show_in_dashboard = Util.getValue(show_in_dashboard, 0);
	xCustomFilter.is_user_defined = Util.getValue(is_user_defined, ""); 
	xCustomFilter.document_type  = Util.getValue(document_type, 0);

        
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.createCustomFilter(xCustomFilter, session, connection, function (err, customFilter) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (customFilter === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating custom filter."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(customFilter, "CustomFilter"));
					});
				}
			});

		});
		
	});
	
};

var updateCustomFilter = function (id, name, value, show_in_dashboard, companyid, session, callback) {

	var xCustomFilter = new CustomFilter();
	xCustomFilter.id = Util.getValue(id, "");
	xCustomFilter.filters = Util.getValue(value, "");
	xCustomFilter.name = Util.getValue(name, ""); 
	xCustomFilter.show_in_dashboard = Util.getValue(show_in_dashboard, ""); 
        
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.updateCustomFilter(xCustomFilter, companyid, session, connection, function (err, customFilter) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (customFilter === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating custom filter."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(customFilter, "CustomFilter"));
					});
				}
			});

		});
		
	});
	
};

var deleteCustomFilter = function (id, companyid, session, callback) {
 
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.deleteCustomFilter(id, companyid, session, connection, function (err, customFilter) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (customFilter === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating custom filter."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(customFilter, "CustomFilter"));
					});
				}
			});

		});
		
	});
	
};

var deleteUnitOfMeasure = function (id, companyid, session, callback) {

    if (session.permissionlist[Util.CONST_PERMISSION_UNIT_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Unit of measure ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.deleteUnitOfMeasure(id, companyid, session, connection, function (err, status) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					});
				}
				else if (!status) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Error deleting unit of measure."); //new Status();
						return callback(err, response);
					});
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(null, ""));
					});
				}
			});

		});
		
	});
	
};

var deletePaymentTerm = function (id, companyid, session, callback) {

    if (session.permissionlist[Util.CONST_PERMISSION_PAYMENTTERM_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Payment Term ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.deletePaymentTerm(id, companyid, session, connection, function (err, status) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					});
				}
				else if (!status) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Error deleting payment term."); //new Status();
						return callback(err, response);
					});
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(null, ""));
					});
				}
			});

		});
		
	});
	
};


var deleteCompanyType = function (id, companyid, session, callback) {

    if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMERTYPE_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Rate category ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.deleteCompanyType(id, companyid, session, connection, function (err, status) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (!status) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error deleting customer type."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(null, ""));
					});
				}
			});

		});
		
	});
	
};


var deleteTransporter = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_TRANSPORTER_DELETE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Transporter ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.deleteTransporter(id, companyid, session, connection, function (err, status) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (err);
					});
				}
				else if (!status) {
					mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setErrorResponse(-100, "Error deleting transporter."); //new Status();
						return callback(err, response);
					});
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(null, ""));
					});
				}
			});

		});
		
	});
	
};

var updateCompanyType = function (id, name, description, balance, isdefault, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_CUSTOMERTYPE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	var xCompanyType          = new CompanyType();

	xCompanyType.description    = Util.getValue(description, "");
	xCompanyType.name           = Util.getValue(name, ""); 
	xCompanyType.id             = id;
	xCompanyType.balance_limit  = Util.getValue(balance, 0);
	xCompanyType.company_id     = companyid;
	xCompanyType.is_default     = Util.getValue(isdefault, 0);

	if (Util.isEmptyString(xCompanyType.name) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Name is a required field.";
		return callback(err);

	}
        
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.updateCompanyType(xCompanyType, companyid, session, connection, function (err, companyType) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (companyType === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error creating customer type."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(companyType, "CompanyType"));
					});
				}
			});

		});
		
	});
	
};

var findAllCustomFilters = function (companyid, options, session, callback) {

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.findAllCustomFilters(companyid, options, session, connection, function (err, customFilters) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (customFilters === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error retrieving custom filters."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, Util.setOKResponse(customFilters, "CustomFilters"));
					});
				}
			});

		});
		
	});
	
};

var findCustomFilterByID = function (id, accessed_from, companyid, session, callback) {

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
		
			MasterService.findCustomFilterByID(id, companyid, session, connection, function (err, customFilter) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (customFilter === null) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							var response = Util.setErrorResponse(-100, "Error retrieving custom filter."); //new Status();
							return callback(err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						MasterService.updateCustomFilterCounter(id, accessed_from, session, connection, function(err){});
						return callback(err, Util.setOKResponse(customFilter, "CustomFilter"));
					});
				}
			});

		});
		
	});
	
};


module.exports = {

	findTransporterById              : findTransporterById,
	findAllTransporters              : findAllTransporters,
	createTransporter                : createTransporter,
	updateTransporter                : updateTransporter,
	uploadTransporter				 : uploadTransporter,

	findPaymentTermById              : findPaymentTermById,
	findAllPaymentTerms              : findAllPaymentTerms,
	createPaymentTerm                : createPaymentTerm,
	updatePaymentTerm                : updatePaymentTerm,

	findCompanyTypeById              : findCompanyTypeById,
	findAllCompanyTypes              : findAllCompanyTypes,
	createCompanyType                : createCompanyType,
	updateCompanyType                : updateCompanyType,
	
	findAllUnitOfMeasures            : findAllUnitOfMeasures,
	findUnitOfMeasureById            : findUnitOfMeasureById,
	createUnitOfMeasure              : createUnitOfMeasure,
	updateUnitOfMeasure              : updateUnitOfMeasure,
	findUnitConversions              : findUnitConversions,

	findTaxByProductId               : findTaxByProductId,
	findTaxByDeliveryId              : findTaxByDeliveryId,
	
	findTaxSlabById                  : findTaxSlabById,
	findAllTaxSlabs                  : findAllTaxSlabs,

	findAllHsn                       : findAllHsn,
	findHsnById                      : findHsnById,
	createHsn                        : createHsn,
	updateHsn                        : updateHsn,
	deleteHsn                        : deleteHsn,

	findAllBills					 : findAllBills,
	findBillById					 : findBillById,

	findAllNotifications			 : findAllNotifications,
	createCustomerBills              : createCustomerBills,
	updateCustomerBills  			 : updateCustomerBills,	
	createBill              		 : createBill,
	updateBill              		 : updateBill,
	createCustomFilter				 : createCustomFilter,
	updateCustomFilter				 : updateCustomFilter,
	findAllCustomFilters 			 : findAllCustomFilters,
	findCustomFilterByID 			 : findCustomFilterByID,	
	deleteCustomFilter 	 			 : deleteCustomFilter,
	updateNotification				 : updateNotification,
	createTempo						 : createTempo,
	updateTempo						 : updateTempo,
	findAllTempos					 : findAllTempos,

	deleteCompanyType 				 : deleteCompanyType,
	deleteTransporter 				 : deleteTransporter,
	deletePaymentTerm 				 : deletePaymentTerm,
	deleteUnitOfMeasure 			 : deleteUnitOfMeasure

};


