'use strict';

var app = angular.module('financeControl');

app.controller('accountsController', function($scope, $http, $uibModal, $locale, uiGridConstants, Utils, Accounts) {

 	$scope.columns = [
        { name: 'Ações', type: 'string', width:'75', minWidth:'75', visible: !Utils.isLowResolution(), enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
            '<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Inativar" ng-show="row.entity.enabled == true" href="" ng-click="grid.appScope.enableDisableConfirmation(row.entity._id, false)"><i class="fa fa-times fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Ativar" ng-show="row.entity.enabled == false" href="" ng-click="grid.appScope.enableDisableConfirmation(row.entity._id, true)"><i class="fa fa-check fa-lg fa-fw"></i></a>',
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-left-align'
        },
        {
            name: 'Nome', field: 'name', type: 'string', width: Utils.getSizeRes('52%', '43%', '43%'), enableColumnMenu: false,
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
        },
        { name: 'Saldo inicial', field: 'initialBalance', type: 'number',  width: Utils.getSizeRes('20%', '25%', '25%'), enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align'
        },
        { name: 'Ordem', field: 'order', type: 'number', width: Utils.getSizeRes('10%', '16%', '16%'), enableColumnMenu: false,
            cellFilter: 'number:0', headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
        },
        { name: 'Ativa?', field: 'enableed', type: 'string', width: Utils.getSizeRes('10%', '16%', '16%'), enableColumnMenu: false,
            cellTemplate: '<input type="checkbox" onclick="return false" ng-model="row.entity.enabled">',
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
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
    }

    $scope.getFilter = function() {
        if ($scope.listDisabledAccounts == false) {
            return 'enabled=true';
        }
        return undefined;
	}

  	$scope.openModal = function (accountId, action) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/accountsModal.html',
      		controller: accountsModalController,
      		resolve: {
		        accountId: function () {
					return accountId;
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (account) {
	    	if (account._action == 'new') {
	    		$scope.createAccount(account);
	    	} else if (account._action == 'edit') {
	    		$scope.editAccount(account);
	    	}
		});
    }

    $scope.enableDisableConfirmation = function (accountId, enable) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return { id: accountId, enable: enable };
        		},
		        message: function () {
                    if (enable) {
                        return 'Confirma a ativação da conta?';
                    } else {
                        return 'Confirma a inativação da conta?';
                    }
        		}
      		}
    	});

		modalInstance.result.then(function (params) {
	    	$scope.enableDisableAccount(params.id, params.enable);
		});
    }

	$scope.getAccounts = function() {
        $scope.loading = true;

		var filter = $scope.getFilter();

        Accounts.get(filter)
			.success(function(data) {
				$scope.gridOptions.data = data;
                $scope.selectedRow = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	}

	$scope.createAccount = function(account) {
		$scope.loading = true;

		Accounts.create(account)
			.success(function(data) {
				Utils.addSucess($scope, 'Conta adicionada com sucesso!');
                $scope.getAccounts();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	}

	$scope.editAccount = function(account) {
        $scope.loading = true;

		Accounts.patch(account._id, account)
			.success(function(data) {
                Utils.addSucess($scope, 'Conta editada com sucesso!');
				$scope.getAccounts();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	}

	$scope.enableDisableAccount = function(id, enable) {
		$scope.loading = true;

        Accounts.getById(id)
			.success(function(account) {

                account.enabled = enable;

                Accounts.patch(account._id, account)
        			.success(function(data) {
                        if (enable) {
                            Utils.addSucess($scope, 'Conta ativada com sucesso!');
                        } else {
                            Utils.addSucess($scope, 'Conta inativada com sucesso!');
                        }

        				$scope.getAccounts();
        			})
        			.error(function(data, status, headers, config) {
        				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
        				$scope.loading = false;
        			});
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	}

	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
    $scope.listDisabledAccounts = false;
	$scope.getAccounts();
});
