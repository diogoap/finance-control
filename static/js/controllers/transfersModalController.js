'use strict';

function transfersModalController($scope, $uibModalInstance, Utils, Transfers, Accounts, Currencies, transferId, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar transferência';
		$scope.transfer = { date: new Date() };
		$scope.loading = false;
	}
	else {
		$scope.screenTitle = 'Editar transferência';

		Transfers.getById(transferId)
			.then(function onSucess(response) {
				$scope.transfer = response.data;
				//Need to generate a new to date in order to make date picker work
				$scope.transfer.date = new Date($scope.transfer.date);
				$scope.loading = false;
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

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
				$scope.transfer.currency_id = Utils.getDefaultCurrencyId(response.data);
			}

			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	$scope.openCalendarDialog = function ($event) {
		$scope.opened = true;
	}

	$scope.submit = function () {
		if ($scope.transferForm.$valid) {
			$scope.transfer._action = $scope.action;
			$scope.transfer.date = Utils.getDateDst($scope.transfer.date);

			$uibModalInstance.close($scope.transfer);
		} else {
			$scope.submitted = true;
		}
	}

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.formatNumericAmount = function (event) {
		$scope.transfer.amount = Utils.formatPastedNumer(event);
	}
};
