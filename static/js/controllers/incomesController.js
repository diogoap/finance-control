'use strict';

var app = angular.module('financeControl');

app.controller('incomesController', function($scope, $http, $uibModal, $locale, uiGridConstants, Utils, Incomes) {

 	$scope.columns = [
        {
            name: 'Vencimento', field: 'dueDate', type: 'date', width: Utils.getSizeRes('9%', '15%', '21%'), enableColumnMenu: false,
            cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-center-align',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return Utils.getCellClassesLatePayment('ui-grid-cell-center-align', row.entity.status == 'Em aberto', row.entity.dueDate);
            }
        },
        {
            name: 'Descrição', field: 'description', type: 'string', width: Utils.getSizeRes('27%', '27%', '41%'), enableColumnMenu: false,
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return Utils.getCellClassesLatePayment('', row.entity.status == 'Em aberto', row.entity.dueDate);
            }
        },
        {
            name: 'Valor', field: 'amount', type: 'number',  width: Utils.getSizeRes('10%', '12%', '20%'), enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align',
            aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return Utils.getCellClassesLatePayment('ui-grid-cell-right-align', row.entity.status == 'Em aberto', row.entity.dueDate);
            }
        },
        {
            name: 'Conta', field: '_accountNames', type: 'string', width: Utils.getSizeRes('17%', '17%', '0%'), visible: Utils.getVisibilityRes(true, true, false), enableColumnMenu: false,
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return Utils.getCellClassesLatePayment('', row.entity.status == 'Em aberto', row.entity.dueDate);
            }
        },
        {
            name: 'Categoria', field: '_categoryNames', type: 'string', width: Utils.getSizeRes('17%', '17%', '0%'), visible: Utils.getVisibilityRes(true, true, false), enableColumnMenu: false,
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return Utils.getCellClassesLatePayment('', row.entity.status == 'Em aberto', row.entity.dueDate);
            }
        },
        {
            name: 'Situação', field: 'status', type: 'string', width: Utils.getSizeRes('10%', '12%', '18%'), enableColumnMenu: false,
            headerCellClass: 'ui-grid-cell-center-align',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return Utils.getCellClassesLatePayment('ui-grid-cell-center-align', row.entity.status == 'Em aberto', row.entity.dueDate);
            }
        },
        {
            name: 'Valor receb.', field: 'amountReceived', type: 'number', width: Utils.getSizeRes('10%', '0%', '0%'), visible: Utils.getVisibilityRes(true, false, false), enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align',
            aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>',
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                return Utils.getCellClassesLatePayment('ui-grid-cell-right-align', row.entity.status == 'Em aberto', row.entity.dueDate);
            }
        }
    ];

 	$scope.gridOptions = {
        enableRowSelection: true,
    	enableRowHeaderSelection: false,
    	multiSelect: false,
    	enableSelectAll: false,
        enableColumnResizing: true,
        enableSorting: true,
		showColumnFooter: true,
        rowHeight: Utils.getGridRowHeight(),
        columnDefs: $scope.columns,
        onRegisterApi: function(gridApi) {
        	$scope.gridApi = gridApi;
        	gridApi.selection.on.rowSelectionChanged($scope,function(row){
        		$scope.selectedRow = row;
        	});
            gridApi.cellNav.on.navigate($scope,function(newRowCol, oldRowCol){
                $scope.gridApi.selection.selectRow(newRowCol.row.entity);
            });
        }
    };

  	$scope.openCalendarDialogBegin = function($event) {
    	$scope.beginOpened = true;
  	};

  	$scope.openCalendarDialogEnd = function($event) {
    	$scope.endOpened = true;
  	};

    $scope.navigateBeginOfYear = function() {
        var dates = Utils.getBeginOfYear($scope.incomeDueDateBegin);
        $scope.incomeDueDateBegin = dates.begin;
		$scope.incomeDueDateEnd = dates.end;

		$scope.getIncomes();
  	};

    $scope.navigatePreviousMonth = function() {
        var dates = Utils.getPreviousMonth($scope.incomeDueDateBegin);
        $scope.incomeDueDateBegin = dates.begin;
		$scope.incomeDueDateEnd = dates.end;

		$scope.getIncomes();
  	};

  	$scope.navigateActualMonth = function() {
        var dates = Utils.getActualMonth();
        $scope.incomeDueDateBegin = dates.begin;
		$scope.incomeDueDateEnd = dates.end;

		$scope.getIncomes();
  	};

  	$scope.navigateNextMonth = function() {
        var dates = Utils.getNextMonth($scope.incomeDueDateBegin);
        $scope.incomeDueDateBegin = dates.begin;
		$scope.incomeDueDateEnd = dates.end;

		$scope.getIncomes();
  	};

    $scope.navigateEndOfYear = function() {
        var dates = Utils.getEndOfYear($scope.incomeDueDateBegin);
        $scope.incomeDueDateBegin = dates.begin;
		$scope.incomeDueDateEnd = dates.end;

		$scope.getIncomes();
  	};

	$scope.filter = function($event) {
		if ((isNaN(Date.parse($scope.incomeDueDateBegin)) == false) && (isNaN(Date.parse($scope.incomeDueDateEnd))) == false) {
			$scope.getIncomes();
		}
  	};

  	$scope.openModal = function (incomeId, action) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/incomesModal.html',
      		controller: incomesModalController,
      		size: 'lg',
      		resolve: {
		        incomeId: function () {
					return incomeId;
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (income) {
	    	if ((income._action == 'new') || (income._action == 'clone')) {
	    		$scope.createIncome(income);
	    	} else if (income._action == 'edit') {
	    		$scope.editIncome(income);
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
					return 'Receita';
        		}
      		}
    	});

        modalInstance.result.then(function (id) {
			Utils.addSucess($scope, 'Receita(s) gerada(s) com sucesso!');
        	$scope.getIncomes();
        });
    };

    $scope.deleteConfirmation = function (IncomeId) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return IncomeId;
        		},
		        message: function () {
					return 'Confirma a exclusão da receita?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.deleteIncome(id);
		});
    };

    $scope.receiveIncomeConfirmation = function (IncomeId) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return IncomeId;
        		},
		        message: function () {
					return 'Confirma o recebimento da receita?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.receiveIncome(id);
		});
    };

	$scope.getDueDateFilter = function() {
		var dateBegin, dateEnd, y, m, d;

		dateBegin = $scope.incomeDueDateBegin;
		y = dateBegin.getFullYear(), m = dateBegin.getMonth(), d = dateBegin.getDate();
		dateBegin = new Date(y, m, d);

		dateEnd = $scope.incomeDueDateEnd;
		y = dateEnd.getFullYear(), m = dateEnd.getMonth(), d = dateEnd.getDate();
		dateEnd = new Date(y, m, d, 23, 59, 59, 999);

		return 'dateBegin=' + dateBegin + '&dateEnd=' + dateEnd;
	}

	$scope.getIncomes = function() {
		$scope.loading = true;

		var filter = $scope.getDueDateFilter();

		Incomes.get(filter)
			.success(function(data) {
				$scope.gridOptions.data = data;
                Utils.clearGridNav($scope.gridApi);
                $scope.selectedRow = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});

        Incomes.getBalance(filter)
        	.success(function(data) {
                $scope.currentPartialBalance = data.current.all.partialBalance;
        		$scope.loading = false;
        	})
        	.error(function(data, status, headers, config) {
        		Utils.addError($scope, 'Erro ao carregar o saldo: ' + status);
        		$scope.loading = false;
        	});
	};

	$scope.createIncome = function(income) {
		$scope.loading = true;

		Incomes.create(income)
			.success(function(data) {
                Utils.addSucess($scope, 'Receita adicionada com sucesso!');
				$scope.getIncomes();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.editIncome = function(income) {
		$scope.loading = true;

		Incomes.patch(income._id, income)
			.success(function(data) {
                Utils.addSucess($scope, 'Receita editada com sucesso!');
				$scope.getIncomes();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.deleteIncome = function(id) {
		$scope.loading = true;

		Incomes.delete(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Receita excluída com sucesso!');
				$scope.getIncomes();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.receiveIncome = function(id) {
        $scope.loading = true;

		Incomes.receive(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Receita recebida com sucesso!');
                $scope.getIncomes();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

    $scope.getValueStyle = function(value) {
        if (value < 0) {
            return 'val-neg';
        } else if (value == 0 ) {
            return 'val-zero';
        } else {
            return 'val-pos';
        }
    };

	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
	$scope.navigateActualMonth();
});
