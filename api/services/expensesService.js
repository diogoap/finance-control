'use strict';

var Expenses = require('../models/expensesModel');
var Categories = require('../models/categoriesModel');
var Accounts = require('../models/accountsModel');
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
        "amountPaid": { "type": "number", "minimum": 0, "exclusiveMinimum": false },
        "status": { "type": "string", "enum": [ "Em aberto", "Pago" ] },
        "notes": { "type": "string" },
        "isLatePayment": { "type": "boolean" },
        "user_id": { "type": "string" },
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
                    "status": { "type": "string", "enum": [ "Em aberto", "Pago" ] }
                },
                "required": [ "description", "category_id", "account_id", "status", "amount" ]
            }
        }
    },
    "required": [ "description", "dueDate", "status", "amount", "user_id" ],
    "anyOf": [
        { "required": [ "account_id", "category_id" ] },
        {
            "properties": { "detail": { "minItems": 1 } },
            "required": ["detail"]
        }
    ],
    "oneOf": [
        { "properties": { "status": { "enum": [ "Em aberto" ] } } },
        {
            "properties": {
                "amountPaid": { "minimum": 0, "exclusiveMinimum": true },
                "status": { "enum": [ "Pago" ] }
            },
            "required": [ "amountPaid" ]
        }
    ]
};

function fillProperties(obj) {
    var today = new Date(), y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    today = new Date(y, m, d, 0, 0, 0, 0);
    obj.isLatePayment = (obj.status == 'Em aberto' && obj.dueDate < today);
}

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

function fillDetailAccountsAndCategories(expense) {
    if ((expense.detail != undefined) && (expense.detail.length > 0)) {
        expense._accountNames = '';
        expense._categoryNames = '';

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
        });
    } else {
        expense._accountNames = expense._account.name;
        expense._categoryNames = expense._category.name;
    }
}

function updateExpenseTotal(expense) {
    if ((expense.detail != undefined) && (expense.detail.length > 0)) {
        expense.account_id = null;
        expense._account = null;

        expense.category_id = null;
        expense._category = null;

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
        expense.detail.forEach(function(det) {
            det.status = 'Pago';
        })
    }
}

module.exports = {

    getById: function(id, callbackSuccess, callbackError) {
        var expensePromisse = Expenses.findById(id);
        expensePromisse.then(function(expense) {
            if (expense == undefined) {
                callbackError('not found', 404);
            }

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    setCategory(categories, expense);
                    setAccount(accounts, expense);
                    fillProperties(expense);

                    expense.detail.forEach(function (det) {
                        setCategory(categories, det);
                        setAccount(accounts, det);
                    });

                    fillDetailAccountsAndCategories(expense);

                    callbackSuccess(expense);
                });
            });
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    get: function(userId, filter, callbackSuccess, callbackError) {
        var queryFilter = {};

        if ((filter != undefined) && (filter.dueDateBegin != undefined) && (filter.dueDateEnd != undefined)) {
            queryFilter.dueDate = { $gte: filter.dueDateBegin, $lt: filter.dueDateEnd };
        }

        queryFilter.user_id = userId;

        var expensesPromisse = Expenses.find(queryFilter).sort('dueDate').exec();
        expensesPromisse.then(function (expenses) {

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    expenses.forEach(function (exp) {
                        setCategory(categories, exp);
                        setAccount(accounts, exp);
                        fillProperties(exp);

                        exp.detail.forEach(function (det) {
                            setCategory(categories, det);
                            setAccount(accounts, det);
                        });

                        fillDetailAccountsAndCategories(exp);
                    });

                    callbackSuccess(expenses);
                });
            });
        })
        .then(null, function(error) {
            callbackError(error);
        });
    },

    create: function(userId, expense, callbackSuccess, callbackError) {
        expense.user_id = userId;
        var val = new Validator().validate(expense, expenseSchema);

        if (val.errors.length == 0) {
            updateExpenseTotal(expense);
            var expensesPromisse = Expenses.create(expense);

            expensesPromisse.then(function () {
                callbackSuccess();
            })
            .then(null, function(error) {
                callbackError(error, 400);
            });
        } else {
            callbackError(val.errors, 400)
        }
    },

    delete: function(id, callbackSuccess, callbackError) {
        var expensesPromisse = Expenses.remove(id);

        expensesPromisse.then(function () {
            callbackSuccess();
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    edit: function(id, expense, callbackSuccess, callbackError) {
        var val = new Validator().validate(expense, expenseSchema);

        if (val.errors.length == 0) {
            updateExpenseTotal(expense);
            var expensesPromisse = Expenses.findByIdAndUpdate(id, expense, { new: true });

            expensesPromisse.then(function(expenseEdited) {
				if (expenseEdited == null) {
					callbackError('not found', 404);
				} else {
    				callbackSuccess(expenseEdited);
                }
            })
            .then(null, function(error) {
                callbackError(error, 400);
            });
        } else {
            callbackError(val.errors, 400)
        }
    },

    pay: function(id, callbackSuccess, callbackError) {
        var expenseFindPromisse = Expenses.findById(id);
        expenseFindPromisse.then(function (expense) {
            if (expense != undefined) {
                payExpense(expense);

                expense.save(function(error, raw) {
                     if (error) {
                         callbackError(error, 400)
                     };

                     callbackSuccess();
                });
            } else {
                callbackError('not found', 404);
            };
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    }

}
