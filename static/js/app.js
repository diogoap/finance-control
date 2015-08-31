'use strict';

var app = angular.module('financeControl', [
    'ngRoute',
    'ui.bootstrap',
    'ui.grid',
    'ui.grid.pagination',
    'ui.grid.autoResize',
    'purplefox.numeric',
    'utilsService',
    'categoriesService',
    'accountsService',
    'expensesService',
    'incomesService',
    'generatorService',
    'transfersService'
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
        .when('/expenses', {
            templateUrl: 'html/expenses.html',
            controller: 'expensesController'
        })
        .when('/incomes', {
            templateUrl: 'html/incomes.html',
            controller: 'incomesController'
        })
        .when('/transfers', {
            templateUrl: 'html/transfers.html',
            controller: 'transfersController'
        })
        .otherwise({
        	redirecTo: '/'
        });
});
