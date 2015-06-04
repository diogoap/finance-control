'use strict';

var app = angular.module('financeControl');

app.controller('accountsController', function($scope, $http, $modal, Accounts) {

	$scope.loading = true;
	$scope.errorMessage = '';

 	$scope.gridOptions = {
        enableSorting: true,
        paginationPageSizes: [10, 20],
        paginationPageSize: 10,
        columnDefs: [		
          	{ name: 'Nome', field: 'name', type: 'string', width:'61%' },
          	{ name: 'Saldo inicial', field: 'initialBalance', type: 'number', width:'30%' },
          	{ name: 'Ações', type: 'string', enableSorting: false, enableColumnMenu: false, cellTemplate:
          		'<a class="" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg"></i></a> ' + 
          		'<a class="" href="" ng-click="grid.appScope.open(row.entity._id, \'edit\')"><i class="fa fa-pencil-square-o fa-lg"></i></a>',
          		 width: '9%' }
        ]
    }; 

	Accounts.get()
		.success(function(data) {
			$scope.gridOptions.data = data;
			$scope.errorMessage = null;
			$scope.loading = false;
		})
		.error(function(data, status, headers, config) {
			$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
			$scope.loading = false;
		});

	// OPEN MODAL ==============================================================
  	$scope.open = function (accountId, action) {
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

	// DELETE CONFIRMATION =====================================================
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

	// GET =====================================================================
	$scope.getAccounts = function() {
		Accounts.get()
			.success(function(data) {
				$scope.gridOptions.data = data;			
				$scope.errorMessage = null;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao carregar os dados: ' + status;
				$scope.loading = false;
			}); 		
	};

	// CREATE ==================================================================
	$scope.createAccount = function(account) {
		$scope.loading = true;

		Accounts.create(account)
			.success(function(data) {
				$scope.getAccounts();					
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};

	// EDIT ====================================================================
	$scope.editAccount = function(account) {
		$scope.loading = true;

		Accounts.patch(account._id, account)
			.success(function(data) {
				$scope.getAccounts();					
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};	

	// DELETE ==================================================================
	$scope.deleteAccount = function(id) {
		$scope.loading = true;

		Accounts.delete(id)
			.success(function(data) {			
				$scope.getAccounts();
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};

});