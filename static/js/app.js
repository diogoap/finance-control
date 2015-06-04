'use strict';

var app = angular.module('financeControl', [
    'ngRoute',
    'ui.bootstrap',
    'ui.grid',
    'ui.grid.pagination',
    'purplefox.numeric',
    'categoriesService',
    'accountsService'
]);

app.config(function($routeProvider) {
    $routeProvider
    	.when('/', {
            templateUrl: 'html/home.html',
            controller: 'indexController'
        })
        .when('/categories', {
            templateUrl: 'html/categories.html',
            controller: 'categoriesController'
        })
        .when('/accounts', {
            templateUrl: 'html/accounts.html',
            controller: 'accountsController'
        })
        .otherwise({
        	redirecTo: '/'
        });
});