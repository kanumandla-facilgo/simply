exports.registerEvents = function (eventManager) {
    const ActivityEventListener = require('./ActivityEventListener');
    let ael = new ActivityEventListener(eventManager); 

    const EventListener = require('./EventListener');
    let oel = new EventListener(eventManager); 

    const UploadEventListener = require('./UploadEventListener');
    let uel = new UploadEventListener(eventManager); 

    const BillEventListener = require('./BillEventListener');
    let bel = new BillEventListener(eventManager); 

    const ProductImageUploadListener = require('./ProductImageUploadListener');
    let piul = new ProductImageUploadListener(eventManager); 
};

