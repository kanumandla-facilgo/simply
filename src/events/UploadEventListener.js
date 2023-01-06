const Util  = require("../utils");
const AgentUpload = require("../upload_service/agent_upload_service");
const CustomerUpload = require("../upload_service/customer_upload_service");
const TransporterUpload = require("../upload_service/transporter_upload_service");
const BillUpload = require("../upload_service/bill_upload_service");

class UploadEventListener {
    
    constructor (eventManager) {
        eventManager.on(Util.EventTypeEnum.AgentUpload, function(event) {
            event.type_id = Util.EventTypeEnum.AgentUpload;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
                else {
                    let uploadService = new AgentUpload();
                    uploadService.upload(event.document_id);

                }
            });
        });

        eventManager.on(Util.EventTypeEnum.CustomerUpload, function(event) {
            event.type_id = Util.EventTypeEnum.CustomerUpload;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
                else {
                    let uploadService = new CustomerUpload();
                    uploadService.upload(event.document_id);

                }
            });
        });

        eventManager.on(Util.EventTypeEnum.TransporterUpload, function(event) {
            event.type_id = Util.EventTypeEnum.TransporterUpload;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
                else {
                    let uploadService = new TransporterUpload();
                    uploadService.upload(event.document_id);

                }
            });
        });

        eventManager.on(Util.EventTypeEnum.BillUpload, function(event) {
            event.type_id = Util.EventTypeEnum.BillUpload;
            eventManager.insert(event, function(err, response)
            {
                if(err)
                    console.error(err);
                else {
                    let uploadService = new BillUpload();
                    uploadService.upload(event.document_id);

                }
            });
        });
    }

}

module.exports = UploadEventListener;
