Scoped.define("module:Profiler", [
    "module:Hooks",
    "module:Timing"
], function (Hooks, Timing) {
	return {
		
		createProfile: function () {
			return {
				
				_entered: 0,
				_suspended: 0,
				_time: 0,
				_startTime: 0,			
				
				enter: function () {
					this._entered++;
					if (this._entered === 1 && this._suspended < 1)
						this._startTime = Timing.now();
				},
				
				leave: function () {
					this._entered--;
					if (this._entered === 0 && this._suspended < 1)
						this._time += Timing.now() - this._startTime;
				},
				
				suspend: function () {
					this._suspended++;
					if (this._entered > 0 && this._suspended === 1)
						this._time += Timing.now() - this._startTime;
				},
				
				resume: function () {
					this._suspended--;
					if (this._entered > 0 && this._suspended === 0)
						this._startTime = Timing.now();
				},
				
				time: function () {
					return this._entered > 0 && this._suspended < 1 ? Timing.now() - this._startTime + this._time : this._time;
				}
				
			};
		},
		
		profilePrototypes: function (includedPrototypes, excludedPrototypes) {
			var profile = this.createProfile();
			for (var i = 0; i < includedPrototypes.length; ++i)
				Hooks.hookPrototypeMethods(includedPrototypes[i], profile.enter, profile.leave, profile);
			for (var e = 0; e < excludedPrototypes.length; ++e)
				Hooks.hookPrototypeMethods(excludedPrototypes[e], profile.suspend, profile.resume, profile);
			return profile;	
		}

	};
});