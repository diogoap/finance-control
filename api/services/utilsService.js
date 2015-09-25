'use strict';

var sendError = function(res, error, status) {
	if (status) {
		res.status(status).end('Error: ' + error);
	} else {
		res.status(500).end(error);
	};
}

var ensureAuth = function(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
		sendError(res, 'Login inválido', 401);
}

module.exports = {
	sendError: sendError,
	ensureAuth: ensureAuth
}
