'use strict';

var app = angular.module('financeControl');

app.controller('transfersController', function($scope, $http, $modal, $locale, uiGridConstants, Utils, Transfers) {

 	$scope.columns = [
        { name: 'Ações', type: 'string', width:'75', minWidth:'75', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
            '<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Excluir" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>',
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-left-align'
        },
        { name: 'Data', field: 'date', type: 'date', width:'12%', enableColumnMenu: false,
            cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align',
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'            
        },
        { name: 'Valor', field: 'amount', type: 'number',  width: '12%', enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align',
            aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
        },
        {
            name: 'Conta Origem', field: '_accountOrigin.name', type: 'string', width:'33%', enableColumnMenu: false
        },
        { name: 'Conta Destino', field: '_accountTarget.name', type: 'string', width:'33%', enableColumnMenu: false }
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

    $scope.openCalendarDialogBegin = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.beginOpened = true;
  	};

  	$scope.openCalendarDialogEnd = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.endOpened = true;
  	};

  	$scope.navigatePreviousMonth = function($event) {
		var date;

		if (isNaN(Date.parse($scope.transferDateBegin))) {
			date = new Date();
		}
		else {
			date = $scope.transferDateBegin;
		}

		var y = date.getFullYear(), m = date.getMonth();
		$scope.transferDateBegin = new Date(y, m - 1, 1);
		$scope.transferDateEnd = new Date(y, m, 0);

		$scope.getTransfers();
  	};

  	$scope.navigateActualMonth = function($event) {
		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		$scope.transferDateBegin = new Date(y, m, 1);
		$scope.transferDateEnd = new Date(y, m + 1, 0);

		$scope.getTransfers();
  	};

  	$scope.navigateNextMonth = function($event) {
		var date;

		if (isNaN(Date.parse($scope.transferDateBegin))) {
			date = new Date();
		}
		else {
			date = $scope.transferDateBegin;
		}

		var y = date.getFullYear(), m = date.getMonth();
		$scope.transferDateBegin = new Date(y, m + 1, 1);
		$scope.transferDateEnd = new Date(y, m + 2, 0);

		$scope.getTransfers();
  	};

	$scope.filter = function($event) {
		if ((isNaN(Date.parse($scope.transferDateBegin)) == false) && (isNaN(Date.parse($scope.transferDateEnd))) == false) {
			$scope.getTransfers();
		}
  	};

  	$scope.openModal = function (transferId, action) {
    	var modalInstance = $modal.open({
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
    	var modalInstance = $modal.open({
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
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
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
