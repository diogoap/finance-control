'use strict';

var accountsService = require('./services/accountsService');

function sendError(res, error, status) {
    if (status) {
        res.status(status).send(error);
    } else {
        res.status(500).send(error);
    };
}

module.exports = function(app) {

    app.get('/api/accounts/:id', function(req, res) {
        var account = accountsService.getById(req.params.id,
            function(account) {
                res.json(account);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.get('/api/accounts', function(req, res) {
        accountsService.get(
            function(accounts) {
                res.json(accounts);
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.post('/api/accounts', function(req, res) {
        accountsService.create(req.body,
            function(accounts) {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.delete('/api/accounts/:id', function(req, res) {
        accountsService.delete( { _id : req.params.id },
            function() {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

    app.patch('/api/accounts/:id', function(req, res) {
        accountsService.edit(req.params.id, req.body,
            function(accounts) {
                res.json('OK');
            },
            function(error, status) {
                sendError(res, error, status);
            }
        );
    })

}
