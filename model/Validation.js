define([
	'dojo/_base/declare',
	'dx-alias/log'
], function(declare, logger){
	
	var log = logger('VAL', 1);
	
	var isNull = function(value){
		// null, undefined, and '' are all isNull
		if(value === false || value === 0){
			return false;
		}
		return !value;
	};
	
	var runValidationTest = function(key, value, validatorType, validatorValue){
		log('    standardValidation', validatorType, validatorValue, '||', key, value);
		if(validatorType !== 'required' && isNull(value)) return true;
		
		switch(validatorType){
			case 'required':
				if(validatorValue === false){
					return true;
				}
				return !isNull(value);
			
			case 'is':
				return validatorValue === value;
			
			case 'custom':
			case 'function':
				console.log(' XXXXXXXXXXXX validate CUSTOM:::::', validatorType, typeof validatorValue, key, '('+typeof value+')', value);
				return validatorValue(value);
				
			case 'regexp':
			case 'pattern':
				return validatorValue.test(value);
			
			case 'min':
				//if(value === 0) return true; // type coercion forces this.... hmm...
				//console.log(' XXXXXXXXXXXX validate MIN:::::', validatorType, validatorValue, key, '('+typeof value+')', value);
				if(typeof value === 'number'){
					return value >= validatorValue;
				}
				return value.length >= validatorValue;
			
			case 'max':
				if(value === 0) return true; // type coercion forces this.... hmm...
				if(typeof value === 'number'){
					return value <= validatorValue;
				}
				return value.length <= validatorValue;
			
			case 'unique':
				// hm... this may need to be async...
				return true;
			
			case 'options':
				//console.log(' XXXXXXXXXXXX validate options:::::', validatorType, validatorValue, key, '('+typeof value+')', value);
				return validatorValue.indexOf(value) > -1;
		}
		// no validator found
		return true;
	};
	
	var testValid = function(key, value, validatorType, validatorValue, instance){
		var result = runValidationTest(key, value, validatorType, validatorValue);
		if(!result){
			// set error
			instance.addError(key, validatorType);
		}
		return result;
	}
	
	return declare(null, {
		
		validate: function ( ) {
			this.clearErrors();

			var validators = this._validators;
			for (var key in validators) {
				//log('  validate:', key);

				var value = this.get(key);
				var keyValidators = validators[key];
				//log('  keyValidators:', keyValidators);
				
				if(keyValidators instanceof Object){
					for(var validatorType in keyValidators){
						var validatorValue = keyValidators[validatorType];
						if(!testValid(key, value, validatorType, validatorValue, this)){
							break;
						}
					}
				}
			}
			return this.isValid();
		},

		isValid: function () {
			for (var key in this._errors) { return false; }
			return true;
		},

		addError: function (key, error) {
			//	summary:
			//		If in error, validators will call this.
			this._errors[key] = error;
		},

		getErrors: function (/*string?*/ key) {
			return key ? this._errors[key] : this._errors;
		},

		clearErrors: function () {
			this._errors = {};
		}
	});
});