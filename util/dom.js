define([
	'dojo/dom',
	'dojo/dom-construct',
	'dojo/dom-geometry',
	'dojo/dom-class',
	'dojo/dom-style',
	'dojo/dom-prop',
], function(domDom, domCon, domGeom, domClass, domStyle, domProp){

	var dom = {};
	var mixes = [domDom, domCon, domGeom];
	
	
	for(var i=0; i<mixes.length; i++){
		var a = mixes[i];
		for(var key in a){
			dom[key] = a[key];
		}
	}
	
	dom.css = domClass;
	dom.style = domStyle;
	dom.prop = domProp;
	if(!dom.prop.remove){
		dom.prop.remove = function(node, name){
			domDom.byId(node).removeAttribute(name);
		}
	}
	return dom;
});