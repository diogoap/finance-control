'use strict';

function incomesDetailModalController($scope, $modalInstance, Utils, Categories, Accounts, incomeDetail, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
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
		if (action == 'clone') {
			$scope.screenTitle = 'Clonar detalhe';
		} else {
			$scope.screenTitle = 'Editar detalhe';
		}

		$scope.incomeDetail = {
			_id: incomeDetail._id,
			description: incomeDetail.description,
			amount: incomeDetail.amount,
			account_id: incomeDetail.account_id,
			_account: incomeDetail._account,
			category_id: incomeDetail.category_id,
			_category: incomeDetail._category,
			status: incomeDetail.status };

		if (action == 'clone') {
			$scope.incomeDetail._id = null;
			$scope.incomeDetail.description += ' - Cópia';
		}

		$scope.loading = false;
	};

	var filter = 'type=Receita&enabled=true';
	Categories.get(filter)
		.success(function(data) {
			$scope.categories = data;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

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
