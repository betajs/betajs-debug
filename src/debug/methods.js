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