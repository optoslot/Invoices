(function () {
	//==============================================================================================
	// Module
	//==============================================================================================

	const module = angular.module(
		'invoices.service-mock',
		[
			'invoices.constants',
			'invoices.libs'
		]
	);

	//==============================================================================================
	// inServiceMockData service
	//==============================================================================================

	module.service('inServiceMockData', function (inRandom, inModelInvoiceStatus, inModelInvoicePaymentMethod) {
		this.curId = 1;

		const invoices = (() => {
			const random = new inRandom(2149873);

			const dateFrom = new Date(2010, 1, 1, 0, 0, 0, 0).getTime();
			const dateTo = new Date().getTime();

			let number = 1000;

			const generateRandomInvoice = () => {
				const invoice = {
					id: this.curId++,
					createdAt: new Date(random.randomInteger(dateFrom, dateTo)),
					number: (number++).toString(),
					status: inModelInvoiceStatus.array[
						random.randomInteger(0, inModelInvoiceStatus.array.length - 1)
					],
					amount: random.randomInteger(1000, 10000),
					paymentMethod: inModelInvoicePaymentMethod.array[
						random.randomInteger(0, inModelInvoicePaymentMethod.array.length - 1)
					]
				};

				return invoice;
			}

			const invoices = [];

			for (let i = 0; i < 1378; i++) {
				invoices.push(generateRandomInvoice());
			}

			return invoices;
		})();

		this.count = invoices.length;
		this.data = invoices;
	});

	//==============================================================================================
	// inServiceMock class
	//==============================================================================================

	class inServiceMock {
		static get delay() {
			return 2000;
		}

		constructor($q, inServiceMockData, inLodash, inRandom, inConstants) {
			this.$q = $q;
			this.inServiceMockData = inServiceMockData;
			this.inLodash = inLodash;
			this.inRandom;
			this.inConstants = inConstants;

			// Init

			this.random = new inRandom(9430857);
		}

		_query(bodyFunc) {
			const deferred = this.$q.defer();

			setTimeout(() => {
				bodyFunc(deferred);
			}, inServiceMock.delay);

			return {
				promise: deferred.promise
			};
		}

		_defaultQuery(listQuery, bodyFunc) {
			return this._query((deferred) => {
				// Reject with error randomly

				if (this.random.randomBool()) {
					return deferred.reject('Random testing error');
				}

				// Invoke body func

				if (bodyFunc) {
					bodyFunc(deferred);
					if (deferred.promise.$$state.status) {
						return;
					}
				}

				if (!listQuery) {
					return deferred.resolve();
				}

				// Transform ordering options

				let field;
				if (listQuery.order.charAt(0) !== '-') {
					field = {
						order: 'asc',
						name: listQuery.order
					};
				} else {
					field = {
						order: 'desc',
						name: listQuery.order.substring(1)
					};
				}

				// Order items

				const orderedItems = this.inLodash.orderBy(this.inServiceMockData.data, [field.name], [field.order]);

				// Paginate items

				const orderedPaginatedItems = [];

				for (
						let i = (listQuery.page - 1) * listQuery.limit;
						i < listQuery.page * listQuery.limit
						&& i < this.inServiceMockData.count;
						i++
				) {
					orderedPaginatedItems.push(orderedItems[i]);
				}

				// Resolve

				return deferred.resolve({
					count: this.inServiceMockData.count,
					data: orderedPaginatedItems
				});
			});
		}

		getInvoices(listQuery) {
			return this._defaultQuery(listQuery, null);
		}

		deleteInvoices(listQuery, deleteQuery) {
			return this._defaultQuery(listQuery, (deferred) => {
				if (deleteQuery.ids && deleteQuery.ids.length) {
					this.inLodash.remove(this.inServiceMockData.data, (curInvoice) => {
						return this.inLodash.some(deleteQuery.ids, (id) => {
							return id === curInvoice.id;
						});
					});
					this.inServiceMockData.count = this.inServiceMockData.data.length;
				}
			});
		}

		editInvoice(listQuery, getInvoiceQuery, editInvoiceQuery) {
			return this._defaultQuery(listQuery, (deferred) => {
				const invoice = this.inLodash.find(this.inServiceMockData.data, {
					id: getInvoiceQuery.id
				});

				if (!invoice) {
					return deferred.reject({
						error: { code: this.inConstants.constants.errors.invoiceNotFound }
					});
				}

				if (editInvoiceQuery.set) {
					for (const setKey in editInvoiceQuery.set) {
						switch (setKey) {
							case 'status': {
								invoice.status = editInvoiceQuery.set[setKey].value;
								break;
							}
						}
					}
				}
			});
		}

		addInvoice(listQuery, invoice) {
			return this._defaultQuery(listQuery, (deferred) => {
				const invoiceToAdd = this.inLodash.cloneDeep(invoice);
				invoiceToAdd.id = this.inServiceMockData.curId++;
				invoiceToAdd.createdAt = new Date();

				this.inServiceMockData.data.push(invoiceToAdd);
				this.inServiceMockData.count = this.inServiceMockData.data.length;
			});
		}
	}

	//==============================================================================================
	// inServiceMock service
	//==============================================================================================

	module.service('inServiceMock', function ($q, inServiceMockData, inLodash, inRandom, inConstants) {
		this.serviceMock = new inServiceMock($q, inServiceMockData, inLodash, inRandom, inConstants);
	});
})();

// EOF