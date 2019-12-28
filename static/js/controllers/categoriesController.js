'use strict';

var app = angular.module('financeControl');

app.controller('categoriesController', function ($scope, $http, $uibModal, $locale, uiGridConstants, Utils, Categories) {

	$scope.columns = [
		{
			name: 'Nome', field: 'name', type: 'string', width: Utils.getSizeRes('64%', '58%', '58%'), enableColumnMenu: false,
			aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
		},
		{
			name: 'Tipo', field: 'type', type: 'string', width: Utils.getSizeRes('24%', '27%', '27%'), enableColumnMenu: false
		},
		{
			name: 'Ativa?', field: 'enableed', type: 'string', width: Utils.getSizeRes('12%', '15%', '15%'), enableColumnMenu: false,
			cellTemplate: '<input type="checkbox" onclick="return false" ng-model="row.entity.enabled">',
			headerCellClass: 'ui-grid-cell-center-align', cellClass: 'ui-grid-cell-center-align'
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
		onRegisterApi: function (gridApi) {
			$scope.gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope, function (row) {
				$scope.selectedRow = row;
			});
			gridApi.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
				$scope.gridApi.selection.selectRow(newRowCol.row.entity);
			});
		}
	};

	$scope.getFilter = function () {
		if ($scope.listDisabledCategories == false) {
			return 'enabled=true';
		}
		return undefined;
	}

	$scope.openModal = function (categoryId, action) {
		var modalInstance = $uibModal.open({
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
		var modalInstance = $uibModal.open({
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

	$scope.getCategories = function () {
		$scope.loading = true;

		var filter = $scope.getFilter();

		Categories.get(filter)
			.then(function onSucess(response) {
				$scope.gridOptions.data = response.data;
				Utils.clearGridNav($scope.gridApi);
				$scope.selectedRow = null;
				$scope.loading = false;
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	$scope.createCategory = function (category) {
		$scope.loading = true;

		Categories.create(category)
			.then(function onSucess() {
				Utils.addSucess($scope, 'Categoria adicionada com sucesso!');
				$scope.getCategories();
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	$scope.editCategory = function (category) {
		$scope.loading = true;

		Categories.patch(category._id, category)
			.then(function onSucess() {
				Utils.addSucess($scope, 'Categoria editada com sucesso!');
				$scope.getCategories();
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao salvar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	$scope.enableDisableCategory = function (id, enable) {
		$scope.loading = true;

		Categories.getById(id)
			.then(function onSucess(response) {

				let category = response.data
				category.enabled = enable;

				Categories.patch(category._id, category)
					.then(function onSucess() {
						if (enable) {
							Utils.addSucess($scope, 'Categoria ativada com sucesso!');
						} else {
							Utils.addSucess($scope, 'Categoria inativada com sucesso!');
						}

						$scope.getCategories();
					})
					.catch(function onError(response) {
						Utils.addError($scope, 'Erro ao salvar os dados: ' + response.status);
						$scope.loading = false;
					});
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
				$scope.loading = false;
			});
	};


	// initialization
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.listDisabledCategories = false;
	$scope.getCategories();
});
