(function () {
	//==============================================================================================
	// Module
	//==============================================================================================

	const module = angular.module(
		'invoices.app',
		[
			'invoices.constants',
			'invoices.libs',
			'invoices.model',
			'invoices.api',
			'ngRoute',
			'ngMaterial',
			'ngMessages',
			'md.data.table',
			'angularMoment',
			'cgBusy'
		]
	);

	//==============================================================================================
	// Config material theme
	//==============================================================================================

	module.config(function ($mdThemingProvider) {
		$mdThemingProvider
			.theme('default')
			.primaryPalette('blue');
	});

	//==============================================================================================
	// Config route
	//==============================================================================================

	module.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/Content/templates/pages/inInvoicesPage.html'
			})
			.when('/new', {
				templateUrl: '/Content/templates/pages/inAddInvoicePage.html'
			})
			.otherwise({
				templateUrl: '/Content/templates/pages/inPageNotFoundPage.html'
			});
	});

	//==============================================================================================
	// inDateTime filter
	//==============================================================================================

	module.filter('inDateTime', function (inMoment) {
		return function (input) {
			return input && inMoment(input).format('DD.MM.YYYY HH:mm');
		};
	});

	//==============================================================================================
	// inModelInvoiceStatus filter
	//==============================================================================================

	module.filter('inModelInvoiceStatus', function () {
		// TODO: Move to localization
		const statusTexts = {
			New: 'Новый',
			Paid: 'Оплачен',
			Canceled: 'Отменен'
		};

		return function (input) {
			return input && statusTexts[input];
		};
	});

	//==============================================================================================
	// inModelInvoicePaymentMethod filter
	//==============================================================================================

	module.filter('inModelInvoicePaymentMethod', function () {
		// TODO: Move to localization
		const paymentMethodTexts = {
			Card: 'Банковская карта',
			YandexMoney: 'Яндекс.Деньги',
			Qiwi: 'QIWI-кошелек'
		};

		return function (input) {
			return input && paymentMethodTexts[input];
		};
	});

	//==============================================================================================
	// inRoot controller/component
	//==============================================================================================

	class inRootCtrl {
		constructor() {
		}
	}

	class inRootComponent {
		constructor() {
			this.templateUrl = '/Content/templates/inRoot.html';
			this.controller = inRootCtrl;
			this.bindings = {};
		}
	}

	module.component('inRoot', new inRootComponent());

	//==============================================================================================
	// inInvoicesPageCtrl controller
	//==============================================================================================

	class inInvoicesPageCtrl {
		constructor(
				$scope,
				$location,
				inModelInvoiceStatus,
				inModelInvoicePaymentMethod,
				inApi,
				inMessageHandler,
				inLodash,
				inConstants) {
			this.$scope = $scope;
			this.$location = $location;
			this.inModelInvoiceStatus = inModelInvoiceStatus;
			this.inModelInvoicePaymentMethod = inModelInvoicePaymentMethod;
			this.inApi = inApi;
			this.inMessageHandler = inMessageHandler;
			this.inLodash = inLodash;
			this.inConstants = inConstants;

			// Options

			this.clearSelection();
			this.limitOptions = [5, 10, 15];

			this.options = {
				rowSelection: true,
				multiSelect: true,
				autoSelect: true,
				decapitate: false,
				boundaryLinks: false,
				pageSelect: true
			};

			this.query = {
				order: 'createdAt',
				limit: 10,
				page: 1
			};

			// Init

			this._loadItems();

			$scope.refreshItems = () => {
				this._loadItems();
				this.clearSelection();
			};

			$scope.reorderItems = () => {
				this._loadItems();
				this.clearSelection();
			};

			$scope.paginateItems = () => {
				this._loadItems();
				this.clearSelection();
			};

			$scope.deleteItems = () => {
				this._deleteItems();
				this.clearSelection();
			};
		}

		//------------------------------------------------------------------------------------------
		// UI enum getters
		//------------------------------------------------------------------------------------------

		getInvoiceStatuses() {
			return [
				this.inModelInvoiceStatus.enum.New,
				this.inModelInvoiceStatus.enum.Paid,
				this.inModelInvoiceStatus.enum.Canceled
			];
		}

		getInvoicePaymentMethods() {
			return [
				this.inModelInvoicePaymentMethod.enum.Card,
				this.inModelInvoicePaymentMethod.enum.YandexMoney,
				this.inModelInvoicePaymentMethod.enum.Qiwi
			];
		}

		//------------------------------------------------------------------------------------------
		// Transform data from UI to Service
		//------------------------------------------------------------------------------------------

		get serviceQuery() {
			return {
				order: this.query.order,
				limit: this.query.limit,
				page: this.query.page
			};
		}

		get serviceDeleteSelected() {
			return {
				ids: this.inLodash.map(this.selected, 'id')
			};
		}

		//------------------------------------------------------------------------------------------
		// Selection
		//------------------------------------------------------------------------------------------

		clearSelection() {
			this.selected = [];
		}

		//------------------------------------------------------------------------------------------
		// Item editing
		//------------------------------------------------------------------------------------------

		invoiceStatusChanged(invoice) {
			const invokeApiResult = this.inApi.api.editInvoice(
				this.serviceQuery,
				{
					id: invoice.id
				},
				{
					status: invoice.status
				}
			);
			invokeApiResult.promise.then(
				(invoices) => {
					this.stageQuery();
					this.invoices = invoices;
					this.stageInvoices();
				},
				(reason) => {
					this.unstageQuery();
					this.unstageInvoices();
					if (reason.error) {
						switch (reason.error.code) {
							case this.inConstants.constants.errors.invoiceNotFound: {
								this.inMessageHandler.instance.onError(reason, 'Счет не найден');
								return;
							}
						}
					}
					this.inMessageHandler.instance.onError(reason, 'Ошибка при изменении статуса счета');
				}
			);
			this.promise = invokeApiResult.promise;
			this.promiseMessage = 'Изменение статуса счета';
		}

		//------------------------------------------------------------------------------------------
		// Items handling
		//------------------------------------------------------------------------------------------

		selectItem() {
		}

		addInvoice() {
			this.$location.path('/new');
		}

		_loadItems() {
			const invokeApiResult = this.inApi.api.getInvoices(this.serviceQuery);
			invokeApiResult.promise.then(
				(invoices) => {
					this.stageQuery();
					this.invoices = invoices;
					this.stageInvoices();
				},
				(reason) => {
					this.unstageQuery();
					this.unstageInvoices();
					this.inMessageHandler.instance.onError(reason, 'Ошибка при загрузке счетов');
				}
			);
			this.promise = invokeApiResult.promise;
			this.promiseMessage = 'Загрузка счетов';
		}

		_deleteItems() {
			const invokeApiResult = this.inApi.api.deleteInvoices(this.serviceQuery, this.serviceDeleteSelected);
			invokeApiResult.promise.then(
				(invoices) => {
					this.stageQuery();
					this.invoices = invoices;
					this.stageInvoices();
				},
				(reason) => {
					this.unstageQuery();
					this.unstageInvoices();
					this.inMessageHandler.instance.onError(reason, 'Ошибка при удалении счетов');
				}
			);
			this.promise = invokeApiResult.promise;
			this.promiseMessage = 'Удаление счетов';
		}

		//------------------------------------------------------------------------------------------
		// Stage/unstage
		//------------------------------------------------------------------------------------------

		stageQuery() {
			if (this.query) {
				this.lastSuccessQuery = this.inLodash.cloneDeep(this.query);
			}
		}

		unstageQuery() {
			if (this.lastSuccessQuery) {
				this.query = this.inLodash.cloneDeep(this.lastSuccessQuery);
			}
		}

		stageInvoices() {
			if (this.invoices) {
				this.lastSuccessInvoices = this.inLodash.cloneDeep(this.invoices);
			}
		}

		unstageInvoices() {
			if (this.lastSuccessInvoices) {
				this.invoices = this.inLodash.cloneDeep(this.lastSuccessInvoices);
			}
		}
	}

	module.controller('inInvoicesPageCtrl', inInvoicesPageCtrl);

	//==============================================================================================
	// inAddInvoicePageCtrl controller
	//==============================================================================================

	class inAddInvoicePageCtrl {
		constructor(
				$location,
				inModelInvoiceStatus,
				inModelInvoicePaymentMethod,
				inApi,
				inMessageHandler) {
			this.$location = $location;
			this.inModelInvoiceStatus = inModelInvoiceStatus;
			this.inModelInvoicePaymentMethod = inModelInvoicePaymentMethod;
			this.inApi = inApi;
			this.inMessageHandler = inMessageHandler;

			// Init

			this.invoice = {};
		}

		//------------------------------------------------------------------------------------------
		// UI enum getters
		//------------------------------------------------------------------------------------------

		getInvoiceStatuses() {
			return [
				this.inModelInvoiceStatus.enum.New,
				this.inModelInvoiceStatus.enum.Paid,
				this.inModelInvoiceStatus.enum.Canceled
			];
		}

		getInvoicePaymentMethods() {
			return [
				this.inModelInvoicePaymentMethod.enum.Card,
				this.inModelInvoicePaymentMethod.enum.YandexMoney,
				this.inModelInvoicePaymentMethod.enum.Qiwi
			];
		}

		//------------------------------------------------------------------------------------------
		// Transform data from UI to Service
		//------------------------------------------------------------------------------------------

		get serviceInvoice() {
			return {
				number: this.invoice.number,
				status: this.invoice.status,
				amount: parseInt(this.invoice.amount),
				paymentMethod: this.invoice.paymentMethod
			};
		}

		//------------------------------------------------------------------------------------------
		// Add invoice
		//------------------------------------------------------------------------------------------

		addInvoice() {
			const invokeApiResult = this.inApi.api.addInvoice(null, this.serviceInvoice);
			invokeApiResult.promise.then(
				() => {
					this.$location.path('/');
				},
				(reason) => {
					this.inMessageHandler.instance.onError(reason, 'Ошибка при добавлении счета');
				}
			);
			this.promise = invokeApiResult.promise;
			this.promiseMessage = 'Добавление счета';
		}
	}

	module.controller('inAddInvoicePageCtrl', inAddInvoicePageCtrl);
})();

// EOF