define([
	'dojo/_base/declare',
	'dx-mvc/model/BehaviorModel',
	'dx-mvc/model/Model'
	
], function(declare, BehaviorModel, Model){
	
	return declare(BehaviorModel, {
		_schema: {
			id: Model.NUMBER,
			label: Model.STRING,
			description: Model.STRING,
			location:Model.STRING,
			category:Model.STRING,
			
			showCategory:Model.BOOLEAN,
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
			showCategory:true
		},
	
		_validators: {
			label:{required:true, min:4, max:12}
		},
		
		// errorMessages
		// 		nested objects for a message for each validation property
		// errorHandling
		// 		what to do with an error - display message? show a div?
		
		_behaviors: {
			hideDesc:{ radio:'myRadios' },
			showDesc:{ radio:'myRadios' },
			enableLabel:{ radio:'labelRadios' },
			disableLabel:{ radio:'labelRadios' },
			description:{ visibility:'showDesc', useParent:true},
			label:{ disabled:'disableLabel' },
			category:{ display:'showCategory', useParent:true }
		}
	});
});