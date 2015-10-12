'use strict';

var app = angular.module('financeControl');

app.controller('logoffController', function($scope, $localStorage, $http, $locale, $location, $window, $routeParams, Utils, Logoff) {

    $scope.handleLogoff = function() {
        $localStorage.remove('loggedUserId');
        $localStorage.remove('loggedUserEmail');
        $localStorage.remove('loggedUserToken');
        $localStorage.remove('loggedUserName');
        $localStorage.remove('loggedUserPhoto');

        $scope.loading = false;
        window.location.replace('/login');
    }

    $scope.$on('$routeChangeSuccess', function() {
        $scope.loading = true;

        var query;
        if (($routeParams.all != undefined) && ($routeParams.all == 'true')) {
            query = 'all=true';
        } else {
            query = 'all=false';
        }

        Logoff.get(query)
            .success(function(data) {
                $scope.handleLogoff();
        	})
        	.error(function(data, status, headers, config) {
        		$scope.handleLogoff();
        	});
  	});

    // initialization
    $scope.Utils = Utils;
    $scope.alerts = [];

});
