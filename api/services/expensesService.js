'use strict';

var Expenses = require('../models/expensesModel');
var Categories = require('../models/categoriesModel');
var Accounts = require('../models/accountsModel');
var Validator = require('jsonschema').Validator;

var expenseSchema = {
    "description": "Expense model validation.",
    "type": "object",
    "properties": {
        "description": {
            "type": "string",
            "required": true,
            "minLength": 3,
            "maxLength": 100
        },
        "dueDate": {
            "type": "datetime",
            "required": true            
        },
        "scheduledPayment": {
            "type": "boolean"         
        },
        "amount": {
            "type": "number",
            "minimum": 0.01,
            "exclusiveMinimum": false             
        },
        "category_id": {
            "type": "string",
            "required": true             
        },
        "account_id": {
            "type": "string",
            "required": true             
        },
        "amountPaid": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": false            
        },
        "status": {
            "type": "string",
            "required": true,
            "enum": [
                "Em aberto",
                "Pago",
                "Cancelado"
            ]
        },
        "notes": {
            "type": "string"
        },
        "detail": {
            "description": "Expenses detail list",
            "type": "array",
            "items": {
                "description": "Expense detail",
                "type": "object",
                "properties": {
                    "description": {
                        "type": "string",
                        "required": true,
                        "minLength": 3,
                        "maxLength": 100
                    },      
                    "amount": {
                        "type": "number",
                        "minimum": 0.01,
                        "exclusiveMinimum": false             
                    },
                    "category_id": {
                        "type": "string",
                        "required": true             
                    },
                    "account_id": {
                        "type": "string",
                        "required": true
                    },
                    "status": {
                        "type": "string",
                        "required": true,
                        "enum": [
                            "Em aberto",
                            "Pago",
                            "Cancelado"
                        ]
                    },
                }
            }
        }
    }
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

module.exports = {

    getById: function(id, callbackSuccess, callbackError) {
        var expensePromisse = Expenses.findById(id);
        expensePromisse.then(function (expense) {

            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    setCategory(categories, expense);
                    setAccount(accounts, expense);

                    expense.detail.forEach(function (det) {
                        setCategory(categories, det);
                        setAccount(accounts, det);
                    });

                    callbackSuccess(expense);
                });
            }); 
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });        
    },

    get: function(callbackSuccess, callbackError) {
        var expensesPromisse = Expenses.find().exec();
        expensesPromisse.then(function (expenses) {      
            
            var categoriesPromisse = Categories.find().exec();
            categoriesPromisse.then(function (categories) {

                var accountsPromisse = Accounts.find().exec();
                accountsPromisse.then(function (accounts) {

                    expenses.forEach(function (exp) {
                        setCategory(categories, exp);
                        setAccount(accounts, exp);

                        exp.detail.forEach(function (det) {
                            setCategory(categories, det);
                            setAccount(accounts, det);
                        });
                    });

                    callbackSuccess(expenses);
                });
            });               
        })
        .then(null, function(error) {
            callbackError(error);
        });
    },    

    create: function(expense, callbackSuccess, callbackError) {
        var val = new Validator().validate(expense, expenseSchema);

        if (val.errors.length == 0) {
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
            var expensesPromisse = Expenses.findByIdAndUpdate(id, expense);

            expensesPromisse.then(function () {
                callbackSuccess();              
            })
            .then(null, function(error) {
                callbackError(error, 400);
            });
        } else {
            callbackError(val.errors, 400)
        }            
    }

}