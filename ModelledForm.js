
/*
 * ModelledForm is for binding HTML forms to a data model
 * It also has light data-bind ability
 * It is not a widget.
 */

define([
	
	'dojo/_base/declare',
	'dojo/on',
	'./Model',
	'./ModelledUIMixin',
	'./ValidationDisplayMixin',
	'dx-alias/lang',
	'dx-alias/log'
	
], function(declare, on, Model, ModelledUIMixin, ValidationDisplayMixin, lang, logger){
	
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
		
		isTextareaElement = function(node){
			return isInput(node) &&
				node.tagName.toLowerCase() === 'textarea';
		},
	
		isCheckboxElement = function(node){
			return isInput(node) && node.type.toLowerCase() === 'checkbox';
		},
	
		isRadioElement = function(node){
			return isInput(node) && node.type.toLowerCase() === 'radio';
		},
		
		isNodeList = function(node){
			return !!node && node.toString().indexOf('NodeList') > -1;
		},
		
		getStyleValue = function(styleProperty, bool){
			// convert bool into a proper style value
			return {
				visibility: bool ? 'visible' : 'hidden',
				display: bool ? '' : 'none'
			}[styleProperty];
		};
	
	return declare( 'dx-mvc.ModelledForm', null, {
		model:null,
		constructor: function( props, node ){
			log( 'dx-mvc.ModelledForm cnst', props );
			lang.mix( this, props, { notUndefined:1 } );
			this.domNode = typeof node === 'string' ? document.getElementById( node ) : node;
		},
		
		postscript: function(){
			log( 'dx-mvc.ModelledForm postscript');
			
			this._handles = [];
			this.setElementValues();
			this.setModelBehavior();
			this.setBindings();
			
			// if not Base...
			this.postMixInProperties && this.postMixInProperties();
		},
		
		bindElement: function( node, key, value ){
			var self = this;
			if( isNodeList( node ) ){
				// ever use this?
				for(var i = 0; i < node.length; i++ ){
					this.bindElement( node[i], key, node[i].value );
				}
			}
			else if( isRadioElement( node ) || isCheckboxElement( node ) ){
				this._handles.push( on( node, 'click', function( evt ){
					self.model.set( key, true );
				}));
			}
			else if( isTextElement(node ) ){
				this._handles.push( on( node, 'change', function( evt ){
					self.model.set( key, evt.target.value );
				}));
			}
		},
		
		setElementValues: function(){
			log( 'setElementValues:', this.model );
			for( var key in this.model._schema ){
				var element = this.setElementValue( key );
				if( element ){
					this.bindElement(element, key);
				}
			}
		},
		
		getRadio: function(key){
			if(!this._radios){
				this._radios = {};
				var nodes = this.domNode.querySelectorAll('input[type="radio"]');
				console.log('this._radios',this._radios);
				for( var i = 0; i < nodes.length; i++ ){
					this._radios[ nodes[i].value ] = nodes[i];	
				}
			}
			return this._radios[key];
		},
		
		getElement: function(key){
			return this.domNode[key] || this.getRadio(key);
		},
		
		setElementValue: function(key){
			var element = this.getElement(key);
			log('KEY', key, element);
			
			if(element){
				var value = this.model.get(key);
					
				if(this.model._schema[key] === Model.OBJECT){
					for(var i=0; i<element.length; i++){
						element[i].checked = element[i].value === value;
					}
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
				log(' ---- No element for ', key);
			}
			return element;
		},
		
		onBehavior: function(evt){
			var element = this.getElement(evt.property);
			if(!!evt.useParent){
				element = element.parentNode;
			}
			if(element){
				var setting = evt.setting;
				// check if attr or style
				if(evt.setting in element){
					element[evt.setting] = evt.value;	
				}
				else if(evt.setting in element.style){
					var value = getStyleValue(evt.setting, evt.value);
					log('SET STYLE', evt.setting, value);
					element.style[evt.setting] = value;
				}
				else{
					console.warn('unrecognized node behavior: ', evt.setting, element);	
				}
				
				
			}
		},
		
		setModelBehavior: function(){
			var self = this;
			this.model.on('behavior', function(evt){
				log('{}{}{} behavior', evt);
				self.onBehavior(evt);
			});
		},
		
		setBindings: function(){
			// checks for data-bind in any nodes
			// only bind methods - eveything else is handled by the model
			var
				attr,
				pairs,
				pair,
				fn,
				self = this,
				nodes = !!this.domNode.getAttribute( 'data-bind' ) ?
					[ this.domNode ] : 
					this.domNode.querySelectorAll( '[data-bind]' );
					
					nodes = Array.prototype.slice.call(nodes);
				
			nodes.forEach( function( node ){
				attr = node.getAttribute( 'data-bind' );
				pairs = attr.split(/,|;/);
				pairs.forEach( function( pr ){
					pair = pr.split( ':' );
					fn = self[ pair[ 1 ] ] ?
						lang.bind(self, pair[ 1 ]) :
						window[ pair[ 1 ] ];
					on(node, pair[ 0 ], function( evt ){
						fn(evt);	
					});
				});
			});
		},
		
		validate: function(){
			var valid = this.model.validate();
			log( 'VALIDATED', valid );
			//this.inherited( arguments );
		},
		
		set: function(key, value, setFromModel){
			var result = this.inherited(arguments);
			if(typeof key !== 'object' && key !== 'model'){
				log('SET', key, 'setFromModel', setFromModel);
				this.setElementValue(key);
			}
			return result;
		}
	});
})