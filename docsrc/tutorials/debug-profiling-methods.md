The debugging profiles allows to hook single or all methods of a BetaJS object or class.

This is particularly helpful for understanding how often a particular method, object or class is being called.

If you want to hook class method `foobar` of class `C`, you can write:

```javascript
	var hook = BetaJSDebug.Hooks.hookMethod("foobar", C, function (method, Cls, args, callContext) {
		// called when the method foobar is being called.
	}, function (method, Cls, args, callContext, result) {
		// called after the method foobar was called
	});
```

After you're done, you can unregister the hook as follows:

```javascript
	BetaJSDebug.Hooks.unhookMethod(hook);
```

You can also hook instance methods. Assume that class `C` also has an instance method `method`:

```javascript
	var hook = BetaJSDebug.Hooks.hookPrototypeMethod("method", C, function (method, Cls, args, callContext) {
		// called when the method foobar is being called.
	}, function (method, Cls, args, callContext, result) {
		// called after the method foobar was called
	});
```

Finally, you can also hook all class / instance methods:

```javascript
	var hooks = BetaJSDebug.Hooks.hookMethods(C, function (method, Cls, args, callContext) {
		// called when the method foobar is being called.
	}, function (method, Cls, args, callContext, result) {
		// called after the method foobar was called
	});
``` 

```javascript
	var hooks = BetaJSDebug.Hooks.hookPrototypeMethods(C, function (method, Cls, args, callContext) {
		// called when the method foobar is being called.
	}, function (method, Cls, args, callContext, result) {
		// called after the method foobar was called
	});
``` 

```javascript
	BetaJSDebug.Hooks.unhookMethods(hooks);
```
