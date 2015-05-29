'use strict';

var app = angular.module('financeControl', ['ngRoute', 'ui.bootstrap', 'ui.grid', 'ui.grid.pagination', 'categoriesService']);

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
        .when('/account', {
            templateUrl: 'html/accounts.html',
            controller: 'accountController'
        })
        .otherwise({
        	redirecTo: '/'
        });
});