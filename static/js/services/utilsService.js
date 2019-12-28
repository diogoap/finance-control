'use strict';

function localReplaceAll(str, find, replace) {
	var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	return str.replace(new RegExp(escapedFind, 'g'), replace);
}

function localGetDateDst(date) {
	// Returns only date (Year, Month and Day) from Date value, adjusting time according Daylight Saving Time
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, getDstTimezoneOffset(date));
}

function getDstTimezoneOffset(date) {
	// Offset = Difference in minutes from UTC to currente timezone
	// DST = Daylight Saving Time
	// This function returns the current timezone offset, considering DST
	// Example:
	// For BRT, if DST is on going, function will return 60, if not, result will be 0
	var jan = new Date(date.getFullYear(), 0, 1);
	var jul = new Date(date.getFullYear(), 6, 1);
	var maxOffSet = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
	var timezoneOffSet = date.getTimezoneOffset();

	if (timezoneOffSet > 0) {
		return (maxOffSet - timezoneOffSet);
	} else {
		return Math.abs(timezoneOffSet);
	}
}

//2 columns stack
var _MID_RESOLUTION_START = 768;
//3 columns stack
var _HIGH_RESOLUTION_START = 992;
var _ULTRA_HIGH_RESOLUTION_START = 1200;

angular.module('utilsService', [])

	.factory('Utils', ['$locale', function ($locale) {
		return {
			addError: function (scope, msg) {
				scope.alerts.push({ type: 'danger', msg: msg });
			},
			addSucess: function (scope, msg) {
				scope.alerts.push({ type: 'success', msg: msg });
			},
			closeAlert: function (scope, index) {
				scope.alerts.splice(index, 1);
			},
			alertTimeout: function () {
				return 3000;
			},
			replaceAll(str, find, replace) {
				return localReplaceAll(str, find, replace);
			},
			formatPastedNumer: function (event) {
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
			isMidLowResolution: function () {
				return $(window).width() < _HIGH_RESOLUTION_START;
			},
			isLowResolution: function () {
				return $(window).width() < _MID_RESOLUTION_START;
			},
			isUltraHighResolution: function () {
				return $(window).width() >= _ULTRA_HIGH_RESOLUTION_START;
			},
			getSizeRes: function (sizeLg, sizeMd, sizeSm) {
				if ($(window).width() < _MID_RESOLUTION_START) {
					return sizeSm;
				} else if ($(window).width() < _HIGH_RESOLUTION_START) {
					return sizeMd;
				} else {
					return sizeLg;
				}
			},
			getGridRowHeight: function () {
				if ($(window).width() < _HIGH_RESOLUTION_START) {
					return 33;
				} else {
					return 24;
				}
			},
			getVisibilityRes: function (visibleLg, visibleMd, visibleSm) {
				if ($(window).width() < _MID_RESOLUTION_START) {
					return visibleSm;
				} else if ($(window).width() < _HIGH_RESOLUTION_START) {
					return visibleMd;
				} else {
					return visibleLg;
				}
			},
			getStyleRes: function (styleLg, styleMdSm) {
				if ($(window).width() < _HIGH_RESOLUTION_START) {
					return styleMdSm;
				} else {
					return styleLg;
				}
			},
			getValueStyle: function (val) {
				if (val < 0) {
					return 'val-neg';
				} else if (val == 0) {
					return 'val-zero';
				} else {
					return 'val-pos';
				}
			},
			getColNumberStyle: function (highResCols, lowResCols) {
				if ($(window).width() < _HIGH_RESOLUTION_START) {
					if (lowResCols === 2) {
						return 'col-sm-6';
					} else {
						return 'col-sm-12';
					}
				} else {
					if (highResCols === 4) {
						return 'col-sm-3';
					}
					else if (highResCols === 3) {
						return 'col-sm-4';
					} else {
						return 'col-sm-6';
					}
				}
			},
			clearGridNav: function (gridApi) {
				gridApi.grid.cellNav.clearFocus();
				gridApi.grid.cellNav.lastRowCol = null;
			},
			getDateDst: function (date) {
				return localGetDateDst(date);
			},
			getCellClassesLatePayment: function (cellClass, isOpen, dueDate) {
				var styles = cellClass;
				var today = localGetDateDst(new Date()).toISOString();
				var isLatePayment = (isOpen && (dueDate < today));

				if (isLatePayment) {
					styles = styles + ' red-font-color';
				}
				return styles;
			},
			getPreviousMonth: function (actualDate) {
				var beginDate;
				var endDate;

				if (isNaN(Date.parse(actualDate))) {
					beginDate = new Date();
				}
				else {
					beginDate = actualDate;
				}

				var y = beginDate.getFullYear(), m = beginDate.getMonth();
				beginDate = new Date(y, m - 1, 1);
				endDate = new Date(y, m, 0);

				return { begin: beginDate, end: endDate };
			},
			getActualMonth: function () {
				var beginDate;
				var endDate;

				var date = new Date(), y = date.getFullYear(), m = date.getMonth();
				beginDate = new Date(y, m, 1);
				endDate = new Date(y, m + 1, 0);

				return { begin: beginDate, end: endDate };
			},
			getNextMonth: function (actualDate) {
				var beginDate;
				var endDate;

				if (isNaN(Date.parse(actualDate))) {
					beginDate = new Date();
				}
				else {
					beginDate = actualDate;
				}

				var y = beginDate.getFullYear(), m = beginDate.getMonth();
				beginDate = new Date(y, m + 1, 1);
				endDate = new Date(y, m + 2, 0);

				return { begin: beginDate, end: endDate };
			},
			getBeginOfYear: function (actualDate) {
				var beginDate;
				var endDate;

				if (isNaN(Date.parse(actualDate))) {
					beginDate = new Date();
				}
				else {
					beginDate = actualDate;
				}

				var m = beginDate.getMonth();
				var y = beginDate.getFullYear();

				//If it's the first month of the year, goes to previous year
				if (m == 0) {
					y--;
				}

				beginDate = new Date(y, 0, 1);
				endDate = new Date(y, 1, 0);

				return { begin: beginDate, end: endDate };
			},
			getEndOfYear: function (actualDate) {
				var beginDate;
				var endDate;

				if (isNaN(Date.parse(actualDate))) {
					beginDate = new Date();
				}
				else {
					beginDate = actualDate;
				}

				var m = beginDate.getMonth();
				var y = beginDate.getFullYear();

				//If it's the last month of the year, goes to next year
				if (m == 11) {
					y++;
				}

				beginDate = new Date(y, 11, 1);
				endDate = new Date(y, 12, 0);

				return { begin: beginDate, end: endDate };
			},
			getDefaultCurrencyId: function (currencies) {
				if ((currencies != undefined) && (currencies.length > 0)) {
					for (var i = 0; i < currencies.length; i++) {
						if (currencies[i].default == true) {
							return currencies[i]._id;
						}
					}
				}

				return '';
			}
		}
	}]);
