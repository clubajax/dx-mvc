define([
	'dojo/_base/declare',
	'dx-alias/log'
], function(declare, logger){
	
	var log = logger('VDM', 1);
	
	var Class = declare(null, {
		
		invalidClass:'',
		
		constructor: function(){
			
		},
		
		postCreate: function(){
			
		},
		
		validate: function(){
			console.log(this);
			var valid = this.model.validate();
			log( 'VALIDATED', valid );
		}
		
	});
	
	Class.name = 'VDM';
	
	return Class;
});