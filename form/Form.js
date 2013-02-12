define([
	'dojo/_base/declare',
	'./BindModel',
	'./BindElements',
	'./ValidationDisplay'
], function(declare, BindModel, BindElements, ValidationDisplay){
	return declare([ BindModel, BindElements, ValidationDisplay ]);
});