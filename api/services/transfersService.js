'use strict';

var Transfers = require('../models/transfersModel');
var Accounts = require('../models/accountsModel');
var Validator = require('jsonschema').Validator;

var transferSchema = {
    "description": "Transfer model validation",
    "type": "object",
    "properties": {
        "date": { "type": "datetime" },
        "amount": { "type": "number", "minimum": 0, "exclusiveMinimum": true },
        "accountOrigin_id": { "type": "string" },
        "accountTarget_id": { "type": "string" }
    },
    "required": [ "date", "amount", "accountOrigin_id", "accountTarget_id" ]
};

function validateTransfer(transfer, errors) {
    if (transfer != undefined) {
        if (transfer.accountOrigin_id == transfer.accountTarget_id) {
            errors.push('Origin account and Target account could not be the same');
        }
    }
}

function updateTransfer(transfer) {
    transfer._accountOrigin = null;
    transfer._accountTarget = null;
}

function setAccounts(accountList, obj) {
    for (var j in accountList) {
        if (obj.accountOrigin_id == accountList[j].id) {
            obj._accountOrigin = accountList[j];
        }

        if (obj.accountTarget_id == accountList[j].id) {
            obj._accountTarget = accountList[j];
        }

        if ((obj._accountOrigin != undefined) && (obj._accountTarget != undefined)) {
            break;
        }
    }
}

module.exports = {

    getById: function(id, callbackSuccess, callbackError) {
        var transfersPromisse = Transfers.findById(id);

        transfersPromisse.then(function (transfer) {
            if (transfer == undefined) {
                callbackError('not found', 404);
            }

            var accountsPromisse = Accounts.find().exec();

            accountsPromisse.then(function (accounts) {
                setAccounts(accounts, transfer);
                callbackSuccess(transfer);
            });
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    get: function(filter, callbackSuccess, callbackError) {
        var queryFilter;

        if ((filter != undefined) && (filter.dateBegin != undefined) && (filter.dateEnd != undefined)) {
            queryFilter = { date: { $gte: filter.dateBegin, $lt: filter.dateEnd } };
        }

        var transfersPromisse = Transfers.find(queryFilter).sort('date').exec();

        transfersPromisse.then(function (transfers) {
            var accountsPromisse = Accounts.find().exec();

            accountsPromisse.then(function (accounts) {
                transfers.forEach(function (transfer) {
                    setAccounts(accounts, transfer);
                });

                callbackSuccess(transfers);
            });
        })
        .then(null, function(error) {
            callbackError(error);
        });
    },

    create: function(transfer, callbackSuccess, callbackError) {
        var val = new Validator().validate(transfer, transferSchema);
        validateTransfer(transfer, val.errors);

        if (val.errors.length == 0) {
            updateTransfer(transfer);
            var transfersPromisse = Transfers.create(transfer);

            transfersPromisse.then(function () {
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
        var transfersPromisse = Transfers.remove(id);

        transfersPromisse.then(function () {
            callbackSuccess();
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    edit: function(id, transfer, callbackSuccess, callbackError) {
        var val = new Validator().validate(transfer, transferSchema);
        validateTransfer(transfer, val.errors);

        if (val.errors.length == 0) {
            updateTransfer(transfer);
            var transfersPromisse = Transfers.findByIdAndUpdate(id, transfer);

            transfersPromisse.then(function () {
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
