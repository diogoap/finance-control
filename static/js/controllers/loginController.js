'use strict';

var app = angular.module('financeControl');

app.controller('loginController', function($scope, $rootScope, $localStorage, $http, $locale, $routeParams, $location, Utils) {

    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        var errorMessage = $routeParams.error;

		if ((errorMessage != undefined && errorMessage.length > 0)) {
			$location.search('');
            $rootScope.errorMessage = errorMessage;
		}
    });

    // initialization
    $scope.Utils = Utils;
    $scope.alerts = [];

    if (($scope.errorMessage != undefined) && ($scope.errorMessage.length > 0)) {
        Utils.addError($scope, $scope.errorMessage);
    }

});
