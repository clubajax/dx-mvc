define(['dojo/aspect', 'dojo/on', './lang'], function(aspect, on, lang){
	// module:
	//		dojo/Evented
	
 	var after = aspect.after;
	function Evented(){
		// summary:
		//		Based on Dojo's Evented - adding a context argument.
		//		
		//		A class that can be used as a mixin or base class,
		//		to add on() and emit() methods to a class
		//		for listening for events and emitting events:
	}
	Evented.prototype = {
		on: function( type, listener, context ){
			if( context ){
				listener = lang.bind( context, listener );
			}
			return on.parse( this, type, listener, function( target, type ){
				return after( target, 'on' + type, listener, true );
			});
		},
		emit: function( type, event ){
			var args = [this];
			args.push.apply( args, arguments );
			return on.emit.apply( on, args );
		}
	};
	return Evented;
});
