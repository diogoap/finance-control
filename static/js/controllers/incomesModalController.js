'use strict';

function incomesModalController($scope, $modal, $modalInstance, uiGridConstants, Utils, Incomes, Categories, Accounts, incomeId, action) {
	$scope.loading = true;
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
 	$scope.incomeStatus = ['Em aberto', 'Recebido'];
 	$scope.submitted = false;

 	$scope.columns = [
		{ name: 'Ações', type: 'string', width:'75', minWidth:'75', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
			'<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openDetail(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
			'<a class="btn btn-primary btn-xs btn-grid" title="Excluir" href="" ng-click="grid.appScope.deleteDetailConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>',
			headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-left-align'
		},
		{
			name: 'Descrição', field: 'description', type: 'string', width:'28%', enableColumnMenu: false,
			aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
		},
		{ name: 'Valor', field: 'amount', type: 'number',  width: '12%', enableColumnMenu: false,
			cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
			aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
		},
		{ name: 'Conta', field: '_account.name', type: 'string', width:'20%', enableColumnMenu: false },
		{ name: 'Categoria', field: '_category.name', type: 'string', width:'20%', enableColumnMenu: false },
		{ name: 'Situação', field: 'status', type: 'string', width:'11%', enableColumnMenu: false,
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
		$scope.screenTitle = 'Adicionar receita';
		$scope.income = { dueDate: new Date(), status: 'Em aberto', amountReceived: 0, detail: new Array() };
		$scope.gridOptions.data = $scope.income.detail;
		$scope._hasDetail = false;
		$scope.loading = false;
	}
	else
	{
		if (action == 'clone') {
			$scope.screenTitle = 'Clonar receita';
		} else {
			$scope.screenTitle = 'Editar receita';
		}

		Incomes.getById(incomeId)
			.success(function(data) {
				$scope.income = data;

				//Need to generate a new to date in order to make date picker work
				$scope.income.dueDate = new Date($scope.income.dueDate);
				$scope._hasDetail = $scope.income.detail.length > 0;
				$scope.gridOptions.data = data.detail;

				if (action == 'clone') {
					$scope.income._id = null;
					$scope.income.description += ' - Cópia';
				}

				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	var filter = 'type=Receita';
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
    	if ($scope.incomeForm.$valid) {
			$scope.updateIncomeTotal();
			$scope.income._action = $scope.action;
			$modalInstance.close($scope.income);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}

	$scope.validIncomeAmountReceived = function(value) {
	  	if (($scope.income != undefined) && ($scope.income.status == 'Recebido') && (value <= 0)) {
	  		return false;
	  	}

		return true;
	}

	$scope.updateIncomeTotal = function() {
		$scope._hasDetail = false;

		if (($scope.income.detail != undefined) && ($scope.income.detail.length > 0)) {
			$scope._hasDetail = true;

			$scope.income.account_id = '';
			$scope.income._account = null;

			$scope.income.category_id = '';
			$scope.income._category = null;

			$scope.income.amount = 0;
			$scope.income.amountReceived = 0;

			$scope.income.detail.forEach(function (det) {
				$scope.income.amount += det.amount;

				if (det.status == 'Recebido') {
					$scope.income.amountReceived += det.amount;
				}
			});

			if ($scope.income.amount == $scope.income.amountReceived) {
				$scope.income.status = 'Recebido';
			} else {
				$scope.income.status = 'Em aberto';
			}
		}
	}

  	$scope.openDetail = function (incomeDetailId, action) {
		var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/incomesDetailModal.html',
      		controller: incomesDetailModalController,
      		resolve: {
		        incomeDetail: function () {
					// Get object for selected detail
					var selDetail = $.grep($scope.income.detail, function(e){ return e._id == incomeDetailId });
					return selDetail[0];
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (incomeDetail) {
	    	if (incomeDetail._action == 'new') {
	    		$scope.income.detail.push(incomeDetail);
	    	} else if (incomeDetail._action == 'edit') {
				// Replace exising detail object with the new one
				for (var i in $scope.income.detail) {
			        if ($scope.income.detail[i]._id == incomeDetail._id) {
			            $scope.income.detail[i] = incomeDetail;
			            break;
			        }
			    }
	    	}

			$scope.updateIncomeTotal();
		});
    };

    $scope.deleteDetailConfirmation = function (incomeDetailId) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
			size: 'sm',
      		resolve: {
		        data: function () {
					return incomeDetailId;
        		},
		        message: function () {
					return 'Confirma a exclusão do detalhe?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
			// Replace exising detail object with the new one
			for (var i in $scope.income.detail) {
				if ($scope.income.detail[i]._id == id) {
					$scope.income.detail.splice(i, 1);
					break;
				}
			}

			$scope.updateIncomeTotal();
		});
    };

};
