'use strict';

var app = angular.module('financeControl');

app.controller('homeController', function ($scope, $http, $locale, Utils, Totals) {

    $scope.openCalendarDialogBegin = function ($event) {
        $scope.beginOpened = true;
    };

    $scope.openCalendarDialogEnd = function ($event) {
        $scope.endOpened = true;
    };

    $scope.navigateBeginOfYear = function () {
        var dates = Utils.getBeginOfYear($scope.dateBegin);
        $scope.dateBegin = dates.begin;
        $scope.dateEnd = dates.end;

        $scope.getTotals();
    };

    $scope.navigatePreviousMonth = function () {
        var dates = Utils.getPreviousMonth($scope.dateBegin);
        $scope.dateBegin = dates.begin;
        $scope.dateEnd = dates.end;

        $scope.getTotals();
    };

    $scope.navigateActualMonth = function () {
        var dates = Utils.getActualMonth();
        $scope.dateBegin = dates.begin;
        $scope.dateEnd = dates.end;

        $scope.getTotals();
    };

    $scope.navigateNextMonth = function () {
        var dates = Utils.getNextMonth($scope.dateBegin);
        $scope.dateBegin = dates.begin;
        $scope.dateEnd = dates.end;

        $scope.getTotals();
    };

    $scope.navigateEndOfYear = function () {
        var dates = Utils.getEndOfYear($scope.dateBegin);
        $scope.dateBegin = dates.begin;
        $scope.dateEnd = dates.end;

        $scope.getTotals();
    };

    $scope.filter = function ($event) {
        if ((isNaN(Date.parse($scope.dateBegin)) == false) && (isNaN(Date.parse($scope.dateEnd))) == false) {
            $scope.getTotals();
        }
    }

    $scope.getDateFilter = function () {
        var dateBegin, dateEnd, y, m, d;

        dateBegin = $scope.dateBegin;
        y = dateBegin.getFullYear(), m = dateBegin.getMonth(), d = dateBegin.getDate();
        dateBegin = new Date(y, m, d);

        dateEnd = $scope.dateEnd;
        y = dateEnd.getFullYear(), m = dateEnd.getMonth(), d = dateEnd.getDate();
        dateEnd = new Date(y, m, d, 23, 59, 59, 999);

        return 'dateBegin=' + dateBegin + '&dateEnd=' + dateEnd;
    }

    $scope.getTotals = function () {
        $scope.loading = true;

        var filter = $scope.getDateFilter();

        Totals.get(filter)
            .then(function onSucess(response) {
                $scope.totals = response.data;
                $scope.loading = false;
            })
            .catch(function onError(response) {
                Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
                $scope.loading = false;
            });
    }

    $scope.configAccordions = function () {
        var isLowRes = Utils.isMidLowResolution();

        $scope.accordions = {
            isDisabled: isLowRes == false,
            isOpenCompAcc: isLowRes == false,
            isOpenCompInc: isLowRes == false,
            isOpenCompExp: isLowRes == false,
            isOpenAllAcc: isLowRes == false,
            isOpenAllInc: isLowRes == false,
            isOpenAllExp: isLowRes == false
        };
    }

    $(window).resize(function () {
        $scope.$apply(function () {
            $scope.configBoxStyle();
            $scope.configAccordions();
        });
    })

    angular.element(document).ready(function () {
        $scope.configBoxStyle();
    });

    $scope.getAcordionStyle = function (isOpen) {
        if (Utils.isMidLowResolution()) {
            return isOpen ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right';
        }

        return null;
    };

    $scope.configBoxStyle = function () {
        if (Utils.isMidLowResolution()) {
            $scope.boxStyle = {};
        } else {
            var obj = document.getElementById('boxes');

            if (obj != null) {
                var rect = obj.getBoundingClientRect();
                var wh = $(window).height();
                var boxHeight = ((wh - (rect.top + 2)) / 2) + 'px';
                $scope.boxStyle = { height: boxHeight };
            }
        }
    };

    // initialization
    $scope.Utils = Utils;
    $scope.totals = {};
    $scope.alerts = [];
    $scope.boxStyle = {};
    $scope.navigateActualMonth();
    $scope.configBoxStyle();
    $scope.configAccordions();
});
