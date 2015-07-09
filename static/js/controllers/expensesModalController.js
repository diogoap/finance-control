'use strict';

function expensesModalController($scope, $modal, $modalInstance, Expenses, Categories, Accounts, expenseId, action) {
	$scope.loading = true;
	$scope.errorMessage = '';
	$scope.action = action;
 	$scope.expenseStatus = ['Em aberto', 'Pago', 'Cancelado'];
 	$scope.submitted = false;

	$scope.gridOptions = {
        enableSorting: true,
        paginationPageSizes: [10, 20],
        paginationPageSize: 10,
        columnDefs: [
          	{ name: 'Ações', type: 'string', width:'85', minWidth:'85', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
          		'<a class="btn btn-primary btn-xs" href="" ng-click="grid.appScope.openDetail(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' + '&#32' +
          		'<a class="btn btn-primary btn-xs" href="" ng-click="grid.appScope.deleteDetailConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>',
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
        	}
        ]
    };

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar despesa';
		$scope.expense = { dueDate: new Date(), status: 'Em aberto', amountPaid: 0, detail: new Array() };
		$scope.gridOptions.data = $scope.expense.detail;
		$scope._hasDetail = false;
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar despesa';

		Expenses.getById(expenseId)
			.success(function(data) {
				$scope.expense = data;
				$scope._hasDetail = $scope.expense.detail.length > 0;
				$scope.gridOptions.data = data.detail;
				$scope.errorMessage = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
				$scope.loading = false;
			});
	};

	Categories.get()
		.success(function(data) {
			$scope.categories = data;
			$scope.errorMessage = null;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
			$scope.loading = false;
		});

	Accounts.get()
		.success(function(data) {
			$scope.accounts = data;
			$scope.errorMessage = null;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
			$scope.loading = false;
		});

	// OPEN CALANDAR ==============================================================
  	$scope.openCalendarDialog = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.opened = true;
  	};

	// MODAL SUBMIT ===============================================================
	$scope.submit = function () {
    	if ($scope.expenseForm.$valid) {
			$scope.updateExpenseTotal();
			$scope.expense._action = $scope.action;
			$modalInstance.close($scope.expense);
    	} else {
      		$scope.submitted = true;
    	}
	};

	// MODAL CANCEL ===============================================================
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}

	// VALIDATE EXPENSE AMOUNT PAID ===============================================
	$scope.validExpenseAmountPaid = function(value) {
	  	if (($scope.expense != undefined) && ($scope.expense.status == 'Pago') && (value <= 0)) {
	  		return false;
	  	}

		return true;
	}

	// TOTAL CALCULATION ==========================================================
	$scope.updateExpenseTotal = function() {
		$scope._hasDetail = false;

		if (($scope.expense.detail != undefined) && ($scope.expense.detail.length > 0)) {
			$scope._hasDetail = true;

			$scope.expense.account_id = '';
			$scope.expense._account = null;

			$scope.expense.category_id = '';
			$scope.expense._category = null;

			$scope.expense.amount = 0;
			$scope.expense.amountPaid = 0;

			$scope.expense.detail.forEach(function (det) {
				$scope.expense.amount += det.amount;

				if (det.status == 'Pago') {
					$scope.expense.amountPaid += det.amount;
				}
			});

			if ($scope.expense.amount == $scope.expense.amountPaid) {
				$scope.expense.status = 'Pago';
			}
		}
	}

	// OPEN ITEM MODAL ============================================================
  	$scope.openDetail = function (expenseDetailId, action) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/expensesDetailModal.html',
      		controller: expensesDetailModalController,
      		resolve: {
		        expenseDetail: function () {
					// Get object for selected detail
					var selDetail = $.grep($scope.expense.detail, function(e){ return e._id == expenseDetailId });
					return selDetail[0];
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (expenseDetail) {
	    	if (expenseDetail._action == 'new') {
	    		$scope.expense.detail.push(expenseDetail);
	    	} else if (expenseDetail._action == 'edit') {
				// Replace exising detail object with the new one
				for (var i in $scope.expense.detail) {
			        if ($scope.expense.detail[i]._id == expenseDetail._id) {
			            $scope.expense.detail[i] = expenseDetail;
			            break;
			        }
			    }
	    	}

			$scope.updateExpenseTotal();
		});
    };

	// DELETE CONFIRMATION ========================================================
    $scope.deleteDetailConfirmation = function (expenseDetailId) {

    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
			size: 'sm',
      		resolve: {
		        data: function () {
					return expenseDetailId;
        		},
		        message: function () {
					return 'Confirma a exclusão do detalhe?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
			// Replace exising detail object with the new one
			for (var i in $scope.expense.detail) {
				if ($scope.expense.detail[i]._id == id) {
					$scope.expense.detail.splice(i, 1);
					break;
				}
			}

			$scope.updateExpenseTotal();
		});
    };

};
