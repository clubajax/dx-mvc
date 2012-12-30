define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/Stateful',
	'dojo/Evented',
	'dojo/when'
], function (declare, lang, Stateful, Evented, when) {
	return declare([Stateful, Evented], {
		//	summary:
		//		A base class for modelled data objects.

		//	_validators: [protected] Object
		//		A hash map where the key corresponds to a field name on the
		//		model and the value is an array of
		//		`framework/validator/_Validator` validator objects that are used
		//		to validate that field.
		_validators: {},

		//	_errors: [private] Object
		//		A hash map where the key corresponds to a field name and
		//		the value is an array of `framework/validator/ValidationError`
		//		objects that describe validation failures for that field.
		_errors: {},

		//	_schema: [protected] Object
		//		A hash map where the key corresponds to a field name and the
		//		value is either a string corresponding to one of the JavaScript
		//		primitive values (string, number, boolean), or a constructor, or
		//		null (to allow any type). Only fields that match a key in
		//		`this._schema` are settable using `this.set`.
		_schema: {},

		//	_defaults: [protected] Object
		//		A hash map where the key corresponds to a field name and
		//		the value is a default value for the field. Default values
		//		are not passed through `this.set` so will not be applied by
		//		custom setters. Note that defaults is applied as a shallow
		//		copy, so objects set as default values will be shared across
		//		all instances.
		_defaults: {},

		//	_committedValues: [private] Object
		//		A hash map that stores the currently committed values of the
		//		model.
		_committedValues: {},

		//	store: dojo/store/api/Store
		//		The store to which the object belongs. This is set automatically
		//		when using `framework/store/_ModelledStoreMixin`.
		store: null,

		//	scenario: string
		//		The scenario that is used to determine which validators should
		//		apply to this model. There are two standard values for scenario,
		//		"insert" and "update", but it can be set to any arbitrary value
		//		for more complex validation scenarios.
		scenario: "insert",

		constructor: function (params) {
			this._errors = {};
			lang.mixin(this, this._defaults);
			this._committedValues = lang.mixin({}, this._defaults, params);
		},

		save: function (/*boolean*/ skipValidation) {
			//	summary:
			//		Saves this object to its default store.
			//	skipValidation:
			//		Normally, validation is performed to ensure that the object
			//		is not invalid before being stored. Set `skipValidation` to
			//		true to skip it.
console.log('SAVE');
			if (!skipValidation && !this.validate()) {
				console.error("did not validate");
				return false;
			}

			if (!this.store) {
				throw new Error("Missing store");
			}

			return this.store.put(this);
		},

		revert: function () {
			//	summary:
			//		Reverts the object to its currently committed state.

			this.set(this._committedValues);
		},

		commit: function () {
			//	summary:
			//		Commits the currently state of the object.

			this.scenario = "update";
			for (var k in this._schema) {
				this._committedValues[k] = this[k];
			}
		},

		set: function (/*string*/ key, /*any?*/ value) {
			//	summary:
			//		Only allows setting keys that are defined in the schema,
			//		and remove any error conditions for the given key when
			//		its value is set.
			if (typeof key === "object") {
				return this.inherited(arguments);
			}
			else if (key in this._schema) {
				var DataType = this._schema[key];

				if (DataType === "string") {
					value = "" + value;
				}
				else if (DataType === "number") {
					value = +value;
				}
				else if (DataType === "boolean") {
					// value && value.length check is because dijit/_FormMixin
					// returns an array for checkboxes; an array coerces to true,
					// but an empty array should be set as false
					value = (value === "false" || value === "0" || Array.isArray(value) && !value.length) ? false : !!value;
				}
				else if (typeof DataType === "function" && !(value instanceof DataType)) {
					value = new DataType(value);
				}
				var oldvalue = this.get(key);
				this.inherited(arguments, [ key, value ]);
				delete this._errors[key];
			}
			
			// emit here
			
			if(oldvalue != null && this._defaults[key] !== oldvalue){
				this.emit('change', {
					value:value,
					oldvalue:oldvalue,
					key:key
				});
			}
			return value;
		},

		validate: function (/*string[]?*/ fields) {
			//	summary:
			//		Validates the current object.
			//	fields:
			//		If provided, only the fields listed in the array will be
			//		validated.
			//	returns: boolean
			//		Whether or not the model is in a valid state.

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
						// Simply skip validators that are defined as allowing empty fields when the value is
						// empty (null, undefined, or empty string)
						if (validator.options.allowEmpty && (value == null || value === "")) {
							continue;
						}

						// Skip validators that are limited to certain scenarios and do not match the currently
						// defined model scenario
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
			//	summary:
			//		Returns whether or not there are currently any errors on
			//		this model due to validation errors.

			for (var key in this._errors) { return false; }
			return true;
		},

		addError: function (key, error) {
			//	summary:
			//		If in error, validators will call this.
			//	key:
			//		The field onto which an error should be attached.
			//	error:
			//		The error.
			if (!(key in this._errors)) {
				this._errors[key] = [];
			}
			this._errors[key].push(error);
		},

		getErrors: function (/*string?*/ key) {
			//	summary:
			//		Gets errors on the current model.
			//	key:
			//		If provided, return only errors for the given field.
			//		If a key is provided, an array of ValidationErrors is
			//		returned; otherwise, a hash map of all fields with errors
			//		is returned where the key is the field name and the value
			//		is the array of ValidationErrors.
			return key ? (this._errors[key] || []) : this._errors;
		},

		clearErrors: function () {
			//	summary:
			//		Clears all errors currently set on the model.
			this._errors = {};
		}
	});
});