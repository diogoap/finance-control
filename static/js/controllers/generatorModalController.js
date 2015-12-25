'use strict';

function generatorModalController($scope, $uibModal, $uibModalInstance, Utils, Generator, Categories, Accounts, type) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
 	$scope.submitted = false;
 	$scope.generatorDueDateTypes = {
		'PrimeiroDia': 'Primeiro dia do mês',
		'UltimoDia': 'Último dia do mês',
		'DiaEspecifico': 'Dia específico'
	};

	$scope.generatorParameters = { type: type, initialDate: new Date(), dueDateType: 'PrimeiroDia', descriptionInstallmentNumber: false };

	if (type == 'Despesa') {
		$scope.screenTitle = 'Gerar despesas';
		$scope.generatorParameters.scheduledPayment = false;
	}
	else
	{
		$scope.screenTitle = 'Gerar receitas';
	};

	$scope.loading = false;

	var filter = 'type=' + type + '&enabled=true';
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

  	$scope.openCalendarDialog = function($event) {
    	$scope.opened = true;
  	}

	$scope.submit = function () {
    	if ($scope.generatorForm.$valid) {
			$scope.loading = true;

			Generator.create($scope.generatorParameters)
				.success(function(data) {
					$scope.loading = false;
					$uibModalInstance.close();
				})
				.error(function(data, status, headers, config) {
					Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
					$scope.loading = false;
				});
    	} else {
      		$scope.submitted = true;
    	}
	}

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.formatNumericAmount = function(event) {
		$scope.generatorParameters.amount = Utils.formatPastedNumer(event);
	}
};
