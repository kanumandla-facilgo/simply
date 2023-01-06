app.service('userService', function($http, $cookies, utilService) {

	this.getUsers = function(roleid, sysroleid, statusid, sortby, sortdirection, callback) {

		let rolestr, sysrolestr, statusstr;

		rolestr    = (roleid    ? "role_id=" + roleid : "");
		sysrolestr = (sysroleid ? "sysrole_id=" + sysroleid : "");
		statusstr  = (statusid  ? "status_id=" + statusid : "");

		let str = "";
		if (rolestr != "") 
			str = (str != "" ? str + "&" + rolestr : rolestr);

		if (sysrolestr != "") 
			str = (str != "" ? str + "&" + sysrolestr : sysrolestr);
	
		if (statusstr != "") 
			str = (str != "" ? str + "&" + statusstr : statusstr);

		if (str != "") 
			str = "?" + str; 
 
		sortby = (sortby ? "sort_by=" + sortby : "");
		sortdirection = (sortdirection ? "sort_direction=" + sortdirection : "");

		if (sortby != "") str = str + (str != "" ? "&" : "?") + sortby;
		if (sortdirection != "") str = str + (str != "" ? "&" : "?") + sortdirection;

		// call API
 		$http.get(utilService.getBaseURL() + "/api/users/" + str).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.getUser = function(id, callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/users/" + id).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.getDashboard = function(callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/dashboard/").success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.getRoles = function(sortby, sortdirection, callback) {

		

		let str = "";
		sortby = (sortby ? "sort_by=" + sortby : "");
		sortdirection = (sortdirection ? "sort_direction=" + sortdirection : "");

		if (sortby != "") str = str + (str != "" ? "&" : "?") + sortby;
		if (sortdirection != "") str = str + (str != "" ? "&" : "?") + sortdirection;

		// call API
 		$http.get(utilService.getBaseURL() + "/api/roles/" + str).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.getAllPermissions = function(callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/permissions/").success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.getRole = function(id, callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/roles/" + id).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.getPermissionsByRoleId = function(roleid, callback) {

		

		// call API
 		$http.get(utilService.getBaseURL() + "/api/roles/" + roleid + "/permissions").success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.deleteRole = function(id, callback) {

		

		// call API
 		$http.delete(utilService.getBaseURL() + "/api/roles/" + id).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.createUser = function(firstname, lastname, loginname, password, roleid, email, phone, callback) {

		

	 	data = {
  					first_name     : firstname,
  					last_name      : lastname,
  					role_id        : roleid,
  					login_name     : loginname,
  					password       : password,
  					email          : email,
  					phone          : phone
  				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/users/", data).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.createRole = function(name, description, sysroleid, permissionlist, callback) {

		

	 	data = {
  					name            : name,
  					description     : description,
  					sysroleid       : sysroleid,
  					permissionlist  : permissionlist
  				};

		// call API
 		$http.post(utilService.getBaseURL() + "/api/roles/", data).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.updatePassword = function(loginname, oldpassword, newpassword, callback) {

		

	 	data = {
  					login_name     : loginname,
  					oldpassword    : oldpassword,
  					newpassword    : newpassword
  				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/users/me/changepassword", data).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.deleteUser = function (id,  callback) {		

 		$http.delete(utilService.getBaseURL() + "/api/users/" + id).success(
					function (response, status, headers) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = null;

							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});

	};

	this.editUser = function(id, firstname, lastname, loginname, roleid, statusid, addressid, email, phone, callback) {

	 	data = {
  					first_name     : firstname,
  					last_name      : lastname,
  					role_id        : roleid,
  					status_id      : statusid,
  					login_name     : loginname,
  					address_id     : addressid,
  					email          : email,
  					phone          : phone
  				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/users/" + id, data).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.editRole = function(id, name, description, permissionlist, callback) {

	 	data = {
  					name            : name,
  					description     : description,
  					permissionlist  : permissionlist
  				};

		// call API
 		$http.put(utilService.getBaseURL() + "/api/roles/" + id, data).success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};

	this.isAuthenticated = function() 
	{
		var storedCookie = $cookies.get("session");
	    if(storedCookie == undefined)
	    { 
	    	return false;
	    }
	    return true;

	};

	this.deleteCookie = function(){
		var storedCookie = $cookies.get("session");
	    if(storedCookie == undefined)
	    {
			$cookies.remove("session");
		}
	}

	this.setCookie = function(sessionID)
	{
		this.deleteCookie();
		$cookies.put("session", sessionID);
	};

	this.getCookie = function()
	{
		return $cookies.get("session");
	    
	};

	// Base64 encoding service used by AuthenticationService
    var Base64 = {

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



	// validates
	this.authenticate = function (username, password, ccode, sessionType, callback) {

	 	data = {
  					company_code     : ccode,
  					session_type_id  : sessionType
  			   };
  			   
  		var authdata = Base64.encode(username + ':' + password);

        $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;

  		$http.post(utilService.getBaseURL() + "/api/users/me/login", data).success(

                        function (response, status, headers) {
                        
                        	if (status == 200 && response.statuscode == "0") 
                        	{

                        		var object = new Object();
	          	            	object.statuscode    = 0;
            	            	object.message       = "Success";
            	            	object.data          = response.data;

								$cookies.put("session", response.data.session.id);
            	            	callback(object);
 
	        	            }
            	            else
            	            {

                        		var object = new Object();
            	            	object.statuscode    = response.statuscode;
            	            	object.message       = response.message;
            	            	object.data          = null;

            	            	callback(object);

            	            }
                        }
                       ).error( 
                       		function (data, status, headers) {

                        		var object = new Object();
            	            	object.statuscode    = "-200";
            	            	object.message       = "Unknown Error";
            	            	object.data          = null;

            	            	//$scope.message       = "Error";
            	            	callback(object);
                        	}
                );

  	};

	// validates
	this.logout = function (callback) {

		data = {};

  		$http.post(utilService.getBaseURL() + "/api/sessions/me/logout", data).success(

                        function (response, status, headers) {
                        
                        	if (status == 200 && response.statuscode == "0") 
                        	{

                        		var object = new Object();
	          	            	object.statuscode    = 0;
            	            	object.message       = "Success";
            	            	object.data          = response.data;
            	            	
            	            	$cookies.remove("session");
            	            	utilService.removeSession();

            	            	callback(object);
 
	        	            }
            	            else
            	            {

                        		var object = new Object();
            	            	object.statuscode    = response.statuscode;
            	            	object.message       = response.message;
            	            	object.data          = null;

            	            	callback(object);

            	            }
                        }
                       ).error( 
                       		function (data, status, headers) {

                        		var object = new Object();
            	            	object.statuscode    = "-200";
            	            	object.message       = "Unknown Error";
            	            	object.data          = null;

            	            	//$scope.message       = "Error";
            	            	callback(object);
                        	}
                );

  	};

/*
	this.getRoles = function(callback) {

		

		// call API
 		$http.get("/api/roles/").success(
					function (response, status, headers,config) {
						if (status == 200 && response.statuscode == "0") {

							var object = new Object();
							object.statuscode    = 0;
							object.message       = "Success";
							object.data          = response.data;
						
							callback(object);
						}
						else {
							var object = new Object();
							object.statuscode    = response.statuscode;
							object.message       = response.message;
							object.data          = null;

							callback(object);
						}
					}
               ).error (
               	function (data, status, headers) {

					var object = new Object();
					object.statuscode    = "-200";
					object.message       = "Unknown Error";
					object.data          = null;

					callback(object);
               	
               	});
	};
 */ 	
  	// validates
	this.logoff = function (callback) {

		

	 	data = {};

  		$http.post(utilService.getBaseURL() + "/api/sessions/me/logout", data).success(
			function (response, status, headers) {
				if (response.statuscode == 0) {
						$rootScope.login       = false;
						$rootScope.sid         = "";
						return;
				}
				else {
					if (response.statuscode == -50) {
						return;
					}
				}
			}).
			error(function (response, status, headers) {
				alert("failed!");
			});

  	};


  	this.getSession = function (callback) {		

  		var sid = this.getCookie();
	 	data = {};

  		$http.get(utilService.getBaseURL() + "/api/sessions/" +sid, data).success(
			function (response, status, headers) {
				if (response.statuscode == 0) {
						var object = new Object();
      	            	object.statuscode    = 0;
    	            	object.message       = "Success";
    	            	object.data          = response.data;

						$cookies.put("session", response.data.session.id);
    	            	callback(object);
				}
				else {
					if (response.statuscode == -100) {
						return callback(response);
						// $location.path("/Login");
					}
					alert(response.statusmessage);
				}
			}).
			error(function (response, status, headers) {
				alert("failed!");
			});

  	};

  	this.createOneTimeSession = function (document_id, access_code, phone_number, callback) {		

  		var sid = this.getCookie();
	 	data = {
	 		"document_id": document_id, 
	 		"access_code": access_code, 
	 		"phone_number": phone_number,
	 		"sessionid": (sid != undefined ? sid : null)
	 	};

  		$http.post(utilService.getBaseURL() + "/api/sessions/", data).success(
			function (response, status, headers) {
				if (response.statuscode == 0) {
						var object = new Object();
      	            	object.statuscode    = 0;
    	            	object.message       = "Success";
    	            	object.data          = response.data;

						$cookies.put("session", response.data.session.id);
    	            	callback(object);
				}
				else {
					if (response.statuscode == -100) {
						var object = new Object();
						object.statuscode    = response.statuscode;
						object.message       = response.message;
						object.data          = null;

						callback(object);
					}
				}
			}).
			error(function (response, status, headers) {
				alert("failed!");
			});

  	};

	this.initUser = function() {
		return {"first_name":"", "last_name":"", "email":"", "password":"", "gender":"", id:-1};
	};

	this.getCustomerCode = function(callback){
		return $cookies.get("customer_code");
	}

	this.setCustomerCode = function(customer_code, callback){
		var expireDate = new Date();
		expireDate.setDate(expireDate.getDate() + 7);
		$cookies.put("customer_code", customer_code, {expires: expireDate});
	}

});
