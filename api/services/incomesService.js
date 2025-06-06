'use strict';

var Incomes = require('../models/incomesModel');
var Categories = require('../models/categoriesModel');
var Accounts = require('../models/accountsModel');
var Currencies = require('../models/currenciesModel');
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
        "amountReceived": { "type": "number", "minimum": 0 },
        "status": { "type": "string", "enum": ["Em aberto", "Recebido"] },
        "notes": { "type": "string" },
        "user_id": { "type": "string" },
        "currency_id": { "type": "string" },
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
                    "status": { "type": "string", "enum": ["Em aberto", "Recebido"] },
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
                "amountReceived": { "minimum": 0, "exclusiveMinimum": true },
                "status": { "enum": ["Recebido"] }
            },
            "required": ["amountReceived"]
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

function fillDetailAccountsCategoriesCurrencies(income) {
    if ((income.detail != undefined) && (income.detail.length > 0)) {
        income._accountNames = '';
        income._categoryNames = '';
        income._currencyCodes = '';

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

            if (det._currency != undefined) {
                if (income._currencyCodes.indexOf(det._currency.currencyCode) == -1) {
                    if (income._currencyCodes.length > 0) {
                        income._currencyCodes += ' - ';
                    }
                    income._currencyCodes += det._currency.currencyCode;
                }
            }
        });
    } else {
        income._accountNames = income._account.name;
        income._categoryNames = income._category.name;

        if (income._currency != undefined) {
            income._currencyCodes = income._currency.currencyCode;
        }
    }
}

function updateIncomeTotal(income) {
    if ((income.detail != undefined) && (income.detail.length > 0)) {
        income.account_id = null;
        income._account = null;

        income.category_id = null;
        income._category = null;

        income.currency_id = null;
        income._currency = null;

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
        income.detail.forEach(function (det) {
            det.status = 'Recebido';
        })
    }
}

module.exports = {

    getById: function (id, callbackSuccess, callbackError) {
        var incomePromisse = Incomes.findById(id);
        incomePromisse.then(function (income) {
            if (income == undefined) {
                callbackError('not found', 404);
            }

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    var currenciesPromisse = Currencies.find().exec();
                    currenciesPromisse.then(function (currencies) {

                        setCategory(categories, income);
                        setAccount(accounts, income);
                        setCurrencies(currencies, income);

                        income.detail.forEach(function (det) {
                            setCategory(categories, det);
                            setAccount(accounts, det);
                            setCurrencies(currencies, det);
                        });

                        fillDetailAccountsCategoriesCurrencies(income);

                        callbackSuccess(income);
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

        var incomesPromisse = Incomes.aggregate([
            { $match: { dueDate: queryFilter.dueDate, user_id: queryFilter.user_id } },
            {
                $project: {
                    description: "$description", dueDate: "$dueDate",
                    amount: "$amount", category_id: "$category_id", account_id: "$account_id", currency_id: "$currency_id",
                    amountReceived: "$amountReceived", status: "$status", notes: "$notes", user_id: "$user_id", detail: "$detail",
                    dueDateOnlyDate: { $dateToString: { format: "%Y-%m-%d", date: "$dueDate" } }
                }
            },
            { $sort: { dueDateOnlyDate: 1, description: 1 } }
        ]).exec();

        incomesPromisse.then(function (incomes) {

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    var currenciesPromisse = Currencies.find().exec();
                    currenciesPromisse.then(function (currencies) {

                        incomes.forEach(function (income) {
                            setCategory(categories, income);
                            setAccount(accounts, income);
                            setCurrencies(currencies, income);

                            income.detail.forEach(function (det) {
                                setCategory(categories, det);
                                setAccount(accounts, det);
                                setCurrencies(currencies, det);
                            });

                            fillDetailAccountsCategoriesCurrencies(income);
                        });

                        callbackSuccess(incomes);
                    });
                });
            });
        })
            .then(null, function (error) {
                callbackError(error);
            });
    },

    create: function (userId, income, callbackSuccess, callbackError) {
        income.user_id = userId;
        var val = new Validator().validate(income, incomeSchema);

        if (val.errors.length == 0) {
            updateIncomeTotal(income);
            var incomesPromisse = Incomes.create(income);

            incomesPromisse.then(function () {
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
        var incomesPromisse = Incomes.deleteOne({ _id: id });

        incomesPromisse.then(function (result) {
            if (result.deletedCount === 0) {
                callbackError('not found', 404);
            } else {
                callbackSuccess();
            }
        }).catch(function (error) {
            callbackError(error, 500);
        });
    },

    edit: function (id, income, callbackSuccess, callbackError) {
        var val = new Validator().validate(income, incomeSchema);

        if (val.errors.length == 0) {
            updateIncomeTotal(income);
            var incomesPromisse = Incomes.findByIdAndUpdate(id, income, { new: true });

            incomesPromisse.then(function (incomeEdited) {
                if (incomeEdited == null) {
                    callbackError('not found', 404);
                } else {
                    callbackSuccess(incomeEdited);
                }
            })
                .then(null, function (error) {
                    callbackError(error, 400);
                });
        } else {
            callbackError(val.errors, 400)
        }
    },

    receive: function (id, callbackSuccess, callbackError) {
        var incomeFindPromisse = Incomes.findById(id);
        incomeFindPromisse.then(function (income) {
            if (income != undefined) {
                receiveIncome(income);

                income.save()
                    .then(function (raw) {
                        callbackSuccess();
                    })
                    .catch(function (error) {
                        callbackError(error, 500);
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
