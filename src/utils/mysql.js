	var mysql   = require('mysql');
	var config   = require('../config/config');

	var pool = mysql.createPool ({
 		connectionLimit: 100,
 		host: config.db_host, //'localhost',
 		user: config.db_username, //'root',
 		password: config.db_password, //rupesh
		database: config.db_database, // 'textile',
		multipleStatements: true
	});
	
//	exports.pool = pool;

	exports.getConnection = function getConnection(callback) {
		pool.getConnection (function (err, connection) {
  			if (err) {
   				console.error('error connecting ' + err.stack);
   				return;
  			}

  			connection.query ("select 1 + 5 as result", function (err, rows) {
     			console.log (rows[0].result);
  			});
  			
  			console.log("a");
  			callback(connection);
  			return connection;
		});
		
		console.log("b");
	};

	exports.openConnection1 = function controllermethod(next, callback) {
		pool.getConnection (function (err, connection) {
  			if (err) {
   				console.error('error connecting ' + err.stack);
   				return next (err);
  			}

  			callback(connection);
  			return connection;
		});
		
	};
	
	exports.openConnection = function controllermethod(callback) {
		pool.getConnection (function (err, connection) {
  			if (err) {
   				console.error('error connecting ' + err.stack);
   				return callback(err);
  			}

			return callback(null, connection);

		});
		
	};

	exports.openConnectionSync = function controllermethod() {
		return new Promise ( (resolve, reject) => {

			pool.getConnection (function (err, connection) {
	  			if (err) {
	   				console.error('error connecting ' + err.stack);
	   				return reject(err);
	  			}

				return resolve(connection);

			});
		});		
	};


	exports.executeSql = function executeSql (query, connection, callback) {
  			connection.query (query, function (err, rows) {

				if (err) {
					console.error('rupesh error executing sql ' + err.stack);
					return callback(err);
				}
				
     			return callback (err, rows);
	
			});
	};

	exports.executeSqlSync = function executeSql (query, list, connection) {
		return new Promise ( (resolve, reject) => {

  			connection.query (query, list, (err, rows) => {

				if (err) {
					console.error('rupesh error executing sql ' + err.stack);
					return reject(err);
				}
				
     			return resolve (rows);
	
			});

		});
	};

	exports.beginTransaction = function beginTransaction (connection, callback) {
		connection.beginTransaction(callback);
	};


	exports.commitTransaction = function commitTransaction (connection, callback) {
		connection.commit(function (err) {
			if (err)
				connection.rollback (function (err) { return callback(err); } );

			return callback();
		});
	};


	exports.rollbackTransaction = function rollbackTransaction (connection, callback) {
		connection.rollback(function (err) {
				if (err)
					return callback(err);
				else
					return callback(null);
			}
		);
	};


	exports.fetch = function fetch(query, connection, next, callback) {
		pool.getConnection (function (err, connection) {
  			if (err) {
   				console.error('error connecting ' + err.stack);
   				return next(err);
  			}

  			connection.query (query, function (err, rows) {
     			return callback (err, rows);
  			});
		});

	};

	
	exports.select = function select(sql, connection) {
		connection.query(sql , function (err, rows) {
			return rows;
		});
	};
	
	exports.closeConnection = function (connection) {
		connection.release();
	};
