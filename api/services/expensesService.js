'use strict';

var Expenses = require('../models/expensesModel');
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
            "type": "boolean",
            "required": true            
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

    getById: function(id, callback) {
        return Expenses.findById(id, function(error, expense) {
            callback(error, expense);
        });
    },

    get: function(callback) {
        return Expenses.find(function(error, expense) {
            callback(error, expense);
        })
        .populate('_category', 'name')
        .exec(function (error, expense) {
            if (error) return callback(error, expense);
            console.log('The creator is %s', expense._category);
        });
    },    

    create: function(expense, callback) {
        var val = new Validator().validate(expense, expenseSchema);

        if (val.errors.length == 0) {
            return Expenses.create(expense, function(error, expense) {
                callback(error, expense);
            });
        } else {
            callback(val.errors, expense, 400)
        }
    },

    delete: function(id, callback) {
        return Expenses.remove(id, function(error, expense) {
            callback(error, expense);
        });
    },

    edit: function(id, expense, callback) {
        var val = new Validator().validate(expense, expenseSchema);

        if (val.errors.length == 0) {        
            return Expenses.findByIdAndUpdate(id, expense, function(error, expense) {
                callback(error, expense);
        });
        } else {
            callback(val.errors, expense, 400)
        }            
    }

}