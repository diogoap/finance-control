'use strict';

var Expenses = require('../models/expensesModel');
var Categories = require('../models/categoriesModel');
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

module.exports = {

    getById: function(id, callbackSuccess, callbackError) {
        var expensesPromisse = Expenses.findById(id);

        expensesPromisse.then(function (expense) {
            callbackSuccess(expense);              
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
                for (var i in expenses) {
                    for (var j in categories)
                    {
                        if (expenses[i].category_id == categories[j].id)
                        {
                            expenses[i]._category = categories[j];
                            break;
                        }
                    }
                };

                callbackSuccess(expenses);
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