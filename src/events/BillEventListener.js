const Util  = require("../utils");
const CompanyController = require("../controllers/company");

class BillEventListener {
    
    constructor (eventManager) {
        eventManager.on(Util.LocalEventTypeEnum.CreateBill, function(event) {
            event.type_id = Util.LocalEventTypeEnum.CreateBill;         
            let session = {};
            session.permissionlist = [];
            session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] = "1";
            session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] = "1";

            CompanyController.updateCustomerOverdue(event.companyid, event.customerid, event.overdue, session, function(err, response) {
            	if(err)
            		console.error(err);
            });
            
        });

        eventManager.on(Util.LocalEventTypeEnum.UpdateBill, function(event) {
            event.type_id = Util.LocalEventTypeEnum.UpdateBill;
            let session = {};
            session.permissionlist = [];
            session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE_BALANCE] = "1";
            session.permissionlist[Util.CONST_PERMISSION_CUSTOMER_UPDATE] = "1";

            CompanyController.updateCustomerOverdue(event.companyid, event.customerid, event.overdue, session, function(err, response) {
            	if(err)
            		console.error(err);
            });

            
        });
    }

}

module.exports = BillEventListener;
