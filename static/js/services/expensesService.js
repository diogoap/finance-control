'use strict';

angular.module('expensesService', [])

	.factory('Expenses', ['$http', function ($http) {
		return {
			getById: function (id) {
				return $http.get('/api/expenses/' + id);
			},
			get: function (filter) {
				return $http.get('/api/expenses?' + filter);
			},
			getBalance: function (filter) {
				return $http.get('/api/totals/balance?' + filter);
			},
			create: function (expenseData) {
				return $http.post('/api/expenses', expenseData);
			},
			delete: function (id) {
				return $http.delete('/api/expenses/' + id);
			},
			patch: function (id, expenseData) {
				return $http.patch('/api/expenses/' + id, expenseData);
			},
			pay: function (id) {
				return $http.patch('/api/expenses/' + id + '?pay=true');
			},
			compare: function compare(a, b) {
				if (a.description < b.description)
					return -1;
				if (a.description > b.description)
					return 1;
				return 0;
			}
		}
	}]);
