function categoriesModalController($scope, $modalInstance, Categories, categoryId, action) {
	$scope.loading = true;	
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
				$scope.loading = false;
			});		
	};

	$scope.submit = function () {
    	if ($scope.categoryForm.$valid) {
			$scope.category._action = $scope.action;
			$modalInstance.close($scope.category);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
};