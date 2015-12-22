'use strict';

function localReplaceAll(str, find, replace) {
	var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  	return str.replace(new RegExp(escapedFind, 'g'), replace);
}

angular.module('utilsService', [])

	.factory('Utils', ['$locale', function($locale) {
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
			},
			replaceAll(str, find, replace) {
  				return localReplaceAll(str, find, replace);
			},
			formatPastedNumer: function(event) {
				if ((event != undefined) && (event.clipboardData != undefined)) {
					var value = event.clipboardData.getData('text/plain');

					//Removes thousand separator
					value = localReplaceAll(value, $locale.NUMBER_FORMATS.GROUP_SEP, '');
					//Converts decimal separator into dots
					value = localReplaceAll(value, $locale.NUMBER_FORMATS.DECIMAL_SEP, '.');

					event.returnValue = false;

					if (isNaN(value) == false) {
						return parseFloat(value);
					}
				}

				return null;
			},
			isLowResolution: function() {
				return $(window).width() < 800;
			},
			getSizeRes: function(sizeLg, sizeMd, sizeSm) {
				if ($(window).width() < 600) {
					return sizeSm;
				} else if ($(window).width() < 800) {
					return sizeMd;
				} else {
					return sizeLg;
				}
			},
			getGridRowHeight: function() {
				if ($(window).width() < 800) {
					return 32;
				} else {
					return 23;
				}
			},
			getVisibilityRes: function(visibleLg, visibleMd, visibleSm) {
				if ($(window).width() < 600) {
					return visibleSm;
				} else if ($(window).width() < 800) {
					return visibleMd;
				} else {
					return visibleLg;
				}
			},
			getStyleRes: function(styleLg, styleMdSm) {
				if ($(window).width() < 800) {
					return styleMdSm;
				} else {
					return styleLg;
				}
			}
		}
	}]);
