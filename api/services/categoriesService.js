var Categories = require('../models/categoriesModel');
var Validator = require('jsonschema').Validator;

var categorySchema = {
    "description": "Category model validation.",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "required": true,
            "minLength": 3,
            "maxLength": 100
        },
        "type": {
            "type": "string",
            "required": true,
            "enum": [
                "Receita",
                "Despesa"
            ]
        }
    }
};

module.exports = {

    getById: function(id, callback) {
        return Categories.findById(id, function(error, category) {
            callback(error, category);
        });
    },

    get: function(callback) {
        return Categories.find(function(error, category) {
            callback(error, category);
        });
    },    

    create: function(category, callback) {
        var val = new Validator().validate(category, categorySchema);

        if (val.errors.length == 0) {
            return Categories.create(category, function(error, category) {
                callback(error, category);
            });
        } else {
            callback(val.errors, category, 400)
        }
    },

    delete: function(id, callback) {
        return Categories.remove(id, function(error, category) {
            callback(error, category);
        });
    },

    edit: function(id, category, callback) {
        var val = new Validator().validate(category, categorySchema);

        if (val.errors.length == 0) {        
            return Categories.findByIdAndUpdate(id, category, function(error, category) {
                callback(error, category);
        });
        } else {
            callback(val.errors, category, 400)
        }            
    }

}