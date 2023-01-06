

function getRandomPhoneNumber(length) {

    let chars = '0123456789';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;

}

function getRandomString(length) {

    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;

}

function getLoginObject(login_name, password) {
    let object = {};
    object.login_name = login_name;
    object.password = password;

    return object;
}

function getCompanyObject() {

    let object = {};

    object.code = getRandomString(8).toLowerCase();
    object.name = "My_Company";
    object.description = "My Company";
    object.address1 = "1 ABC DR";
    object.address2 = "Hello Drive!";
    object.city = "Ahmedabad";
    object.state = "Gujarat";
    object.zip = "380015";
    object.phone = "9701906370";
    object.email = "rupesh_d_shah@yahoo.com";
    object.first_name = "Rupesh";
    object.last_name = "Shah";
    object.login_name = object.code;
    object.password = "xyz999";

    return object;

}

function getAgentRegistrationPassword() {
    return "abcdef";
}

function getAgentObject(salesPersonObj) {

    const code = getRandomString(8);

    const agentObject = {};

    agentObject["agent"] = {};

    agentObject["agent"]["code"] = code;
    agentObject["agent"]["name"] = code;

    agentObject["agent"]["accounting_name"] = code;
    agentObject["agent"]["sales_person"] = salesPersonObj;

    agentObject["agent"]["address"] = {};
    agentObject["agent"]["address"]["first_name"] = "Sachin";
    agentObject["agent"]["address"]["last_name"] = "Ramani";
    agentObject["agent"]["address"]["address1"] = "220 Tagore Park";
    agentObject["agent"]["address"]["city"] = "Ahmedabad";
    agentObject["agent"]["address"]["state"] = "Gujarat";
    agentObject["agent"]["address"]["zip"] = "380015";
    agentObject["agent"]["address"]["phone1"] = "9427011122";

    agentObject["agent"]["user"] = {};
    agentObject["agent"]["user"]["login_name"] = code;
    agentObject["agent"]["user"]["password"] = "abc111";

    agentObject["user"] = {};
    agentObject["user"]["first_name"] = "Sachin";
    agentObject["user"]["last_name"] = "Ramani";

    return agentObject;

}

function getUserObject(role_id) {
    const userObject = {};

    userObject["first_name"] = getRandomString(6);
    userObject["last_name"] = getRandomString(4);
    userObject["role_id"] = role_id;
    userObject["login_name"] = getRandomString(5)
    userObject["password"] = getRandomString(6)
    userObject["email"] = "sachin.ramani@gmail.com";
    userObject["phone"] = "9427011122";

    return userObject;
    
}

function getRoleObject() {

}

function getTransporterObject() {

    let object = {};
    object.code = getRandomString(6).toLowerCase();
    object.name = "Romy Transporter";
    object.first_name = "Vishal";
    object.last_name = "Khanna";
    object.external_code = "90994499";
    object.address1 = "3900 New Cloth market";
    object.city = "Ahmedabad";
    object.state = "Gujarat";
    object.zip = "380001";

    return object;

}

function getCustomerObject (agent, salesperson, companytype, paymentterm, transporter) {

    const code = getRandomString(8);

    let object = {};
    object.customer = {};
    object.customer.address = {};
    object.customer.ship_address = {};
    object.customer.bill_address = {};
    object.customer.agent = agent;

    let customer = object.customer;

    customer.id = 0;
    customer.name = code;
    customer.invoicing_name = code;
    customer.code = "400001";
    customer.description = "";
    customer.status_id = "4600";

    customer.address.address1 = "My super place";
    customer.address.address2 = "Test";
    customer.address.address3 = "Shahibaug";
    customer.address.city = "Ahmedabad";
    customer.address.state = "Gujarat";
    customer.address.zip = "380015";
    customer.address.phone1 = "9701906370";
    customer.address.email1 = "rupesh_d_shh@yahoo.com";
    customer.address.phone2 = "9701906370";
    customer.address.email2 = "rupesh_d_shh@yahoo.com";

    customer.ship_address.address1 = "My super place";
    customer.ship_address.address2 = "Test";
    customer.ship_address.address3 = "Shahibaug";
    customer.ship_address.city = "Ahmedabad";
    customer.ship_address.state = "Gujarat";
    customer.ship_address.zip = "380015";
    customer.ship_address.phone1 = "9701906370";
    customer.ship_address.email1 = "rupesh_d_shh@yahoo.com";
    customer.ship_address.phone2 = "9701906370";
    customer.ship_address.email2 = "rupesh_d_shh@yahoo.com";

    customer.bill_address.address1 = "My super place";
    customer.bill_address.address2 = "Test";
    customer.bill_address.address3 = "Shahibaug";
    customer.bill_address.city = "Ahmedabad";
    customer.bill_address.state = "Gujarat";
    customer.bill_address.zip = "380015";
    customer.bill_address.phone1 = "9701906370";
    customer.bill_address.email1 = "rupesh_d_shh@yahoo.com";
    customer.bill_address.phone2 = "9701906370";
    customer.bill_address.email2 = "rupesh_d_shh@yahoo.com";

    customer.agent = agent;
    customer.sales_person = salesperson;
    customer.payment_term = paymentterm;
    customer.transporter = transporter;

    customer.current_balance = 0;
    customer.current_overdue = 0;
    customer.allowed_balance = 0;

    let customer_type = {};
    customer_type.id = 7200;
    customer_type.name = "Individual";
    customer.customer_type = customer_type;


    return object;
}

let Base64 = {

    keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this.keyStr.charAt(enc1) +
                this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) +
                this.keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    },

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = this.keyStr.indexOf(input.charAt(i++));
            enc2 = this.keyStr.indexOf(input.charAt(i++));
            enc3 = this.keyStr.indexOf(input.charAt(i++));
            enc4 = this.keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
    }
};

module.exports = {
    getLoginObject               : getLoginObject,
    getAgentRegistrationPassword : getAgentRegistrationPassword,
    getRandomPhoneNumber         : getRandomPhoneNumber,
    getCustomerObject            : getCustomerObject,
    getAgentObject               : getAgentObject,
    getUserObject                : getUserObject,
    getRoleObject                : getRoleObject,
    getCompanyObject             : getCompanyObject,
    getTransporterObject         : getTransporterObject,
    Base64                       : Base64,
}