'use strict';

var Loans = require('../models/loansModel');
var Accounts = require('../models/accountsModel');
var Currencies = require('../models/currenciesModel');
var Validator = require('jsonschema').Validator;

var loanSchema = {
    "description": "Loan model validation",
    "type": "object",
    "properties": {
        "description": { "type": "string", "minLength": 3, "maxLength": 100 },
        "transactionDate": { "type": "datetime" },
        "dueDate": { "type": "datetime" },
        "amount": { "type": "number", "minimum": 0, "exclusiveMinimum": true },
        "account_id": { "type": "string" },
        "type": { "type": "string", "enum": ["Tomado", "Concedido"] },
        "status": { "type": "string", "enum": ["Em aberto", "Quitado"] },
        "notes": { "type": "string" },
        "user_id": { "type": "string" },
        "currency_id": { "type": "string" }
    },
    "required": ["description", "transactionDate", "dueDate", "amount", "account_id", "type", "status", "user_id", "currency_id"]
};

function validateLoan(loan, errors) {
    if (loan != undefined) {
        if (loan.transactionDate > loan.dueDate) {
            errors.push('Due date must be equal or greater than Transcation date');
        }
    }
}

function updateLoan(loan) {
    loan._account = null;
    loan._currency = null;
}

function setAccounts(accountList, obj) {
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

module.exports = {

    getById: function (id, callbackSuccess, callbackError) {
        var loansPromisse = Loans.findById(id);

        loansPromisse.then(function (loan) {
            if (loan == undefined) {
                callbackError('not found', 404);
            }

            var accountsPromisse = Accounts.find().exec();
            accountsPromisse.then(function (accounts) {

                var currenciesPromisse = Currencies.find().exec();
                currenciesPromisse.then(function (currencies) {

                    setAccounts(accounts, loan);
                    setCurrencies(currencies, loan);

                    callbackSuccess(loan);
                });
            });
        })
            .then(null, function (error) {
                callbackError(error, 400);
            });
    },

    get: function (userId, filter, callbackSuccess, callbackError) {
        var queryFilter = {};

        if ((filter != undefined) && (filter.status != undefined)) {
            queryFilter.status = filter.status;
        }

        queryFilter.user_id = userId;

        var loansPromisse = Loans.find(queryFilter).sort('transactionDate').exec();

        loansPromisse.then(function (loans) {
            var accountsPromisse = Accounts.find().exec();
            accountsPromisse.then(function (accounts) {

                var currenciesPromisse = Currencies.find().exec();
                currenciesPromisse.then(function (currencies) {

                    loans.forEach(function (loan) {
                        setAccounts(accounts, loan);
                        setCurrencies(currencies, loan);
                    });

                    callbackSuccess(loans);
                });

            });
        })
            .then(null, function (error) {
                callbackError(error);
            });
    },

    create: function (userId, loan, callbackSuccess, callbackError) {
        loan.user_id = userId;
        var val = new Validator().validate(loan, loanSchema);
        validateLoan(loan, val.errors);

        if (val.errors.length == 0) {
            updateLoan(loan);
            var loansPromisse = Loans.create(loan);

            loansPromisse.then(function () {
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
        var loansPromisse = Loans.deleteOne({ _id: id });

        loansPromisse.then(function (result) {
            if (result.deletedCount === 0) {
                callbackError('not found', 404);
            } else {
                callbackSuccess();
            }
        }).catch(function (error) {
            callbackError(error, 500);
        });
    },

    edit: function (id, loan, callbackSuccess, callbackError) {
        var val = new Validator().validate(loan, loanSchema);
        validateLoan(loan, val.errors);

        if (val.errors.length == 0) {
            updateLoan(loan);
            var loansPromisse = Loans.findByIdAndUpdate(id, loan, { new: true });

            loansPromisse.then(function (loanEdited) {
                if (loanEdited == null) {
                    callbackError('not found', 404);
                } else {
                    callbackSuccess(loanEdited);
                }
            })
                .then(null, function (error) {
                    callbackError(error, 400);
                });
        } else {
            callbackError(val.errors, 400)
        }
    },

    pay: function (id, callbackSuccess, callbackError) {
        var loanFindPromisse = Loans.findById(id);
        loanFindPromisse.then(function (loan) {
            if (loan != undefined) {
                loan.status = 'Quitado';
                loan.save(function (error, raw) {
                    if (error) {
                        callbackError(error, 400)
                    };

                    callbackSuccess();
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
