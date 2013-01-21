define([
], function(){
	//	summary:
	//		The export of this module contains some common language methods.
	//		A much more concise module compared to dojo.lang.
	//
	//	returns: Object
	//
	// TODO?: http://millermedeiros.github.com/amd-utils/math.html
	//
	var
		_uidMap = {},
		uid = function(str){
			str = str || "id";
			if(!_uidMap[str]){  _uidMap[str] = 0; }
			_uidMap[str]++;
			return str+"_"+_uidMap[str];

		},

		bind = function(ctx, func, dbg){
			if(typeof(func) == "string"){
				if(!func){ func = ctx; ctx = window; }
				return function(){
					ctx[func].apply(ctx, arguments); };
			}else{
				var method = !!func ? ctx.func || func : ctx;
				var scope = !!func ? ctx : window;
				return function(){ method.apply(scope, arguments); };
			}
		};

	return {

		uid:
			//	summary:
			//		Returns a unique ID. Accepts an optional string for a
			//		prefix.
			uid,

		bind:
			//	summary:
			//		Fixes the context of a function so "this" is correct.
			bind,

		hitch:
			//	summary:
			//		For those used to dojo.hitch.
			bind,

		last: function(/*Array*/array){
			//	summary:
			//		Returns the last element of an array.
			return array[array.length -1];
		},

		copy: function(o){
			//	summary:
			//		Makes a shallow copy of an object
			var o1 = {};
			for(var nm in o){
				if(typeof(o[nm]) == "object"){
					o1[nm] = this.copy(o[nm]);
				}else{
					o1[nm] = o[nm];
				}
			}
			return o1;
		},

		isEmpty: function(o){
			//	summary:
			//		Check if an object has any properties,
			//		or if it's even there
			if(!o) return true;
			//  ??  if(typeof o != 'object') return true;
			if(o.length) return !!obj.length;
			for(var nm in o) return false;
			return true;
		},

		mix: function(/*Object*/source1, /*Object|Array*/source2, /*Object?*/opt){
			//	summary:
			//		Mixes two objects together.
			//		Warning: not deep!
			//		source1: Object
			//			Object to add properties and methods
			//		source2: Object|Array
			//			Object to get properties and methods from. If an array
			//			it is looped and mixed in order.
			//		opt: Object
			//			copy
			//				Make a copy of source1 before mixing
			//			notUndefined
			//				Don't mix properties if undefined in source1
			opt = opt || {};
			if(opt.copy) source1 = this.copy(source1);
			var notUndefined = opt.notUndefined;
			if(source2 instanceof Array){
				delete opt.copy; // already copied
				source2.forEach(function(o){
					this.mix(source1, o, opt);
				}, this);
				return source1;
			}
			for(var nm in source2){
				if(notUndefined && source1[nm] === undefined) continue;
				source1[nm] = source2[nm];
			}
			return source1;
		}
	};

});
