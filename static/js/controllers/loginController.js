'use strict';

var app = angular.module('financeControl');

app.controller('loginController', function($scope, $rootScope, $localStorage, $http, $locale, $routeParams, $location, Utils) {

    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        var loginErrorMessage = $routeParams.error;

		if ((loginErrorMessage != undefined && loginErrorMessage.length > 0)) {
			$location.search('').replace();
            $rootScope.loginErrorMessage = loginErrorMessage;
		}
    });

    // initialization
    $scope.Utils = Utils;
    $scope.alerts = [];

    if (($rootScope.loginErrorMessage != undefined) && ($rootScope.loginErrorMessage.length > 0)) {
        Utils.addError($scope, $rootScope.loginErrorMessage);
        $rootScope.loginErrorMessage = null;
    }

});
