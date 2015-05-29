'use strict';

var app = angular.module('financeControl');

app.controller('categoriesController', function($scope, $http, $modal, Categories) {

	$scope.loading = true;
	$scope.errorMessage = '';

 	$scope.gridOptions = {
        enableSorting: true,
        paginationPageSizes: [10, 20],
        paginationPageSize: 10,
        columnDefs: [		
          	{ name: 'Nome', field: 'name', type: 'string', width:'61%' },
          	{ name: 'Tipo', field: 'type', type: 'string', width:'30%' },
          	{ name: 'Ações', type: 'string', enableSorting: false, enableColumnMenu: false, cellTemplate:
          		'<a class="" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg"></i></a> ' + 
          		'<a class="" href="" ng-click="grid.appScope.open(row.entity._id, \'edit\')"><i class="fa fa-pencil-square-o fa-lg"></i></a>',
          		 width: '9%' }
        ]
    }; 

	Categories.get()
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
  	$scope.open = function (categoryId, action) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/categoriesModal.html',
      		controller: categoriesModalController,
      		resolve: {
		        categoryId: function () {
					return categoryId; 
        		},
        		action: function () {
        			return action;
        		}
      		}
    	});

		modalInstance.result.then(function (category) {
	    	if (category._action == 'new') {
	    		$scope.createCategory(category);
	    	} else if (category._action == 'edit') {
	    		$scope.editCategory(category);
	    	}
		});
    };  

	// DELETE CONFIRMATION =====================================================
    $scope.deleteConfirmation = function (categoryId) {
    	
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        categoryId: function () {
					return categoryId; 
        		},      			
		        message: function () {
					return 'Confirma a exclusão da categoria?'; 
        		}
      		}
    	});

		modalInstance.result.then(function (id) {
	    	$scope.deleteCategory(id);
		}); 
    };  

	// GET =====================================================================
	$scope.getCategories = function() {
		Categories.get()
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
	$scope.createCategory = function(category) {
		$scope.loading = true;

		Categories.create(category)
			.success(function(data) {
				$scope.getCategories();					
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};

	// EDIT ====================================================================
	$scope.editCategory = function(category) {
		$scope.loading = true;

		Categories.patch(category._id, category)
			.success(function(data) {
				$scope.getCategories();					
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};	

	// DELETE ==================================================================
	$scope.deleteCategory = function(id) {
		$scope.loading = true;

		Categories.delete(id)
			.success(function(data) {			
				$scope.getCategories();
			})
			.error(function(data, status, headers, config) {
				$scope.errorMessage = 'Erro ao salvar os dados: ' + status;
				$scope.loading = false;
			});
	};

});