define([
	'dojo/_base/declare',
	'./BindModel',
	'./BindElements',
	'./ValidationDisplay'
], function(declare, BindModel, BindElements, ValidationDisplay){
	
	return declare([ ValidationDisplay, BindModel, BindElements ]);

});