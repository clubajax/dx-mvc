define([
	'dojo/_base/declare',
	'dx-mvc/Model',
	'dx-mvc/validators/Required'
], function(declare, Model, RequiredValidator){
	
	return declare(Model, {
		_schema: {
			id: Model.NUMBER,
			label: Model.STRING,
			description: Model.STRING,
			location:Model.STRING,
			category:Model.STRING,
			bulk:Model.BOOLEAN,
			day:Model.ARRAY,
			
			// change this to a string and make a validator that allows certain values
			days:Model.OBJECT
		},
	
		_defaults: {
			id: null,
			label: "Untitled",
			description: "",
			location:"",
			category:"",
			bulk:false
		},
	
		_validators: {
			label:[new RequiredValidator()]
		}
	});
});