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
		.success(function (data) {
			$scope.categories = data;
			$scope.loading = false;
		})
		.error(function (data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

	var filter = 'enabled=true';
	Accounts.get(filter)
		.success(function (data) {
			$scope.accounts = data;
			$scope.loading = false;
		})
		.error(function (data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

	Currencies.get(filter)
		.success(function (data) {
			$scope.currencies = data;

			if (action == 'new') {
				$scope.income.currency_id = Utils.getDefaultCurrencyId(data);		
			}

			$scope.loading = false;
		})
		.error(function (data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
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
