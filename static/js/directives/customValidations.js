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
