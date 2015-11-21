'use strict';

angular.module('loansService', [])

	.factory('Loans', ['$http',function($http) {
		return {
			getById : function(id) {
				return $http.get('/api/loans/' + id);
			},
			get : function(filter) {
				return $http.get('/api/loans?' + filter);
			},
			create : function(loanData) {
				return $http.post('/api/loans', loanData);
			},
			delete : function(id) {
				return $http.delete('/api/loans/' + id);
			},
			patch : function(_id, loanData) {
				return $http.patch('/api/loans/' + _id, loanData);
			},
			pay : function(id) {
				return $http.patch('/api/loans/' + id + '?pay=true');
			}
		}
	}]);
