'use strict';

function incomesDetailModalController($scope, $uibModalInstance, Utils, Categories, Accounts, Currencies, incomeDetail, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
	$scope.incomeStatus = ['Em aberto', 'Recebido'];
	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar detalhe';
		$scope.incomeDetail = { status: 'Em aberto' };
		$scope.loading = false;
	}
	else {
		if (action == 'clone') {
			$scope.screenTitle = 'Clonar detalhe';
		} else {
			$scope.screenTitle = 'Editar detalhe';
		}

		$scope.incomeDetail = {
			$$hashKey: incomeDetail.$$hashKey,
			_id: incomeDetail._id,
			description: incomeDetail.description,
			amount: incomeDetail.amount,
			account_id: incomeDetail.account_id,
			_account: incomeDetail._account,
			category_id: incomeDetail.category_id,
			_category: incomeDetail._category,
			currency_id: incomeDetail.currency_id,
			_currency: incomeDetail._currency,
			status: incomeDetail.status
		};

		if (action == 'clone') {
			delete $scope.incomeDetail.$$hashKey;
			delete $scope.incomeDetail._id;
			$scope.incomeDetail.description += ' - Cópia';
		}
	};

	var filter = 'type=Receita&enabled=true';
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
				$scope.incomeDetail.currency_id = Utils.getDefaultCurrencyId(response.data);
			}

			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	$scope.submitDetail = function () {
		if ($scope.incomeDetailForm.$valid) {
			$scope.incomeDetail._action = $scope.action;

			// Get object for selected account
			var selAccount = $.grep($scope.accounts, function (e) { return e._id == $scope.incomeDetail.account_id });
			$scope.incomeDetail._account = selAccount[0];

			// Get object for selected category
			var selCategory = $.grep($scope.categories, function (e) { return e._id == $scope.incomeDetail.category_id });
			$scope.incomeDetail._category = selCategory[0];

			// Get object for selected currency
			var selCurrency = $.grep($scope.currencies, function (e) { return e._id == $scope.incomeDetail.currency_id });
			$scope.incomeDetail._currency = selCurrency[0];

			$uibModalInstance.close($scope.incomeDetail);
		} else {
			$scope.submitted = true;
		}
	}

	$scope.cancelDetail = function () {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.formatNumericAmount = function (event) {
		$scope.incomeDetail.amount = Utils.formatPastedNumer(event);
	}
};
