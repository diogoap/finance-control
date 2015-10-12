'use strict';

var app = angular.module('financeControl');

app.controller('indexController', function($scope, $localStorage, $http, $locale, $routeParams, $location, Utils) {

	$scope.isLoggedIn = function() {
		return ($localStorage.get('loggedUserToken') != undefined) && ($localStorage.get('loggedUserToken').length > 0);
	}

	$scope.$on('$routeChangeSuccess', function() {

		var loggedUserId = $routeParams.id;
		var loggedUserEmail = $routeParams.email;
		var loggedUserToken = $routeParams.token;
		var loggedUserName = $routeParams.name;
		var loggedUserPhoto = $routeParams.photo;

		if ((loggedUserId != undefined && loggedUserId.length > 0) && (loggedUserToken != undefined && loggedUserToken.length > 0)) {
			$location.search('');

			$localStorage.set('loggedUserId', loggedUserId);
			$localStorage.set('loggedUserEmail', loggedUserEmail);
			$localStorage.set('loggedUserToken', loggedUserToken);
			$localStorage.set('loggedUserName', loggedUserName);
			$localStorage.set('loggedUserPhoto', loggedUserPhoto);

			$scope.loggedUserName = loggedUserName;
			$scope.loggedUserPhoto = loggedUserPhoto;
			$scope.loggedIn = $scope.isLoggedIn();
		}
  	});

	// initialization
    $scope.loggedUserName = $localStorage.get('loggedUserName');
    $scope.loggedUserPhoto = $localStorage.get('loggedUserPhoto');
	$scope.loggedIn = $scope.isLoggedIn();

    $scope.Utils = Utils;
    $scope.alerts = [];
});
