'use strict';

var mongoose = require('mongoose');
var Accounts = require('../models/accountsModel');
var Categories = require('../models/categoriesModel');
var Incomes = require('../models/incomesModel');
var Expenses = require('../models/expensesModel');
var Transfers = require('../models/transfersModel');

function round2d(num) {
    return Math.round(num * 100) / 100;
}

function getData(dateFilter, callbackSuccess, callbackError) {
    var totals = {};

    //Accounts
    var accountsPromisse = Accounts.find().exec();
    accountsPromisse.then(function (accounts) {
        totals.accounts = accounts;

        //Categories
        var categoriesPromisse = Categories.find().exec();
        categoriesPromisse.then(function (categories) {
            totals.categories = categories;

            //Incomes
            var incomesTotal = Incomes.aggregate( [
                { $match: { account_id: { $ne: null }, dueDate: dateFilter } },
                { $group: { _id: { account_id: '$account_id', category_id: '$category_id', status: '$status' }, total: { $sum: '$amount' } } }
            ]).exec();

            incomesTotal.then(function(incomes) {
                totals.incomes = incomes;

                //Incomes detail
                var incomesDetailTotal = Incomes.aggregate( [
                    { $match: { account_id: null, dueDate: dateFilter } },
                    { $unwind: '$detail' },
                    { $group: { _id: { account_id: '$detail.account_id', category_id: '$category_id', status: '$status' }, total: { $sum: '$detail.amount' } } }

                ]).exec();

                incomesDetailTotal.then(function(incomesDetail) {
                    totals.incomesDetail = incomesDetail;

                    //Expenses
                    var expensesTotal = Expenses.aggregate( [
                        { $match: { account_id: { $ne: null }, dueDate: dateFilter } },
                        { $group: { _id: { account_id: '$account_id', category_id: '$category_id', status: '$status' }, total: { $sum: '$amount' } } }
                    ]).exec();

                    expensesTotal.then(function(expenses) {
                        totals.expenses = expenses;

                        //Expenses detail
                        var expensesDetailTotal = Expenses.aggregate( [
                            { $match: { account_id: null, dueDate: dateFilter } },
                            { $unwind: '$detail' },
                            { $group: { _id: { account_id: '$detail.account_id', category_id: '$category_id', status: '$status' }, total: { $sum: '$detail.amount' } } }
                        ]).exec();

                        expensesDetailTotal.then(function(expensesDetail) {
                            totals.expensesDetail = expensesDetail;

                            //Transfers origin
                            var transfersOriginTotal = Transfers.aggregate( [
                                { $match: { date: dateFilter } },
                                { $group: { _id: { account_id: '$accountOrigin_id' }, total: { $sum: '$amount' } } }
                            ]).exec();

                            transfersOriginTotal.then(function(transfersOrigin) {
                                totals.transfersOrigin = transfersOrigin;

                                //Transfers target
                                var transfersTargetTotal = Transfers.aggregate( [
                                    { $match: { date: dateFilter } },
                                    { $group: { _id: { account_id: "$accountTarget_id" }, total: { $sum: "$amount" } } }
                                ]).exec();

                                transfersTargetTotal.then(function(transfersTarget) {
                                    totals.transfersTarget = transfersTarget;

                                    callbackSuccess(totals);
                                });
                            });
                        });
                    });
                });
            });
        });
    })
    .then(null, function(error) {
        callbackError(error);
    });
}

function calculateTotals(totals, status, previous) {
    var obj = {};

    //Previous balance
    if (previous != null) {
        obj.previousBalance = round2d(previous.actualBalance);
    } else {
        obj.previousBalance = 0;
    }

    //Total income
    obj.totalIncomes = 0;
    totals.incomes.forEach(function (inc) {
        if ((status == 'all') || (status == 'completed' && inc._id.status == 'Recebido')) {
            obj.totalIncomes += round2d(inc.total);
        }
    });

    totals.incomesDetail.forEach(function (incDet) {
        if ((status == 'all') || (status == 'completed' && incDet._id.status == 'Recebido')) {
            obj.totalIncomes += round2d(incDet.total);
        }
    });

    //Total expense
    obj.totalExpenses = 0;
    totals.expenses.forEach(function (exp) {
        if ((status == 'all') || (status == 'completed' && exp._id.status == 'Pago')) {
            obj.totalExpenses += round2d(exp.total);
        }
    });

    totals.expensesDetail.forEach(function (expDet) {
        if ((status == 'all') || (status == 'completed' && expDet._id.status == 'Pago')) {
            obj.totalExpenses += round2d(expDet.total);
        }
    });

    //Actual Balance
    obj.totalIncomes = round2d(obj.totalIncomes);
    obj.totalExpenses = round2d(obj.totalExpenses);

    obj.actualBalance = round2d(obj.previousBalance + obj.totalIncomes - obj.totalExpenses);

    return obj;
}

function getAccountPreviousBalance(account, previous) {
    if (previous == null) {
        return account.initialBalance;
    }

    for (var i in previous.accounts) {
        if (String(previous.accounts[i]._id).valueOf() ===  String(account._id).valueOf()) {
            return previous.accounts[i].actualBalance;
        }
    };
}

function getAccountBalance(totals, account) {
    var accountBalance = account.initialBalance;

    console.log('Initial balance ' + account.name + ': ' + accountBalance);

    //Incomes
    for (var i in totals.incomes) {
        if (totals.incomes[i]._id.account_id == account._id) {
            console.log('incomes: ' + round2d(totals.incomes[i].total));
            accountBalance += round2d(totals.incomes[i].total);
        }
    }

    for (var i in totals.incomesDetail) {
        if (totals.incomesDetail[i]._id.account_id == account._id) {
            accountBalance += round2d(totals.incomesDetail[i].total);
        }
    }

    //Expenses
    for (var i in totals.expenses) {
        if (totals.expenses[i]._id.account_id == account._id) {
            console.log('expenses: ' + round2d(totals.expenses[i].total));
            accountBalance -= round2d(totals.expenses[i].total);
        }
    }

    for (var i in totals.expensesDetail) {
        if (totals.expensesDetail[i]._id.account_id == account._id) {
            accountBalance -= round2d(totals.expensesDetail[i].total);
        }
    }

    //Transfers
    for (var i in totals.transfersOrigin) {
        if (totals.transfersOrigin[i]._id.account_id == account._id) {
            console.log('transfersOrigin: ' + round2d(totals.transfersOrigin[i].total));
            accountBalance -= round2d(totals.transfersOrigin[i].total);
        }
    }

    for (var i in totals.transfersTarget) {
        if (totals.transfersTarget[i]._id.account_id == account._id) {
            console.log('transfersTarget: ' + round2d(totals.transfersTarget[i].total));
            accountBalance += round2d(totals.transfersTarget[i].total);
        }
    }

    return round2d(accountBalance);
}

function calculateAccountsBalace(totals, previous) {
    totals.accounts.forEach(function (account) {
        account.initialBalance = getAccountPreviousBalance(account, previous);
        account.actualBalance = getAccountBalance(totals, account);
    });

    return totals.accounts;
}

function getCategoryTotal(totals, category, status) {
    var totalAmount = 0;

    totals.incomes.forEach(function (inc) {
        if ((String(inc._id.category_id).valueOf() === String(category._id).valueOf()) && ((status == 'all') || (status == 'completed' && inc._id.status == 'Recebido'))) {
            totalAmount += round2d(inc.total);
        }
    });

    totals.incomesDetail.forEach(function (incDet) {
        if ((String(incDet._id.category_id).valueOf() === String(category._id).valueOf()) && ((status == 'all') || (status == 'completed' && incDet._id.status == 'Recebido'))) {
            totalAmount += round2d(incDet.total);
        }
    });

    totals.expenses.forEach(function (exp) {
        if ((String(exp._id.category_id).valueOf() === String(category._id).valueOf()) && ((status == 'all') || (status == 'completed' && exp._id.status == 'Pago'))) {
            totalAmount += round2d(exp.total);
        }
    });

    totals.expensesDetail.forEach(function (expDet) {
        if ((String(expDet._id.category_id).valueOf() === String(category._id).valueOf()) && ((status == 'all') || (status == 'completed' && expDet._id.status == 'Pago'))) {
            totalAmount += round2d(expDet.total);
        }
    });

    return round2d(totalAmount);
}

function calculateCategoriesTotal(totals, status) {
    var categories = [];
    totals.categories.forEach(function (cat) {
        var newCategory = { _id: cat._id, name: cat.name, type: cat.type };
        newCategory.totalAmount = getCategoryTotal(totals, cat, status);
        categories.push(newCategory);
    });

    return categories;
}

module.exports = {

    get: function(filter, callbackSuccess, callbackError) {
        var queryFilterPrevious, queryFilterCurrent;

        if ((filter != undefined) && (filter.dateBegin != undefined) && (filter.dateEnd != undefined)) {
            var dateBegin = new Date(filter.dateBegin);
            var dateEnd = new Date(filter.dateEnd);

            queryFilterPrevious = { $lt: dateBegin };
            queryFilterCurrent = { $gte: dateBegin, $lt: dateEnd };
        } else {
            callbackError('date filter is not definied');
        }

        getData(
            queryFilterPrevious,
            function(previousTotals) {
                console.log('############## previousTotals ##############');
                //console.log(queryFilterPrevious);
                //console.log(previousTotals);
                var result = { previous: { }, current: { } };
                result.previous.all = calculateTotals(previousTotals, 'all', null);
                result.previous.completed = calculateTotals(previousTotals, 'completed', null);
                result.previous.accounts = calculateAccountsBalace(previousTotals, null);

                getData(
                    queryFilterCurrent,
                    function(currentTotals) {
                        console.log('############## currentTotals ##############');
                        //console.log(queryFilterCurrent);
                        //console.log(currentTotals);
                        result.current.all = calculateTotals(currentTotals, 'all', result.previous.all);
                        result.current.all.categories = calculateCategoriesTotal(currentTotals, 'all');
                        result.current.completed = calculateTotals(currentTotals, 'completed', result.previous.completed);
                        result.current.completed.categories = calculateCategoriesTotal(currentTotals, 'completed');
                        result.current.accounts = calculateAccountsBalace(currentTotals, previousTotals);

                        callbackSuccess(result);
                    }
                )
            },
            function(error) {
                callbackError(error);
            }
        );
    }

}
