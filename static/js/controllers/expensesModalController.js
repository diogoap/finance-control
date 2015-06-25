'use strict';

function expensesModalController($scope, $modalInstance, Expenses, Categories, expenseId, action) {
	$scope.loading = true;
	$scope.errorMessage = '';
	$scope.action = action;
 	$scope.expenseStatus = ['Em aberto', 'Pago', 'Cancelado'];	
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar despesa';
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar despesa';

		Expenses.getById(expenseId)
			.success(function(data) {
				$scope.expense = data;
				$scope.errorMessage = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
				$scope.loading = false;
			});		
	};

	Categories.get()
			.success(function(data) {
				$scope.categories = data;
				$scope.errorMessage = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
				$scope.loading = false;
			});		

  	$scope.openCalendarDialog = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.opened = true;
  	};	

	$scope.submit = function () {
    	if ($scope.expenseForm.$valid) {
			$scope.expense._action = $scope.action;
			$modalInstance.close($scope.expense);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
};