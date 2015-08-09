'use strict';

var app = angular.module('financeControl');

app.controller('expensesController', function($scope, $http, $modal, $locale, uiGridConstants, Expenses) {

 	$scope.gridOptions = {
        enableSorting: true,
		showColumnFooter: true,
        rowHeight: 23,
        columnDefs: [
          	{ name: 'Ações', type: 'string', width:'85', minWidth:'85', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
          		'<a class="btn btn-primary btn-xs" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' + '&#32' +
          		'<a class="btn btn-primary btn-xs" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
          	},
        	{ name: 'Vencimento', field: 'dueDate', type: 'date', width:'9%', enableColumnMenu: false,
          		cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
          	},
          	{
				name: 'Descrição', field: 'description', type: 'string', width:'22%', enableColumnMenu: false,
				aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
				footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
			},
          	{ name: 'Valor', field: 'amount', type: 'number',  width: '9%', enableColumnMenu: false,
          		cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
				aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
				footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
          	},
          	{ name: 'Conta', field: '_accountNames', type: 'string', width:'15%', enableColumnMenu: false },
        	{ name: 'Categoria', field: '_categoryNames', type: 'string', width:'15%', enableColumnMenu: false },
        	{ name: 'Situação', field: 'status', type: 'string', width:'9%', enableColumnMenu: false,
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        	},
        	{ name: 'Valor pago', field: 'amountPaid', type: 'number', width:'9%', enableColumnMenu: false,
				cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
				aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
				footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
        	},
        	{ name: 'Ag.', field: 'scheduledPayment', type: 'string', width:'4%', enableColumnMenu: false,
        		cellTemplate: '<input type="checkbox" onclick="return false" ng-model="row.entity.scheduledPayment">',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        	}
        ]
    };

  	$scope.openCalendarDialogBegin = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.beginOpened = true;
  	};

  	$scope.openCalendarDialogEnd = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.endOpened = true;
  	};

  	$scope.navigatePreviousMonth = function($event) {
		var date;

		if (isNaN(Date.parse($scope.expenseDueDateBegin))) {
			date = new Date();
		}
		else {
			date = $scope.expenseDueDateBegin;
		}

		var y = date.getFullYear(), m = date.getMonth();
		$scope.expenseDueDateBegin = new Date(y, m - 1, 1);
		$scope.expenseDueDateEnd = new Date(y, m, 0);

		$scope.getExpenses();
  	};

  	$scope.navigateActualMonth = function($event) {
		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		$scope.expenseDueDateBegin = new Date(y, m, 1);
		$scope.expenseDueDateEnd = new Date(y, m + 1, 0);

		$scope.getExpenses();
  	};

  	$scope.navigateNextMonth = function($event) {
		var date;

		if (isNaN(Date.parse($scope.expenseDueDateBegin))) {
			date = new Date();
		}
		else {
			date = $scope.expenseDueDateBegin;
		}

		var y = date.getFullYear(), m = date.getMonth();
		$scope.expenseDueDateBegin = new Date(y, m + 1, 1);
		$scope.expenseDueDateEnd = new Date(y, m + 2, 0);

		$scope.getExpenses();
  	};

	$scope.filter = function($event) {
		if ((isNaN(Date.parse($scope.expenseDueDateBegin)) == false) && (isNaN(Date.parse($scope.expenseDueDateEnd))) == false) {
			$scope.getExpenses();
		}
  	};

  	$scope.openModal = function (expenseId, action) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/expensesModal.html',
      		controller: expensesModalController,
      		size: 'lg',
      		resolve: {
		        expenseId: function () {
					return expenseId;
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (expense) {
	    	if (expense._action == 'new') {
	    		$scope.createExpense(expense);
	    	} else if (expense._action == 'edit') {
	    		$scope.editExpense(expense);
	    	}
		});
    };

    $scope.deleteConfirmation = function (ExpenseId) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return ExpenseId;
        		},
		        message: function () {
					return 'Confirma a exclusão da despesa?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.deleteExpense(id);
		});
    };

	$scope.getDueDateFilter = function() {
		var dateBegin, dateEnd, y, m, d;

		dateBegin = $scope.expenseDueDateBegin;
		y = dateBegin.getFullYear(), m = dateBegin.getMonth(), d = dateBegin.getDate();
		dateBegin = new Date(y, m, d);

		dateEnd = $scope.expenseDueDateEnd;
		y = dateEnd.getFullYear(), m = dateEnd.getMonth(), d = dateEnd.getDate();
		dateEnd = new Date(y, m, d, 23, 59, 59, 999);

		return 'dueDateBegin=' + dateBegin + '&dueDateEnd=' + dateEnd;
	}

	$scope.getExpenses = function() {
		$scope.loading = true;

		var filter = $scope.getDueDateFilter();

		Expenses.get(filter)
			.success(function(data) {
				$scope.gridOptions.data = data;
				$scope.errorMessage = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
				$scope.loading = false;
			});
	};

	$scope.createExpense = function(expense) {
		$scope.loading = true;

		Expenses.create(expense)
			.success(function(data) {
				$scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};

	$scope.editExpense = function(expense) {
		$scope.loading = true;

		Expenses.patch(expense._id, expense)
			.success(function(data) {
				$scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};

	$scope.deleteExpense = function(id) {
		$scope.loading = true;

		Expenses.delete(id)
			.success(function(data) {
				$scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};

	// initialization
	$scope.errorMessage = '';
	$scope.navigateActualMonth();
});
