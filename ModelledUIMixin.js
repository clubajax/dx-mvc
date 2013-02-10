/*
 *	ModeledUIMixin is for mixing into dx-ui/Base (or other widget)
 *	to make it bindable.
 */
define([
	
	'dojo/_base/declare',
	'dojo/Stateful',
	'./util/Evented',
	'dx-alias/log'
	
], function(declare, Stateful, Evented, logger){
	
	var log = logger('MUI', 0);
	var repeat = 0;
	var Class = declare([Stateful, Evented], {
		
		constructor: function(){
			
		},
		
		postMixInProperties: function(){
			// get and set will fail without this check
			if( !this.model ){ throw new Error('ModelledUIMixin requires a model'); }
			
			this.model.on( 'change', function( evt ){
				this.set( evt.key, evt.value, true );
			}, this );
			
			this.inherited( arguments );
		},
		
		set: function(key, value, setFromModel){
			//log('set', key, value, !!setFromModel);
			
			if(key === 'model'){
				return value;
			}
			if(typeof key === 'object'){
				return this.inherited(arguments);
			}
			var oldvalue = this.get(key);
			if(this.model && !setFromModel && key in this.model){
				this.model.set(key, value);
			}
			
			// CHECK IF VALID
			this.emit('change', {
				value:value,
				key:key,
				oldvalue:oldvalue
			});
			return this.inherited(arguments);
		},
		
		get: function(key){
			if(this.model && key in this.model){
				return this.model[key];
			}
			return this.inherited(arguments);
		}
	});
	
	Class.name = 'VDM';
	
	return Class;
})