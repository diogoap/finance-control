'use strict';

var app = angular.module('financeControl');

app.controller('expensesController', function($scope, $http, $modal, $locale, Expenses) {

	$scope.loading = true;
	$scope.errorMessage = '';

 	$scope.gridOptions = {
        enableSorting: true,
        paginationPageSizes: [10, 20],
        paginationPageSize: 10,
        columnDefs: [
          	{ name: 'Ações', type: 'string', width:'85', minWidth:'85', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
          		'<a class="btn btn-primary btn-xs" href="" ng-click="grid.appScope.open(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' + '&#32' +
          		'<a class="btn btn-primary btn-xs" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
          	},
        	{ name: 'Vencimento', field: 'dueDate', type: 'date', width:'9%', enableColumnMenu: false,
          		cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
          	},
          	{ name: 'Descrição', field: 'description', type: 'string', width:'22%', enableColumnMenu: false },
          	{ name: 'Valor', field: 'amount', type: 'number',  width: '9%', enableColumnMenu: false,
          		cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align'
          	},
          	{ name: 'Conta', field: '_account.name', type: 'string', width:'15%', enableColumnMenu: false },
        	{ name: 'Categoria', field: '_category.name', type: 'string', width:'15%', enableColumnMenu: false },
        	{ name: 'Situação', field: 'status', type: 'string', width:'9%', enableColumnMenu: false,
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        	},
        	{ name: 'Valor pago', field: 'amountPaid', type: 'number', width:'9%', enableColumnMenu: false,
				cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align'
        	},
        	{ name: 'Ag.', field: 'scheduledPayment', type: 'string', width:'4%', enableColumnMenu: false,
        		cellTemplate: '<input type="checkbox" onclick="return false" ng-model="row.entity.scheduledPayment">',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        	}
        ]
    };

	Expenses.get()
		.success(function(data) {
			$scope.gridOptions.data = data;
			$scope.errorMessage = null;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
			$scope.loading = false;
		});

	// OPEN MODAL ==============================================================
  	$scope.open = function (expenseId, action) {
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

	// DELETE CONFIRMATION =====================================================
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

	// GET =====================================================================
	$scope.getExpenses = function() {
		Expenses.get()
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

	// CREATE ==================================================================
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

	// EDIT ====================================================================
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

	// DELETE ==================================================================
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

});
