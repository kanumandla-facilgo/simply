var Err = function () {
  this.code    = "";
  this.message = "";
};

function Err(code, message) {
	this.code    = code;
	this.message = message;
}
/*
Err.prototype.code = function(code) {
 this.code = code;
}

Err.prototype.message = function(message) {
 this.message = message;
}
*/
Err.prototype             = Object.create(Error.prototype);
Err.prototype.constructor = Err;

module.exports = Err;

