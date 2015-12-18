Scoped.define("module:Timing", [], function () {
	
	return {

		now: function () {
			return window.performance && window.performance.now ? performance.now() : (new Date()).getTime();
		}
		
	};
});