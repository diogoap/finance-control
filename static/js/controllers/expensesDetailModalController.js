'use strict';

function expensesDetailModalController($scope, $modalInstance, Categories, Accounts, expenseDetail, action) {
	$scope.loading = true;
	$scope.errorMessage = '';
	$scope.action = action;
 	$scope.expenseStatus = ['Em aberto', 'Pago'];
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar detalhe';
		$scope.expenseDetail = { status: 'Em aberto' };
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar detalhe';
		$scope.expenseDetail = {
			_id: expenseDetail._id,
			description: expenseDetail.description,
			amount: expenseDetail.amount,
			account_id: expenseDetail.account_id,
			_account: expenseDetail._account,
			category_id: expenseDetail.category_id,
			_category: expenseDetail._category,
			status: expenseDetail.status };
		$scope.loading = false;
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

	Accounts.get()
		.success(function(data) {
			$scope.accounts = data;
			$scope.errorMessage = null;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
			$scope.loading = false;
		});

	// OPEN CALANDAR ==============================================================
  	$scope.openCalendarDialog = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.opened = true;
  	};

	// MODAL SUBMIT ===============================================================
	$scope.submitDetail = function () {
    	if ($scope.expenseDetailForm.$valid) {
			$scope.expenseDetail._action = $scope.action;

			// Get object for selected account
			var selAccount = $.grep($scope.accounts, function(e){ return e._id == $scope.expenseDetail.account_id });
			$scope.expenseDetail._account = selAccount[0];

			// Get object for selected category
			var selCategory = $.grep($scope.categories, function(e){ return e._id == $scope.expenseDetail.category_id });
			$scope.expenseDetail._category = selCategory[0];

			$modalInstance.close($scope.expenseDetail);
    	} else {
      		$scope.submitted = true;
    	}
	};

	// MODAL CANCEL ===============================================================
	$scope.cancelDetail = function() {
		$modalInstance.dismiss('cancel');
	}

};
