'use strict';

var app = angular.module('financeControl');

app.controller('loginController', function($scope, $localStorage, $http, $locale, Utils) {

	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
});
