'use strict';

function confirmModalController($uibModalInstance, $scope, data, message) {
	$scope.message = message;

	$scope.yes = function () {
		$uibModalInstance.close(data);
	};

	$scope.no = function() {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.$on('$locationChangeStart', function(event, next, current){
	    event.preventDefault();
		$scope.no();
	});
};
