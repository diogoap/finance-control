'use strict';

var Expenses = require('../models/expensesModel');
var Incomes = require('../models/incomesModel');
var Validator = require('jsonschema').Validator;

var generatorParametersSchema = {
    "description": "Generator Parameters model validation",
    "type": "object",
    "properties": {
        "type": { "type": "string", "enum": ["Despesa", "Receita"] },
        "initialDate": { "type": "datetime" },
        "installments": { "type": "integer", "minimum": 1, "maximum": 999 },
        "dueDateType": { "type": "string", "enum": ["PrimeiroDia", "UltimoDia", "DiaEspecifico"] },
        "dueDateTypeDay": { "type": "integer" },
        "amount": { "type": "double", "minimum": 0, "exclusiveMinimum": true },
        "description": { "type": "string", "minLength": 3, "maxLength": 100 },
        "descriptionInstallmentNumber": { "type": "boolean" },
        "category_id": { "type": "string" },
        "account_id": { "type": "string" },
        "scheduledPayment": { "type": "boolean" },
        "notes": { "type": "string" },
        "user_id": { "type": "string" },
        "currency_id": { "type": "string" },
    },
    "required": ["type", "initialDate", "installments", "dueDateType", "amount", "description", "descriptionInstallmentNumber", "category_id", "account_id", "user_id", "currency_id"],
    "oneOf": [
        { "properties": { "dueDateType": { "enum": ["PrimeiroDia", "UltimoDia"] } } },
        {
            "properties": { "dueDateTypeDay": { "minimum": 1, "maximum": 31 } },
            "required": ["dueDateTypeDay"]
        }
    ]
};

function getDueDateDay(params) {
    if (params.dueDateType == 'PrimeiroDia') {
        return 1;
    } else if (params.dueDateType == 'UltimoDia') {
        var date = new Date(params.initialDate), y = date.getFullYear(), m = date.getMonth();
        date = new Date(y, m + 1, 0);
        return date.getDate();
    } else {
        return params.dueDateTypeDay;
    }
}

function createItems(params) {
    var items = [];

    var initialDate = new Date(params.initialDate);
    var initialYear = initialDate.getFullYear(), initialMonth = initialDate.getMonth(), initialDay = initialDate.getDate();

    if (initialDay > getDueDateDay(params)) {
        initialDate = new Date(initialYear, initialMonth + 1, 1);
    } else {
        initialDate = new Date(initialYear, initialMonth, 1);
    }

    for (var i = 1; i <= params.installments; i++) {
        var item;

        if (params.type == 'Despesa') {
            item = new Expenses();
            item.scheduledPayment = params.scheduledPayment;
        } else {
            item = new Incomes();
        }

        item.amount = params.amount;

        item.description = params.description;
        if (params.descriptionInstallmentNumber == true) {
            item.description += ' [{0}/{1}]'.replace('{0}', i).replace('{1}', params.installments);
        }

        var y = initialDate.getFullYear(), m = initialDate.getMonth();
        if (params.dueDateType == 'PrimeiroDia') {
            item.dueDate = new Date(Date.UTC(y, m, 1, 12, 0, 0));
        } else if (params.dueDateType == 'UltimoDia') {
            item.dueDate = new Date(Date.UTC(y, m + 1, 0, 12, 0, 0));
        } else {
            var lastDay = new Date(y, m + 1, 0).getDate();

            var dueDateDay = params.dueDateTypeDay;
            if (dueDateDay > lastDay) {
                dueDateDay = lastDay;
            }

            item.dueDate = new Date(Date.UTC(y, m, dueDateDay, 12, 0, 0));
        }

        initialDate = new Date(y, m + 1, 1);

        item.status = 'Em aberto';
        item.category_id = params.category_id;
        item.account_id = params.account_id;
        item.currency_id = params.currency_id;
        item.notes = params.notes;
        item.user_id = params.user_id;

        items.push(item);
    }

    return items;
}

module.exports = {

    create: function (userId, generatorParameters, callbackSuccess, callbackError) {
        generatorParameters.user_id = userId;
        var val = new Validator().validate(generatorParameters, generatorParametersSchema);

        if (val.errors.length == 0) {
            var items = createItems(generatorParameters);
            var promisseCreate;

            if (generatorParameters.type == 'Despesa') {
                promisseCreate = Expenses.create(items);

            } else {
                promisseCreate = Incomes.create(items);
            }

            promisseCreate.then(function () {
                callbackSuccess();
            })
                .then(null, function (error) {
                    callbackError(error, 400);
                });
        } else {
            callbackError(val.errors, 400)
        }
    }

}
