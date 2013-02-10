define([
	'dojo/_base/declare',
	'./Model',
	'dx-alias/lang',
	'dx-alias/log'
], function (declare, Model, lang, logger) {
	
	var log = logger('BM', 1);
	
	return declare(Model, {
		
		// conditionals that trigger virtual properties
		_behaviors:null,
		
		constructor: function(params ){
			if(params && params._behaviors){
				lang.mix(this._behaviors, params._behaviors);
			}else{
				delete this._behaviors;
			}
		},
		
		postscript: function(params){
			this.inherited(arguments);
			
			this._parseBehaviors();
			this._initialized = true;
			
			this.on('change', 'onChange', this);
		},
		
		onChange: function( evt ){
			var
				key = evt.key,
				value = evt.value,
				oldvalue = evt.oldvalue;
				
			log('BEHAVIOR CHANGE');
			
			if(oldvalue != null && (this._initialized || this._defaults[key] !== oldvalue)){
				log('emit', key, value);
				
				if(this._keyBehaviors[key]){
					this._keyBehaviors[key].forEach(function(propSettingObj){
						log('Model.behavior', propSettingObj);
						var prop, propValue, useParent;
						for(var p in propSettingObj){
							if(p === 'useParent'){
								useParent = propSettingObj[p];
								continue;
							}
							prop = p;
							propValue = propSettingObj[p];
						}
						this.emit('behavior', {
							value:value,
							oldvalue:oldvalue,
							key:key,
							property:prop,
							setting:propValue,
							useParent:useParent
						});		
					}, this);
					
				}
			}
			
			if(!this.radiosBlocked && this._initialized && this._behaviors && key in this._behaviors){
				if(this._radios._keys[key]){
					log('Model.handleRadios:', key, this._behaviors[key], 'isRadio:', !!this._radios._keys[key]);
					this.radiosBlocked = 1;
					this._setRadios(key, value);
					this.radiosBlocked = 0;
				}
			}
			
		},
		
		_setRadios: function(key, value){
			var name = this._radios._keys[key];
			//log('  set radios', name);
			this._radios[name].forEach(function(k){
				if(k !== key){
					log('  set radio', k, name);
					this.set(k, !value);
				}
			}, this);
		},
		
		_addRadio: function(key, name){
			if(!this._radios){
				this._radios = {
					_keys:{}	
				};	
			}
			this._radios[name] = this._radios[name] || [];
			this._radios[name].push(key);
			this._radios._keys[key] = name;
			
			//log('   radios', this._radios);
		},
		
		_addBehavior: function(affectedKey, uiProperty, keyToWatch, useParent){
			log('_addBehavior', affectedKey, uiProperty, keyToWatch, useParent);
			if(!this._keyBehaviors){
				this._keyBehaviors = {};
			}
			
			this._keyBehaviors[keyToWatch] = this._keyBehaviors[keyToWatch] || [];
			var o = {};
			o[affectedKey] = uiProperty;
			if(useParent){
				o.useParent = true;
			}
			log('prop ob', o, useParent);
			this._keyBehaviors[keyToWatch].push(o);
		},
		
		_parseBehaviors: function(){
				log('    parse behavior:', this._behaviors);
				for(var key in this._behaviors){
					var keyBehaviors = this._behaviors[key];
					for(var beKey in keyBehaviors){
						if(beKey === 'useParent'){
							continue;
						}
						log('        beKey', beKey, keyBehaviors[beKey]);
						if(beKey === Model.RADIO){
							this._addRadio(key, keyBehaviors[beKey]);	
						}
						else {
							this._addBehavior(key, beKey, keyBehaviors[beKey], keyBehaviors.useParent);
						}
					}
				}
			
		},
		
	});
});