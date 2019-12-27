'use strict';

var utils = require('../services/utilsService');
var usersService = require('../services/usersService');

module.exports = function (app, url) {

    app.get('/api/users/:id', utils.ensureAuthAdmin, function (req, res) {
        var user = usersService.getById(req.params.id,
            function (user) {
                res.json(user);
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/users', utils.ensureAuthAdmin, function (req, res) {
        usersService.get(
            function (users) {
                res.json(users);
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/users', utils.ensureAuthAdmin, function (req, res) {
        usersService.create(req.body,
            function (users) {
                res.json('OK');
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.delete('/api/users/:id', utils.ensureAuthAdmin, utils.ensureAffectedUserIsNotAdmin, function (req, res) {
        usersService.delete({ _id: req.params.id },
            function () {
                res.json('OK');
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.lock('/api/users/:id', utils.ensureAuthAdmin, utils.ensureAffectedUserIsNotAdmin, function (req, res) {
        usersService.disable(req.params.id,
            function () {
                res.json('OK');
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.unlock('/api/users/:id', utils.ensureAuthAdmin, utils.ensureAffectedUserIsNotAdmin, function (req, res) {
        usersService.enable(req.params.id,
            function () {
                res.json('OK');
            },
            function (error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

}
