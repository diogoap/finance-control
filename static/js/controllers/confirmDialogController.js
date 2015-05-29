'use strict';

function confirmDialogController($modalInstance, $scope, categoryId, message) {

	$scope.message = message;

	$scope.yes = function () {
		$modalInstance.close(categoryId);
	};

	$scope.no = function() {
		$modalInstance.dismiss('cancel');
	}
};