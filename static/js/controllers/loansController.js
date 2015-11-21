'use strict';

var app = angular.module('financeControl');

app.controller('loansController', function($scope, $http, $modal, $locale, uiGridConstants, Utils, Loans) {

 	$scope.columns = [
        { name: 'Ações', type: 'string', width:'146', minWidth:'146', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
            '<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Excluir" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Clonar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'clone\')"><i class="fa fa-clone fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Quitar" ng-show="row.entity.status == \'Em aberto\'" href="" ng-click="grid.appScope.payLoanConfirmation(row.entity._id)"><i class="fa fa-usd fa-lg fa-fw"></i></a>',
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-left-align'
        },
        {
            name: 'Descrição', field: 'description', type: 'string', width:'25%', enableColumnMenu: false,
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
        },
        { name: 'Data', field: 'transactionDate', type: 'date', width:'8%', enableColumnMenu: false,
            cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
        },
        { name: 'Vencimento', field: 'dueDate', type: 'date', width:'8%', enableColumnMenu: false,
            cellFilter: 'date:"shortDate"', headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
        },
        { name: 'Valor', field: 'amount', type: 'number',  width: '10%', enableColumnMenu: false,
            cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align'
        },
        { name: 'Conta', field: '_account.name', type: 'string', width:'17%', enableColumnMenu: false },
        { name: 'Tipo', field: 'type', type: 'string', width:'9%', enableColumnMenu: false,
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
        },
        { name: 'Situação', field: 'status', type: 'string', width:'9%', enableColumnMenu: false,
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

    $scope.getStatusFilter = function() {
        if ($scope.listPaidLoans == false) {
            return 'status=Em aberto';
        }
        return undefined;
	}

	$scope.filter = function($event) {
		$scope.getLoans();
  	};

  	$scope.openModal = function (loanId, action) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/loansModal.html',
      		controller: loansModalController,
      		resolve: {
		        loanId: function () {
					return loanId;
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (loan) {
	    	if ((loan._action == 'new') || (loan._action == 'clone')) {
	    		$scope.createLoan(loan);
	    	} else if (loan._action == 'edit') {
	    		$scope.editLoan(loan);
	    	}
		});
    };

    $scope.deleteConfirmation = function (loanId) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return loanId;
        		},
		        message: function () {
					return 'Confirma a exclusão do empréstimo?';
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.deleteLoan(id);
		});
    };

    $scope.payLoanConfirmation = function (loanId) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return loanId;
        		},
		        message: function () {
					return 'Confirma a quitação do empréstimo?'
                }
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.payLoan(id);
		});
    };

    $scope.getLoans = function() {
		$scope.loading = true;

		var filter = $scope.getStatusFilter();

		Loans.get(filter)
			.success(function(data) {
				$scope.gridOptions.data = data;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.createLoan = function(loan) {
		$scope.loading = true;

		Loans.create(loan)
			.success(function(data) {
				Utils.addSucess($scope, 'Empréstimo adicionado com sucesso!');
                $scope.getLoans();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.editLoan = function(loan) {
		$scope.loading = true;

		Loans.patch(loan._id, loan)
			.success(function(data) {
                Utils.addSucess($scope, 'Empréstimo editado com sucesso!');
				$scope.getLoans();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.deleteLoan = function(id) {
		$scope.loading = true;

		Loans.delete(id)
			.success(function(data) {
				Utils.addSucess($scope, 'Empréstimo excluído com sucesso!');
                $scope.getLoans();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

    $scope.payLoan = function(id) {
        $scope.loading = true;

		Loans.pay(id)
			.success(function(data) {
                Utils.addSucess($scope, 'Empréstimo quitado com sucesso!');
                $scope.getLoans();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
    $scope.listPaidLoans = false;
    $scope.getLoans();
});
