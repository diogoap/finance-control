'use strict';

var passwordHash = require('password-hash');
var usersService = require('./usersService');

var sendError = function(res, error, status) {
	if (status) {
		res.status(status).end('Error: ' + error);
	} else {
		res.status(500).end(error);
	};
}

var ensureAuth = function(req, res, next) {
	var userToken = req.headers['authorization'];
	var userId = req.headers['user-id'];

	if ((userToken == undefined || userToken.length == 0) || (userId == undefined || userId.length == 0)) {
		console.log('Token or ID not sent');
		return sendError(res, 'Token/User not provided', 401);
	}

	var user = usersService.getById(userId,
        function(user) {
			if (user.userEnabled == false) {
				console.log('User not enabled');
				return sendError(res, 'User not enabled', 401);
			}

			if (passwordHash.verify(userToken, user.accessToken) == false) {
				console.log('Invalid token');
				return sendError(res, 'Invalid token', 401);
			}

			return next();
        },
        function(error, status) {
			console.log('User not found');
            return sendError(res, 'User not found', 401);
        }
    );
}

var getUserId = function(req) {
	return req.headers['user-id'];
}

module.exports = {
	sendError: sendError,
	ensureAuth: ensureAuth,
	getUserId: getUserId
}
