'use strict';

var Currencies = require('../models/currenciesModel');
var Validator = require('jsonschema').Validator;

var currencySchema = {
    "description": "Currency model validation.",
    "type": "object",
    "properties": {
        "currencyCode": { "type": "string", "minLength": 3, "maxLength": 3 },
        "currencySymbolImage": { "type": "string", "maxLength": 255 },
        "default": { "type": "boolean" },
        "enabled": { "type": "boolean" },
        "user_id": { "type": "string" },
        "periods": {
            "description": "Currency period list",
            "type": "array",
            "items": {
                "description": "Currency period",
                "type": "object",
                "properties": {
                    "beginDate": { "type": "datetime" },
                    "endDate": { "type": "datetime" },
                    "conversionRate": { "type": "number", "minimum": 0, "exclusiveMinimum": true }
                },
                "required": ["beginDate", "conversionRate"]
            }
        }
    },
    "required": ["currencyCode", "user_id", "periods"]
};

function currencyExists(userId, currencyCodeFilter, callbackSuccess, callbackError) {
    var queryFilter = {
        currencyCode: currencyCodeFilter,
        user_id: userId
    };

    var currenciesPromisse = Currencies.countDocuments(queryFilter).exec();

    currenciesPromisse.then(function (currencies) {
        console.log(currencies);
        callbackSuccess(currencies > 0);
    })
        .then(null, function (error) {
            callbackError(error);
        });
}

module.exports = {

    getById: function (id, callbackSuccess, callbackError) {
        var currenciesPromisse = Currencies.findById(id);

        currenciesPromisse.then(function (currency) {
            if (currency == undefined) {
                callbackError('not found', 404);
            }

            callbackSuccess(currency);
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

        var currenciesPromisse = Currencies.find(queryFilter).sort('currencyCode').exec();

        currenciesPromisse.then(function (currencies) {
            callbackSuccess(currencies);
        })
            .then(null, function (error) {
                callbackError(error);
            });
    },

    create: function (userId, currency, callbackSuccess, callbackError) {
        currency.user_id = userId;
        var val = new Validator().validate(currency, currencySchema);

        if (val.errors.length == 0) {
            var currenciesExistsPromisse = currencyExists(userId, currency.currencyCode,
                function (exists) {
                    if (exists) {
                        callbackError('Moeda já existe', 400);
                    } else {
                        var currenciesPromisse = Currencies.create(currency);

                        currenciesPromisse.then(function () {
                            callbackSuccess();
                        })
                            .then(null, function (error) {
                                callbackError(error, 400);
                            });
                    }
                },
                function () {
                    callbackError(error, 400);
                })
        } else {
            callbackError(val.errors, 400)
        }
    },

    delete: function (id, callbackSuccess, callbackError) {
        var currenciesPromisse = Currencies.remove(id);

        currenciesPromisse.then(function () {
            callbackSuccess();
        })
            .then(null, function (error) {
                callbackError(error, 400);
            });
    },

    edit: function (id, currency, callbackSuccess, callbackError) {
        var val = new Validator().validate(currency, currencySchema);

        if (val.errors.length == 0) {
            var currenciesPromisse = Currencies.findByIdAndUpdate(id, currency, { new: true });

            currenciesPromisse.then(function (currencyEdited) {
                if (currencyEdited == null) {
                    callbackError('not found', 404);
                } else {
                    callbackSuccess(currencyEdited);
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
