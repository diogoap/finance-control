'use strict';

function expensesModalController($scope, $uibModal, $uibModalInstance, uiGridConstants, Utils, Expenses, Categories, Accounts, Currencies, expenseId, action) {
	$scope.loading = true;
	$scope.expense = {};
	$scope.Utils = Utils;
	$scope.alerts = [];
	$scope.action = action;
	$scope.expenseStatus = ['Em aberto', 'Pago'];
	$scope.submitted = false;

	$scope.columns = [
		{
			name: 'Descrição', field: 'description', type: 'string', width: Utils.getSizeRes('28%', '28%', '35%'), enableColumnMenu: false,
			aggregationType: uiGridConstants.aggregationTypes.count, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue()}} registros</div>'
		},
		{
			name: 'Moeda', field: '_currency.currencyCode', type: 'string', width: Utils.getSizeRes('8%', '8%', '12%'), visible: Utils.getVisibilityRes(true, true, true), enableColumnMenu: false,
			headerCellClass: 'ui-grid-cell-center-align', cellClass: 'ui-grid-cell-center-align'
		},
		{
			name: 'Valor', field: 'amount', type: 'number', width: Utils.getSizeRes('11%', '11%', '14%'), enableColumnMenu: false,
			cellFilter: 'number:2', headerCellClass: 'ui-grid-cell-right-align', cellClass: 'ui-grid-cell-right-align',
			aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
			footerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-right-align" >{{col.getAggregationValue() | number:2 }}</div>'
		},
		{
			name: 'Conta', field: '_account.name', type: 'string', width: Utils.getSizeRes('21%', '21%', '25%'), enableColumnMenu: false
		},
		{
			name: 'Categoria', field: '_category.name', type: 'string', width: Utils.getSizeRes('21%', '21%', '0%'), visible: Utils.getVisibilityRes(true, true, false), enableColumnMenu: false
		},
		{
			name: 'Situação', field: 'status', type: 'string', width: Utils.getSizeRes('11%', '11%', '14%'), enableColumnMenu: false,
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

	if (action == 'new') {
		$scope.screenTitle = 'Adicionar despesa';
		$scope.expense = { dueDate: new Date(), status: 'Em aberto', amountPaid: 0, detail: new Array() };
		$scope.gridOptions.data = $scope.expense.detail;
		$scope._hasDetail = false;
		$scope.loading = false;
	}
	else {
		if (action == 'clone') {
			$scope.screenTitle = 'Clonar despesa';
		} else {
			$scope.screenTitle = 'Editar despesa';
		}

		Expenses.getById(expenseId)
			.then(function onSucess(response) {
				$scope.expense = response.data;

				//Need to generate a new to date in order to make date picker work
				$scope.expense.dueDate = new Date($scope.expense.dueDate);
				$scope._hasDetail = $scope.expense.detail.length > 0;
				$scope.gridOptions.data = response.data.detail;

				if (action == 'clone') {
					$scope.expense._id = null;

					var currentDate = $scope.expense.dueDate;
					var dueDateNextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
					$scope.expense.dueDate = dueDateNextMonth;
				}

				$scope.loading = false;
			})
			.catch(function onError(response) {
				Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
				$scope.loading = false;
			});
	};

	var filter = 'type=Despesa&enabled=true';
	Categories.get(filter)
		.then(function onSucess(response) {
			$scope.categories = response.data;
			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	var filter = 'enabled=true';
	Accounts.get(filter)
		.then(function onSucess(response) {
			$scope.accounts = response.data;
			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	Currencies.get(filter)
		.then(function onSucess(response) {
			$scope.currencies = response.data;

			if (action == 'new') {
				$scope.expense.currency_id = Utils.getDefaultCurrencyId(response.data);
			}

			$scope.loading = false;
		})
		.catch(function onError(response) {
			Utils.addError($scope, 'Erro ao carregar os dados: ' + response.status);
			$scope.loading = false;
		});

	$scope.openCalendarDialog = function ($event) {
		$scope.opened = true;
	};

	$scope.submit = function () {
		if ($scope.expenseForm.$valid) {
			$scope.updateExpenseTotal();
			$scope.expense._action = $scope.action;
			$uibModalInstance.close($scope.expense);
		} else {
			$scope.submitted = true;
		}
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.validExpenseAmountPaid = function (value) {
		if (($scope.expense != undefined) && ($scope.expense.status == 'Pago') && (value <= 0)) {
			return false;
		}

		return true;
	}

	$scope.updateExpenseTotal = function () {
		$scope._hasDetail = false;
		Utils.clearGridNav($scope.gridApi);
		$scope.selectedRow = null;

		$scope.expense.dueDate = Utils.getDateDst($scope.expense.dueDate);

		if (($scope.expense.detail != undefined) && ($scope.expense.detail.length > 0)) {
			$scope._hasDetail = true;

			$scope.expense.account_id = '';
			$scope.expense._account = null;

			$scope.expense.category_id = '';
			$scope.expense._category = null;

			$scope.expense.currency_id = '';
			$scope.expense._currency = null;

			$scope.expense.amount = 0;
			$scope.expense.amountPaid = 0;

			$scope.expense.detail.forEach(function (det) {
				$scope.expense.amount += det.amount;

				if (det.status == 'Pago') {
					$scope.expense.amountPaid += det.amount;
				}
			});

			if ($scope.expense.amount == $scope.expense.amountPaid) {
				$scope.expense.status = 'Pago';
			} else {
				$scope.expense.status = 'Em aberto';
			}
		}
	}

	$scope.openDetail = function (entity, action) {
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'html/expensesDetailModal.html',
			controller: expensesDetailModalController,
			resolve: {
				expenseDetail: function () {
					if (entity != undefined) {
						// Get object for selected detail
						var selDetail = $.grep($scope.expense.detail, function (e) { return e.$$hashKey == entity.$$hashKey });
						return selDetail[0];
					} else {
						return null;
					}
				},
				action: function () {
					return action;
				}
			}
		});

		modalInstance.result.then(function (expenseDetail) {
			if ((expenseDetail._action == 'new') || (expenseDetail._action == 'clone')) {
				$scope.expense.detail.push(expenseDetail);
				$scope.expense.detail.sort(Expenses.compare);
			} else if (expenseDetail._action == 'edit') {
				// Replace exising detail object with the new one
				for (var i in $scope.expense.detail) {
					if ($scope.expense.detail[i].$$hashKey == expenseDetail.$$hashKey) {
						delete expenseDetail.$$hashKey;
						$scope.expense.detail[i] = expenseDetail;
						$scope.expense.detail.sort(Expenses.compare);
						break;
					}
				}
			}

			$scope.updateExpenseTotal();
		});
	}

	$scope.deleteDetailConfirmation = function (entity) {
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'html/confirmModal.html',
			controller: confirmModalController,
			size: 'sm',
			resolve: {
				data: function () {
					return entity;
				},
				message: function () {
					return 'Confirma a exclusão do detalhe?';
				}
			}
		});

		modalInstance.result.then(function (entity) {
			for (var i in $scope.expense.detail) {
				if ($scope.expense.detail[i].$$hashKey == entity.$$hashKey) {
					$scope.expense.detail.splice(i, 1);
					break;
				}
			}

			$scope.updateExpenseTotal();
		});
	}

	$scope.payDetail = function (entity) {
		for (var i in $scope.expense.detail) {
			if ($scope.expense.detail[i].$$hashKey == entity.$$hashKey) {
				$scope.expense.detail[i].status = 'Pago';
				break;
			}
		}

		$scope.updateExpenseTotal();
	}

	$scope.formatNumericAmount = function (event) {
		$scope.expense.amount = Utils.formatPastedNumer(event);
	}

	$scope.formatNumericAmountPaid = function (event) {
		$scope.expense.amountPaid = Utils.formatPastedNumer(event);
	}

	$scope.onChangeExpenseStatus = function () {
		if ($scope.expense.status == 'Pago' && $scope.expense.amountPaid == 0) {
			$scope.expense.amountPaid = $scope.expense.amount;
		}
	}

};
