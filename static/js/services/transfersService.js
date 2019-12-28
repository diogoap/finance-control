'use strict';

angular.module('transfersService', [])

	.factory('Transfers', ['$http', function ($http) {
		return {
			getById: function (id) {
				return $http.get('/api/transfers/' + id);
			},
			get: function (filter) {
				return $http.get('/api/transfers?' + filter);
			},
			getBalance: function (filter) {
				return $http.get('/api/totals/balance?' + filter);
			},
			create: function (transferData) {
				return $http.post('/api/transfers', transferData);
			},
			delete: function (id) {
				return $http.delete('/api/transfers/' + id);
			},
			patch: function (_id, transferData) {
				return $http.patch('/api/transfers/' + _id, transferData);
			}
		}
	}]);
