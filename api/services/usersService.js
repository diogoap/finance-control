'use strict';

var Users = require('../models/usersModel');
var Validator = require('jsonschema').Validator;
var passwordHash = require('password-hash');

var userCreateSchema = {
    "description": "Users model validation",
    "type": "object",
    "properties": {
        "emailAuthorized": { "type": "string", "minLength": 5, "maxLength": 100 }
    },
	"additionalProperties": false,
    "required": [ "emailAuthorized" ]
}

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
}

function getUserTokenIndex(userObj, userToken) {
    if ((userObj.accessTokens != undefined) && (userObj.accessTokens.length > 0)) {
        for (var i in userObj.accessTokens) {
            if (passwordHash.verify(userToken, userObj.accessTokens[i].token) == true) {
                return i;
            }
        }
    }

    return -1;
}

function changeUserStatus(id, enable, callbackSuccess, callbackError) {
    var usersFindPromisse = Users.findById(id);

    usersFindPromisse.then(function(user) {
        if (user != undefined) {
            user.userEnabled = enable;
            user.accessTokens = [];

            user.save(function(error, raw) {
                 if (error) {
                     callbackError(error, 400)
                 }

                 callbackSuccess();
            });
        } else {
            callbackError('not found', 404);
        }
    })
    .then(null, function(error) {
        callbackError(error, 400);
    });
}

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

    getUserTokenIndex: function(userObj, userToken) {
        return getUserTokenIndex(userObj, userToken);
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

    logIn: function(userData, callbackSuccess, callbackError) {
        var queryFilter = { emailAuthorized: userData.email };
        getUser(queryFilter,
            function(userDb) {
                if (userDb.userEnabled == false) {
                    return callbackError('User not enabled', 'Usuário desativado. Contate o administrador do sistema.');
                }

                userDb.externalId = userData.externalId;
                userDb.externalPhoto = userData.photo;

                if (userData.name.length == 0) {
                    userDb.externalName = 'User';
                } else {
                    userDb.externalName = userData.name;
                }

                var newAccessToken = {};
                newAccessToken.token = passwordHash.generate(userData.accessToken);
                newAccessToken.creationDate = new Date();

                userDb.accessTokens.push(newAccessToken);

                console.log(userDb);

                userDb.save(function(error, raw) {
                     if (error) {
                         return callbackError('User on update', 'Erro na atualização dos dados do usuário.');
                     };

                     return callbackSuccess(userDb);
                });
            },
            function(error, status) {
                return callbackError('User not authorized', 'Você não está autorizado para accessar essa aplicação.');
            }
        );
    },

    logOff: function(userId, userToken, allSessions, callbackSuccess, callbackError) {
        var usersFindPromisse = Users.findById(userId);

    	usersFindPromisse.then(function(user) {
            if (user != undefined) {

                if (allSessions == 'true') {
                    user.accessTokens = [];
                } else {
                    var index = getUserTokenIndex(user, userToken);
                    if (index > -1) {
                        user.accessTokens.splice(index, 1);
                    }
                }

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

    disable: function(id, callbackSuccess, callbackError) {
        changeUserStatus(id, false, callbackSuccess, callbackError);
    },

    enable: function(id, callbackSuccess, callbackError) {
        changeUserStatus(id, true, callbackSuccess, callbackError);
    }

}
