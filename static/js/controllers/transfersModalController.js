'use strict';

function transfersModalController($scope, $modalInstance, Utils, Transfers, transferId, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar transferência';
		$scope.transfer = { amount: 0 };
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar transferência';

		Transfers.getById(transferId)
			.success(function(data) {
				$scope.transfer = data;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.submit = function () {
    	if ($scope.transferForm.$valid) {
			$scope.transfer._action = $scope.action;
			$modalInstance.close($scope.transfer);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
};
