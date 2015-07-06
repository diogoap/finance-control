'use strict';

var Categories = require('../models/categoriesModel');
var Validator = require('jsonschema').Validator;

var categorySchema = {
    "description": "Category model validation.",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100
        },
        "type": {
            "type": "string",
            "enum": [
                "Receita",
                "Despesa"
            ]
        }
    },
    "required": [ "name", "type" ]

};

module.exports = {

    getById: function(id, callbackSuccess, callbackError) {
        var categoriesPromisse = Categories.findById(id);

        categoriesPromisse.then(function (category) {
            callbackSuccess(category);
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    get: function(callbackSuccess, callbackError) {
        var categoriesPromisse = Categories.find().exec();

        categoriesPromisse.then(function (categories) {
            callbackSuccess(categories);
        })
        .then(null, function(error) {
            callbackError(error);
        });
    },

    create: function(category, callbackSuccess, callbackError) {
        var val = new Validator().validate(category, categorySchema);

        if (val.errors.length == 0) {
            var categoriesPromisse = Categories.create(category);

            categoriesPromisse.then(function () {
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
        var categoriesPromisse = Categories.remove(id);

        categoriesPromisse.then(function () {
            callbackSuccess();
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

    edit: function(id, category, callbackSuccess, callbackError) {
        var val = new Validator().validate(category, categorySchema);

        if (val.errors.length == 0) {
            var categoriesPromisse = Categories.findByIdAndUpdate(id, category);

            categoriesPromisse.then(function () {
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
