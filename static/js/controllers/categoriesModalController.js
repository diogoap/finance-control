'use strict';

function categoriesModalController($scope, $uibModalInstance, Utils, Categories, categoryId, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
	$scope.categoryTypes = ['Despesa', 'Receita'];
	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar categoria';
		$scope.category = { enabled: true };
		$scope.loading = false;
	}
	else {
		$scope.screenTitle = 'Editar categoria';

		Categories.getById(categoryId)
			.then(function onSucess(response) {
				$scope.category = response.data;
				$scope.loading = false;
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	$scope.submit = function () {
		if ($scope.categoryForm.$valid) {
			$scope.category._action = $scope.action;
			$uibModalInstance.close($scope.category);
		} else {
			$scope.submitted = true;
		}
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	}
};
