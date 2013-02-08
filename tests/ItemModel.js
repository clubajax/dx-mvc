define([
	'dojo/_base/declare',
	'dx-mvc/Model'
	
], function(declare, Model, RequiredValidator){
	
	return declare(Model, {
		_schema: {
			id: Model.NUMBER,
			label: Model.STRING,
			description: Model.STRING,
			location:Model.STRING,
			category:Model.STRING,
			
			hideDesc:Model.BOOLEAN,
			showDesc:Model.BOOLEAN,
			enableLabel:Model.BOOLEAN,
			disableLabel:Model.BOOLEAN
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
			label:{required:true, min:4, max:12}
		},
		
		_behaviors: {
			hideDesc:{ radio:'myRadios' },
			showDesc:{ radio:'myRadios' },
			enableLabel:{ radio:'labelRadios' },
			disableLabel:{ radio:'labelRadios' },
			description:{ visibility:'showDesc', useParent:true},
			label:{ disabled:'disableLabel' }
		}
	});
});