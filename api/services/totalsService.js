'use strict';

var mongoose = require('mongoose');
var Accounts = require('../models/accountsModel');
var Incomes = require('../models/incomesModel');
var Expenses = require('../models/expensesModel');
var Transfers = require('../models/transfersModel');

function getData(callbackSuccess, callbackError) {
    var totals = {};

    //Accounts
    var accountsPromisse = Accounts.find().exec();
    accountsPromisse.then(function (accounts) {
        totals.accounts = accounts;

        //Incomes
        var incomesTotal = Incomes.aggregate( [
            { $match: { account_id: { $ne: null } } },
            { $group: { _id: { account_id: '$account_id', status: '$status' }, total: { $sum: '$amount' } } }
        ]).exec();

        incomesTotal.then(function(incomes) {
            totals.incomes = incomes;

            //Incomes detail
            var incomesDetailTotal = Incomes.aggregate( [
                { $match: { account_id: null } },
                { $unwind: '$detail' },
                { $group: { _id: { account_id: '$detail.account_id', status: '$status' }, total: { $sum: '$detail.amount' } } }

            ]).exec();

            incomesDetailTotal.then(function(incomesDetail) {
                totals.incomesDetail = incomesDetail;

                //Expenses
                var expensesTotal = Expenses.aggregate( [
                    { $match: { account_id: { $ne: null } } },
                    { $group: { _id: { account_id: '$account_id', status: '$status' }, total: { $sum: '$amount' } } }
                ]).exec();

                expensesTotal.then(function(expenses) {
                    totals.expenses = expenses;

                    //Expenses detail
                    var expensesDetailTotal = Expenses.aggregate( [
                        { $match: { account_id: { $ne: null } } },
                        { $unwind: '$detail' },
                        { $group: { _id: { account_id: '$detail.account_id', status: '$status' }, total: { $sum: '$detail.amount' } } }
                    ]).exec();

                    expensesDetailTotal.then(function(expensesDetail) {
                        totals.expensesDetail = expensesDetail;

                        //Transfers origin
                        var transfersOriginTotal = Transfers.aggregate( [
                            { $group: { _id: { account_id: '$accountOrigin_id' }, total: { $sum: '$amount' } } }
                        ]).exec();

                        transfersOriginTotal.then(function(transfersOrigin) {
                            totals.transfersOrigin = transfersOrigin;

                            //Transfers target
                            var transfersTargetTotal = Transfers.aggregate( [
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
    })
    .then(null, function(error) {
        callbackError(error);
    });
}

function calculateTotals(totals, status) {
    var obj = {};

    //Total income
    obj.totalIncomes = 0;
    totals.incomes.forEach(function (inc) {
        if ((status == 'all') || (status == 'completed' && inc._id.status == 'Recebido')) {
            obj.totalIncomes += inc.total;
        }
    });

    totals.incomesDetail.forEach(function (incDet) {
        if ((status == 'all') || (status == 'completed' && incDet._id.status == 'Recebido')) {
            obj.totalIncomes += incDet.total;
        }
    });

    //Total expense
    obj.totalExpenses = 0;
    totals.expenses.forEach(function (exp) {
        if ((status == 'all') || (status == 'completed' && exp._id.status == 'Pago')) {
            obj.totalExpenses += exp.total;
        }
    });

    totals.expensesDetail.forEach(function (expDet) {
        if ((status == 'all') || (status == 'completed' && expDet._id.status == 'Pago')) {
            obj.totalExpenses += expDet.total;
        }
    });

    //Balance
    obj.totalBalance = obj.totalIncomes - obj.totalExpenses;

    return obj;
}

function getAccountBalance(totals, account) {
    var accountBalance = 0;

    //Incomes
    for (var i in totals.incomes) {
        if (totals.incomes[i]._id.account_id == account._id) {
            console.log('incomes: ' + totals.incomes[i].total);
            accountBalance += totals.incomes[i].total;
        }
    }

    for (var i in totals.incomesDetail) {
        if (totals.incomesDetail[i]._id.account_id == account._id) {
            accountBalance += totals.incomesDetail[i].total;
        }
    }

    //Expenses
    for (var i in totals.expenses) {
        if (totals.expenses[i]._id.account_id == account._id) {
            console.log('expenses: ' + totals.expenses[i].total);
            accountBalance -= totals.expenses[i].total;
        }
    }

    for (var i in totals.expensesDetail) {
        if (totals.expensesDetail[i]._id.account_id == account._id) {
            accountBalance -= totals.expensesDetail[i].total;
        }
    }

    //Transfers
    for (var i in totals.transfersOrigin) {
        if (totals.transfersOrigin[i]._id.account_id == account._id) {
            console.log('transfersOrigin: ' + totals.transfersOrigin[i].total);
            accountBalance -= totals.transfersOrigin[i].total;
        }
    }

    for (var i in totals.transfersTarget) {
        if (totals.transfersTarget[i]._id.account_id == account._id) {
            console.log('transfersTarget: ' + totals.transfersTarget[i].total);
            accountBalance += totals.transfersTarget[i].total;
        }
    }

    console.log(account.name + ': ' + accountBalance);
    return accountBalance;
}

function calculateAccountsBalace(totals) {
    totals.accounts.forEach(function (account) {
        account.actualBalance = getAccountBalance(totals, account);
    });

    return totals.accounts;
}

module.exports = {

    get: function(callbackSuccess, callbackError) {
        getData(
            function(totals) {
                var result = {};
                result.all = calculateTotals(totals, 'all');
                result.completed = calculateTotals(totals, 'completed');
                result.accounts = calculateAccountsBalace(totals);

                callbackSuccess(result);
            },
            function(error) {
                callbackError(error);
            }
        );
    }

}
