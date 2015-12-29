'use strict';

function incomesDetailModalController($scope, $uibModalInstance, Utils, Categories, Accounts, incomeDetail, action) {
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
			$$hashKey: incomeDetail.$$hashKey,
			_id: incomeDetail._id,
			description: incomeDetail.description,
			amount: incomeDetail.amount,
			account_id: incomeDetail.account_id,
			_account: incomeDetail._account,
			category_id: incomeDetail.category_id,
			_category: incomeDetail._category,
			status: incomeDetail.status };

		if (action == 'clone') {
			delete $scope.incomeDetail.$$hashKey;
			delete $scope.incomeDetail._id;
			$scope.incomeDetail.description += ' - Cópia';
		}
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

	$scope.submitDetail = function () {
    	if ($scope.incomeDetailForm.$valid) {
			$scope.incomeDetail._action = $scope.action;

			// Get object for selected account
			var selAccount = $.grep($scope.accounts, function(e){ return e._id == $scope.incomeDetail.account_id });
			$scope.incomeDetail._account = selAccount[0];

			// Get object for selected category
			var selCategory = $.grep($scope.categories, function(e){ return e._id == $scope.incomeDetail.category_id });
			$scope.incomeDetail._category = selCategory[0];

			$uibModalInstance.close($scope.incomeDetail);
    	} else {
      		$scope.submitted = true;
    	}
	}

	$scope.cancelDetail = function() {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.formatNumericAmount = function(event) {
		$scope.incomeDetail.amount = Utils.formatPastedNumer(event);
	}
};
