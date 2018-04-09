(function () {
	//==============================================================================================
	// Module
	//==============================================================================================

	const module = angular.module(
		'invoices.api',
		[
			'invoices.service-mock'
		]
	);

	//==============================================================================================
	// inApi class
	//==============================================================================================

	class inApi {
		constructor(inServiceMock) {
			this.inServiceMock = inServiceMock;
		}

		getInvoices(query) {
			return this.inServiceMock.serviceMock.getInvoices(query);
		}

		deleteInvoices(query, deleteQuery) {
			return this.inServiceMock.serviceMock.deleteInvoices(query, deleteQuery);
		}

		editInvoice(listQuery, getInvoiceQuery, editInvoiceQuery) {
			return this.inServiceMock.serviceMock.editInvoice(listQuery, getInvoiceQuery, editInvoiceQuery);
		}

		addInvoice(listQuery, invoice) {
			return this.inServiceMock.serviceMock.addInvoice(listQuery, invoice);
		}
	}

	//==============================================================================================
	// inApi service
	//==============================================================================================

	module.service('inApi', function (inServiceMock) {
		this.api = new inApi(inServiceMock);
	});
})();

// EOF