define([
	'dojo/_base/declare',
	'dojo/Stateful',
	'dojo/Evented',
	'dx-alias/log'
], function(declare, Stateful, Evented, logger){
	
	var log = logger('MUI', 1);
	
	return declare([Stateful, Evented], {
		postMixInProperties: function(){
			console.log('postMixInProperties', this.model);
			if(this.model){
				var self = this;
				this.model.on('change', function(evt){
					self.set(evt.key, evt.value, true);
				});
			}
		},
		set: function(key, value, setFromModel){
			
			if(key === 'model'){
				return value;
			}
			if(typeof key === 'object'){
				return this.inherited(arguments);
			}
			log('SET', key);
			var oldvalue = this.get(key);
			if(this.model && !setFromModel && key in this.model){
				this.model.set(key, value);
				// save?
			}
			
			// CHECK IF VALID
			log('EMIT', key, value);
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
})