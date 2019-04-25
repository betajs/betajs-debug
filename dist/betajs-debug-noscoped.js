/*!
betajs-debug - v0.0.14 - 2019-04-25
Copyright (c) Oliver Friedmann
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJSDebug');
Scoped.define("module:", function () {
	return {
    "guid": "d33ed9c4-d6fc-49d4-b388-cd7b9597b63a",
    "version": "0.0.14",
    "datetime": 1556234419949
};
});
Scoped.define("module:Helpers", [], function () {
    return {

        getStackTrace: function(index) {
            var stack = (new Error()).stack.split("\n");
            while (stack.length > 0 && stack[0].trim().toLowerCase() === "error")
                stack.shift();
            return index ? stack.slice(index) : stack;
        }

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
			var logchange = function (cls, delta, cid) {
				var current = cls;
				while (current) {
					if (!instances[current.classname]) {
						instances[current.classname] = {
							count: 0,
							tree: 0,
							cids: {}
						};
					}
					instances[current.classname].tree += delta;
					if (current === cls) {
                        instances[current.classname].count += delta;
                        if (delta > 0)
							instances[current.classname].cids[cid] = true;
                        else
                            delete instances[current.classname].cids[cid];
                    }
					if (instances[current.classname].count === 0 && instances[current.classname].tree === 0)
						delete instances[current.classname];
					current = current.parent;
				}
			};
			var constructorHook = Hooks.hookMethod("constructor", baseClass.prototype, undefined, function (method, ctx, args, result, exc, instance) {
				if (!filter(instance.cls))
					return;
				logchange(instance.cls, +1, instance.cid());
			});
			var destroyHook = Hooks.hookMethod("destroy", baseClass.prototype, function (method, ctx, args, instance) {
				if (!filter(instance.cls))
					return;
				logchange(instance.cls, -1, instance.cid());
			});
			return {
				instances: instances,
				hooks: {
					constructorHook: constructorHook,
					destroyHook: destroyHook
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
		},

        toText: function (monitor) {
            var result = [];
            result.push(["Class", "Count", "Tree"].join("\t"));
            for (var classname in monitor.instances) {
                var r = monitor.instances[classname];
                var cids = [];
                for (cid in r.cids)
                	cids.push(cid);
                result.push([classname, r.count, r.tree, cids.join(",")].join("\t"));
            }
            return result.join("\n");
        }

		
	};
});
Scoped.define("module:Methods", [
    "module:Hooks"
], function (Hooks) {
	return {
				
		monitorInstances: function (baseClass, filter) {
			var classes = {};
			var beginCallMethod = function (method, instance) {
				var methods = classes[instance.cls.classname].methods;
				methods[method] = methods[method] || {
					count: 0
				};
				methods[method].count++;
			};
			var constructorHook = Hooks.hookMethod("constructor", baseClass.prototype, function (method, ctx, args, instance) {
				if (!filter(instance.cls))
					return;
				if (classes[instance.cls.classname])
					return;
				classes[instance.cls.classname] = {
					cls: instance.cls,
					hooks: {
						methods: Hooks.hookPrototypeMethods(instance.cls, beginCallMethod)
					},
					methods: {}
				};
			});
			return {
				classes: classes,
				hooks: {
					constructorHook: constructorHook
				}
			};
		},
		
		unmonitorInstances: function (monitor) {
			Hooks.unhookMethod(monitor.hooks.constructorHook);
			for (var classname in monitor.classes) {
				var cls = monitor.classes[classname];
				Hooks.unhookMethods(cls.hooks.methods);
			}
		},
		
		toHTMLTable: function (monitor) {
			var result = [];
			result.push("<table><thead><tr><th>");
			result.push(["Class", "Method", "Count"].join("</th><th>"));
			result.push("</th></thead><tbody>");
			for (var classname in monitor.classes) {
				var cls = monitor.classes[classname];
				for (var methodname in cls.methods) {
					var method = cls.methods[methodname];
					result.push("<tr><td>");
					result.push([classname,  methodname, method.count].join("</td><td>"));
					result.push("</td></tr>");
				}
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
Scoped.define("module:Timers", [
	"module:Hooks",
	"module:Helpers"
], function (Hooks, Helpers) {
	return {

		hookTimers: function () {
			var handleCounter = 0;
			var handleConvert = function (handle) {
				if (typeof handle === "number")
					return handle;
				if (!handle.__handleCounter) {
					handleCounter++;
					handle.__handleCounter = handleCounter;
				}
				return handle.__handleCounter;
			};
			var ctx = null;
			try {
				ctx = window;
			} catch (e) {
				ctx = global;
			}
			var result = {
				intervals: {},
				timeouts: {},
				hooks: [
					Hooks.hookMethod("setInterval", ctx, null,function (m, c, args, handle) {
						result.intervals[handleConvert(handle)] = {
							func: args[0],
							intv: args[1],
							stack: Helpers.getStackTrace()
						};
					}),

					Hooks.hookMethod("clearInterval", ctx, function (m, c, args) {
						delete result.intervals[handleConvert(args[0])];
					}),

					Hooks.hookMethod("setTimeout", ctx, null,function (m, c, args, handle) {
						result.timeouts[handleConvert(handle)] = {
							func: args[0],
							intv: args[1],
							stack: Helpers.getStackTrace()
						};
					}),

					Hooks.hookMethod("clearTimeout", ctx, function (m, c, args) {
						delete result.timeouts[handleConvert(args[0])];
					})
				]
			};
			return result;
		},

		unhookTimers: function (obj) {
			Hooks.unhookMethods(obj.hooks);
		},

		digest: function (obj) {
			return {
				intervals: obj.intervals,
				timeouts: obj.timeouts
			}
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