# betajs-debug 0.0.9
[![Code Climate](https://codeclimate.com/github/betajs/betajs-debug/badges/gpa.svg)](https://codeclimate.com/github/betajs/betajs-debug)


BetaJS-Debug is a library for debugging BetaJS-based applications.



## Getting Started


You can use the library in the browser, in your NodeJS project and compile it as well.

#### Browser

```javascript
	<script src="betajs-debug/dist/betajs-debug.min.js"></script>
``` 

#### NodeJS

```javascript
	var BetaJSDebug = require('betajs-debug/dist/betajs-debug.js');
```

#### Compile

```javascript
	git clone https://github.com/betajs/betajs-debug.git
	npm install
	grunt
```



## Basic Usage


```js

	var setMethodProfile = BetaJSDebug.Profiler.profilePrototypeMethod("set", BetaJS.Properties.Properties); 
	
    // Code
    
    BetaJSDebug.Hooks.unhookMethod(setMethodProfile.hook);
    
    console.log("Set was called", activateProfile.profile.profile().enterCount, "times.");

```



## Links
| Resource   | URL |
| :--------- | --: |
| Homepage   | [http://betajs.com](http://betajs.com) |
| Git        | [git://github.com/betajs/betajs-debug.git](git://github.com/betajs/betajs-debug.git) |
| Repository | [http://github.com/betajs/betajs-debug](http://github.com/betajs/betajs-debug) |
| Blog       | [http://blog.betajs.com](http://blog.betajs.com) | 
| Twitter    | [http://twitter.com/thebetajs](http://twitter.com/thebetajs) | 




## CDN
| Resource | URL |
| :----- | -------: |
| betajs-debug.js | [http://cdn.rawgit.com/betajs/betajs-debug/master/dist/betajs-debug.js](http://cdn.rawgit.com/betajs/betajs-debug/master/dist/betajs-debug.js) |
| betajs-debug.min.js | [http://cdn.rawgit.com/betajs/betajs-debug/master/dist/betajs-debug.min.js](http://cdn.rawgit.com/betajs/betajs-debug/master/dist/betajs-debug.min.js) |
| betajs-debug-noscoped.js | [http://cdn.rawgit.com/betajs/betajs-debug/master/dist/betajs-debug-noscoped.js](http://cdn.rawgit.com/betajs/betajs-debug/master/dist/betajs-debug-noscoped.js) |
| betajs-debug-noscoped.min.js | [http://cdn.rawgit.com/betajs/betajs-debug/master/dist/betajs-debug-noscoped.min.js](http://cdn.rawgit.com/betajs/betajs-debug/master/dist/betajs-debug-noscoped.min.js) |




## Weak Dependencies
| Name | URL |
| :----- | -------: |
| betajs-scoped | [Open](https://github.com/betajs/betajs-scoped) |


## Contributors

- Oliver Friedmann


## License

Apache-2.0


