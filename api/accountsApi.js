'use strict';

var utils = require('./services/utilsService');
var accountsService = require('./services/accountsService');

module.exports = function(app, url) {

    app.get('/api/accounts/:id', utils.ensureAuth, function(req, res) {
        var account = accountsService.getById(req.params.id,
            function(account) {
                res.json(account);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.get('/api/accounts', utils.ensureAuth, function(req, res) {
        accountsService.get(
            utils.getUserId(req),
            function(accounts) {
                res.json(accounts);
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.post('/api/accounts', utils.ensureAuth, function(req, res) {
        accountsService.create(
            utils.getUserId(req),
            req.body,
            function(accounts) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.delete('/api/accounts/:id', utils.ensureAuth, function(req, res) {
        accountsService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

    app.patch('/api/accounts/:id', utils.ensureAuth, function(req, res) {
        accountsService.edit(req.params.id, req.body,
            function(accounts) {
                res.json('OK');
            },
            function(error, status) {
                utils.sendError(res, error, status);
            }
        );
    })

}
