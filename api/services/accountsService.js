'use strict';

var Accounts = require('../models/accountsModel');
var Validator = require('jsonschema').Validator;

var accountSchema = {
    "description": "Account model validation",
    "type": "object",
    "properties": {
        "name": { "type": "string", "minLength": 3, "maxLength": 100 },
        "initialBalance": { "type": "double" },
        "actualBalance": { "type": "double" }
    },
    "required": [ "name" ]
};

module.exports = {

    getById: function(id, callbackSuccess, callbackError) {
        var accountsPromisse = Accounts.findById(id);

        accountsPromisse.then(function (account) {
            if (account == undefined) {
                callbackError('not found', 404);
            }

            callbackSuccess(account);
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    get: function(callbackSuccess, callbackError) {
        var accountsPromisse = Accounts.find().sort('name').exec();

        accountsPromisse.then(function (accounts) {
            callbackSuccess(accounts);
        })
        .then(null, function(error) {
            callbackError(error);
        });
    },

    create: function(account, callbackSuccess, callbackError) {
        var val = new Validator().validate(account, accountSchema);

        if (val.errors.length == 0) {
            var accountsPromisse = Accounts.create(account);

            accountsPromisse.then(function () {
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
        var accountsPromisse = Accounts.remove(id);

        accountsPromisse.then(function () {
            callbackSuccess();
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    edit: function(id, account, callbackSuccess, callbackError) {
        var val = new Validator().validate(account, accountSchema);

        if (val.errors.length == 0) {
            var accountsPromisse = Accounts.findByIdAndUpdate(id, account);

            accountsPromisse.then(function () {
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
