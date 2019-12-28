'use strict';

angular.module('accountsService', [])

	.factory('Accounts', ['$http', function ($http) {
		return {
			getById: function (id) {
				return $http.get('/api/accounts/' + id);
			},
			get: function (filter) {
				return $http.get('/api/accounts?' + filter);
			},
			create: function (accountData) {
				return $http.post('/api/accounts', accountData);
			},
			delete: function (id) {
				return $http.delete('/api/accounts/' + id);
			},
			patch: function (_id, accountData) {
				return $http.patch('/api/accounts/' + _id, accountData);
			}
		}
	}]);
