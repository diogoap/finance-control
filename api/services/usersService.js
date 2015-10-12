'use strict';

var Users = require('../models/usersModel');
var Validator = require('jsonschema').Validator;

var userCreateSchema = {
    "description": "Users model validation",
    "type": "object",
    "properties": {
        "emailAuthorized": { "type": "string", "minLength": 5, "maxLength": 100 }
    },
	"additionalProperties": false,
    "required": [ "emailAuthorized" ]
};

var userEditSchema = {
    "description": "Users edit model validation",
    "type": "object",
    "properties": {
        "externalId": { "type": "string", "minLength": 5, "maxLength": 100 },
        "externalName": { "type": "string", "minLength": 1, "maxLength": 300 },
        "externalPhoto": { "type": "string", "minLength": 5, "maxLength": 300 },
        "accessToken": { "type": "string", "minLength": 5, "maxLength": 500 }
    },
	"additionalProperties": false,
    "required": [ "externalId", "externalName", "externalPhoto", "accessToken" ]
};

function getUser(queryFilter, callbackSuccess, callbackError) {
    var usersPromisse = Users.find(queryFilter).exec();

    usersPromisse.then(function(users) {
        if ((users == undefined) || (users.length == 0)) {
            callbackError('not found', 404);
        }

        callbackSuccess(users[0]);
    })
    .then(null, function(error) {
        callbackError(error, 400);
    });
};

function changeUserStatus(id, enable, callbackSuccess, callbackError) {
    var usersFindPromisse = Users.findById(id);

    usersFindPromisse.then(function(user) {
        if (user != undefined) {
            user.userEnabled = enable;
            user.accessToken = '';
            user.accessTokenCreationDate = null;

            user.save(function(error, raw) {
                 if (error) {
                     callbackError(error, 400)
                 };

                 callbackSuccess();
            });
        } else {
            callbackError('not found', 404);
        };
    })
    .then(null, function(error) {
        callbackError(error, 400);
    });
};

module.exports = {

    getById: function(id, callbackSuccess, callbackError) {
        var queryFilter = { _id: id };
        getUser(queryFilter, callbackSuccess, callbackError);
    },

    getByEmail: function(email, callbackSuccess, callbackError) {
        var queryFilter = { emailAuthorized: email };
        getUser(queryFilter, callbackSuccess, callbackError);
    },

    getByExternalId: function(externalId, callbackSuccess, callbackError) {
        var queryFilter = { externalId: externalId };
        getUser(queryFilter, callbackSuccess, callbackError);
    },

    get: function(callbackSuccess, callbackError) {
        var usersPromisse = Users.find().sort('emailAuthorized').exec();

        usersPromisse.then(function (users) {
            callbackSuccess(users);
        })
        .then(null, function(error) {
            callbackError(error);
        });
    },

    create: function(user, callbackSuccess, callbackError) {
        var val = new Validator().validate(user, userCreateSchema);

        if (val.errors.length == 0) {
			var queryFilter = { emailAuthorized: user.emailAuthorized };
			var usersFindPromisse = Users.find(queryFilter).exec();

	        usersFindPromisse.then(function(usersFind) {
				if ((usersFind != undefined) && (usersFind.length > 0)) {
	                callbackError('User already registered', 400);
	            } else {
					user.creationDate = new Date();
					user.userEnabled = true;

					var usersPromisse = Users.create(user);

	            	usersPromisse.then(function() {
	                	callbackSuccess();
	            	})
	            	.then(null, function(error) {
	                	callbackError(error, 400);
	            	});
				}
			});
        } else {
            callbackError(val.errors, 400)
        }
    },

    logOff: function(id, callbackSuccess, callbackError) {
		var usersFindPromisse = Users.findById(id);

		usersFindPromisse.then(function(user) {
            if (user != undefined) {
                user.accessToken = '';
                user.accessTokenCreationDate = null;

                user.save(function(error, raw) {
                     if (error) {
                         callbackError(error, 400)
                     };

                     callbackSuccess();
                });
            } else {
                callbackError('not found', 404);
            };
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

	delete: function(id, callbackSuccess, callbackError) {
		var usersPromisse = Users.remove(id);

        usersPromisse.then(function () {
            callbackSuccess();
        })
        .then(null, function(error) {
            callbackError(error, 400);
        });
    },

	edit: function(id, user, callbackSuccess, callbackError) {
        var val = new Validator().validate(user, userEditSchema);

        if (val.errors.length == 0) {
            user.accessTokenCreationDate = new Date();
            var usersPromisse = Users.findByIdAndUpdate(id, user, { new: true });

            usersPromisse.then(function(userEdited) {
				if (userEdited == null) {
					callbackError('not found', 404);
				} else {
    				callbackSuccess(userEdited);
                }
            })
            .then(null, function(error) {
                callbackError(error, 400);
            });
        } else {
            callbackError(val.errors, 400)
        }
    },

    disable: function(id, callbackSuccess, callbackError) {
        changeUserStatus(id, false, callbackSuccess, callbackError);
    },

    enable: function(id, callbackSuccess, callbackError) {
        changeUserStatus(id, true, callbackSuccess, callbackError);
    }

}
