const Util  = require("../utils");

class EventListener {
    
    constructor (eventManager) {
        eventManager.on(Util.EventTypeEnum.OrderCreate, function(event) {
            event.type_id = Util.EventTypeEnum.OrderCreate;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
            });
        });
        eventManager.on(Util.EventTypeEnum.OrderUpdate, function(event) {
            event.type_id = Util.EventTypeEnum.OrderUpdate;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
            });
        });
        eventManager.on(Util.EventTypeEnum.CustomerShare, function(event) {
            event.type_id = Util.EventTypeEnum.CustomerShare;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
            });
        }); 

        eventManager.on(Util.LocalEventTypeEnum.CompanyCreate, function(event) {
            let e = {};
            e.type_id = Util.EventTypeEnum.WelcomeEmail;
            e.document_id = event.document_id;
            e.user_id = event.user_id;

            eventManager.insert(e, function(err, response)
            {
                if(err)
                    console.error(err);
            });
        });

        eventManager.on(Util.LocalEventTypeEnum.CompanyCreate, function(event) {
            event.type_id = Util.EventTypeEnum.BillingCompany;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
            });
        });
        
        eventManager.on(Util.EventTypeEnum.PaymentThankYou, function(event) {
            event.type_id = Util.EventTypeEnum.PaymentThankYou;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
            });
        });
    }

}

module.exports = EventListener;
