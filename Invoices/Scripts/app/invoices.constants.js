(function () {
	//==============================================================================================
	// Module
	//==============================================================================================

	const module = angular.module('invoices.constants', []);

	//==============================================================================================
	// inConstants service
	//==============================================================================================

	module.service('inConstants', function () {
		this.constants = {
			errors: {
				invoiceNotFound: 'invoiceNotFound'
			}
		};
	});
})();

// EOF