define([
	'dojo/_base/declare',
	'./ModelledUIMixin',
	'dx-alias/lang',
	'dx-alias/log'
], function(declare, ModelledUIMixin, lang, logger){
	
	var log = logger('FRM', 1);
	
	return declare('dx-mvc.ModelledForm', ModelledUIMixin, {
		model:null,
		constructor: function(props, node){
			log('dx-mvc.ModelledForm cnst', props);
			lang.mix(this, props, {notUndefined:1});
			this.domNode = typeof node == 'string' ? document.getElementById(node) : node;
			this.setModelValues();
			
			// if not Base.....
			this.postMixInProperties();
		},
		
		setModelValues: function(){
			log('setModelValues:', this.model);
			for(var key in this.model._schema){
				this.setElementValue(key);
			}
		},
		
		setElementValue: function(key){
			var element = this.domNode[key];
			if(element){
				var value = this.model.get(key);
				//log('set element', key, value);
				element.value = value;
			}else{
				log('No element for ', key);
			}
		},
		
		set: function(key, value, setFromModel){
			var result = this.inherited(arguments);
			if(typeof key !== 'object' || key !== 'model'){
				this.setElementValue(key);
			}
			return result;
		}
	});
})