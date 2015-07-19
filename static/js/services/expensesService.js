'use strict';

angular.module('expensesService', [])

	.factory('Expenses', ['$http',function($http) {
		return {
			getById : function(id) {
				return $http.get('/api/expenses/' + id);
			},
			get : function(filter) {
				return $http.get('/api/expenses?' + filter);
			},
			create : function(expenseData) {
				return $http.post('/api/expenses', expenseData);
			},
			delete : function(id) {
				return $http.delete('/api/expenses/' + id);
			},
			patch : function(_id, expenseData) {
				return $http.patch('/api/expenses/' + _id, expenseData);
			}
		}
	}]);
