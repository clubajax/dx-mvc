define([
	"dojo/_base/declare",
	"dojo/when"
], function (declare, when) {
	return declare(null, {
		//	summary:
		//		A store mixin that ensures that all objects within the store are
		//		the correct modelled object type.

		//	model: Function
		//		The constructor to use when converting plain objects returned by
		//		the parent store into actual JavaScript objects.
		model: null,

		createModel: function (obj) {
			var Model = this.model;
			if (!Model) {
				throw new Error("Cannot create new model");
			}
			console.log('INSTANCE');
			var model = new Model(obj);
			model.store = this;
			return model;
		},
		
		addModelled: function(obj){
			var model = this.createModel(obj);
			//model.set(obj);
			this.add(model);
			return this.get(obj.id); // Item (if id provided)
		},
		
		setData: function (data) {
			//	summary:
			//		Ensures objects set in the store are of the correct type
			//		and have a correct reference to this store.
			this._processResultSet(data);
			this.inherited(arguments);
			
		},
		
		put: function (object) {
			//	summary:
			//		Ensures objects put to the store are of the correct type,
			//		and commits their state once saved successfully.

			var Model = this.model;
			if (Model && !(object instanceof Model)) {
				throw new Error("Objects put to modelled store must be an instance of the defined model");
			}

			var returnValue = this.inherited(arguments);
			when(returnValue).then(function () {
				//console.info('todo: item.commit');
				//object.commit();
			});
			return returnValue;
		},

		_processResultSet: function (/*Object[]*/ data) {
			//	summary:
			//		Processes an array of results so that all objects within the
			//		array are modelled objects.

			var Model = this.model;

			if (Model) {
				for (var i = 0, object; (object = data[i]); ++i) {
					if (!(object instanceof Model)) {
						object = new Model(object);
					}
					object.store = this;
					object.scenario = "update";
					data[i] = object;
				}
			}
		}
	});
});