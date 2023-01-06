var OrderService      = require("../services/order");
var Util              = require("../utils");
//var Order           = require("../bo/order");
var Err               = require("../bo/err");
var Event     = require("../bo/event");
var mysql             = require("../utils/mysql");

var findById = function (id, detail, companyid, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
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
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);
		if(detail != 1)
		{
			connection.beginTransaction(function () {
				OrderService.findById(id, companyid, session, connection, function (err, order) {
					if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							console.error("Find order error " +  id);
							console.error(order);
							return callback (err);
						});
					}
					else if (!order)
					{
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						var response = Util.setErrorResponse(-100, "Order not found."); //new Status();
						return callback (err, response);
					} 
					else {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, Util.setOKResponse(order, "Order"));
					} 
				});
			});
		}
		else
		{
			connection.beginTransaction(function () {
				OrderService.getDetailedOrder(id, companyid, session, connection, function (err, order) {
					if (err) {
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						});
					}
					else if (!order)
					{
						mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						var response = Util.setErrorResponse(-100, "Order not found."); //new Status();
						return callback (err, response);
					} 
					else {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
						});
						return callback(err, Util.setOKResponse(order, "Order"));
					} 
				});
			});
		}

    });

};

var printOrder = function (id, companyid, session, callback) {

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.printOrder(id, companyid, session, connection, function (err, stream) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!stream)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Order not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(null, stream); 
			}  

		});

    });

};

var printPackingSlip = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.printPackingSlip(id, companyid, session, connection, function (err, stream) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!stream)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Packing Slip not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(null, stream); 
			}  

		});

    });

};

var printGatePass = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.printGatePass(id, companyid, session, connection, function (err, stream) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!stream)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Gate Pass not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(null, stream); 
			}  

		});

    });

};

var getDetailDeliveryNote = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.getDetailedDeliveryNote(id, companyid, session, connection, function (err, stream) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!stream)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Delivery note not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(null, stream); 
			}  

		});

    });

};

var printDeliveryNote = function (id, companyid, offsetLines, showTotals, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.printDeliveryNote(id, companyid, offsetLines, showTotals, session, connection, function (err, stream) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!stream)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Delivery note not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(null, stream); 
			}  

		});

    });

};

var findAllPackingslips = function (companyid, options, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.findAllPackingslips(companyid, options, session, connection, function (err, packingslips) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!packingslips)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Packing Slip not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(packingslips, "PackingSlip"));
			}  

		});

    });

};

var findPackingslipsByOrderid = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}
	
	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.findPackingslipsByOrderid(id, companyid, session, connection, function (err, packingslipdetail) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!packingslipdetail)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Packingslip not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(packingslipdetail, "Order"));
			}  

		});

    });

};

var findPackingslipById = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.findPackingslipById(id, companyid, session, connection, function (err, packingslip) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!packingslip)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Packing Slip not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(packingslip, "PackingSlip"));
			}  

		});

    });

};

var getPackingSlipDetail = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.getPackingSlipDetail(id, companyid, session, connection, function (err, packingslip) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!packingslip)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Packing Slip not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(packingslip, "PackingSlip"));
			}  

		});

    });

};

var findAll = function (companyid, options, currentpage,recordsperpage, session, callback) {
/*
	if (session.permissionlist[Util.CONST_PERMISSION_PRODUCT_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_PRODUCT_UPDATE] != "1")
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

		OrderService.findAll(companyid, options, currentpage, recordsperpage, session, connection, function (err, orders) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!orders)
			{
				orders = [];
				mysql.closeConnection(connection);
				var response = Util.setOKResponse(orders, "Order");
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(orders, "Order"));
			}  

		});

    });

};

var create = function (companyid, order, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_ORDER_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			OrderService.create(companyid, order, session, connection, function (err, order) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (order == null) {
					var response = Util.setErrorResponse(-100, "Order not found."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var event = new Event();
						event.user_id = session.user.id;
						event.document_id = order.id;
						Util.getEventManager().fireEvent(Util.EventTypeEnum.OrderCreate, event);

						var response = Util.setOKResponse(order, "Order");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var cancelOrder = function (companyid, orderid, session, callback) {

	// Permission check: Check will be at detail level as creator of the order will be compared with logged in user.

	mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			OrderService.cancelOrder(companyid, orderid, session, connection, function (err, flag) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (flag == null) {
					var response = Util.setErrorResponse(-101, "Error cancelling order.");
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(flag, "result");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var createPackingSlip = function (companyid, xPackingSlip, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			OrderService.createPackingSlip(companyid, xPackingSlip, session, connection, function (err, xPackingSlip) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(xPackingSlip, "PackingSlip");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var cancelPackingSlip = function (companyid, xPackingSlip, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_PACKING_SLIP_CANCEL] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {
	
		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.cancelPackingSlip(companyid, xPackingSlip, session, connection, function (err, xPackingSlip) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(xPackingSlip, "PackingSlip");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var createGatePass = function (companyid, xGatePass, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			OrderService.saveGatePass(companyid, xGatePass, session, connection, function (err, xGatePass) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(xGatePass, "GatePass");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var cancelDeliveryNote = function (companyid, id, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_CANCEL] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {
	
		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.cancelDeliveryNote(companyid, id, session, connection, function (err, flag) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(null, "");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var cancelGatePass = function (companyid, id, reason, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_CANCEL] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {
	
		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.cancelGatePass(companyid, id, reason, session, connection, function (err, flag) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(null, "");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var completeDeliveryNote = function (companyid, id, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {
	
		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.completeDeliveryNote(companyid, id, session, connection, function (err, flag) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var response = Util.setOKResponse(null, "");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};

var createDirectInvoice = function (companyid, xDeliveryNote, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.createDirectInvoice(companyid, xDeliveryNote, session, connection, function (err, xDeliveryNote) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, xDeliveryNote);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setOKResponse(xDeliveryNote, "DeliveryNote");
						return callback(err, response);
					});

				}

			});
		});
	});
				
};

var createDeliveryNote = function (companyid, xDeliveryNote, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_CREATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.createDeliveryNote(companyid, xDeliveryNote, session, connection, function (err, xDeliveryNote) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, null);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setOKResponse(xDeliveryNote, "DeliveryNote");
						return callback(err, response);
					});

				}

			});
		});
	});
				
};

var updateDirectInvoice = function (companyid, xDeliveryNote, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.updateDirectInvoice(companyid, xDeliveryNote, session, connection, function (err, xDeliveryNote) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, xDeliveryNote);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setOKResponse(xDeliveryNote, "DeliveryNote");
						return callback(err, response);
					});

				}

			});
		});
	});
				
};

var updateDeliveryNote = function (companyid, xDeliveryNote, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.updateDeliveryNote(companyid, xDeliveryNote, session, connection, function (err, xDeliveryNote) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setOKResponse(xDeliveryNote, "DeliveryNote");
						return callback(err, response);
					});

				}

			});
		});
	});
				
};

var updateGatePass = function (companyid, xGatePass, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	mysql.openConnection(function (err, connection) {

		if (err) return callback (err);

		connection.beginTransaction(function () {
			OrderService.saveGatePass(companyid, xGatePass, session, connection, function (err, xGatePass) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						var response = Util.setOKResponse(xGatePass, "GatePass");
						return callback(err, response);
					});

				}

			});
		});
	});
				
};


var findDeliveryNoteById = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.findDeliveryNoteById(id, companyid, session, connection, function (err, deliverynote) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!deliverynote)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Delivery note not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(deliverynote, "DeliveryNote"));
			}  

		});

    });

};

var findGatePassByID = function (id, companyid, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_GATE_PASS_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(id) || Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.findGatePassByID(id, companyid, session, connection, function (err, gatepass) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!gatepass)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Gate Pass not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(gatepass, "GatePass"));
			}  

		});

    });

};


var findAllDeliveryNotes = function (companyid, options, session, callback) {

	if (session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_VIEW] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_CREATE] != "1" && session.permissionlist[Util.CONST_PERMISSION_DELIVERY_NOTE_UPDATE] != "1")
	{
		var err     = new Err();
		err.code    = "-15001";
		err.message = "Permission denied";
		return callback(err);
	}

	if (Util.isEmptyString(companyid)) {

		var err     = new Err();
		err.code    = "-5001";
		err.message = "Company ID is a required field.";
		return callback(err);

	}

	mysql.openConnection (function (err, connection) {
		
		if (err) return callback (err);

		OrderService.findAllDeliveryNotes(companyid, options, session, connection, function (err, deliverynotelist) {

			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!deliverynotelist)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-102, "Delivery note not found."); //new Status();
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, Util.setOKResponse(deliverynotelist, "DeliveryNote"));
			}  

		});

    });

};


var updateStatus = function (companyid, orderid, userid, action_status, notes, callback) {

	mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
			OrderService.updateStatus(companyid, orderid,  userid, action_status, notes, connection, function (err, order) {

				if (err) {
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err);
						}
					);
				}
				else if (order == null) {
					var response = Util.setErrorResponse(-100, "Order not found."); //new Status();
					mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (err, response);
						}
					);
				}
				else {

					mysql.commitTransaction(connection, function () {

						mysql.closeConnection(connection);

						var event = new Event();
						event.user_id = userid;
						event.document_id = orderid;
						Util.getEventManager().fireEvent(Util.EventTypeEnum.OrderUpdate, event);

						var response = Util.setOKResponse(order, "Order");
						return callback(err, response);

					});

				}

			});
		});
	});
				
};


var getProductsByOrderID = function (id, companyid, session, callback) {

	mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		OrderService.getProductsByOrderID(id, companyid, session, connection, function (err, products) {
			if (err) {
				mysql.closeConnection(connection);
				return callback (err);
			}
			else if (!products)
			{
				mysql.closeConnection(connection);
				var response = Util.setErrorResponse(-100, "Order not found.");
				return callback (err, response);
			} 
			else {
				mysql.closeConnection(connection);
				return callback(err, products);
			}  

		});

		
	});
				
};



module.exports = {
	findAll                  : findAll,
	findById                 : findById,
	create					 : create,
	updateStatus			 : updateStatus,
	cancelOrder              : cancelOrder,
	findPackingslipsByOrderid:findPackingslipsByOrderid,
	findAllPackingslips     : findAllPackingslips,
	createPackingSlip		: createPackingSlip,
	findPackingslipById     : findPackingslipById,
	cancelPackingSlip       : cancelPackingSlip,
	getPackingSlipDetail    : getPackingSlipDetail,
	createDeliveryNote      : createDeliveryNote,
	createDirectInvoice 	: createDirectInvoice,
	updateDeliveryNote      : updateDeliveryNote,
	updateDirectInvoice     : updateDirectInvoice,
	cancelDeliveryNote      : cancelDeliveryNote,
	completeDeliveryNote    : completeDeliveryNote,
	findAllDeliveryNotes    : findAllDeliveryNotes,
	findDeliveryNoteById    : findDeliveryNoteById,
	printOrder              : printOrder,
	printPackingSlip        : printPackingSlip,
	printDeliveryNote       : printDeliveryNote,
	getDetailDeliveryNote	: getDetailDeliveryNote,
	getProductsByOrderID	: getProductsByOrderID,
	createGatePass			: createGatePass,
	findGatePassByID 		: findGatePassByID,
	updateGatePass			: updateGatePass,
	cancelGatePass 			: cancelGatePass,
	printGatePass			: printGatePass
};