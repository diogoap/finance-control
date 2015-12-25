'use strict';

var app = angular.module('financeControl', [
    'ngRoute',
    'ui.bootstrap',
    'ui.grid',
    'ui.grid.pagination',
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',
    'ui.grid.selection',
    'ui.grid.cellNav',
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

app.config(['uibDatepickerConfig', function(uibDatepickerConfig) {
    uibDatepickerConfig.showWeeks = false;
    uibDatepickerConfig.formatYear = 'yy';
}]);

app.config(['uibDatepickerPopupConfig', function(uibDatepickerPopupConfig) {
    uibDatepickerPopupConfig.currentText = "Hoje";
    uibDatepickerPopupConfig.clearText="Limpar";
    uibDatepickerPopupConfig.closeText="Fechar";
    uibDatepickerPopupConfig.datepickerPopup="shortDate";
}]);

app.run(['$rootScope', '$uibModalStack', '$location', function ($rootScope, $uibModalStack, $location) {
    $rootScope.$on('$locationChangeStart', function (event) {
        event.preventDefault();
        var top = $uibModalStack.getTop();
        if (top) {
            $uibModalStack.dismiss(top.key);
        } else {
            //if($rootScope.previousLocation == $location.path()) {
                //event.preventDefault();
                //alert('previousLocation: ' + $rootScope.previousLocation + ' - location.path: ' + $location.path());
                //$rootScope.actualLocation = '/';
                //$rootScope.previousLocation = '/';
                //event.defaultPrevented = false;
                //return $location.path('/');
            //}

            //$rootScope.previousLocation = $rootScope.actualLocation;
            //$rootScope.actualLocation = $location.path();

            event.defaultPrevented = false;
        }
    });
}]);
