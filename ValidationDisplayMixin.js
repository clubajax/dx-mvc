define([
	'dojo/_base/declare',
	'dx-alias/log'
], function(declare, logger){
	
	var log = logger('VDM', 1);
	
	var Class = declare(null, {
		
		constructor: function(){
			
		},
		
		postCreate: function(){
			
		},
		
		Xvalidate: function(){
			console.log(this);
			var valid = this.model.validate();
			log( 'VALIDATED', valid );
		}
		
	});
	
	Class.name = 'VDM';
	
	return Class;
});