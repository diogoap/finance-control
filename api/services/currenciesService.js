'use strict';

var Currencies = require('../models/currenciesModel');
var Validator = require('jsonschema').Validator;
var Incomes = require('../models/incomesModel');
var Expenses = require('../models/expensesModel');

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
        callbackSuccess(currencies > 0);
    })
        .then(null, function (error) {
            callbackError(error);
        });
}

function getCurrencyIdDefault(userId, callbackSuccess, callbackError) {
    var queryFilter = {
        default: true,
        user_id: userId
    };

    var currenciesPromisse = Currencies.find(queryFilter).exec();

    currenciesPromisse.then(function (currencies) {
        if (currencies.length > 0) {
            callbackSuccess(currencies[0])
        } else {
            callbackError('There is no default currency');
        }
    })
        .then(null, function (error) {
            callbackError(error);
        });
}

function currencyDefaultExists(userId, currency, callbackSuccess, callbackError) {
    if (currency.default == false) {
        callbackSuccess(false);
    } else {

        var queryFilter = {
            default: true,
            user_id: userId
        };

        var currenciesPromisse = Currencies.find(queryFilter).exec();
        currenciesPromisse.then(function (currencies) {

            var existsDefault = false;
            if ((currencies != undefined) && (currencies.length > 0)) {
                currencies.forEach(function (item) {
                    if (currency.id == undefined || item.id != currency.id) {
                        existsDefault = true;
                    }
                })
            };

            callbackSuccess(existsDefault);
        })
            .then(null, function (error) {
                callbackError(error);
            });
    }
}

function updateCurrency(queryFilter, currencyDefault, Model, callbackSuccess, callbackError) {
    var itemsPromisse = Model.find(queryFilter).sort('date').exec();
    itemsPromisse.then(function (list) {

        list.forEach(function (item) {
            let needsUpdate = false;

            if (item.detail.length > 0) {
                item.detail.forEach(function (det) {
                    if (det.currency_id == undefined) {
                        item.currency_id = null;
                        item._currency = null
                        det.currency_id = currencyDefault._id;
                        det._currency = currencyDefault;
                        needsUpdate = true;
                    }
                });
            } else {
                if (item.currency_id == undefined) {
                    item.currency_id = currencyDefault._id;
                    item._currency = currencyDefault;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                console.log('Need update for: ' + item.description);

                let updateFilter = { _id: item._id };

                let updatePromisse = Model.updateOne(updateFilter, item);

                updatePromisse.then(function () {
                    console.log('Update complete for: ' + item.description);
                })
                    .then(null, function (error) {
                        console.log('error: ' + error);
                        callbackError(error, 500);
                    });
            }
        });

        callbackSuccess();
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
            var currencyExistsPromisse = currencyExists(userId, currency.currencyCode,
                function (exists) {
                    if (exists) {
                        callbackError('Moeda já existe', 400);
                    } else {
                        var currencyDefaultExistsPromisse = currencyDefaultExists(userId, currency,
                            function (defaultExists) {
                                if (defaultExists) {
                                    callbackError('Moeda default já existe', 400);
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
                            function (error) {
                                callbackError(error, 400);
                            })
                    }
                },
                function (error) {
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
            var currencyDefaultExistsPromisse = currencyDefaultExists(currency.user_id, currency,
                function (defaultExists) {
                    if (defaultExists) {
                        callbackError('Moeda default já existe', 400);
                    } else {

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
                    }
                },
                function (error) {
                    callbackError(error, 400);
                })
        } else {
            callbackError(val.errors, 400)
        }
    },

    updateCurrency: function (userId, filter, callbackSuccess, callbackError) {

        getCurrencyIdDefault(userId,
            function (currencyDefault) {

                var queryFilter = {};
                var dateBegin, dateEnd;

                if ((filter != undefined) && (filter.year != undefined)) {
                    var y = parseInt(filter.year, 10); 
                    dateBegin = new Date(y, 0, 1);
                    dateEnd = new Date(y + 1, 0, 1);
                } else {
                    var date = new Date(), y = date.getFullYear();
                    dateBegin = new Date(y, 0, 1);
                    dateEnd = new Date(y + 1, 0, 0);
                }

                queryFilter.dueDate = { $gte: dateBegin, $lt: dateEnd };
                queryFilter.user_id = userId;

                updateCurrency(queryFilter, currencyDefault, Incomes,
                    function () {
                        updateCurrency(queryFilter, currencyDefault, Expenses,
                            function () {
                                callbackSuccess();
                            },
                            function (error) {
                                callbackError(error);
                            });
                    },
                    function (error) {
                        callbackError(error);
                    });
            },
            function (error) {
                callbackError(error);
            })
    }
}
