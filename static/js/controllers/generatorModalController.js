'use strict';

function generatorModalController($scope, $uibModal, $uibModalInstance, Utils, Generator, Categories, Accounts, Currencies, type) {
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
	else {
		$scope.screenTitle = 'Gerar receitas';
	};

	$scope.loading = false;

	var filter = 'type=' + type + '&enabled=true';
	Categories.get(filter)
		.then(function onSucess(response) {
			$scope.categories = response.data;
			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	var filter = 'enabled=true';
	Accounts.get(filter)
		.then(function onSucess(response) {
			$scope.accounts = response.data;
			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	Currencies.get(filter)
		.then(function onSucess(response) {
			$scope.currencies = response.data;
			$scope.generatorParameters.currency_id = Utils.getDefaultCurrencyId(response.data);;
			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	$scope.openCalendarDialog = function ($event) {
		$scope.opened = true;
	}

	$scope.submit = function () {
		if ($scope.generatorForm.$valid) {
			$scope.loading = true;

			$scope.generatorParameters.initialDate = Utils.getDateDst($scope.generatorParameters.initialDate);

			Generator.create($scope.generatorParameters)
				.then(function onSucess() {
					$scope.loading = false;
					$uibModalInstance.close();
				})
				.catch(function onError(response) {
					Utils.addError($scope, 'Erro ao salvar os dados: ' + response.status);
					$scope.loading = false;
				});
		} else {
			$scope.submitted = true;
		}
	}

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.formatNumericAmount = function (event) {
		$scope.generatorParameters.amount = Utils.formatPastedNumer(event);
	}
};
