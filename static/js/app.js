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
    'localStorageService',
    'logoffService',
    'loansService'
]);

app.config(function($routeProvider, $locationProvider, $provide) {
    $routeProvider
    	.when('/', {
            templateUrl: 'html/home.html'
        })
        .when('/login', {
            templateUrl: 'html/login.html'
        })
        .when('/logoff', {
            templateUrl: 'html/logoff.html'
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
        .when('/loans', {
            templateUrl: 'html/loans.html'
        })
        .otherwise({
        	redirecTo: '/'
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
