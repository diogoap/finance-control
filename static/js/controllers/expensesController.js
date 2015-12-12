'use strict';

var app = angular.module('financeControl');

app.controller('expensesController', function($scope, $http, $uibModal, $locale, uiGridConstants, Utils, Expenses) {

    var rowTemplate = '<div ng-class="{\'red-font-color\':row.entity.isLatePayment == true }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

 	$scope.columns = [
        { name: 'Ações', type: 'string', width:'146', minWidth:'146', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
            '<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Excluir" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Clonar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'clone\')"><i class="fa fa-clone fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Pagar" ng-show="row.entity.status == \'Em aberto\'" href="" ng-click="grid.appScope.payExpenseConfirmation(row.entity._id)"><i class="fa fa-usd fa-lg fa-fw"></i></a>',
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-left-align'
        },
        { name: 'Vencimento', field: 'dueDate', type: 'date', width:'8%', enableColumnMenu: false,
            cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        },
        {
            name: 'Descrição', field: 'description', type: 'string', width:'22%', enableColumnMenu: false,
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
        },
        { name: 'Valor', field: 'amount', type: 'number',  width: '8%', enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
            aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
        },
        { name: 'Conta', field: '_accountNames', type: 'string', width:'13%', enableColumnMenu: false },
        { name: 'Categoria', field: '_categoryNames', type: 'string', width:'13%', enableColumnMenu: false },
        { name: 'Situação', field: 'status', type: 'string', width:'9%', enableColumnMenu: false,
            headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        },
        { name: 'Valor pago', field: 'amountPaid', type: 'number', width:'8%', enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
            aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
        },
        { name: 'Ag.', field: 'scheduledPayment', type: 'string', width:'4%', enableColumnMenu: false,
            cellTemplate: '<input type="checkbox" onclick="return false" ng-model="row.entity.scheduledPayment">',
            headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        }
    ];

    $scope.gridOptions = {
        enableColumnResizing: true,
        enableSorting: true,
		showColumnFooter: true,
        rowHeight: 23,
        rowTemplate: rowTemplate,
        columnDefs: $scope.columns,
        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
          $scope.refreshColumns();
        }
    };

    $scope.refreshColumns = function() {
    	var width = $(window).width();

        if (width <= 600) {
            $scope.columns[1].width = '18%';
            $scope.columns[2].width = '35%';
            $scope.columns[3].width = '18%';
        } else if (width <= 800) {
            $scope.columns[1].width = '15%';
            $scope.columns[2].width = '30%';
            $scope.columns[3].width = '15%';
            $scope.columns[6].width = '15%';
        } else {
            $scope.columns[1].width = '8%';
            $scope.columns[2].width = '22%';
            $scope.columns[3].width = '10%';
            $scope.columns[6].width = '9%';
        }

        $scope.columns[4].visible = width > 800;
        $scope.columns[5].visible = width > 800;
    	$scope.columns[6].visible = width > 600;
    	$scope.columns[7].visible = width > 1000;
    	$scope.columns[8].visible = width > 1000;
    	//$scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    }

    $(window).resize(function(){
    	$scope.$apply(function(){
    	   $scope.refreshColumns();
    	});
    });

  	$scope.openCalendarDialogBegin = function($event) {
    	$scope.beginOpened = true;
  	};

  	$scope.openCalendarDialogEnd = function($event) {
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
    	var modalInstance = $uibModal.open({
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
	    	if ((expense._action == 'new') || (expense._action == 'clone')) {
	    		$scope.createExpense(expense);
	    	} else if (expense._action == 'edit') {
	    		$scope.editExpense(expense);
	    	}
		});
    };

    $scope.openGeneratorModal = function () {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/generatorModal.html',
      		controller: generatorModalController,
      		size: 'lg',
      		resolve: {
		        type: function () {
					return 'Despesa';
        		}
      		}
    	});

        modalInstance.result.then(function (id) {
			Utils.addSucess($scope, 'Despesa(s) gerada(s) com sucesso!');
            $scope.getExpenses();
		});
    };

    $scope.deleteConfirmation = function (ExpenseId) {
    	var modalInstance = $uibModal.open({
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

    $scope.payExpenseConfirmation = function (ExpenseId) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return ExpenseId;
        		},
		        message: function () {
					return 'Confirma o pagamento da despesa?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.payExpense(id);
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
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.createExpense = function(expense) {
		$scope.loading = true;

		Expenses.create(expense)
			.success(function(data) {
				Utils.addSucess($scope, 'Despesa adicionada com sucesso!');
                $scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.editExpense = function(expense) {
		$scope.loading = true;

		Expenses.patch(expense._id, expense)
			.success(function(data) {
                Utils.addSucess($scope, 'Despesa editada com sucesso!');
				$scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.deleteExpense = function(id) {
		$scope.loading = true;

		Expenses.delete(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Despesa excluída com sucesso!');
				$scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.payExpense = function(id) {
        $scope.loading = true;

		Expenses.pay(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Despesa paga com sucesso!');
                $scope.getExpenses();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
	$scope.navigateActualMonth();
});
