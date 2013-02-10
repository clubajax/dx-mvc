define([
	'dojo/_base/declare',
	'dojo/Stateful',
	'./util/Evented',
	'dojo/when',
	'dx-alias/lang',
	'dx-alias/log'
], function (declare, Stateful, Evented, when, lang, logger) {
	
	var log = logger('MDL', 1);
	
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
	
	var Model = declare([Stateful, Evented], {
		//	summary:
		//		A base class for data models.
		_errors: null,
		_schema: null,
		_defaults: null,
		_committedValues: null,
		
		// TODO
		// errorMessages
		// 		nested objects for a message for each validation property
		// errorHandling
		// 		what to do with an error - display message? show a div?
		
		store: null,

		constructor: function (params) {
			this._errors = {};
			lang.mix(this, this._defaults);
			
			//this._committedValues = lang.mix({}, [this._defaults, params]);
		},

		save: function (skipValidation) {
			// should this throw an error?
			// make save optional?
			if (!skipValidation && !this.validate()) {
				console.warn("dx-mvc/Model did not validate");
				return false;
			}
			
			return this.store.put(this);
		},

		revert: function () {
			this.set(this._committedValues);
		},

		get: function(key){
			if(!key){
				// return entire object
				var o = {};
				for(var k in this._schema){
					o[k] = this.get(k);
				}
				return o;
			}
			var value = this.inherited(arguments);
			if(this._schema[key] === Model.OBJECT){
				var obj = this[key];
				for(var k in obj){
					if(obj[k] === true){
						return k;
					}
				}
			}
			if(this._schema[key] === Model.ARRAY){
				log('TODO: ARRAY');
			}
			return value;
		},

		set: function (key, value) {
			if (typeof key === "object") {
				// Stateful class will loop through the object and redirect
				// properties here
				return this.inherited(arguments);
			}
			
			// type coercion
			else if (key in this._schema) {
				var type = this._schema[key];
				
				// allow type coersion
				if (type === Model.STRING) {
					value = lang.trim( "" + value );
				}
				else if (type === Model.NUMBER) {
					value = +value;
				}
				else if (type === Model.BOOLEAN) {
					value = (value === "false" || value === "0" || Array.isArray(value) && !value.length) ? false : !!value;
				}
				else if (typeof type === Model.FUNCTION && !(value instanceof type)) {
					value = new type(value);
				}
				var oldvalue = this.get(key);
				this.inherited(arguments);
				delete this._errors[key];
			}
			
			// emit changes
			if(oldvalue != null && (this._initialized || this._defaults[key] !== oldvalue)){
				log('emit', key, value);
				this.emit('change', {
					value:value,
					oldvalue:oldvalue,
					key:key
				});
			}
			
			
			return value;
		},
		
		
		
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
	
	Model.ARRAY = 'array';
	Model.OBJECT = 'object';
	Model.NUMBER = 'number';
	Model.STRING = 'string';
	Model.BOOLEAN = 'boolean';
	Model.FUNCTION = 'function';
	
	Model.RADIO = 'radio';
	
	return Model;
});