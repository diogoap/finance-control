'use strict';

var app = angular.module('financeControl');

app.controller('categoriesController', function($scope, $http, $modal, $locale, uiGridConstants, Utils, Categories) {

 	$scope.columns = [
        { name: 'Ações', type: 'string', width:'75', minWidth:'75', enableColumnResizing: false, enableSorting: false, enableColumnMenu: false, cellTemplate:
            '<a class="btn btn-primary btn-xs btn-grid" title="Editar" href="" ng-click="grid.appScope.openModal(row.entity._id, \'edit\')"><i class="fa fa-pencil fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Inativar" ng-show="row.entity.enabled == true" href="" ng-click="grid.appScope.enableDisableConfirmation(row.entity._id, false)"><i class="fa fa-times fa-lg fa-fw"></i></a>' +
            '<a class="btn btn-primary btn-xs btn-grid" title="Ativar" ng-show="row.entity.enabled == false" href="" ng-click="grid.appScope.enableDisableConfirmation(row.entity._id, true)"><i class="fa fa-check fa-lg fa-fw"></i></a>',
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

    $scope.enableDisableConfirmation = function (categoryId, enable) {
    	var modalInstance = $modal.open({
      		animation: $scope.animationsEnabled,
      		templateUrl: 'html/confirmModal.html',
      		controller: confirmModalController,
      		size: 'sm',
      		resolve: {
		        data: function () {
					return { id: categoryId, enable: enable };
        		},
		        message: function () {
                    if (enable) {
                        return 'Confirma a ativação da categoria?';
                    } else {
                        return 'Confirma a inativação da categoria?';
                    }
        		}
      		}
    	});

		modalInstance.result.then(function (params) {
	    	$scope.enableDisableCategory(params.id, params.enable);
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

    $scope.enableDisableCategory = function(id, enable) {
		$scope.loading = true;

        Categories.getById(id)
			.success(function(category) {

                category.enabled = enable;

                Categories.patch(category._id, category)
        			.success(function(data) {
                        if (enable) {
                            Utils.addSucess($scope, 'Categoria ativada com sucesso!');
                        } else {
                            Utils.addSucess($scope, 'Categoria inativada com sucesso!');
                        }

        				$scope.getCategories();
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
	};


	// initialization
    $scope.Utils = Utils;
    $scope.alerts = [];
    $scope.listDisabledCategories = false;
	$scope.getCategories();
});
