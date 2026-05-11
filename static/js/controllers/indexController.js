'use strict';

var app = angular.module('financeControl');

app.controller('indexController', function ($scope, $localStorage, $routeParams, $location, $window, Utils) {

	$scope.isLoggedIn = function () {
		return ($localStorage.get('loggedUserToken') != undefined) && ($localStorage.get('loggedUserToken').length > 0);
	}

	function parseHashParams(hash) {
		var params = {};
		if (!hash) return params;
		if (hash.charAt(0) === '#') hash = hash.slice(1);
		hash.split('&').forEach(function (pair) {
			var idx = pair.indexOf('=');
			if (idx === -1) return;
			var key = decodeURIComponent(pair.slice(0, idx));
			var value = decodeURIComponent(pair.slice(idx + 1));
			params[key] = value;
		});
		return params;
	}

	function consumeLoginHash() {
		var rawHash = $window.location.hash || $location.hash();
		var hashParams = parseHashParams(rawHash);

		if (hashParams.id && hashParams.token) {
			$localStorage.set('loggedUserId', hashParams.id);
			$localStorage.set('loggedUserEmail', hashParams.email || '');
			$localStorage.set('loggedUserToken', hashParams.token);
			$localStorage.set('loggedUserName', hashParams.name || '');
			$localStorage.set('loggedUserPhoto', hashParams.photo || '');

			$scope.loggedUserName = hashParams.name || '';
			$scope.loggedUserPhoto = hashParams.photo || '';
			$scope.loggedIn = $scope.isLoggedIn();

			if ($window.history && $window.history.replaceState) {
				$window.history.replaceState(null, '', $window.location.pathname + $window.location.search);
			}
			$location.hash('');
		}
	}

	consumeLoginHash();
	$scope.$on('$routeChangeSuccess', consumeLoginHash);

	$scope.changeRoute = function (newRoute) {
		// If current Route is Home, and NewRoute is not Home, and is not the First Route Change
		// history is kept, otherwise history is not kept (it is replaced)
		if (($location.path() == '/') && (newRoute != '/') && ($scope.isFirstRouteChange)) {
			$location.path(newRoute);
			$scope.isFirstRouteChange = false;
		} else {
			$location.path(newRoute).replace();
		}
	}

	// initialization
	$scope.isFirstRouteChange = true;
	$scope.loggedUserName = $localStorage.get('loggedUserName');
	$scope.loggedUserPhoto = $localStorage.get('loggedUserPhoto');
	$scope.loggedIn = $scope.isLoggedIn();

	$scope.Utils = Utils;
	$scope.alerts = [];
});
