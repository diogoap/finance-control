var app = angular.module('categoriesModule', ['categoriesService', 'ui.bootstrap', 'ui.grid', 'ui.grid.pagination', 'ngDialog']);

app.controller('categoriesController', function($scope, $http, $modal, Categories, ngDialog) {
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
          		'<a class="" href="#" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg"></i></a> ' + 
          		'<a class="" href="#" ng-click="grid.appScope.open(row.entity._id, \'edit\')"><i class="fa fa-pencil-square-o fa-lg"></i></a>',
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
        var dialog = ngDialog.open({
        	template: 'html/categoriesModal.html',
        	controller: categoriesModalController,
        	scope: $scope,
      		resolve: {
		        categoryId: function () {
					return categoryId; 
        		},
        		action: function () {
        			return action;
        		}
      		}        	
         });

		dialog.closePromise.then(function (data) {
	    	if (data.value._action == 'new') {
		    	$scope.createCategory(data.value);
	    	} else if (data.value._action == 'edit') {
		    	$scope.editCategory(data.value);
	    	}  
        });			
    };   	 

	// DELETE CONFIRMATION =====================================================
    $scope.deleteConfirmation = function (id) {
        $scope.modalConfirmMessage = 'Confirma a exclusão da categoria?';
        ngDialog.openConfirm({
        	template: 'html/confirmDialogModal.html',
        	className: 'ngdialog-theme-default',
        	scope: $scope
         }).then(function(value) {
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