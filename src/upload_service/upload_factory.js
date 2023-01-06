const AgentUpload = require("./agent_upload_service");
const upload_types = { AgentUpload };

module.exports = {
    getUploadService(type) {
        const UploadType = upload_types[type];
        return new UploadType();
    }
};