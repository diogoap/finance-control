'use strict';

function accountsModalController($scope, $uibModalInstance, Utils, Accounts, accountId, action) {
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
	}

	$scope.submit = function () {
    	if ($scope.accountForm.$valid) {
			$scope.account._action = $scope.action;
			$uibModalInstance.close($scope.account);
    	} else {
      		$scope.submitted = true;
    	}
	}

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.formatNumericInitialBalance = function(event) {
    	$scope.account.initialBalance = Utils.formatPastedNumer(event);
    }

	$scope.$on('$locationChangeStart', function(event, next, current){
	    event.preventDefault();
		$scope.cancel();
	});
};
