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