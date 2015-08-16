'use strict';

var Incomes = require('../models/incomesModel');
var Categories = require('../models/categoriesModel');
var Accounts = require('../models/accountsModel');
var Validator = require('jsonschema').Validator;

var incomeSchema = {
    "description": "Income model validation.",
    "type": "object",
    "properties": {
        "description": { "type": "string", "minLength": 3, "maxLength": 100 },
        "dueDate": { "type": "datetime" },
        "amount": { "type": "number", "minimum": 0, "exclusiveMinimum": true },
        "category_id": { "type": "string" },
        "account_id": { "type": "string" },
        "amountReceived": { "type": "number", "minimum": 0, "exclusiveMinimum": false },
        "status": { "type": "string", "enum": [ "Em aberto", "Pago" ] },
        "notes": { "type": "string" },
        "isLatePayment": { "type": "boolean" },
        "detail": {
            "description": "Incomes detail list",
            "type": "array",
            "items": {
                "description": "Income detail",
                "type": "object",
                "properties": {
                    "description": { "type": "string", "minLength": 1, "maxLength": 100 },
                    "amount": { "type": "number", "minimum": 0, "exclusiveMinimum": true },
                    "category_id": { "type": "string" },
                    "account_id": { "type": "string" },
                    "status": { "type": "string", "enum": [ "Em aberto", "Recebido" ] }
                },
                "required": [ "description", "category_id", "account_id", "status", "amount" ]
            }
        }
    },
    "required": [ "description", "dueDate", "status", "amount" ],
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
                "amountReceived": { "minimum": 0, "exclusiveMinimum": true },
                "status": { "enum": [ "Pago" ] }
            },
            "required": [ "amountReceived" ]
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

function fillDetailAccountsAndCategories(income) {
    if ((income.detail != undefined) && (income.detail.length > 0)) {
        income._accountNames = '';
        income._categoryNames = '';

        income.detail.forEach(function (det) {

            if (income._accountNames.indexOf(det._account.name) == -1) {
                if (income._accountNames.length > 0) {
                    income._accountNames += ' - ';
                }
                income._accountNames += det._account.name;
            }

            if (income._categoryNames.indexOf(det._category.name) == -1) {
                if (income._categoryNames.length > 0) {
                    income._categoryNames += ' - ';
                }
                income._categoryNames += det._category.name;
            }
        });
    } else {
        income._accountNames = income._account.name;
        income._categoryNames = income._category.name;
    }
}

function updateIncomeTotal(income) {
    if ((income.detail != undefined) && (income.detail.length > 0)) {
        income.account_id = null;
        income._account = null;

        income.category_id = null;
        income._category = null;

        income.amount = 0;
        income.amountReceived = 0;

        income.detail.forEach(function (det) {
            income.amount += det.amount;

            if (det.status == 'Recebido') {
                income.amountReceived += det.amount;
            }
        });

        if (income.amount == income.amountReceived) {
            income.status = 'Recebido';
        } else {
            income.status = 'Em aberto';
        }
    }
}

function receiveIncome(income) {
    income.status = 'Recebido';
    income.amountReceived = income.amount;

    if ((income.detail != undefined) && (income.detail.length > 0)) {
        income.detail.forEach(function(det) {
            det.status = 'Pago';
        })
    }
}

module.exports = {

    getById: function(id, callbackSuccess, callbackError) {
        var incomePromisse = Incomes.findById(id);
        incomePromisse.then(function(income) {
            if (income == undefined) {
                callbackError(404);
            }

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    setCategory(categories, income);
                    setAccount(accounts, income);
                    fillProperties(income);

                    income.detail.forEach(function (det) {
                        setCategory(categories, det);
                        setAccount(accounts, det);
                    });

                    fillDetailAccountsAndCategories(income);

                    callbackSuccess(income);
                });
            });
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    get: function(filter, callbackSuccess, callbackError) {
        var queryFilter;

        if ((filter != undefined) && (filter.dueDateBegin != undefined) && (filter.dueDateEnd != undefined)) {
            queryFilter = { dueDate: { $gt: filter.dueDateBegin, $lt: filter.dueDateEnd } };
        }

        var incomesPromisse = Incomes.find(queryFilter).sort('dueDate').exec();
        incomesPromisse.then(function (incomes) {

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    incomes.forEach(function (exp) {
                        setCategory(categories, exp);
                        setAccount(accounts, exp);
                        fillProperties(exp);

                        exp.detail.forEach(function (det) {
                            setCategory(categories, det);
                            setAccount(accounts, det);
                        });

                        fillDetailAccountsAndCategories(exp);
                    });

                    callbackSuccess(incomes);
                });
            });
        })
        .then(null, function(error) {
            callbackError(error);
        });
    },

    create: function(income, callbackSuccess, callbackError) {
        var val = new Validator().validate(income, incomeSchema);

        if (val.errors.length == 0) {
            updateIncomeTotal(income);
            var incomesPromisse = Incomes.create(income);

            incomesPromisse.then(function () {
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
        var incomesPromisse = Incomes.remove(id);

        incomesPromisse.then(function () {
            callbackSuccess();
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    edit: function(id, income, callbackSuccess, callbackError) {
        var val = new Validator().validate(income, incomeSchema);

        if (val.errors.length == 0) {
            updateIncomeTotal(income);
            var incomesPromisse = Incomes.findByIdAndUpdate(id, income);

            incomesPromisse.then(function() {
                callbackSuccess();
            })
            .then(null, function(error) {
                callbackError(error, 400);
            });
        } else {
            callbackError(val.errors, 400)
        }
    },

    receive: function(id, callbackSuccess, callbackError) {
        var incomeFindPromisse = Incomes.findById(id);
        incomeFindPromisse.then(function (income) {
            if (income != undefined) {
                receiveIncome(income);

                income.save(function(error, raw) {
                     if (error) {
                         callbackError(error, 400)
                     };

                     callbackSuccess();
                });
            } else {
                callbackError(404);
            };
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    }

}
