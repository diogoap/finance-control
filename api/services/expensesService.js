'use strict';

var Expenses = require('../models/expensesModel');
var Categories = require('../models/categoriesModel');
var Accounts = require('../models/accountsModel');
var Currencies = require('../models/currenciesModel');
var Validator = require('jsonschema').Validator;

var expenseSchema = {
    "description": "Expense model validation.",
    "type": "object",
    "properties": {
        "description": { "type": "string", "minLength": 3, "maxLength": 100 },
        "dueDate": { "type": "datetime" },
        "scheduledPayment": { "type": "boolean" },
        "amount": { "type": "number", "minimum": 0, "exclusiveMinimum": true },
        "category_id": { "type": "string" },
        "account_id": { "type": "string" },
        "amountPaid": { "type": "number", "minimum": 0 },
        "status": { "type": "string", "enum": ["Em aberto", "Pago"] },
        "notes": { "type": "string" },
        "user_id": { "type": "string" },
        "currency_id": { "type": "string" },
        "detail": {
            "description": "Expenses detail list",
            "type": "array",
            "items": {
                "description": "Expense detail",
                "type": "object",
                "properties": {
                    "description": { "type": "string", "minLength": 1, "maxLength": 100 },
                    "amount": { "type": "number", "minimum": 0, "exclusiveMinimum": true },
                    "category_id": { "type": "string" },
                    "account_id": { "type": "string" },
                    "status": { "type": "string", "enum": ["Em aberto", "Pago"] },
                    "currency_id": { "type": "string" }
                },
                "required": ["description", "category_id", "account_id", "status", "amount", "currency_id"]
            }
        }
    },
    "required": ["description", "dueDate", "status", "amount", "user_id"],
    "anyOf": [
        { "required": ["account_id", "category_id", "currency_id"] },
        {
            "properties": { "detail": { "minItems": 1 } },
            "required": ["detail"]
        }
    ],
    "oneOf": [
        { "properties": { "status": { "enum": ["Em aberto"] } } },
        {
            "properties": {
                "amountPaid": { "minimum": 0, "exclusiveMinimum": true },
                "status": { "enum": ["Pago"] }
            },
            "required": ["amountPaid"]
        }
    ]
};

function setCategory(categoryList, obj) {
    for (var j in categoryList) {
        if (obj.category_id == categoryList[j].id) {
            obj._category = categoryList[j];
            break;
        }
    }
}

function setAccount(accountList, obj) {
    for (var j in accountList) {
        if (obj.account_id == accountList[j].id) {
            obj._account = accountList[j];
            break;
        }
    }
}

function setCurrencies(currencyList, obj) {
    for (var j in currencyList) {
        if (obj.currency_id == currencyList[j].id) {
            obj._currency = currencyList[j];
            break;
        }
    }
}

function fillDetailAccountsCategoriesCurrencies(expense) {
    if ((expense.detail != undefined) && (expense.detail.length > 0)) {
        expense._accountNames = '';
        expense._categoryNames = '';
        expense._currencyCodes = '';

        expense.detail.forEach(function (det) {

            if (expense._accountNames.indexOf(det._account.name) == -1) {
                if (expense._accountNames.length > 0) {
                    expense._accountNames += ' - ';
                }
                expense._accountNames += det._account.name;
            }

            if (expense._categoryNames.indexOf(det._category.name) == -1) {
                if (expense._categoryNames.length > 0) {
                    expense._categoryNames += ' - ';
                }
                expense._categoryNames += det._category.name;
            }

            if (det._currency != undefined) {
                if (expense._currencyCodes.indexOf(det._currency.currencyCode) == -1) {
                    if (expense._currencyCodes.length > 0) {
                        expense._currencyCodes += ' - ';
                    }
                    expense._currencyCodes += det._currency.currencyCode;
                }
            }
        });
    } else {
        expense._accountNames = expense._account.name;
        expense._categoryNames = expense._category.name;

        if (expense._currency != undefined) {
            expense._currencyCodes = expense._currency.currencyCode;
        }
    }
}

function updateExpenseTotal(expense) {
    if ((expense.detail != undefined) && (expense.detail.length > 0)) {
        expense.account_id = null;
        expense._account = null;

        expense.category_id = null;
        expense._category = null;

        expense.currency_id = null;
        expense._currency = null;

        expense.amount = 0;
        expense.amountPaid = 0;

        expense.detail.forEach(function (det) {
            expense.amount += det.amount;

            if (det.status == 'Pago') {
                expense.amountPaid += det.amount;
            }
        });

        if (expense.amount == expense.amountPaid) {
            expense.status = 'Pago';
        } else {
            expense.status = 'Em aberto';
        }
    }
}

function payExpense(expense) {
    expense.status = 'Pago';
    expense.amountPaid = expense.amount;

    if ((expense.detail != undefined) && (expense.detail.length > 0)) {
        expense.detail.forEach(function (det) {
            det.status = 'Pago';
        })
    }
}

module.exports = {

    getById: function (id, callbackSuccess, callbackError) {
        var expensePromisse = Expenses.findById(id);
        expensePromisse.then(function (expense) {
            if (expense == undefined) {
                callbackError('not found', 404);
            }

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    var currenciesPromisse = Currencies.find().exec();
                    currenciesPromisse.then(function (currencies) {

                        setCategory(categories, expense);
                        setAccount(accounts, expense);
                        setCurrencies(currencies, expense);

                        expense.detail.forEach(function (det) {
                            setCategory(categories, det);
                            setAccount(accounts, det);
                            setCurrencies(currencies, expense);
                        });

                        fillDetailAccountsCategoriesCurrencies(expense);

                        callbackSuccess(expense);
                    });
                });
            });
        })
            .then(null, function (error) {
                callbackError(error, 400);
            });
    },

    get: function (userId, filter, callbackSuccess, callbackError) {
        var queryFilter = {};

        if ((filter != undefined) && (filter.dateBegin != undefined) && (filter.dateEnd != undefined)) {
            var dateBegin = new Date(filter.dateBegin);
            var dateEnd = new Date(filter.dateEnd);

            queryFilter.dueDate = { $gte: dateBegin, $lt: dateEnd };
        }

        queryFilter.user_id = userId;

        var expensesPromisse = Expenses.aggregate([
            { $match: { dueDate: queryFilter.dueDate, user_id: queryFilter.user_id } },
            {
                $project: {
                    description: "$description", dueDate: "$dueDate", scheduledPayment: "$scheduledPayment",
                    amount: "$amount", category_id: "$category_id", account_id: "$account_id", currency_id: "$currency_id",
                    amountPaid: "$amountPaid", status: "$status", notes: "$notes", user_id: "$user_id", detail: "$detail",
                    dueDateOnlyDate: { $dateToString: { format: "%Y-%m-%d", date: "$dueDate" } }
                }
            },
            { $sort: { dueDateOnlyDate: 1, description: 1 } }
        ]).exec();

        expensesPromisse.then(function (expenses) {

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    var currenciesPromisse = Currencies.find().exec();
                    currenciesPromisse.then(function (currencies) {

                        expenses.forEach(function (exp) {
                            setCategory(categories, exp);
                            setAccount(accounts, exp);
                            setCurrencies(currencies, exp);

                            exp.detail.forEach(function (det) {
                                setCategory(categories, det);
                                setAccount(accounts, det);
                                setCurrencies(currencies, det);
                            });

                            fillDetailAccountsCategoriesCurrencies(exp);
                        });

                        callbackSuccess(expenses);
                    });
                });
            });
        })
            .then(null, function (error) {
                callbackError(error);
            });
    },

    create: function (userId, expense, callbackSuccess, callbackError) {
        expense.user_id = userId;
        var val = new Validator().validate(expense, expenseSchema);

        if (val.errors.length == 0) {
            updateExpenseTotal(expense);
            var expensesPromisse = Expenses.create(expense);

            expensesPromisse.then(function () {
                callbackSuccess();
            })
                .then(null, function (error) {
                    callbackError(error, 400);
                });
        } else {
            callbackError(val.errors, 400)
        }
    },

    delete: function (id, callbackSuccess, callbackError) {
        var expensesPromisse = Expenses.remove(id);

        expensesPromisse.then(function () {
            callbackSuccess();
        })
            .then(null, function (error) {
                callbackError(error, 400);
            });
    },

    edit: function (id, expense, callbackSuccess, callbackError) {
        var val = new Validator().validate(expense, expenseSchema);

        if (val.errors.length == 0) {
            updateExpenseTotal(expense);
            var expensesPromisse = Expenses.findByIdAndUpdate(id, expense, { new: true });

            expensesPromisse.then(function (expenseEdited) {
                if (expenseEdited == null) {
                    callbackError('not found', 404);
                } else {
                    callbackSuccess(expenseEdited);
                }
            })
                .then(null, function (error) {
                    callbackError(error, 400);
                });
        } else {
            callbackError(val.errors, 400)
        }
    },

    pay: function (id, callbackSuccess, callbackError) {
        var expenseFindPromisse = Expenses.findById(id);
        expenseFindPromisse.then(function (expense) {
            if (expense != undefined) {
                payExpense(expense);

                expense.save(function (error, raw) {
                    if (error) {
                        callbackError(error, 400)
                    };

                    callbackSuccess();
                });
            } else {
                callbackError('not found', 404);
            };
        })
            .then(null, function (error) {
                callbackError(error, 400);
            });
    }

}
