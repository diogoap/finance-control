'use strict';

var app = angular.module('financeControl');

app.directive("gteThan", function () {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.gteThan = function (modelValue) {
                return modelValue >= attributes.gteThan;
            }
        }
    };
});

app.directive("gtThan", function () {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.gtThan = function (modelValue) {
                return modelValue > attributes.gtThan;
            }
        }
    };
});

app.directive("gtThanZeroOpt", function () {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.gtThanZeroOpt = function (modelValue) {
                return ((modelValue > 0) && (attributes.gtThanZeroOpt)) || (attributes.gtThanZeroOpt == "false");
            }
        }
    };
});

app.directive('notEquals', [function () {
    var link = function (scope, element, attributes, ngModel) {
        var validate = function (modelValue) {
            var comparisonModel = attributes.notEquals;

            if (!modelValue || !comparisonModel) {
                ngModel.$setValidity('notEquals', true);
            }

            ngModel.$setValidity('notEquals', modelValue != comparisonModel);
            return modelValue;
        };

        ngModel.$parsers.unshift(validate);
        ngModel.$formatters.push(validate);

        attributes.$observe('notEquals', function (comparisonModel) {
            return validate(ngModel.$modelValue);
        });
    };

    return {
        require: 'ngModel',
        link: link
    };
}]);

app.directive('gteThanDateControl', [function () {
    var link = function (scope, element, attributes, ngModel) {
        var validate = function (modelValue) {
            var comparisonModel = attributes.gteThanDateControl;

            if (!modelValue || !comparisonModel) {
                ngModel.$setValidity('gteThanDateControl', true);
            }

            var modelDate = new Date(modelValue), y = modelDate.getFullYear(), m = modelDate.getMonth(), d = modelDate.getDate();

            var compModel = comparisonModel.replace(/"/g, "");
            var compModelDate = new Date(compModel), y = compModelDate.getFullYear(), m = compModelDate.getMonth(), d = compModelDate.getDate();

            ngModel.$setValidity('gteThanDateControl', modelDate >= compModelDate);
            return modelValue;
        };

        ngModel.$parsers.unshift(validate);
        ngModel.$formatters.push(validate);

        attributes.$observe('gteThanDateControl', function (comparisonModel) {
            return validate(ngModel.$modelValue);
        });
    };

    return {
        require: 'ngModel',
        link: link
    };
}]);

app.directive('lteThanDateControl', [function () {
    var link = function (scope, element, attributes, ngModel) {
        var validate = function (modelValue) {
            var comparisonModel = attributes.gteThanDateControl;

            if (!modelValue || !comparisonModel) {
                ngModel.$setValidity('gteThanDateControl', true);
            }

            var modelDate = new Date(modelValue), y = modelDate.getFullYear(), m = modelDate.getMonth(), d = modelDate.getDate();

            var compModel = comparisonModel.replace(/"/g, "");
            var compModelDate = new Date(compModel), y = compModelDate.getFullYear(), m = compModelDate.getMonth(), d = compModelDate.getDate();

            ngModel.$setValidity('gteThanDateControl', modelDate <= compModelDate);
            return modelValue;
        };

        ngModel.$parsers.unshift(validate);
        ngModel.$formatters.push(validate);

        attributes.$observe('gteThanDateControl', function (comparisonModel) {
            return validate(ngModel.$modelValue);
        });
    };

    return {
        require: 'ngModel',
        link: link
    };
}]);
