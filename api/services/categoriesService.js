'use strict';

var Categories = require('../models/categoriesModel');
var Validator = require('jsonschema').Validator;

var categorySchema = {
    "description": "Category model validation",
    "type": "object",
    "properties": {
        "name": { "type": "string", "minLength": 3, "maxLength": 100 },
        "type": { "type": "string", "enum": ["Receita", "Despesa"] },
        "enabled": { "type": "boolean" },
        "user_id": { "type": "string" }
    },
    "required": ["name", "type", "enabled", "user_id"]
};

module.exports = {

    getById: function (id, callbackSuccess, callbackError) {
        var categoriesPromisse = Categories.findById(id);

        categoriesPromisse.then(function (category) {
            if (category == undefined) {
                callbackError('not found', 404);
            }

            callbackSuccess(category);
        })
            .then(null, function (error) {
                callbackError(error, 400);
            });
    },

    get: function (userId, filter, callbackSuccess, callbackError) {
        var queryFilter = {};

        if ((filter != undefined) && (filter.type != undefined)) {
            queryFilter.type = filter.type;
        }

        if ((filter != undefined) && (filter.enabled != undefined)) {
            queryFilter.enabled = filter.enabled;
        }

        queryFilter.user_id = userId;

        var categoriesPromisse = Categories.find(queryFilter).sort('name').exec();

        categoriesPromisse.then(function (categories) {
            callbackSuccess(categories);
        })
            .then(null, function (error) {
                callbackError(error);
            });
    },

    create: function (userId, category, callbackSuccess, callbackError) {
        category.user_id = userId;
        var val = new Validator().validate(category, categorySchema);

        if (val.errors.length == 0) {
            var categoriesPromisse = Categories.create(category);

            categoriesPromisse.then(function () {
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
        var categoriesPromisse = Categories.deleteOne({ _id: id });

        categoriesPromisse.then(function (result) {
            if (result.deletedCount === 0) {
                callbackError('not found', 404);
            } else {
                callbackSuccess();
            }
        }).catch(function (error) {
            callbackError(error, 500);
        });
    },

    edit: function (id, category, callbackSuccess, callbackError) {
        var val = new Validator().validate(category, categorySchema);

        if (val.errors.length == 0) {
            var categoriesPromisse = Categories.findByIdAndUpdate(id, category, { new: true });

            categoriesPromisse.then(function (categoryEdited) {
                if (categoryEdited == null) {
                    callbackError('not found', 404);
                } else {
                    callbackSuccess(categoryEdited);
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
