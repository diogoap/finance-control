'use strict';

angular.module('utilsService', [])

	.factory('Utils', ['$http',function($http) {
		return {
			addError : function(scope, msg) {
		    	scope.alerts.push({ type: 'danger', msg: msg });
		    },
		    addSucess : function(scope, msg) {
		    	scope.alerts.push({ type: 'success', msg: msg });
		    },
		    closeAlert : function(scope, index) {
		    	scope.alerts.splice(index, 1);
		    },
			alertTimeout : function() {
				return 3000;
			}
		}
	}]);
