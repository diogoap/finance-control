'use strict';

function generatorModalController($scope, $modal, $modalInstance, Utils, Generator, Categories, Accounts, type) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
 	$scope.submitted = false;
 	$scope.generatorDueDateTypes = ['PrimeiroDia', 'UltimoDia', 'DiaEspecifico'];
 	$scope.generatorDueDateTypesNames = ['Primeiro dia', 'Último dia', 'Dia específico'];

	$scope.generatorParameters = { type: type, initialDate: new Date(), installments: 0, dueDateType: 'PrimeiroDia', dueDateTypeDay: 0, amount: 0, descriptionInstallmentNumber: false };

	if (type == 'Despesa') {
		$scope.screenTitle = 'Gerar despesas';
		$scope.generatorParameters.scheduledPayment = false;
	}
	else
	{
		$scope.screenTitle = 'Gerar receitas';
	};

	$scope.loading = false;

	var filter = 'type=' + type;
	Categories.get(filter)
		.success(function(data) {
			$scope.categories = data;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

	Accounts.get()
		.success(function(data) {
			$scope.accounts = data;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

  	$scope.openCalendarDialog = function($event) {
		$event.preventDefault();
    	$event.stopPropagation();
    	$scope.opened = true;
  	};

	$scope.submit = function () {
    	if ($scope.generatorForm.$valid) {
			$scope.loading = true;

			Generator.create($scope.generatorParameters)
				.success(function(data) {
					$scope.loading = false;
					$modalInstance.close();
				})
				.error(function(data, status, headers, config) {
					Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
					$scope.loading = false;
				});
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

};
