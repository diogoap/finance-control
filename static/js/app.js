'use strict';

var app = angular.module('financeControl', [
    'ngRoute',
    'ui.bootstrap',
    'ui.grid',
    'ui.grid.pagination',
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',
    'purplefox.numeric',
    'utilsService',
    'categoriesService',
    'accountsService',
    'expensesService',
    'incomesService',
    'generatorService',
    'transfersService',
    'totalsService',
    'localStorageService'
]);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
    	.when('/', {
            templateUrl: 'html/home.html'
        })
        .when('/login', {
            templateUrl: 'html/login.html'
        })
        .when('/categories', {
            templateUrl: 'html/categories.html'
        })
        .when('/accounts', {
            templateUrl: 'html/accounts.html'
        })
        .when('/expenses', {
            templateUrl: 'html/expenses.html'
        })
        .when('/incomes', {
            templateUrl: 'html/incomes.html'
        })
        .when('/transfers', {
            templateUrl: 'html/transfers.html'
        })
        .otherwise({
        	redirecTo: '/'
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
