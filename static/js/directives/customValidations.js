'use strict';

var app = angular.module('financeControl');

app.directive("gteThan", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.gteThan = function(modelValue) {
                return modelValue >= attributes.gteThan;
            }
        }
    };
});

app.directive("gtThan", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.gtThan = function(modelValue) {
                return modelValue > attributes.gtThan;
            }
        }
    };
});

app.directive("gtThanZeroOpt", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.gtThanZeroOpt = function(modelValue) {
				return ((modelValue > 0) && (attributes.gtThanZeroOpt)) || (attributes.gtThanZeroOpt == "false");
            }
        }
    };
});

app.directive('notEquals', [function() {
    var link = function(scope, element, attributes, ngModel) {
        var validate = function(modelValue) {
            var comparisonModel = attributes.notEquals;

            if(!modelValue || !comparisonModel){
                ngModel.$setValidity('notEquals', true);
            }

            ngModel.$setValidity('notEquals', modelValue != comparisonModel);
            return modelValue;
        };

        ngModel.$parsers.unshift(validate);
        ngModel.$formatters.push(validate);

        attributes.$observe('notEquals', function(comparisonModel){
            return validate(ngModel.$modelValue);
        });
    };

    return {
        require: 'ngModel',
        link: link
    };
}]);
