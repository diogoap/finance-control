'use strict';

function transfersModalController($scope, $modalInstance, Utils, Transfers, Accounts, transferId, action) {
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
	else
	{
		$scope.screenTitle = 'Editar transferência';

		Transfers.getById(transferId)
			.success(function(data) {
				$scope.transfer = data;
				//Need to generate a new to date in order to make date picker work
				$scope.transfer.date = new Date($scope.transfer.date);
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	var filter = 'enabled=true';
	Accounts.get(filter)
		.success(function(data) {
			$scope.accounts = data;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

	$scope.openCalendarDialog = function($event) {
		$scope.opened = true;
	}

	$scope.submit = function () {
    	if ($scope.transferForm.$valid) {
			$scope.transfer._action = $scope.action;
			$modalInstance.close($scope.transfer);
    	} else {
      		$scope.submitted = true;
    	}
	}

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}

	$scope.formatNumericAmount = function(event) {
		$scope.transfer.amount = Utils.formatPastedNumer(event);
	}
};
