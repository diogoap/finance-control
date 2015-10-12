'use strict';

angular.module('logoffService', [])

	.factory('Logoff', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/auth/logoff/');
			}
		}
	}]);
