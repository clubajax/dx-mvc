define([
	'dojo/_base/declare',
	'./BindModel',
	'./Behavior',
	'./BindElements',
	'./ValidationDisplay'
], function(declare, BindModel, Behavior, BindElements, ValidationDisplay){
	
	return declare('dx-mvc.form.Form', [ ValidationDisplay, BindElements, Behavior, BindModel ]);

});