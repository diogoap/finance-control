'use strict';

angular.module('categoriesService', [])

	.factory('Categories', ['$http', function($http) {
		return {
			getById : function(id) {
				return $http.get('/api/categories/' + id);
			},
			get : function(filter) {
				return $http.get('/api/categories?' + filter);
			},
			create : function(categoryData) {
				return $http.post('/api/categories', categoryData);
			},
			delete : function(id) {
				return $http.delete('/api/categories/' + id);
			},
			patch : function(_id, categoryData) {
				return $http.patch('/api/categories/' + _id, categoryData);
			}
		}
	}]);
