```js

	var setMethodProfile = BetaJSDebug.Profiler.profilePrototypeMethod("set", BetaJS.Properties.Properties); 
	
    // Code
    
    BetaJSDebug.Hooks.unhookMethod(setMethodProfile.hook);
    
    console.log("Set was called", activateProfile.profile.profile().enterCount, "times.");

```
