/*
 * ValidationDisplay adds an error css class to elements that do not
 * pass validation.
 * To be mixed in with BindElements
 */
define([
	'dojo/_base/declare',
	'../util/dom',
	'dx-alias/log'
], function(declare, dom, logger){
	
	var log = logger('VDM', 1);
	
	var Class = declare('dx-mvc/form/ValidationDisplay', null, {
		
		invalidClass:'dxInvalid',
		
		constructor: function(){
			this._errorNodes = {};
		},

		reset: function(){
			for(var key in this._errorNodes){
				var node = this._errorNodes[key];
				dom.css.remove(node.parentNode, this.invalidClass);
			}
			this._errorNodes = {};
		},
		
		validate: function(){
			this.reset();
			var valid = this.inherited(arguments);
			log(' ------------- VALIDATED', valid );
			if(!valid){
				var errorObject = this.model.getErrors();
				log('ERRORS', errorObject);
				
				for(var key in errorObject){
					var node = this.getElement(key);
					this._errorNodes[key] = node;
					dom.css.add(node.parentNode, this.invalidClass);
				}
				
			}
		}
		
	});
	
	Class.name = 'VDM';
	
	return Class;
});