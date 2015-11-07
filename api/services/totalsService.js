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

function getCommonEntries(userId, callbackSuccess, callbackError) {
    var entries = {};
    var queryFilterUser = { user_id: userId };

    //Accounts
    var accountsPromisse = Accounts.find(queryFilterUser).sort('name').exec();
    accountsPromisse.then(function (accounts) {
        entries.accounts = accounts;

        //Categories
        var categoriesPromisse = Categories.find(queryFilterUser).sort('name').exec();
        categoriesPromisse.then(function (categories) {
            entries.categories = categories;

            callbackSuccess(entries);
        });
    })
    .then(null, function(error) {
        callbackError(error);
    });
}

function getData(userId, dateFilter, callbackSuccess, callbackError) {
    var totals = {};

    //Incomes
    var incomesTotal = Incomes.aggregate( [
        { $match: { account_id: { $ne: null }, dueDate: dateFilter, user_id: userId } },
        { $group: { _id: { account_id: '$account_id', category_id: '$category_id', status: '$status' }, total: { $sum: '$amount' }, totalReceived: { $sum: '$amountReceived'} } }
    ]).exec();

    incomesTotal.then(function(incomes) {
        totals.incomes = incomes;

        //Incomes detail
        var incomesDetailTotal = Incomes.aggregate( [
            { $match: { account_id: null, dueDate: dateFilter, user_id: userId } },
            { $unwind: '$detail' },
            { $group: { _id: { account_id: '$detail.account_id', category_id: '$detail.category_id', status: '$detail.status' }, total: { $sum: '$detail.amount' } } }

        ]).exec();

        incomesDetailTotal.then(function(incomesDetail) {
            totals.incomesDetail = incomesDetail;

            //Expenses
            var expensesTotal = Expenses.aggregate( [
                { $match: { account_id: { $ne: null }, dueDate: dateFilter, user_id: userId } },
                { $group: { _id: { account_id: '$account_id', category_id: '$category_id', status: '$status' }, total: { $sum: '$amount' }, totalPaid: { $sum: '$amountPaid'} } }
            ]).exec();

            expensesTotal.then(function(expenses) {
                totals.expenses = expenses;

                //Expenses detail
                var expensesDetailTotal = Expenses.aggregate( [
                    { $match: { account_id: null, dueDate: dateFilter, user_id: userId } },
                    { $unwind: '$detail' },
                    { $group: { _id: { account_id: '$detail.account_id', category_id: '$detail.category_id', status: '$detail.status' }, total: { $sum: '$detail.amount' } } }
                ]).exec();

                expensesDetailTotal.then(function(expensesDetail) {
                    totals.expensesDetail = expensesDetail;

                    //Transfers origin
                    var transfersOriginTotal = Transfers.aggregate( [
                        { $match: { date: dateFilter, user_id: userId } },
                        { $group: { _id: { account_id: '$accountOrigin_id' }, total: { $sum: '$amount' } } }
                    ]).exec();

                    transfersOriginTotal.then(function(transfersOrigin) {
                        totals.transfersOrigin = transfersOrigin;

                        //Transfers target
                        var transfersTargetTotal = Transfers.aggregate( [
                            { $match: { date: dateFilter, user_id: userId } },
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
        if (status == 'completed') {
            obj.totalIncomes += round2d(inc.totalReceived);
        } else {
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
        if (status == 'completed') {
            obj.totalExpenses += round2d(exp.totalPaid);
        } else {
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
    obj.partialBalance = round2d(obj.totalIncomes - obj.totalExpenses);
    obj.actualBalance = round2d(obj.previousBalance + obj.totalIncomes - obj.totalExpenses);

    return obj;
}

function getAccountPreviousBalance(account, previousAccountList) {
    if (previousAccountList == null) {
        return account.initialBalance;
    }

    for (var i in previousAccountList) {
        if (String(previousAccountList[i]._id).valueOf() ===  String(account._id).valueOf()) {
            return previousAccountList[i].actualBalance;
        }
    };
}

function getAccountBalance(totals, account, status) {
    var accountBalance = account.initialBalance;

    //Incomes
    totals.incomes.forEach(function (inc) {
        if (inc._id.account_id == account._id) {
            if (status == 'completed') {
                accountBalance += round2d(inc.totalReceived);
            } else {
                accountBalance += round2d(inc.total);
            }
        }
    });

    totals.incomesDetail.forEach(function (incDet) {
        if (incDet._id.account_id == account._id) {
            if ((status == 'all') || (status == 'completed' && incDet._id.status == 'Recebido')) {
                accountBalance += round2d(incDet.total);
            }
        }
    });

    //Expenses
    totals.expenses.forEach(function (exp) {
        if (exp._id.account_id == account._id) {
            if (status == 'completed') {
                accountBalance -= round2d(exp.totalPaid);
            } else {
                accountBalance -= round2d(exp.total);
            }
        }
    });

    totals.expensesDetail.forEach(function (expDet) {
        if (expDet._id.account_id == account._id) {
            if ((status == 'all') || (status == 'completed' && expDet._id.status == 'Pago')) {
                accountBalance -= round2d(expDet.total);
            }
        }
    });

    //Transfers
    totals.transfersOrigin.forEach(function (transOri) {
        if (transOri._id.account_id == account._id) {
            accountBalance -= round2d(transOri.total);
        }
    });

    totals.transfersTarget.forEach(function (transTar) {
        if (transTar._id.account_id == account._id) {
            accountBalance += round2d(transTar.total);
        }
    });

    return round2d(accountBalance);
}

function calculateAccountsBalace(accountList, totals, status, previousAccountList) {
    var newAccounts = [];
    accountList.forEach(function (account) {
        var newAccount = { _id: account._id, name: account.name };
        newAccount.initialBalance = getAccountPreviousBalance(account, previousAccountList);
        newAccount.actualBalance = getAccountBalance(totals, newAccount, status);
        newAccounts.push(newAccount);
    });

    return newAccounts;
}

function getCategoryTotal(totals, category, status) {
    var totalAmount = 0;

    totals.incomes.forEach(function (inc) {
        if (String(inc._id.category_id).valueOf() === String(category._id).valueOf()) {
            if (status == 'completed') {
                totalAmount += round2d(inc.totalReceived);
            } else {
                totalAmount += round2d(inc.total);
            }
        }
    });

    totals.incomesDetail.forEach(function (incDet) {
        if ((String(incDet._id.category_id).valueOf() === String(category._id).valueOf()) && ((status == 'all') || (status == 'completed' && incDet._id.status == 'Recebido'))) {
            totalAmount += round2d(incDet.total);
        }
    });

    totals.expenses.forEach(function (exp) {
        if (String(exp._id.category_id).valueOf() === String(category._id).valueOf()) {
            if (status == 'completed') {
                totalAmount += round2d(exp.totalPaid);
            } else {
                totalAmount += round2d(exp.total);
            }
        }
    });

    totals.expensesDetail.forEach(function (expDet) {
        if ((String(expDet._id.category_id).valueOf() === String(category._id).valueOf()) && ((status == 'all') || (status == 'completed' && expDet._id.status == 'Pago'))) {
            totalAmount += round2d(expDet.total);
        }
    });

    return round2d(totalAmount);
}

function calculateCategoriesTotal(categoriesList, totals, status) {
    var newCategories = [];
    categoriesList.forEach(function (cat) {
        var newCategory = { _id: cat._id, name: cat.name, type: cat.type };
        newCategory.totalAmount = getCategoryTotal(totals, cat, status);
        newCategories.push(newCategory);
    });

    return newCategories;
}

module.exports = {

    get: function(userId, filter, callbackSuccess, callbackError) {
        var queryFilterPrevious, queryFilterCurrent;

        if ((filter != undefined) && (filter.dateBegin != undefined) && (filter.dateEnd != undefined)) {
            var dateBegin = new Date(filter.dateBegin);
            var dateEnd = new Date(filter.dateEnd);

            queryFilterPrevious = { $lt: dateBegin };
            queryFilterCurrent = { $gte: dateBegin, $lt: dateEnd };
        } else {
            callbackError('date filter is not definied');
        }

        getCommonEntries(
            userId,
            function(entries) {
                getData(
                    userId,
                    queryFilterPrevious,
                    function(previousTotals) {
                        var res = { previous: { }, current: { } };
                        res.previous.all = calculateTotals(previousTotals, 'all', null);
                        res.previous.all.accounts = calculateAccountsBalace(entries.accounts, previousTotals, 'all', null);
                        res.previous.completed = calculateTotals(previousTotals, 'completed', null);
                        res.previous.completed.accounts = calculateAccountsBalace(entries.accounts, previousTotals, 'completed', null);

                        getData(
                            userId,
                            queryFilterCurrent,
                            function(currentTotals) {
                                res.current.all = calculateTotals(currentTotals, 'all', res.previous.all);
                                res.current.all.categories = calculateCategoriesTotal(entries.categories, currentTotals, 'all');
                                res.current.all.accounts = calculateAccountsBalace(entries.accounts, currentTotals, 'all', res.previous.all.accounts);
                                res.current.completed = calculateTotals(currentTotals, 'completed', res.previous.completed);
                                res.current.completed.categories = calculateCategoriesTotal(entries.categories, currentTotals, 'completed');
                                res.current.completed.accounts = calculateAccountsBalace(entries.accounts, currentTotals, 'completed', res.previous.completed.accounts);

                                callbackSuccess(res);
                            }
                        )
                    }
                )
            },
            function(error) {
                callbackError(error);
            }
        );
    }

}
