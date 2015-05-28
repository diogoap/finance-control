function categoriesModalController($scope, Categories, categoryId, action) {
	$scope.loading = true;
	$scope.errorMessage = '';
	$scope.action = action;
 	$scope.categoryTypes = ['Despesa', 'Receita'];
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar categoria';
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar categoria';

		Categories.getById(categoryId)
			.success(function(data) {
				$scope.category = data;
				$scope.errorMessage = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
				$scope.loading = false;
			});
	};

	$scope.submit = function () {
    	if ($scope.categoryForm.$valid) {
			$scope.category._action = $scope.action;
			$scope.closeThisDialog($scope.category);
    	} else {
      		$scope.submitted = true;
    	}
	};
};