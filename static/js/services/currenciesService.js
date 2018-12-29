'use strict';

angular.module('currenciesService', [])

	.factory('Currencies', ['$http',function($http) {
		return {
			getById : function(id) {
				return $http.get('/api/currencies/' + id);
			},
			get : function(filter) {
				return $http.get('/api/currencies?' + filter);
			},
			create : function(currencyData) {
				return $http.post('/api/currencies', currencyData);
			},
			patch : function(_id, currencyData) {
				return $http.patch('/api/currencies/' + _id, currencyData);
			}
		}
	}]);
