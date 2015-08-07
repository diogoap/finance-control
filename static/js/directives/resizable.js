'use strict';

var app = angular.module('financeControl');

app.directive('resizableGrid', function($window) {
	return function($scope) {

		// On window resize => resize the app
		$scope.initializeWindowSize = function() {
			var obj = document.getElementById('grid');
			var rect = obj.getBoundingClientRect();
			$scope.windowHeight = $window.innerHeight - (rect.top + 25) + 'px';
			$scope.windowWidth = $window.innerWidth - (rect.left + 35) + 'px';
		};

		angular.element($window).bind('resize', function() {
			$scope.initializeWindowSize();
			$scope.$apply();
		});

		// Initiate the resize function default values
		$scope.initializeWindowSize();
	};
});
