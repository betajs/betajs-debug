/*!
betajs-debug - v0.0.3 - 2015-12-17
Copyright (c) Oliver Friedmann
MIT Software License.
*/
(function () {

var Scoped = this.subScope();

Scoped.binding("module", "global:BetaJSDebug");

Scoped.define("module:", function () {
	return {
		guid: "d33ed9c4-d6fc-49d4-b388-cd7b9597b63a",
		version: '4.1450405624902'
	};
});

Scoped.define("module:Hooks", [], function () {
	return {
		
		hookMethod: function (method, context, beginCallback, endCallback, callbackContext) {
			var old = context[method];
			context[method] = function () {
				if (beginCallback)
					beginCallback.call(callbackContext, method, context, arguments);
				var exc = null;
				var result = null;
				try {
					result = old.apply(this, arguments);
				} catch (e) {
					exc = e;
				}
				if (endCallback)
					endCallback.call(callbackContext, method, context, arguments, result, exc);
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