'use strict';

function incomesModalController($scope, $uibModal, $uibModalInstance, uiGridConstants, Utils, Incomes, Categories, Accounts, incomeId, action) {
	$scope.loading = true;
	$scope.income = {};
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
 	$scope.incomeStatus = ['Em aberto', 'Recebido'];
 	$scope.submitted = false;

 	$scope.columns = [
		{
			name: 'Ações', type: 'string', width:'146', minWidth:'146', visible: !Utils.isLowResolution(), enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
			'<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openDetail(row.entity, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
			'<a class="btn btn-primary btn-xs btn-grid" title="Excluir" href="" ng-click="grid.appScope.deleteDetailConfirmation(row.entity)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Clonar" href="" ng-click="grid.appScope.openDetail(row.entity, \'clone\')"><i class="fa fa-clone fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Receber" ng-show="row.entity.status == \'Em aberto\'" href="" ng-click="grid.appScope.receiveDetailConfirmation(row.entity)"><i class="fa fa-usd fa-lg fa-fw"></i></a>',
			headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-left-align'
		},
		{
			name: 'Descrição', field: 'description', type: 'string', width: Utils.getSizeRes('26%', '29%', '36%'), enableColumnMenu: false,
			aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
		},
		{
			name: 'Valor', field: 'amount', type: 'number', width: Utils.getSizeRes('11%', '15%', '20%'), enableColumnMenu: false,
			cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
			aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
		},
		{
			name: 'Conta', field: '_account.name', type: 'string', width: Utils.getSizeRes('18%', '21%', '26%'), enableColumnMenu: false
		},
		{
			name: 'Categoria', field: '_category.name', type: 'string', width: Utils.getSizeRes('18%', '21%', '0%'), visible: Utils.setVisibilityRes(true, true, false), enableColumnMenu: false
		},
		{
			name: 'Situação', field: 'status', type: 'string', width: Utils.getSizeRes('10%', '14%', '18%'), enableColumnMenu: false,
			headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
		}
	];

	$scope.gridOptions = {
		enableRowSelection: Utils.isLowResolution(),
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

	var filter = 'type=Receita&enabled=true';
	Categories.get(filter)
		.success(function(data) {
			$scope.categories = data;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

	var filter = 'enabled=true';
	Accounts.get(filter)
		.success(function(data) {
			$scope.accounts = data;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
			$scope.loading = false;
		});

  	$scope.openCalendarDialog = function($event) {
    	$scope.opened = true;
  	};

	$scope.submit = function () {
    	if ($scope.incomeForm.$valid) {
			$scope.updateIncomeTotal();
			$scope.income._action = $scope.action;
			$uibModalInstance.close($scope.income);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.validIncomeAmountReceived = function(value) {
	  	if (($scope.income != undefined) && ($scope.income.status == 'Recebido') && (value <= 0)) {
	  		return false;
	  	}

		return true;
	}

	$scope.updateIncomeTotal = function() {
		$scope._hasDetail = false;
		$scope.selectedRow = null;

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

  	$scope.openDetail = function (entity, action) {
		var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/incomesDetailModal.html',
      		controller: incomesDetailModalController,
      		resolve: {
		        incomeDetail: function () {
					if (entity != undefined) {
						// Get object for selected detail
						var selDetail = $.grep($scope.income.detail, function(e){ return e.$$hashKey == entity.$$hashKey });
						return selDetail[0];
					} else {
						return null;
					}
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (incomeDetail) {
	    	if ((incomeDetail._action == 'new') || (incomeDetail._action == 'clone')) {
	    		$scope.income.detail.push(incomeDetail);
				$scope.income.detail.sort(Incomes.compare);
	    	} else if (incomeDetail._action == 'edit') {
				// Replace exising detail object with the new one
				for (var i in $scope.income.detail) {
					if ($scope.income.detail[i].$$hashKey == incomeDetail.$$hashKey) {
						delete incomeDetail.$$hashKey;
						$scope.income.detail[i] = incomeDetail;
						$scope.income.detail.sort(Incomes.compare);
			            break;
			        }
			    }
	    	}

			$scope.updateIncomeTotal();
		});
    }

    $scope.deleteDetailConfirmation = function (entity) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
			size: 'sm',
      		resolve: {
		        data: function () {
					return entity;
        		},
		        message: function () {
					return 'Confirma a exclusão do detalhe?';
        		}
      		}
    	});

		modalInstance.result.then(function (entity) {
			// Replace exising detail object with the new one
			for (var i in $scope.income.detail) {
				if ($scope.income.detail[i].$$hashKey == entity.$$hashKey) {
					$scope.income.detail.splice(i, 1);
					break;
				}
			}

			$scope.updateIncomeTotal();
		});
    }

	$scope.receiveDetailConfirmation = function (entity) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
			size: 'sm',
      		resolve: {
		        data: function () {
					return entity;
        		},
		        message: function () {
					return 'Confirma o recebimento do detalhe?';
        		}
      		}
    	});

		modalInstance.result.then(function (entity) {
			for (var i in $scope.income.detail) {
				if ($scope.income.detail[i].$$hashKey == entity.$$hashKey) {
					$scope.income.detail[i].status = 'Recebido';
					break;
				}
			}

			$scope.updateIncomeTotal();
		});
    }

	$scope.formatNumericAmount = function(e) {
		$scope.income.amount = Utils.formatPastedNumer(e);
	}

	$scope.formatNumericAmountReceived = function(event) {
		$scope.income.amountReceived = Utils.formatPastedNumer(event);
	}

	$scope.onChangeIncomeStatus = function() {
		if ($scope.income.status == 'Recebido' && $scope.income.amountReceived == 0) {
			$scope.income.amountReceived = $scope.income.amount;
		}
	}

	$scope.$on('$locationChangeStart', function(event, next, current){
	    event.preventDefault();
		$scope.cancel();
	});
};
