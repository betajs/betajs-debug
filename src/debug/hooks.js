Scoped.define("module:Hooks", [], function () {
	return {
		
		hookMethod: function (method, context, beginCallback, endCallback, callbackContext) {
			var old = context[method];
			context[method] = function () {
				if (beginCallback)
					beginCallback.call(callbackContext, method, context, arguments, this);
				var exc = null;
				var result = null;
				try {
					result = old.apply(this, arguments);
				} catch (e) {
					exc = e;
				}
				if (endCallback)
					endCallback.call(callbackContext, method, context, arguments, result, exc, this);
				if (exc)
					throw exc;
				return result;
			};
			return {
				method: method,
				original: old,
				context: context
			};
		},
		
		unhookMethod: function (backup) {
			backup.context[backup.method] = backup.original; 
		},

		hookMethodsArray: function (methods, context, beginCallback, endCallback, callbackContext) {
			return methods.map(function (method) {
				return this.hookMethod(method, context, beginCallback, endCallback, callbackContext);
			}, this);
		},

		getContextMethodNames: function (context) {
			var result = [];
			for (var method in context)
				if (typeof context[method] === "function") {
					var empty = true;
					for (var key in context[method]) {
						empty = false;
						break;
					}
					if (!empty)
						continue;
					result.push(method);
				}
			return result;
		},

		hookMethods: function (context, beginCallback, endCallback, callbackContext) {
			return this.hookMethodsArray(this.getContextMethodNames(context), context, beginCallback, endCallback, callbackContext);
		},
		
		unhookMethods: function (backup) {
			for (var i = 0; i < backup.length; ++i)
				this.unhookMethod(backup);
		},
		
		hookPrototypeMethod: function (method, cls, beginCallback, endCallback, callbackContext) {
			return this.hookMethod(method, cls.prototype, beginCallback, endCallback, callbackContext);
		},
		
		hookPrototypeMethods: function (cls, beginCallback, endCallback, callbackContext) {
			return this.hookMethods(cls.prototype, beginCallback, endCallback, callbackContext);
		}
		
	};
});