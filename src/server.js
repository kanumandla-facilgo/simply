var express   = require('express');        // call express
var routes    = require('./routes');
var events    = require('./events');
//var config    = require('./config');

//var mysql     = require('mysql');
exports.createServer = function createServer () {
    
    var app = express();                 // define our app using express

	app.use(function (req, res, next) {

		if(!req.secure && app.settings.env == 'production') {
			return res.redirect(['https://', req.get('Host'), req.url].join(''));
		}

		next();
	});

    // specify middleware
    var bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.use(bodyParser.json({limit: '50mb'}));                         // parse application/json 
//    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(bodyParser.json({ type: 'application/json' })); // parse application/vnd.api+json as json
    
    //exports.mysql = mysql;

	// Add headers /* REMOVE THIS SECTION ON PRODUCTION */
	app.use(function (req, res, next) {

		// Website you wish to allow to connect
//		res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');
//		res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63340');
		
		var Util = require("./utils");
		var apiDetail = {};
		apiDetail.sessionid = Util.readSID(req);
		apiDetail.route_type = req.method;
		apiDetail.route = req.path;
		apiDetail.more = req.query;

		let eventManager = Util.getEventManager();

		if(req.originalUrl.includes("/api/") && apiDetail.sessionid != null)
			eventManager.fireEvent(Util.CONST_ACTIVITY_TYPE_CREATE, apiDetail);


		// Request methods you wish to allow
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

		// Request headers you wish to allow
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,app_sid');

		// Security headers
		res.setHeader('Strict-Transport-Security', "max-age=31536000; includeSubDomains");
		res.setHeader('X-Content-Type-Options', "nosniff");
		res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
		res.setHeader("Permissions-Policy", "vibrate 'self'; usermedia *; sync-xhr 'self'");
		// res.setHeader("Content-Security-Policy", "default-src https:; style-src 'self' 'unsafe-inline';");

		// Set to true if you need the website to include cookies in the requests sent
		// to the API (e.g. in case you use sessions)
		res.setHeader('Access-Control-Allow-Credentials', true);

		res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");

		// Set the X-Frame-Options to avoid ClickJacking attacks 
		res.setHeader('X-Frame-Options', 'SAMEORIGIN');

		// Remove the header X-Powered-By to prevent Server Leak information
		res.removeHeader("X-Powered-By");

		// Pass to next layer of middleware
		next();
	});

	/*****************************/
	/* temp start */
	/*****************************/
	/*
	var elasticsearch = require('elasticsearch');
	var client = new elasticsearch.Client({
	  host: 'localhost:9200',
	  log: 'trace'
	});

	client.ping({
	  // ping usually has a 3000ms timeout 
	  requestTimeout: Infinity,
 
	  // undocumented params are appended to the query string 
	  hello: "elasticsearch!"
	}, function (error) {
	  if (error) {
		console.trace('elasticsearch cluster is down!');
	  } else {
		console.log('All is well');
	  }
	});

	client.index({
	  index: 'sample',
	  type: 'document',
	  id: '1',
	  body: {
			  name: 'Reliability', 
			  text: 'Reliability is improved if multiple redundant sites are used, which makes well-designed cloud computing suitable for business continuity.'
	  }
	}, function (error, response) {
	  console.log(response);
	});

	client.search({
			index: 'sample',
			type: 'document',
			body: {
				query: {
					query_string:{
					   query:"Reliability"
					}
				}
			}
	}).then(function (resp) {
		console.log(resp);
	}, function (err) {
		console.log(err.message);
	});

	client.search({
	  q: 'pants'
	}).then(function (body) {
	  var hits = body.hits.hits;
	}, function (error) {
	  console.trace(error.message);
	});

	client.search({
	  index: 'twitter',
	  type: 'tweets',
	  body: {
		query: {
		  match: {
			body: 'elasticsearch'
		  }
		}
	  }
	}).then(function (resp) {
		var hits = resp.hits.hits;
	}, function (err) {
		console.trace(err.message);
	});

	/*****************************/
	/* temp end */
	/*****************************/
    
    // attach router handlers
    routes.attachHandlers(app);

	app.use(express.static('public', {                 // set the static files location /public/img will be /img for users
	  etag: true, // Just being explicit about the default.
	  lastModified: true,  // Just being explicit about the default.
	  setHeaders: (res, path) => {
	  	if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif')) {
	      res.setHeader('Cache-Control', 'max-age=31536000');
	  	}
/*
	    const hashRegExp = new RegExp('\\.[0-9a-f]{8}\\.');

	    if (path.endsWith('.html')) {
	      // All of the project's HTML files end in .html
	      res.setHeader('Cache-Control', 'no-cache');
	    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
	      res.setHeader('Cache-Control', 'max-age=31536000');
	    } else if (hashRegExp.test(path)) {
	      // If the RegExp matched, then we have a versioned URL.
	      res.setHeader('Cache-Control', 'max-age=31536000');
	    } */
	  },
	}));

	const EventManager = require("./events/EventManager");
	let eventManager = EventManager.getInstance();
	events.registerEvents(eventManager);
    
//    var mongo = require("./utils/mongodb.js");

	/* handle all unknown routes */
	app.get('*', function(req, res, next) {
	  var err = new Error();
	  err.status = 404;
	  next(err);
	});

	// handling 404 errors
	app.use(function(err, req, res, next) {

	  if(err.status !== 404) {
  
	  	//TODO: here log the error
	    console.log("handling error 0 " + err);

	    //TODO: Detect error code, separate out. Send using custom logging
//		res.status(err.status || 500);
		if (app.get('env') === 'development')
			res.json({"statuscode":(err.code || -300), "message":err.message, "error": err, "stack":err.stack});
		else {
			//TODO: detect err.code, err.errno & return the message appropriately
			res.json({"statuscode":(err.code || -300), "message":err.message});
		}

	  }

	  else {

		res.status(err.status || 400);
		res.json({"status":-300, "message":"Page not found"});

	  }

	});

return app;

};


/*
var mongoose   = require('mongoose');
var mysql      = require('mysql');

var Bear   = require('./app/models/bear');

// configure app to use bodyParser()
// this will let us get the data from a POST

var port = process.env.PORT || 8080;        // set our port

//mongoose.connect('mongodb://node:node@novus.modulusmongo.net:27017/Iganiq8o'); // connect to our database
mongoose.connect('mongodb://127.0.0.1:27017/bear'); // connect to our database
var connection = mysql.createConnection ({
 host:'localhost',
 user:'root',
 password:'rupesh'
});


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
*/
