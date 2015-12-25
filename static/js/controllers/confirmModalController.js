'use strict';

function confirmModalController($uibModalInstance, $scope, data, message) {
	$scope.message = message;

	$scope.yes = function () {
		$uibModalInstance.close(data);
	};

	$scope.no = function() {
		$uibModalInstance.dismiss('cancel');
	}
};
