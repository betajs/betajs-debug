Scoped.define("module:Timing", [], function () {
	
	return {

		now: function () {
			return performance.now();
		}
		
	};
});