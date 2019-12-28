'use strict';

angular.module('logoffService', [])

	.factory('Logoff', ['$http', function ($http) {
		return {
			get: function (query) {
				return $http.get('/auth/logoff?' + query);
			}
		}
	}]);
