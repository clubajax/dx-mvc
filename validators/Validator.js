define([
	'dojo/_base/declare',
	'dx-alias/lang',
	'dx-alias/string'
], function(declare, lang, stringUtil){
	
	return declare(null, {
		
		constructor: function(options){
			lang.mix(this, options);
		},
		
		createError: function(msg, key){
			key = key || 'field';
			msg = stringUtil.replace(msg, key);
			console.log('MSG', msg);
			var e = new Error(msg);
			e.key = key;
			e.name = 'ValidationError';
			return e;
			return new declare(null, Error, {
				message:msg,
				key:key
			});
		}
	});
});