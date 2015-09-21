'use strict';

angular.module('totalsService', [])

	.factory('Totals', ['$http',function($http) {
		return {
			get : function(filter) {
				return $http.get('/api/totals?' + filter);
			}
		}
	}]);
