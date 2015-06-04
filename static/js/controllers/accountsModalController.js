'use strict';

function accountsModalController($scope, $modalInstance, Accounts, accountId, action) {
	$scope.loading = true;
	$scope.errorMessage = '';
	$scope.action = action;
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar conta';
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar conta';

		Accounts.getById(accountId)
			.success(function(data) {
				$scope.account = data;
				$scope.errorMessage = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
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