'use strict';

var utils = require('./services/utilsService');
var usersService = require('./services/usersService');

function VerifyApiSecret(req, res, usersApiSecret) {
	var userHeader = req.headers['users-api-secret'];

	if ((userHeader == undefined) || (userHeader != usersApiSecret)) {
		utils.sendError(res, 'Special key not provided or invalid', 401);
	}
}

module.exports = function(app, url, usersApiSecret) {

    app.get('/api/users/:id', function(req, res) {
		VerifyApiSecret(req, res, usersApiSecret);

		var user = usersService.getById(req.params.id,
            function(user) {
                res.json(user);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/users', function(req, res) {
		VerifyApiSecret(req, res, usersApiSecret);

		usersService.get(
            function(users) {
                res.json(users);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/users', function(req, res) {
		VerifyApiSecret(req, res, usersApiSecret);

		usersService.create(req.body,
            function(users) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

	app.delete('/api/users/:id', function(req, res) {
		VerifyApiSecret(req, res, usersApiSecret);

        usersService.deletePhisicaly( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

	//REMOVE
    app.patch('/api/users/:id', function(req, res) {
		VerifyApiSecret(req, res, usersApiSecret);

        usersService.edit(req.params.id, req.body,
            function() {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

}
