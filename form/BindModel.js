/*
 *	BindModel is a mixin to bind the model's get/set to the
 *	Class's get/set
 *
 *	This is the base model class
 *	
 */
define([
	
	'dojo/_base/declare',
	'dojo/Stateful',
	'dx-alias/lang',
	'dx-alias/Evented',
	'dx-alias/log'
	
], function( declare, Stateful, lang, Evented, logger ){
	
	var log = logger( 'BM', 0 );
	
	return declare( 'dx-mvc.form.BindModel', [ Stateful, Evented ], {
		
		constructor: function( props ){
			
			log( 'dx-mvc.form.BindModel cnst', props );
			lang.mix( this, props, { notUndefined:1 } );
			
		},
		
		postscript: function(){
			log(' * postscript');
			if( this.model ){ 
				this.setModel( this.model );
			}
			this.inherited( arguments );
		},
		
		setModel: function(model){
			log('setModel');
			if(this.model){
				this.model.removeEvents();
			}
			this.model = model;
			this.model.on( 'change', function( evt ){
				this.set( evt.key, evt.value, true );
			}, this );
			this.emit('setmodel', model);
		},
		
		set: function( key, value, setFromModel ){
			log('set', key, value, !!setFromModel);
			
			if( key === 'model' ){
				return value;
			}
			if( typeof key === 'object' ){
				return this.inherited( arguments );
			}
			var oldvalue = this.get( key );
			if( this.model && !setFromModel && key in this.model ){
				this.model.set( key, value );
			}
			
			// CHECK IF VALID
			this.emit( 'change', {
				value:value,
				key:key,
				oldvalue:oldvalue
			});
			return this.inherited( arguments );
		},
		
		get: function( key ){
			if( this.model && key in this.model ){
				return this.model[key];
			}
			return this.inherited( arguments );
		}
	});
})