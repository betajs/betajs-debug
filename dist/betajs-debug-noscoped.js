/*!
betajs-debug - v0.0.9 - 2016-03-02
Copyright (c) Oliver Friedmann
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJSDebug');
Scoped.define("module:", function () {
	return {
    "guid": "d33ed9c4-d6fc-49d4-b388-cd7b9597b63a",
    "version": "7.1456966924597"
};
});
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
		
		hookMethods: function (context, beginCallback, endCallback, callbackContext) {
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
					result.push(this.hookMethod(method, context, beginCallback, endCallback, callbackContext));
				}
			return result;
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
Scoped.define("module:Instances", [
    "module:Hooks"
], function (Hooks) {
	return {
		
		allFilter: function () {
			return function () {
				return true;
			};
		},
		
		andFilter: function (filters) {
			return function (cls) {
				for (var i = 0; i < filters.length; ++i)
					if (!filters[i](cls))
						return false;
				return true;
			};
		},
		
		orFilter: function (filters) {
			return function (cls) {
				for (var i = 0; i < filters.length; ++i)
					if (filters[i](cls))
						return true;
				return false;
			};
		},
		
		regexFilter: function (regex) {
			return function (cls) {
				return regex.test(cls.classname);
			};
		},
		
		ancestryFilter: function (filter) {
			return function (cls) {
				while (cls) {
					if (filter(cls))
						return true;
					cls = cls.parent;
				}
				return false;
			};
		},
		
		monitorInstances: function (baseClass, filter) {
			var instances = {};
			var logchange = function (cls, delta) {
				var current = cls;
				while (current) {
					if (!instances[current.classname]) {
						instances[current.classname] = {
							count: 0,
							tree: 0
						};
					}
					instances[current.classname].tree += delta;
					if (current === cls)
						instances[current.classname].count += delta;
					if (instances[current.classname].count === 0 && instances[current.classname].tree === 0)
						delete instances[current.classname];
					current = current.parent;
				}
			};
			var constructorHook = Hooks.hookMethod("constructor", baseClass.prototype, function (method, ctx, args, instance) {
				if (!filter(instance.cls))
					return;
				logchange(instance.cls, +1);
			});
			var destroyHook = Hooks.hookMethod("destroy", baseClass.prototype, function (method, ctx, args, instance) {
				if (!filter(instance.cls))
					return;
				logchange(instance.cls, -1);
			});
			return {
				instances: instances,
				hooks: {
					constructor: constructorHook,
					destroy: destroyHook
				}
			};
		},
		
		unmonitorInstances: function (monitor) {
			Hooks.unhookMethod(monitor.hooks.destroyHook);
			Hooks.unhookMethod(monitor.hooks.constructorHook);
		},
		
		toHTMLTable: function (monitor) {
			var result = [];
			result.push("<table><thead><tr><th>");
			result.push(["Class", "Count", "Tree"].join("</th><th>"));
			result.push("</th></thead><tbody>");
			for (var classname in monitor.instances) {
				var r = monitor.instances[classname];
				result.push("<tr><td>");
				result.push([classname, r.count, r.tree].join("</td><td>"));
				result.push("</td></tr>");
			}
			result.push("</tbody></table>");
			return result.join("");
		}
		
	};
});
Scoped.define("module:Profiler", [
    "module:Hooks",
    "module:Timing"
], function (Hooks, Timing) {
	return {
		
		createProfile: function () {
			return {
				
				_entered: 0,
				_suspended: 0,
				_time: 0,
				_startTime: 0,
				
				_totalEnterCount: 0,
				_enterCount: 0,
				
				enter: function () {
					this._totalEnterCount++;
					this._entered++;
					if (this._entered === 1 && this._suspended < 1) {
						this._startTime = Timing.now();
						this._enterCount++;
					}
				},
				
				leave: function () {
					this._entered--;
					if (this._entered === 0 && this._suspended < 1)
						this._time += Timing.now() - this._startTime;
				},
				
				suspend: function () {
					this._suspended++;
					if (this._entered > 0 && this._suspended === 1)
						this._time += Timing.now() - this._startTime;
				},
				
				resume: function () {
					this._suspended--;
					if (this._entered > 0 && this._suspended === 0)
						this._startTime = Timing.now();
				},
				
				time: function () {
					return this._entered > 0 && this._suspended < 1 ? Timing.now() - this._startTime + this._time : this._time;
				},
				
				profile: function () {
					return {
						time: this.time(),
						totalEnterCount: this._totalEnterCount,
						enterCount: this._enterCount
					};
				}
				
			};
		},
		
		profilePrototypes: function (includedPrototypes, excludedPrototypes) {
			var profile = this.createProfile();
			for (var i = 0; i < includedPrototypes.length; ++i)
				Hooks.hookPrototypeMethods(includedPrototypes[i], profile.enter, profile.leave, profile);
			for (var e = 0; e < excludedPrototypes.length; ++e)
				Hooks.hookPrototypeMethods(excludedPrototypes[e], profile.suspend, profile.resume, profile);
			return profile;	
		},
		
		profileMethod: function (method, context) {
			var profile = this.createProfile();
			return {
				profile: profile,
				hook: Hooks.hookMethod(method, context, profile.enter, profile.leave, profile)
			};
		},
		
		profilePrototypeMethod: function (method, cls) {
			var profile = this.createProfile();
			return {
				profile: profile,
				hook: Hooks.hookPrototypeMethod(method, cls, profile.enter, profile.leave, profile)
			};
		}

	};
});
Scoped.define("module:Timing", [], function () {
	
	return {

		now: function () {
			return window.performance && window.performance.now ? performance.now() : (new Date()).getTime();
		}
		
	};
});
}).call(Scoped);