'use strict';

function loansModalController($scope, $modalInstance, Utils, Loans, Accounts, loanId, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.loanType = ['Tomado', 'Concedido'];
	$scope.loanStatus = ['Em aberto', 'Quitado'];
	$scope.action = action;
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar empréstimo';
		$scope.loan = { transactionDate: new Date(), dueDate: new Date(), status: 'Em aberto' };
		$scope.loading = false;
	}
	else
	{
		if (action == 'clone') {
			$scope.screenTitle = 'Clonar empréstimo';
		} else {
			$scope.screenTitle = 'Editar empréstimo';
		}

		Loans.getById(loanId)
			.success(function(data) {
				$scope.loan = data;
				//Need to generate a new to date in order to make date picker work
				$scope.loan.transactionDate = new Date($scope.loan.transactionDate);
				$scope.loan.dueDate = new Date($scope.loan.dueDate);

				if (action == 'clone') {
					$scope.loan._id = null;
					$scope.loan.description += ' - Cópia';
				}

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

	$scope.openCalendarDialogTransactionDate = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.transactionDateOpened = true;
	};

  	$scope.openCalendarDialogDueDate = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.dueDateOpened = true;
  	};

	$scope.submit = function () {
    	if ($scope.loanForm.$valid) {
			$scope.loan._action = $scope.action;
			$modalInstance.close($scope.loan);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
};
