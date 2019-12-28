'use strict';

function expensesDetailModalController($scope, $uibModalInstance, Utils, Categories, Accounts, Currencies, expenseDetail, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
	$scope.expenseStatus = ['Em aberto', 'Pago'];
	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar detalhe';
		$scope.expenseDetail = { status: 'Em aberto' };
		$scope.loading = false;
	}
	else {
		if (action == 'clone') {
			$scope.screenTitle = 'Clonar detalhe';
		} else {
			$scope.screenTitle = 'Editar detalhe';
		}

		$scope.expenseDetail = {
			$$hashKey: expenseDetail.$$hashKey,
			_id: expenseDetail._id,
			description: expenseDetail.description,
			amount: expenseDetail.amount,
			account_id: expenseDetail.account_id,
			_account: expenseDetail._account,
			category_id: expenseDetail.category_id,
			_category: expenseDetail._category,
			currency_id: expenseDetail.currency_id,
			_currency: expenseDetail._currency,
			status: expenseDetail.status
		};

		if (action == 'clone') {
			delete $scope.expenseDetail.$$hashKey;
			delete $scope.expenseDetail._id;
			$scope.expenseDetail.description += ' - Cópia';
		}
	};

	var filter = 'type=Despesa&enabled=true';
	Categories.get(filter)
		.then(function onSucess(response) {
			$scope.categories = response.data;
			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	var filter = 'enabled=true';
	Accounts.get(filter)
		.then(function onSucess(response) {
			$scope.accounts = response.data;
			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	Currencies.get(filter)
		.then(function onSucess(response) {
			$scope.currencies = response.data;

			if (action == 'new') {
				$scope.expenseDetail.currency_id = Utils.getDefaultCurrencyId(response.data);
			}

			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	$scope.submitDetail = function () {
		if ($scope.expenseDetailForm.$valid) {
			$scope.expenseDetail._action = $scope.action;

			// Get object for selected account
			var selAccount = $.grep($scope.accounts, function (e) { return e._id == $scope.expenseDetail.account_id });
			$scope.expenseDetail._account = selAccount[0];

			// Get object for selected category
			var selCategory = $.grep($scope.categories, function (e) { return e._id == $scope.expenseDetail.category_id });
			$scope.expenseDetail._category = selCategory[0];

			// Get object for selected currency
			var selCurrency = $.grep($scope.currencies, function (e) { return e._id == $scope.expenseDetail.currency_id });
			$scope.expenseDetail._currency = selCurrency[0];

			$uibModalInstance.close($scope.expenseDetail);
		} else {
			$scope.submitted = true;
		}
	}

	$scope.cancelDetail = function () {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.formatNumericAmount = function (event) {
		$scope.expenseDetail.amount = Utils.formatPastedNumer(event);
	}

};
