'use strict';

var Accounts = require('../models/accountsModel');
var Validator = require('jsonschema').Validator;

var accountSchema = {
    "description": "Account model validation.",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "required": true,
            "minLength": 3,
            "maxLength": 100
        },
        "initialBalance": {
            "type": "double"
        },
         "actualBalance": {
            "type": "double"
        }       
    }
};

module.exports = {

    getById: function(id, callback) {
        return Accounts.findById(id, function(error, account) {
            callback(error, account);
        });
    },

    get: function(callback) {
        return Accounts.find(function(error, account) {
            callback(error, account);
        });
    },    

    create: function(account, callback) {
        var val = new Validator().validate(account, accountSchema);

        if (val.errors.length == 0) {
            return Accounts.create(account, function(error, account) {
                callback(error, account);
            });
        } else {
            callback(val.errors, account, 400)
        }
    },

    delete: function(id, callback) {
        return Accounts.remove(id, function(error, account) {
            callback(error, account);
        });
    },

    edit: function(id, account, callback) {
        var val = new Validator().validate(account, accountSchema);

        if (val.errors.length == 0) {        
            return Accounts.findByIdAndUpdate(id, account, function(error, account) {
                callback(error, account);
        });
        } else {
            callback(val.errors, account, 400)
        }            
    }

}