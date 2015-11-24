'use strict';

var app = angular.module('financeControl');

app.controller('categoriesController', function($scope, $http, $modal, $locale, uiGridConstants, Utils, Categories) {

 	$scope.columns = [
        { name: 'Ações', type: 'string', width:'75', minWidth:'75', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
            '<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Excluir" href="" ng-click="grid.appScope.deleteConfirmation(row.entity._id)"><i class="fa fa-trash-o fa-lg fa-fw"></i></a>',
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-left-align'
        },
        {
            name: 'Nome', field: 'name', type: 'string', width:'55%', enableColumnMenu: false,
            aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
        },
        { name: 'Tipo', field: 'type', type: 'string', width:'25%', enableColumnMenu: false },
        { name: 'Ativa?', field: 'enableed', type: 'string', width:'10%', enableColumnMenu: false,
            cellTemplate: '<input type="checkbox" onclick="return false" ng-model="row.entity.enabled">',
            headerCellClass: 'ui-grid-cell-center-align', cellClass:'ui-grid-cell-center-align'
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

    $scope.getFilter = function() {
        if ($scope.listDisabledCategories == false) {
            return 'enabled=true';
        }
        return undefined;
	}

  	$scope.openModal = function (categoryId, action) {
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

    $scope.deleteConfirmation = function (categoryId) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
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

	$scope.getCategories = function() {
        $scope.loading = true;

		var filter = $scope.getFilter();

        Categories.get(filter)
			.success(function(data) {
				$scope.gridOptions.data = data;
				$scope.loading = false;
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.createCategory = function(category) {
		$scope.loading = true;

		Categories.create(category)
			.success(function(data) {
			    Utils.addSucess($scope, 'Categoria adicionada com sucesso!');
				$scope.getCategories();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.editCategory = function(category) {
		$scope.loading = true;

		Categories.patch(category._id, category)
			.success(function(data) {
			    Utils.addSucess($scope, 'Categoria editada com sucesso!');
				$scope.getCategories();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	$scope.deleteCategory = function(id) {
		$scope.loading = true;

		Categories.delete(id)
			.success(function(data) {
			    Utils.addSucess($scope, 'Categoria excluída com sucesso!');
				$scope.getCategories();
			})
			.error(function(data, status, headers, config) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + status);
				$scope.loading = false;
			});
	};

	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
    $scope.listDisabledCategories = false;
	$scope.getCategories();
});
