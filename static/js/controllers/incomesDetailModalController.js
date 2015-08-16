'use strict';

function incomesDetailModalController($scope, $modalInstance, Categories, Accounts, incomeDetail, action) {
	$scope.loading = true;
	$scope.errorMessage = '';
	$scope.action = action;
 	$scope.incomeStatus = ['Em aberto', 'Recebido'];
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar detalhe';
		$scope.incomeDetail = { status: 'Em aberto' };
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar detalhe';
		$scope.incomeDetail = {
			_id: incomeDetail._id,
			description: incomeDetail.description,
			amount: incomeDetail.amount,
			account_id: incomeDetail.account_id,
			_account: incomeDetail._account,
			category_id: incomeDetail.category_id,
			_category: incomeDetail._category,
			status: incomeDetail.status };
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
    	if ($scope.incomeDetailForm.$valid) {
			$scope.incomeDetail._action = $scope.action;

			// Get object for selected account
			var selAccount = $.grep($scope.accounts, function(e){ return e._id == $scope.incomeDetail.account_id });
			$scope.incomeDetail._account = selAccount[0];

			// Get object for selected category
			var selCategory = $.grep($scope.categories, function(e){ return e._id == $scope.incomeDetail.category_id });
			$scope.incomeDetail._category = selCategory[0];

			$modalInstance.close($scope.incomeDetail);
    	} else {
      		$scope.submitted = true;
    	}
	};

	// MODAL CANCEL ===============================================================
	$scope.cancelDetail = function() {
		$modalInstance.dismiss('cancel');
	}

};
