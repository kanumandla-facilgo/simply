app.controller('usercontroller', function ($scope, $http, $location, userService, orderService, utilService,  $routeParams, $rootScope, $route, hotkeys, APIInterceptor, flash) {

  $scope.utilService = utilService;

  //validate and show designs
  $scope.validateAndShowDesigns = function() {

 	userService.authenticate($scope.username, $scope.password, $scope.ccode, getSessionType(), function(response) {
 		if (response.statuscode == 0 && response.data && response.data.session.user) {

 			$scope.session      = response.data.session;
			$scope.successlogin = true;
			$rootScope.login    = true;
			$rootScope.sid      = $scope.session.id;
			
			utilService.initializeSession(response.data.session);

			if (response.data.session.user.sys_role_id == utilService.isUserAnAdministrator)
				$rootScope.access_right = 2;

			if (response.data.session.user.sys_role_id == utilService.isUserACompanyUser)
				$rootScope.access_right = 4;

			if (response.data.session.user.sys_role_id == utilService.isUserASalesPerson)
				$rootScope.access_right = 8

			if (response.data.session.user.sys_role_id == utilService.isUserAnAgent)
				$rootScope.access_right = 16

			if (response.data.session.user.sys_role_id == utilService.isUserACustomerAdmin)
				$rootScope.access_right = 32

			if (response.data.session.user.sys_role_id == utilService.isUserACustomerUser)
				$rootScope.access_right = 64

			//clear out path - in case if needed
			//$location.url($location.path());

			//$location.path(getRedirectURL($scope.session.id));
			let templateid = response.data.session.company.template_id;
			let remindersCompany = (templateid == 6302 ? true: false);
			APIInterceptor.redirectToAttemptedUrl(remindersCompany);
			//redirect();

 		}
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 	return;
 	
  };

  function getUrlParameters(url) { 
    var parameters = {};
    url = decodeURIComponent(url);
    url = url.replace(/&amp;/g, "&")
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                parameters[key] = value;
    });
      
    return parameters;
}

$scope.prevSlide = function() {
    $('#myCarousel').carousel('prev');
};

$scope.nextSlide = function() {
    $('#myCarousel').carousel('next');
};
  
  //validate and show designs
  $scope.validatAndShowData = function() {

 	var url = APIInterceptor.getRedirectedURL();;
 	if(url.includes("orders/view"))
 	{
	 	var orderid = url.split('/').pop();
	 	orderService.findByIdWithCustomerCode(orderid, $scope.phone, function(response){
			if (response.statuscode == 0 && response.data && response.data.order) {
				userService.setCustomerCode($scope.phone);
				$location.path(url);
			}
			else
				alert(response.message)
		});
	}
	else if((url.includes("shares")))
	{
		createOneTimeSession(url, $scope.phone);	
	}
 	return;
 	
  };

  hotkeys.bindTo($scope).add({
		'combo': 'alt+s',
		'description': 'Save Users',
		callback: function() {
			if ($rootScope.title == "Add User" || $rootScope.title == "Edit User")
				$scope.saveUser();
			else if ($rootScope.title == "Add Role" || $rootScope.title == "Edit Role")
				$scope.saveRole();

		}
	});

  var createOneTimeSession = function(url, customer_code) {
  	var categoryid = url.substr(0, url.indexOf('?')).split('/').pop(); 
	var urlParams = getUrlParameters(url);
	var access_code = urlParams["access_code"];
  	userService.createOneTimeSession(categoryid, access_code, customer_code, function(response){
		if (response.statuscode == 0 && response.data && response.data.session) {

			userService.setCustomerCode(customer_code);

			utilService.initializeSession(response.data.session);
			if (response.data.session.user.sys_role_id == utilService.isUserAnAdministrator)
				$rootScope.access_right = 2;

			if (response.data.session.user.sys_role_id == utilService.isUserACompanyUser)
				$rootScope.access_right = 4;

			if (response.data.session.user.sys_role_id == utilService.isUserASalesPerson)
				$rootScope.access_right = 8

			if (response.data.session.user.sys_role_id == utilService.isUserAnAgent)
				$rootScope.access_right = 16

			if (response.data.session.user.sys_role_id == utilService.isUserACustomerAdmin)
				$rootScope.access_right = 32

			if (response.data.session.user.sys_role_id == utilService.isUserACustomerUser)
				$rootScope.access_right = 64

			$location.path(url);
		}
		else
			alert(response.message)
	});
  }

  var redirect = function() {
 
 /*
  	if (
  	    utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_CREATE) == '1' ||
  	    utilService.getPermission(utilService.CONST_PERMISSION_CUSTOMER_UPDATE) == '1'
  	   )
  	   return "/customers/" + sessionid;

  	if (
  	    utilService.getPermission(utilService.CONST_PERMISSION_USER_CREATE) == '1' ||
  	    utilService.getPermission(utilService.CONST_PERMISSION_USER_UPDATE) == '1'
  	   )
  	   return "/users/" + sessionid;

  	if (
  	    utilService.getPermission(utilService.CONST_PERMISSION_CATEGORY_CREATE) == '1' ||
  	    utilService.getPermission(utilService.CONST_PERMISSION_CATEGORY_UPDATE) == '1'
  	   )
  	   return "/categories/" + sessionid;
*/
	 //return "/Home/" + sessionid + '?withproductsonly=1';

	// if (utilService.isUserASalesPerson() || utilService.isUserAnAgent() || utilService.isUserACustomer())
	// 	$location.path("/Home/" + sessionid ).search( {withproductsonly:1});
	// else
	// 	$location.path("/orders/" + sessionid);

	$location.path("/users/dashboard");

//  	 return "/orders/" + sessionid;

  };

  $scope.showCustomerValidation = function()
  {
  	var url = APIInterceptor.getRedirectedURL();
  	if((url.includes("orders/view")) || (url.includes("shares")))
  		return true;
  	return false;
  }

  if ($rootScope.action == "show_login") {
  	if(userService.isAuthenticated())
  		$location.path("/users/dashboard");
  	else {
		var url = APIInterceptor.getRedirectedURL();
		if(url.includes("shares"))
		{
			var cust_code = userService.getCustomerCode();
			if(cust_code != undefined) 
				createOneTimeSession(url, cust_code);
		}
	}
  }

  $scope.setUserSortParameters = function(sortby) {

		if ($scope.sortBy == sortby) {
			$scope.sortDirection = $scope.sortDirection * -1;
		 }
		 else {
			$scope.sortBy = sortby;
			$scope.sortDirection = 1;
		}

  }

  //get users
  $scope.getUsers = function() {

 	userService.getUsers(null, null, null, $scope.sortBy, $scope.sortDirection, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.userlist) {

 			$scope.userlist     = response.data.userlist;
 		
 		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 	return;
 	
  };

  //get user
  $scope.getUser = function(userid) {
	
 	userService.getUser(userid, function(response) {
 		if (response.statuscode == 0 && response.data && response.data.user) {

 			$scope.user     = response.data.user;
 		
 		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 	return;
 	
  };
  //get roles

  $scope.setRoleSortParameters = function(sortby, sortdirection) {

		if ($scope.sortBy == sortby) {
			$scope.sortDirection = $scope.sortDirection * -1;
		 }
		 else {
			$scope.sortBy = sortby;
			$scope.sortDirection = 1;
		}

  }

  $scope.getRoles = function(){

  	userService.getRoles($scope.sortBy, $scope.sortDirection, function(response) {
		if (response.statuscode == 0 && response.data && response.data.rolelist) {

			$scope.rolelist = response.data.rolelist;
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
		else {
			flash.pop({title: "", body: response.message, type: "error"});
		}
	});

  };

  //get customers
  $scope.getCustomers = function() {
	
 	userService.getCustomers(function(response) {
 		if (response.statuscode == 0 && response.data && response.data.customerlist) {

 			$scope.userlist     = response.data.customerlist;
 		
 		}
 		else if (response.statuscode === -100)  {
			$location.path("/Login/");
 		} 
 		else {
 			flash.pop({title: "", body: response.message, type: "error"});
 		}
 	});

 	return;
 	
  };
  
  $scope.showChangePasswordForm = function (id) {
    userService.getSession(function (response) {
		if (response.statuscode == 0 && response.data && response.data.session) {
			if ($routeParams.userid != response.data.session.user.id && response.data.session.permissionlist[utilService.CONST_PERMISSION_UPDATE_PASSWORD] != "1") {
				alert('You do not have permission to update password of other user.');
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
			else
				$location.path("/users/password/" + id);
		}
    
    });

  };

  $scope.showHideClass = 'fas fa-eye';
  $scope.passwordtype = "password";

  $scope.showPassword = function(){
    if($scope.passwordtype == 'password')
    {
     $scope.passwordtype = 'text';
     $scope.showHideClass = 'fas fa-eye-slash';
    }
    else
    {
     $scope.passwordtype = 'password';
     $scope.showHideClass = 'fas fa-eye';
    }
   
  };

  $scope.updatepassword = function () {
  
 	$scope.isDiabled = true;

 	userService.updatePassword (
  		$scope.user.login_name,
  		$scope.user.currentpassword,
  		$scope.user.password,
  		
		function(response) {
			if (response.statuscode == 0) {
				flash.pop({title: "", body: "Password updated succesfully", type: "success"});
				$location.path("/users/");
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
			else {
				flash.pop({title: "", body: response.message, type: "error"});
			}
		}
	);
  
  }

   $scope.deleteUser = function(user) {
 	if (confirm("Are you sure you want to delete the user?")) {
		userService.deleteUser(
			user.id,
			function(response) {
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "User deleted succesfully", type: "success"});
					$route.reload();
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
		});
	}

  };

  //get users
  $scope.saveUser = function(id) {
 
 	$scope.isDiabled = true;

  	$scope.user.first_name = utilService.applyCapitalization($scope.user.first_name);
  	$scope.user.last_name = utilService.applyCapitalization($scope.user.last_name);

	if ($scope.editmode) {

		userService.editUser(
					$scope.user.id,
					$scope.user.first_name, 
					$scope.user.last_name, 
					$scope.user.login_name,
					$scope.user.role_id,
					$scope.user.status_id,
					$scope.user.address_id,
					$scope.user.address.email1,
					$scope.user.address.phone1,
					
					function(response) {
						if (response.statuscode == 0 && response.data.user) {
							flash.pop({title: "", body: "User updated succesfully", type: "success"});
							$scope.editmode = false;
							$location.path("/users/");
						}
						else if (response.statuscode === -100)  {
							$location.path("/Login/");
						}
						else {
							$scope.editmode = true;
							flash.pop({title: "", body: response.message, type: "error"});
						}
					}
		);
		

	}
 	else {

		userService.createUser(
					$scope.user.first_name, 
					$scope.user.last_name, 
					$scope.user.login_name,
					$scope.user.password,
					$scope.user.role_id,
					$scope.user.address.email1,
					$scope.user.address.phone1,
					
					function(response) {
						if (response.statuscode == 0 && response.data.user) {
							flash.pop({title: "", body: "User created succesfully", type: "success"});
							$location.path("/users/");
		
						}
						else if (response.statuscode === -100)  {
							$location.path("/Login/");
						}
						else {
							flash.pop({title: "", body: response.message, type: "error"});
						}
					}
		);

	}

 	return;
 	
  };

  //get users
  $scope.saveRole = function(id) {
 
 	$scope.isDiabled = true;

  	$scope.role.name = utilService.applyCapitalization($scope.role.name);

	if ($scope.editmode) {

		userService.editRole(
					$scope.role.id,
					$scope.role.name, 
					$scope.role.description, 
					$scope.permissionlist,
					
					function(response) {
						if (response.statuscode == 0 && response.data.role) {
							flash.pop({title: "", body: "Role updated succesfully", type: "success"});
							$scope.editmode = false;
							$location.path("/roles/");
						}
						else if (response.statuscode === -100)  {
							$location.path("/Login/");
						}
						else {
							$scope.editmode = true;
							flash.pop({title: "", body: response.message, type: "error"});
						}
					}
		);


	}
 	else {

		userService.createRole(
					$scope.role.name, 
					$scope.role.description, 
					$scope.role.sys_role_id,
					$scope.permissionlist,
					
					function(response) {
						if (response.statuscode == 0 && response.data.role) {
							flash.pop({title: "", body: "Role created succesfully", type: "success"});
							$location.path("/roles/");
						}
						else if (response.statuscode === -100)  {
							$location.path("/Login/");
						}
						else {
							flash.pop({title: "", body: response.message, type: "error"});
						}
					}
		);

	}

 	return;
 	
  };

 $scope.deleteRole = function (id) {
 	if (confirm('Are you sure?')) {
		userService.deleteRole(
			id,
			
			function(response) {
				if (response.statuscode == 0) {
					flash.pop({title: "", body: "Role updated succesfully", type: "success"});
					$route.reload();
					//$location.path("/roles/");
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					alert(response.message);
					flash.pop({title: "", body: response.message, type: "error"});
				}
			}
		);
	}
 };
 
 $scope.userRowClick = function(id) {
 	if ($scope.isEditUserAllowed())
 		$scope.showEditUserForm(id);
 }

 $scope.showEditUserForm = function(id) {
  	$scope.editmode = true;
	$location.path("/AddUser/" + id);
 };

 $scope.roleRowClick = function(id) {
 	if ($scope.isEditRoleAllowed())
 		$scope.showEditRoleForm(id);
 }

 $scope.showEditRoleForm = function(id) {
  	$scope.editmode = true;
	$location.path("/AddRole/" + id);
 };

 $scope.showAddUserForm = function() {
  	$scope.editmode = false;
 	$scope.user = $scope.initUser();
	$location.path("/AddUser/");
 };

 $scope.showAddRoleForm = function() {
  	$scope.editmode = false;
 	$scope.initRole();
	$location.path("/AddRole/");
 };
 
 $scope.isAddRoleAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_ROLE_CREATE) == '1');
 };

 $scope.isEditRoleAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_ROLE_UPDATE) == '1');
 };
 
 $scope.isDeleteRoleAllowed = function(roletypeid) {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_ROLE_UPDATE) == '1' && roletypeid != 4002);
 };

 $scope.isAddUserAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_USER_CREATE) == '1');
 };

 $scope.isEditUserAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_USER_UPDATE) == '1');
 };

 $scope.isDeleteUserAllowed = function() {
 	return (utilService.getPermission(utilService.CONST_PERMISSION_USER_DELETE) == '1');
 };

 $scope.isChangePasswordAllowed = function(id) {
  	return (utilService.getPermission(utilService.CONST_PERMISSION_UPDATE_PASSWORD) == '1' || id == $scope.userid);
 };
 
 $scope.initUser = function() {
     return userService.initUser();  //{"first_name":"", "last_name":"", "email":"", "password":"", "gender":"", id:-1};
 };

 if ($rootScope.title == "Add User") {
     $scope.user = $scope.initUser();
 }

 $scope.initRole = function() {
     	$scope.role = {"name":"", "description":"", id:-1};

		userService.getAllPermissions(function(response) {
			if (response.statuscode == 0 && response.data && response.data.permissionlist) {
				$scope.permissionlist     = response.data.permissionlist;
			}
			else if (response.statuscode === -100)  {
				$location.path("/Login/");
			}
		});
 };
 
 $scope.save = function () {
  
 	$scope.isDiabled = true;
	$scope.saveUser();
 	$scope.editmode = false;
 };
 
 $scope.userid    = $routeParams.id;
 //$scope.ccode     = 'abc24';

  if ($rootScope.title == "Users" || $rootScope.title == "Edit User") {

 		$scope.state_list = utilService.getStates();

		// if the design ID passed, get that design, else all
		if ($routeParams.userid == undefined) {
			//this is default function to call when controller is loaded
			$scope.getUsers();
			$scope.editmode = true;
		}
		else {
			userService.getUser($routeParams.userid, function(response) {
				if (response.statuscode == 0 && response.data && response.data.user) {
					$scope.user     = response.data.user;
					userService.getRoles(undefined, undefined, function(response) {
						if (response.statuscode == 0 && response.data && response.data.rolelist)  {
								$scope.rolelist = response.data.rolelist;
						}
						else
							$scope.rolelist = [];
					});
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
				$scope.editmode = true;
			});
		}
  }

  if ($rootScope.title == "Logout") {
  		let templateid = utilService.getTemplateID();
  		let remindersCompany = (templateid == 6302 ? true: false);

		userService.logout(function(response) {	
			APIInterceptor.setToDefaultRedirectURL(remindersCompany);
			if(remindersCompany)
				$location.path("/reminders");
			else
				$location.path("/");
		});
  }
if ($rootScope.title == "FeaturesPage") {
			$location.path("/FeaturesPage");
  }
  if ($rootScope.title == "ToHome") {
			$location.path("/ToHome");
  }
  if ($rootScope.title == "Roles" || $rootScope.title == "Edit Role") {
		// if the design ID passed, get that design, else all
		if ($routeParams.roleid == undefined) {
			//this is default function to call when controller is loaded
			$scope.getRoles();
		}
		else {
			userService.getRole($routeParams.roleid, function(response) {
				if (response.statuscode == 0 && response.data && response.data.role) {
					$scope.role     = response.data.role;
					userService.getPermissionsByRoleId($routeParams.roleid, function(response) {
						if (response.statuscode == 0 && response.data && response.data.permissionlist) {
							$scope.permissionlist     = response.data.permissionlist;
						}
					});
				}
				else if (response.statuscode === -100)  {
					$location.path("/Login/");
				}
				else {
					flash.pop({title: "", body: response.message, type: "error"});
				}
				$scope.editmode = true;
			});
		}
  }
  else if ($rootScope.title == "Add Role") {
	userService.getAllPermissions(function(response) {
		if (response.statuscode == 0 && response.data && response.data.permissionlist) {
			$scope.permissionlist     = response.data.permissionlist;
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
	});
  }
  else if ($rootScope.title == "Add User") {
 	$scope.state_list = utilService.getStates();
	userService.getRoles(undefined, undefined, function(response) {
		if (response.statuscode == 0 && response.data && response.data.rolelist) {
			$scope.rolelist = response.data.rolelist;
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
		else
			$scope.rolelist = '';
	});
  }
/*
  else if ($rootScope.title == "Customers" || $rootScope.title == "Edit Customer") {
		// if the design ID passed, get that design, else all
		if ($routeParams.userid == undefined) {
			//this is default function to call when controller is loaded
			$scope.getCustomers();
			$scope.editmode = true;
		}
		else {
			$scope.getDesigns($routeParams.designid);
			$scope.editmode = false;
		}
  }
*/  
else if ($rootScope.title == "Change Password") {
	userService.getUser($scope.userid, function(response) {
		if (response.statuscode == 0 && response.data) {
			$scope.user     = response.data.user;
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
	});
  }
  else if ($rootScope.title == "HomePage") {
	if(userService.isAuthenticated()){
		$location.path('users/dashboard');
	}
  }
/*  else { //add form
  	$scope.initUser();
  	$scope.editmode = true; //init with true
  	$scope.getUsers($scope.sessionid);
  }
 */
});
                 

 