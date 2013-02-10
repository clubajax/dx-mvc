
/*
 * ModelledBehaviorForm extends ModelledForm and adds behavior to the form
 */

define([
	'dojo/_base/declare',
	'dojo/on',
	'dx-alias/lang',
	'./ModelledForm',
	'dx-alias/log'
], function(declare, on, lang, ModelledForm, logger){
	
	var
		
		log = logger('MBF', 1),
		
		getStyleValue = function(styleProperty, bool){
			// convert bool into a proper style value
			return {
				visibility: bool ? 'visible' : 'hidden',
				display: bool ? '' : 'none'
			}[styleProperty];
		};
		
	return declare('dx-mvc/ModelledBehaviorForm', ModelledForm, {
		
		invalidClass:'',
		
		constructor: function(){
			this.setModelBehavior();
			this.setBindings();
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
			this.model.on('behavior', function(evt){
				log('behavior', evt);
				this.onBehavior(evt);
			}, this);
		},
		
		validate: function(){
			var valid = this.inherited( arguments );
			log( 'VALIDATED', valid );
			
		}
	});	
});