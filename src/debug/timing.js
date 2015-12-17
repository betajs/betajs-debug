Scoped.define("module:Timing", [], function () {
	
	return {

		now: function () {
			return window.performance ? performance.now() : (new Date()).getTime();
		}
		
	};
});