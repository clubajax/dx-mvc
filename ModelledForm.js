define([
	'dojo/_base/declare',
	'dojo/on',
	'./Model',
	'./ModelledUIMixin',
	'dx-alias/lang',
	'dx-alias/log'
], function(declare, on, Model, ModelledUIMixin, lang, logger){
	
	var
		log = logger('FRM', 1),
		
		isNode = function(node){
			return node && typeof node === 'object' && node.nodeType !== undefined;
		},
	
		isInput = function(node){
			return isNode(node) && node.tagName.toLowerCase() === 'input';
		},
		
		isTextElement = function(node){
			return isInput(node) &&
				node.type.toLowerCase() === 'text';
		},
	
		isCheckboxElement = function(node){
			return isInput(node) && node.type.toLowerCase() === 'checkbox';
		},
	
		isRadioElement = function(node){
			return isInput(node) && node.type.toLowerCase() === 'radio';
		},
		
		isNodeList = function(node){
			return !!node && node.toString().indexOf('NodeList') > -1;
		};
	
	return declare('dx-mvc.ModelledForm', ModelledUIMixin, {
		model:null,
		constructor: function(props, node){
			log('dx-mvc.ModelledForm cnst', props);
			lang.mix(this, props, {notUndefined:1});
			this.domNode = typeof node == 'string' ? document.getElementById(node) : node;
			this._handles = [];
			this.setModelValues();
			
			// if not Base.....
			this.postMixInProperties();
		},
		
		bindElement: function(node, key, value){
			log('bindElement', isNodeList(node));
			if(isNodeList(node)){
				log('NodeList');
				for(var i=0; i<node.length; i++){
					log('   bind', node[i].value);
					this.bindElement(node[i], key, node[i].value);
				}
			}else if(isRadioElement(node) || isCheckboxElement(node)){
				log('RADIO!!!')
				this._handles.push(on(node, 'click', function(){
					log('CHECK!', key, value);	
				}));
			}
		},
		
		setModelValues: function(){
			log('setModelValues:', this.model);
			for(var key in this.model._schema){
				var element = this.setElementValue(key);
				if(element){
					this.bindElement(element, key);
				}
			}
		},
		
		setElementValue: function(key){
			var element = this.domNode[key];
			//console.log('KEY', key, element);
			if(element){
				var value = this.model.get(key);
					
				if(this.model._schema[key] === Model.OBJECT){
					for(var i=0; i<element.length; i++){
						element[i].checked = element[i].value === value;
					}
					//element.value = 'monday'
				}else if(typeof element !== 'string'){
					//log('set element', key, value);
					if(isCheckboxElement(element)){
						element.checked = value;
					}else if(isRadioElement(element)){
						element.checked = value;
					}else{
						element.value = value;	
					}
				}
				
			}else{
				log('No element for ', key);
			}
			return element;
		},
		
		set: function(key, value, setFromModel){
			var result = this.inherited(arguments);
			if(typeof key !== 'object' && key !== 'model'){
				log('SET', key);
				this.setElementValue(key);
			}
			return result;
		}
	});
})