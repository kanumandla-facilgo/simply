app.controller('workflowcontroller', function ($scope, $http, $location,  utilService, workflowService, masterService, $routeParams, $rootScope, flash) {

 $scope.utilService = utilService;

 $scope.setup_view = function(){

 	workflowService.getWorkflowHierarchy(function(response){
		if (response.statuscode == 0 && response.data && response.data.workflow) {
			$scope.workflowlist = response.data.workflow.workflow_hierarchy;
			$scope.roleslist = response.data.workflow.roles;
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
		else {
			$scope.workflowlist = [];
		}
	});

 };
 
 $scope.validateHierarchy = function(){
 
	var workflowlist = $scope.workflowlist;
	var counter;
	var cycle={};
	for(counter=0;counter< workflowlist.length; counter++)
	{
		var workflow = workflowlist[counter];
		if(workflow.reportTo)
		{
			workflow.to_roles_id 	= workflow.reportTo.id;
			workflow.to_roles_name 	= workflow.reportTo.name;
		}
		
		if(workflow.roles_id == workflow.to_roles_id)
		{
			return false;
		}
		cycle[workflow.roles_id] = workflow.to_roles_id;
		
	}
	
	for(counter=0;counter< workflowlist.length; counter++)
	{
		var workflow = workflowlist[counter];
		var arr_parents = get_parents(cycle, workflow.to_roles_id, [],0);
		if($.inArray(workflow.roles_id, arr_parents ) >= 0)
		{
			return false;	
		}
		
	}
	return true;
 };
 
 function get_parents(cycle, role_id,arr_parents, level)
 {
	if(role_id == undefined)
		return;
	if(cycle[role_id] == undefined)
		return arr_parents;
	else
	{
		if($.inArray(role_id, arr_parents ) >= 0)
		{
			arr_parents.push(role_id);
			return arr_parents;
		}
		else
		{
			arr_parents.push(role_id);
			var a = get_parents(cycle, cycle[role_id],arr_parents, level+1);
		}
		return arr_parents;
	}
	
 }
 
 $scope.saveHierarchy = function(){
	if($scope.validateHierarchy() == false)
	{
		alert("Cyclic Redundancy Error");
		return;
	}

	$scope.isDisabled = true;

	workflowService.createWorkflowHierarchy($scope.workflowlist, function(response){
		if (response.statuscode == 0 && response.data && response.data.workflowlist) {
			flash.pop({title: "", body: "Workflow hierarchy saved succesfully", type: "success"});
			$location.path("/workflowsetup/");
		
		}
		else if (response.statuscode === -100)  {
			$location.path("/Login/");
		}
		else {
			$scope.workflowlist = [];
			$scope.isDisabled = false;
		}
	});
 }
 
 $scope.default_populate = function(workflowitem)
 {
	var counter= 0;
	var roleslist = $scope.roleslist;
	for(counter=0; counter < roleslist.length; counter++)
	{
		if(workflowitem.to_roles_id == roleslist[counter].id)
		{
			workflowitem.reportTo = roleslist[counter];
			return;
		}
	}
 }
 
 $scope.setup_view();	
});
 