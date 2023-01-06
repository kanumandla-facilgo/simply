const Util  = require("../utils");

class ActivityEventListener {
    
    constructor (eventManager) {
        eventManager.on(Util.CONST_ACTIVITY_TYPE_CREATE, function(event) {
            eventManager.insertActivity(event, function(err, response)
            {
                if(err)
                    console.error(err);
            });
        });

    }

}

module.exports = ActivityEventListener;
