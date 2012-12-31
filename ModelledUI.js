define([
	'dojo/_base/declare',
	'./ModelledUIMixin'
], function(declare){
	
	return declare( ModelledUIMixin, {
		postMixInProperties: function(){
			if(this.model){
				var self = this;
				this.model.on('change', function(evt){
					self.set(evt.key, evt.value, true);
				});
			}
		}
	});
})