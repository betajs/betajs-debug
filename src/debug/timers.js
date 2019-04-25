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
