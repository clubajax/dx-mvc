define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/Stateful',
	'dojo/Evented',
	'dojo/when'
], function (declare, lang, Stateful, Evented, when) {
	return declare([Stateful, Evented], {
		//	summary:
		//		A base class for data models.
		_errors: {},
		_schema: {},
		_defaults: {},
		_committedValues: {},
		store: null,

		constructor: function (params) {
			this._errors = {};
			lang.mixin(this, this._defaults);
			this._committedValues = lang.mixin({}, this._defaults, params);
		},

		save: function (skipValidation) {
			console.log('SAVE');
			if (!skipValidation && !this.validate()) {
				console.error("did not validate");
				return false;
			}
			
			return this.store.put(this);
		},

		revert: function () {
			this.set(this._committedValues);
		},

		

		set: function (key, value) {
			if (typeof key === "object") {
				return this.inherited(arguments);
			}
			else if (key in this._schema) {
				var type = this._schema[key];

				if (type === "string") {
					value = "" + value;
				}
				else if (type === "number") {
					value = +value;
				}
				else if (type === "boolean") {
					value = (value === "false" || value === "0" || Array.isArray(value) && !value.length) ? false : !!value;
				}
				else if (typeof type === "function" && !(value instanceof type)) {
					value = new type(value);
				}
				var oldvalue = this.get(key);
				this.inherited(arguments, [ key, value ]);
				delete this._errors[key];
			}
			
			// emit changes
			if(oldvalue != null && this._defaults[key] !== oldvalue){
				this.emit('change', {
					value:value,
					oldvalue:oldvalue,
					key:key
				});
			}
			return value;
		},

		validate: function ( fields) {
			this.clearErrors();

			var validators = this._validators;
			for (var key in validators) {
				console.log('  validate:', key);
				if (fields && fields.indexOf(key) === -1) {
					continue;
				}

				var fieldValidators = validators[key];
				for (var i = 0, validator, value; (validator = fieldValidators[i]); ++i) {
					// The value is retrieved fresh on each iteration because a validator might change it
					value = this.get(key);

					if (validator.options) {
						if (validator.options.allowEmpty && (value == null || value === "")) {
							continue;
						}

						if (validator.options.scenarios && validator.options.scenarios.length &&
								validator.options.scenarios.indexOf(this.scenario) === -1) {
							continue;
						}
					}
					// If a validator returns false, we stop processing any other validators on this field
					if (validator.validate(this, key, value) === false) {
						break;
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
			if (!(key in this._errors)) {
				this._errors[key] = [];
			}
			this._errors[key].push(error);
		},

		getErrors: function (/*string?*/ key) {
			return key ? (this._errors[key] || []) : this._errors;
		},

		clearErrors: function () {
			this._errors = {};
		}
	});
});