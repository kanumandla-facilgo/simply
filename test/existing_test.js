const should = require('chai').should(),
    expect = require('chai').expect,
    supertest = require('supertest'),
    util      = require("./util");
    api = supertest('http://localhost:8081');

describe('All', function () {

    let sessionid = '';
    let username = "admin2.st";
    let password = "demo123";
    let companyId;
    let agentId = '';
    let customer;
    let agent;
    let customerId;
    let role;
    let roleId;
    let categoryId;
    let productId;
    let paymentterm;
    let paymenttermId;
    let transporter;
    let transporterId;

    it('should return a 200 response', function (done) {
        api.get('/')
            .expect(200, done);
    });

    // Test login now
    it('Login as administrator /login', function (done) {

        // sending a request
        api.post('/api/users/me/login')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Basic ' + util.Base64.encode(username + ':' + password))
            .send({})
            .expect(200) 
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("session");
                expect(res.body.data.session).to.have.property("id");
                expect(res.body.data.session).to.have.property("user");
                expect(res.body.data.session.user).to.have.property("role_id");
                expect(res.body.data.session.user).to.have.property("sys_role_id");
                expect(res.body.data.session.user).to.have.property("first_name");
                expect(res.body.data.session.user).to.have.property("last_name");
                expect(res.body.data.session.user).to.have.property("status_id");
                expect(res.body.data.session.user.status_id).to.equal(4600);
                expect(res.body.data.session.user).to.have.property("login_name");
                expect(res.body.data.session.user).to.have.property("first_name");
                expect(res.body.data.session.user.sys_role_id).to.equal(4002);
                expect(res.body.data.session.user.login_name).to.equal(username);
                expect(res.body.data.session.user.password).to.equal("");

                sessionid = res.body.data.session.id;
                companyId = res.body.data.session.user.company_id;

                done();
            });
    });

    // Test get sales person
    it('Get list of sales persons /users', function (done) {
        api.get('/api/users/?sysrole_id=4004&status_id=4600')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("userlist");
                expect(res.body.data.userlist).to.have.length.to.be.above(0);
                expect(res.body.data.userlist[0]).to.have.property("sys_role_id");
                expect(res.body.data.userlist[0].sys_role_id).to.equal(4004);

                salesperson = res.body.data.userlist[0];
 
                done();

            }
        );
    });

    // Test get sales person
    it('Get list of sales person /users/545', function (done) {
        api.get('/api/users/545')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("user");
                expect(res.body.data.user).to.have.property("sys_role_id");
                expect(res.body.data.user.sys_role_id).to.equal(4004);

                salesperson = res.body.data.user;
 
                done();

            }
        );
    });

    // Test get customer type list
    it('Get list of customertypes /companytypes', function (done) {
        api.get('/api/companytypes')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("companytypelist");
                expect(res.body.data.companytypelist).to.have.length.to.be.above(0);
                expect(res.body.data.companytypelist[0]).to.have.property("description");

                companytypeId = res.body.data.companytypelist[0].id;
 
                done();

            }
        );
    });

    // Test get customertype/ Test get customertype list
    it('Get customer type /companytypes/:id', function (done) {
        api.get('/api/companytypes/' + companytypeId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("companytype");
                expect(res.body.data.companytype).to.have.property("description");

                companytype = res.body.data.companytype;
 
                done();

            }
        );
    });


    // create the agent
    it('Creating Agent /agents', function (done) {
        let object = util.getAgentObject(salesperson);
        api.post('/api/agents')
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(object))
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("agent");
                expect(res.body.data.agent).to.have.property("id");

                newAgentId = res.body.data.agent.id;

                done();
            });

    });

    // Test get agent
    it('Get agent /agents/:id', function (done) {
        api.get('/api/agents/' + newAgentId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("agent");
                expect(res.body.data.agent).to.have.property("status_id");
                expect(res.body.data.agent.status_id).to.equal(4600);
                expect(res.body.data.agent).to.have.property("custom_type_id");
                expect(res.body.data.agent.custom_type_id).to.equal(4703);
                expect(res.body.data.agent).to.have.property("id");
                expect(res.body.data.agent.id).to.equal(newAgentId);

                // Store the agent
                newAgent = res.body.data.agent;

                done();

            }
        );
    });

    // updating the agent
    it('Updating Agent /agents/:id', function (done) {

        //update name of new agent from previous step
        let agentObject = {};
        agentObject["agent"] = newAgent;
        newAgent.address.first_name = "Maitri";
        newAgent.address.last_name = "Shah";

        api.put('/api/agents/' + newAgent.id)
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(agentObject))
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("agent");
                expect(res.body.data.agent).to.have.property("id");
                expect(res.body.data.agent.id).to.equal(newAgent.id);
                expect(res.body.data.agent.name).to.equal(newAgent.name);
                expect(res.body.data.agent.custom_type_id).to.equal(4703);

                done();

            });
    });

    // Test get agent list
    it('Get list of agents /agents', function (done) {
        api.get('/api/agents')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("agentlist");
                expect(res.body.data.agentlist).to.have.length.to.be.above(0);
                expect(res.body.data.agentlist[0]).to.have.property("status_id");
                expect(res.body.data.agentlist[0].status_id).to.equal(4600);

                agentId = res.body.data.agentlist[0].id;

                done();

            }
        );
    });

    // Test get agent
    it('Get agent /agents/:id', function (done) {
        api.get('/api/agents/' + agentId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("agent");
                expect(res.body.data.agent).to.have.property("status_id");
                expect(res.body.data.agent.status_id).to.equal(4600);
                expect(res.body.data.agent).to.have.property("id");
                expect(res.body.data.agent.id).to.equal(agentId);

                // Store the agent
                agent = res.body.data.agent;

                done();

            }
        );
    });

    // Test get customer list
    it('Get list of customers /customers', function (done) {
        api.get('/api/customers/?page_size=20')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("customerlist");
                expect(res.body.data.customerlist).to.have.length.to.be.above(0);
                expect(res.body.data.customerlist[0]).to.have.property("status_id");
                expect(res.body.data.customerlist[0].status_id).to.equal(4600);

                customerId = res.body.data.customerlist[0].id;
 
                done();

            }
        );
    });

    // Test get customer
    it('Get customer /customers/:id', function (done) {
        api.get('/api/customers/' + customerId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("customer");
                expect(res.body.data.customer).to.have.property("status_id");
                expect(res.body.data.customer.status_id).to.equal(4600);
                expect(res.body.data.customer).to.have.property("id");
                expect(res.body.data.customer.id).to.equal(customerId);

                // Store the customer
                customer = res.body.data.customer;

                done();

            }
        );
    });

    // Test Create Customer
    it('Creating Customer /customer', function (done) {
        let object = util.getCustomerObject(agent, salesperson);

        api.post('/api/customers')
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(object))
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("customer");
                expect(res.body.data.customer).to.have.property("id");
                expect(res.body.data.customer).to.have.property("agent");
                expect(res.body.data.customer.agent).to.have.property("id");
                expect(res.body.data.customer.agent.id).to.equal(agentId);
                expect(res.body.data.customer.agent.id).to.equal(agent.id);

                customer = res.body.data.customer;

                done();
            });
    });

    // Test get customer list
    it('Search customer by entering name Vik text /customers', function (done) {
        api.get('/api/customers/?search_text=Vik&statusid=4600&page_size=9999999&page_number=1')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("customerlist");
                expect(res.body.data.customerlist).to.have.length.to.be.above(0);
                expect(res.body.data.customerlist[0]).to.have.property("status_id");
                expect(res.body.data.customerlist[0].status_id).to.equal(4600);

                customerId = res.body.data.customerlist[0].id;
 
                done();

            }
        );
    });

    // Test get role list
    it('Get list of roles /roles', function (done) {
        api.get('/api/roles')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("rolelist");
                expect(res.body.data.rolelist).to.have.length.to.be.above(0);
                expect(res.body.data.rolelist[0]).to.have.property("sys_role_id");

                roleId = res.body.data.rolelist[0].id;
 
                done();

            }
        );
    });

    // Test get role
    it('Get role /roles/:id', function (done) {
        api.get('/api/roles/' + roleId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("role");
                expect(res.body.data.role).to.have.property("sys_role_id");
                expect(res.body.data.role).to.have.property("id");
                expect(res.body.data.role.id).to.equal(roleId);

                // Store the role
                role = res.body.data.role;

                done();

            }
        );
    });

    // Test get transporter list
    it('Get list of transporters /transporters', function (done) {
        api.get('/api/transporters')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("transporterlist");
                expect(res.body.data.transporterlist).to.have.length.to.be.above(0);
                expect(res.body.data.transporterlist[0]).to.have.property("status_id");

                transporterId = res.body.data.transporterlist[0].id;
                transporter = res.body.data.transporterlist[0];
 
                done();

            }
        );
    });

    // Test get transporter
    it('Get transporter /transporters/:id', function (done) {
        api.get('/api/transporters/' + transporter.id)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("transporter");
                expect(res.body.data.transporter).to.have.property("status_id");
                expect(res.body.data.transporter.status_id).to.equal(transporter.status_id);
                expect(res.body.data.transporter).to.have.property("id");
                expect(res.body.data.transporter.id).to.equal(transporter.id);

                // Store the transporter
                transporter = res.body.data.transporter;

                done();

            }
        );
    });

    // Test create transporter
    it('Create transporter /transporters', function (done) {
        api.post('/api/transporters/')
            .set('Authorization', 'Bearer ' + sessionid)
            .send("external_code=bad&name=bad&first_name=bad&last_name=transporter&city=Delhi&state=Delhi")
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("transporter");
                expect(res.body.data.transporter).to.have.property("id");

                // Store the transporter
                transporter = res.body.data.transporter;

                done();

            }
        );
    });

    // Test update transporter
    it('Update transporter /transporters/:id', function (done) {
        api.put('/api/transporters/' + transporter.id)
            .set('Authorization', 'Bearer ' + sessionid)
            .send("id=" + transporter.id + "&code=" + transporter.code + "&external_code=bad&name=bad&first_name=bad&last_name=transporter&city=Delhi&state=Delhi&status_id=4601")
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("transporter");
                expect(res.body.data.transporter).to.have.property("status_id");
                expect(res.body.data.transporter.status_id).to.equal('4601');
                expect(res.body.data.transporter).to.have.property("id");
                expect(res.body.data.transporter.id).to.equal(transporter.id + "");

                done();

            }
        );
    });

    // Test delete transporter
    it('Delete transporter /transporters/:id', function (done) {
        api.delete('/api/transporters/' + transporter.id)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);

                done();

            }
        );
    });

    // Test get paymentterm list paymentterm
    it('Get list of payment terms /paymentterms', function (done) {
        api.get('/api/paymentterms/')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("paymenttermlist");
                expect(res.body.data.paymenttermlist).to.have.length.to.be.above(0);

                paymentterm = res.body.data.paymenttermlist[0];

                paymenttermId = res.body.data.paymenttermlist[0].id;
 
                done();

            }
        );
    });

    // Test get paymentterm
    it('Get payment term /paymentterm/:id', function (done) {
        api.get('/api/paymentterms/' + paymentterm.id)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("paymentterm");
                expect(res.body.data.paymentterm).to.have.property("status_id");
                expect(res.body.data.paymentterm.status_id).to.equal(paymentterm.status_id);
                expect(res.body.data.paymentterm).to.have.property("id");
                expect(res.body.data.paymentterm.id).to.equal(paymentterm.id);

                // Store the paymentterm
                paymentterm = res.body.data.paymentterm;

                done();

            }
        );
    });

    // Test get root categories
    it('Get list of root categories /categories', function (done) {
        api.get('/api/categories/?root=1')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("categorylist");
                expect(res.body.data.categorylist).to.have.length.to.be.above(0);
                expect(res.body.data.categorylist[0]).to.have.property("is_root");
                expect(res.body.data.categorylist[0].is_root).to.equal(0);

                categoryId = res.body.data.categorylist[0].id;

                done();

            }
        );
    });

    // Test get root categories
    it('Get root category /categories/:id', function (done) {
        api.get('/api/categories/' + categoryId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("category");
                expect(res.body.data.category).to.have.property("is_root");
                expect(res.body.data.category.is_root).to.equal(0);
                expect(res.body.data.category).to.have.property("id");
                expect(res.body.data.category.id).to.equal(categoryId);

                // Store the paymentterm
                category = res.body.data.category;

                done();

            }
        );
    });

    // Test get child categories
    it('Get child categories /categories/?parent_id=:', function (done) {
        api.get('/api/categories/?parent_id=' + categoryId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("categorylist");
                let categorylist = res.body.data.categorylist.filter( category =>  category.id == 156);
                expect(categorylist).to.have.length.to.be.above(0);
                expect(categorylist[0]).to.have.property("is_root");
                expect(categorylist[0].is_root).to.equal(0);

                categoryId = categorylist[0].id;

                done();

            }
        );
    });

    // Test get products
    it('Get products /products/category/:id', function (done) {
        api.get('/api/products/category/' + categoryId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("productlist");
                expect(res.body.data.productlist).to.have.length.to.be.above(0);
                expect(res.body.data.productlist[0]).to.have.property("name");
                expect(res.body.data.productlist[0]).to.have.property("id");
//                expect(res.body.data.productlist[0].id).to.equal(3427);

                productId = res.body.data.productlist[0].id;

                done();

            }
        );
    });

    // Test get product
    it('Get product /products/:id', function (done) {
        api.get('/api/products/' + productId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("product");
                expect(res.body.data.product).to.have.property("name");
                expect(res.body.data.product).to.have.property("id");
                expect(res.body.data.product.id).to.equal(productId);

                product = res.body.data.product;
 
                done();

            }
        );
    });

    // Test get products
    it('Search product by text "blo" /products/search?', function (done) {
        api.get('/api/products/search?customerid=' + customerId + '&q=blo&enabled_only=1&hide_non_stocked_items=1&show_new_product_for_x_days=15')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("productlist");
                expect(res.body.data.productlist).to.have.length.to.be.above(0);
                expect(res.body.data.productlist[0]).to.have.property("name");
                expect(res.body.data.productlist[0]).to.have.property("id");
//              expect(res.body.data.productlist[0].id).to.equal(3427);
 
                done();

            }
        );
    });

    // Test list proce groups
    it('Get list of price groups /pricegroups/', function (done) {
        api.get('/api/pricegroups/')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("pricegrouplist");
                expect(res.body.data.pricegrouplist).to.have.length.to.be.above(0);
                expect(res.body.data.pricegrouplist[0]).to.have.property("name");
                expect(res.body.data.pricegrouplist[0]).to.have.property("id");
//                expect(res.body.data.pricegrouplist[0].id).to.equal(10692);

                priceGroupId = res.body.data.pricegrouplist[0].id;
 
                done();

            }
        );
    });

    // Test get proce group
    it('Get price group /pricegroups/:id', function (done) {
        api.get('/api/pricegroups/' + priceGroupId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("pricegroup");
                expect(res.body.data.pricegroup).to.have.property("name");
                expect(res.body.data.pricegroup).to.have.property("id");
                expect(res.body.data.pricegroup.id).to.equal(priceGroupId);

                priceGroup = res.body.data.pricegroup;
 
                done();

            }
        );
    });

    // Test get stock journal
    it('Get stock journal for the product /stockjournal/?productid=?', function (done) {
        api.get('/api/stockjournal/?productid=' + productId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("stockjournal");
                expect(res.body.data.stockjournal).to.have.property("stockjournallist");
                expect(res.body.data.stockjournal.stockjournallist).to.have.length.to.be.above(0);
                expect(res.body.data.stockjournal.stockjournallist[0]).to.have.property("description");
                expect(res.body.data.stockjournal.stockjournallist[0]).to.have.property("id");
//                expect(res.body.data.stockjournallist[0].id).to.equal(120429);

                stockJournalId = res.body.data.stockjournal.stockjournallist[0].id;
 
                done();

            }
        );
    });

    // Test get stock buckets
    it('Get list of stock buckets for the product /stock/?productid=?&enabled_only=1', function (done) {
        productId = 5161;
        api.get('/api/stock/?productid=' + productId + "&enabled_only=1")
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("stockbucketlist");
                expect(res.body.data.stockbucketlist).to.have.length.to.be.above(0);
                expect(res.body.data.stockbucketlist[0]).to.have.property("description");
                expect(res.body.data.stockbucketlist[0]).to.have.property("id");
//                expect(res.body.data.stockbucketlist[0].id).to.equal(39765);

                stockBucketId = res.body.data.stockbucketlist[0].id;
 
                done();

            }
        );
    });

    // Test get particular stock buckets
    it('Get stock buckets /stock/:id', function (done) {
        api.get('/api/stock/' + stockBucketId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("stockbucket");
                expect(res.body.data.stockbucket).to.have.property("description");
                expect(res.body.data.stockbucket).to.have.property("id");
                expect(res.body.data.stockbucket.id).to.equal(stockBucketId);

                stockBucketId = res.body.data.stockbucket.id;
 
                done();

            }
        );
    });

    // Test list of unit of measures
    it('Get list of unit of measures /unitofmeasures/', function (done) {
        api.get('/api/unitofmeasures/')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("uomlist");
                expect(res.body.data.uomlist).to.have.length.to.be.above(0);
                expect(res.body.data.uomlist[0]).to.have.property("name");
                expect(res.body.data.uomlist[0]).to.have.property("id");
                expect(res.body.data.uomlist[0].id).to.equal(5008);

                uomId = res.body.data.uomlist[0].id;
 
                done();

            }
        );
    });

    // Test get particular uom
    it('Get unit of measure /unitofmeasures/:id', function (done) {
        api.get('/api/unitofmeasures/' + uomId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("uom");
                expect(res.body.data.uom).to.have.property("description");
                expect(res.body.data.uom).to.have.property("id");
                expect(res.body.data.uom.id).to.equal(uomId);

                uom = res.body.data.uom;
 
                done();

            }
        );
    });

    // Test list of orders
    it('Filter orders with Pending Approval and date /orders/', function (done) {
        api.get('/api/orders/?currentpage=1&records_per_page=20&statusid=4203&fromdate=Tue%20Jan%2001%202019%2000:00:00%20GMT-0800%20(Pacific%20Standard%20Time')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("orderlist");
                expect(res.body.data.orderlist).to.have.length.to.be.above(0);
                expect(res.body.data.orderlist[0]).to.have.property("sub_total");
                expect(res.body.data.orderlist[0]).to.have.property("id");
                expect(res.body.data.orderlist[0].companies_id).to.equal(companyId);

                orderId = res.body.data.orderlist[0].id;
 
                done();

            }
        );
    });

    // Test list of orders
    it('Get list of orders /orders/', function (done) {
        api.get('/api/orders/?currentpage=1&records_per_page=20')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("orderlist");
                expect(res.body.data.orderlist).to.have.length.to.be.above(0);
                expect(res.body.data.orderlist[0]).to.have.property("sub_total");
                expect(res.body.data.orderlist[0]).to.have.property("id");
                expect(res.body.data.orderlist[0].companies_id).to.equal(companyId);

                orderId = res.body.data.orderlist[0].id;
 
                done();

            }
        );
    });

    // Test get particular order
    it('Get Order /orders/:id', function (done) {
        api.get('/api/orders/' + orderId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("order");
                expect(res.body.data.order).to.have.property("sub_total");
                expect(res.body.data.order).to.have.property("id");
                expect(res.body.data.order.id).to.equal(orderId);
                expect(res.body.data.order.companies_id).to.equal(companyId);

                order = res.body.data.order;
 
                done();

            }
        );
    });

    // Test list of packing slips
    it('Get list of packingslips /packingslips/', function (done) {
        api.get('/api/packingslips/?currentpage=1&records_per_page=20')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("packingsliplist");
                expect(res.body.data.packingsliplist).to.have.length.to.be.above(0);
                expect(res.body.data.packingsliplist[0]).to.have.property("sub_total");
                expect(res.body.data.packingsliplist[0]).to.have.property("id");

                packingSlipId = res.body.data.packingsliplist[0].id;
 
                done();

            }
        );
    });

    // Test get particular stock buckets
    it('Get Packing Slip /packingslips/:id', function (done) {
        api.get('/api/packingslips/' + packingSlipId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("packingslip");
                expect(res.body.data.packingslip).to.have.property("sub_total");
                expect(res.body.data.packingslip).to.have.property("id");
                expect(res.body.data.packingslip.id).to.equal(packingSlipId);

                packingslip = res.body.data.packingslip;
 
                done();

            }
        );
    });

    // Test list of delivery notes
    it('Get list of deliverynotes /deliverynotes/', function (done) {
        api.get('/api/deliverynotes/?currentpage=1&records_per_page=20')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("deliverynotelist");
                expect(res.body.data.deliverynotelist).to.have.length.to.be.above(0);
                expect(res.body.data.deliverynotelist[0]).to.have.property("note_number");
                expect(res.body.data.deliverynotelist[0]).to.have.property("id");

                deliveryNoteId = res.body.data.deliverynotelist[0].id;
 
                done();

            }
        );
    });

    // Test get particular stock buckets
    it('Get Delivery Note /deliverynotes/:id', function (done) {
        api.get('/api/deliverynotes/' + deliveryNoteId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("deliverynote");
                expect(res.body.data.deliverynote).to.have.property("note_number");
                expect(res.body.data.deliverynote).to.have.property("id");
                expect(res.body.data.deliverynote.id).to.equal(deliveryNoteId);

                deliverynote = res.body.data.deliverynote;
 
                done();

            }
        );
    });

    // Test list of bills
    it('Get list of bills /bills/', function (done) {
        api.get('/api/bills/?page_size=20')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("billlist");
                expect(res.body.data.billlist).to.have.length.to.be.above(0);
                expect(res.body.data.billlist[0]).to.have.property("bill_number");
                expect(res.body.data.billlist[0]).to.have.property("id");

                billId = res.body.data.billlist[0].id;
 
                done();

            }
        );
    });

    // Test get user list
    it('Get list of users /users', function (done) {
        api.get('/api/users')
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("userlist");
                expect(res.body.data.userlist).to.have.length.to.be.above(0);
                expect(res.body.data.userlist[0]).to.have.property("sys_role_id");
                user = res.body.data.userlist[0]
                userId = res.body.data.userlist[0].id;
 
                done();

            }
        );
    });

    //TODO: Fix User object to make it user specific
    // test create user -- maitri
    it('Creating User /users', function (done) {
        let object = util.getUserObject(roleId);

        api.post('/api/users')
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(object))
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("user");
                expect(res.body.data.user).to.have.property("id");

                newUserId = res.body.data.user.id;

                done();
            });
    });

    // Test get user
    it('Get user /users/:id', function (done) {
        api.get('/api/users/' + userId)
            .set('Authorization', 'Bearer ' + sessionid)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("user");
                expect(res.body.data.user).to.have.property("sys_role_id");
                expect(res.body.data.user).to.have.property("id");
                expect(res.body.data.user.id).to.equal(userId);

                // Store the user
                user = res.body.data.user;

                done();

            }
        );
    });

    // test update user -- maitri
    it('Updating User /users/:id', function (done) {
        //update name of new user from previous step
        user.first_name = "Maitri";

        let userObject = {};
        userObject.id = user.id;
        userObject.address_id = user.address.id
        userObject.email = user.address.email1;
        userObject.first_name = "Maitri";
        userObject.last_name = user.last_name;
        userObject.login_name = user.login_name;
        userObject.phone = user.address.phone1;
        userObject.role_id = user.role_id;
        userObject.status_id = user.status_id;

        api.put('/api/users/' + user.id)
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(userObject))
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data.user).to.have.property("login_name");
                expect(res.body.data.user).to.have.property("role_id");
                expect(res.body.data.user.first_name).to.equal(user.first_name);

                done();

            });
    });

    // Test delete user
    it('Deleting User /users/:id', function (done) {
        api.delete('/api/users/' + newUserId)
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);

                done();

            });
    });

   // Test create payment term
    it('Creating payment term /paymentterms', function (done) {
        api.post('/api/paymentterms/')
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({"code":"1day","description":"1day","days":"1"}))
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("paymentterm");
                expect(res.body.data.paymentterm).to.have.property("status_id");
                expect(res.body.data.paymentterm.status_id).to.equal(4600);
                expect(res.body.data.paymentterm.days).to.equal("1");

                paymenttermId = res.body.data.paymentterm.id;

                done();

            });
    });

   // Test update payment term
    it('Updating payment term /paymentterms/:id', function (done) {
        api.put('/api/paymentterms/' + paymenttermId)
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({id: paymenttermId, code: "1DAY", description: "1day2", days: 11, status_id: 4600}))
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);
                expect(res.body.data).to.have.property("paymentterm");
                expect(res.body.data.paymentterm).to.have.property("status_id");
                expect(res.body.data.paymentterm.status_id).to.equal(4600);
                expect(res.body.data.paymentterm.days).to.equal(11);
                expect(res.body.data.paymentterm.description).to.equal("1day2");

                paymenttermId = res.body.data.paymentterm.id;

                done();

            });
    });

   // Test delete payment term
    it('Deleting payment term /paymentterms/:id', function (done) {
        api.delete('/api/paymentterms/' + paymenttermId)
            .set('Authorization', 'Bearer ' + sessionid)
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).to.have.property("statuscode");
                expect(res.body).to.have.property("message");
                expect(res.body.statuscode).to.equal(0);

                done();

            });
    });
    
    // // Update customer
    // it('Updating Customer /customer/:id', function (done) {

    //     firstName = "Update";
    //     address1   = "101 Updated Address";

    //     let object = {};
    //     object.customer = customer;
    //     object.customer.first_name = firstName;
    //     object.customer.address.address1 = address1;

    //     api.put('/api/customers/' + customer.id)
    //         .set('app_sid', agentSubscriberSessionId)
    //         .set('Content-Type', 'application/json')
    //         .send(JSON.stringify(object))
    //         .expect(200)
    //         .end(function (err, res) {
    //             expect(res.body).to.have.property("statuscode");
    //             expect(res.body).to.have.property("message");
    //             expect(res.body.statuscode).to.equal(0);
    //             expect(res.body.data).to.have.property("customer");
    //             expect(res.body.data.customer).to.have.property("id");
    //             expect(res.body.data.customer.id).to.equal(customer.id);
    //             expect(res.body.data.customer).to.have.property("agent");
    //             expect(res.body.data.customer.agent).to.have.property("id");
    //             expect(res.body.data.customer.agent.id).to.equal(agentId);
    //             expect(res.body.data.customer.agent.id).to.equal(agent.id);
    //             expect(res.body.data.customer.first_name).to.equal(firstName);
    //             expect(res.body.data.customer.address.address1).to.equal(address1);

    //             done();
    //         });

    // });

    // // Assign company to the agent subscriber
    // it('Create a company for agent /subscribers/:id/companies', function (done) {

    //     // set the license number in the company
    //     company.license_number = "4444221144";

    //     let company_list = [];
    //     company_list.push(company);

    //     let object = {};
    //     object.company_list = company_list;

    //     api.post('/api/subscribers/' + agentSubscriberId + '/companies')
    //         .set('app_sid', agentSubscriberSessionId)
    //         .set('Content-Type', 'application/json')
    //         .send(JSON.stringify(object))
    //         .expect(200)
    //         .end(function (err, res) {
    //             expect(res.body).to.have.property("statuscode");
    //             expect(res.body).to.have.property("message");
    //             expect(res.body.statuscode).to.equal(0);

    //             done();

    //         }
    //     );
    // });

    // // Updating company with new license number
    // it('Create a company for agent /subscribers/:id/companies', function (done) {

    //     // set the license number in the company
    //     company.license_number = "4444221145";

    //     let company_list = [];
    //     company_list.push(company);

    //     let object = {};
    //     object.company_list = company_list;

    //     api.post('/api/subscribers/' + agentSubscriberId + '/companies')
    //         .set('app_sid', agentSubscriberSessionId)
    //         .set('Content-Type', 'application/json')
    //         .send(JSON.stringify(object))
    //         .expect(200)
    //         .end(function (err, res) {
    //             expect(res.body).to.have.property("statuscode");
    //             expect(res.body).to.have.property("message");
    //             expect(res.body.statuscode).to.equal(0);

    //             done();

    //         }
    //     );
    // });

    // it('Creating Policy', function (done) {

    //     let object = util.getPolicyObject(customer, agent, company);

    //     api.post('/api/policies')
    //         .set('app_sid', agentSubscriberSessionId)
    //         .set('Content-Type', 'application/json')
    //         .send(JSON.stringify(object))
    //         .expect(200)
    //         .end(function (err, res) {
    //             expect(res.body).to.have.property("statuscode");
    //             expect(res.body).to.have.property("message");
    //             expect(res.body.statuscode).to.equal(0);
    //             expect(res.body.data).to.have.property("policy");
    //             expect(res.body.data.policy).to.have.property("id");
    //             expect(res.body.data.policy.customer.id).to.equal(customer.id);

    //             policy1 = res.body.data.policy;

    //             done();
    //         });

    // });

    // it('Deleting Policy', function (done) {

    //     api.delete('/api/policies/' + policy1.id)
    //         .set('app_sid', agentSubscriberSessionId)
    //         .set('Content-Type', 'application/json')
    //         .expect(200)
    //         .end(function (err, res) {
    //             done();
    //         });

    // });
});
