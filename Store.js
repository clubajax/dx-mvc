define([
	'dojo/_base/declare',
	'dojo/Deferred',
	'dojo/store/Memory',
	'dojo/store/Observable',
	'./ModelledStoreMixin'
], function (declare, Deferred, Memory, Observable, ModelledStoreMixin) {
	var Store = declare([Memory, Observable, ModelledStoreMixin]);
	
	Store.getObservable = function(options){
		var store = Observable(new Store(options));
		return store;
	};
	
	return Store;
});