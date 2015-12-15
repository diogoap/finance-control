'use strict';

var passwordHash = require('password-hash');
var usersService = require('./usersService');
var usersApiAdminEmail = process.env.USERS_API_ADMIN_EMAIL;

var sendError = function(res, error, status) {
	if (status) {
		res.status(status).end('Error: ' + error);
	} else {
		res.status(500).end(error);
	};
}

var ensureAuth = function(req, res, next) {
	return validateAuth(req, res, next, false);
}

var ensureAuthAdmin = function(req, res, next) {
	return validateAuth(req, res, next, true);
}

var validateAuth = function(req, res, next, needsAdmin) {
	var userToken = req.headers['authorization'];
	var userId = req.headers['user-id'];

	if ((userToken == undefined || userToken.length == 0) || (userId == undefined || userId.length == 0)) {
		console.log('validateAuth ==> Token or ID not sent');
		return sendError(res, 'Token/User not provided', 401);
	}

	var user = usersService.getById(userId,
        function(user) {
			if (user.userEnabled == false) {
				console.log('validateAuth ==> User not enabled');
				return sendError(res, 'User not enabled', 401);
			}

			if ((needsAdmin) && (user.emailAuthorized.length > 0) && (user.emailAuthorized != usersApiAdminEmail)) {
				console.log('validateAuth ==> User not admin');
				return sendError(res, 'User must be admin to perform this operation', 403);
			}

			var validTokenIndex = usersService.getUserTokenIndex(user, userToken);
			if (validTokenIndex == -1) {
				console.log('validateAuth ==> Invalid token');
				return sendError(res, 'Invalid token', 401);
			}

			return next();
        },
        function(error, status) {
			console.log('validateAuth ==> User not found - ' + error);
            return sendError(res, 'User not found', 401);
        }
    );
}

var ensureAffectedUserIsNotAdmin = function(req, res, next) {
	var usersPromisse = usersService.getById(req.params.id,
		function(user) {
			if (user.emailAuthorized == usersApiAdminEmail) {
				return sendError(res, 'Operation not allowed against admin user', 403);
			}

			return next();
        },
        function(error, status) {
			return sendError(res, 'User not found', 404);
        }
    );
}

var ensureObjectUser = function(req, res, next, objService) {
	var obj = objService.getById(req.params.id,
        function(obj) {
            if (obj.user_id == getUserId(req)) {
                return next();
			}

            return sendError(res, 'Invalid object for this user', 401);
        },
        function(error, status) {
            return sendError(res, 'Object not found', 404);
        }
    );
}

var getUserId = function(req) {
	return req.headers['user-id'];
}

var getUserToken = function(req) {
	return req.headers['authorization'];
}

module.exports = {
	sendError: sendError,
	ensureAuth: ensureAuth,
	ensureAuthAdmin: ensureAuthAdmin,
	ensureAffectedUserIsNotAdmin: ensureAffectedUserIsNotAdmin,
	ensureObjectUser: ensureObjectUser,
	getUserId: getUserId,
	getUserToken: getUserToken
}
