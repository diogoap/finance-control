'use strict';

angular.module('incomesService', [])

	.factory('Incomes', ['$http',function($http) {
		return {
			getById: function(id) {
				return $http.get('/api/incomes/' + id);
			},
			get: function(filter) {
				return $http.get('/api/incomes?' + filter);
			},
			getBalance: function(filter) {
				return $http.get('/api/totals/balance?' + filter);
			},
			create: function(incomeData) {
				return $http.post('/api/incomes', incomeData);
			},
			delete: function(id) {
				return $http.delete('/api/incomes/' + id);
			},
			patch: function(id, incomeData) {
				return $http.patch('/api/incomes/' + id, incomeData);
			},
			receive: function(id) {
				return $http.patch('/api/incomes/' + id + '?receive=true');
			},
			compare: function compare(a,b) {
				if (a.description < b.description)
					return -1;
				if (a.description > b.description)
					return 1;
				return 0;
			}
		}
	}]);
