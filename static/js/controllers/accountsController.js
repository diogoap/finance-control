'use strict';

var app = angular.module('financeControl');

app.controller('accountsController', function($scope, $http, $uibModal, $locale, uiGridConstants, Utils, Accounts) {

 	$scope.columns = [
        {
            name: 'Nome', field: 'name', type: 'string', width: Utils.getSizeRes('54%', '42%', '42%'), enableColumnMenu: false,
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
		},
        {
			name: 'Moeda', field: '_currency.currencyCode', type: 'string', width: Utils.getSizeRes('6%', '10%', '10%'), visible: Utils.getVisibilityRes(true, true, true), enableColumnMenu: false,
			headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
        },		
        {
            name: 'Saldo inicial', field: 'initialBalance', type: 'number',  width: Utils.getSizeRes('18%', '20%', '20%'), enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align'
        },
        {
            name: 'Ordem', field: 'order', type: 'number', width: Utils.getSizeRes('12%', '13%', '13%'), enableColumnMenu: false,
            cellFilter: 'number:0', headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
        },
        {
            name: 'Ativa?', field: 'enableed', type: 'string', width: Utils.getSizeRes('10%', '15%', '15%'), enableColumnMenu: false,
            cellTemplate: '<input type="checkbox" onclick="return false" ng-model="row.entity.enabled">',
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
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
                Utils.clearGridNav($scope.gridApi);
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
