(function () {
	//==============================================================================================
	// Module
	//==============================================================================================

	const module = angular.module('invoices.model', []);

	//==============================================================================================
	// inModelInvoiceStatus provider
	//==============================================================================================

	module.provider('inModelInvoiceStatus', function () {
		this.$get = function () {
			return this;
		};

		this.enum = {
			New: 'New',
			Paid: 'Paid',
			Canceled: 'Canceled'
		};

		this.array = [
			this.enum.New,
			this.enum.Paid,
			this.enum.Canceled
		];
	});

	//==============================================================================================
	// inModelInvoicePaymentMethod provider
	//==============================================================================================

	module.provider('inModelInvoicePaymentMethod', function () {
		this.$get = function () {
			return this;
		};

		this.enum = {
			Card: 'Card',
			YandexMoney: 'YandexMoney',
			Qiwi: 'Qiwi'
		};

		this.array = [
			this.enum.Card,
			this.enum.YandexMoney,
			this.enum.Qiwi
		];
	});
})();

// EOF