'use strict';

var app = angular.module('financeControl');

app.controller('indexController', function($scope, $localStorage, $http, $locale, $routeParams, $location, Utils) {

	$scope.$on('$routeChangeSuccess', function() {
		var loggedUserEmail = $routeParams.email;
		var loggedUserCode = $routeParams.code;
		var loggedUserName = $routeParams.name;
		var loggedUserPhoto = $routeParams.photo;

		if ((loggedUserEmail != undefined && loggedUserEmail.length > 0) && (loggedUserCode != undefined && loggedUserCode.length > 0)) {
			$location.search('');

			$localStorage.set('loggedUserEmail', loggedUserEmail);
			$localStorage.set('loggedUserCode', loggedUserCode);
			$localStorage.set('loggedUserName', loggedUserName);
			$localStorage.set('loggedUserPhoto', loggedUserPhoto);

			$scope.loggedUserName = loggedUserName;
			$scope.loggedUserPhoto = loggedUserPhoto;
		}
  	});

	// initialization
    $scope.loggedUserName = $localStorage.get('loggedUserName');
    $scope.loggedUserPhoto = $localStorage.get('loggedUserPhoto');

    $scope.Utils = Utils;
    $scope.alerts = [];
});
