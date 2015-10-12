'use strict';

var app = angular.module('financeControl');

app.controller('logoffController', function($scope, $localStorage, $http, $locale, $location, $window, Utils, Logoff) {

    $scope.handleLogoff = function() {
        $localStorage.remove('loggedUserId');
        $localStorage.remove('loggedUserEmail');
        $localStorage.remove('loggedUserToken');
        $localStorage.remove('loggedUserName');
        $localStorage.remove('loggedUserPhoto');

        $scope.loading = false;
        window.location.replace('/login');
    }

    $scope.loading = true;
	Logoff.get()
        .success(function(data) {
            $scope.handleLogoff();
		})
		.error(function(data, status, headers, config) {
			$scope.handleLogoff();
		});

    // initialization
    $scope.Utils = Utils;
    $scope.alerts = [];

});
