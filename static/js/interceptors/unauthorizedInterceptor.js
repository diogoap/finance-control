'use strict';

var app = angular.module('financeControl');

app.config(function ($httpProvider) {
	$httpProvider.interceptors.push(function ($q, $location) {
		return {
			response: function (response) {
				return response;
			},
			responseError: function (response) {
				if (response.status === 401)
					$location.url('/login');
				return $q.reject(response);
			}
		};
	});
});
