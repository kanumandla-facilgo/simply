
exports.attachHandlers = function attachHandlers (router) {

	/* global routes */
	router.get('/',function(req,res){
    	//res.send("Welcome!");
    	var cwd = process.cwd();
        res.sendFile(cwd + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

	router.get('/about',function(req,res){
    	res.send("This is About page");
	});
/*
	app.get('*', function(req, res) {
        res.sendfile('../../public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
 */   
	/* local routes */
    require('./companies')(router);
    require('./categories')(router);
    require('./users')(router);
    require('./products')(router);
    require('./sessions')(router);
    require('./roles')(router);
    require('./masters')(router);
    require('./configurations')(router);
	require('./orders')(router);
	require('./workflow')(router);
    require('./uploads')(router);

};
