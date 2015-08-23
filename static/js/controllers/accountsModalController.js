'use strict';

function accountsModalController($scope, $modalInstance, Utils, Accounts, accountId, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar conta';
		$scope.account = { initialBalance: 0 };
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar conta';

		Accounts.getById(accountId)
			.success(function(data) {
				$scope.account = data;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.submit = function () {
    	if ($scope.accountForm.$valid) {
			$scope.account._action = $scope.action;
			$modalInstance.close($scope.account);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
};
