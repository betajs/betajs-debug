Profiling instantiation allows you to find memory leaks, by counting how many instances are present at a particular time.

To start monitoring instantiation of a particular base class `BaseClass`, we create a sub class `filter` (more on that in a second) and set up the debugger:

```javascript
	var debugger = BetaJSDebug.Instances.monitorInstances(BaseClass, filter);
``` 

Once you're done debugging, you can unregister the debugger as follows:

```javascript
	BetaJSDebug.Instances.unmonitorInstances(debugger);
```

The easiest way to inspect the instance monitor at any point, is to convert the data to an HTML table (which can be added to the DOM, e.g. using jQuery):

```javascript
	BetaJSDebug.Instances.toHTMLTable(debugger);
```

Filters allow you to restrict the sub classes of the `BaseClass` that you want to track. You can create basic filters and then use compound filters to combine them:

- `BetaJSDebug.Instances.allFilter()`: matches all classes
- `BetaJSDebug.Instances.andFilter(filters)`: matches if all filters in the array match
- `BetaJSDebug.Instances.orFilter(filters)`: matches if one filter in the array matches
- `BetaJSDebug.Instances.regexFilter(regex)`: matches if the class name matches the regular expression
- `BetaJSDebug.Instances.ancestryFilter(filter)`: matches if the class or any of the ancestors matches the filter