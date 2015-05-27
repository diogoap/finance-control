function confirmDialogController($scope, $modalInstance, message) {
	$scope.message = message;
	$scope.screenTitle = 'Editar categoria';

	$scope.yes = function () {
		$modalInstance.close('yes');
	};

	$scope.no = function () {
		$modalInstance.dismiss('cancel');
	};
};