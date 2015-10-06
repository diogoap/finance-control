'use strict';

var app = angular.module('financeControl');

app.config(function($httpProvider) {
	$httpProvider.interceptors.push(function($q, $location, $localStorage) {
		return {
	    	request: function (config) {
	        	config.headers['Authorization'] = 'Bearer ' + $localStorage.get('loggedUserCode');
	        	return config;
	      	}
	    };
    });
});
