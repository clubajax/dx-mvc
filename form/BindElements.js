
/*
 * BindElements is for binding HTML forms to this class and likewise its
 * data model
 * It also has light data-bind ability
 * It is not a widget.
 *
 * requires BindModel
 * 
 */

define([
	
	'dojo/_base/declare',
	'dx-alias/on',
	'../model/Model',
	'dx-alias/lang',
	'dx-alias/log'
	
], function( declare, on, Model, lang, logger ){
	
	var
		log = logger( 'BE', 0 ),
		
		isNode = function( node ){
			return node && typeof node === 'object' && node.nodeType !== undefined;
		},
	
		isInput = function( node ){
			return isNode( node ) && node.tagName.toLowerCase() === 'input';
		},
		
		isTextElement = function( node ){
			return isInput( node ) &&
				node.type.toLowerCase() === 'text';
		},
		
		isTextareaElement = function( node ){
			return isInput( node ) &&
				node.tagName.toLowerCase() === 'textarea';
		},
	
		isCheckboxElement = function( node ){
			return isInput( node ) && node.type.toLowerCase() === 'checkbox';
		},
	
		isRadioElement = function( node ){
			return isInput( node ) && node.type.toLowerCase() === 'radio';
		},
		
		isNodeList = function( node ){
			return !!node && node.toString().indexOf( 'NodeList' ) > -1;
		}
	
	return declare( 'dx-mvc.form.BindElements', null, {
		
		model:null,
		
		constructor: function( props, node ){
			log( 'dx-mvc.form.BindElements cnst', props );
			//lang.mix( this, props, { notUndefined:1 } );
			
			this.domNode = typeof node === 'string' ? document.getElementById( node ) : node;
			
			this.on('setmodel', this.setElementValues, this);
			
			// if not Base...
			this.postMixInProperties && this.postMixInProperties();
		},
		
		
		bindElement: function( node, key, value ){
			var i;
				
			if( isNodeList( node ) ){
				// ever use this?
				for( i = 0; i < node.length; i++ ){
					this.bindElement( node[i], key, node[i].value );
				}
			}
			else if( isRadioElement( node ) || isCheckboxElement( node ) ){
				this.own( on( node, 'click', this, function( evt ){
					log('checkbox', key, evt);
					this.model.set( key, evt.target.checked );
				}));
			}

			else if( isTextElement(node ) ){
				this.own( on( node, 'change', this, function( evt ){
					this.model.set( key, evt.target.value );
				}));
			}
		},
		
		setElementValues: function(){
			var key;
			log( 'setElementValues:', this.model );
			for( key in this.model._schema ){
				var element = this.setElementValue( key );
				if( element ){
					this.bindElement(element, key);
				}
			}
		},
		
		getRadio: function( key ){
			var i, nodes;
			if(!this._radios){
				this._radios = {};
				nodes = this.domNode.querySelectorAll( 'input[type="radio"]' );
				for( i = 0; i < nodes.length; i++ ){
					this._radios[ nodes[i].value ] = nodes[i];	
				}
			}
			return this._radios[key];
		},
		
		getElement: function( key ){
			// assumes form accessor
			return this.domNode[key] || this.getRadio( key );
		},
		
		setElementValue: function( key ){
			if(!this.model){
				// Even if there is no model on parse, Stateful still sends properties
				return null;
			}
			var i,
				value,
				element = this.getElement( key );
			
			log('KEY', key, element);
			
			if( element ){
				value = this.model.get( key );
					
				if( this.model._schema[key] === Model.OBJECT ){
					for( i = 0; i < element.length; i++ ){
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
		
		
		validate: function(){
			var valid = this.model.validate();
			log( 'VALIDATED', valid );
			return valid;
		},
		
		set: function(key, value, setFromModel){
			var result = this.inherited(arguments);
			if(typeof key !== 'object' && key !== 'model'){
				log('SET', key, setFromModel ? 'setFromModel' : '');
				this.setElementValue( key );
			}
			return result;
		}
	});
})