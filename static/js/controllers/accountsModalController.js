'use strict';

function accountsModalController($scope, $uibModalInstance, Utils, Accounts, Currencies, accountId, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar conta';
		$scope.account = { initialBalance: 0, enabled: true };
		$scope.loading = false;
	}
	else {
		$scope.screenTitle = 'Editar conta';

		Accounts.getById(accountId)
			.then(function onSucess(response) {
				$scope.account = response.data;
				$scope.loading = false;
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
				$scope.loading = false;
			});
	}

	var filter = 'enabled=true';
	Currencies.get(filter)
		.then(function onSucess(response) {
			$scope.currencies = response.data;

			if (action == 'new') {
				$scope.account.currency_id = Utils.getDefaultCurrencyId(response.data);
			}

			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	$scope.submit = function () {
		if ($scope.accountForm.$valid) {
			$scope.account._action = $scope.action;
			$uibModalInstance.close($scope.account);
		} else {
			$scope.submitted = true;
		}
	}

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.formatNumericInitialBalance = function (event) {
		$scope.account.initialBalance = Utils.formatPastedNumer(event);
	}
};
