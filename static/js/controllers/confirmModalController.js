'use strict';

function confirmModalController($modalInstance, $scope, data, message) {

	$scope.message = message;

	$scope.yes = function () {
		$modalInstance.close(data);
	};

	$scope.no = function() {
		$modalInstance.dismiss('cancel');
	}
};