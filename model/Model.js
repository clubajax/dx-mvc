define([
	'dojo/_base/declare',
	'dojo/Stateful',
	'dx-alias/Evented',
	'dojo/when',
	'dx-alias/lang',
	'dx-alias/log'
], function (declare, Stateful, Evented, when, lang, logger) {
	
	var log = logger('MDL', 1);
	
	var Model = declare('dx-mvc.model.Model', [Stateful, Evented], {
		//	summary:
		//		A base class for data models.
		_errors: null,
		_schema: null,
		_defaults: null,
		_committedValues: null,
		
		store: null,

		constructor: function (params) {
			this._errors = {};
			lang.mix(this, this._defaults);
			if(!this._schema){
				throw new Error('A schema is required for models');
			}
			if(!this._defaults){
				this._defaults = {};
			}
			
			if(this.postConstructor){
				this.postConstructor(params);
			}
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
				// new model can just do: item.set(model);
				return this.inherited(arguments);
			}
			
			// ensure property is allowed
			if (key in this._schema) {
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
			
			else{
				// invalid key
				return null;
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