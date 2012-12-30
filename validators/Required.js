define([
	'dojo/_base/declare',
	'./Validator'		
], function(declare, Validator){
	
	return declare('RequiredValidator', Validator, {
		type:'required',
		validate: function(model, key, value){
			if (value == null || value === "") {
				console.log('CREATE ERROR');
				model.addError(key, this.createError('${key} is required.', key));
				return false;
			}
			return true;
		}
	});
});