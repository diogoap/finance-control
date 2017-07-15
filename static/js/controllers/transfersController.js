'use strict';

var app = angular.module('financeControl');

app.controller('transfersController', function($scope, $http, $uibModal, $locale, uiGridConstants, Utils, Transfers) {

 	$scope.columns = [
        {
            name: 'Data', field: 'date', type: 'date', width: Utils.getSizeRes('14%', '21%', '21%'), enableColumnMenu: false,
            cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align',
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
        },
        {
            name: 'Valor', field: 'amount', type: 'number',  width: Utils.getSizeRes('14%', '21%', '21%'), enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
            aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
        },
        {
            name: 'Conta Origem', field: '_accountOrigin.name', type: 'string', width: Utils.getSizeRes('36%', '29%', '29%'), enableColumnMenu: false
        },
        {
            name: 'Conta Destino', field: '_accountTarget.name', type: 'string', width: Utils.getSizeRes('36%', '29%', '29%'), enableColumnMenu: false
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
        var dates = Utils.getBeginOfYear($scope.transferDateBegin);
        $scope.transferDateBegin = dates.begin;
		$scope.transferDateEnd = dates.end;

		$scope.getTransfers();
  	};

    $scope.navigatePreviousMonth = function() {
        var dates = Utils.getPreviousMonth($scope.transferDateBegin);
        $scope.transferDateBegin = dates.begin;
		$scope.transferDateEnd = dates.end;

		$scope.getTransfers();
  	};

  	$scope.navigateActualMonth = function() {
        var dates = Utils.getActualMonth();
        $scope.transferDateBegin = dates.begin;
		$scope.transferDateEnd = dates.end;

		$scope.getTransfers();
  	};

  	$scope.navigateNextMonth = function() {
        var dates = Utils.getNextMonth($scope.transferDateBegin);
        $scope.transferDateBegin = dates.begin;
		$scope.transferDateEnd = dates.end;

		$scope.getTransfers();
  	};

    $scope.navigateEndOfYear = function() {
        var dates = Utils.getEndOfYear($scope.transferDateBegin);
        $scope.transferDateBegin = dates.begin;
		$scope.transferDateEnd = dates.end;

		$scope.getTransfers();
  	};

	$scope.filter = function($event) {
		if ((isNaN(Date.parse($scope.transferDateBegin)) == false) && (isNaN(Date.parse($scope.transferDateEnd))) == false) {
			$scope.getTransfers();
		}
  	};

  	$scope.openModal = function (transferId, action) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/transfersModal.html',
      		controller: transfersModalController,
      		resolve: {
		        transferId: function () {
					return transferId;
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (transfer) {
	    	if (transfer._action == 'new') {
	    		$scope.createTransfer(transfer);
	    	} else if (transfer._action == 'edit') {
	    		$scope.editTransfer(transfer);
	    	}
		});
    };

    $scope.deleteConfirmation = function (transferId) {
    	var modalInstance = $uibModal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return transferId;
        		},
		        message: function () {
					return 'Confirma a exclusão da transferência?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.deleteTransfer(id);
		});
    };

    $scope.getDateFilter = function() {
		var dateBegin, dateEnd, y, m, d;

		dateBegin = $scope.transferDateBegin;
		y = dateBegin.getFullYear(), m = dateBegin.getMonth(), d = dateBegin.getDate();
		dateBegin = new Date(y, m, d);

		dateEnd = $scope.transferDateEnd;
		y = dateEnd.getFullYear(), m = dateEnd.getMonth(), d = dateEnd.getDate();
		dateEnd = new Date(y, m, d, 23, 59, 59, 999);

		return 'dateBegin=' + dateBegin + '&dateEnd=' + dateEnd;
	}

    $scope.getTransfers = function() {
		$scope.loading = true;

		var filter = $scope.getDateFilter();

		Transfers.get(filter)
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

        Transfers.getBalance(filter)
        	.success(function(data) {
                $scope.currentPartialBalance = data.current.all.partialBalance;
        		$scope.loading = false;
        	})
        	.error(function(data, status, headers, config) {
        		Utils.addError($scope, 'Erro ao carregar o saldo: ' + status);
        		$scope.loading = false;
        	});
	};

	$scope.createTransfer = function(transfer) {
		$scope.loading = true;

		Transfers.create(transfer)
			.success(function(data) {
				Utils.addSucess($scope, 'Transferência adicionada com sucesso!');
                $scope.getTransfers();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.editTransfer = function(transfer) {
		$scope.loading = true;

		Transfers.patch(transfer._id, transfer)
			.success(function(data) {
                Utils.addSucess($scope, 'Transferência editada com sucesso!');
				$scope.getTransfers();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.deleteTransfer = function(id) {
		$scope.loading = true;

		Transfers.delete(id)
			.success(function(data) {
				Utils.addSucess($scope, 'Transferência excluída com sucesso!');
                $scope.getTransfers();
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
