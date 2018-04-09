(function () {
	//==============================================================================================
	// Module
	//==============================================================================================

	const module = angular.module(
		'invoices.libs',
		[
			'ngMaterial'
		]
	);

	//==============================================================================================
	// inMoment constant ("moment" library)
	//==============================================================================================

	module.constant('inMoment', moment);

	//==============================================================================================
	// inLodash constant ("lodash" library)
	//==============================================================================================

	module.constant('inLodash', _);

	//==============================================================================================
	// inRandom class (wrapper for "random-js" library)
	//==============================================================================================

	class inRandom {
		constructor(seed) {
			this.engine = Random.engines.mt19937().seed(seed);
		}

		randomBool() {
			return Random.bool()(this.engine);
		}

		randomInteger(min, max) {
			return Random.integer(min, max)(this.engine);
		}
	}

	//==============================================================================================
	// inRandom constant
	//==============================================================================================

	module.constant('inRandom', inRandom);

	//==============================================================================================
	// inMessageHandler class
	//==============================================================================================

	class inMessageHandler {
		constructor($mdToast) {
			this.$mdToast = $mdToast;
		}

		onError(err, message) {
			this.$mdToast.show(
				this.$mdToast.simple()
					.textContent(message || 'Ошибка')
					.position('bottom left')
					.hideDelay(3000)
			);
		}
	}

	//==============================================================================================
	// inMessageHandler service
	//==============================================================================================

	module.service('inMessageHandler', function ($mdToast) {
		this.instance = new inMessageHandler($mdToast);
	});
})();

// EOF