'use strict';

var app = angular.module('financeControl');

app.controller('logoffController', function ($scope, $localStorage, $routeParams, Utils, Logoff) {

    $scope.handleLogoff = function () {
        $localStorage.remove('loggedUserId');
        $localStorage.remove('loggedUserEmail');
        $localStorage.remove('loggedUserToken');
        $localStorage.remove('loggedUserName');
        $localStorage.remove('loggedUserPhoto');

        $scope.loading = false;
        window.location.replace('/login');
    }

    $scope.$on('$routeChangeSuccess', function () {
        $scope.loading = true;

        var query;
        if (($routeParams.all != undefined) && ($routeParams.all == 'true')) {
            query = 'all=true';
        } else {
            query = 'all=false';
        }

        Logoff.get(query)
            .then(function onSucess() {
                $scope.handleLogoff();
            })
            .catch(function onError() {
                $scope.handleLogoff();
            });
    });

    // initialization
    $scope.Utils = Utils;
    $scope.alerts = [];

});
