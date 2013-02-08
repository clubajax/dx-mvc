define([
	'dojo/_base/declare',
	'./ModelledUIMixin'
], function(declare){
	
	// is this used?
	
	return declare( ModelledUIMixin, {
		postMixInProperties: function(){
			console.log('ModelledUIMixin.model', this.model);
			if(this.model){
				var self = this;
				this.model.on('change', function(evt){
					console.log('ModelledUIMixin.change', evt.key, evt.value);
					self.set(evt.key, evt.value, true);
				});
			}
			this.inherited(arguments);
		}
	});
})