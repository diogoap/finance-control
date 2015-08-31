'use strict';

var app = angular.module('financeControl');

app.controller('accountsController', function($scope, $http, $modal, $locale, uiGridConstants, Utils, Accounts) {

 	$scope.gridOptions = {
        enableSorting: true,
		showColumnFooter: true,
        rowHeight: 23,
        columnDefs: [
          	{ name: 'Ações', type: 'string', width:'72', minWidth:'72', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
          		'<a class="btn btn-primary btn-xs" title="Editar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' + '&#32' +
          		'<a class="btn btn-primary btn-xs" title="Excluir" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
          	},
          	{
				name: 'Nome', field: 'name', type: 'string', width:'60%', enableColumnMenu: false,
				aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
				footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
			},
          	{ name: 'Saldo inicial', field: 'initialBalance', type: 'number',  width: '30%', enableColumnMenu: false,
          		cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align'
          	}
        ]
    };

  	$scope.openModal = function (accountId, action) {
    	var modalInstance = $modal.open({
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
    };

    $scope.deleteConfirmation = function (accountId) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return accountId;
        		},
		        message: function () {
					return 'Confirma a exclusão da conta?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.deleteAccount(id);
		});
    };

	$scope.getAccounts = function() {
		Accounts.get()
			.success(function(data) {
				$scope.gridOptions.data = data;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.createAccount = function(account) {
		$scope.loading = true;

		Accounts.create()
			.success(function(data) {
				Utils.addSucess($scope, 'Conta adicionada com sucesso!');
                $scope.getAccounts();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

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
	};

	$scope.deleteAccount = function(id) {
		$scope.loading = true;

		Accounts.delete(id)
			.success(function(data) {
				Utils.addSucess($scope, 'Conta excluída com sucesso!');
                $scope.getAccounts();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
	$scope.getAccounts();
});
