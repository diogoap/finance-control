'use strict';

function expensesModalController($scope, $modal, $modalInstance, uiGridConstants, Utils, Expenses, Categories, Accounts, expenseId, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
 	$scope.expenseStatus = ['Em aberto', 'Pago'];
 	$scope.submitted = false;

 	$scope.columns = [
		{ name: 'Ações', type: 'string', width:'110', minWidth:'110', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
			'<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openDetail(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
			'<a class="btn btn-primary btn-xs btn-grid" title="Excluir" href="" ng-click="grid.appScope.deleteDetailConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>' +
			'<a class="btn btn-primary btn-xs btn-grid" title="Clonar" href="" ng-click="grid.appScope.openDetail(row.entity._id, \'clone\')"><i class="fa fa-clone fa-lg fa-fw"></i></a>',
			headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-left-align'
		},
		{
			name: 'Descrição', field: 'description', type: 'string', width:'26%', enableColumnMenu: false,
			aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
		},
		{ name: 'Valor', field: 'amount', type: 'number',  width: '11%', enableColumnMenu: false,
			cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
			aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
		},
		{ name: 'Conta', field: '_account.name', type: 'string', width:'20%', enableColumnMenu: false },
		{ name: 'Categoria', field: '_category.name', type: 'string', width:'20%', enableColumnMenu: false },
		{ name: 'Situação', field: 'status', type: 'string', width:'10%', enableColumnMenu: false,
			headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
		}
	];

	$scope.gridOptions = {
		enableColumnResizing: true,
        enableSorting: true,
		showColumnFooter: true,
		rowHeight: 23,
		columnDefs: $scope.columns,
        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
        }
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
		if (action == 'clone') {
			$scope.screenTitle = 'Clonar despesa';
		} else {
			$scope.screenTitle = 'Editar despesa';
		}

		Expenses.getById(expenseId)
			.success(function(data) {
				$scope.expense = data;

				//Need to generate a new to date in order to make date picker work
				$scope.expense.dueDate = new Date($scope.expense.dueDate);
				$scope._hasDetail = $scope.expense.detail.length > 0;
				$scope.gridOptions.data = data.detail;

				if (action == 'clone') {
					$scope.expense._id = null;
					$scope.expense.description += ' - Cópia';
				}

				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	var filter = 'type=Despesa';
	Categories.get(filter)
		.success(function(data) {
			$scope.categories = data;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

	Accounts.get()
		.success(function(data) {
			$scope.accounts = data;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

  	$scope.openCalendarDialog = function($event) {
		$event.preventDefault();
    	$event.stopPropagation();
    	$scope.opened = true;
  	};

	$scope.submit = function () {
    	if ($scope.expenseForm.$valid) {
			$scope.updateExpenseTotal();
			$scope.expense._action = $scope.action;
			$modalInstance.close($scope.expense);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}

	$scope.validExpenseAmountPaid = function(value) {
	  	if (($scope.expense != undefined) && ($scope.expense.status == 'Pago') && (value <= 0)) {
	  		return false;
	  	}

		return true;
	}

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
			} else {
				$scope.expense.status = 'Em aberto';
			}
		}
	}

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
	    	if ((expenseDetail._action == 'new') || (expenseDetail._action == 'clone')) {
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
