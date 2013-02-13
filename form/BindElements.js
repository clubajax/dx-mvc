
/*
 * BindElements is for binding HTML forms to this class and likewise its
 * data model
 * It also has light data-bind ability
 * It is not a widget.
 */

define([
	
	'dojo/_base/declare',
	'dx-alias/on',
	'../model/Model',
	'dx-alias/lang',
	'dx-alias/log'
	
], function( declare, on, Model, lang, logger ){
	
	var
		log = logger('FRM', 1),
		
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
			log( 'dx-mvc.ModelledForm cnst', props );
			lang.mix( this, props, { notUndefined:1 } );
			
			// TODO - move this to postscript for if this is extended by a Widget
			
			this.domNode = typeof node === 'string' ? document.getElementById( node ) : node;
			
			log( 'dx-mvc.ModelledForm postscript' );
			
			this._handles = [];
			this.setElementValues();
			
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
				this._handles.push( on( node, 'click', this, function( evt ){
					log('check', key, evt);
					this.model.set( key, evt.target.checked );
				}));
			}

			else if( isTextElement(node ) ){
				this._handles.push( on( node, 'change', this, function( evt ){
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
				console.log( 'this._radios',this._radios );
				for( i = 0; i < nodes.length; i++ ){
					this._radios[ nodes[i].value ] = nodes[i];	
				}
			}
			return this._radios[key];
		},
		
		getElement: function( key ){
			return this.domNode[key] || this.getRadio( key );
		},
		
		setElementValue: function( key ){
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
				log('SET', key, 'setFromModel', setFromModel);
				this.setElementValue( key );
			}
			return result;
		}
	});
})