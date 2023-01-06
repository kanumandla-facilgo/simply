const EventEmitter = require('events');
var mysql = require("../utils/mysql");
const EventService = require("../services/event");

class EventManager extends EventEmitter {

	static getInstance() {
		if (this.eventManager) {
			return this.eventManager;
		}
		else {
			this.eventManager = new EventManager();
		}
		return this.eventManager;
	}

	fireEvent(eventName, object) {
		if (object)
			this.emit(eventName, object)
		else
			this.emit(eventName);
	};

	on(eventName, callback) {
		super.on(eventName, callback);
	};

	insert(event, callback)
	{
		mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
				EventService.insert(event, connection).then( function(result) {
					mysql.commitTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback(err, result);

					});
                }).catch(function(error){
                    mysql.rollbackTransaction(connection, function () {
						mysql.closeConnection(connection);
						return callback (error, null);
					});
                });  
			});
		});
	}

	insertActivity(event, callback)
	{
		mysql.openConnection(function (err, connection) {
		
		if (err) return callback (err);
		
		connection.beginTransaction(function () {
				EventService.insertActivity(event, connection).then( function(result) {
						mysql.commitTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback(err, result);

						});
                    }).catch(function(error){
                        mysql.rollbackTransaction(connection, function () {
							mysql.closeConnection(connection);
							return callback (error, null);
						});
                    });  
			});
		});
	}

		

}

module.exports = EventManager;
