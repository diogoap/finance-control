'use strict';

var Accounts = require('../models/accountsModel');
var Currencies = require('../models/currenciesModel');
var Validator = require('jsonschema').Validator;

var accountSchema = {
    "description": "Account model validation",
    "type": "object",
    "properties": {
        "name": { "type": "string", "minLength": 3, "maxLength": 100 },
        "initialBalance": { "type": "double" },
        "actualBalance": { "type": "double" },
        "order": { "type": "integer", "minimum": 1, "maximum": 999 },
        "enabled": { "type": "boolean" },
        "user_id": { "type": "string" },
        "currency_id": { "type": "string" }
    },
    "required": ["name", "order", "enabled", "user_id", "currency_id"]
};

function updateAccount(account) {
    account._currency = null;
}

function setCurrencies(currencyList, obj) {
    for (var j in currencyList) {
        if (obj.currency_id == currencyList[j].id) {
            obj._currency = currencyList[j];
            break;
        }
    }
}

module.exports = {

    getById: function (id, callbackSuccess, callbackError) {
        var accountsPromisse = Accounts.findById(id);

        accountsPromisse.then(function (account) {
            if (account == undefined) {
                callbackError('not found', 404);
            }

            var currenciesPromisse = Currencies.find().exec();
            currenciesPromisse.then(function (currencies) {

                setCurrencies(currencies, account);

                callbackSuccess(account);
            });
        })
            .then(null, function (error) {
                callbackError(error, 400);
            });
    },

    get: function (userId, filter, callbackSuccess, callbackError) {
        var queryFilter = {};

        if ((filter != undefined) && (filter.enabled != undefined)) {
            queryFilter.enabled = filter.enabled;
        }

        queryFilter.user_id = userId;

        var accountsPromisse = Accounts.find(queryFilter).sort('order').exec();

        accountsPromisse.then(function (accounts) {

            var currenciesPromisse = Currencies.find().exec();
            currenciesPromisse.then(function (currencies) {

                accounts.forEach(function (account) {
                    setCurrencies(currencies, account);
                });

                callbackSuccess(accounts);
            });
        })
            .then(null, function (error) {
                callbackError(error);
            });
    },

    create: function (userId, account, callbackSuccess, callbackError) {
        account.user_id = userId;
        var val = new Validator().validate(account, accountSchema);

        if (val.errors.length == 0) {
            updateAccount(account);
            var accountsPromisse = Accounts.create(account);

            accountsPromisse.then(function () {
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
        var accountsPromisse = Accounts.remove(id);

        accountsPromisse.then(function () {
            callbackSuccess();
        })
            .then(null, function (error) {
                callbackError(error, 400);
            });
    },

    edit: function (id, account, callbackSuccess, callbackError) {
        var val = new Validator().validate(account, accountSchema);

        if (val.errors.length == 0) {
            updateAccount(account);
            var accountsPromisse = Accounts.findByIdAndUpdate(id, account, { new: true });

            accountsPromisse.then(function (accountEdited) {
                if (accountEdited == null) {
                    callbackError('not found', 404);
                } else {
                    callbackSuccess(accountEdited);
                }
            })
                .then(null, function (error) {
                    callbackError(error, 400);
                });
        } else {
            callbackError(val.errors, 400)
        }
    }

}
