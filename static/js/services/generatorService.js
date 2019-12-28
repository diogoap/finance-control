'use strict';

angular.module('generatorService', [])

	.factory('Generator', ['$http', function ($http) {
		return {
			create: function (generatorParameters) {
				return $http.post('/api/generator', generatorParameters);
			}
		}
	}]);
