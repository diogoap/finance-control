'use strict';

function expensesModalController($scope, $modalInstance, Expenses, Categories, Accounts, expenseId, action) {
	$scope.loading = true;
	$scope.errorMessage = '';
	$scope.action = action;
 	$scope.expenseStatus = ['Em aberto', 'Pago', 'Cancelado'];	
 	$scope.submitted = false;

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar despesa';		
		$scope.expense = { dueDate: new Date(), status: 'Em aberto', amountPaid: 0 };
		$scope.loading = false;
	}
	else
	{
		$scope.screenTitle = 'Editar despesa';

		Expenses.getById(expenseId)
			.success(function(data) {
				$scope.expense = data;
				$scope.gridOptions.data = data.detail;
				$scope.errorMessage = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
				$scope.loading = false;
			});		
	};

	Categories.get()
		.success(function(data) {
			$scope.categories = data;			
			$scope.errorMessage = null;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
			$scope.loading = false;
		});

	Accounts.get()
		.success(function(data) {
			$scope.accounts = data;			
			$scope.errorMessage = null;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
			$scope.loading = false;
		});

 	$scope.gridOptions = {
        enableSorting: true,
        paginationPageSizes: [10, 20],
        paginationPageSize: 10,
        columnDefs: [
          	{ name: 'Ações', type: 'string', width:'85', minWidth:'85', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
          		'<a class="btn btn-primary btn-xs" href="" ng-click="grid.appScope.open(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' + '&#32' +
          		'<a class="btn btn-primary btn-xs" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>',
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
          	},
          	{ name: 'Descrição', field: 'description', type: 'string', width:'22%', enableColumnMenu: false },
          	{ name: 'Valor', field: 'amount', type: 'number',  width: '9%', enableColumnMenu: false,
          		cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-right-align'
          	},
          	{ name: 'Conta', field: '_account.name', type: 'string', width:'15%', enableColumnMenu: false },
        	{ name: 'Categoria', field: '_category.name', type: 'string', width:'15%', enableColumnMenu: false },
        	{ name: 'Situação', field: 'status', type: 'string', width:'9%', enableColumnMenu: false,
        		headerCellClass: 'ui-grid-cell-right-align', cellClass:'ui-grid-cell-center-align'
        	}
        ]
    }; 		

  	$scope.openCalendarDialog = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();
    	$scope.opened = true;
  	};	

	$scope.submit = function () {
    	if ($scope.expenseForm.$valid) {
			$scope.expense._action = $scope.action;
			$modalInstance.close($scope.expense);
    	} else {
      		$scope.submitted = true;
    	}
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
};